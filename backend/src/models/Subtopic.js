import mongoose from 'mongoose';

const subtopicSchema = new mongoose.Schema(
  {
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    summary: { type: String, default: '', trim: true },
    order: { type: Number, required: true, default: 1 },
    learningObjectives: [{ type: String, trim: true }],
    estimatedMinutes: { type: Number, default: 30 }
  },
  { timestamps: true }
);

subtopicSchema.index({ topicId: 1, order: 1 });

export default mongoose.model('Subtopic', subtopicSchema);
