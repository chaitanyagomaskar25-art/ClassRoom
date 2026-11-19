import express from 'express';
import { authenticate, allowRoles } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import HttpError from '../utils/httpError.js';
import {
  askLearningMentor,
  analyzeStudentWeaknesses,
  generatePersonalizedRoadmap,
  generateMentorCohortAnalytics,
  generateCareerRoadmapGuide
} from '../services/aiAssistantService.js';
import { generateAIQuiz } from '../services/aiQuizGenerator.js';
import { buildStudentQuery } from './mentor.js';
import Message from '../models/Message.js';
import MentorQuiz from '../models/MentorQuiz.js';
import StudyPlan from '../models/StudyPlan.js';

const router = express.Router();

/**
 * 33. POST /ai/learning-mentor/ask
 * Interactive AI learning mentor for students:
 * Concept explanations, simple (ELI5) analogies, code debugging, and examples
 */
router.post(
  '/learning-mentor/ask',
  authenticate,
  allowRoles('student', 'mentor', 'senior_mentor', 'admin', 'super_admin'),
  asyncHandler(async (req, res) => {
    const { question, codeSnippet, errorMessage, mode, semester, subjectCode, topic } = req.body;

    if (!question && !codeSnippet && !errorMessage) {
      throw new HttpError(400, 'Please provide a question, code snippet, or error message.');
    }

    const response = await askLearningMentor({
      question,
      codeSnippet,
      errorMessage,
      mode: mode || 'explain',
      semester: semester || req.user.semester || 1,
      subjectCode,
      topic
    });

    res.json({ data: response });
  })
);

/**
 * 35. GET /ai/weakness-analysis
 * Analyzes authenticated student's quiz attempts & progress to diagnose weak topics
 */
router.get(
  '/weakness-analysis',
  authenticate,
  allowRoles('student', 'mentor', 'admin'),
  asyncHandler(async (req, res) => {
    const targetStudentId = req.query.studentId || req.user.id;

    // Student can only view their own; mentors/admins can view assigned
    if (req.user.role === 'student' && targetStudentId !== req.user.id) {
      throw new HttpError(403, 'Students may only access their own weakness analysis.');
    }

    const analysis = await analyzeStudentWeaknesses(targetStudentId);
    res.json({ data: analysis });
  })
);

/**
 * 36. POST /ai/personalized-roadmap
 * Generates and optionally saves personalized weekly learning roadmap
 */
router.post(
  '/personalized-roadmap',
  authenticate,
  allowRoles('student', 'mentor', 'admin'),
  asyncHandler(async (req, res) => {
    const { weeklyHours, targetCareer, targetWeeks, saveToStudyPlan } = req.body;
    const studentId = req.user.id;

    const roadmap = await generatePersonalizedRoadmap({
      studentId,
      weeklyHours: weeklyHours || 10,
      targetCareer: targetCareer || 'Full-Stack Software Engineer',
      targetWeeks: targetWeeks || 4
    });

    // Optionally sync into StudyPlan model
    if (saveToStudyPlan) {
      let plan = await StudyPlan.findOne({ studentId });
      if (!plan) {
        plan = new StudyPlan({
          studentId,
          semester: req.user.semester || 1,
          tasks: [],
          weeklyGoals: []
        });
      }

      // Convert roadmap daily tasks into study plan tasks
      const newTasks = [];
      roadmap.weeks.forEach((week) => {
        week.dailyTasks.forEach((dt, idx) => {
          const taskDate = new Date();
          taskDate.setDate(taskDate.getDate() + (week.weekNumber - 1) * 7 + idx);
          const dateStr = taskDate.toISOString().slice(0, 10);

          newTasks.push({
            id: `ai-roadmap-${week.weekNumber}-${idx}`,
            date: dateStr,
            taskType: 'lesson',
            title: dt.task,
            estimatedMinutes: dt.minutes,
            unitNumber: `Week ${week.weekNumber}`,
            subjectCode: week.subjectCode,
            subjectName: week.subjectName,
            completed: false
          });
        });
      });

      plan.tasks = newTasks;
      await plan.save();
      roadmap.savedToStudyPlan = true;
    }

    res.json({ data: roadmap });
  })
);

