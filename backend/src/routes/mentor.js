import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Lesson from '../models/Lesson.js';
import LessonProgress from '../models/LessonProgress.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Assignment from '../models/Assignment.js';
import LearningActivity from '../models/LearningActivity.js';
import UserLearningState from '../models/UserLearningState.js';
import { authenticate, allowRoles } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import HttpError from '../utils/httpError.js';
import { evaluateStudentRisk } from '../utils/atRiskDetection.js';
import { officialSemesters as semestersList } from '../config/curriculumMap.js';

const router = express.Router();

// Allow mentors, senior mentors, admins, super admins, and scrum leads
router.use(authenticate, allowRoles('mentor', 'senior_mentor', 'admin', 'super_admin', 'scrum'));

/**
 * Helper to build student query based on requester's role
 */
export function buildStudentQuery(user) {
  const query = { role: 'student' };

  if (user.role === 'super_admin' || user.role === 'admin' || user.role === 'scrum') {
    return query;
  }

  if (user.role === 'senior_mentor') {
    const conditions = [];
    if (user.id) conditions.push({ seniorMentorId: user.id });
    if (user.groupId) conditions.push({ groupId: user.groupId });
    return conditions.length > 0 ? { role: 'student', $or: conditions } : { role: 'student', seniorMentorId: user.id };
  }

  // Regular mentor: directly assigned students
  return { role: 'student', mentorId: user.id };
}

/**
 * GET /mentors/dashboard (and /dashboard/mentor)
 * Mentor Overview KPI Statistics
 */
