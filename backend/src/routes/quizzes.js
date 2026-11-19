import express from 'express';
import { z } from 'zod';
import Lesson from '../models/Lesson.js';
import QuizAttempt from '../models/QuizAttempt.js';
import LessonProgress from '../models/LessonProgress.js';
import { authenticate, allowRoles } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import validate from '../utils/validation.js';
import HttpError from '../utils/httpError.js';
import gradeQuiz from '../utils/quizScoring.js';
import GeneratedQuiz from '../models/GeneratedQuiz.js';
import MentorQuiz from '../models/MentorQuiz.js';
import User from '../models/User.js';
import { generateAIQuiz, gradeStoredQuizSubmission } from '../services/aiQuizGenerator.js';
import { updateUserStreak, checkAndAwardAchievement, logLearningActivity } from './progress.js';
import { getSubjectByCode, officialSyllabus } from '../config/syllabusContext.js';
import { awardXP, checkAndUnlockBadges } from '../services/gamificationService.js';

const router = express.Router();

const attemptSchema = z.object({
  answers: z.array(z.number().int().nonnegative()).min(1).max(100)
});

async function submitAttempt(lessonId, answers, studentId, res) {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw new HttpError(404, 'Lesson not found');
  if (!lesson.quiz.length) throw new HttpError(400, 'This lesson has no quiz');
  if (answers.length !== lesson.quiz.length) {
    throw new HttpError(400, 'Submit exactly one answer for each question');
  }
  lesson.quiz.forEach((question, index) => {
    if (answers[index] >= question.options.length) {
      throw new HttpError(400, `Answer ${index + 1} is not a valid option`);
    }
  });
  const { correctCount, score } = gradeQuiz(lesson.quiz, answers);
  const attempt = await QuizAttempt.create({
    studentId,
    lessonId: lesson.id,
    assessmentId: lesson.id,
    assessmentType: 'topic_quiz',
    lessonTitle: lesson.title,
    answers,
    score,
    correctCount,
    totalQuestions: lesson.quiz.length,
    passed: score >= 70
  });
  const earnedXp = score >= 90 ? 30 : 20;
  await awardXP(studentId, earnedXp, 'quiz_attempt');
  await checkAndUnlockBadges(studentId);
  res.status(201).json({
    data: {
      attempt,
      results: lesson.quiz.map((question, index) => ({
        questionIndex: index,
        correct: question.correctOption === answers[index],
        ...(question.explanation ? { explanation: question.explanation } : {})
      }))
    }
  });
}

// ---------------------------------------------------------
// ---------------------------------------------------------
// Adaptive Difficulty Engine
// ---------------------------------------------------------

/**
 * Automatically increases or decreases question difficulty based on student's previous performance.
 */
export async function resolveAdaptiveDifficulty(studentId, subjectCode = '', topic = '') {
  const query = { studentId };
  if (subjectCode) query.subjectCode = subjectCode;

  const pastAttempts = await QuizAttempt.find(query).sort({ createdAt: -1 }).limit(10).lean();
  if (!pastAttempts || pastAttempts.length === 0) {
    return {
      difficulty: 'medium',
      priorAverageScore: 0,
      attemptsAnalyzed: 0,
      reason: 'No prior attempts found for this subject. Baseline Medium difficulty applied.'
    };
  }

  const avgScore = Math.round(
    pastAttempts.reduce((sum, a) => sum + (Number(a.score) || 0), 0) / pastAttempts.length
  );

  if (avgScore >= 80) {
    return {
      difficulty: 'hard',
      priorAverageScore: avgScore,
      attemptsAnalyzed: pastAttempts.length,
      reason: `High mastery demonstrated (${avgScore}% historical average). Difficulty escalated to Hard for academic challenge.`
    };
  } else if (avgScore < 60) {
    return {
      difficulty: 'easy',
      priorAverageScore: avgScore,
      attemptsAnalyzed: pastAttempts.length,
      reason: `Needs conceptual reinforcement (${avgScore}% historical average). Difficulty calibrated to Easy to rebuild foundational mastery.`
    };
  } else {
    return {
      difficulty: 'medium',
      priorAverageScore: avgScore,
      attemptsAnalyzed: pastAttempts.length,
      reason: `Consistent foundational knowledge (${avgScore}% historical average). Standard Medium difficulty applied.`
    };
  }
}

// ---------------------------------------------------------
// AI Performance Feedback & Recommendations Engine
// ---------------------------------------------------------

/**
 * Synthesizes qualitative AI performance feedback, identifies weak areas, recommends lessons to revisit,
 * and suggests the next study topic based on quiz performance.
 */
export function generateAIPerformanceFeedback({
  questionResults = [],
  score = 0,
  passed = false,
  subjectCode = '',
  subjectName = '',
  semester = 1,
  unitNumber = 1,
  topic = ''
}) {
  const incorrectQuestions = (questionResults || []).filter((q) => !q.isCorrect);

  // Group missed concepts by topic
  const missedTopicMap = {};
  incorrectQuestions.forEach((q) => {
    const t = q.topic || q.topicReference || topic || 'General Concept';
    if (!missedTopicMap[t]) {
      missedTopicMap[t] = { topic: t, count: 0, prompts: [] };
    }
    missedTopicMap[t].count += 1;
    if (q.prompt) missedTopicMap[t].prompts.push(q.prompt);
  });

  const weakAreas = Object.values(missedTopicMap).map((w) => ({
    topic: w.topic,
    missedCount: w.count,
    accuracy: questionResults.length > 0
      ? Math.round(((questionResults.length - w.count) / questionResults.length) * 100)
      : 0,
    sampleMissedPrompt: w.prompts[0] || ''
  }));

  // Resolve curriculum lessons to revisit
  const resolvedUnit = Number(unitNumber) || 1;
  const recommendedLessons = [];

  if (weakAreas.length > 0) {
    weakAreas.slice(0, 3).forEach((w, idx) => {
      const lessonSeq = Math.min(4, idx + 1);
      const lessonId = `${subjectCode || 'sub'}-u${resolvedUnit}-l${lessonSeq}`;
      recommendedLessons.push({
        lessonId,
        title: `${subjectName || 'Course'} Unit ${resolvedUnit} Lesson ${lessonSeq}: ${w.topic}`,
        topic: w.topic,
        subjectCode,
        subjectName,
        semester,
        unitNumber: resolvedUnit,
        url: `/learning/${subjectCode}?lesson=${lessonId}`,
        reason: `Missed ${w.missedCount} question(s) on "${w.topic}". Revisit this module to consolidate foundational principles.`
      });
    });
  } else {
    // If 100% correct, recommend advancing to next unit
    const nextUnit = resolvedUnit < 4 ? resolvedUnit + 1 : 4;
    const nextLessonId = `${subjectCode}-u${nextUnit}-l1`;
    recommendedLessons.push({
      lessonId: nextLessonId,
      title: `${subjectName} Unit ${nextUnit} Core Module`,
      topic: `Unit ${nextUnit} Foundations`,
      subjectCode,
      subjectName,
      semester,
      unitNumber: nextUnit,
      url: `/learning/${subjectCode}?lesson=${nextLessonId}`,
      reason: 'Excellent mastery! Ready to tackle the next higher-order course unit.'
    });
  }

  // Qualitative Overall Assessment
  let overallAssessment = '';
  if (score >= 90) {
    overallAssessment = `Exemplary performance! You demonstrated outstanding comprehension across ${subjectName || 'this subject'}. Your conceptual accuracy and problem-solving execution are well above university distinction benchmarks.`;
  } else if (score >= 70) {
    overallAssessment = `Solid academic performance. You met the passing standards for ${subjectName || 'this module'}. Addressing your minor gaps in ${weakAreas.map((w) => w.topic).join(', ') || 'technical details'} will elevate your mastery to distinction.`;
  } else if (score >= 50) {
    overallAssessment = `Developing understanding. While you answered several core questions correctly, critical conceptual gaps were identified in ${weakAreas.map((w) => w.topic).join(', ') || 'this unit'}. Targeted review is strongly recommended before advancing.`;
  } else {
    overallAssessment = `Foundational review required. Your quiz indicates significant difficulty with core principles in ${weakAreas.map((w) => w.topic).join(', ') || 'this assessment'}. Please revisit the recommended lesson modules below before re-attempting.`;
  }

  // Next Step Study Recommendation
  let studyRecommendation = {};
  if (passed) {
    const nextUnit = resolvedUnit < 4 ? resolvedUnit + 1 : resolvedUnit;
    studyRecommendation = {
      action: 'advance',
      recommendationType: 'next_topic',
      title: resolvedUnit < 4 ? `Advance to Unit ${nextUnit}` : 'Complete Subject Mastery Revision',
      description: `With a passing score of ${score}%, you are prepared to advance to the next syllabus module in ${subjectName}.`,
      targetTopic: `Unit ${nextUnit} Objectives`,
      suggestedAction: 'Start Next Lesson',
      url: `/learning/${subjectCode}`
    };
  } else {
    studyRecommendation = {
      action: 'revise',
      recommendationType: 'weak_topic_reinforcement',
      title: `Reinforce ${weakAreas[0]?.topic || 'Core Foundations'}`,
      description: `Your score (${score}%) suggests reviewing key syllabus objectives in ${weakAreas.map((w) => w.topic).slice(0, 2).join(' and ') || 'this unit'} before retrying.`,
      targetTopic: weakAreas[0]?.topic || 'Foundational Concepts',
      suggestedAction: 'Review Lesson & Retry',
      url: `/learning/${subjectCode}`
    };
  }

  return {
    score,
    passed,
    overallAssessment,
    weakAreas,
    recommendedLessons,
    studyRecommendation
  };
}

