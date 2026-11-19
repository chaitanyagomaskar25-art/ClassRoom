import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema(
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
    assessmentId: {
      type: String,
      default: '',
      index: true
    },
    assessmentType: {
      type: String,
      enum: ['topic_quiz', 'unit_quiz', 'unit_assessment', 'practice', 'ai_quiz', 'ai_generated'],
      default: 'unit_quiz',
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
    unitNumber: {
      type: Number,
      default: 1,
      index: true
    },
    unitTitle: {
      type: String,
      default: ''
    },
    lessonTitle: {
      type: String,
      default: ''
    },
    topic: {
      type: String,
      default: '',
      index: true
    },
    quizConfig: {
      difficulty: { type: String, default: 'mixed' },
      questionCount: { type: Number, default: 10 },
      questionTypes: { type: [String], default: [] },
      topic: { type: String, default: '' },
      source: { type: String, default: 'ai-synthesis' },
      title: { type: String, default: '' }
    },
    questions: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    },
    answers: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    questionResults: [
      {
        questionId: { type: String, default: '' },
        questionType: { type: String, default: 'mcq' },
        prompt: { type: String, default: '' },
        studentAnswer: { type: mongoose.Schema.Types.Mixed, default: null },
        correctAnswer: { type: mongoose.Schema.Types.Mixed, default: null },
        isCorrect: { type: Boolean, default: false },
        explanation: { type: String, default: '' },
        score: { type: Number, default: 0 },
        maxScore: { type: Number, default: 1 },
        topic: { type: String, default: '' }
      }
    ],
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    correctCount: {
      type: Number,
      required: true,
      min: 0
    },
    incorrectCount: {
      type: Number,
      default: 0,
      min: 0
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: 1
    },
    passed: {
      type: Boolean,
      default: false
    },
    attemptNumber: {
      type: Number,
      default: 1
    },
    isRetry: {
      type: Boolean,
      default: false
    },
    timeSpentSeconds: {
      type: Number,
      default: 0
    },
    aiFeedback: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    studyRecommendation: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  { timestamps: true }
);

quizAttemptSchema.index({ studentId: 1, lessonId: 1 });
quizAttemptSchema.index({ studentId: 1, assessmentId: 1 });
quizAttemptSchema.index({ studentId: 1, subjectCode: 1 });
quizAttemptSchema.index({ studentId: 1, semester: 1 });
quizAttemptSchema.index({ studentId: 1, unitNumber: 1 });
quizAttemptSchema.index({ studentId: 1, topic: 1 });
quizAttemptSchema.index({ studentId: 1, createdAt: -1 });

export default mongoose.model('QuizAttempt', quizAttemptSchema);