export const getMentorDashboardData = asyncHandler(async (req, res) => {
  const baseStudentQuery = buildStudentQuery(req.user);

  // 1. Fetch assigned students
  const students = await User.find(baseStudentQuery)
    .select('name email enrollmentNumber semester academicYear batch section lastActiveAt createdAt mentorId')
    .lean();

  const studentIds = students.map((s) => s._id);

  // 2. Fetch aggregate stats across assigned students
  const [
    lessonCount,
    completedByStudent,
    quizAggregates,
    recentActivities,
    assignmentsCreated,
    allAttempts
  ] = await Promise.all([
    Lesson.countDocuments(),
    LessonProgress.aggregate([
      { $match: { studentId: { $in: studentIds }, status: 'completed' } },
      { $group: { _id: '$studentId', completedLessons: { $sum: 1 } } }
    ]),
    QuizAttempt.aggregate([
      { $match: { studentId: { $in: studentIds } } },
      {
        $group: {
          _id: '$studentId',
          attempts: { $sum: 1 },
          average: { $avg: '$score' },
          failedCount: { $sum: { $cond: [{ $lt: ['$score', 70] }, 1, 0] } }
        }
      }
    ]),
    LearningActivity.find({ studentId: { $in: studentIds } })
      .sort({ createdAt: -1 })
      .limit(15)
      .lean(),
    Assignment.find(
      req.user.role === 'super_admin' || req.user.role === 'admin'
        ? {}
        : { mentorId: req.user.id }
    ).lean(),
    QuizAttempt.find({ studentId: { $in: studentIds } })
      .select('score studentId createdAt')
      .lean()
  ]);

  const totalCurriculumLessons = lessonCount || 96;
  const completedMap = new Map(completedByStudent.map((e) => [String(e._id), e.completedLessons]));
  const quizMap = new Map(quizAggregates.map((e) => [String(e._id), e]));

  // Check pending assignment submissions needing review
  let pendingSubmissionsCount = 0;
  const submissionsNeedingReview = [];
  const now = new Date();

  assignmentsCreated.forEach((asg) => {
    (asg.submissions || []).forEach((sub) => {
      if (sub.status === 'submitted') {
        pendingSubmissionsCount++;
        submissionsNeedingReview.push({
          submissionId: sub._id,
          assignmentId: asg._id,
          assignmentTitle: asg.title,
          studentId: sub.studentId,
          studentName: sub.studentName,
          submittedAt: sub.submittedAt
        });
      }
    });
  });

  // Evaluate risk & progress for each student
  let totalProgressAccumulator = 0;
  let totalScoreAccumulator = 0;
  let scoredStudentCount = 0;
  const atRiskStudents = [];
  const semesterMap = {};

  for (let s = 1; s <= 6; s++) {
    semesterMap[s] = { semester: s, studentCount: 0, progressTotal: 0, scoreTotal: 0, scoredCount: 0 };
  }

  students.forEach((student) => {
    const sId = String(student._id);
    const completed = completedMap.get(sId) || 0;
    const progressPct = Math.min(100, Math.round((completed / totalCurriculumLessons) * 100));
    totalProgressAccumulator += progressPct;

    const quizData = quizMap.get(sId);
    const avgScore = quizData?.average != null ? Math.round(quizData.average) : null;
    if (avgScore != null) {
      totalScoreAccumulator += avgScore;
      scoredStudentCount++;
    }

    // Days inactive
    const lastActive = student.lastActiveAt || student.createdAt || now;
    const daysInactive = Math.max(0, Math.floor((now.getTime() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24)));

    // Count overdue assignments for this student
    const overdueCount = assignmentsCreated.filter((asg) => {
      if (asg.dueDate && new Date(asg.dueDate) < now) {
        const hasSubmitted = (asg.submissions || []).some((sub) => String(sub.studentId) === sId);
        return !hasSubmitted;
      }
      return false;
    }).length;

    // Run At-Risk Detection
    const risk = evaluateStudentRisk({
      completionPercent: progressPct,
      averageQuizScore: avgScore,
      quizAttemptsCount: quizData?.attempts || 0,
      failedQuizzesCount: quizData?.failedCount || 0,
      daysInactive,
      overdueAssignmentsCount: overdueCount
    });

    if (risk.needsAttention) {
      atRiskStudents.push({
        _id: student._id,
        name: student.name,
        email: student.email,
        enrollmentNumber: student.enrollmentNumber,
        semester: student.semester || 1,
        progressPercent: progressPct,
        averageQuizScore: avgScore,
        daysInactive,
        risk
      });
    }

    // Semester Breakdown
    const sem = student.semester || 1;
    if (semesterMap[sem]) {
      semesterMap[sem].studentCount++;
      semesterMap[sem].progressTotal += progressPct;
      if (avgScore != null) {
        semesterMap[sem].scoreTotal += avgScore;
        semesterMap[sem].scoredCount++;
      }
    }
  });

  // Calculate high / average / low quiz distribution
  let quizHigh = 0;
  let quizAverage = 0;
  let quizLow = 0;

  allAttempts.forEach((att) => {
    if (att.score >= 80) quizHigh++;
    else if (att.score >= 60) quizAverage++;
    else quizLow++;
  });

  const semesterWiseProgress = Object.values(semesterMap).map((item) => ({
    semester: item.semester,
    studentCount: item.studentCount,
    averageProgress: item.studentCount > 0 ? Math.round(item.progressTotal / item.studentCount) : 0,
    averageQuizScore: item.scoredCount > 0 ? Math.round(item.scoreTotal / item.scoredCount) : null
  }));

  // Sort at-risk: Critical first, then by flag count descending
  atRiskStudents.sort((a, b) => {
    if (a.risk.level === 'critical' && b.risk.level !== 'critical') return -1;
    if (b.risk.level === 'critical' && a.risk.level !== 'critical') return 1;
    return b.risk.flagCount - a.risk.flagCount;
  });

  const criticalCount = atRiskStudents.filter((s) => s.risk.level === 'critical').length;
  const moderateCount = atRiskStudents.filter((s) => s.risk.level === 'moderate').length;

  res.json({
    data: {
      metrics: {
        assignedStudentsCount: students.length,
        averageProgressPercent: students.length > 0 ? Math.round(totalProgressAccumulator / students.length) : 0,
        averageQuizScore: scoredStudentCount > 0 ? Math.round(totalScoreAccumulator / scoredStudentCount) : null,
        totalQuizAttempts: allAttempts.length,
        activeAssignmentsCount: assignmentsCreated.length,
        pendingReviewCount: pendingSubmissionsCount,
        criticalRiskCount: criticalCount,
        moderateRiskCount: moderateCount,
        onTrackCount: Math.max(0, students.length - (criticalCount + moderateCount))
      },
      semesterWiseProgress,
      quizDistribution: {
        high: quizHigh,
        average: quizAverage,
        low: quizLow,
        total: allAttempts.length
      },
      submissionsNeedingReview: submissionsNeedingReview.slice(0, 10),
      studentsRequiringAttention: atRiskStudents,
      recentActivity: recentActivities,
      scope: req.user.role === 'super_admin' || req.user.role === 'admin'
        ? 'institutional'
        : (req.user.role === 'senior_mentor' ? 'group_cohort' : 'assigned_mentorship')
    }
  });
});

