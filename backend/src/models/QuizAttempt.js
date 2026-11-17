const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true, index: true },
  answers: { type: [Number], required: true },
  score: { type: Number, required: true, min: 0, max: 100 },
  correctCount: { type: Number, required: true, min: 0 },
  totalQuestions: { type: Number, required: true, min: 1 }
}, { timestamps: true });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
