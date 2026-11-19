import User from '../models/User.js';
import UserLearningState from '../models/UserLearningState.js';
import LessonProgress from '../models/LessonProgress.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Assignment from '../models/Assignment.js';
import DailyGoal from '../models/DailyGoal.js';
import LearningActivity from '../models/LearningActivity.js';
import { officialSemesters } from '../config/curriculumMap.js';

/**
 * Level & Rank Titles Progression
 */
export const LEVEL_TIERS = [
  { level: 1, minXp: 0, maxXp: 99, title: 'Novice Coder', badge: '🌱' },
  { level: 2, minXp: 100, maxXp: 249, title: 'Junior Scholar', badge: '📘' },
  { level: 3, minXp: 250, maxXp: 499, title: 'Code Explorer', badge: '💻' },
  { level: 4, minXp: 500, maxXp: 799, title: 'Algorithm Apprentice', badge: '⚡' },
  { level: 5, minXp: 800, maxXp: 1199, title: 'Software Developer', badge: '🛠️' },
  { level: 6, minXp: 1200, maxXp: 1699, title: 'Systems Engineer', badge: '⚙️' },
  { level: 7, minXp: 1700, maxXp: 2299, title: 'Full-Stack Architect', badge: '🚀' },
  { level: 8, minXp: 2300, maxXp: 2999, title: 'Research Fellow', badge: '🔬' },
  { level: 9, minXp: 3000, maxXp: 3999, title: 'Senior Technologist', badge: '👑' },
  { level: 10, minXp: 4000, maxXp: Infinity, title: 'Grandmaster', badge: '🏆' }
];

/**
 * Compute student level, title, and progress to next level
 */
export function calculateLevel(xp = 0) {
  const currentXp = Math.max(0, Number(xp) || 0);
  const tier = LEVEL_TIERS.find((t) => currentXp >= t.minXp && currentXp <= t.maxXp) || LEVEL_TIERS[0];

  const currentLevelXp = currentXp - tier.minXp;
  const nextLevelSpan = tier.maxXp === Infinity ? 1000 : (tier.maxXp - tier.minXp + 1);
  const progressPercent = tier.maxXp === Infinity ? 100 : Math.min(100, Math.round((currentLevelXp / nextLevelSpan) * 100));

  return {
    level: tier.level,
    rankTitle: tier.title,
    badgeIcon: tier.badge,
    currentXp,
    tierMinXp: tier.minXp,
    tierMaxXp: tier.maxXp,
    xpToNextLevel: tier.maxXp === Infinity ? 0 : Math.max(0, tier.maxXp + 1 - currentXp),
    progressPercent
  };
}

/**
 * Standard Gamification Badges Catalog
 */
export const BADGES_CATALOG = [
  {
    id: 'first_step',
    title: 'First Step',
    description: 'Completed your very first curriculum lesson.',
    icon: 'Zap',
    category: 'milestone'
  },
  {
    id: 'quiz_master',
    title: 'Quiz Master',
    description: 'Scored 90% or higher on 3 or more assessments.',
    icon: 'Award',
    category: 'assessment'
  },
  {
    id: 'streak_7_days',
    title: '7-Day Streak',
    description: 'Maintained an unbroken 7-day continuous study streak.',
    icon: 'Flame',
    category: 'streak'
  },
  {
    id: 'coding_starter',
    title: 'Coding Starter',
    description: 'Solved your first practical coding problem or lab challenge.',
    icon: 'Code2',
    category: 'coding'
  },
  {
    id: 'semester_champion',
    title: 'Semester Champion',
    description: 'Mastered 75% or more of your active semester curriculum.',
    icon: 'Trophy',
    category: 'mastery'
  },
  {
    id: 'project_builder',
    title: 'Project Builder',
    description: 'Built and submitted an industry capstone or lab assignment.',
    icon: 'Layers',
    category: 'project'
  },
  {
    id: 'fast_learner',
    title: 'Fast Learner',
    description: 'Completed 5 lessons in a single study session.',
    icon: 'Sparkles',
    category: 'milestone'
  }
];

/**
 * Award XP to a student and check for level ups & badge unlocks
 */
