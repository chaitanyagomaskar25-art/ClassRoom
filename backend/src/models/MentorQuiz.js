import mongoose from 'mongoose';

const mentorQuizSchema = new mongoose.Schema(
  {
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mentorName: { type: String, default: '' },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '', trim: true },
    semester: { type: Number, min: 1, max: 8, required: true, index: true },
    subjectCode: { type: String, required: true, trim: true, index: true },
    subjectName: { type: String, required: true, trim: true },
    unit: { type: String, default: '', trim: true },
    topic: { type: String, default: '', trim: true },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'mixed'],
      default: 'medium'
    },
    durationMinutes: { type: Number, default: 20, min: 5, max: 180 },
    totalMarks: { type: Number, default: 10, min: 1 },
    passingScore: { type: Number, default: 70, min: 0, max: 100 },
    deadline: { type: Date, default: null },
    isPublished: { type: Boolean, default: false, index: true },
    targetType: {
      type: String,
      enum: ['all', 'semester', 'batch', 'students'],
      default: 'semester'
    },
    targetBatch: { type: String, default: '', trim: true },
    targetStudentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    questions: [
      {
        id: { type: String, required: true },
        text: { type: String, required: true },
        type: {
          type: String,
          enum: ['mcq', 'multiple_answer', 'true_false', 'short_answer', 'code'],
          default: 'mcq'
        },
        options: [{ type: String }],
        correctAnswer: { type: mongoose.Schema.Types.Mixed, required: true },
        explanation: { type: String, default: '' },
        marks: { type: Number, default: 1, min: 1 },
        codeSnippet: { type: String, default: '' }
      }
    ],
    attemptsCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model('MentorQuiz', mentorQuizSchema);
