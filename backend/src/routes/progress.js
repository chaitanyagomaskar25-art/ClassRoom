import express from 'express';
import { z } from 'zod';
import LessonProgress from '../models/LessonProgress.js';
import UserLearningState from '../models/UserLearningState.js';
import LearningActivity from '../models/LearningActivity.js';
import QuizAttempt from '../models/QuizAttempt.js';
import User from '../models/User.js';
import { authenticate, allowRoles, authorizeStudentAccess } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import validate from '../utils/validation.js';
import HttpError from '../utils/httpError.js';
import { awardXP, checkAndUnlockBadges } from '../services/gamificationService.js';
import {
  officialSemesters,
  allCurriculumSubjects,
  TOTAL_CURRICULUM_LESSONS,
  LESSONS_PER_SUBJECT,
  LESSONS_PER_UNIT,
  UNITS_PER_SUBJECT,
  findSubjectByCodeOrId,
  generateSubjectLessonIds
} from '../config/curriculumMap.js';

const router = express.Router();

/**
 * Standard Available Achievements Catalog
 */
const ACHIEVEMENTS_CATALOG = [
  { id: 'first_step', title: 'First Step', description: 'Completed your very first official curriculum lesson.', icon: 'Zap', category: 'milestone' },
  { id: 'unit_master', title: 'Unit Master', description: 'Mastered all 4 topics in a curriculum unit.', icon: 'Award', category: 'mastery' },
  { id: 'subject_conqueror', title: 'Subject Conqueror', description: 'Completed an entire 16-lesson university course.', icon: 'Trophy', category: 'mastery' },
  { id: 'scholar_notes', title: 'Scholar Note-Taker', description: 'Created and saved personal revision notes.', icon: 'FileText', category: 'study' },
  { id: 'bookmark_pro', title: 'Strategic Learner', description: 'Bookmarked essential lessons for quick study access.', icon: 'Bookmark', category: 'study' },
  { id: 'revision_warrior', title: 'Revision Warrior', description: 'Flagged and reviewed challenging topics.', icon: 'RefreshCw', category: 'revision' },
  { id: 'quiz_ace', title: 'Knowledge Champion', description: 'Scored 80% or higher on an assessment quiz.', icon: 'CheckCircle2', category: 'assessment' },
  { id: 'streak_3', title: 'Consistent Learner', description: 'Maintained a 3-day continuous learning streak.', icon: 'Flame', category: 'streak' },
  { id: 'streak_7', title: 'Unstoppable Momentum', description: 'Achieved a 7-day learning streak.', icon: 'Sparkles', category: 'streak' }
];

/**
 * Helper to update user study streak
 */
export async function updateUserStreak(studentId) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const state = await UserLearningState.findOne({ studentId });
  if (!state) {
    const newState = await UserLearningState.create({
      studentId,
      streak: { currentStreak: 1, longestStreak: 1, lastActiveDate: todayStr }
    });
    return newState.streak;
  }

  const streak = state.streak || { currentStreak: 0, longestStreak: 0, lastActiveDate: '' };
  const lastDate = streak.lastActiveDate;

  if (lastDate === todayStr) {
    // Already counted today
    return streak;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  let newCurrent = 1;
  if (lastDate === yesterdayStr) {
    newCurrent = (streak.currentStreak || 0) + 1;
  }

  const newLongest = Math.max(streak.longestStreak || 0, newCurrent);

  streak.currentStreak = newCurrent;
  streak.longestStreak = newLongest;
  streak.lastActiveDate = todayStr;

  state.streak = streak;
  await state.save();

  // Check streak achievements
  if (newCurrent >= 3) {
    await checkAndAwardAchievement(studentId, 'streak_3');
  }
  if (newCurrent >= 7) {
    await checkAndAwardAchievement(studentId, 'streak_7');
  }

  return streak;
}

/**
 * Helper to log a learning activity
 */
export async function logLearningActivity(studentId, {
  activityType,
  title,
  description = '',
  lessonId = '',
  subjectCode = '',
  subjectName = '',
  semester = 1,
  metadata = {}
}) {
  try {
    return await LearningActivity.create({
      studentId,
      activityType,
      title,
      description,
      lessonId,
      subjectCode,
      subjectName,
      semester,
      metadata
    });
  } catch (err) {
    console.error('Failed to log learning activity:', err);
    return null;
  }
}

/**
 * Helper to check and unlock achievements & issue certificates
 */
export async function checkAndAwardAchievement(studentId, achievementId) {
  const catalogItem = ACHIEVEMENTS_CATALOG.find((a) => a.id === achievementId);
  if (!catalogItem) return false;

  const state = await UserLearningState.findOne({ studentId });
  if (!state) return false;

  const alreadyUnlocked = (state.achievements || []).some((a) => a.id === achievementId);
  if (alreadyUnlocked) return false;

  const newAch = {
    id: catalogItem.id,
    title: catalogItem.title,
    description: catalogItem.description,
    icon: catalogItem.icon,
    category: catalogItem.category,
    unlockedAt: new Date()
  };

  state.achievements.push(newAch);
  await state.save();

  await logLearningActivity(studentId, {
    activityType: 'achievement_unlocked',
    title: `Earned Achievement: ${catalogItem.title}`,
    description: catalogItem.description,
    metadata: { achievementId: catalogItem.id }
  });

  return true;
}

