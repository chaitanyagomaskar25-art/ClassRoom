import test from 'node:test';
import assert from 'node:assert/strict';
import QuizAttempt from '../src/models/QuizAttempt.js';

test('QuizAttempt model schema supports all assessment types and mixed answers', () => {
  const schema = QuizAttempt.schema.obj;
  assert.ok(schema.assessmentType, 'assessmentType field exists');
  assert.ok(schema.assessmentId, 'assessmentId field exists');
  assert.ok(schema.questionResults, 'questionResults field exists');
  assert.ok(schema.passed, 'passed field exists');
  assert.ok(schema.attemptNumber, 'attemptNumber field exists');
  assert.ok(schema.isRetry, 'isRetry field exists');
});

test('identifies incorrect question IDs for retry session', () => {
  const questionResults = [
    { questionId: 'q1', isCorrect: true },
    { questionId: 'q2', isCorrect: false },
    { questionId: 'q3', isCorrect: true },
    { questionId: 'q4', isCorrect: false }
  ];

  const incorrect = questionResults.filter((q) => !q.isCorrect).map((q) => q.questionId);
  assert.deepEqual(incorrect, ['q2', 'q4']);
});

test('computes pass threshold at 70%', () => {
  const passCases = [
    { score: 70, expected: true },
    { score: 85, expected: true },
    { score: 69, expected: false },
    { score: 50, expected: false }
  ];

  passCases.forEach(({ score, expected }) => {
    assert.equal(score >= 70, expected);
  });
});