/**
 * 37. GET /ai/mentor-analytics
 * AI analytics assistant for mentors:
 * Analyzes authorized students, identifies common weak subjects, inactivity & repeated failures
 */
router.get(
  '/mentor-analytics',
  authenticate,
  allowRoles('mentor', 'senior_mentor', 'admin', 'super_admin'),
  asyncHandler(async (req, res) => {
    const studentQuery = buildStudentQuery(req.user);
    const analytics = await generateMentorCohortAnalytics(req.user, studentQuery);
    res.json({ data: analytics });
  })
);

/**
 * 37. POST /ai/mentor-interventions/apply
 * Applies a mentor intervention (e.g. sending check-in messages)
 */
router.post(
  '/mentor-interventions/apply',
  authenticate,
  allowRoles('mentor', 'senior_mentor', 'admin', 'super_admin'),
  asyncHandler(async (req, res) => {
    const { interventionId, actionType, studentIds, customMessage } = req.body;

    if (!actionType) {
      throw new HttpError(400, 'Action type is required');
    }

    if (actionType === 'send_checkin_message') {
      const targets = Array.isArray(studentIds) && studentIds.length > 0 ? studentIds : [];
      if (targets.length === 0) {
        throw new HttpError(400, 'Target student IDs required for check-in message');
      }

      const msgText = customMessage || 'Checking in on your BCA coursework progress. Please reach out if you need guidance!';

      const createdMessages = await Promise.all(
        targets.map((sId) =>
          Message.create({
            senderId: req.user.id,
            senderName: req.user.name,
            recipientId: sId,
            scope: 'direct',
            text: msgText,
            category: 'academic_checkin'
          })
        )
      );

      return res.json({
        data: {
          success: true,
          appliedInterventionId: interventionId,
          messagesSentCount: createdMessages.length,
          feedback: `Successfully sent encouragement messages to ${createdMessages.length} student(s).`
        }
      });
    }

    res.json({
      data: {
        success: true,
        appliedInterventionId: interventionId,
        feedback: 'Intervention action logged.'
      }
    });
  })
);

/**
 * 38. POST /ai/career-guide
 * AI Career Guide: Step-by-step skill development roadmap
 */
router.post(
  '/career-guide',
  authenticate,
  allowRoles('student', 'mentor', 'admin'),
  asyncHandler(async (req, res) => {
    const { targetCareerId } = req.body;
    const studentId = req.user.id;

    const guide = await generateCareerRoadmapGuide({
      studentId,
      targetCareerId
    });

    res.json({ data: guide });
  })
);

/**
 * 34. POST /ai/quizzes/generate-for-review
 * AI Quiz Generation with Review & Publish workflow for Mentors
 */
router.post(
  '/quizzes/generate-for-review',
  authenticate,
  allowRoles('mentor', 'senior_mentor', 'admin', 'super_admin'),
  asyncHandler(async (req, res) => {
    const {
      semester = 1,
      subjectCode = '',
      unit = 'all',
      topic = 'all',
      difficulty = 'medium',
      questionTypes = ['mcq', 'true_false', 'short_answer'],
      questionCount = 5
    } = req.body;

    // Generate questions with complete answer keys
    const rawQuiz = await generateAIQuiz({
      semester,
      subjectCode,
      unitNumber: unit,
      topic,
      difficulty,
      questionTypes,
      questionCount
    });

    // Provide complete un-sanitized questions for mentor to review/edit
    const reviewableQuestions = (rawQuiz.questions || []).map((q, idx) => ({
      id: q.id || `q-${idx + 1}`,
      text: q.prompt,
      type: q.type,
      options: q.options || [],
      correctAnswer: q.correctAnswer ?? q.correctOption ?? q.modelAnswer ?? '',
      explanation: q.explanation || '',
      marks: q.maxScore || 1
    }));

    res.json({
      data: {
        title: rawQuiz.title || `AI Assessment: ${rawQuiz.subjectName}`,
        semester: rawQuiz.semester,
        subjectCode: rawQuiz.subjectCode,
        subjectName: rawQuiz.subjectName,
        difficulty: rawQuiz.difficulty,
        questions: reviewableQuestions
      }
    });
  })
);

export default router;
