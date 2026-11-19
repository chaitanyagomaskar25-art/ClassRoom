import mongoose from 'mongoose';

const generatedQuestionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ['mcq', 'true_false', 'short_answer', 'code', 'applied'],
      default: 'mcq'
    },
    prompt: { type: String, required: true },
    options: { type: [String], default: [] },
    correctOption: { type: Number, default: null }, // 0-3 for MCQ
    correctAnswer: { type: mongoose.Schema.Types.Mixed, default: null }, // boolean for true_false
    modelAnswer: { type: String, default: '' }, // for short_answer
    rubricCriteria: { type: [String], default: [] }, // for short_answer
    explanation: { type: String, default: '' },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    topicReference: { type: String, default: '' },
    unitTitle: { type: String, default: '' },
    maxScore: { type: Number, default: 1 }
  },
  { _id: false }
);

const generatedQuizSchema = new mongoose.Schema(
  {
    quizId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    semester: { type: Number, required: true },
    subjectCode: { type: String, required: true, index: true },
    subjectName: { type: String, default: '' },
    unitNumber: { type: Number, default: 1 },
    unitTitle: { type: String, default: '' },
    topic: { type: String, default: '' },
    difficulty: { type: String, default: 'MIXED' },
    totalQuestions: { type: Number, default: 10 },
    passingPercentage: { type: Number, default: 70 },
    quizConfig: { type: mongoose.Schema.Types.Mixed, default: {} },
    questions: [generatedQuestionSchema],
    source: { type: String, default: 'ai-synthesis' }
  },
  { timestamps: true }
);

export default mongoose.model('GeneratedQuiz', generatedQuizSchema);
