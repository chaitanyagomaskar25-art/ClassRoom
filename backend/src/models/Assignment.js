import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    studentName: { type: String, default: '' },
    studentEmail: { type: String, default: '' },
    content: { type: String, default: '' },
    attachmentUrl: { type: String, default: '' },
    notes: { type: String, default: '' },
    submittedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['submitted', 'graded', 'returned'],
      default: 'submitted'
    },
    marksObtained: { type: Number, default: null },
    feedback: { type: String, default: '' },
    gradedAt: { type: Date, default: null },
    gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
  },
  { _id: true, timestamps: true }
);

const assignmentSchema = new mongoose.Schema(
  {
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mentorName: { type: String, default: '' },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '', trim: true },
    subjectCode: { type: String, required: true, trim: true, index: true },
    subjectName: { type: String, required: true, trim: true },
    topic: { type: String, default: '', trim: true },
    instructions: { type: String, default: '', trim: true },
    attachments: [
      {
        title: { type: String, default: '' },
        url: { type: String, default: '' }
      }
    ],
    targetType: {
      type: String,
      enum: ['all', 'semester', 'batch', 'students'],
      default: 'semester'
    },
    targetSemester: { type: Number, min: 1, max: 8, default: 1, index: true },
    targetBatch: { type: String, default: '', trim: true },
    targetStudentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    totalMarks: { type: Number, default: 25, min: 1 },
    passingMarks: { type: Number, default: 10, min: 0 },
    dueDate: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ['active', 'closed', 'draft'],
      default: 'active',
      index: true
    },
    submissions: [submissionSchema]
  },
  { timestamps: true }
);

export default mongoose.model('Assignment', assignmentSchema);
