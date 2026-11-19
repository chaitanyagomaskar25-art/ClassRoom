import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null }
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false }
  },
  { _id: false }
);

const mentorReviewSchema = new mongoose.Schema(
  {
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    mentorName: { type: String, default: '' },
    rating: { type: Number, min: 1, max: 5, default: null },
    feedback: { type: String, default: '' },
    approved: { type: Boolean, default: false },
    reviewedAt: { type: Date, default: null }
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    studentName: { type: String, default: '' },
    studentEmail: { type: String, default: '' },
    semester: { type: Number, default: 1, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '', trim: true, maxlength: 3000 },
    category: {
      type: String,
      enum: [
        'Full-Stack Web',
        'Backend System',
        'Database Architecture',
        'Mobile App',
        'AI & Machine Learning',
        'Systems & Networking',
        'Cloud & DevOps',
        'Capstone Research'
      ],
      default: 'Full-Stack Web',
      index: true
    },
    techStack: [{ type: String, trim: true }],
    requirements: [{ type: String, trim: true }],
    milestones: [milestoneSchema],
    tasks: [taskSchema],
    githubUrl: { type: String, default: '', trim: true },
    liveDemoUrl: { type: String, default: '', trim: true },
    documentationUrl: { type: String, default: '', trim: true },
    status: {
      type: String,
      enum: ['planning', 'in_progress', 'submitted', 'completed'],
      default: 'planning',
      index: true
    },
    mentorReview: mentorReviewSchema,
    isPortfolioFeatured: { type: Boolean, default: true, index: true },
    completionPercent: { type: Number, default: 0, min: 0, max: 100 }
  },
  { timestamps: true }
);

export default mongoose.model('Project', projectSchema);
