import mongoose from 'mongoose';

const testCaseSchema = new mongoose.Schema(
  {
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    explanation: { type: String, default: '' },
    isHidden: { type: Boolean, default: false }
  },
  { _id: false }
);

const codingProblemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: {
      type: String,
      enum: ['dsa', 'arrays', 'strings', 'linked_lists', 'stacks_queues', 'trees', 'dynamic_programming', 'algorithms', 'databases'],
      default: 'dsa',
      index: true
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'easy',
      index: true
    },
    description: { type: String, required: true },
    inputFormat: { type: String, default: '' },
    outputFormat: { type: String, default: '' },
    constraints: [{ type: String }],
    sampleTestCases: [testCaseSchema],
    hiddenTestCases: [testCaseSchema],
    starterCode: {
      javascript: { type: String, default: '' },
      python: { type: String, default: '' },
      java: { type: String, default: '' },
      cpp: { type: String, default: '' }
    },
    points: { type: Number, default: 20, min: 5 },
    submissionsCount: { type: Number, default: 0 },
    acceptedCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model('CodingProblem', codingProblemSchema);