// ---------------------------------------------------------
// AI-Powered Quiz Generator Endpoints
// ---------------------------------------------------------

const generateAISchema = z.object({
  semester: z.number().int().min(1).max(6).optional().default(1),
  subjectCode: z.string().optional().default(''),
  subjectName: z.string().optional().default(''),
  unitNumber: z.union([z.number().int().min(1).max(4), z.string()]).optional().default('all'),
  topic: z.string().optional().default(''),
  difficulty: z.enum(['easy', 'medium', 'hard', 'mixed', 'adaptive']).optional().default('mixed'),
  questionCount: z.number().int().min(5).max(30).optional().default(10),
  questionTypes: z.array(z.enum(['mcq', 'multiple_answer', 'true_false', 'short_answer', 'code'])).optional().default(['mcq', 'true_false', 'short_answer']),
  mode: z.enum(['custom', 'weak_topics', 'revision', 'exam_prep', 'retry', 'adaptive']).optional().default('custom')
});

/**
 * POST /quizzes/generate-ai
 * Generates an AI-powered custom quiz strictly based on official syllabus & lesson content.
 * Supports Custom Quiz configuration and Adaptive Difficulty based on historical attempts.
 */
router.post('/generate-ai', authenticate, allowRoles('student', 'mentor', 'admin'), asyncHandler(async (req, res) => {
  const params = generateAISchema.parse(req.body);
  const studentId = req.user?.id || req.user?._id;

  if (req.user?.role === 'student' && req.user?.semester) {
    const studentSem = Number(req.user.semester);
    if (params.semester && Number(params.semester) !== studentSem) {
      throw new HttpError(403, `Cannot generate quiz for Semester ${params.semester}. Your enrolled semester is Semester ${studentSem}. Content for other semesters is locked.`);
    }
    params.semester = studentSem;
  }

  let chosenDifficulty = params.difficulty;
  let adaptiveInfo = null;

  // Adaptive Difficulty Resolution
  if (params.difficulty === 'adaptive' || params.mode === 'adaptive') {
    adaptiveInfo = await resolveAdaptiveDifficulty(studentId, params.subjectCode, params.topic);
    chosenDifficulty = adaptiveInfo.difficulty;
  }

  const { storedQuiz, sanitizedQuiz } = await generateAIQuiz({
    ...params,
    difficulty: chosenDifficulty,
    adaptiveInfo,
    quizConfig: {
      mode: params.mode || 'custom',
      ...(adaptiveInfo ? { adaptiveDifficulty: adaptiveInfo } : {})
    },
    studentId
  });

  // Store in database with full answer key
  try {
    await GeneratedQuiz.create(storedQuiz);
  } catch (dbErr) {
    console.warn('Could not persist GeneratedQuiz to database (proceeding with memory session):', dbErr.message);
  }

  // Return sanitized quiz to frontend (no correctOption, correctAnswer, modelAnswer, explanation)
  res.json({ data: { quiz: sanitizedQuiz, adaptiveInfo } });
}));

/**
 * POST /quizzes/generate-weak-topics
 * Feature 1: Weak Topic Quiz
 * Automatically generates quizzes from topics where the student performs poorly (<60% accuracy or missed questions).
 */
router.post('/generate-weak-topics', authenticate, allowRoles('student', 'mentor', 'admin'), asyncHandler(async (req, res) => {
  const studentId = req.user?.id || req.user?._id;
  const { semester = 1, subjectCode = '', questionCount = 10, questionTypes = ['mcq', 'true_false', 'short_answer'] } = req.body;

  // 1. Pull student's historical attempts to discover weak topics
  const query = { studentId };
  if (subjectCode) query.subjectCode = subjectCode;
  const attempts = await QuizAttempt.find(query).sort({ createdAt: -1 }).limit(20).lean();

  const topicAccuracyMap = {};
  attempts.forEach((a) => {
    (a.questionResults || []).forEach((q) => {
      const topicName = (q.topic || q.topicReference || a.topic || '').trim();
      if (!topicName) return;
      if (!topicAccuracyMap[topicName]) {
        topicAccuracyMap[topicName] = { topic: topicName, total: 0, correct: 0, subjectCode: a.subjectCode, semester: a.semester };
      }
      topicAccuracyMap[topicName].total += 1;
      if (q.isCorrect) topicAccuracyMap[topicName].correct += 1;
    });
  });

  const weakTopicsList = Object.values(topicAccuracyMap)
    .map((t) => ({
      ...t,
      accuracy: Math.round((t.correct / t.total) * 100)
    }))
    .filter((t) => t.accuracy < 60 || t.total - t.correct >= 2)
    .sort((a, b) => a.accuracy - b.accuracy);

  // If student has identified weak topics, use them
  let targetTopic = '';
  let targetSubject = subjectCode;
  let targetSemester = Number(semester) || 1;
  if (req.user?.role === 'student' && req.user?.semester) {
    targetSemester = Number(req.user.semester);
  }
  let reinforcementNote = '';

  if (weakTopicsList.length > 0) {
    const primaryWeak = weakTopicsList[0];
    targetTopic = primaryWeak.topic;
    if (!targetSubject) targetSubject = primaryWeak.subjectCode;
    if (primaryWeak.semester) targetSemester = primaryWeak.semester;
    reinforcementNote = `Targeting your identified weak topic: "${targetTopic}" (${primaryWeak.accuracy}% accuracy in past attempts).`;
  } else {
    // If no past weak topics recorded, target foundational concepts in the subject
    reinforcementNote = 'No severe topic weaknesses detected yet. Generating foundational reinforcement quiz.';
  }

  const { storedQuiz, sanitizedQuiz } = await generateAIQuiz({
    semester: targetSemester,
    subjectCode: targetSubject,
    topic: targetTopic,
    unitNumber: 'all',
    difficulty: 'mixed',
    questionCount: Number(questionCount) || 10,
    questionTypes,
    studentId,
    title: targetTopic ? `Weak Topic Reinforcement: ${targetTopic}` : `Core Reinforcement Practice`,
    description: reinforcementNote,
    quizConfig: {
      mode: 'weak_topics',
      identifiedWeakTopics: weakTopicsList.map((w) => ({ topic: w.topic, accuracy: w.accuracy }))
    }
  });

  try {
    await GeneratedQuiz.create(storedQuiz);
  } catch (dbErr) {
    console.warn('Could not persist GeneratedQuiz:', dbErr.message);
  }

  res.json({
    data: {
      quiz: sanitizedQuiz,
      weakTopicsCount: weakTopicsList.length,
      targetedTopic: targetTopic,
      reinforcementNote
    }
  });
}));

