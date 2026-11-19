import mongoose from 'mongoose';

const notificationPreferenceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    inAppAssignments: { type: Boolean, default: true },
    inAppQuizzes: { type: Boolean, default: true },
    inAppDeadlines: { type: Boolean, default: true },
    inAppAchievements: { type: Boolean, default: true },
    inAppCommunity: { type: Boolean, default: true },
    emailDigest: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model('NotificationPreference', notificationPreferenceSchema);
