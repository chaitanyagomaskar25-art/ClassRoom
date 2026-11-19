import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema({
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  order: { type: Number, required: true }
}, { timestamps: true });

topicSchema.index({ subjectId: 1, order: 1 });
export default mongoose.model('Topic', topicSchema);