/**
 * POST /quizzes/generate-revision
 * Feature 2: Revision Quiz
 * Automatically generates quizzes from previously completed lessons.
 */
router.post('/generate-revision', authenticate, allowRoles('student', 'mentor', 'admin'), asyncHandler(async (req, res) => {
  const studentId = req.user?.id || req.user?._id;
  const { semester = 1, subjectCode = '', questionCount = 10, questionTypes = ['mcq', 'true_false', 'short_answer'] } = req.body;

  // 1. Find lessons completed by this student
  const query = { studentId, status: 'completed' };
  if (subjectCode) query.subjectCode = subjectCode;
  const completedLessons = await LessonProgress.find(query).sort({ completedAt: -1 }).limit(16).lean();

  const completedLessonTitles = completedLessons.map((l) => l.lessonTitle || l.lessonId).filter(Boolean);
  const targetSubject = subjectCode || completedLessons[0]?.subjectCode || '';
  let targetSemester = Number(semester || completedLessons[0]?.semester) || 1;
  if (req.user?.role === 'student' && req.user?.semester) {
    targetSemester = Number(req.user.semester);
  }

  let revisionScopeNote = '';
  let targetTopic = '';

  if (completedLessonTitles.length > 0) {
    targetTopic = completedLessonTitles.slice(0, 3).join('; ');
    revisionScopeNote = `Spaced repetition revision synthesized from ${completedLessons.length} completed lessons in your coursework.`;
  } else {
    revisionScopeNote = 'No completed lessons recorded yet. Generating course review from active semester modules.';
  }

  const { storedQuiz, sanitizedQuiz } = await generateAIQuiz({
    semester: targetSemester,
    subjectCode: targetSubject,
    topic: targetTopic,
    unitNumber: 'all',
    difficulty: 'mixed',
    questionCount: Number(questionCount) || 10,
    questionTypes,
    studentId,
    title: `Cumulative Revision Quiz: ${targetSubject || `Sem ${targetSemester}`}`,
    description: revisionScopeNote,
    quizConfig: {
      mode: 'revision',
      completedLessonsCount: completedLessons.length,
      completedLessons: completedLessons.map((l) => ({ lessonId: l.lessonId, title: l.lessonTitle }))
    }
  });

  try {
    await GeneratedQuiz.create(storedQuiz);
  } catch (dbErr) {
    console.warn('Could not persist GeneratedQuiz:', dbErr.message);
  }

  res.json({
    data: {
      quiz: sanitizedQuiz,
      completedLessonsCount: completedLessons.length,
      revisionScopeNote
    }
  });
}));

/**
 * POST /quizzes/generate-exam-prep
 * Feature 3: Exam Preparation Mock Test
 * Creates mixed-unit mock tests for a selected subject spanning all 4 units with simulated exam conditions.
 */
router.post('/generate-exam-prep', authenticate, allowRoles('student', 'mentor', 'admin'), asyncHandler(async (req, res) => {
  const studentId = req.user?.id || req.user?._id;
  const { semester = 1, subjectCode = '', questionCount = 15 } = req.body;

  const count = Math.min(30, Math.max(10, Number(questionCount) || 15));
  let semNum = Number(semester) || 1;
  if (req.user?.role === 'student' && req.user?.semester) {
    semNum = Number(req.user.semester);
  }
  let subject = getSubjectByCode(subjectCode);

  if (!subject) {
    const semData = officialSyllabus.find((s) => s.semester === semNum);
    subject = semData?.subjects?.[0] || officialSyllabus[0].subjects[0];
  }

  const examTitle = `University Exam Mock Test: ${subject.name}`;
  const examDesc = `Comprehensive mixed-unit final exam preparation test spanning all 4 curriculum units for ${subject.name} (${subject.code}).`;

  const { storedQuiz, sanitizedQuiz } = await generateAIQuiz({
    semester: semNum,
    subjectCode: subject.code,
    subjectName: subject.name,
    unitNumber: 'all',
    topic: 'Comprehensive 4-Unit Syllabus Mock Examination',
    difficulty: 'mixed',
    questionCount: count,
    questionTypes: ['mcq', 'true_false', 'short_answer'],
    studentId,
    title: examTitle,
    description: examDesc,
    quizConfig: {
      mode: 'exam_prep',
      isExamMockTest: true,
      estimatedMinutes: Math.round(count * 2),
      passingPercentage: 70
    }
  });

  try {
    await GeneratedQuiz.create(storedQuiz);
  } catch (dbErr) {
    console.warn('Could not persist GeneratedQuiz:', dbErr.message);
  }

  res.json({
    data: {
      quiz: sanitizedQuiz,
      subjectCode: subject.code,
      subjectName: subject.name
    }
  });
}));

/**
 * POST /quizzes/generate-retry
 * Feature 5: Retry Incorrect Questions
 * Generates a new quiz focusing specifically on previously incorrect concepts.
 */
router.post('/generate-retry', authenticate, allowRoles('student', 'mentor', 'admin'), asyncHandler(async (req, res) => {
  const studentId = req.user?.id || req.user?._id;
  const { attemptId, questionCount = 10 } = req.body;

  let targetAttempt = null;
  if (attemptId) {
    targetAttempt = await QuizAttempt.findOne({ _id: attemptId, studentId }).lean();
  }
  if (!targetAttempt) {
    // Find most recent attempt with incorrect answers
    targetAttempt = await QuizAttempt.findOne({
      studentId,
      incorrectCount: { $gt: 0 }
    }).sort({ createdAt: -1 }).lean();
  }

  if (!targetAttempt) {
    throw new HttpError(404, 'No previous quiz attempts with incorrect questions found to retry.');
  }

  // Extract previously missed questions and topics
  const incorrectQuestions = (targetAttempt.questionResults || []).filter((q) => !q.isCorrect);
  const missedTopics = Array.from(new Set(
    incorrectQuestions.map((q) => (q.topic || q.topicReference || targetAttempt.topic || '').trim()).filter(Boolean)
  ));

  const targetTopic = missedTopics.join('; ') || targetAttempt.topic || 'Review Concepts';
  const retryCount = Math.min(20, Math.max(5, incorrectQuestions.length > 0 ? incorrectQuestions.length : Number(questionCount) || 10));

  const retryTitle = `Targeted Concept Retry: ${targetAttempt.lessonTitle || targetAttempt.subjectName}`;
  const retryDesc = `Personalized reinforcement assessment addressing ${incorrectQuestions.length} previously missed question concepts.`;

  const { storedQuiz, sanitizedQuiz } = await generateAIQuiz({
    semester: targetAttempt.semester || 1,
    subjectCode: targetAttempt.subjectCode,
    subjectName: targetAttempt.subjectName,
    unitNumber: targetAttempt.unitNumber || 'all',
    topic: targetTopic,
    difficulty: 'medium',
    questionCount: retryCount,
    questionTypes: ['mcq', 'true_false', 'short_answer'],
    studentId,
    title: retryTitle,
    description: retryDesc,
    quizConfig: {
      mode: 'retry',
      isRetry: true,
      parentAttemptId: targetAttempt._id,
      targetedMissedCount: incorrectQuestions.length,
      missedTopics
    }
  });

  try {
    await GeneratedQuiz.create(storedQuiz);
  } catch (dbErr) {
    console.warn('Could not persist GeneratedQuiz:', dbErr.message);
  }

  res.json({
    data: {
      quiz: sanitizedQuiz,
      parentAttemptId: targetAttempt._id,
      missedConceptsCount: incorrectQuestions.length,
      missedTopics
    }
  });
}));

