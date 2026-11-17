const express = require('express');
const Semester = require('../models/Semester');
const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
const Lesson = require('../models/Lesson');
const LessonProgress = require('../models/LessonProgress');
const { authenticate } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/httpError');

const router = express.Router();

router.get('/semesters', authenticate, asyncHandler(async (req, res) => {
  const semesters = await Semester.find().sort({ order: 1 }).lean();
  res.json({ data: { semesters } });
}));

router.get('/semesters/:semesterId/subjects', authenticate, asyncHandler(async (req, res) => {
  const semester = await Semester.findById(req.params.semesterId);
  if (!semester) throw new HttpError(404, 'Semester not found');
  const subjects = await Subject.find({ semesterId: semester.id }).sort({ order: 1 }).lean();
  res.json({ data: { subjects } });
}));

router.get('/subjects/:subjectId/topics', authenticate, asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.subjectId);
  if (!subject) throw new HttpError(404, 'Subject not found');
  const topics = await Topic.find({ subjectId: subject.id }).sort({ order: 1 }).lean();
  res.json({ data: { topics } });
}));

router.get('/topics/:topicId/lessons', authenticate, asyncHandler(async (req, res) => {
  const topic = await Topic.findById(req.params.topicId);
  if (!topic) throw new HttpError(404, 'Topic not found');
  const lessons = await Lesson.find({ topicId: topic.id })
    .sort({ order: 1 })
    .select('title summary order estimatedMinutes topicId')
    .lean();
  let progress = [];
  if (req.user.role === 'student') {
    progress = await LessonProgress.find({
      studentId: req.user.id, lessonId: { $in: lessons.map((lesson) => lesson._id) }
    }).lean();
  }
  const byLesson = new Map(progress.map((item) => [String(item.lessonId), item]));
  res.json({ data: { lessons: lessons.map((lesson) => ({
    ...lesson,
    progress: byLesson.get(String(lesson._id)) || { status: 'not_started', completedAt: null }
  })) } });
}));

router.get('/lessons/:lessonId', authenticate, asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.lessonId).select('-quiz.correctOption');
  if (!lesson) throw new HttpError(404, 'Lesson not found');
  res.json({ data: { lesson } });
}));

router.get('/lessons/:lessonId/quiz', authenticate, asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.lessonId);
  if (!lesson) throw new HttpError(404, 'Lesson not found');
  const questions = lesson.quiz.map((question, index) => ({
    id: `${lesson.id}:${index}`,
    prompt: question.prompt,
    options: question.options
  }));
  res.json({ data: { lessonId: lesson.id, questions } });
}));

module.exports = router;
