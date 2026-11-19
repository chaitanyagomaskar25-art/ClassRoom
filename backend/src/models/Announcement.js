import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['academic', 'exam', 'placement', 'general', 'urgent'],
      default: 'academic'
    },
    targetRole: {
      type: String,
      enum: ['all', 'student', 'mentor', 'senior_mentor'],
      default: 'all'
    },
    semester: { type: Number, default: 0 }, // 0 = all semesters
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    authorName: { type: String, default: 'Administration' },
    isPinned: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

announcementSchema.index({ targetRole: 1, createdAt: -1 });

export default mongoose.model('Announcement', announcementSchema);
