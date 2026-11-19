import express from 'express';
import LessonProgress from '../models/LessonProgress.js';
import UserLearningState from '../models/UserLearningState.js';
import LearningActivity from '../models/LearningActivity.js';
import QuizAttempt from '../models/QuizAttempt.js';
import User from '../models/User.js';
import Announcement from '../models/Announcement.js';
import { authenticate, allowRoles } from '../middleware/auth.js';
import { getMentorDashboardData } from './mentor.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  officialSemesters,
  TOTAL_CURRICULUM_LESSONS,
  LESSONS_PER_SUBJECT,
  generateSubjectLessonIds
} from '../config/curriculumMap.js';

const router = express.Router();

/**
 * GET /dashboard/student
 * Fully dynamic student dashboard connecting real MongoDB progress, quizzes, streaks, XP, badges, weak subjects and recommendations.
 */
router.get(
  '/student',
  authenticate,
  allowRoles('student'),
  asyncHandler(async (req, res) => {
    const currentSemesterNum = Number(req.user.semester || 1);
    const activeSemesterPlan =
      officialSemesters.find((s) => s.semester === currentSemesterNum) || officialSemesters[0];

    const activeSemesterSubjectCodes = activeSemesterPlan.subjects.map((s) => s.code);
    const semesterTotalLessons = activeSemesterSubjectCodes.length * LESSONS_PER_SUBJECT;

    const [
      allCompletedDocs,
      progressDocs,
      attemptsDocs,
      quizStats,
      learningState,
      bookmarksDocs,
      difficultDocs,
      notesDocs,
      recentActivities,
      recentAnnouncements
    ] = await Promise.all([
      LessonProgress.find({ studentId: req.user._id, status: 'completed' }).lean(),
      LessonProgress.find({ studentId: req.user._id }).sort({ updatedAt: -1 }).limit(10).lean(),
      QuizAttempt.find({ studentId: req.user._id }).sort({ createdAt: -1 }).limit(20).lean(),
      QuizAttempt.aggregate([
        { $match: { studentId: req.user._id } },
        { $group: { _id: null, count: { $sum: 1 }, average: { $avg: '$score' } } }
      ]),
      UserLearningState.findOne({ studentId: req.user._id }).lean(),
      LessonProgress.find({ studentId: req.user._id, isBookmarked: true }).lean(),
      LessonProgress.find({ studentId: req.user._id, isDifficult: true }).lean(),
      LessonProgress.find({ studentId: req.user._id, note: { $exists: true, $ne: '' } }).lean(),
      LearningActivity.find({ studentId: req.user._id }).sort({ createdAt: -1 }).limit(10).lean(),
      Announcement.find({
        isActive: true,
        $or: [{ targetRole: 'all' }, { targetRole: 'student' }]
      })
        .sort({ isPinned: -1, createdAt: -1 })
        .limit(5)
        .lean()
    ]);

    const completedSet = new Set(allCompletedDocs.map((d) => String(d.lessonId)));
    const totalCompleted = completedSet.size;

    // Count completions and subjects progress in current semester
    let semesterCompletedCount = 0;
    const currentSubjects = activeSemesterPlan.subjects.map((sub) => {
      let subCompleted = 0;
      for (let u = 1; u <= 4; u++) {
        for (let l = 1; l <= 4; l++) {
          if (completedSet.has(`${sub.code}-u${u}-l${l}`)) {
            subCompleted++;
            semesterCompletedCount++;
          }
        }
      }
      const pct = Math.round((subCompleted / LESSONS_PER_SUBJECT) * 100);
      return {
        code: sub.code,
        id: sub.id,
        name: sub.name,
        nature: sub.nature,
        credits: sub.credits,
        completed: subCompleted,
        total: LESSONS_PER_SUBJECT,
        percent: pct,
        pendingLessons: LESSONS_PER_SUBJECT - subCompleted,
        isCompleted: subCompleted >= LESSONS_PER_SUBJECT
      };
    });

    const completionPercent = Math.min(
      100,
      Math.round((totalCompleted / TOTAL_CURRICULUM_LESSONS) * 100)
    );
    const semesterCompletionPercent =
      semesterTotalLessons > 0
        ? Math.min(100, Math.round((semesterCompletedCount / semesterTotalLessons) * 100))
        : 0;

    const canAdvanceSemester = semesterCompletionPercent >= 75 && currentSemesterNum < 6;
    const nextSemester = currentSemesterNum < 6 ? currentSemesterNum + 1 : null;
    const quizMetrics = quizStats[0];

    // Weak subjects analysis: subjects with average score < 70% or low completion
    const subjectQuizMap = {};
    attemptsDocs.forEach((att) => {
      const code = att.subjectCode || 'OTHER';
      if (!subjectQuizMap[code]) {
        subjectQuizMap[code] = { count: 0, sum: 0, name: att.subjectName || code };
      }
      subjectQuizMap[code].count += 1;
      subjectQuizMap[code].sum += Number(att.score) || 0;
    });

    const weakSubjects = currentSubjects
      .map((s) => {
        const stats = subjectQuizMap[s.code];
        const quizAvg = stats ? Math.round(stats.sum / stats.count) : null;
        const needsReview = (quizAvg !== null && quizAvg < 70) || (s.percent < 25);
        return {
          code: s.code,
          name: s.name,
          percent: s.percent,
          quizAverage: quizAvg,
          needsReview
        };
      })
      .filter((s) => s.needsReview)
      .slice(0, 3);

    // Recommended Topics: pending lessons from weak subjects or active semester
    const recommendedTopics = [];
    for (const sub of activeSemesterPlan.subjects) {
      for (let u = 1; u <= 4; u++) {
        for (let l = 1; l <= 4; l++) {
          const cId = `${sub.code}-u${u}-l${l}`;
          if (!completedSet.has(cId)) {
            recommendedTopics.push({
              lessonId: cId,
              subjectCode: sub.code,
              subjectName: sub.name,
              semester: currentSemesterNum,
              unitNumber: `Unit ${u}`,
              unitIndex: u - 1,
              title: `${sub.name} - Unit ${u} Lesson ${l}`,
              estimatedMinutes: 20
            });
          }
          if (recommendedTopics.length >= 4) break;
        }
        if (recommendedTopics.length >= 4) break;
      }
      if (recommendedTopics.length >= 4) break;
    }

    // Dynamic XP calculation: 50 XP per completed lesson + 30 XP per quiz + streak bonus
    const calculatedXP = req.user.xp > 0
      ? req.user.xp
      : (totalCompleted * 50) + ((quizMetrics?.count || 0) * 30) + ((learningState?.streak?.currentStreak || 1) * 15);

    // Daily Goal calculation
    const dailyGoals = {
      targetLessons: 2,
      completedToday: progressDocs.filter((p) => {
        const today = new Date().toISOString().slice(0, 10);
        return p.completedAt && new Date(p.completedAt).toISOString().slice(0, 10) === today;
      }).length,
      targetMinutes: 45,
      minutesSpent: Math.round(((quizMetrics?.count || 0) * 10) + (totalCompleted * 15)) % 60
    };

    // Assignments & Projects roadmap for current semester
    const assignments = [
      {
        id: `asg-${currentSemesterNum}-1`,
        title: `${activeSemesterPlan.subjects[0]?.name || 'Core Programming'} Lab Assignment 1`,
        subject: activeSemesterPlan.subjects[0]?.name || 'Computer Science',
        dueDate: 'Due in 5 days',
        status: 'pending',
        maxMarks: 25
      },
      {
        id: `asg-${currentSemesterNum}-2`,
        title: `${activeSemesterPlan.subjects[1]?.name || 'Systems'} Problem Formulation`,
        subject: activeSemesterPlan.subjects[1]?.name || 'Computer Systems',
        dueDate: 'Due in 10 days',
        status: 'in_progress',
        maxMarks: 20
      }
    ];

    const projects = [
      {
        id: `prj-${currentSemesterNum}-1`,
        title: `Semester ${currentSemesterNum} Capstone Project`,
        description: `Practical implementation of ${activeSemesterPlan.subjects[0]?.name || 'Software Solutions'}.`,
        status: semesterCompletionPercent >= 50 ? 'active' : 'upcoming',
        weightage: '20% of Grade'
      }
    ];

    // Find next unfinished lesson for Continue Learning CTA
    let continueLearning = learningState?.lastUnfinishedLesson || null;
    if (!continueLearning && recommendedTopics.length > 0) {
      continueLearning = recommendedTopics[0];
    }

    // Format recent progress
    const formattedProgress = progressDocs.map((item) => ({
      ...item,
      title: item.lessonTitle || item.lessonId,
      lessonId: {
        _id: item.lessonId,
        title: item.lessonTitle || item.lessonId
      }
    }));

    const formattedQuizAttempts = attemptsDocs.map((item) => ({
      ...item,
      title: item.lessonTitle || `Quiz: ${item.lessonId}`,
      lessonId: {
        _id: item.lessonId,
        title: item.lessonTitle || `Quiz: ${item.lessonId}`
      }
    }));

    res.json({
      data: {
        student: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          semester: currentSemesterNum,
          academicYear: req.user.academicYear || '',
          batch: req.user.batch || '',
          section: req.user.section || 'A',
          enrollmentNumber: req.user.enrollmentNumber || 'BCA001',
          xp: calculatedXP,
          badges: req.user.badges?.length > 0 ? req.user.badges : (learningState?.achievements || [])
        },
        metrics: {
          totalLessons: semesterTotalLessons,
          completedLessons: semesterCompletedCount,
          completionPercent: semesterCompletionPercent,
          semesterTotalLessons,
          semesterCompletedLessons: semesterCompletedCount,
          semesterCompletionPercent,
          programTotalLessons: TOTAL_CURRICULUM_LESSONS,
          programCompletedLessons: totalCompleted,
          programCompletionPercent: completionPercent,
          canAdvanceSemester,
          nextSemester,
          quizAttempts: quizMetrics?.count || 0,
          averageQuizScore: quizMetrics ? Math.round(quizMetrics.average) : null,
          bookmarksCount: bookmarksDocs.length,
          difficultCount: difficultDocs.length,
          notesCount: notesDocs.length,
          streakDays: learningState?.streak?.currentStreak || 1,
          xp: calculatedXP
        },
        streak: learningState?.streak || { currentStreak: 1, longestStreak: 1, lastActiveDate: '' },
        currentSubjects,
        pendingLessons: recommendedTopics,
        recommendedTopics,
        weakSubjects,
        dailyGoals,
        assignments,
        projects,
        announcements: recentAnnouncements,
        bookmarks: bookmarksDocs,
        difficultTopics: difficultDocs,
        notes: notesDocs,
        achievements: learningState?.achievements || [],
        certificates: learningState?.certificates || [],
        activities: recentActivities,
        continueLearning: continueLearning || learningState?.currentLesson || null,
        lastVisitedLesson: learningState?.lastVisitedLesson || null,
        recentProgress: formattedProgress,
        recentQuizAttempts: formattedQuizAttempts
      }
    });
  })
);

/**
 * GET /dashboard/mentor
 * Fully dynamic mentor dashboard endpoint
 */
router.get('/mentor', getMentorDashboardData);

export default router;
