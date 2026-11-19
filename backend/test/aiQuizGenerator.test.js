import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAIQuiz, gradeStoredQuizSubmission, retrieveSyllabusContext } from '../src/services/aiQuizGenerator.js';

test('AI Quiz Generator: retrieves official syllabus context before generation', () => {
  const context = retrieveSyllabusContext({
    semester: 1,
    subjectCode: '0610311011',
    unitNumber: 1
  });

  assert.equal(context.subject.name, 'Foundations of IT');
  assert.equal(context.subject.code, '0610311011');
  assert.equal(context.targetUnits.length, 1);
  assert.ok(context.targetTopics.length >= 4);
  assert.ok(context.summaryContext.includes('Foundations of IT'));
});

test('AI Quiz Generator: generates requested questions and sanitizes answers for client', async () => {
  const { storedQuiz, sanitizedQuiz } = await generateAIQuiz({
    semester: 1,
    subjectCode: '0610311011',
    unitNumber: 1,
    difficulty: 'mixed',
    questionCount: 10,
    questionTypes: ['mcq', 'true_false', 'short_answer']
  });

  assert.equal(storedQuiz.questions.length, 10, 'Must generate exactly 10 questions in stored quiz');
  assert.equal(sanitizedQuiz.questions.length, 10, 'Must generate exactly 10 questions in sanitized quiz');
  assert.equal(storedQuiz.subjectCode, '0610311011');
  assert.equal(storedQuiz.semester, 1);

  // CRITICAL SECURITY TEST: sanitizedQuiz questions must NEVER reveal answers before submission
  sanitizedQuiz.questions.forEach((q, idx) => {
    assert.equal(q.correctOption, undefined, `Sanitized Q #${idx + 1} must NOT expose correctOption`);
    assert.equal(q.correctAnswer, undefined, `Sanitized Q #${idx + 1} must NOT expose correctAnswer`);
    assert.equal(q.modelAnswer, undefined, `Sanitized Q #${idx + 1} must NOT expose modelAnswer`);
    assert.equal(q.explanation, undefined, `Sanitized Q #${idx + 1} must NOT expose explanation`);
  });

  // Backend storedQuiz questions MUST have complete answer keys
  storedQuiz.questions.forEach((q, idx) => {
    assert.ok(q.id, `Stored Q #${idx + 1} must have an ID`);
    assert.ok(['mcq', 'true_false', 'short_answer'].includes(q.type));
    assert.ok(q.prompt && q.prompt.length > 10);
    assert.ok(['easy', 'medium', 'hard'].includes(q.difficulty));
    assert.ok(q.topicReference);

    if (q.type === 'mcq') {
      assert.equal(q.options.length, 4);
      assert.ok(q.correctOption >= 0 && q.correctOption < 4);
      assert.ok(q.explanation && q.explanation.length > 10);
    } else if (q.type === 'true_false') {
      assert.equal(typeof q.correctAnswer, 'boolean');
      assert.ok(q.explanation && q.explanation.length > 10);
    } else if (q.type === 'short_answer') {
      assert.ok(q.modelAnswer && q.modelAnswer.length > 20);
      assert.ok(Array.isArray(q.rubricCriteria) && q.rubricCriteria.length > 0);
    }
  });
});

test('AI Quiz Generator: backend authoritative grading evaluates submissions accurately', async () => {
  const { storedQuiz } = await generateAIQuiz({
    semester: 2,
    subjectCode: '0610321041',
    unitNumber: 1,
    difficulty: 'easy',
    questionCount: 5,
    questionTypes: ['mcq', 'true_false']
  });

  // Simulate perfect student answers matching the backend answer key
  const perfectAnswers = {};
  storedQuiz.questions.forEach((q) => {
    if (q.type === 'mcq') perfectAnswers[q.id] = q.correctOption;
    else if (q.type === 'true_false') perfectAnswers[q.id] = q.correctAnswer;
  });

  const graded = gradeStoredQuizSubmission(storedQuiz, perfectAnswers);
  assert.equal(graded.score, 100, 'Perfect answers must result in 100% score');
  assert.equal(graded.correctCount, 5);
  assert.equal(graded.passed, true);
  assert.equal(graded.questionResults.length, 5);

  // Graded results must now include the full explanation and answer breakdown
  graded.questionResults.forEach((r) => {
    assert.equal(r.isCorrect, true);
    assert.ok(r.explanation && r.explanation.length > 10);
  });
});

test('AI Quiz Generator: handles topic-specific filtering and question counts', async () => {
  const { storedQuiz } = await generateAIQuiz({
    semester: 3,
    subjectCode: '0610331071',
    unitNumber: 1,
    topic: 'Process scheduling',
    difficulty: 'hard',
    questionCount: 5,
    questionTypes: ['mcq']
  });

  assert.equal(storedQuiz.questions.length, 5);
  storedQuiz.questions.forEach((q) => {
    assert.equal(q.difficulty, 'hard');
    assert.equal(q.type, 'mcq');
  });

  const { storedQuiz: quiz20 } = await generateAIQuiz({
    semester: 5,
    subjectCode: 'BCA 301',
    questionCount: 20
  });
  assert.equal(quiz20.questions.length, 20);
});
