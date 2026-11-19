import mongoose from 'mongoose';

const learningActivitySchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    activityType: {
      type: String,
      enum: [
        'lesson_completed',
        'lesson_accessed',
        'quiz_completed',
        'note_saved',
        'lesson_bookmarked',
        'marked_difficult',
        'achievement_unlocked',
        'certificate_earned',
        'study_streak'
      ],
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    lessonId: {
      type: String,
      default: '',
      index: true
    },
    subjectCode: {
      type: String,
      default: '',
      index: true
    },
    subjectName: {
      type: String,
      default: ''
    },
    semester: {
      type: Number,
      default: 1
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  { timestamps: true }
);

learningActivitySchema.index({ studentId: 1, createdAt: -1 });

export default mongoose.model('LearningActivity', learningActivitySchema);
