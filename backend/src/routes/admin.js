import express from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import User from '../models/User.js';
import AcademicYear from '../models/AcademicYear.js';
import Semester from '../models/Semester.js';
import Subject from '../models/Subject.js';
import Topic from '../models/Topic.js';
import Subtopic from '../models/Subtopic.js';
import Lesson from '../models/Lesson.js';
import Announcement from '../models/Announcement.js';
import QuizAttempt from '../models/QuizAttempt.js';
import LessonProgress from '../models/LessonProgress.js';
import { authenticate, allowRoles } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import validate from '../utils/validation.js';
import HttpError from '../utils/httpError.js';
import bcrypt from 'bcryptjs';
import cacheService from '../services/cacheService.js';

const router = express.Router();

// Protect all admin endpoints
router.use(authenticate, allowRoles('admin', 'super_admin'));

// -------------------------------------------------------------
// 1. System Overview & Platform Stats
// -------------------------------------------------------------
router.get('/stats', asyncHandler(async (_req, res) => {
  const [
    totalStudents,
    totalMentors,
    totalSeniorMentors,
    totalAdmins,
    totalAcademicYears,
    totalSemesters,
    totalSubjects,
    totalTopics,
    totalLessons,
    totalQuizAttempts,
    passedQuizAttempts
  ] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'mentor' }),
    User.countDocuments({ role: 'senior_mentor' }),
    User.countDocuments({ role: 'admin' }),
    AcademicYear.countDocuments(),
    Semester.countDocuments(),
    Subject.countDocuments(),
    Topic.countDocuments(),
    Lesson.countDocuments(),
    QuizAttempt.countDocuments(),
    QuizAttempt.countDocuments({ $or: [{ passed: true }, { score: { $gte: 70 } }] })
  ]);

  const quizPassRate = totalQuizAttempts > 0
    ? Math.round((passedQuizAttempts / totalQuizAttempts) * 100)
    : 0;

  res.json({
    data: {
      stats: {
        totalStudents,
        totalMentors,
        totalSeniorMentors,
        totalAdmins,
        totalAcademicYears,
        totalSemesters,
        totalSubjects,
        totalTopics,
        totalLessons,
        totalQuizAttempts,
        quizPassRate
      }
    }
  });
}));

// -------------------------------------------------------------
// 2. User Administration (Students, Mentors, Admins)
// -------------------------------------------------------------
router.get('/users', asyncHandler(async (req, res) => {
  const { role, semester, batch, search, page = 1, limit = 20 } = req.query;
  const query = {};

  if (role && role !== 'all') query.role = role;
  if (semester && Number(semester) > 0) query.semester = Number(semester);
  if (batch) query.batch = batch;
  if (search && search.trim()) {
    const s = search.trim();
    query.$or = [
      { name: { $regex: s, $options: 'i' } },
      { email: { $regex: s, $options: 'i' } },
      { enrollmentNumber: { $regex: s, $options: 'i' } }
    ];
  }

  const p = Math.max(1, Number(page));
  const l = Math.max(1, Math.min(100, Number(limit)));
  const skip = (p - 1) * l;

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-passwordHash')
      .populate('mentorId', 'name email')
      .populate('seniorMentorId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(l)
      .lean(),
    User.countDocuments(query)
  ]);

  res.json({
    data: {
      users,
      pagination: {
        total,
        page: p,
        limit: l,
        pages: Math.ceil(total / l)
      }
    }
  });
}));

router.post('/users', asyncHandler(async (req, res) => {
  const { name, email, password, role = 'student', semester = 1, batch, enrollmentNumber } = req.body;
  if (!name || !email || !password) {
    throw new HttpError(400, 'Name, email, and password are required');
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new HttpError(409, 'User with this email already exists');

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role,
    semester: Number(semester) || 1,
    batch: batch || '',
    enrollmentNumber
  });

  res.status(201).json({ data: { user } });
}));

router.put('/users/:userId', asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const updates = { ...req.body };

  if (updates.password) {
    updates.passwordHash = await bcrypt.hash(updates.password, 12);
    delete updates.password;
  }

  const user = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true, runValidators: true }).select('-passwordHash');
  if (!user) throw new HttpError(404, 'User not found');

  res.json({ data: { user } });
}));

router.delete('/users/:userId', asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (String(req.user.id) === String(userId)) {
    throw new HttpError(400, 'Cannot delete your own administrator account');
  }

  const user = await User.findByIdAndDelete(userId);
  if (!user) throw new HttpError(404, 'User not found');

  res.json({ data: { message: 'User deleted successfully' } });
}));

// -------------------------------------------------------------
// 3. Academic Hierarchy: Academic Years CRUD
// -------------------------------------------------------------
router.get('/academic-years', asyncHandler(async (_req, res) => {
  const years = await AcademicYear.find().sort({ startDate: -1 }).lean();
  res.json({ data: { academicYears: years } });
}));

