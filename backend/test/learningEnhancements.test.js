import test from 'node:test';
import assert from 'node:assert/strict';
import LessonProgress from '../src/models/LessonProgress.js';
import LearningActivity from '../src/models/LearningActivity.js';
import UserLearningState from '../src/models/UserLearningState.js';

test('LessonProgress schema includes notes, bookmarks, and difficult flags', () => {
  const schema = LessonProgress.schema.obj;
  assert.ok('isBookmarked' in schema, 'isBookmarked field exists');
  assert.ok('isDifficult' in schema, 'isDifficult field exists');
  assert.ok('note' in schema, 'note field exists');
  assert.ok('notesUpdatedAt' in schema, 'notesUpdatedAt field exists');
});

test('LearningActivity schema validates required activity types', () => {
  const schema = LearningActivity.schema.obj;
  assert.ok(schema.activityType, 'activityType field exists');
  const allowed = schema.activityType.enum;
  assert.ok(allowed.includes('lesson_completed'), 'includes lesson_completed');
  assert.ok(allowed.includes('note_saved'), 'includes note_saved');
  assert.ok(allowed.includes('lesson_bookmarked'), 'includes lesson_bookmarked');
  assert.ok(allowed.includes('marked_difficult'), 'includes marked_difficult');
  assert.ok(allowed.includes('certificate_earned'), 'includes certificate_earned');
});

test('UserLearningState schema supports streak and certificates', () => {
  const schema = UserLearningState.schema.obj;
  assert.ok(schema.streak, 'streak field exists');
  assert.ok(schema.achievements, 'achievements field exists');
  assert.ok(schema.certificates, 'certificates field exists');
});
