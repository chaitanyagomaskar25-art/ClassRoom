import express from 'express';
import mongoose from 'mongoose';
import MentorQuiz from '../models/MentorQuiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import User from '../models/User.js';
import { authenticate, allowRoles } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import HttpError from '../utils/httpError.js';

const router = express.Router();

/**
 * GET /mentor/quizzes
 * List quizzes created by the mentor
 */
router.get(
  '/',
  authenticate,
  allowRoles('mentor', 'senior_mentor', 'admin', 'super_admin', 'scrum'),
  asyncHandler(async (req, res) => {
    const filter = req.user.role === 'super_admin' || req.user.role === 'admin' || req.user.role === 'scrum'
      ? {}
      : { mentorId: req.user.id };

    const quizzes = await MentorQuiz.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    const formatted = quizzes.map((q) => ({
      ...q,
      questionCount: (q.questions || []).length,
      calculatedTotalMarks: (q.questions || []).reduce((sum, item) => sum + (item.marks || 1), 0)
    }));

    res.json({ data: { quizzes: formatted } });
  })
);

/**
 * POST /mentor/quizzes
 * Create a new quiz
 */
router.post(
  '/',
  authenticate,
  allowRoles('mentor', 'senior_mentor', 'admin', 'super_admin', 'scrum'),
  asyncHandler(async (req, res) => {
    const {
      title,
      description,
      semester,
      subjectCode,
      subjectName,
      unit,
      topic,
      difficulty,
      durationMinutes,
      totalMarks,
      passingScore,
      deadline,
      questions,
      isPublished,
      targetType,
      targetBatch,
      targetStudentIds
    } = req.body;

    if (!title || !semester || !subjectCode || !subjectName) {
      throw new HttpError(400, 'Title, semester, subjectCode, and subjectName are required');
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new HttpError(400, 'At least one quiz question is required');
    }

    // Sanitize questions
    const formattedQuestions = questions.map((q, idx) => ({
      id: q.id || `mq-${Date.now()}-${idx + 1}`,
      text: q.text || q.question || '',
      type: q.type || 'mcq',
      options: Array.isArray(q.options) ? q.options : [],
      correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : '',
      explanation: q.explanation || '',
      marks: Number(q.marks) || 1,
      codeSnippet: q.codeSnippet || ''
    }));

    const calculatedMarks = formattedQuestions.reduce((sum, q) => sum + q.marks, 0);

    const quiz = await MentorQuiz.create({
      mentorId: req.user.id,
      mentorName: req.user.name || 'Mentor',
      title,
      description: description || '',
      semester: Number(semester),
      subjectCode,
      subjectName,
      unit: unit || '',
      topic: topic || '',
      difficulty: difficulty || 'medium',
      durationMinutes: Number(durationMinutes) || 20,
      totalMarks: Number(totalMarks) || calculatedMarks || 10,
      passingScore: Number(passingScore) || 70,
      deadline: deadline ? new Date(deadline) : null,
      isPublished: Boolean(isPublished),
      targetType: targetType || 'semester',
      targetBatch: targetBatch || '',
      targetStudentIds: Array.isArray(targetStudentIds) ? targetStudentIds : [],
      questions: formattedQuestions
    });

    res.status(201).json({
      data: {
        quiz,
        message: quiz.isPublished
          ? 'Quiz created and published to students'
          : 'Quiz created as draft'
      }
    });
  })
);

/**
 * GET /mentor/quizzes/:id
 * Get single mentor quiz with full details
 */
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const quiz = await MentorQuiz.findById(req.params.id).lean();
  if (!quiz) throw new HttpError(404, 'Quiz not found');

  const isMentor = ['mentor', 'senior_mentor', 'admin', 'super_admin', 'scrum'].includes(req.user.role);
  if (!isMentor) {
    // If student, sanitize answers until submitted
    const sanitizedQuestions = (quiz.questions || []).map((q) => {
      const { correctAnswer, explanation, ...rest } = q;
      return rest;
    });
    return res.json({
      data: {
        quiz: {
          ...quiz,
          questions: sanitizedQuestions
        }
      }
    });
  }

  res.json({ data: { quiz } });
}));