/**
 * GET /quizzes/study-recommendations
 * Feature 8: Study Recommendations
 * Suggests next topic and targeted study actions based on quiz performance & completed modules.
 */
router.get('/study-recommendations', authenticate, allowRoles('student'), asyncHandler(async (req, res) => {
  const studentId = req.user.id || req.user._id;

  const [attempts, completedLessons] = await Promise.all([
    QuizAttempt.find({ studentId }).sort({ createdAt: -1 }).limit(10).lean(),
    LessonProgress.find({ studentId, status: 'completed' }).sort({ completedAt: -1 }).limit(10).lean()
  ]);

  const analytics = computeQuizPerformanceAnalytics(attempts);
  const recommendations = [];

  // 1. Weak Topic Recommendation
  if (analytics.topicWeaknesses && analytics.topicWeaknesses.length > 0) {
    const topWeak = analytics.topicWeaknesses[0];
    recommendations.push({
      type: 'weak_topic_reinforcement',
      priority: 'high',
      title: `Reinforce Weak Topic: ${topWeak.topic}`,
      description: `Your accuracy on ${topWeak.topic} is currently ${topWeak.accuracy}%. Take a targeted AI quiz to build mastery.`,
      subjectCode: topWeak.subjectCode,
      subjectName: topWeak.subjectName,
      semester: topWeak.semester,
      action: 'generate_weak_topic_quiz',
      actionUrl: `/quizzes?tab=ai&mode=weak_topics&subject=${topWeak.subjectCode}`
    });
  }

  // 2. Subject Requiring Revision Recommendation
  if (analytics.subjectsRequiringRevision && analytics.subjectsRequiringRevision.length > 0) {
    const topRev = analytics.subjectsRequiringRevision[0];
    recommendations.push({
      type: 'subject_revision',
      priority: 'medium',
      title: `Review Course: ${topRev.subjectName}`,
      description: `Average score in ${topRev.subjectName} is ${topRev.averageScore}%. Review lesson modules and attempt a revision quiz.`,
      subjectCode: topRev.subjectCode,
      subjectName: topRev.subjectName,
      semester: topRev.semester,
      action: 'generate_revision_quiz',
      actionUrl: `/quizzes?tab=ai&mode=revision&subject=${topRev.subjectCode}`
    });
  }

  // 3. Next Topic Advancement
  if (attempts.length > 0 && attempts[0].passed) {
    const latest = attempts[0];
    const nextUnit = (latest.unitNumber || 1) < 4 ? (latest.unitNumber || 1) + 1 : 4;
    recommendations.push({
      type: 'next_topic_advancement',
      priority: 'normal',
      title: `Advance to Unit ${nextUnit} in ${latest.subjectName || 'Course'}`,
      description: `Great job passing "${latest.lessonTitle}"! You are eligible to advance to the next syllabus module.`,
      subjectCode: latest.subjectCode,
      subjectName: latest.subjectName,
      semester: latest.semester,
      action: 'study_next_module',
      actionUrl: `/learning/${latest.subjectCode}`
    });
  }

  res.json({
    data: {
      recommendations,
      analyticsSummary: {
        totalQuizzes: analytics.totalQuizzes,
        averageScore: analytics.averageScore,
        highestScore: analytics.highestScore
      }
    }
  });
}));

// ---------------------------------------------------------
// Modern Comprehensive Assessment Submission & Stats
// ---------------------------------------------------------

// ---------------------------------------------------------
// Performance Analytics Calculation Engine
// ---------------------------------------------------------

