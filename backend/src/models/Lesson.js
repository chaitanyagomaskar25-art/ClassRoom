import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  prompt: { type: String, required: true },
  options: { type: [String], required: true, validate: (items) => items.length >= 2 },
  correctOption: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator(value) { return value < this.options.length; },
      message: 'correctOption must refer to an available option'
    }
  },
  explanation: { type: String, default: '' }
}, { _id: false });

const lessonSchema = new mongoose.Schema({
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true, index: true },
  title: { type: String, required: true, trim: true },
  summary: { type: String, default: '' },
  content: { type: String, default: '' },
  order: { type: Number, required: true },
  estimatedMinutes: { type: Number, default: 15, min: 1 },
  quiz: { type: [questionSchema], default: [] }
}, { timestamps: true });

lessonSchema.index({ topicId: 1, order: 1 });
export default mongoose.model('Lesson', lessonSchema);
