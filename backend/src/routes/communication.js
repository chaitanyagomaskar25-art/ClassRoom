import express from 'express';
import mongoose from 'mongoose';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import HttpError from '../utils/httpError.js';

const router = express.Router();

router.use(authenticate);

/**
 * Helper to generate a consistent thread identifier between two users
 */
function getThreadId(id1, id2) {
  return [String(id1), String(id2)].sort().join('_');
}

/**
 * GET /communication/threads
 * List conversation threads for current user
 */
router.get('/threads', asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user.id);

  // Find all direct messages involving current user
  const messages = await Message.find({
    scope: 'direct',
    $or: [{ senderId: userId }, { recipientId: userId }]
  })
    .sort({ createdAt: -1 })
    .lean();

  const threadsMap = new Map();

  for (const msg of messages) {
    const otherId = String(msg.senderId) === String(req.user.id) ? String(msg.recipientId) : String(msg.senderId);
    if (!otherId || otherId === 'undefined') continue;

    if (!threadsMap.has(otherId)) {
      threadsMap.set(otherId, {
        otherUserId: otherId,
        lastMessage: msg,
        unreadCount: 0
      });
    }

    if (String(msg.recipientId) === String(req.user.id) && !msg.isRead) {
      threadsMap.get(otherId).unreadCount++;
    }
  }

  // Populate other user details
  const otherUserIds = Array.from(threadsMap.keys());
  const otherUsers = await User.find({ _id: { $in: otherUserIds } })
    .select('name email role avatar profilePhoto semester program enrollmentNumber')
    .lean();

  const userMap = new Map(otherUsers.map((u) => [String(u._id), u]));

  const threads = Array.from(threadsMap.values()).map((thread) => ({
    ...thread,
    user: userMap.get(thread.otherUserId) || { _id: thread.otherUserId, name: 'User' }
  }));

  res.json({ data: { threads } });
}));

/**
 * GET /communication/messages/:otherUserId
 * Get message history with a specific user
 */
router.get('/messages/:otherUserId', asyncHandler(async (req, res) => {
  const currentUserId = req.user.id;
  const otherUserId = req.params.otherUserId;

  const messages = await Message.find({
    scope: 'direct',
    $or: [
      { senderId: currentUserId, recipientId: otherUserId },
      { senderId: otherUserId, recipientId: currentUserId }
    ]
  })
    .sort({ createdAt: 1 })
    .limit(200)
    .lean();

  // Mark unread messages sent by other user as read
  await Message.updateMany(
    {
      senderId: otherUserId,
      recipientId: currentUserId,
      isRead: false
    },
    {
      $set: { isRead: true, readAt: new Date() }
    }
  );

  const otherUser = await User.findById(otherUserId)
    .select('name email role avatar profilePhoto semester program enrollmentNumber')
    .lean();

  res.json({
    data: {
      otherUser: otherUser || { _id: otherUserId, name: 'User' },
      messages
    }
  });
}));

/**
 * POST /communication/messages
 * Send message (direct or broadcast)
 */
router.post('/messages', asyncHandler(async (req, res) => {
  const {
    recipientId,
    content,
    scope = 'direct',
    subject = '',
    priority = 'normal',
    targetSemester,
    targetBatch,
    subjectCode
  } = req.body;

  if (!content || !content.trim()) {
    throw new HttpError(400, 'Message content cannot be empty');
  }

  let recipient = null;
  let threadId = '';

  if (scope === 'direct') {
    if (!recipientId) {
      throw new HttpError(400, 'recipientId is required for direct messages');
    }
    recipient = await User.findById(recipientId).select('name email').lean();
    if (!recipient) throw new HttpError(404, 'Recipient not found');
    threadId = getThreadId(req.user.id, recipientId);
  }

  const message = await Message.create({
    senderId: req.user.id,
    senderName: req.user.name || 'User',
    senderRole: req.user.role || 'mentor',
    recipientId: recipient ? recipient._id : null,
    recipientName: recipient ? recipient.name : '',
    threadId,
    scope,
    subject: subject || '',
    content: content.trim(),
    priority,
    targetSemester: targetSemester ? Number(targetSemester) : null,
    targetBatch: targetBatch || '',
    subjectCode: subjectCode || '',
    isRead: false
  });

  res.status(201).json({
    data: {
      message,
      status: 'sent'
    }
  });
}));

/**
 * GET /communication/broadcasts
 * Fetch announcements and broadcasts relevant to the user
 */
router.get('/broadcasts', asyncHandler(async (req, res) => {
  const isMentor = ['mentor', 'senior_mentor', 'admin', 'super_admin'].includes(req.user.role);

  let query = { scope: { $in: ['batch', 'semester', 'subject', 'cohort'] } };

  if (!isMentor) {
    const student = await User.findById(req.user.id).lean();
    const sem = student?.semester || 1;
    const batch = student?.batch || '';

    query = {
      scope: { $in: ['batch', 'semester', 'subject', 'cohort'] },
      $or: [
        { targetSemester: sem },
        { targetSemester: null },
        { targetBatch: batch },
        { targetBatch: '' }
      ]
    };
  }

  const broadcasts = await Message.find(query)
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  res.json({ data: { broadcasts } });
}));

/**
 * GET /communication/unread-count
 * Quick badge count of unread messages
 */
router.get('/unread-count', asyncHandler(async (req, res) => {
  const count = await Message.countDocuments({
    recipientId: req.user.id,
    isRead: false
  });

  res.json({ data: { unreadCount: count } });
}));

/**
 * PATCH /communication/messages/:messageId/read
 * Mark message as read
 */
router.patch('/messages/:messageId/read', asyncHandler(async (req, res) => {
  const message = await Message.findOneAndUpdate(
    { _id: req.params.messageId, recipientId: req.user.id },
    { $set: { isRead: true, readAt: new Date() } },
    { new: true }
  );

  if (!message) throw new HttpError(404, 'Message not found');

  res.json({ data: { message } });
}));

export default router;
