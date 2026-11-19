import express from 'express';
import mongoose from 'mongoose';
import CommunityPost from '../models/CommunityPost.js';
import CommunityComment from '../models/CommunityComment.js';
import { authenticate, allowRoles } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import HttpError from '../utils/httpError.js';
import { sendNotification } from '../services/notificationService.js';
import { emitToAll } from '../services/socketService.js';

const router = express.Router();

/**
 * GET /community/posts
 * List posts with category/subject filtering and search
 */
router.get(
  '/posts',
  authenticate,
  asyncHandler(async (req, res) => {
    const { category, subjectCode, search, sort = 'latest' } = req.query;
    const isStaff = ['mentor', 'senior_mentor', 'admin', 'super_admin'].includes(req.user.role);

    const filter = isStaff ? {} : { moderationStatus: { $ne: 'hidden' } };

    if (category && category !== 'all') {
      filter.category = category;
    }
    if (subjectCode && subjectCode !== 'all') {
      filter.subjectCode = subjectCode;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const sortOptions = { isPinned: -1 };
    if (sort === 'top') {
      sortOptions.likesCount = -1;
      sortOptions.createdAt = -1;
    } else {
      sortOptions.createdAt = -1;
    }

    const posts = await CommunityPost.find(filter)
      .sort(sortOptions)
      .limit(50)
      .lean();

    const formatted = posts.map((p) => ({
      ...p,
      hasLiked: (p.likes || []).some((id) => String(id) === String(req.user.id))
    }));

    res.json({ data: { posts: formatted } });
  })
);

/**
 * POST /community/posts
 * Create new discussion post or share a project
 */
router.post(
  '/posts',
  authenticate,
  asyncHandler(async (req, res) => {
    const { title, content, category, subjectCode, subjectName, projectUrl, codeSnippet, tags } = req.body;

    if (!title || !content) {
      throw new HttpError(400, 'Title and content are required');
    }

    const post = await CommunityPost.create({
      authorId: req.user.id,
      authorName: req.user.name,
      authorRole: req.user.role,
      authorAvatar: req.user.avatar || req.user.profilePhoto || '',
      title,
      content,
      category: category || 'general',
      subjectCode: subjectCode || '',
      subjectName: subjectName || '',
      projectUrl: projectUrl || '',
      codeSnippet: codeSnippet || '',
      tags: Array.isArray(tags) ? tags : []
    });

    emitToAll('community:new_post', {
      id: post._id,
      title: post.title,
      authorName: post.authorName,
      category: post.category
    });

    res.status(201).json({ data: { post } });
  })
);

/**
 * GET /community/posts/:id
 * Retrieve single post and its comments
 */
router.get(
  '/posts/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) throw new HttpError(400, 'Invalid post ID');

    const [post, comments] = await Promise.all([
      CommunityPost.findById(id).lean(),
      CommunityComment.find({ postId: id }).sort({ createdAt: 1 }).lean()
    ]);

    if (!post) throw new HttpError(404, 'Post not found');

    const formattedPost = {
      ...post,
      hasLiked: (post.likes || []).some((uid) => String(uid) === String(req.user.id))
    };

    const formattedComments = comments.map((c) => ({
      ...c,
      hasLiked: (c.likes || []).some((uid) => String(uid) === String(req.user.id))
    }));

    res.json({
      data: {
        post: formattedPost,
        comments: formattedComments
      }
    });
  })
);

/**
 * POST /community/posts/:id/like
 * Toggle like on a post
 */
router.post(
  '/posts/:id/like',
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) throw new HttpError(400, 'Invalid post ID');

    const post = await CommunityPost.findById(id);
    if (!post) throw new HttpError(404, 'Post not found');

    const userIdStr = String(req.user.id);
    const existingIndex = post.likes.findIndex((uid) => String(uid) === userIdStr);

    let hasLiked = false;
    if (existingIndex > -1) {
      post.likes.splice(existingIndex, 1);
      post.likesCount = Math.max(0, post.likesCount - 1);
    } else {
      post.likes.push(req.user.id);
      post.likesCount += 1;
      hasLiked = true;

      // Notify post author if liked by someone else
      if (String(post.authorId) !== userIdStr) {
        await sendNotification({
          recipientId: post.authorId,
          title: 'Post Liked',
          message: `${req.user.name} liked your post: "${post.title.slice(0, 40)}..."`,
          type: 'community',
          link: `/community/${post._id}`
        });
      }
    }

    await post.save();
    res.json({ data: { hasLiked, likesCount: post.likesCount } });
  })
);

/**
 * POST /community/posts/:id/comments
 * Add comment to a post
 */
router.post(
  '/posts/:id/comments',
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) throw new HttpError(400, 'Invalid post ID');
    if (!content || !content.trim()) throw new HttpError(400, 'Comment content required');

    const post = await CommunityPost.findById(id);
    if (!post) throw new HttpError(404, 'Post not found');
    if (post.isLocked) throw new HttpError(403, 'This discussion has been locked by a moderator.');

    const comment = await CommunityComment.create({
      postId: id,
      authorId: req.user.id,
      authorName: req.user.name,
      authorRole: req.user.role,
      authorAvatar: req.user.avatar || req.user.profilePhoto || '',
      content: content.trim()
    });

    post.commentsCount += 1;
    await post.save();

    // Notify author
    if (String(post.authorId) !== String(req.user.id)) {
      await sendNotification({
        recipientId: post.authorId,
        title: 'New Reply on Your Post',
        message: `${req.user.name} replied: "${content.slice(0, 50)}..."`,
        type: 'community',
        link: `/community/${post._id}`
      });
    }

    res.status(201).json({ data: { comment } });
  })
);

/**
 * POST /community/posts/:id/report
 * Report inappropriate post
 */
router.post(
  '/posts/:id/report',
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason = 'Inappropriate content' } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) throw new HttpError(400, 'Invalid post ID');

    const post = await CommunityPost.findById(id);
    if (!post) throw new HttpError(404, 'Post not found');

    post.reports.push({
      reporterId: req.user.id,
      reason,
      createdAt: new Date()
    });
    post.isReported = true;
    if (post.reports.length >= 3 && post.moderationStatus === 'approved') {
      post.moderationStatus = 'flagged';
    }
    await post.save();

    res.json({ data: { message: 'Report received. Thank you for keeping our community safe.' } });
  })
);

/**
 * POST /community/posts/:id/moderate
 * Moderator action (Pin, Lock, Hide, Approve)
 */
router.post(
  '/posts/:id/moderate',
  authenticate,
  allowRoles('mentor', 'senior_mentor', 'admin', 'super_admin'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { action } = req.body; // 'pin', 'unpin', 'lock', 'unlock', 'hide', 'approve'
    if (!mongoose.Types.ObjectId.isValid(id)) throw new HttpError(400, 'Invalid post ID');

    const post = await CommunityPost.findById(id);
    if (!post) throw new HttpError(404, 'Post not found');

    if (action === 'pin') post.isPinned = true;
    else if (action === 'unpin') post.isPinned = false;
    else if (action === 'lock') post.isLocked = true;
    else if (action === 'unlock') post.isLocked = false;
    else if (action === 'hide') post.moderationStatus = 'hidden';
    else if (action === 'approve') {
      post.moderationStatus = 'approved';
      post.isReported = false;
    } else {
      throw new HttpError(400, 'Invalid moderation action');
    }

    await post.save();
    res.json({ data: { post } });
  })
);

export default router;