/**
 * Check if a subject has reached 100% and issue official certificate
 */
async function checkSubjectCompletionCertificate(studentId, subjectCode, subjectName, semester = 1) {
  if (!subjectCode) return null;
  const subLessonIds = generateSubjectLessonIds(subjectCode);
  const completedCount = await LessonProgress.countDocuments({
    studentId,
    lessonId: { $in: subLessonIds },
    status: 'completed'
  });

  if (completedCount >= LESSONS_PER_SUBJECT) {
    const state = await UserLearningState.findOne({ studentId });
    if (!state) return null;

    const existingCert = (state.certificates || []).find((c) => c.subjectCode === subjectCode);
    if (!existingCert) {
      const certId = `EU-BCA-2024-${subjectCode.replace(/[^A-Za-z0-9]/g, '')}-${Math.floor(10000 + Math.random() * 90000)}`;
      const cert = {
        certificateId: certId,
        subjectCode,
        subjectName: subjectName || subjectCode,
        semester,
        credits: 4,
        grade: 'A+',
        issuedAt: new Date()
      };
      state.certificates.push(cert);
      await state.save();

      await checkAndAwardAchievement(studentId, 'subject_conqueror');

      await logLearningActivity(studentId, {
        activityType: 'certificate_earned',
        title: `Official Subject Certificate Earned: ${subjectName || subjectCode}`,
        description: `Verified completion of all 16 curriculum topics for ${subjectName || subjectCode}.`,
        subjectCode,
        subjectName,
        semester,
        metadata: { certificateId: certId }
      });

      return cert;
    }
  }
  return null;
}

/**
 * Helper to calculate all progress analytics for a user
 */