router.get('/dashboard', getMentorDashboardData);

/**
 * GET /mentors/students
 * Student Monitoring Directory with Full Filtering & Search
 */
router.get('/students', asyncHandler(async (req, res) => {
  const baseQuery = buildStudentQuery(req.user);
  if (req.user.role === 'scrum' || req.query.scope === 'all') {
    delete baseQuery.mentorId;
    delete baseQuery.seniorMentorId;
    delete baseQuery.$or;
  }

  // Apply filters from query params
  const {
    search,
    semester,
    academicYear,
    batch,
    section,
    progressRange,
    quizPerformance,
    riskLevel
  } = req.query;

  if (semester) {
    baseQuery.semester = Number(semester);
  }
  if (academicYear) {
    baseQuery.academicYear = academicYear;
  }
  if (batch) {
    baseQuery.batch = batch;
  }
  if (section) {
    baseQuery.section = section;
  }

  if (search && search.trim()) {
    const s = search.trim();
    baseQuery.$or = [
      { name: { $regex: s, $options: 'i' } },
      { email: { $regex: s, $options: 'i' } },
      { enrollmentNumber: { $regex: s, $options: 'i' } }
    ];
  }

  const [students, lessonCount] = await Promise.all([
    User.find(baseQuery)
      .select('name email enrollmentNumber semester academicYear batch section bio avatar profilePhoto lastActiveAt createdAt mentorId seniorMentorId groupId')
      .sort({ name: 1 })
      .lean(),
    Lesson.countDocuments()
  ]);

  const studentIds = students.map((s) => s._id);

  const [completedByStudent, quizStats, assignments] = await Promise.all([
    LessonProgress.aggregate([
      { $match: { studentId: { $in: studentIds }, status: 'completed' } },
      { $group: { _id: '$studentId', completedLessons: { $sum: 1 } } }
    ]),
    QuizAttempt.aggregate([
      { $match: { studentId: { $in: studentIds } } },
      {
        $group: {
          _id: '$studentId',
          attempts: { $sum: 1 },
          average: { $avg: '$score' },
          failedCount: { $sum: { $cond: [{ $lt: ['$score', 70] }, 1, 0] } }
        }
      }
    ]),
    Assignment.find({}).select('dueDate submissions').lean()
  ]);

  const totalLessons = lessonCount || 96;
  const completedMap = new Map(completedByStudent.map((e) => [String(e._id), e.completedLessons]));
  const quizMap = new Map(quizStats.map((e) => [String(e._id), e]));
  const now = new Date();

  let summaries = students.map((student) => {
    const sId = String(student._id);
    const completed = completedMap.get(sId) || 0;
    const progressPercent = Math.min(100, Math.round((completed / totalLessons) * 100));
    const quizzes = quizMap.get(sId);
    const averageQuizScore = quizzes?.average != null ? Math.round(quizzes.average) : null;

    const lastActive = student.lastActiveAt || student.createdAt || now;
    const daysInactive = Math.max(0, Math.floor((now.getTime() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24)));

    // Calculate overdue assignments
    const overdueCount = assignments.filter((asg) => {
      if (asg.dueDate && new Date(asg.dueDate) < now) {
        const hasSubmitted = (asg.submissions || []).some((sub) => String(sub.studentId) === sId);
        return !hasSubmitted;
      }
      return false;
    }).length;

    const risk = evaluateStudentRisk({
      completionPercent: progressPercent,
      averageQuizScore,
      quizAttemptsCount: quizzes?.attempts || 0,
      failedQuizzesCount: quizzes?.failedCount || 0,
      daysInactive,
      overdueAssignmentsCount: overdueCount
    });

    return {
      ...student,
      progress: {
        totalLessons,
        completedLessons: completed,
        completionPercent
      },
      quizAttempts: quizzes?.attempts || 0,
      averageQuizScore,
      daysInactive,
      overdueAssignmentsCount: overdueCount,
      riskAssessment: risk
    };
  });

  // In-memory filtering for computed fields
  if (progressRange && progressRange !== 'all') {
    summaries = summaries.filter((s) => {
      const p = s.progress.completionPercent;
      if (progressRange === '<25') return p < 25;
      if (progressRange === '25-50') return p >= 25 && p < 50;
      if (progressRange === '50-75') return p >= 50 && p < 75;
      if (progressRange === '>75') return p >= 75;
      return true;
    });
  }

  if (quizPerformance && quizPerformance !== 'all') {
    summaries = summaries.filter((s) => {
      const q = s.averageQuizScore;
      if (q == null) return false;
      if (quizPerformance === 'low') return q < 60;
      if (quizPerformance === 'average') return q >= 60 && q < 80;
      if (quizPerformance === 'high') return q >= 80;
      return true;
    });
  }

  if (riskLevel && riskLevel !== 'all') {
    summaries = summaries.filter((s) => s.riskAssessment.level === riskLevel);
  }

  res.json({
    data: {
      students: summaries,
      totalCount: summaries.length,
      scope: req.user.role === 'super_admin' || req.user.role === 'admin'
        ? 'institutional'
        : (req.user.role === 'senior_mentor' ? 'group_cohort' : 'assigned_mentorship')
    }
  });
}));

