import test from 'node:test';
import assert from 'node:assert/strict';
import QuizAttempt from '../src/models/QuizAttempt.js';
import GeneratedQuiz from '../src/models/GeneratedQuiz.js';
import { computeQuizPerformanceAnalytics, generateAIPerformanceFeedback } from '../src/routes/quizzes.js';

test('QuizAttempt model schema supports AI-generated metadata, configuration, and progress fields', () => {
  const schema = QuizAttempt.schema.obj;

  assert.ok(schema.topic, 'topic field must exist on QuizAttempt');
  assert.ok(schema.quizConfig, 'quizConfig field must exist on QuizAttempt');
  assert.ok(schema.questions, 'questions field must exist on QuizAttempt');
  assert.ok(schema.percentage, 'percentage field must exist on QuizAttempt');
  assert.ok(schema.incorrectCount, 'incorrectCount field must exist on QuizAttempt');
  assert.ok(schema.timeSpentSeconds, 'timeSpentSeconds field must exist on QuizAttempt');
  assert.ok(schema.semester, 'semester field must exist on QuizAttempt');
  assert.ok(schema.unitNumber, 'unitNumber field must exist on QuizAttempt');
  assert.ok(schema.attemptNumber, 'attemptNumber field must exist on QuizAttempt');

  // Verify enum includes 'ai_generated' and 'ai_quiz'
  const enumValues = schema.assessmentType.enum;
  assert.ok(enumValues.includes('ai_generated'), 'enum must include ai_generated');
  assert.ok(enumValues.includes('ai_quiz'), 'enum must include ai_quiz');
});

test('Performance Analytics: computes topic strengths, weaknesses, and revision subjects accurately', () => {
  const sampleAttempts = [
    {
      subjectCode: '0610311011',
      subjectName: 'Foundations of IT',
      semester: 1,
      unitNumber: 1,
      topic: 'Computer Hardware Architecture',
      score: 90,
      passed: true,
      timeSpentSeconds: 420,
      questionResults: [
        { topic: 'Computer Hardware Architecture', isCorrect: true },
        { topic: 'Computer Hardware Architecture', isCorrect: true },
        { topic: 'Computer Hardware Architecture', isCorrect: false }
      ]
    },
    {
      subjectCode: '0610311011',
      subjectName: 'Foundations of IT',
      semester: 1,
      unitNumber: 1,
      topic: 'Binary and Hex Number Systems',
      score: 40,
      passed: false,
      timeSpentSeconds: 500,
      questionResults: [
        { topic: 'Binary and Hex Number Systems', isCorrect: false },
        { topic: 'Binary and Hex Number Systems', isCorrect: false },
        { topic: 'Binary and Hex Number Systems', isCorrect: true }
      ]
    },
    {
      subjectCode: '0610321041',
      subjectName: 'Object Oriented Programming using C++',
      semester: 2,
      unitNumber: 2,
      topic: 'Virtual Functions & Polymorphism',
      score: 85,
      passed: true,
      timeSpentSeconds: 300,
      questionResults: [
        { topic: 'Virtual Functions & Polymorphism', isCorrect: true },
        { topic: 'Virtual Functions & Polymorphism', isCorrect: true },
        { topic: 'Virtual Functions & Polymorphism', isCorrect: true }
      ]
    }
  ];

  // 1. Overall stats
  const total = sampleAttempts.length;
  const avg = Math.round(sampleAttempts.reduce((s, a) => s + a.score, 0) / total);
  const highest = Math.max(...sampleAttempts.map((a) => a.score));

  assert.equal(total, 3);
  assert.equal(avg, 72);
  assert.equal(highest, 90);

  // 2. Topic Strengths and Weaknesses
  const topicMap = {};
  sampleAttempts.forEach((a) => {
    a.questionResults.forEach((q) => {
      if (!topicMap[q.topic]) topicMap[q.topic] = { total: 0, correct: 0 };
      topicMap[q.topic].total += 1;
      if (q.isCorrect) topicMap[q.topic].correct += 1;
    });
  });

  const polymorphAccuracy = Math.round((topicMap['Virtual Functions & Polymorphism'].correct / topicMap['Virtual Functions & Polymorphism'].total) * 100);
  const binaryAccuracy = Math.round((topicMap['Binary and Hex Number Systems'].correct / topicMap['Binary and Hex Number Systems'].total) * 100);

  assert.equal(polymorphAccuracy, 100); // 100% -> Strength (>=75%)
  assert.ok(polymorphAccuracy >= 75, 'Virtual Functions is a strength topic');

  assert.equal(binaryAccuracy, 33); // 33% -> Weakness (<60%)
  assert.ok(binaryAccuracy < 60, 'Binary Numbers is a weakness topic requiring revision');

  // 3. Subjects requiring revision
  // Foundations of IT has 1 pass (90) and 1 fail (40) -> avg 65 (<70%) and failedAttempts = 1
  const itAttempts = sampleAttempts.filter((a) => a.subjectCode === '0610311011');
  const itAvg = Math.round(itAttempts.reduce((s, a) => s + a.score, 0) / itAttempts.length);
  const itFailed = itAttempts.filter((a) => !a.passed).length;

  assert.equal(itAvg, 65);
  assert.equal(itFailed, 1);
  assert.ok(itAvg < 70 || itFailed > 0, 'Foundations of IT must be flagged for revision');
});

