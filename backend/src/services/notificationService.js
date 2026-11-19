import Notification from '../models/Notification.js';
import NotificationPreference from '../models/NotificationPreference.js';
import { emitToUser } from './socketService.js';

/**
 * Creates and delivers in-app notifications with real-time socket push
 */
export async function sendNotification({
  recipientId,
  title,
  message,
  type = 'general',
  link = '',
  metadata = {}
}) {
  if (!recipientId || !title || !message) return null;

  // Check user preference
  const preference = await NotificationPreference.findOne({ userId: recipientId }).lean();
  if (preference) {
    if (type === 'assignment' && preference.inAppAssignments === false) return null;
    if (type === 'quiz' && preference.inAppQuizzes === false) return null;
    if (type === 'deadline' && preference.inAppDeadlines === false) return null;
    if (type === 'achievement' && preference.inAppAchievements === false) return null;
    if (type === 'community' && preference.inAppCommunity === false) return null;
  }

  const notification = await Notification.create({
    recipientId,
    title,
    message,
    type,
    link,
    metadata
  });

  // Real-time socket delivery
  emitToUser(recipientId, 'notification:new', notification);

  return notification;
}
