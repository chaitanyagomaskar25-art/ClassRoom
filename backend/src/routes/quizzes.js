const express = require('express');
const { z } = require('zod');
const Lesson = require('../models/Lesson');
const QuizAttempt = require('../models/QuizAttempt');
const { authenticate, allowRoles } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../utils/validation');
const HttpError = require('../utils/httpError');
const gradeQuiz = require('../utils/quizScoring');

const router = express.Router();
const attemptSchema = z.object({
  answers: z.array(z.number().int().nonnegative()).min(1).max(100)
});

async function submitAttempt(lessonId, answers, studentId, res) {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) throw new HttpError(404, 'Lesson not found');
    if (!lesson.quiz.length) throw new HttpError(400, 'This lesson has no quiz');
    if (answers.length !== lesson.quiz.length) {
      throw new HttpError(400, 'Submit exactly one answer for each question');
    }
    lesson.quiz.forEach((question, index) => {
      if (answers[index] >= question.options.length) {
        throw new HttpError(400, `Answer ${index + 1} is not a valid option`);
      }
    });
    const { correctCount, score } = gradeQuiz(lesson.quiz, answers);
    const attempt = await QuizAttempt.create({
      studentId,
      lessonId: lesson.id,
      answers,
      score,
      correctCount,
      totalQuestions: lesson.quiz.length
    });
    res.status(201).json({
      data: {
        attempt,
        results: lesson.quiz.map((question, index) => ({
          questionIndex: index,
          correct: question.correctOption === answers[index],
          ...(question.explanation ? { explanation: question.explanation } : {})
        }))
      }
    });
}

router.get('/', authenticate, asyncHandler(async (_req, res) => {
  const lessons = await Lesson.find({ 'quiz.0': { $exists: true } })
    .select('title summary topicId quiz')
    .populate({
      path: 'topicId',
      select: 'title subjectId',
      populate: {
        path: 'subjectId',
        select: 'title semesterId',
        populate: { path: 'semesterId', select: 'number title' }
      }
    })
    .sort({ title: 1 })
    .lean();
  const quizzes = lessons.map((lesson) => {
    const topic = lesson.topicId;
    const subject = topic?.subjectId;
    const semester = subject?.semesterId;
    return {
      id: String(lesson._id),
      lessonId: String(lesson._id),
      title: lesson.title,
      summary: lesson.summary,
      questionCount: lesson.quiz.length,
      topic: topic ? { id: String(topic._id), title: topic.title } : null,
      subject: subject ? { id: String(subject._id), title: subject.title } : null,
      semester: semester ? { id: String(semester._id), number: semester.number, title: semester.title } : null
    };
  });
  res.json({ data: { quizzes } });
}));

router.post('/lessons/:lessonId/attempts', authenticate, allowRoles('student'),
  validate(attemptSchema), asyncHandler(async (req, res) => {
    await submitAttempt(req.params.lessonId, req.body.answers, req.user.id, res);
  }));

router.post('/:quizId/submit', authenticate, allowRoles('student'),
  validate(attemptSchema), asyncHandler(async (req, res) => {
    await submitAttempt(req.params.quizId, req.body.answers, req.user.id, res);
  }));

router.get('/me', authenticate, allowRoles('student'), asyncHandler(async (req, res) => {
  const attempts = await QuizAttempt.find({ studentId: req.user.id })
    .populate({ path: 'lessonId', select: 'title topicId' })
    .sort({ createdAt: -1 });
  res.json({ data: { attempts } });
}));

module.exports = router;
