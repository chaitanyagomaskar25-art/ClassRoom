import mongoose from 'mongoose';

const lessonProgressSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    lessonId: {
      type: String,
      required: true,
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
      default: 1,
      index: true
    },
    unitIndex: {
      type: Number,
      default: 0
    },
    unitNumber: {
      type: String,
      default: 'Unit I'
    },
    lessonTitle: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'in_progress',
      index: true
    },
    quizScore: {
      type: Number,
      default: null
    },
    quizAttempts: {
      type: Number,
      default: 0
    },
    completedAt: {
      type: Date,
      default: null
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now
    },
    isBookmarked: {
      type: Boolean,
      default: false,
      index: true
    },
    isDifficult: {
      type: Boolean,
      default: false,
      index: true
    },
    note: {
      type: String,
      default: ''
    },
    notesUpdatedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

lessonProgressSchema.index({ studentId: 1, lessonId: 1 }, { unique: true });
lessonProgressSchema.index({ studentId: 1, subjectCode: 1, status: 1 });
lessonProgressSchema.index({ studentId: 1, semester: 1, status: 1 });
lessonProgressSchema.index({ studentId: 1, isBookmarked: 1 });
lessonProgressSchema.index({ studentId: 1, isDifficult: 1 });

export default mongoose.model('LessonProgress', lessonProgressSchema);