export async function computeUserProgressAnalytics(userId, userSemesterNum = 1) {
  const [completedDocs, learningState, quizAttempts, quizAgg] = await Promise.all([
    LessonProgress.find({ studentId: userId, status: 'completed' }).lean(),
    UserLearningState.findOne({ studentId: userId }).lean(),
    QuizAttempt.find({ studentId: userId }).sort({ createdAt: -1 }).limit(10).lean(),
    QuizAttempt.aggregate([
      { $match: { studentId: userId } },
      { $group: { _id: null, count: { $sum: 1 }, average: { $avg: '$score' } } }
    ])
  ]);

  const completedSet = new Set(completedDocs.map((d) => String(d.lessonId)));
  const totalCompleted = completedSet.size;
  const overallPercent = Math.min(100, Math.round((totalCompleted / TOTAL_CURRICULUM_LESSONS) * 100));

  // Subject-wise and Unit-wise calculations
  const subjectProgressMap = {};
  for (const sub of allCurriculumSubjects) {
    const subLessonIds = generateSubjectLessonIds(sub.code);
    let subCompletedCount = 0;
    const unitsMap = {};

    for (let u = 1; u <= UNITS_PER_SUBJECT; u++) {
      let unitCompletedCount = 0;
      for (let l = 1; l <= LESSONS_PER_UNIT; l++) {
        const lId = `${sub.code}-u${u}-l${l}`;
        if (completedSet.has(lId)) {
          subCompletedCount++;
          unitCompletedCount++;
        }
      }
      unitsMap[u - 1] = {
        unitNumber: `Unit ${u}`,
        completed: unitCompletedCount,
        total: LESSONS_PER_UNIT,
        percent: Math.round((unitCompletedCount / LESSONS_PER_UNIT) * 100)
      };
    }

    subjectProgressMap[sub.code] = {
      subjectCode: sub.code,
      id: sub.id,
      name: sub.name,
      semester: sub.semester,
      completed: subCompletedCount,
      total: LESSONS_PER_SUBJECT,
      percent: Math.round((subCompletedCount / LESSONS_PER_SUBJECT) * 100),
      units: unitsMap
    };
  }

  // Semester-wise calculations
  const semesterProgressMap = {};
  let currentSemesterTotal = 0;
  let currentSemesterCompleted = 0;

  for (const sem of officialSemesters) {
    const semSubCodes = sem.subjects.map((s) => s.code);
    const semTotal = semSubCodes.length * LESSONS_PER_SUBJECT;
    let semCompleted = 0;

    for (const code of semSubCodes) {
      semCompleted += subjectProgressMap[code]?.completed || 0;
    }

    const semPercent = semTotal > 0 ? Math.round((semCompleted / semTotal) * 100) : 0;
    const canAdvance = semPercent >= 75 && sem.semester < 6;

    semesterProgressMap[sem.semester] = {
      semester: sem.semester,
      title: sem.title,
      totalLessons: semTotal,
      completedLessons: semCompleted,
      percent: semPercent,
      canAdvance
    };

    if (sem.semester === userSemesterNum) {
      currentSemesterTotal = semTotal;
      currentSemesterCompleted = semCompleted;
    }
  }

  // Determine the next recommended unfinished lesson for Continue Learning
  let nextUnfinished = null;
  const activeSemesterPlan = officialSemesters.find((s) => s.semester === userSemesterNum) || officialSemesters[0];
  for (const sub of activeSemesterPlan.subjects) {
    for (let u = 1; u <= 4; u++) {
      for (let l = 1; l <= 4; l++) {
        const candidateId = `${sub.code}-u${u}-l${l}`;
        if (!completedSet.has(candidateId)) {
          nextUnfinished = {
            lessonId: candidateId,
            subjectCode: sub.code,
            subjectId: sub.id,
            subjectName: sub.name,
            semester: activeSemesterPlan.semester,
            unitIndex: u - 1,
            unitNumber: `Unit ${u}`,
            title: `${sub.name} - Unit ${u} Lesson ${l}`
          };
          break;
        }
      }
      if (nextUnfinished) break;
    }
    if (nextUnfinished) break;
  }

  // If all completed in current semester, search other semesters
  if (!nextUnfinished) {
    for (const sem of officialSemesters) {
      for (const sub of sem.subjects) {
        for (let u = 1; u <= 4; u++) {
          for (let l = 1; l <= 4; l++) {
            const candidateId = `${sub.code}-u${u}-l${l}`;
            if (!completedSet.has(candidateId)) {
              nextUnfinished = {
                lessonId: candidateId,
                subjectCode: sub.code,
                subjectId: sub.id,
                subjectName: sub.name,
                semester: sem.semester,
                unitIndex: u - 1,
                unitNumber: `Unit ${u}`,
                title: `${sub.name} - Unit ${u} Lesson ${l}`
              };
              break;
            }
          }
          if (nextUnfinished) break;
        }
        if (nextUnfinished) break;
      }
      if (nextUnfinished) break;
    }
  }

  const quizMetrics = quizAgg[0] || { count: 0, average: null };

  return {
    completedLessons: [...completedSet],
    totalCompleted,
    overallPercent,
    currentSemesterTotal,
    currentSemesterCompleted,
    currentSemesterPercent: currentSemesterTotal > 0 ? Math.round((currentSemesterCompleted / currentSemesterTotal) * 100) : 0,
    canAdvanceSemester: currentSemesterTotal > 0 ? (currentSemesterCompleted / currentSemesterTotal) >= 0.75 : false,
    subjectProgress: subjectProgressMap,
    semesterProgress: semesterProgressMap,
    lastVisitedLesson: learningState?.lastVisitedLesson || null,
    currentLesson: learningState?.currentLesson || nextUnfinished || null,
    nextUnfinishedLesson: nextUnfinished,
    streak: learningState?.streak || { currentStreak: 1, longestStreak: 1, lastActiveDate: '' },
    achievements: learningState?.achievements || [],
    certificates: learningState?.certificates || [],
    recentQuizAttempts: quizAttempts,
    quizMetrics: {
      attempts: quizMetrics.count || 0,
      averageScore: quizMetrics.average != null ? Math.round(quizMetrics.average) : null
    }
  };
}

// -------------------------------------------------------------
// Core Progress & State Routes
// -------------------------------------------------------------

const getSummaryHandler = asyncHandler(async (req, res) => {
  const currentSemesterNum = Number(req.user.semester || 1);
  const analytics = await computeUserProgressAnalytics(req.user._id, currentSemesterNum);

  const [recentProgressDocs, inProgressDocs] = await Promise.all([
    LessonProgress.find({ studentId: req.user._id })
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean(),
    LessonProgress.find({
      studentId: req.user._id,
      status: 'in_progress',
      $or: [{ semester: currentSemesterNum }, { semester: { $exists: false } }]
    })
      .sort({ updatedAt: -1 })
      .lean()
  ]);

  // Make sure lastVisitedLesson is included if not completed
  let activeUncompleted = [...inProgressDocs];
  if (analytics.lastVisitedLesson?.lessonId && !analytics.completedLessons.includes(analytics.lastVisitedLesson.lessonId)) {
    const exists = activeUncompleted.some((l) => l.lessonId === analytics.lastVisitedLesson.lessonId);
    if (!exists) {
      activeUncompleted.unshift({
        lessonId: analytics.lastVisitedLesson.lessonId,
        lessonTitle: analytics.lastVisitedLesson.title,
        subjectCode: analytics.lastVisitedLesson.subjectCode,
        subjectName: analytics.lastVisitedLesson.subjectName,
        semester: analytics.lastVisitedLesson.semester || currentSemesterNum,
        unitIndex: analytics.lastVisitedLesson.unitIndex,
        unitNumber: analytics.lastVisitedLesson.unitNumber,
        status: 'in_progress',
        lastAccessedAt: analytics.lastVisitedLesson.visitedAt || new Date()
      });
    }
  }

  res.json({
    data: {
      studentId: req.user.id,
      summary: analytics,
      progress: recentProgressDocs,
      inProgressLessons: activeUncompleted,
      completedLessons: analytics.completedLessons,
      overallProgress: analytics.overallPercent,
      subjectProgress: analytics.subjectProgress,
      semesterProgress: analytics.semesterProgress,
      lastVisitedLesson: analytics.lastVisitedLesson,
      continueLearning: analytics.nextUnfinishedLesson,
      streak: analytics.streak,
      achievements: analytics.achievements,
      certificates: analytics.certificates
    }
  });
});