router.post('/academic-years', asyncHandler(async (req, res) => {
  const { yearCode, title, startDate, endDate, isCurrent, status } = req.body;
  if (!yearCode || !title || !startDate || !endDate) {
    throw new HttpError(400, 'yearCode, title, startDate, and endDate are required');
  }

  if (isCurrent) {
    await AcademicYear.updateMany({}, { isCurrent: false });
  }

  const year = await AcademicYear.create({
    yearCode,
    title,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    isCurrent: Boolean(isCurrent),
    status: status || 'active'
  });

  res.status(201).json({ data: { academicYear: year } });
}));

router.put('/academic-years/:id', asyncHandler(async (req, res) => {
  if (req.body.isCurrent) {
    await AcademicYear.updateMany({ _id: { $ne: req.params.id } }, { isCurrent: false });
  }

  const year = await AcademicYear.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
  if (!year) throw new HttpError(404, 'Academic year not found');

  res.json({ data: { academicYear: year } });
}));

router.delete('/academic-years/:id', asyncHandler(async (req, res) => {
  const year = await AcademicYear.findByIdAndDelete(req.params.id);
  if (!year) throw new HttpError(404, 'Academic year not found');
  res.json({ data: { message: 'Academic year deleted successfully' } });
}));

// -------------------------------------------------------------
// 4. Academic Hierarchy: Semesters CRUD
// -------------------------------------------------------------
router.get('/semesters', asyncHandler(async (_req, res) => {
  const semesters = await Semester.find().sort({ order: 1 }).lean();
  res.json({ data: { semesters } });
}));

router.post('/semesters', asyncHandler(async (req, res) => {
  const { number, title, description, order } = req.body;
  const sem = await Semester.create({
    number: Number(number),
    title,
    description: description || '',
    order: Number(order) || Number(number)
  });
  res.status(201).json({ data: { semester: sem } });
}));

router.put('/semesters/:id', asyncHandler(async (req, res) => {
  const sem = await Semester.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
  if (!sem) throw new HttpError(404, 'Semester not found');
  res.json({ data: { semester: sem } });
}));

router.delete('/semesters/:id', asyncHandler(async (req, res) => {
  const sem = await Semester.findByIdAndDelete(req.params.id);
  if (!sem) throw new HttpError(404, 'Semester not found');
  res.json({ data: { message: 'Semester deleted successfully' } });
}));

// -------------------------------------------------------------
// 5. Academic Hierarchy: Subjects CRUD
// -------------------------------------------------------------
router.get('/subjects', asyncHandler(async (req, res) => {
  const { semesterId, search } = req.query;
  const query = {};
  if (semesterId) query.semesterId = semesterId;
  if (search && search.trim()) {
    query.$or = [
      { title: { $regex: search.trim(), $options: 'i' } },
      { code: { $regex: search.trim(), $options: 'i' } }
    ];
  }
  const subjects = await Subject.find(query).populate('semesterId', 'number title').sort({ order: 1 }).lean();
  res.json({ data: { subjects } });
}));

router.post('/subjects', asyncHandler(async (req, res) => {
  const { semesterId, code, title, description, order } = req.body;
  if (!semesterId || !code || !title) {
    throw new HttpError(400, 'semesterId, code, and title are required');
  }
  const subject = await Subject.create({
    semesterId,
    code,
    title,
    description: description || '',
    order: Number(order) || 1
  });
  res.status(201).json({ data: { subject } });
}));

router.put('/subjects/:id', asyncHandler(async (req, res) => {
  const subject = await Subject.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
  if (!subject) throw new HttpError(404, 'Subject not found');
  res.json({ data: { subject } });
}));

router.delete('/subjects/:id', asyncHandler(async (req, res) => {
  const subject = await Subject.findByIdAndDelete(req.params.id);
  if (!subject) throw new HttpError(404, 'Subject not found');
  res.json({ data: { message: 'Subject deleted successfully' } });
}));

// -------------------------------------------------------------
// 6. Academic Hierarchy: Topics CRUD
// -------------------------------------------------------------
router.get('/topics', asyncHandler(async (req, res) => {
  const { subjectId } = req.query;
  const query = {};
  if (subjectId) query.subjectId = subjectId;
  const topics = await Topic.find(query).populate('subjectId', 'code title').sort({ order: 1 }).lean();
  res.json({ data: { topics } });
}));

router.post('/topics', asyncHandler(async (req, res) => {
  const { subjectId, title, description, order } = req.body;
  if (!subjectId || !title) throw new HttpError(400, 'subjectId and title are required');
  const topic = await Topic.create({
    subjectId,
    title,
    description: description || '',
    order: Number(order) || 1
  });
  res.status(201).json({ data: { topic } });
}));

