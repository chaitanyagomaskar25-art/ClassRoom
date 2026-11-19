import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateLevel,
  formatLeaderboardName,
  BADGES_CATALOG,
  LEVEL_TIERS
} from '../src/services/gamificationService.js';
import DailyGoal from '../src/models/DailyGoal.js';

test('Level Progression: calculates levels and titles accurately', () => {
  // Level 1: 0 - 99 XP
  const lvl1 = calculateLevel(0);
  assert.equal(lvl1.level, 1);
  assert.equal(lvl1.rankTitle, 'Novice Coder');
  assert.equal(lvl1.progressPercent, 0);

  const lvl1Mid = calculateLevel(50);
  assert.equal(lvl1Mid.level, 1);
  assert.equal(lvl1Mid.progressPercent, 50);

  // Level 2: 100 - 249 XP
  const lvl2 = calculateLevel(100);
  assert.equal(lvl2.level, 2);
  assert.equal(lvl2.rankTitle, 'Junior Scholar');

  // Level 5: 800 - 1199 XP
  const lvl5 = calculateLevel(850);
  assert.equal(lvl5.level, 5);
  assert.equal(lvl5.rankTitle, 'Software Developer');

  // Level 10: 4000+ XP
  const lvl10 = calculateLevel(5000);
  assert.equal(lvl10.level, 10);
  assert.equal(lvl10.rankTitle, 'Grandmaster');
});

test('Leaderboard Privacy: masks student names correctly without exposing private PII', () => {
  assert.equal(formatLeaderboardName('Aman Deep'), 'Aman D.');
  assert.equal(formatLeaderboardName('Priya Sharma'), 'Priya S.');
  assert.equal(formatLeaderboardName('Rohit'), 'Rohit');
  assert.equal(formatLeaderboardName('Harpreet Kaur Gill'), 'Harpreet G.');
});

test('Badges Catalog: contains all user-specified required achievements', () => {
  const ids = BADGES_CATALOG.map((b) => b.id);
  assert.ok(ids.includes('quiz_master'), 'Quiz Master badge present');
  assert.ok(ids.includes('streak_7_days'), '7-Day Streak badge present');
  assert.ok(ids.includes('coding_starter'), 'Coding Starter badge present');
  assert.ok(ids.includes('semester_champion'), 'Semester Champion badge present');
  assert.ok(ids.includes('project_builder'), 'Project Builder badge present');
  assert.ok(ids.includes('first_step'), 'First Step badge present');
});

test('DailyGoal Model: validates daily goals and tasks structure', () => {
  const goalRecord = new DailyGoal({
    studentId: '507f1f77bcf86cd799439011',
    date: '2026-11-18',
    goals: [
      {
        id: 'dg-1',
        title: 'Complete 2 lessons in Data Structures',
        category: 'lesson',
        targetCount: 2,
        completedCount: 1,
        isCompleted: false,
        xpValue: 20
      },
      {
        id: 'dg-2',
        title: 'Solve 1 coding challenge in C++',
        category: 'coding',
        targetCount: 1,
        completedCount: 1,
        isCompleted: true,
        xpValue: 25
      }
    ],
    totalGoals: 2,
    completedGoals: 1,
    progressPercent: 50,
    allCompleted: false
  });

  const err = goalRecord.validateSync();
  assert.equal(err, undefined);
  assert.equal(goalRecord.goals.length, 2);
  assert.equal(goalRecord.completedGoals, 1);
  assert.equal(goalRecord.progressPercent, 50);
});