router.get('/summary', authenticate, allowRoles('student'), getSummaryHandler);
router.get('/me', authenticate, allowRoles('student'), getSummaryHandler);

/**
 * GET /progress/in-progress
 * Returns all lessons the authenticated student is currently involved in and has not completed
 */
router.get('/in-progress', authenticate, allowRoles('student'), asyncHandler(async (req, res) => {
  const currentSemesterNum = Number(req.user.semester || 1);
  const inProgressDocs = await LessonProgress.find({
    studentId: req.user._id,
    status: 'in_progress',
    $or: [{ semester: currentSemesterNum }, { semester: { $exists: false } }]
  })
    .sort({ updatedAt: -1 })
    .lean();

  res.json({ data: { inProgressLessons: inProgressDocs } });
}));

/**
 * POST /progress/access
 * Records that the authenticated user visited or started a lesson & updates streak
 */
const accessSchema = z.object({
  lessonId: z.string().min(1),
  subjectCode: z.string().optional(),
  subjectName: z.string().optional(),
  semester: z.number().int().optional(),
  unitIndex: z.number().int().optional(),
  unitNumber: z.string().optional(),
  title: z.string().optional()
});

router.post(
  '/access',
  authenticate,
  allowRoles('student'),
  validate(accessSchema),
  asyncHandler(async (req, res) => {
    const { lessonId, subjectCode = '', subjectName = '', semester = 1, unitIndex = 0, unitNumber = 'Unit I', title = '' } = req.body;
    if (req.user?.semester && semester && Number(semester) !== Number(req.user.semester)) {
      throw new HttpError(403, `Study access is locked. You are enrolled in Semester ${req.user.semester}.`);
    }
    const now = new Date();

    const lessonData = {
      lessonId,
      subjectCode,
      subjectName,
      semester,
      unitIndex,
      unitNumber,
      title,
      visitedAt: now,
      updatedAt: now
    };

    // Update streak
    const streak = await updateUserStreak(req.user._id);

    // Upsert UserLearningState
    const learningState = await UserLearningState.findOneAndUpdate(
      { studentId: req.user._id },
      {
        $set: {
          lastVisitedLesson: lessonData,
          currentLesson: lessonData,
          activeSemester: semester
        },
        $setOnInsert: { studentId: req.user._id }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Upsert LessonProgress
    const existing = await LessonProgress.findOne({ studentId: req.user._id, lessonId });
    if (!existing) {
      await LessonProgress.create({
        studentId: req.user._id,
        lessonId,
        subjectCode,
        subjectName,
        semester,
        unitIndex,
        unitNumber,
        lessonTitle: title,
        status: 'in_progress',
        lastAccessedAt: now
      });
    } else {
      await LessonProgress.updateOne(
        { _id: existing._id },
        { $set: { lastAccessedAt: now } }
      );
    }

    res.json({
      data: {
        success: true,
        lastVisitedLesson: learningState.lastVisitedLesson,
        currentLesson: learningState.currentLesson,
        streak
      }
    });
  })
);

/**
 * POST /progress/lessons/:lessonId/complete
 */
router.post(
  '/lessons/:lessonId/complete',
  authenticate,
  allowRoles('student'),
  asyncHandler(async (req, res) => {
    const lessonId = req.params.lessonId;
    const {
      subjectCode = '',
      subjectName = '',
      semester = 1,
      unitIndex = 0,
      unitNumber = 'Unit I',
      title = '',
      quizScore = null
    } = req.body || {};

    if (req.user?.semester && semester && Number(semester) !== Number(req.user.semester)) {
      throw new HttpError(403, `Study access is locked. You are enrolled in Semester ${req.user.semester}.`);
    }

    const now = new Date();

    const progress = await LessonProgress.findOneAndUpdate(
      { studentId: req.user._id, lessonId },
      {
        $set: {
          status: 'completed',
          completedAt: now,
          lastAccessedAt: now,
          ...(subjectCode ? { subjectCode } : {}),
          ...(subjectName ? { subjectName } : {}),
          ...(semester ? { semester } : {}),
          ...(unitIndex !== undefined ? { unitIndex } : {}),
          ...(unitNumber ? { unitNumber } : {}),
          ...(title ? { lessonTitle: title } : {}),
          ...(quizScore != null ? { quizScore } : {})
        },
        $setOnInsert: {
          studentId: req.user._id,
          lessonId
        }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    await updateUserStreak(req.user._id);
    await awardXP(req.user._id, 10, 'lesson_completed');
    await checkAndUnlockBadges(req.user._id);

    // Check achievement for first completed lesson
    await checkAndAwardAchievement(req.user._id, 'first_step');

    // Check if an entire unit is completed
    if (subjectCode && unitIndex !== undefined) {
      const uNum = unitIndex + 1;
      const unitLessonIds = [1, 2, 3, 4].map((l) => `${subjectCode}-u${uNum}-l${l}`);
      const unitDone = await LessonProgress.countDocuments({
        studentId: req.user._id,
        lessonId: { $in: unitLessonIds },
        status: 'completed'
      });
      if (unitDone >= 4) {
        await checkAndAwardAchievement(req.user._id, 'unit_master');
      }
    }

    // Check certificate issuance for subject
    const cert = await checkSubjectCompletionCertificate(req.user._id, subjectCode, subjectName, semester);

    // Log Activity
    await logLearningActivity(req.user._id, {
      activityType: 'lesson_completed',
      title: `Completed Lesson: ${title || lessonId}`,
      description: `Official topic from ${subjectName || subjectCode} (${unitNumber}).`,
      lessonId,
      subjectCode,
      subjectName,
      semester
    });

    const analytics = await computeUserProgressAnalytics(req.user._id, Number(req.user.semester || 1));

    if (analytics.nextUnfinishedLesson) {
      await UserLearningState.findOneAndUpdate(
        { studentId: req.user._id },
        {
          $set: {
            lastUnfinishedLesson: analytics.nextUnfinishedLesson,
            currentLesson: analytics.nextUnfinishedLesson
          }
        },
        { upsert: true }
      );
    }

    res.json({
      data: {
        success: true,
        progress,
        summary: analytics,
        certificate: cert,
        nextUnfinishedLesson: analytics.nextUnfinishedLesson
      }
    });
  })
);

/**
 * POST /progress/lessons/:lessonId/toggle
 */
router.post(
  '/lessons/:lessonId/toggle',
  authenticate,
  allowRoles('student'),
  asyncHandler(async (req, res) => {
    const lessonId = req.params.lessonId;
    const existing = await LessonProgress.findOne({ studentId: req.user._id, lessonId });
    const now = new Date();

    let newStatus = 'completed';
    let completedAt = now;

    if (existing && existing.status === 'completed') {
      newStatus = 'in_progress';
      completedAt = null;
    }

    const progress = await LessonProgress.findOneAndUpdate(
      { studentId: req.user._id, lessonId },
      {
        $set: {
          status: newStatus,
          completedAt,
          lastAccessedAt: now,
          ...(req.body.subjectCode ? { subjectCode: req.body.subjectCode } : {}),
          ...(req.body.subjectName ? { subjectName: req.body.subjectName } : {}),
          ...(req.body.semester ? { semester: req.body.semester } : {}),
          ...(req.body.title ? { lessonTitle: req.body.title } : {})
        },
        $setOnInsert: { studentId: req.user._id, lessonId }
      },
      { new: true, upsert: true }
    );

    await updateUserStreak(req.user._id);

    if (newStatus === 'completed') {
      await awardXP(req.user._id, 10, 'lesson_completed');
      await checkAndUnlockBadges(req.user._id);
      await checkAndAwardAchievement(req.user._id, 'first_step');
      if (req.body.subjectCode) {
        await checkSubjectCompletionCertificate(req.user._id, req.body.subjectCode, req.body.subjectName, req.body.semester);
      }
      await logLearningActivity(req.user._id, {
        activityType: 'lesson_completed',
        title: `Completed Lesson: ${req.body.title || lessonId}`,
        lessonId,
        subjectCode: req.body.subjectCode || '',
        subjectName: req.body.subjectName || ''
      });
    }

    const analytics = await computeUserProgressAnalytics(req.user._id, Number(req.user.semester || 1));

    res.json({
      data: {
        success: true,
        progress,
        summary: analytics
      }
    });
  })
);

// -------------------------------------------------------------
// 1. Personal Notes for Each Lesson
// -------------------------------------------------------------

router.post(
  '/lessons/:lessonId/note',
  authenticate,
  allowRoles('student'),
  asyncHandler(async (req, res) => {
    const lessonId = req.params.lessonId;
    const { note = '', subjectCode = '', subjectName = '', semester = 1, title = '' } = req.body;
    const now = new Date();

    const progress = await LessonProgress.findOneAndUpdate(
      { studentId: req.user._id, lessonId },
      {
        $set: {
          note: String(note),
          notesUpdatedAt: now,
          lastAccessedAt: now,
          ...(subjectCode ? { subjectCode } : {}),
          ...(subjectName ? { subjectName } : {}),
          ...(semester ? { semester } : {}),
          ...(title ? { lessonTitle: title } : {})
        },
        $setOnInsert: { studentId: req.user._id, lessonId }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    if (note && note.trim().length > 0) {
      await checkAndAwardAchievement(req.user._id, 'scholar_notes');
      await logLearningActivity(req.user._id, {
        activityType: 'note_saved',
        title: `Updated Notes: ${title || lessonId}`,
        description: `Saved personal study note (${note.trim().split(/\s+/).length} words).`,
        lessonId,
        subjectCode,
        subjectName
      });
    }

    res.json({
      data: {
        success: true,
        lessonId,
        note: progress.note,
        notesUpdatedAt: progress.notesUpdatedAt
      }
    });
  })
);

router.get(
  '/lessons/:lessonId/note',
  authenticate,
  allowRoles('student'),
  asyncHandler(async (req, res) => {
    const lessonId = req.params.lessonId;
    const progress = await LessonProgress.findOne({ studentId: req.user._id, lessonId }).lean();
    res.json({
      data: {
        lessonId,
        note: progress?.note || '',
        notesUpdatedAt: progress?.notesUpdatedAt || null
      }
    });
  })
);

router.get(
  '/notes',
  authenticate,
  allowRoles('student'),
  asyncHandler(async (req, res) => {
    const docs = await LessonProgress.find({
      studentId: req.user._id,
      note: { $exists: true, $ne: '' }
    })
      .sort({ notesUpdatedAt: -1, updatedAt: -1 })
      .lean();

    res.json({
      data: {
        totalNotes: docs.length,
        notes: docs.map((d) => ({
          lessonId: d.lessonId,
          lessonTitle: d.lessonTitle || d.lessonId,
          subjectCode: d.subjectCode,
          subjectName: d.subjectName,
          semester: d.semester,
          unitNumber: d.unitNumber,
          note: d.note,
          notesUpdatedAt: d.notesUpdatedAt || d.updatedAt
        }))
      }
    });
  })
);

// -------------------------------------------------------------
// 2. Bookmark Important Lessons
// -------------------------------------------------------------

router.post(
  '/lessons/:lessonId/bookmark',
  authenticate,
  allowRoles('student'),
  asyncHandler(async (req, res) => {
    const lessonId = req.params.lessonId;
    const { subjectCode = '', subjectName = '', semester = 1, title = '' } = req.body;
    const existing = await LessonProgress.findOne({ studentId: req.user._id, lessonId });

    const newBookmarkState = !existing?.isBookmarked;
    const progress = await LessonProgress.findOneAndUpdate(
      { studentId: req.user._id, lessonId },
      {
        $set: {
          isBookmarked: newBookmarkState,
          lastAccessedAt: new Date(),
          ...(subjectCode ? { subjectCode } : {}),
          ...(subjectName ? { subjectName } : {}),
          ...(semester ? { semester } : {}),
          ...(title ? { lessonTitle: title } : {})
        },
        $setOnInsert: { studentId: req.user._id, lessonId }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    if (newBookmarkState) {
      await checkAndAwardAchievement(req.user._id, 'bookmark_pro');
      await logLearningActivity(req.user._id, {
        activityType: 'lesson_bookmarked',
        title: `Bookmarked: ${title || lessonId}`,
        lessonId,
        subjectCode,
        subjectName
      });
    }

    res.json({
      data: {
        success: true,
        lessonId,
        isBookmarked: progress.isBookmarked
      }
    });
  })
);

router.get(
  '/bookmarks',
  authenticate,
  allowRoles('student'),
  asyncHandler(async (req, res) => {
    const docs = await LessonProgress.find({
      studentId: req.user._id,
      isBookmarked: true
    })
      .sort({ updatedAt: -1 })
      .lean();

    res.json({
      data: {
        totalBookmarks: docs.length,
        bookmarks: docs.map((d) => ({
          lessonId: d.lessonId,
          lessonTitle: d.lessonTitle || d.lessonId,
          subjectCode: d.subjectCode,
          subjectName: d.subjectName,
          semester: d.semester,
          unitNumber: d.unitNumber,
          status: d.status,
          updatedAt: d.updatedAt
        }))
      }
    });
  })
);

// -------------------------------------------------------------
// 3. Save Difficult Topics for Revision
// -------------------------------------------------------------

router.post(
  '/lessons/:lessonId/difficult',
  authenticate,
  allowRoles('student'),
  asyncHandler(async (req, res) => {
    const lessonId = req.params.lessonId;
    const { subjectCode = '', subjectName = '', semester = 1, title = '' } = req.body;
    const existing = await LessonProgress.findOne({ studentId: req.user._id, lessonId });

    const newDifficultState = !existing?.isDifficult;
    const progress = await LessonProgress.findOneAndUpdate(
      { studentId: req.user._id, lessonId },
      {
        $set: {
          isDifficult: newDifficultState,
          lastAccessedAt: new Date(),
          ...(subjectCode ? { subjectCode } : {}),
          ...(subjectName ? { subjectName } : {}),
          ...(semester ? { semester } : {}),
          ...(title ? { lessonTitle: title } : {})
        },
        $setOnInsert: { studentId: req.user._id, lessonId }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    if (newDifficultState) {
      await checkAndAwardAchievement(req.user._id, 'revision_warrior');
      await logLearningActivity(req.user._id, {
        activityType: 'marked_difficult',
        title: `Marked for Revision: ${title || lessonId}`,
        description: 'Flagged as challenging topic for revision deck.',
        lessonId,
        subjectCode,
        subjectName
      });
    }

    res.json({
      data: {
        success: true,
        lessonId,
        isDifficult: progress.isDifficult
      }
    });
  })
);

router.get(
  '/difficult',
  authenticate,
  allowRoles('student'),
  asyncHandler(async (req, res) => {
    const docs = await LessonProgress.find({
      studentId: req.user._id,
      isDifficult: true
    })
      .sort({ updatedAt: -1 })
      .lean();

    res.json({
      data: {
        totalDifficult: docs.length,
        difficultTopics: docs.map((d) => ({
          lessonId: d.lessonId,
          lessonTitle: d.lessonTitle || d.lessonId,
          subjectCode: d.subjectCode,
          subjectName: d.subjectName,
          semester: d.semester,
          unitNumber: d.unitNumber,
          status: d.status,
          updatedAt: d.updatedAt
        }))
      }
    });
  })
);

// -------------------------------------------------------------
// 4. Learning Activity History
// -------------------------------------------------------------

router.get(
  '/activities',
  authenticate,
  allowRoles('student'),
  asyncHandler(async (req, res) => {
    const limit = Math.min(50, Number(req.query.limit) || 20);
    const activities = await LearningActivity.find({ studentId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({
      data: {
        activities
      }
    });
  })
);

// -------------------------------------------------------------
// 5. Subject Completion Certificates & Achievements
// -------------------------------------------------------------

router.get(
  '/certificates',
  authenticate,
  allowRoles('student'),
  asyncHandler(async (req, res) => {
    const state = await UserLearningState.findOne({ studentId: req.user._id }).lean();
    res.json({
      data: {
        certificates: state?.certificates || []
      }
    });
  })
);

router.get(
  '/achievements',
  authenticate,
  allowRoles('student'),
  asyncHandler(async (req, res) => {
    const state = await UserLearningState.findOne({ studentId: req.user._id }).lean();
    const unlockedMap = (state?.achievements || []).reduce((acc, a) => {
      acc[a.id] = a;
      return acc;
    }, {});

    const achievements = ACHIEVEMENTS_CATALOG.map((cat) => ({
      ...cat,
      unlocked: Boolean(unlockedMap[cat.id]),
      unlockedAt: unlockedMap[cat.id]?.unlockedAt || null
    }));

    res.json({
      data: {
        totalUnlocked: Object.keys(unlockedMap).length,
        totalAvailable: ACHIEVEMENTS_CATALOG.length,
        achievements
      }
    });
  })
);

// -------------------------------------------------------------
// 6. Comprehensive Personalized Dashboard Endpoint
// -------------------------------------------------------------

router.get(
  '/dashboard',
  authenticate,
  allowRoles('student'),
  asyncHandler(async (req, res) => {
    const currentSemesterNum = Number(req.user.semester || 1);
    const [analytics, bookmarks, difficultTopics, notes, activities] = await Promise.all([
      computeUserProgressAnalytics(req.user._id, currentSemesterNum),
      LessonProgress.find({ studentId: req.user._id, isBookmarked: true }).limit(6).lean(),
      LessonProgress.find({ studentId: req.user._id, isDifficult: true }).limit(6).lean(),
      LessonProgress.find({ studentId: req.user._id, note: { $exists: true, $ne: '' } }).limit(5).lean(),
      LearningActivity.find({ studentId: req.user._id }).sort({ createdAt: -1 }).limit(10).lean()
    ]);

    // Active semester subjects with completion breakdown
    const activePlan = officialSemesters.find((s) => s.semester === currentSemesterNum) || officialSemesters[0];
    const currentSubjects = activePlan.subjects.map((sub) => {
      const p = analytics.subjectProgress[sub.code] || { completed: 0, total: 16, percent: 0 };
      return {
        code: sub.code,
        id: sub.id,
        name: sub.name,
        nature: sub.nature,
        credits: sub.credits,
        completed: p.completed,
        total: p.total,
        percent: p.percent,
        pendingLessons: p.total - p.completed,
        isCompleted: p.percent === 100
      };
    });

    // Top pending lessons in active semester
    const completedSet = new Set(analytics.completedLessons);
    const pendingLessonsList = [];
    for (const sub of activePlan.subjects) {
      for (let u = 1; u <= 4; u++) {
        for (let l = 1; l <= 4; l++) {
          const lId = `${sub.code}-u${u}-l${l}`;
          if (!completedSet.has(lId)) {
            pendingLessonsList.push({
              lessonId: lId,
              subjectCode: sub.code,
              subjectName: sub.name,
              semester: currentSemesterNum,
              unitNumber: `Unit ${u}`,
              unitIndex: u - 1,
              title: `${sub.name} - Unit ${u} Lesson ${l}`
            });
          }
          if (pendingLessonsList.length >= 6) break;
        }
        if (pendingLessonsList.length >= 6) break;
      }
      if (pendingLessonsList.length >= 6) break;
    }

    res.json({
      data: {
        student: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          semester: currentSemesterNum
        },
        streak: analytics.streak,
        overallProgress: analytics.overallPercent,
        currentSemesterPercent: analytics.currentSemesterPercent,
        canAdvanceSemester: analytics.canAdvanceSemester,
        currentSubjects,
        pendingLessons: pendingLessonsList,
        continueLearning: analytics.nextUnfinishedLesson || analytics.currentLesson,
        bookmarksCount: bookmarks.length,
        bookmarksPreview: bookmarks,
        difficultCount: difficultTopics.length,
        difficultPreview: difficultTopics,
        notesCount: notes.length,
        notesPreview: notes,
        certificates: analytics.certificates,
        achievements: analytics.achievements,
        recentActivities: activities
      }
    });
  })
);

// -------------------------------------------------------------
// Legacy & Existing Quiz Routes
// -------------------------------------------------------------

const quizAttemptSchema = z.object({
  lessonId: z.string().min(1),
  subjectCode: z.string().optional(),
  subjectName: z.string().optional(),
  semester: z.number().int().optional(),
  lessonTitle: z.string().optional(),
  answers: z.array(z.number().int().nonnegative()),
  score: z.number().min(0).max(100),
  correctCount: z.number().min(0),
  totalQuestions: z.number().min(1)
});

router.post(
  '/quiz-attempt',
  authenticate,
  allowRoles('student'),
  validate(quizAttemptSchema),
  asyncHandler(async (req, res) => {
    const {
      lessonId,
      subjectCode = '',
      subjectName = '',
      semester = 1,
      lessonTitle = '',
      answers,
      score,
      correctCount,
      totalQuestions
    } = req.body;

    const attempt = await QuizAttempt.create({
      studentId: req.user._id,
      lessonId,
      subjectCode,
      subjectName,
      semester,
      lessonTitle,
      answers,
      score,
      correctCount,
      totalQuestions,
      passed: score >= 70
    });

    await LessonProgress.findOneAndUpdate(
      { studentId: req.user._id, lessonId },
      {
        $set: {
          quizScore: score,
          lastAccessedAt: new Date(),
          ...(subjectCode ? { subjectCode } : {}),
          ...(subjectName ? { subjectName } : {}),
          ...(semester ? { semester } : {}),
          ...(lessonTitle ? { lessonTitle } : {})
        },
        $inc: { quizAttempts: 1 },
        $setOnInsert: {
          studentId: req.user._id,
          lessonId,
          status: 'in_progress'
        }
      },
      { upsert: true }
    );

    if (score >= 80) {
      await checkAndAwardAchievement(req.user._id, 'quiz_ace');
    }

    await logLearningActivity(req.user._id, {
      activityType: 'quiz_completed',
      title: `Completed Quiz: ${lessonTitle || lessonId}`,
      description: `Scored ${score}% (${correctCount}/${totalQuestions} correct).`,
      lessonId,
      subjectCode,
      subjectName,
      metadata: { score }
    });

    const quizStats = await QuizAttempt.aggregate([
      { $match: { studentId: req.user._id } },
      { $group: { _id: null, count: { $sum: 1 }, average: { $avg: '$score' } } }
    ]);

    const avg = quizStats[0] ? Math.round(quizStats[0].average) : score;

    res.status(201).json({
      data: {
        success: true,
        attempt,
        averageQuizScore: avg,
        totalAttempts: quizStats[0]?.count || 1
      }
    });
  })
);

router.get(
  '/quizzes',
  authenticate,
  allowRoles('student'),
  asyncHandler(async (req, res) => {
    const attempts = await QuizAttempt.find({ studentId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    const quizStats = await QuizAttempt.aggregate([
      { $match: { studentId: req.user._id } },
      { $group: { _id: null, count: { $sum: 1 }, average: { $avg: '$score' } } }
    ]);

    res.json({
      data: {
        attempts,
        metrics: {
          totalAttempts: quizStats[0]?.count || 0,
          averageScore: quizStats[0]?.average != null ? Math.round(quizStats[0].average) : null
        }
      }
    });
  })
);

router.put(
  '/lessons/:lessonId',
  authenticate,
  allowRoles('student'),
  asyncHandler(async (req, res) => {
    const status = req.body.status || 'in_progress';
    const now = new Date();
    const progress = await LessonProgress.findOneAndUpdate(
      { studentId: req.user._id, lessonId: req.params.lessonId },
      {
        $set: {
          status,
          lastAccessedAt: now,
          completedAt: status === 'completed' ? now : null
        },
        $setOnInsert: { studentId: req.user._id, lessonId: req.params.lessonId }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json({ data: { progress } });
  })
);

router.get(
  '/students/:studentId',
  authenticate,
  allowRoles('student', 'mentor', 'senior_mentor', 'admin', 'super_admin'),
  authorizeStudentAccess(),
  asyncHandler(async (req, res) => {
    const student = await User.findById(req.params.studentId);
    if (!student) throw new HttpError(404, 'Student not found');
    const analytics = await computeUserProgressAnalytics(student._id, student.semester || 1);
    res.json({ data: { studentId: student.id, summary: analytics } });
  })
);

export default router;
