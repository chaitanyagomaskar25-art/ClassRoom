const test = require('node:test');
const assert = require('node:assert/strict');
const gradeQuiz = require('../src/utils/quizScoring');

const questions = [{ correctOption: 1 }, { correctOption: 0 }, { correctOption: 2 }];

test('grades a fully correct quiz', () => {
  assert.deepEqual(gradeQuiz(questions, [1, 0, 2]), {
    correctCount: 3, totalQuestions: 3, score: 100
  });
});

test('calculates a rounded percentage for partially correct answers', () => {
  assert.deepEqual(gradeQuiz(questions, [0, 0, 2]), {
    correctCount: 2, totalQuestions: 3, score: 67
  });
});

test('returns zero for an unanswered quiz', () => {
  assert.deepEqual(gradeQuiz(questions, [0, 1, 0]), {
    correctCount: 0, totalQuestions: 3, score: 0
  });
});

test('handles a quiz without questions', () => {
  assert.deepEqual(gradeQuiz([], []), { correctCount: 0, totalQuestions: 0, score: 0 });
});