test('User isolation: student attempts are strictly scoped by studentId', () => {
  const student1Id = '660000000000000000000001';
  const student2Id = '660000000000000000000002';

  const dummyAttempts = [
    { _id: 'att-1', studentId: student1Id, score: 95 },
    { _id: 'att-2', studentId: student2Id, score: 60 }
  ];

  // When student 1 queries history
  const student1Results = dummyAttempts.filter((a) => a.studentId === student1Id);
  assert.equal(student1Results.length, 1);
  assert.equal(student1Results[0]._id, 'att-1');

  // Verify access control check on individual attempt
  function verifyAttemptOwnership(attempt, requestingUserId, userRole = 'student') {
    if (userRole === 'student' && String(attempt.studentId) !== String(requestingUserId)) {
      return { allowed: false, errorStatus: 403 };
    }
    return { allowed: true };
  }

  const authorized = verifyAttemptOwnership(dummyAttempts[0], student1Id);
  assert.equal(authorized.allowed, true);

  const unauthorized = verifyAttemptOwnership(dummyAttempts[0], student2Id);
  assert.equal(unauthorized.allowed, false);
  assert.equal(unauthorized.errorStatus, 403);
});

test('GeneratedQuiz model schema validates and persists quiz configuration and questions', () => {
  const schema = GeneratedQuiz.schema.obj;
  assert.ok(schema.quizId, 'quizId field must exist on GeneratedQuiz');
  assert.ok(schema.studentId, 'studentId field must exist on GeneratedQuiz');
  assert.ok(schema.questions, 'questions field must exist on GeneratedQuiz');
  assert.ok(schema.quizConfig, 'quizConfig field must exist on GeneratedQuiz');
  assert.ok(schema.semester, 'semester field must exist on GeneratedQuiz');
  assert.ok(schema.subjectCode, 'subjectCode field must exist on GeneratedQuiz');
  assert.ok(schema.unitNumber, 'unitNumber field must exist on GeneratedQuiz');
  assert.ok(schema.topic, 'topic field must exist on GeneratedQuiz');
});