export function computeQuizPerformanceAnalytics(attempts = []) {
  const totalQuizzes = attempts.length;
  const passedAttempts = attempts.filter((a) => a.passed || a.score >= 70).length;
  const averageScore = totalQuizzes > 0
    ? Math.round(attempts.reduce((sum, a) => sum + (Number(a.score) || 0), 0) / totalQuizzes)
    : 0;
  const highestScore = totalQuizzes > 0
    ? Math.max(...attempts.map((a) => Number(a.score) || 0))
    : 0;
  const passRate = totalQuizzes > 0 ? Math.round((passedAttempts / totalQuizzes) * 100) : 0;
  const totalTimeSpentSeconds = attempts.reduce((sum, a) => sum + (Number(a.timeSpentSeconds) || 0), 0);

  // 1. Topic-wise Strengths and Weaknesses
  const topicMap = {};
  attempts.forEach((a) => {
    if (Array.isArray(a.questionResults) && a.questionResults.length > 0) {
      a.questionResults.forEach((q) => {
        const topicName = (q.topic || q.topicReference || a.topic || '').trim();
        if (!topicName) return;
        if (!topicMap[topicName]) {
          topicMap[topicName] = {
            topic: topicName,
            subjectCode: a.subjectCode,
            subjectName: a.subjectName,
            semester: a.semester,
            unitNumber: a.unitNumber,
            totalQuestions: 0,
            correctQuestions: 0,
            attemptsCount: 0,
            totalScore: 0
          };
        }
        topicMap[topicName].totalQuestions += 1;
        if (q.isCorrect) {
          topicMap[topicName].correctQuestions += 1;
        }
      });
    } else if (a.topic && a.topic.trim()) {
      const topicName = a.topic.trim();
      if (!topicMap[topicName]) {
        topicMap[topicName] = {
          topic: topicName,
          subjectCode: a.subjectCode,
          subjectName: a.subjectName,
          semester: a.semester,
          unitNumber: a.unitNumber,
          totalQuestions: 0,
          correctQuestions: 0,
          attemptsCount: 0,
          totalScore: 0
        };
      }
      const tQuestions = Math.max(1, a.totalQuestions || 10);
      const cQuestions = a.correctCount !== undefined ? a.correctCount : Math.round(((a.score || 0) / 100) * tQuestions);
      topicMap[topicName].totalQuestions += tQuestions;
      topicMap[topicName].correctQuestions += cQuestions;
    }

    if (a.topic && a.topic.trim() && topicMap[a.topic.trim()]) {
      topicMap[a.topic.trim()].attemptsCount += 1;
      topicMap[a.topic.trim()].totalScore += (Number(a.score) || 0);
    }
  });

  const topicList = Object.values(topicMap).map((t) => {
    const accuracy = t.totalQuestions > 0 ? Math.round((t.correctQuestions / t.totalQuestions) * 100) : 0;
    const avgScore = t.attemptsCount > 0 ? Math.round(t.totalScore / t.attemptsCount) : accuracy;
    let status = 'moderate';
    if (accuracy >= 75) status = 'strength';
    else if (accuracy < 60) status = 'weakness';
    return {
      topic: t.topic,
      subjectCode: t.subjectCode,
      subjectName: t.subjectName,
      semester: t.semester,
      unitNumber: t.unitNumber,
      totalQuestions: t.totalQuestions,
      correctQuestions: t.correctQuestions,
      accuracy,
      averageScore: avgScore,
      status
    };
  });

  const strengths = topicList
    .filter((t) => t.status === 'strength')
    .sort((a, b) => b.accuracy - a.accuracy);

  const weaknesses = topicList
    .filter((t) => t.status === 'weakness')
    .sort((a, b) => a.accuracy - b.accuracy);

  // 2. Subjects Requiring Revision
  const subjectMap = {};
  attempts.forEach((a) => {
    const code = a.subjectCode || 'UNKNOWN';
    if (!subjectMap[code]) {
      subjectMap[code] = {
        subjectCode: code,
        subjectName: a.subjectName || code,
        semester: a.semester || 1,
        totalAttempts: 0,
        totalScore: 0,
        passedAttempts: 0,
        failedAttempts: 0,
        highestScore: 0,
        lowestScore: 100,
        weakTopics: new Set()
      };
    }
    subjectMap[code].totalAttempts += 1;
    subjectMap[code].totalScore += (Number(a.score) || 0);
    if (a.passed || a.score >= 70) {
      subjectMap[code].passedAttempts += 1;
    } else {
      subjectMap[code].failedAttempts += 1;
    }
    if ((Number(a.score) || 0) > subjectMap[code].highestScore) subjectMap[code].highestScore = Number(a.score);
    if ((Number(a.score) || 0) < subjectMap[code].lowestScore) subjectMap[code].lowestScore = Number(a.score);

    if (Array.isArray(a.questionResults)) {
      a.questionResults.forEach((q) => {
        if (!q.isCorrect && (q.topic || q.topicReference || a.topic)) {
          subjectMap[code].weakTopics.add((q.topic || q.topicReference || a.topic).trim());
        }
      });
    } else if (!a.passed && a.topic) {
      subjectMap[code].weakTopics.add(a.topic.trim());
    }
  });

  const subjectsRequiringRevision = Object.values(subjectMap)
    .map((sub) => {
      const avgScore = sub.totalAttempts > 0 ? Math.round(sub.totalScore / sub.totalAttempts) : 0;
      const requiresRevision = avgScore < 70 || sub.failedAttempts > 0;
      return {
        subjectCode: sub.subjectCode,
        subjectName: sub.subjectName,
        semester: sub.semester,
        totalAttempts: sub.totalAttempts,
        averageScore: avgScore,
        highestScore: sub.highestScore,
        lowestScore: sub.lowestScore === 100 && sub.totalAttempts === 0 ? 0 : sub.lowestScore,
        passedAttempts: sub.passedAttempts,
        failedAttempts: sub.failedAttempts,
        weakTopics: Array.from(sub.weakTopics).slice(0, 5),
        requiresRevision,
        revisionPriority: avgScore < 50 || sub.failedAttempts >= 2 ? 'high' : 'medium'
      };
    })
    .filter((sub) => sub.requiresRevision)
    .sort((a, b) => a.averageScore - b.averageScore);

  return {
    totalQuizzes,
    totalAttempts: totalQuizzes,
    passedAttempts,
    averageScore,
    highestScore,
    passRate,
    totalTimeSpentSeconds,
    topicPerformance: topicList,
    topicStrengths: strengths,
    topicWeaknesses: weaknesses,
    subjectsRequiringRevision,
    previousAttempts: attempts.map((a) => ({
      id: a._id,
      _id: a._id,
      assessmentId: a.assessmentId || a.lessonId,
      assessmentType: a.assessmentType || 'unit_quiz',
      title: a.lessonTitle || a.assessmentId || 'Assessment',
      lessonTitle: a.lessonTitle || a.assessmentId || 'Assessment',
      subjectCode: a.subjectCode,
      subjectName: a.subjectName,
      semester: a.semester,
      unitNumber: a.unitNumber,
      unitTitle: a.unitTitle,
      topic: a.topic,
      score: a.score,
      percentage: a.percentage !== undefined ? a.percentage : a.score,
      correctCount: a.correctCount,
      incorrectCount: a.incorrectCount !== undefined ? a.incorrectCount : Math.max(0, (a.totalQuestions || 0) - (a.correctCount || 0)),
      totalQuestions: a.totalQuestions,
      passed: a.passed || a.score >= 70,
      attemptNumber: a.attemptNumber || 1,
      isRetry: Boolean(a.isRetry),
      timeSpentSeconds: a.timeSpentSeconds || 0,
      createdAt: a.createdAt,
      quizConfig: a.quizConfig || {}
    }))
  };
}

/**
 * GET /quizzes/analytics
 * Returns rich performance analytics: average score, highest score, total quizzes attempted,
 * topic-wise strengths and weaknesses, subjects requiring revision, and previous quiz attempts.
 * Authenticated user-specific (students cannot view other students' records).
 */
router.get('/analytics', authenticate, allowRoles('student'), asyncHandler(async (req, res) => {
  const studentId = req.user.id || req.user._id;
  const attempts = await QuizAttempt.find({ studentId }).sort({ createdAt: -1 }).lean();
  const analytics = computeQuizPerformanceAnalytics(attempts);

  res.json({ data: analytics });
}));

/**
 * GET /quizzes/summary
 * Returns overall assessment statistics and best scores map for the authenticated student
 */
router.get('/summary', authenticate, allowRoles('student'), asyncHandler(async (req, res) => {
  const studentId = req.user.id || req.user._id;
  const attempts = await QuizAttempt.find({ studentId }).sort({ createdAt: -1 }).lean();
  const analytics = computeQuizPerformanceAnalytics(attempts);

  // Map of assessmentId -> best score, latest attempt info
  const byAssessmentId = {};
  attempts.forEach((a) => {
    const key = a.assessmentId || a.lessonId || String(a._id);
    if (!byAssessmentId[key]) {
      byAssessmentId[key] = {
        assessmentId: key,
        assessmentType: a.assessmentType || 'unit_quiz',
        subjectCode: a.subjectCode,
        subjectName: a.subjectName,
        unitNumber: a.unitNumber,
        bestScore: a.score,
        lastScore: a.score,
        attemptsCount: 1,
        passed: a.passed || a.score >= 70,
        lastAttemptAt: a.createdAt
      };
    } else {
      byAssessmentId[key].attemptsCount += 1;
      if (a.score > byAssessmentId[key].bestScore) {
        byAssessmentId[key].bestScore = a.score;
      }
      if (a.passed || a.score >= 70) {
        byAssessmentId[key].passed = true;
      }
    }
  });

  res.json({
    data: {
      totalAttempts: analytics.totalQuizzes,
      totalQuizzes: analytics.totalQuizzes,
      passedAttempts: analytics.passedAttempts,
      averageScore: analytics.averageScore,
      highestScore: analytics.highestScore,
      passRate: analytics.passRate,
      topicStrengths: analytics.topicStrengths,
      topicWeaknesses: analytics.topicWeaknesses,
      subjectsRequiringRevision: analytics.subjectsRequiringRevision,
      byAssessmentId,
      recentAttempts: attempts.slice(0, 10)
    }
  });
}));

/**
 * GET /quizzes/history
 * Returns full attempt history for the authenticated student with filters for semester, subject, unit and date.
 * Strictly scoped to authenticated studentId.
 */
