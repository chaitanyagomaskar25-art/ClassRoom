import mongoose from 'mongoose';

const studyTaskSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    taskType: {
      type: String,
      enum: ['lesson', 'revision', 'quiz', 'milestone'],
      default: 'lesson'
    },
    lessonId: { type: String, default: '' },
    title: { type: String, required: true },
    estimatedMinutes: { type: Number, default: 30 },
    unitNumber: { type: String, default: 'Unit I' },
    unitIndex: { type: Number, default: 0 },
    subjectCode: { type: String, default: '' },
    subjectName: { type: String, default: '' },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    rescheduled: { type: Boolean, default: false },
    rescheduledFrom: { type: String, default: null }
  },
  { _id: false }
);

const weeklyGoalSchema = new mongoose.Schema(
  {
    weekNumber: { type: Number, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    targetLessons: { type: Number, default: 0 },
    completedLessons: { type: Number, default: 0 },
    targetMinutes: { type: Number, default: 0 },
    completedMinutes: { type: Number, default: 0 },
    revisionSessions: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['on_track', 'needs_attention', 'completed'],
      default: 'on_track'
    }
  },
  { _id: false }
);

const reminderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ['pending_lesson', 'upcoming_revision', 'weekly_goal', 'overdue'],
      default: 'pending_lesson'
    },
    message: { type: String, required: true },
    date: { type: String, required: true },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    read: { type: Boolean, default: false }
  },
  { _id: false }
);

const studyPlanSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    subjectCode: {
      type: String,
      required: true,
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
    targetDate: {
      type: Date,
      required: true
    },
    dailyMinutes: {
      type: Number,
      default: 60,
      min: 15,
      max: 480
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    schedule: [studyTaskSchema],
    weeklyGoals: [weeklyGoalSchema],
    reminders: [reminderSchema]
  },
  { timestamps: true }
);

studyPlanSchema.index({ studentId: 1, subjectCode: 1 }, { unique: true });

export default mongoose.model('StudyPlan', studyPlanSchema);
