import express from 'express';
import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import NotificationPreference from '../models/NotificationPreference.js';
import { authenticate } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import HttpError from '../utils/httpError.js';

const router = express.Router();

/**
 * GET /notifications
 * List user notifications with unread count
 */
router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const { type, isRead } = req.query;
    const filter = { recipientId: req.user.id };

    if (type && type !== 'all') {
      filter.type = type;
    }
    if (isRead !== undefined) {
      filter.isRead = isRead === 'true';
    }

    const [notifications, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).limit(50).lean(),
      Notification.countDocuments({ recipientId: req.user.id, isRead: false })
    ]);

    res.json({
      data: {
        notifications,
        unreadCount
      }
    });
  })
);

/**
 * PUT /notifications/:id/read
 * Mark single notification as read
 */
router.put(
  '/:id/read',
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpError(400, 'Invalid notification ID');
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipientId: req.user.id },
      { $set: { isRead: true, readAt: new Date() } },
      { new: true }
    );

    if (!notification) {
      throw new HttpError(404, 'Notification not found');
    }

    res.json({ data: { notification } });
  })
);

/**
 * PUT /notifications/read-all
 * Mark all user notifications as read
 */
router.put(
  '/read-all',
  authenticate,
  asyncHandler(async (req, res) => {
    const result = await Notification.updateMany(
      { recipientId: req.user.id, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    res.json({
      data: {
        success: true,
        modifiedCount: result.modifiedCount
      }
    });
  })
);

/**
 * DELETE /notifications/:id
 * Remove notification
 */
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpError(400, 'Invalid notification ID');
    }

    await Notification.deleteOne({ _id: id, recipientId: req.user.id });
    res.json({ data: { success: true } });
  })
);

/**
 * GET /notifications/preferences
 */
router.get(
  '/preferences',
  authenticate,
  asyncHandler(async (req, res) => {
    let pref = await NotificationPreference.findOne({ userId: req.user.id }).lean();
    if (!pref) {
      pref = await NotificationPreference.create({ userId: req.user.id });
    }
    res.json({ data: { preferences: pref } });
  })
);

/**
 * PUT /notifications/preferences
 */
router.put(
  '/preferences',
  authenticate,
  asyncHandler(async (req, res) => {
    const { inAppAssignments, inAppQuizzes, inAppDeadlines, inAppAchievements, inAppCommunity, emailDigest } = req.body;

    const pref = await NotificationPreference.findOneAndUpdate(
      { userId: req.user.id },
      {
        $set: {
          inAppAssignments: inAppAssignments !== undefined ? Boolean(inAppAssignments) : true,
          inAppQuizzes: inAppQuizzes !== undefined ? Boolean(inAppQuizzes) : true,
          inAppDeadlines: inAppDeadlines !== undefined ? Boolean(inAppDeadlines) : true,
          inAppAchievements: inAppAchievements !== undefined ? Boolean(inAppAchievements) : true,
          inAppCommunity: inAppCommunity !== undefined ? Boolean(inAppCommunity) : true,
          emailDigest: emailDigest !== undefined ? Boolean(emailDigest) : false
        }
      },
      { upsert: true, new: true }
    );

    res.json({ data: { preferences: pref } });
  })
);

export default router;
