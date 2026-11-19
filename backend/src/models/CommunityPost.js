import mongoose from 'mongoose';

const communityPostSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    authorName: { type: String, required: true },
    authorRole: { type: String, default: 'student' },
    authorAvatar: { type: String, default: '' },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, required: true, trim: true, maxlength: 5000 },
    category: {
      type: String,
      enum: ['general', 'dsa', 'web_dev', 'database', 'projects', 'curriculum', 'career', 'study_groups'],
      default: 'general',
      index: true
    },
    subjectCode: { type: String, default: '', index: true },
    subjectName: { type: String, default: '' },
    projectUrl: { type: String, default: '' },
    codeSnippet: { type: String, default: '' },
    tags: [{ type: String }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    isPinned: { type: Boolean, default: false, index: true },
    isLocked: { type: Boolean, default: false },
    isReported: { type: Boolean, default: false, index: true },
    reports: [
      {
        reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reason: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    moderationStatus: {
      type: String,
      enum: ['approved', 'flagged', 'hidden'],
      default: 'approved',
      index: true
    }
  },
  { timestamps: true }
);

export default mongoose.model('CommunityPost', communityPostSchema);