/**
 * GET /mentors/team & /mentors/mentors
 * Returns all mentors details, department, and assigned student counts for Scrum / Admin oversight
 */
router.get(['/team', '/mentors'], asyncHandler(async (_req, res) => {
  const mentors = await User.find({ role: { $in: ['mentor', 'senior_mentor', 'scrum'] } })
    .select('name email role program batch section institution createdAt avatar phone skills')
    .lean();

  const students = await User.find({ role: 'student' }).select('mentorId seniorMentorId semester batch').lean();

  const mentorsWithStats = mentors.map((m) => {
    const assignedStudents = students.filter(
      (s) => String(s.mentorId) === String(m._id) || String(s.seniorMentorId) === String(m._id)
    );
    return {
      ...m,
      id: String(m._id),
      assignedCount: assignedStudents.length,
      semestersCovered: [...new Set(assignedStudents.map((s) => s.semester).filter(Boolean))]
    };
  });

  res.json({
    data: {
      mentors: mentorsWithStats,
      totalMentors: mentorsWithStats.length
    }
  });
}));

/**
 * GET /mentors/students/:studentId
 * Individual Student Analytics & Comprehensive Profile View
 */
router.get('/students/:studentId', asyncHandler(async (req, res) => {
  const student = await User.findOne({
    _id: req.params.studentId,
    role: 'student'
  }).select('name email enrollmentNumber semester program academicYear batch section bio avatar profilePhoto skills interests careerGoals lastActiveAt createdAt mentorId seniorMentorId groupId');

  if (!student) throw new HttpError(404, 'Student not found');

  // Authorization check
  const isPrivileged = req.user.role === 'super_admin' || req.user.role === 'admin' || req.user.role === 'scrum';
  const isDirectMentor = req.user.role === 'mentor' && (
    String(student.mentorId) === String(req.user.id) ||
    !student.mentorId // Allow mentor to review unassigned students
  );
  const isSeniorMatch = req.user.role === 'senior_mentor' && (
    String(student.seniorMentorId) === String(req.user.id) ||
    (req.user.groupId && student.groupId && req.user.groupId === student.groupId)
  );

  if (!isPrivileged && !isDirectMentor && !isSeniorMatch) {
    throw new HttpError(403, 'Access denied: You do not have permission to view this student\'s records');
  }

  const studentObjId = new mongoose.Types.ObjectId(student._id);

  const [
    progressDocs,
    quizAttempts,
    lessonCount,
    activities,
    learningState,
    assignments
  ] = await Promise.all([
    LessonProgress.find({ studentId: studentObjId }).sort({ updatedAt: -1 }).lean(),
    QuizAttempt.find({ studentId: studentObjId }).sort({ createdAt: -1 }).limit(100).lean(),
    Lesson.countDocuments(),
    LearningActivity.find({ studentId: studentObjId }).sort({ createdAt: -1 }).limit(25).lean(),
    UserLearningState.findOne({ studentId: studentObjId }).lean(),
    Assignment.find({
      $or: [
        { targetType: 'all' },
        { targetSemester: student.semester || 1 },
        { targetStudentIds: studentObjId }
      ]
    }).lean()
  ]);

  const totalCurriculumLessons = lessonCount || 96;
  const completedLessons = progressDocs.filter((p) => p.status === 'completed');
  const completionPercent = Math.min(100, Math.round((completedLessons.length / totalCurriculumLessons) * 100));

  // Compute Quiz Metrics
  const scores = quizAttempts.map((a) => a.score).filter((s) => typeof s === 'number');
  const averageQuizScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
  const failedQuizzesCount = scores.filter((s) => s < 70).length;

  // Compute Topic Strengths and Weaknesses from Quiz Attempts
  const topicStatsMap = {};
  quizAttempts.forEach((attempt) => {
    const topic = attempt.topic || attempt.unit || 'General';
    if (!topicStatsMap[topic]) {
      topicStatsMap[topic] = { topic, attempts: 0, scoreSum: 0 };
    }
    topicStatsMap[topic].attempts++;
    topicStatsMap[topic].scoreSum += attempt.score;
  });

  const strongTopics = [];
  const weakTopics = [];
  Object.values(topicStatsMap).forEach((item) => {
    const avg = Math.round(item.scoreSum / item.attempts);
    if (avg >= 80) strongTopics.push({ topic: item.topic, averageScore: avg, attempts: item.attempts });
    else if (avg < 60) weakTopics.push({ topic: item.topic, averageScore: avg, attempts: item.attempts });
  });

  // Calculate Subject-Wise Breakdown for Enrolled Semester
  const currentSemester = semestersList.find((s) => s.semester === (student.semester || 1)) || semestersList[0];
  const completedLessonIds = new Set(completedLessons.map((l) => String(l.lessonId)));

  const subjectWisePerformance = currentSemester.subjects.map((sub) => {
    let subCompletedCount = 0;
    for (let u = 1; u <= 4; u++) {
      for (let l = 1; l <= 4; l++) {
        if (completedLessonIds.has(`${sub.code}-u${u}-l${l}`)) {
          subCompletedCount++;
        }
      }
    }

    const subAttempts = quizAttempts.filter((a) => a.subjectCode === sub.code);
    const subScores = subAttempts.map((a) => a.score);
    const subAvg = subScores.length > 0 ? Math.round(subScores.reduce((a, b) => a + b, 0) / subScores.length) : null;

    return {
      code: sub.code,
      name: sub.name,
      nature: sub.nature,
      credits: sub.credits,
      completedLessons: subCompletedCount,
      totalLessons: 16,
      progressPercent: Math.round((subCompletedCount / 16) * 100),
      quizAttemptsCount: subAttempts.length,
      averageQuizScore: subAvg
    };
  });

  // Format Assignments with Student Submissions
  const now = new Date();
  let overdueAssignmentsCount = 0;
  const studentAssignments = assignments.map((asg) => {
    const submission = (asg.submissions || []).find((sub) => String(sub.studentId) === String(student._id));
    const isOverdue = !submission && asg.dueDate && new Date(asg.dueDate) < now;
    if (isOverdue) overdueAssignmentsCount++;

    return {
      _id: asg._id,
      title: asg.title,
      subjectName: asg.subjectName,
      subjectCode: asg.subjectCode,
      dueDate: asg.dueDate,
      totalMarks: asg.totalMarks,
      isOverdue,
      submission: submission || null
    };
  });

  // Days inactive
  const lastActive = student.lastActiveAt || student.createdAt || now;
  const daysInactive = Math.max(0, Math.floor((now.getTime() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24)));

  // Risk Assessment
  const riskAssessment = evaluateStudentRisk({
    completionPercent,
    averageQuizScore,
    quizAttemptsCount: quizAttempts.length,
    failedQuizzesCount,
    daysInactive,
    overdueAssignmentsCount
  });

  res.json({
    data: {
      student,
      riskAssessment,
      progress: {
        totalLessons: totalCurriculumLessons,
        completedLessons: completedLessons.length,
        completionPercent,
        notesCount: progressDocs.filter((p) => p.notes).length,
        bookmarksCount: progressDocs.filter((p) => p.isBookmarked).length
      },
      quizMetrics: {
        totalAttempts: quizAttempts.length,
        averageQuizScore,
        passedCount: quizAttempts.length - failedQuizzesCount,
        failedCount: failedQuizzesCount,
        recentAttempts: quizAttempts.slice(0, 10)
      },
      strengthsAndWeaknesses: {
        strongTopics,
        weakTopics
      },
      subjectWisePerformance,
      assignments: studentAssignments,
      recentActivities: activities,
      streak: learningState?.streak || { currentStreak: 1, longestStreak: 1 },
      certificates: learningState?.certificates || []
    }
  });
}));

export default router;
