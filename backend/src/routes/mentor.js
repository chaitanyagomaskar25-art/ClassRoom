const express = require('express');
const User = require('../models/User');
const Lesson = require('../models/Lesson');
const LessonProgress = require('../models/LessonProgress');
const QuizAttempt = require('../models/QuizAttempt');
const mongoose = require('mongoose');
const { authenticate, allowRoles } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/httpError');

const router = express.Router();
router.use(authenticate, allowRoles('mentor'));

router.get('/students', asyncHandler(async (req, res) => {
  const students = await User.find({ mentorId: req.user.id, role: 'student' })
    .select('name email enrollmentNumber semester program createdAt')
    .sort({ name: 1 }).lean();
  const [lessonCount, completedByStudent, quizStats] = await Promise.all([
    Lesson.countDocuments(),
    LessonProgress.aggregate([
      { $match: { studentId: { $in: students.map((student) => student._id) }, status: 'completed' } },
      { $group: { _id: '$studentId', completedLessons: { $sum: 1 } } }
    ]),
    QuizAttempt.aggregate([
      { $match: { studentId: { $in: students.map((student) => student._id) } } },
      { $group: { _id: '$studentId', attempts: { $sum: 1 }, average: { $avg: '$score' } } }
    ])
  ]);
  const completedMap = new Map(completedByStudent.map((entry) => [String(entry._id), entry.completedLessons]));
  const quizMap = new Map(quizStats.map((entry) => [String(entry._id), entry]));
  const summaries = students.map((student) => {
    const completedLessons = completedMap.get(String(student._id)) || 0;
    const quizzes = quizMap.get(String(student._id));
    return {
      ...student,
      progress: {
        totalLessons: lessonCount,
        completedLessons,
        completionPercent: lessonCount ? Math.round(completedLessons / lessonCount * 100) : 0
      },
      quizAttempts: quizzes?.attempts || 0,
      averageQuizScore: quizzes ? Math.round(quizzes.average) : null
    };
  });
  res.json({ data: { students: summaries } });
}));

router.get('/students/:studentId', asyncHandler(async (req, res) => {
  const student = await User.findOne({
    _id: req.params.studentId, mentorId: req.user.id, role: 'student'
  }).select('name email enrollmentNumber semester program bio createdAt');
  if (!student) throw new HttpError(404, 'Student not found');
  const [progress, attempts, lessonCount, quizStats] = await Promise.all([
    LessonProgress.find({ studentId: student.id })
      .populate({ path: 'lessonId', select: 'title topicId order' }).sort({ updatedAt: -1 }),
    QuizAttempt.find({ studentId: student.id })
      .populate({ path: 'lessonId', select: 'title topicId' }).sort({ createdAt: -1 }).limit(50),
    Lesson.countDocuments(),
    QuizAttempt.aggregate([
      { $match: { studentId: new mongoose.Types.ObjectId(student.id) } },
      { $group: { _id: null, count: { $sum: 1 }, average: { $avg: '$score' } } }
    ])
  ]);
  const completedLessons = progress.filter((item) => item.status === 'completed').length;
  const quizMetrics = quizStats[0];
  res.json({
    data: {
      student,
      metrics: {
        totalLessons: lessonCount,
        completedLessons,
        completionPercent: lessonCount ? Math.round(completedLessons / lessonCount * 100) : 0,
        quizAttempts: quizMetrics?.count || 0,
        averageQuizScore: quizMetrics ? Math.round(quizMetrics.average) : null
      },
      progress,
      quizAttempts: attempts
    }
  });
}));

module.exports = router;
