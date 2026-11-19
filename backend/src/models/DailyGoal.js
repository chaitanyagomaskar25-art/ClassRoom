import mongoose from 'mongoose';

const goalItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['lesson', 'coding', 'revision', 'quiz', 'custom'],
      default: 'lesson'
    },
    targetCount: { type: Number, default: 1, min: 1 },
    completedCount: { type: Number, default: 0, min: 0 },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    xpValue: { type: Number, default: 15 },
    details: {
      subjectCode: { type: String, default: '' },
      subjectName: { type: String, default: '' },
      lessonId: { type: String, default: '' },
      topic: { type: String, default: '' }
    }
  },
  { _id: false }
);

const dailyGoalSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true
    },
    goals: [goalItemSchema],
    totalGoals: { type: Number, default: 3 },
    completedGoals: { type: Number, default: 0 },
    progressPercent: { type: Number, default: 0 },
    allCompleted: { type: Boolean, default: false },
    bonusXpAwarded: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Compound index for 1 daily goal record per student per day
dailyGoalSchema.index({ studentId: 1, date: 1 }, { unique: true });

export default mongoose.model('DailyGoal', dailyGoalSchema);