router.get('/history', authenticate, allowRoles('student'), asyncHandler(async (req, res) => {
  const studentId = req.user.id || req.user._id;
  const { semester, subjectCode, subject, unitNumber, unit, date, startDate, endDate, assessmentType } = req.query;

  const query = { studentId };

  if (semester && semester !== 'all' && Number(semester) > 0) {
    query.semester = Number(semester);
  }

  const targetSubject = subjectCode || subject;
  if (targetSubject && targetSubject !== 'all') {
    query.$or = [
      { subjectCode: targetSubject },
      { subjectName: new RegExp(targetSubject, 'i') }
    ];
  }

  const targetUnit = unitNumber !== undefined && unitNumber !== '' ? unitNumber : unit;
  if (targetUnit !== undefined && targetUnit !== '' && targetUnit !== 'all') {
    query.unitNumber = Number(targetUnit);
  }

  if (assessmentType && assessmentType !== 'all') {
    query.assessmentType = assessmentType;
  }

  // Date filters: supports 'today', 'week', 'month', specific date YYYY-MM-DD, or startDate / endDate range
  if (date === 'today') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    query.createdAt = { $gte: today };
  } else if (date === 'week' || date === 'past_7_days') {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    query.createdAt = { $gte: sevenDaysAgo };
  } else if (date === 'month' || date === 'past_30_days') {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    query.createdAt = { $gte: thirtyDaysAgo };
  } else if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  } else if (date && date !== 'all' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    query.createdAt = { $gte: startOfDay, $lte: endOfDay };
  }

  const attempts = await QuizAttempt.find(query).sort({ createdAt: -1 }).lean();
  res.json({ data: { attempts, total: attempts.length } });
}));

/**
 * GET /quizzes/attempts/:id
 * Retrieve a specific quiz attempt with question details.
 * Security: Verifies that students can ONLY access their own quiz results.
 */
router.get('/attempts/:id', authenticate, allowRoles('student', 'mentor', 'admin'), asyncHandler(async (req, res) => {
  const attempt = await QuizAttempt.findById(req.params.id).lean();
  if (!attempt) {
    throw new HttpError(404, 'Quiz attempt not found');
  }

  // Ensure students cannot access other users' quiz results
  const currentUserId = String(req.user.id || req.user._id);
  if (req.user.role === 'student' && String(attempt.studentId) !== currentUserId) {
    throw new HttpError(403, 'Access denied: You cannot access other students’ quiz attempts');
  }

  res.json({ data: { attempt } });
}));

/**
 * POST /quizzes/submit-assessment
 * Handles authoritative submission of AI-generated quizzes, Unit Quizzes, and Practice Assessments.
 * Persists all metadata and integrates with student's learning progress system (LessonProgress, streak, achievements, activities).
 */
router.post('/submit-assessment', authenticate, allowRoles('student'), asyncHandler(async (req, res) => {
  const studentId = req.user.id || req.user._id;
  const {
    assessmentId,
    assessmentType = 'unit_quiz',
    subjectCode = '',
    subjectName = '',
    semester = 1,
    unitNumber = 1,
    unitTitle = '',
    lessonTitle = '',
    topic = '',
    quizConfig = {},
    questions = [],
    answers = {},
    questionResults = [],
    score = 0,
    correctCount = 0,
    totalQuestions = 1,
    timeSpentSeconds = 0,
    isRetry = false
  } = req.body;

  if (!assessmentId) {
    throw new HttpError(400, 'Assessment ID is required');
  }

  if (req.user?.role === 'student' && req.user?.semester) {
    const studentSem = Number(req.user.semester);
    const quizSem = semester ? Number(semester) : null;
    if (quizSem && quizSem !== studentSem) {
      throw new HttpError(403, `This assessment belongs to Semester ${quizSem}. Your enrolled semester is Semester ${studentSem}. Assessments from other semesters are locked.`);
    }
  }

  // Check if this is an AI-generated quiz stored on backend
  let finalScore = Math.min(100, Math.max(0, Math.round(Number(score) || 0)));
  let finalCorrectCount = Number(correctCount) || 0;
  let finalTotalQuestions = Math.max(1, Number(totalQuestions) || 1);
  let finalQuestionResults = Array.isArray(questionResults) ? questionResults : [];

  const storedGeneratedQuiz = await GeneratedQuiz.findOne({ quizId: assessmentId }).lean();
  if (storedGeneratedQuiz) {
    const graded = gradeStoredQuizSubmission(storedGeneratedQuiz, answers, req.body.selfScores || {});
    finalScore = graded.score;
    finalCorrectCount = graded.correctCount;
    finalTotalQuestions = graded.totalQuestions;
    finalQuestionResults = graded.questionResults;
  }

  const finalPercentage = finalTotalQuestions > 0
    ? Math.round((finalCorrectCount / finalTotalQuestions) * 100)
    : finalScore;
  const finalIncorrectCount = Math.max(0, finalTotalQuestions - finalCorrectCount);

  // Count prior attempts for this student and assessmentId
  const priorAttemptsCount = await QuizAttempt.countDocuments({
    studentId,
    $or: [{ assessmentId }, { lessonId: assessmentId }]
  });

  const attemptNumber = priorAttemptsCount + 1;
  const passed = finalScore >= (storedGeneratedQuiz?.passingPercentage || 70);

  const resolvedSemester = Number(storedGeneratedQuiz?.semester || semester) || 1;
  const resolvedSubjectCode = storedGeneratedQuiz?.subjectCode || subjectCode;
  const resolvedSubjectName = storedGeneratedQuiz?.subjectName || subjectName;
  const resolvedUnitNumber = Number(storedGeneratedQuiz?.unitNumber || unitNumber) || 1;
  const resolvedUnitTitle = storedGeneratedQuiz?.unitTitle || unitTitle;
  const resolvedTopic = storedGeneratedQuiz?.topic || topic || '';
  const resolvedLessonTitle = lessonTitle || storedGeneratedQuiz?.title || `${resolvedSubjectName} - Assessment`;

  const resolvedQuizConfig = storedGeneratedQuiz?.quizConfig || quizConfig || {
    difficulty: req.body.difficulty || 'mixed',
    questionCount: finalTotalQuestions,
    questionTypes: req.body.questionTypes || [],
    topic: resolvedTopic,
    source: storedGeneratedQuiz?.source || 'ai-synthesis',
    title: resolvedLessonTitle
  };

  const resolvedQuestions = storedGeneratedQuiz?.questions || questions || [];

  // Persist attempt with complete metadata
  const attempt = await QuizAttempt.create({
    studentId,
    lessonId: assessmentId,
    assessmentId,
    assessmentType: storedGeneratedQuiz ? 'ai_generated' : assessmentType,
    subjectCode: resolvedSubjectCode,
    subjectName: resolvedSubjectName,
    semester: resolvedSemester,
    unitNumber: resolvedUnitNumber,
    unitTitle: resolvedUnitTitle,
    lessonTitle: resolvedLessonTitle,
    topic: resolvedTopic,
    quizConfig: resolvedQuizConfig,
    questions: resolvedQuestions,
    answers,
    questionResults: finalQuestionResults,
    score: finalScore,
    percentage: finalPercentage,
    correctCount: finalCorrectCount,
    incorrectCount: finalIncorrectCount,
    totalQuestions: finalTotalQuestions,
    passed,
    attemptNumber,
    isRetry: Boolean(isRetry),
    timeSpentSeconds: Number(timeSpentSeconds) || 0
  });

  // ---------------------------------------------------------
  // Integrate with Learning Progress System
  // ---------------------------------------------------------

  // 1. Update LessonProgress record
  try {
    await LessonProgress.findOneAndUpdate(
      { studentId, lessonId: assessmentId },
      {
        $set: {
          quizScore: finalScore,
          lastAccessedAt: new Date(),
          ...(resolvedSubjectCode ? { subjectCode: resolvedSubjectCode } : {}),
          ...(resolvedSubjectName ? { subjectName: resolvedSubjectName } : {}),
          ...(resolvedSemester ? { semester: resolvedSemester } : {}),
          ...(resolvedUnitNumber ? { unitNumber: resolvedUnitNumber } : {}),
          lessonTitle: resolvedLessonTitle,
          ...(passed ? { status: 'completed', completedAt: new Date() } : {})
        },
        $inc: { quizAttempts: 1 },
        $setOnInsert: {
          studentId,
          lessonId: assessmentId,
          status: passed ? 'completed' : 'in_progress'
        }
      },
      { upsert: true, new: true }
    );
  } catch (lpErr) {
    console.warn('Could not update LessonProgress for quiz attempt:', lpErr.message);
  }

  // 2. Update Daily Study Streak
  try {
    await updateUserStreak(studentId);
  } catch (streakErr) {
    console.warn('Could not update student streak:', streakErr.message);
  }

  // 3. Unlock Academic Achievements
  try {
    await checkAndAwardAchievement(studentId, 'first_step');
    if (finalScore >= 80) {
      await checkAndAwardAchievement(studentId, 'quiz_ace');
    }
    const quizXp = finalScore >= 90 ? 30 : 20;
    await awardXP(studentId, quizXp, 'quiz_attempt');
    await checkAndUnlockBadges(studentId);
  } catch (achErr) {
    console.warn('Could not award achievements:', achErr.message);
  }

  // 4. Log Learning Activity
  try {
    const isAIQuiz = Boolean(storedGeneratedQuiz || assessmentType === 'ai_generated' || assessmentType === 'ai_quiz');
    await logLearningActivity(studentId, {
      activityType: 'quiz_completed',
      title: `Completed ${isAIQuiz ? 'AI Quiz' : 'Assessment'}: ${resolvedLessonTitle}`,
      description: `Scored ${finalScore}% (${finalCorrectCount}/${finalTotalQuestions} correct) on ${resolvedTopic || resolvedUnitTitle || resolvedSubjectName}. Time: ${Math.round(Number(timeSpentSeconds) || 0)}s.`,
      lessonId: assessmentId,
      subjectCode: resolvedSubjectCode,
      subjectName: resolvedSubjectName,
      semester: resolvedSemester,
      metadata: {
        score: finalScore,
        percentage: finalPercentage,
        totalQuestions: finalTotalQuestions,
        correctCount: finalCorrectCount,
        incorrectCount: finalIncorrectCount,
        passed,
        attemptNumber,
        timeSpentSeconds: Number(timeSpentSeconds) || 0,
        isAI: isAIQuiz,
        topic: resolvedTopic
      }
    });
  } catch (actErr) {
    console.warn('Could not log quiz learning activity:', actErr.message);
  }

  // 5. Generate AI Performance Feedback & Next Topic Study Recommendations
  const feedbackData = generateAIPerformanceFeedback({
    questionResults: finalQuestionResults,
    score: finalScore,
    passed,
    subjectCode: resolvedSubjectCode,
    subjectName: resolvedSubjectName,
    semester: resolvedSemester,
    unitNumber: resolvedUnitNumber,
    topic: resolvedTopic
  });

  attempt.aiFeedback = {
    overallAssessment: feedbackData.overallAssessment,
    weakAreas: feedbackData.weakAreas,
    recommendedLessons: feedbackData.recommendedLessons
  };
  attempt.studyRecommendation = feedbackData.studyRecommendation;
  await attempt.save();

  // Collect incorrect question IDs for instant retry support
  const incorrectQuestionIds = (finalQuestionResults || [])
    .filter((q) => !q.isCorrect)
    .map((q) => q.questionId)
    .filter(Boolean);

  res.status(201).json({
    data: {
      attempt,
      score: attempt.score,
      percentage: attempt.percentage,
      correctCount: attempt.correctCount,
      incorrectCount: attempt.incorrectCount,
      totalQuestions: attempt.totalQuestions,
      passed: attempt.passed,
      attemptNumber: attempt.attemptNumber,
      isRetry: attempt.isRetry,
      incorrectQuestionIds,
      results: finalQuestionResults,
      aiFeedback: attempt.aiFeedback,
      studyRecommendation: attempt.studyRecommendation
    }
  });
}));

