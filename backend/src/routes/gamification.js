import express from 'express';
import { authenticate } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import HttpError from '../utils/httpError.js';
import DailyGoal from '../models/DailyGoal.js';
import User from '../models/User.js';
import UserLearningState from '../models/UserLearningState.js';
import {
  calculateLevel,
  BADGES_CATALOG,
  awardXP,
  checkAndUnlockBadges,
  getOrCreateDailyGoals,
  getLeaderboard
} from '../services/gamificationService.js';

const router = express.Router();

router.use(authenticate);

/**
 * GET /gamification/profile
 * Get complete gamification profile for authenticated student
 */
router.get('/profile', asyncHandler(async (req, res) => {
  const studentId = req.user.id;

  const [user, learningState, dailyGoalsRecord, overallRankData, semesterRankData] = await Promise.all([
    User.findById(studentId).select('name email xp badges semester batch avatar').lean(),
    UserLearningState.findOne({ studentId }).lean(),
    getOrCreateDailyGoals(studentId),
    getLeaderboard({ semester: 'all', limit: 100, requesterId: studentId }),
    getLeaderboard({ semester: req.user.semester || 1, limit: 100, requesterId: studentId })
  ]);

  const xp = user?.xp || 0;
  const levelInfo = calculateLevel(xp);
  const streak = learningState?.streak || { currentStreak: 1, longestStreak: 1 };

  // Format badges with catalog definitions
  const unlockedMap = new Map((user?.badges || []).map((b) => [b.id, b]));
  const badges = BADGES_CATALOG.map((badgeDef) => {
    const unlocked = unlockedMap.get(badgeDef.id);
    return {
      ...badgeDef,
      isUnlocked: Boolean(unlocked),
      unlockedAt: unlocked ? unlocked.unlockedAt : null
    };
  });

  res.json({
    data: {
      xp,
      levelInfo,
      streak,
      badges,
      unlockedBadgesCount: (user?.badges || []).length,
      totalBadgesCount: BADGES_CATALOG.length,
      dailyGoals: dailyGoalsRecord,
      rankings: {
        overallRank: overallRankData.requesterRank || '—',
        semesterRank: semesterRankData.requesterRank || '—',
        semester: req.user.semester || 1
      }
    }
  });
}));

/**
 * GET /gamification/daily-goals
 * Fetch today's daily learning goals
 */
router.get('/daily-goals', asyncHandler(async (req, res) => {
  const dailyGoals = await getOrCreateDailyGoals(req.user.id);
  res.json({ data: { dailyGoals } });
}));

/**
 * POST /gamification/daily-goals
 * Add a custom daily learning goal
 */
router.post('/daily-goals', asyncHandler(async (req, res) => {
  const { title, category = 'custom', targetCount = 1, xpValue = 15 } = req.body;

  if (!title || !title.trim()) {
    throw new HttpError(400, 'Goal title cannot be empty');
  }

  const record = await getOrCreateDailyGoals(req.user.id);

  const newGoal = {
    id: `custom-dg-${Date.now()}`,
    title: title.trim(),
    category,
    targetCount: Number(targetCount) || 1,
    completedCount: 0,
    isCompleted: false,
    xpValue: Number(xpValue) || 15,
    details: {}
  };

  record.goals.push(newGoal);
  record.totalGoals = record.goals.length;
  record.completedGoals = record.goals.filter((g) => g.isCompleted).length;
  record.progressPercent = Math.round((record.completedGoals / record.totalGoals) * 100);
  record.allCompleted = record.completedGoals === record.totalGoals;

  await record.save();

  res.status(201).json({
    data: {
      message: 'Goal added to today\'s learning agenda',
      goal: newGoal,
      dailyGoals: record
    }
  });
}));

/**
 * POST /gamification/daily-goals/:goalId/toggle
 * Toggle goal completion and award XP
 */
router.post('/daily-goals/:goalId/toggle', asyncHandler(async (req, res) => {
  const record = await getOrCreateDailyGoals(req.user.id);

  const goal = record.goals.find((g) => g.id === req.params.goalId);
  if (!goal) throw new HttpError(404, 'Goal not found');

  const willBeCompleted = !goal.isCompleted;
  goal.isCompleted = willBeCompleted;
  goal.completedAt = willBeCompleted ? new Date() : null;
  goal.completedCount = willBeCompleted ? goal.targetCount : 0;

  record.completedGoals = record.goals.filter((g) => g.isCompleted).length;
  record.progressPercent = Math.round((record.completedGoals / record.totalGoals) * 100);
  const previouslyAllCompleted = record.allCompleted;
  record.allCompleted = record.completedGoals === record.totalGoals;

  let xpResult = null;
  if (willBeCompleted) {
    // Award XP for this completed goal
    let totalXpToAward = goal.xpValue || 15;

    // Check if student completed all goals today for bonus!
    if (record.allCompleted && !record.bonusXpAwarded) {
      totalXpToAward += 35; // +35 XP bonus for completing entire daily agenda
      record.bonusXpAwarded = true;
    }

    xpResult = await awardXP(req.user.id, totalXpToAward, `daily_goal_${goal.category}`);
  }

  await record.save();

  res.json({
    data: {
      goal,
      dailyGoals: record,
      xpResult,
      bonusAwarded: record.allCompleted && !previouslyAllCompleted
    }
  });
}));

/**
 * GET /gamification/badges
 * List all badges with student unlock status
 */
router.get('/badges', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('badges').lean();
  const unlockedMap = new Map((user?.badges || []).map((b) => [b.id, b]));

  const badges = BADGES_CATALOG.map((b) => {
    const unl = unlockedMap.get(b.id);
    return {
      ...b,
      isUnlocked: Boolean(unl),
      unlockedAt: unl ? unl.unlockedAt : null
    };
  });

  res.json({
    data: {
      badges,
      unlockedCount: (user?.badges || []).length,
      totalCount: BADGES_CATALOG.length
    }
  });
}));

/**
 * GET /gamification/leaderboard
 * Fetch privacy-safe Leaderboard rankings
 */
router.get('/leaderboard', asyncHandler(async (req, res) => {
  const { semester = 'all', limit = 50 } = req.query;

  const result = await getLeaderboard({
    semester,
    limit: Number(limit) || 50,
    requesterId: req.user.id
  });

  res.json({ data: result });
}));

export default router;