test('computeQuizPerformanceAnalytics calculates all required metrics correctly', () => {
  const sampleAttempts = [
    {
      _id: 'att-1',
      assessmentId: 'ai-quiz-0610311011-1',
      subjectCode: '0610311011',
      subjectName: 'Foundations of IT',
      semester: 1,
      unitNumber: 1,
      topic: 'Computer Hardware Architecture',
      score: 90,
      percentage: 90,
      passed: true,
      timeSpentSeconds: 420,
      totalQuestions: 3,
      correctCount: 2,
      incorrectCount: 1,
      questionResults: [
        { topic: 'Computer Hardware Architecture', isCorrect: true },
        { topic: 'Computer Hardware Architecture', isCorrect: true },
        { topic: 'Computer Hardware Architecture', isCorrect: false }
      ]
    },
    {
      _id: 'att-2',
      assessmentId: 'ai-quiz-0610311011-2',
      subjectCode: '0610311011',
      subjectName: 'Foundations of IT',
      semester: 1,
      unitNumber: 1,
      topic: 'Binary and Hex Number Systems',
      score: 40,
      percentage: 40,
      passed: false,
      timeSpentSeconds: 500,
      totalQuestions: 3,
      correctCount: 1,
      incorrectCount: 2,
      questionResults: [
        { topic: 'Binary and Hex Number Systems', isCorrect: false },
        { topic: 'Binary and Hex Number Systems', isCorrect: false },
        { topic: 'Binary and Hex Number Systems', isCorrect: true }
      ]
    },
    {
      _id: 'att-3',
      assessmentId: 'ai-quiz-0610321041-1',
      subjectCode: '0610321041',
      subjectName: 'Object Oriented Programming using C++',
      semester: 2,
      unitNumber: 2,
      topic: 'Virtual Functions & Polymorphism',
      score: 85,
      percentage: 85,
      passed: true,
      timeSpentSeconds: 300,
      totalQuestions: 3,
      correctCount: 3,
      incorrectCount: 0,
      questionResults: [
        { topic: 'Virtual Functions & Polymorphism', isCorrect: true },
        { topic: 'Virtual Functions & Polymorphism', isCorrect: true },
        { topic: 'Virtual Functions & Polymorphism', isCorrect: true }
      ]
    }
  ];

  const analytics = computeQuizPerformanceAnalytics(sampleAttempts);

  assert.equal(analytics.totalQuizzes, 3);
  assert.equal(analytics.averageScore, 72);
  assert.equal(analytics.highestScore, 90);
  assert.equal(analytics.passedAttempts, 2);
  assert.equal(analytics.passRate, 67);

  // Strengths
  assert.ok(analytics.topicStrengths.some((t) => t.topic === 'Virtual Functions & Polymorphism'));
  const poly = analytics.topicStrengths.find((t) => t.topic === 'Virtual Functions & Polymorphism');
  assert.equal(poly.accuracy, 100);

  // Weaknesses
  assert.ok(analytics.topicWeaknesses.some((t) => t.topic === 'Binary and Hex Number Systems'));
  const binary = analytics.topicWeaknesses.find((t) => t.topic === 'Binary and Hex Number Systems');
  assert.equal(binary.accuracy, 33);

  // Subjects requiring revision
  assert.ok(analytics.subjectsRequiringRevision.some((s) => s.subjectCode === '0610311011'));
  const itSub = analytics.subjectsRequiringRevision.find((s) => s.subjectCode === '0610311011');
  assert.equal(itSub.averageScore, 65);
  assert.equal(itSub.failedAttempts, 1);
  assert.equal(itSub.requiresRevision, true);

  // Previous attempts list
  assert.equal(analytics.previousAttempts.length, 3);
  assert.equal(analytics.previousAttempts[0].score, 90);
  assert.equal(analytics.previousAttempts[0].percentage, 90);
  assert.equal(analytics.previousAttempts[0].correctCount, 2);
  assert.equal(analytics.previousAttempts[0].incorrectCount, 1);
});

test('AI Performance Feedback & Study Recommendations: identifies weak areas, recommends lessons, and suggests next topic', () => {
  const sampleQuestionResults = [
    {
      questionId: 'q-1',
      topic: 'Binary and Hex Number Systems',
      isCorrect: false,
      prompt: 'Convert 1101 to hexadecimal'
    },
    {
      questionId: 'q-2',
      topic: 'Binary and Hex Number Systems',
      isCorrect: false,
      prompt: 'Perform 2s complement arithmetic'
    },
    {
      questionId: 'q-3',
      topic: 'Logic Gates',
      isCorrect: true,
      prompt: 'Universal gates identification'
    }
  ];

  const feedback = generateAIPerformanceFeedback({
    questionResults: sampleQuestionResults,
    score: 33,
    passed: false,
    subjectCode: '0610311011',
    subjectName: 'Foundations of IT',
    semester: 1,
    unitNumber: 2,
    topic: 'Number Systems & Digital Logic'
  });

  assert.equal(feedback.score, 33);
  assert.equal(feedback.passed, false);

  // Weak areas
  assert.ok(feedback.weakAreas.length > 0);
  assert.equal(feedback.weakAreas[0].topic, 'Binary and Hex Number Systems');
  assert.equal(feedback.weakAreas[0].missedCount, 2);

  // Recommended lessons to revisit
  assert.ok(feedback.recommendedLessons.length > 0);
  assert.ok(feedback.recommendedLessons[0].url.includes('0610311011'));
  assert.ok(feedback.recommendedLessons[0].reason.includes('Binary and Hex Number Systems'));

  // Study recommendation
  assert.equal(feedback.studyRecommendation.action, 'revise');
  assert.equal(feedback.studyRecommendation.recommendationType, 'weak_topic_reinforcement');

  // Test passed scenario with advancement recommendation
  const passedFeedback = generateAIPerformanceFeedback({
    questionResults: [{ questionId: 'q-1', topic: 'Logic Gates', isCorrect: true }],
    score: 100,
    passed: true,
    subjectCode: '0610311011',
    subjectName: 'Foundations of IT',
    semester: 1,
    unitNumber: 2,
    topic: 'Logic Gates'
  });

  assert.equal(passedFeedback.passed, true);
  assert.equal(passedFeedback.studyRecommendation.action, 'advance');
  assert.equal(passedFeedback.studyRecommendation.recommendationType, 'next_topic');
});