// ---------------------------------------------------------
// Existing / Legacy Endpoints
// ---------------------------------------------------------

router.get('/', authenticate, asyncHandler(async (req, res) => {
  const isStudent = req.user.role === 'student';
  const studentSem = req.user.semester || 1;

  const lessons = await Lesson.find({ 'quiz.0': { $exists: true } })
    .select('title summary topicId quiz')
    .populate({
      path: 'topicId',
      select: 'title subjectId',
      populate: {
        path: 'subjectId',
        select: 'title semesterId',
        populate: { path: 'semesterId', select: 'number title' }
      }
    })
    .sort({ title: 1 })
    .lean();
  let quizzes = lessons.map((lesson) => {
    const topic = lesson.topicId;
    const subject = topic?.subjectId;
    const semester = subject?.semesterId;
    return {
      id: String(lesson._id),
      lessonId: String(lesson._id),
      title: lesson.title,
      summary: lesson.summary,
      questionCount: lesson.quiz.length,
      topic: topic ? { id: String(topic._id), title: topic.title } : null,
      subject: subject ? { id: String(subject._id), title: subject.title } : null,
      semester: semester ? { id: String(semester._id), number: semester.number, title: semester.title } : null
    };
  });
  if (isStudent && studentSem) {
    quizzes = quizzes.filter((q) => !q.semester || q.semester.number === studentSem);
  }
  res.json({ data: { quizzes } });
}));

router.post('/lessons/:lessonId/attempts', authenticate, allowRoles('student'),
  validate(attemptSchema), asyncHandler(async (req, res) => {
    await submitAttempt(req.params.lessonId, req.body.answers, req.user.id, res);
  }));

router.post('/:quizId/submit', authenticate, allowRoles('student'), asyncHandler(async (req, res) => {
  if (req.user?.role === 'student' && req.user?.semester) {
    const studentSem = Number(req.user.semester);
    const quizSem = req.body.semester ? Number(req.body.semester) : null;
    if (quizSem && quizSem !== studentSem) {
      throw new HttpError(403, `This quiz belongs to Semester ${quizSem}. Your enrolled semester is Semester ${studentSem}. Quizzes from other semesters are locked.`);
    }
  }

  // If request contains rich assessment payload (e.g. from updated UI)
  if (req.body.assessmentId || req.body.questionResults || typeof req.body.answers === 'object' && !Array.isArray(req.body.answers)) {
    const studentId = req.user.id;
    const assessmentId = req.body.assessmentId || req.params.quizId;
    const {
      assessmentType = 'unit_quiz',
      subjectCode = '',
      subjectName = '',
      semester = 1,
      unitNumber = 1,
      unitTitle = '',
      lessonTitle = '',
      answers = req.body.answers || {},
      questionResults = [],
      score = req.body.score || 0,
      correctCount = req.body.correctCount || 0,
      totalQuestions = req.body.totalQuestions || 1,
      timeSpentSeconds = 0,
      isRetry = false
    } = req.body;

    const priorAttemptsCount = await QuizAttempt.countDocuments({
      studentId,
      $or: [{ assessmentId }, { lessonId: assessmentId }]
    });

    const attempt = await QuizAttempt.create({
      studentId,
      lessonId: assessmentId,
      assessmentId,
      assessmentType,
      subjectCode,
      subjectName,
      semester: Number(semester) || 1,
      unitNumber: Number(unitNumber) || 1,
      unitTitle,
      lessonTitle: lessonTitle || `Assessment ${assessmentId}`,
      answers,
      questionResults,
      score: Math.min(100, Math.max(0, Math.round(Number(score) || 0))),
      correctCount: Number(correctCount) || 0,
      totalQuestions: Math.max(1, Number(totalQuestions) || 1),
      passed: (Number(score) || 0) >= 70,
      attemptNumber: priorAttemptsCount + 1,
      isRetry: Boolean(isRetry),
      timeSpentSeconds: Number(timeSpentSeconds) || 0
    });

    const incorrectQuestionIds = (questionResults || [])
      .filter((q) => !q.isCorrect)
      .map((q) => q.questionId)
      .filter(Boolean);

    return res.status(201).json({
      data: {
        attempt,
        score: attempt.score,
        correctCount: attempt.correctCount,
        totalQuestions: attempt.totalQuestions,
        passed: attempt.passed,
        attemptNumber: attempt.attemptNumber,
        incorrectQuestionIds,
        results: questionResults
      }
    });
  }

  // Legacy format: array of numbers
  const parseResult = attemptSchema.safeParse(req.body);
  if (!parseResult.success) {
    throw new HttpError(400, 'Invalid quiz submission format');
  }
  await submitAttempt(req.params.quizId, req.body.answers, req.user.id, res);
}));