export async function awardXP(studentId, amount, reason = 'learning_activity') {
  if (!studentId || !amount) return null;

  const user = await User.findById(studentId);
  if (!user) return null;

  const oldXp = user.xp || 0;
  const newXp = oldXp + Math.max(0, Number(amount));
  user.xp = newXp;

  await user.save();

  // Log learning activity
  try {
    await LearningActivity.create({
      studentId,
      activityType: 'xp_earned',
      title: `Earned +${amount} XP: ${reason.replace(/_/g, ' ')}`,
      metadata: { amount, newXp, reason }
    });
  } catch (err) {
    // Non-blocking
  }

  // Check if badges should be unlocked
  const unlockedBadges = await checkAndUnlockBadges(studentId);

  return {
    oldXp,
    newXp,
    awarded: amount,
    levelInfo: calculateLevel(newXp),
    newlyUnlockedBadges: unlockedBadges
  };
}

/**
 * Manually unlock a specific badge for a student if not already earned
 */
export async function unlockBadge(studentId, badgeId) {
  if (!studentId || !badgeId) return null;
  const user = await User.findById(studentId);
  if (!user) return null;

  const currentBadgesSet = new Set((user.badges || []).map((b) => b.id));
  if (currentBadgesSet.has(badgeId)) return null;

  const def = BADGES_CATALOG.find((b) => b.id === badgeId);
  if (!def) return null;

  const item = {
    id: def.id,
    title: def.title,
    description: def.description,
    icon: def.icon,
    unlockedAt: new Date()
  };

  user.badges.push(item);
  await user.save();

  const learningState = await UserLearningState.findOne({ studentId });
  if (learningState) {
    if (!learningState.achievements) learningState.achievements = [];
    if (!learningState.achievements.some((a) => a.id === badgeId)) {
      learningState.achievements.push(item);
      await learningState.save();
    }
  }

  return item;
}

/**
 * Check and automatically unlock eligible badges
 */
export async function checkAndUnlockBadges(studentId) {
  if (!studentId) return [];

  const [user, learningState, completedLessons, quizAttempts, assignments] = await Promise.all([
    User.findById(studentId),
    UserLearningState.findOne({ studentId }),
    LessonProgress.find({ studentId, status: 'completed' }).lean(),
    QuizAttempt.find({ studentId }).lean(),
    Assignment.find({ 'submissions.studentId': studentId }).lean()
  ]);

  if (!user) return [];

  const currentBadgesSet = new Set((user.badges || []).map((b) => b.id));
  const newlyUnlocked = [];

  // Helper to unlock badge
  const unlock = (badgeId) => {
    if (!currentBadgesSet.has(badgeId)) {
      const def = BADGES_CATALOG.find((b) => b.id === badgeId);
      if (def) {
        const item = {
          id: def.id,
          title: def.title,
          description: def.description,
          icon: def.icon,
          unlockedAt: new Date()
        };
        user.badges.push(item);
        currentBadgesSet.add(badgeId);
        newlyUnlocked.push(item);

        if (learningState) {
          if (!learningState.achievements) learningState.achievements = [];
          if (!learningState.achievements.some((a) => a.id === badgeId)) {
            learningState.achievements.push(item);
          }
        }
      }
    }
  };

  // 1. First Step (completed >= 1 lesson)
  if (completedLessons.length >= 1) {
    unlock('first_step');
  }

  // 2. Quiz Master (scored >= 90% on 3 or more quizzes)
  const masterScores = quizAttempts.filter((q) => q.score >= 90);
  if (masterScores.length >= 3) {
    unlock('quiz_master');
  }

  // 3. 7-Day Streak
  const streakDays = learningState?.streak?.currentStreak || 1;
  if (streakDays >= 7) {
    unlock('streak_7_days');
  }

  // 4. Coding Starter
  const hasCoding = quizAttempts.some((q) => q.assessmentType === 'code' || q.questionResults?.some((r) => r.type === 'code')) ||
    completedLessons.some((l) => l.lessonId?.includes('lab') || l.lessonId?.includes('code'));
  if (hasCoding || completedLessons.length >= 3) {
    unlock('coding_starter');
  }

  // 5. Semester Champion (>= 75% of current semester lessons)
  const semPlan = officialSemesters.find((s) => s.semester === (user.semester || 1)) || officialSemesters[0];
  const semLessonCount = (semPlan.subjects || []).length * 16;
  const semCompletedCount = completedLessons.filter((l) => {
    return (semPlan.subjects || []).some((sub) => String(l.lessonId).startsWith(sub.code));
  }).length;

  if (semLessonCount > 0 && (semCompletedCount / semLessonCount) >= 0.75) {
    unlock('semester_champion');
  }

  // 6. Project Builder (submitted lab assignment or capstone deliverable)
  if (assignments.length >= 1) {
    unlock('project_builder');
  }

  if (newlyUnlocked.length > 0) {
    await user.save();
    if (learningState) await learningState.save();
  }

  return newlyUnlocked;
}

