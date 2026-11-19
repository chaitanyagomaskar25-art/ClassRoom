import express from 'express';
import Semester from '../models/Semester.js';
import Subject from '../models/Subject.js';
import Topic from '../models/Topic.js';
import Subtopic from '../models/Subtopic.js';
import Lesson from '../models/Lesson.js';
import LessonProgress from '../models/LessonProgress.js';
import Announcement from '../models/Announcement.js';
import { authenticate } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import HttpError from '../utils/httpError.js';
import { officialSemesters, findSubjectByCodeOrId } from '../config/curriculumMap.js';
import cacheService from '../services/cacheService.js';

const router = express.Router();

/**
 * GET /curriculum/overview
 * Returns complete curriculum hierarchy across all 6 semesters with subjects and topic counts.
 */
router.get('/overview', authenticate, asyncHandler(async (_req, res) => {
  const semestersData = await cacheService.wrap('curriculum:overview', async () => {
    const dbSemesters = await Semester.find().sort({ order: 1 }).lean();

    if (dbSemesters.length > 0) {
      return await Promise.all(
        dbSemesters.map(async (sem) => {
          const subjects = await Subject.find({ semesterId: sem._id }).sort({ order: 1 }).lean();
          const subjectsWithTopics = await Promise.all(
            subjects.map(async (sub) => {
              const topicCount = await Topic.countDocuments({ subjectId: sub._id });
              return {
                ...sub,
                id: String(sub._id),
                topicCount: topicCount || 4
              };
            })
          );
          return {
            ...sem,
            id: String(sem._id),
            semester: sem.number,
            subjects: subjectsWithTopics
          };
        })
      );
    }

    return officialSemesters;
  }, 600); // Cache for 10 minutes

  res.json({ data: { semesters: semestersData } });
}));

/**
 * GET /curriculum/announcements
 * Returns active announcements filtered by target role and semester
 */
router.get('/announcements', authenticate, asyncHandler(async (req, res) => {
  const user = req.user;
  const query = {
    isActive: true,
    $or: [
      { targetRole: 'all' },
      { targetRole: user.role }
    ]
  };

  if (user.role === 'student' && user.semester) {
    query.$or.push({ semester: user.semester });
  }

  const announcements = await Announcement.find(query)
    .sort({ isPinned: -1, createdAt: -1 })
    .limit(10)
    .lean();

  res.json({ data: { announcements } });
}));

/**
 * GET /curriculum/semesters
 */
router.get('/semesters', authenticate, asyncHandler(async (_req, res) => {
  const semesters = await Semester.find().sort({ order: 1 }).lean();
  if (semesters.length > 0) {
    return res.json({ data: { semesters } });
  }
  res.json({ data: { semesters: officialSemesters.map((s) => ({ number: s.semester, title: s.title, order: s.semester })) } });
}));

/**
 * GET /curriculum/semesters/:semesterId/subjects
 */
router.get('/semesters/:semesterId/subjects', authenticate, asyncHandler(async (req, res) => {
  const semParam = req.params.semesterId;
  let subjects = [];

  // Check if valid ObjectId or numeric semester
  if (semParam.length === 24) {
    subjects = await Subject.find({ semesterId: semParam }).sort({ order: 1 }).lean();
  }

  if (subjects.length === 0 && !isNaN(Number(semParam))) {
    const matchedSem = officialSemesters.find((s) => s.semester === Number(semParam));
    if (matchedSem) {
      return res.json({ data: { subjects: matchedSem.subjects } });
    }
  }

  res.json({ data: { subjects } });
}));

/**
 * GET /curriculum/subjects/:subjectId/topics
 */
router.get('/subjects/:subjectId/topics', authenticate, asyncHandler(async (req, res) => {
  const subParam = req.params.subjectId;
  let topics = [];

  if (subParam.length === 24) {
    topics = await Topic.find({ subjectId: subParam }).sort({ order: 1 }).lean();
  }

  res.json({ data: { topics } });
}));

/**
 * GET /curriculum/topics/:topicId/lessons
 */
router.get('/topics/:topicId/lessons', authenticate, asyncHandler(async (req, res) => {
  const topicId = req.params.topicId;
  const lessons = await Lesson.find({ topicId })
    .sort({ order: 1 })
    .select('title summary order estimatedMinutes topicId')
    .lean();

  let progress = [];
  if (req.user.role === 'student') {
    progress = await LessonProgress.find({
      studentId: req.user.id,
      lessonId: { $in: lessons.map((lesson) => lesson._id) }
    }).lean();
  }

  const byLesson = new Map(progress.map((item) => [String(item.lessonId), item]));

  res.json({
    data: {
      lessons: lessons.map((lesson) => ({
        ...lesson,
        progress: byLesson.get(String(lesson._id)) || { status: 'not_started', completedAt: null }
      }))
    }
  });
}));

/**
 * GET /curriculum/lessons/:lessonId
 */
router.get('/lessons/:lessonId', authenticate, asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.lessonId).select('-quiz.correctOption');
  if (!lesson) throw new HttpError(404, 'Lesson not found');

  if (req.user?.role === 'student' && req.user?.semester) {
    const studentSem = Number(req.user.semester);
    const topic = await Topic.findById(lesson.topicId).lean();
    if (topic) {
      const subject = await Subject.findById(topic.subjectId).lean();
      if (subject) {
        const semDoc = await Semester.findById(subject.semesterId).lean();
        if (semDoc && semDoc.number !== studentSem) {
          throw new HttpError(403, `This lesson belongs to Semester ${semDoc.number} and is locked for your enrolled semester (Semester ${studentSem}).`);
        }
      }
    }
  }

  res.json({ data: { lesson } });
}));

/**
 * GET /curriculum/lessons/:lessonId/quiz
 */
router.get('/lessons/:lessonId/quiz', authenticate, asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.lessonId);
  if (!lesson) throw new HttpError(404, 'Lesson not found');

  if (req.user?.role === 'student' && req.user?.semester) {
    const studentSem = Number(req.user.semester);
    const topic = await Topic.findById(lesson.topicId).lean();
    if (topic) {
      const subject = await Subject.findById(topic.subjectId).lean();
      if (subject) {
        const semDoc = await Semester.findById(subject.semesterId).lean();
        if (semDoc && semDoc.number !== studentSem) {
          throw new HttpError(403, `This quiz belongs to Semester ${semDoc.number} and is locked for your enrolled semester (Semester ${studentSem}).`);
        }
      }
    }
  }

  const questions = lesson.quiz.map((question, index) => ({
    id: `${lesson.id}:${index}`,
    prompt: question.prompt,
    options: question.options
  }));
  res.json({ data: { lessonId: lesson.id, questions } });
}));

export default router;
