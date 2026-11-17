const express = require('express');
const Lesson = require('../models/Lesson');
const LessonProgress = require('../models/LessonProgress');
const QuizAttempt = require('../models/QuizAttempt');
const User = require('../models/User');
const { authenticate, allowRoles } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/student', authenticate, allowRoles('student'), asyncHandler(async (req, res) => {
  const [totalLessons, completedLessons, progress, attempts, quizStats] = await Promise.all([
    Lesson.countDocuments(),
    LessonProgress.countDocuments({ studentId: req.user.id, status: 'completed' }),
    LessonProgress.find({ studentId: req.user.id })
      .populate({ path: 'lessonId', select: 'title topicId' }).sort({ updatedAt: -1 }).limit(5),
    QuizAttempt.find({ studentId: req.user.id }).sort({ createdAt: -1 }).limit(10),
    QuizAttempt.aggregate([
      { $match: { studentId: req.user._id } },
      { $group: { _id: null, count: { $sum: 1 }, average: { $avg: '$score' } } }
    ])
  ]);
  const quizMetrics = quizStats[0];
  res.json({
    data: {
      student: { id: req.user.id, name: req.user.name, semester: req.user.semester },
      metrics: {
        totalLessons,
        completedLessons,
        completionPercent: totalLessons ? Math.round(completedLessons / totalLessons * 100) : 0,
        quizAttempts: quizMetrics?.count || 0,
        averageQuizScore: quizMetrics ? Math.round(quizMetrics.average) : null
      },
      recentProgress: progress,
      recentQuizAttempts: attempts
    }
  });
}));

router.get('/mentor', authenticate, allowRoles('mentor'), asyncHandler(async (req, res) => {
  const [studentCount, studentIds] = await Promise.all([
    User.countDocuments({ mentorId: req.user.id, role: 'student' }),
    User.find({ mentorId: req.user.id, role: 'student' }).distinct('_id')
  ]);
  const [completedLessons, quizCount, recentAttempts] = await Promise.all([
    LessonProgress.countDocuments({ studentId: { $in: studentIds }, status: 'completed' }),
    QuizAttempt.countDocuments({ studentId: { $in: studentIds } }),
    QuizAttempt.find({ studentId: { $in: studentIds } })
      .populate({ path: 'studentId', select: 'name email enrollmentNumber' })
      .populate({ path: 'lessonId', select: 'title' })
      .sort({ createdAt: -1 }).limit(10)
  ]);
  res.json({ data: { metrics: { studentCount, completedLessons, quizAttempts: quizCount }, recentQuizAttempts: recentAttempts } });
}));

module.exports = router;
