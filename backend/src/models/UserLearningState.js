import mongoose from 'mongoose';

const userLearningStateSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    activeSemester: {
      type: Number,
      default: 1
    },
    lastVisitedLesson: {
      lessonId: { type: String, default: '' },
      subjectCode: { type: String, default: '' },
      subjectName: { type: String, default: '' },
      semester: { type: Number, default: 1 },
      unitIndex: { type: Number, default: 0 },
      unitNumber: { type: String, default: 'Unit I' },
      title: { type: String, default: '' },
      visitedAt: { type: Date, default: Date.now }
    },
    currentLesson: {
      lessonId: { type: String, default: '' },
      subjectCode: { type: String, default: '' },
      subjectName: { type: String, default: '' },
      semester: { type: Number, default: 1 },
      unitIndex: { type: Number, default: 0 },
      unitNumber: { type: String, default: 'Unit I' },
      title: { type: String, default: '' },
      updatedAt: { type: Date, default: Date.now }
    },
    lastUnfinishedLesson: {
      lessonId: { type: String, default: '' },
      subjectCode: { type: String, default: '' },
      subjectName: { type: String, default: '' },
      semester: { type: Number, default: 1 },
      unitIndex: { type: Number, default: 0 },
      unitNumber: { type: String, default: 'Unit I' },
      title: { type: String, default: '' }
    },
    streak: {
      currentStreak: { type: Number, default: 1 },
      longestStreak: { type: Number, default: 1 },
      lastActiveDate: { type: String, default: '' }
    },
    achievements: [
      {
        id: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, default: '' },
        icon: { type: String, default: 'Award' },
        category: { type: String, default: 'general' },
        unlockedAt: { type: Date, default: Date.now }
      }
    ],
    certificates: [
      {
        certificateId: { type: String, required: true },
        subjectCode: { type: String, required: true },
        subjectName: { type: String, required: true },
        semester: { type: Number, default: 1 },
        credits: { type: Number, default: 4 },
        grade: { type: String, default: 'A+' },
        issuedAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model('UserLearningState', userLearningStateSchema);