/**
 * PUT /mentor/quizzes/:id
 * Update mentor quiz
 */
router.put(
  '/:id',
  authenticate,
  allowRoles('mentor', 'senior_mentor', 'admin', 'super_admin', 'scrum'),
  asyncHandler(async (req, res) => {
    const quiz = await MentorQuiz.findById(req.params.id);
    if (!quiz) throw new HttpError(404, 'Quiz not found');

    if (
      req.user.role !== 'super_admin' &&
      req.user.role !== 'admin' &&
      req.user.role !== 'scrum' &&
      String(quiz.mentorId) !== String(req.user.id)
    ) {
      throw new HttpError(403, 'Permission denied to edit this quiz');
    }

    const fields = [
      'title',
      'description',
      'semester',
      'subjectCode',
      'subjectName',
      'unit',
      'topic',
      'difficulty',
      'durationMinutes',
      'totalMarks',
      'passingScore',
      'deadline',
      'questions',
      'isPublished',
      'targetType',
      'targetBatch',
      'targetStudentIds'
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        quiz[field] = req.body[field];
      }
    });

    await quiz.save();
    res.json({ data: { quiz, message: 'Quiz updated successfully' } });
  })
);

/**
 * DELETE /mentor/quizzes/:id
 * Delete mentor quiz
 */
router.delete(
  '/:id',
  authenticate,
  allowRoles('mentor', 'senior_mentor', 'admin', 'super_admin', 'scrum'),
  asyncHandler(async (req, res) => {
    const quiz = await MentorQuiz.findById(req.params.id);
    if (!quiz) throw new HttpError(404, 'Quiz not found');

    if (
      req.user.role !== 'super_admin' &&
      req.user.role !== 'admin' &&
      req.user.role !== 'scrum' &&
      String(quiz.mentorId) !== String(req.user.id)
    ) {
      throw new HttpError(403, 'Permission denied to delete this quiz');
    }

    await quiz.deleteOne();
    res.json({ data: { message: 'Quiz deleted successfully' } });
  })
);

/**
 * POST /mentor/quizzes/:id/publish
 * Toggle publish status
 */
router.post(
  '/:id/publish',
  authenticate,
  allowRoles('mentor', 'senior_mentor', 'admin', 'super_admin', 'scrum'),
  asyncHandler(async (req, res) => {
    const quiz = await MentorQuiz.findById(req.params.id);
    if (!quiz) throw new HttpError(404, 'Quiz not found');

    if (
      req.user.role !== 'super_admin' &&
      req.user.role !== 'admin' &&
      req.user.role !== 'scrum' &&
      String(quiz.mentorId) !== String(req.user.id)
    ) {
      throw new HttpError(403, 'Permission denied to publish this quiz');
    }

    quiz.isPublished = !quiz.isPublished;
    await quiz.save();

    res.json({
      data: {
        quiz,
        isPublished: quiz.isPublished,
        message: quiz.isPublished ? 'Quiz published to students' : 'Quiz unpublished (draft mode)'
      }
    });
  })
);

/**
 * GET /mentor/quizzes/:id/submissions
 * View student attempts and scores on this quiz
 */
router.get(
  '/:id/submissions',
  authenticate,
  allowRoles('mentor', 'senior_mentor', 'admin', 'super_admin', 'scrum'),
  asyncHandler(async (req, res) => {
    const quiz = await MentorQuiz.findById(req.params.id).lean();
    if (!quiz) throw new HttpError(404, 'Quiz not found');

    const attempts = await QuizAttempt.find({
      $or: [
        { quizId: String(quiz._id) },
        { lessonId: `mentor-quiz-${quiz._id}` }
      ]
    })
      .populate('studentId', 'name email enrollmentNumber semester')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      data: {
        quiz,
        attemptsCount: attempts.length,
        attempts
      }
    });
  })
);

export default router;