router.put('/topics/:id', asyncHandler(async (req, res) => {
  const topic = await Topic.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
  if (!topic) throw new HttpError(404, 'Topic not found');
  res.json({ data: { topic } });
}));

router.delete('/topics/:id', asyncHandler(async (req, res) => {
  const topic = await Topic.findByIdAndDelete(req.params.id);
  if (!topic) throw new HttpError(404, 'Topic not found');
  res.json({ data: { message: 'Topic deleted successfully' } });
}));

// -------------------------------------------------------------
// 7. Academic Hierarchy: Subtopics CRUD
// -------------------------------------------------------------
router.get('/subtopics', asyncHandler(async (req, res) => {
  const { topicId } = req.query;
  const query = {};
  if (topicId) query.topicId = topicId;
  const subtopics = await Subtopic.find(query).populate('topicId', 'title').sort({ order: 1 }).lean();
  res.json({ data: { subtopics } });
}));

router.post('/subtopics', asyncHandler(async (req, res) => {
  const { topicId, title, description, summary, order, learningObjectives } = req.body;
  if (!topicId || !title) throw new HttpError(400, 'topicId and title are required');
  const subtopic = await Subtopic.create({
    topicId,
    title,
    description: description || '',
    summary: summary || '',
    order: Number(order) || 1,
    learningObjectives: learningObjectives || []
  });
  res.status(201).json({ data: { subtopic } });
}));

router.put('/subtopics/:id', asyncHandler(async (req, res) => {
  const subtopic = await Subtopic.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
  if (!subtopic) throw new HttpError(404, 'Subtopic not found');
  res.json({ data: { subtopic } });
}));

router.delete('/subtopics/:id', asyncHandler(async (req, res) => {
  const subtopic = await Subtopic.findByIdAndDelete(req.params.id);
  if (!subtopic) throw new HttpError(404, 'Subtopic not found');
  res.json({ data: { message: 'Subtopic deleted successfully' } });
}));

// -------------------------------------------------------------
// 8. Academic Hierarchy: Lessons CRUD
// -------------------------------------------------------------
router.get('/lessons', asyncHandler(async (req, res) => {
  const { topicId } = req.query;
  const query = {};
  if (topicId) query.topicId = topicId;
  const lessons = await Lesson.find(query).populate('topicId', 'title subjectId').sort({ order: 1 }).lean();
  res.json({ data: { lessons } });
}));

router.post('/lessons', asyncHandler(async (req, res) => {
  const { topicId, title, summary, content, order, estimatedMinutes, quiz } = req.body;
  if (!topicId || !title || !content) throw new HttpError(400, 'topicId, title, and content are required');
  const lesson = await Lesson.create({
    topicId,
    title,
    summary: summary || '',
    content,
    order: Number(order) || 1,
    estimatedMinutes: Number(estimatedMinutes) || 15,
    quiz: quiz || []
  });
  res.status(201).json({ data: { lesson } });
}));

router.put('/lessons/:id', asyncHandler(async (req, res) => {
  const lesson = await Lesson.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
  if (!lesson) throw new HttpError(404, 'Lesson not found');
  res.json({ data: { lesson } });
}));

router.delete('/lessons/:id', asyncHandler(async (req, res) => {
  const lesson = await Lesson.findByIdAndDelete(req.params.id);
  if (!lesson) throw new HttpError(404, 'Lesson not found');
  res.json({ data: { message: 'Lesson deleted successfully' } });
}));

// -------------------------------------------------------------
// 9. Institutional Announcements CRUD
// -------------------------------------------------------------
router.get('/announcements', asyncHandler(async (_req, res) => {
  const announcements = await Announcement.find().sort({ isPinned: -1, createdAt: -1 }).lean();
  res.json({ data: { announcements } });
}));

router.post('/announcements', asyncHandler(async (req, res) => {
  const { title, content, category, targetRole, semester, isPinned } = req.body;
  if (!title || !content) throw new HttpError(400, 'Title and content are required');
  const announcement = await Announcement.create({
    title,
    content,
    category: category || 'academic',
    targetRole: targetRole || 'all',
    semester: Number(semester) || 0,
    authorId: req.user.id,
    authorName: req.user.name,
    isPinned: Boolean(isPinned)
  });
  res.status(201).json({ data: { announcement } });
}));

router.put('/announcements/:id', asyncHandler(async (req, res) => {
  const announcement = await Announcement.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
  if (!announcement) throw new HttpError(404, 'Announcement not found');
  res.json({ data: { announcement } });
}));

