import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    senderName: { type: String, default: '' },
    senderRole: { type: String, default: 'mentor' },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    recipientName: { type: String, default: '' },
    threadId: { type: String, default: '', index: true },
    scope: {
      type: String,
      enum: ['direct', 'batch', 'semester', 'subject', 'cohort'],
      default: 'direct',
      index: true
    },
    targetSemester: { type: Number, default: null },
    targetBatch: { type: String, default: '' },
    subjectCode: { type: String, default: '' },
    subject: { type: String, default: '', trim: true },
    content: { type: String, required: true, trim: true, maxlength: 5000 },
    priority: {
      type: String,
      enum: ['normal', 'important', 'urgent'],
      default: 'normal'
    },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null }
  },
  { timestamps: true }
);

export default mongoose.model('Message', messageSchema);