/**
 * Format today's date string YYYY-MM-DD
 */
export function getTodayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get or automatically generate today's balanced daily goals
 */
export async function getOrCreateDailyGoals(studentId) {
  const today = getTodayDateString();
  let record = await DailyGoal.findOne({ studentId, date: today });

  if (record) return record;

  const user = await User.findById(studentId).lean();
  const sem = user?.semester || 1;
  const semPlan = officialSemesters.find((s) => s.semester === sem) || officialSemesters[0];
  const primarySubject = semPlan.subjects[0]?.name || 'Computing';
  const secondarySubject = semPlan.subjects[1]?.name || 'Core Programming';

  // Generate 3 curated learning tasks for today
  const defaultGoals = [
    {
      id: `dg-${Date.now()}-1`,
      title: `Complete 2 interactive lessons in ${primarySubject}`,
      category: 'lesson',
      targetCount: 2,
      completedCount: 0,
      isCompleted: false,
      xpValue: 20,
      details: { subjectName: primarySubject }
    },
    {
      id: `dg-${Date.now()}-2`,
      title: `Solve 1 practical coding challenge in ${secondarySubject}`,
      category: 'coding',
      targetCount: 1,
      completedCount: 0,
      isCompleted: false,
      xpValue: 25,
      details: { subjectName: secondarySubject }
    },
    {
      id: `dg-${Date.now()}-3`,
      title: 'Review weak topics with an AI diagnostic practice quiz',
      category: 'revision',
      targetCount: 1,
      completedCount: 0,
      isCompleted: false,
      xpValue: 20,
      details: { topic: 'Revision Deck' }
    }
  ];

  record = await DailyGoal.create({
    studentId,
    date: today,
    goals: defaultGoals,
    totalGoals: 3,
    completedGoals: 0,
    progressPercent: 0,
    allCompleted: false
  });

  return record;
}

/**
 * Safe, anonymized student display name for Leaderboard
 * e.g. "Aman Deep" -> "Aman D."
 */
export function formatLeaderboardName(fullName = '') {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const first = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${first} ${lastInitial}.`;
}

/**
 * Generate privacy-safe Leaderboard rankings
 */
export async function getLeaderboard({ semester = 'all', limit = 50, requesterId = null } = {}) {
  const query = { role: 'student' };
  if (semester && semester !== 'all') {
    query.semester = Number(semester);
  }

  const [students, learningStates] = await Promise.all([
    User.find(query)
      .select('name avatar semester batch section xp badges createdAt')
      .sort({ xp: -1, createdAt: 1 })
      .limit(Number(limit) || 50)
      .lean(),
    UserLearningState.find({}).select('studentId streak achievements').lean()
  ]);

  const stateMap = new Map(learningStates.map((s) => [String(s.studentId), s]));

  let requesterRank = null;

  const leaderboard = students.map((student, index) => {
    const sId = String(student._id);
    const rank = index + 1;
    const state = stateMap.get(sId);
    const xp = student.xp || 0;
    const levelInfo = calculateLevel(xp);
    const streakDays = state?.streak?.currentStreak || 1;
    const badgesCount = (student.badges || []).length || (state?.achievements || []).length;

    if (requesterId && String(student._id) === String(requesterId)) {
      requesterRank = rank;
    }

    return {
      rank,
      studentId: student._id,
      displayName: formatLeaderboardName(student.name),
      avatar: student.avatar || '',
      semester: student.semester || 1,
      batch: student.batch || '',
      xp,
      level: levelInfo.level,
      rankTitle: levelInfo.rankTitle,
      badgeIcon: levelInfo.badgeIcon,
      badgesCount,
      streakDays,
      isCurrentUser: requesterId ? String(student._id) === String(requesterId) : false
    };
  });

  return {
    semester: semester === 'all' ? 'All Semesters' : `Semester ${semester}`,
    totalRanked: leaderboard.length,
    requesterRank,
    leaderboard
  };
}
