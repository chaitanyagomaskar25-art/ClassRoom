import mongoose from 'mongoose';

const codingSubmissionSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    studentName: { type: String, default: '' },
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'CodingProblem', required: true, index: true },
    problemTitle: { type: String, required: true },
    category: { type: String, default: 'dsa' },
    difficulty: { type: String, default: 'easy' },
    language: {
      type: String,
      enum: ['javascript', 'python', 'java', 'cpp'],
      default: 'javascript'
    },
    code: { type: String, required: true },
    status: {
      type: String,
      enum: ['accepted', 'wrong_answer', 'time_limit_exceeded', 'runtime_error', 'compilation_error'],
      required: true,
      index: true
    },
    passedTestCasesCount: { type: Number, default: 0 },
    totalTestCasesCount: { type: Number, default: 0 },
    runtimeMs: { type: Number, default: 0 },
    memoryKb: { type: Number, default: 0 },
    errorMessage: { type: String, default: '' },
    earnedXP: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model('CodingSubmission', codingSubmissionSchema);