router.delete('/announcements/:id', asyncHandler(async (req, res) => {
  const announcement = await Announcement.findByIdAndDelete(req.params.id);
  if (!announcement) throw new HttpError(404, 'Announcement not found');
  res.json({ data: { message: 'Announcement deleted successfully' } });
}));

// -------------------------------------------------------------
// 10. Institutional Performance Analytics (Item 43)
// -------------------------------------------------------------
router.get('/analytics/institution', asyncHandler(async (req, res) => {
  const { semester: filterSem, batch: filterBatch } = req.query;
  const cacheKey = `admin:institution_analytics:${filterSem || 'all'}:${filterBatch || 'all'}`;

  const analyticsResult = await cacheService.wrap(cacheKey, async () => {
    const studentQuery = { role: 'student' };
    if (filterBatch && filterBatch !== 'all') studentQuery.batch = filterBatch;
    if (filterSem && filterSem !== 'all') studentQuery.semester = Number(filterSem);

    const [students, allAttempts, allProgress] = await Promise.all([
      User.find(studentQuery).select('_id semester batch lastActiveAt createdAt').lean(),
      QuizAttempt.find().select('studentId semester subjectCode topic score percentage passed createdAt').lean(),
      LessonProgress.find({ status: 'completed' }).select('studentId semester subjectCode').lean()
    ]);

    const studentIdSet = new Set(students.map((s) => String(s._id)));
    const relevantAttempts = allAttempts.filter((a) => studentIdSet.has(String(a.studentId)));
    const relevantProgress = allProgress.filter((p) => studentIdSet.has(String(p.studentId)));

    // 1. Semester-wise Performance Breakdown (Sem 1 to 6)
    const semesterBreakdown = [1, 2, 3, 4, 5, 6].map((semNum) => {
      const semStudents = students.filter((s) => s.semester === semNum);
      const semAttempts = relevantAttempts.filter((a) => a.semester === semNum);
      const semProgress = relevantProgress.filter((p) => p.semester === semNum);

      const totalScore = semAttempts.reduce((sum, a) => sum + (a.percentage || a.score || 0), 0);
      const avgScore = semAttempts.length > 0 ? Math.round(totalScore / semAttempts.length) : 0;
      const passedAttempts = semAttempts.filter((a) => a.passed || (a.percentage || a.score || 0) >= 70).length;
      const passRate = semAttempts.length > 0 ? Math.round((passedAttempts / semAttempts.length) * 100) : 0;

      // Approximate progress per student (based on completed lessons)
      const avgCompletedLessons = semStudents.length > 0
        ? Math.round(semProgress.length / semStudents.length)
        : 0;

      return {
        semester: semNum,
        studentCount: semStudents.length,
        averageQuizScore: avgScore,
        quizPassRate: passRate,
        totalAttempts: semAttempts.length,
        averageCompletedLessons: avgCompletedLessons,
        completionRate: Math.min(100, Math.round((avgCompletedLessons / 20) * 100))
      };
    });

    // 2. Common Weak Topics across institution
    const topicStats = {};
    relevantAttempts.forEach((att) => {
      const topic = att.topic || 'General';
      const subCode = att.subjectCode || 'General';
      const pct = att.percentage || att.score || 0;
      const key = `${subCode}:::${topic}`;

      if (!topicStats[key]) {
        topicStats[key] = { subjectCode: subCode, topic, totalPct: 0, count: 0, failCount: 0 };
      }
      topicStats[key].totalPct += pct;
      topicStats[key].count += 1;
      if (pct < 70) topicStats[key].failCount += 1;
    });

    const commonWeakTopics = Object.values(topicStats)
      .filter((t) => t.count >= 2)
      .map((t) => ({
        subjectCode: t.subjectCode,
        topic: t.topic,
        averageScore: Math.round(t.totalPct / t.count),
        totalAttempts: t.count,
        failCount: t.failCount,
        failureRate: Math.round((t.failCount / t.count) * 100)
      }))
      .sort((a, b) => b.failureRate - a.failureRate || a.averageScore - b.averageScore)
      .slice(0, 6);

    // 3. Activity Trends
    const now = new Date();
    let activeLast7Days = 0;
    let activeLast30Days = 0;
    let inactiveStudents = 0;

    students.forEach((s) => {
      const lastActive = s.lastActiveAt ? new Date(s.lastActiveAt) : new Date(s.createdAt || now);
      const diffDays = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));
      if (diffDays <= 7) activeLast7Days += 1;
      if (diffDays <= 30) activeLast30Days += 1;
      if (diffDays > 7) inactiveStudents += 1;
    });

    return {
      totalStudentsCount: students.length,
      activeLast7Days,
      activeLast30Days,
      inactiveStudents,
      semesterBreakdown,
      commonWeakTopics
    };
  }, 120); // Cache for 2 minutes

  res.json({ data: analyticsResult });
}));

export default router;
