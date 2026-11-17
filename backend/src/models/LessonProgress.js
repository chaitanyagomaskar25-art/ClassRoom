const mongoose = require('mongoose');

const lessonProgressSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true, index: true },
  status: { type: String, enum: ['not_started', 'in_progress', 'completed'], default: 'in_progress' },
  completedAt: { type: Date, default: null },
  lastAccessedAt: { type: Date, default: Date.now }
}, { timestamps: true });

lessonProgressSchema.index({ studentId: 1, lessonId: 1 }, { unique: true });
module.exports = mongoose.model('LessonProgress', lessonProgressSchema);