router.get('/me', authenticate, allowRoles('student'), asyncHandler(async (req, res) => {
  const attempts = await QuizAttempt.find({ studentId: req.user.id })
    .populate({ path: 'lessonId', select: 'title topicId' })
    .sort({ createdAt: -1 });
  res.json({ data: { attempts } });
}));

/**
 * GET /quizzes/assigned
 * Fetch mentor-published quizzes assigned to current student
 */
router.get('/assigned', authenticate, asyncHandler(async (req, res) => {
  const student = await User.findById(req.user.id).lean();
  const sem = student?.semester || req.user.semester || 1;

  const quizzes = await MentorQuiz.find({
    isPublished: true,
    $or: [
      { semester: sem },
      { targetStudentIds: req.user.id }
    ]
  })
    .sort({ createdAt: -1 })
    .lean();

  const quizIds = quizzes.map((q) => String(q._id));
  const attempts = await QuizAttempt.find({
    studentId: req.user.id,
    $or: [
      { quizId: { $in: quizIds } },
      { assessmentId: { $in: quizIds } }
    ]
  }).lean();

  const attemptsMap = new Map();
  attempts.forEach((att) => {
    const qId = String(att.quizId || att.assessmentId);
    if (!attemptsMap.has(qId) || (attemptsMap.get(qId).score < att.score)) {
      attemptsMap.set(qId, att);
    }
  });

  const formatted = quizzes.map((q) => {
    const myAttempt = attemptsMap.get(String(q._id));
    const sanitizedQuestions = (q.questions || []).map((quest) => {
      const { correctAnswer, explanation, ...rest } = quest;
      return rest;
    });

    return {
      ...q,
      questions: sanitizedQuestions,
      questionCount: sanitizedQuestions.length,
      myAttempt: myAttempt || null,
      isCompleted: Boolean(myAttempt)
    };
  });

  res.json({ data: { assignedQuizzes: formatted } });
}));

/**
 * POST /quizzes/assigned/:id/submit
 * Submit answers for mentor-assigned quiz
 */
router.post('/assigned/:id/submit', authenticate, asyncHandler(async (req, res) => {
  const quiz = await MentorQuiz.findById(req.params.id);
  if (!quiz) throw new HttpError(404, 'Mentor quiz not found');
  if (!quiz.isPublished) throw new HttpError(400, 'This quiz is not currently accepting submissions');

  if (req.user?.role === 'student' && req.user?.semester) {
    const studentSem = Number(req.user.semester);
    const isTargetStudent = (quiz.targetStudentIds || []).some((id) => String(id) === String(req.user.id || req.user._id));
    if (quiz.semester && Number(quiz.semester) !== studentSem && !isTargetStudent) {
      throw new HttpError(403, `This mentor quiz is for Semester ${quiz.semester}. It is locked for your enrolled semester (Semester ${studentSem}).`);
    }
  }

  const { answers = {}, timeTakenSeconds = 0 } = req.body;

  let totalPossibleMarks = 0;
  let earnedMarks = 0;
  const questionResults = [];

  (quiz.questions || []).forEach((q) => {
    const marks = q.marks || 1;
    totalPossibleMarks += marks;
    const studentAns = answers[q.id];

    let isCorrect = false;
    if (studentAns !== undefined && studentAns !== null) {
      if (typeof q.correctAnswer === 'number') {
        isCorrect = Number(studentAns) === Number(q.correctAnswer);
      } else if (Array.isArray(q.correctAnswer)) {
        const studentArr = Array.isArray(studentAns) ? studentAns : [studentAns];
        isCorrect =
          studentArr.length === q.correctAnswer.length &&
          studentArr.every((val) => q.correctAnswer.includes(val));
      } else {
        isCorrect =
          String(studentAns).trim().toLowerCase() ===
          String(q.correctAnswer).trim().toLowerCase();
      }
    }

    if (isCorrect) {
      earnedMarks += marks;
    }

    questionResults.push({
      questionId: q.id,
      text: q.text,
      studentAnswer: studentAns,
      correctAnswer: q.correctAnswer,
      isCorrect,
      marksEarned: isCorrect ? marks : 0,
      marksPossible: marks,
      explanation: q.explanation || ''
    });
  });

  const score = totalPossibleMarks > 0 ? Math.round((earnedMarks / totalPossibleMarks) * 100) : 0;
  const passed = score >= (quiz.passingScore || 70);

  const attempt = await QuizAttempt.create({
    studentId: req.user.id,
    quizId: String(quiz._id),
    assessmentId: String(quiz._id),
    assessmentType: 'mentor_quiz',
    lessonId: `mentor-quiz-${quiz._id}`,
    lessonTitle: quiz.title,
    semester: quiz.semester,
    subjectCode: quiz.subjectCode,
    subjectName: quiz.subjectName,
    unit: quiz.unit || '',
    topic: quiz.topic || '',
    difficulty: quiz.difficulty || 'medium',
    score,
    passed,
    totalQuestions: quiz.questions.length,
    correctCount: questionResults.filter((r) => r.isCorrect).length,
    timeTakenSeconds: Number(timeTakenSeconds) || 0,
    answers,
    questionResults
  });

  // Increment quiz attempts count
  quiz.attemptsCount = (quiz.attemptsCount || 0) + 1;
  await quiz.save();

  // Streak, XP & Activity updates
  const mentorQuizXp = score >= 90 ? 30 : 20;
  await awardXP(req.user.id, mentorQuizXp, 'mentor_quiz_completed');
  await checkAndUnlockBadges(req.user.id);

  await Promise.all([
    updateUserStreak(req.user.id),
    logLearningActivity(req.user.id, 'quiz_attempt', {
      subjectCode: quiz.subjectCode,
      subjectName: quiz.subjectName,
      unit: quiz.unit,
      topic: quiz.topic,
      score,
      passed,
      quizTitle: quiz.title
    })
  ]);

  if (passed) {
    await checkAndAwardAchievement(req.user.id, 'mentor_quiz_passed', {
      title: 'Mentor Challenge Master',
      icon: 'Award'
    });
  }

  res.status(201).json({
    data: {
      attempt,
      score,
      passed,
      earnedMarks,
      totalPossibleMarks,
      questionResults
    }
  });
}));

export default router;
