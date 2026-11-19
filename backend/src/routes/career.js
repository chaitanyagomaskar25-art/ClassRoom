import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import UserLearningState from '../models/UserLearningState.js';
import LessonProgress from '../models/LessonProgress.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Project from '../models/Project.js';
import { authenticate } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import HttpError from '../utils/httpError.js';
import {
  CAREER_PATHS,
  INTERVIEW_QUESTIONS,
  COMPANY_PACKS,
  PLACEMENT_ROADMAPS,
  evaluateCareerSuitability
} from '../services/careerPlacementService.js';
import { calculateLevel } from '../services/gamificationService.js';

const router = express.Router();

/**
 * GET /career/paths
 * List all available career guides
 */
router.get('/paths', (_req, res) => {
  res.json({ data: { careerPaths: CAREER_PATHS } });
});

/**
 * GET /career/assessment
 * Run dynamic career assessment for authenticated student
 */
router.get('/assessment', authenticate, asyncHandler(async (req, res) => {
  const studentId = req.user.id;

  const [user, completedLessons, quizAttempts, projects] = await Promise.all([
    User.findById(studentId).select('skills interests careerGoals semester batch').lean(),
    LessonProgress.find({ studentId, status: 'completed' }).select('lessonId subjectCode').lean(),
    QuizAttempt.find({ studentId }).select('subjectCode score topic assessmentType').lean(),
    Project.find({ studentId }).select('title category techStack status').lean()
  ]);

  const assessmentResults = evaluateCareerSuitability({
    skills: user?.skills || [],
    interests: user?.interests || [],
    careerGoals: user?.careerGoals || '',
    completedLessons,
    quizAttempts,
    projects
  });

  const topMatch = assessmentResults[0];

  res.json({
    data: {
      studentId,
      topCareerMatch: topMatch,
      careerRecommendations: assessmentResults,
      profileSummary: {
        skillsCount: (user?.skills || []).length,
        projectsCount: projects.length,
        quizzesTaken: quizAttempts.length
      }
    }
  });
}));

/**
 * GET /career/portfolio/:studentId
 * Public / Sharable portfolio endpoint
 */
router.get('/portfolio/:studentId', asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    throw new HttpError(400, 'Invalid student identifier');
  }

  const [user, learningState, projects, completedLessonsCount] = await Promise.all([
    User.findById(studentId)
      .select('name avatar profilePhoto semester program academicYear batch section bio skills interests careerGoals institution createdAt')
      .lean(),
    UserLearningState.findOne({ studentId }).select('streak achievements certificates').lean(),
    Project.find({ studentId, isPortfolioFeatured: true }).lean(),
    LessonProgress.countDocuments({ studentId, status: 'completed' })
  ]);

  if (!user) throw new HttpError(404, 'Portfolio not found for this student');

  const levelInfo = calculateLevel(user.xp || 0);

  res.json({
    data: {
      portfolio: {
        profile: {
          name: user.name,
          avatar: user.avatar,
          bio: user.bio || 'BCA (Hons. with Research) Candidate.',
          semester: user.semester,
          batch: user.batch,
          section: user.section,
          program: user.program,
          institution: user.institution,
          skills: user.skills || [],
          interests: user.interests || [],
          careerGoals: user.careerGoals || ''
        },
        academics: {
          level: levelInfo.level,
          rankTitle: levelInfo.rankTitle,
          completedLessonsCount,
          streakDays: learningState?.streak?.currentStreak || 1
        },
        projects: projects.map((p) => ({
          _id: p._id,
          title: p.title,
          description: p.description,
          category: p.category,
          techStack: p.techStack,
          githubUrl: p.githubUrl,
          liveDemoUrl: p.liveDemoUrl,
          status: p.status,
          completionPercent: p.completionPercent,
          mentorRating: p.mentorReview?.rating || null
        })),
        certificates: learningState?.certificates || [],
        achievements: (user.badges || []).concat(learningState?.achievements || [])
      }
    }
  });
}));

/**
 * GET /career/resume
 * Auto-generate complete structured resume data from MongoDB
 */
router.get('/resume', authenticate, asyncHandler(async (req, res) => {
  const studentId = req.user.id;

  const [user, learningState, projects, completedLessonsCount] = await Promise.all([
    User.findById(studentId)
      .select('name email phone enrollmentNumber semester program academicYear batch section bio skills interests careerGoals institution')
      .lean(),
    UserLearningState.findOne({ studentId }).select('certificates achievements').lean(),
    Project.find({ studentId }).sort({ completionPercent: -1 }).limit(6).lean(),
    LessonProgress.countDocuments({ studentId, status: 'completed' })
  ]);

  const levelInfo = calculateLevel(user?.xp || 0);

  const resumePayload = {
    header: {
      name: user?.name || 'Student Name',
      email: user?.email || '',
      phone: user?.phone || '+91 98765 43210',
      enrollmentNumber: user?.enrollmentNumber || 'BCA001',
      location: 'India',
      portfolioUrl: `https://portfolio.edu/${studentId}`,
      githubUrl: 'https://github.com',
      linkedinUrl: 'https://linkedin.com/in'
    },
    summary: user?.bio || `Dedicated and results-oriented Bachelor of Computer Applications (Hons. with Research) student with practical experience in full-stack web development, algorithmic computing, and database management. Eager to contribute scalable software engineering solutions.`,
    education: [
      {
        institution: 'Faculty of Computing & Information Technology',
        campus: '',
        degree: 'Bachelor of Computer Applications – B.C.A. (Hons. with Research)',
        batch: user?.batch || '',
        semester: `Semester ${user?.semester || 1}`,
        gpa: '8.8 / 10.0 (Current Academic Standing)',
        highlights: 'NEP 2020 Aligned 4-Year Undergraduate Program in Computing Foundations, Systems & Applied AI.'
      }
    ],
    skills: {
      programmingLanguages: (user?.skills || []).slice(0, 5),
      frameworksAndLibraries: ['React', 'Node.js', 'Express', 'Tailwind CSS'],
      databasesAndTools: ['MongoDB', 'PostgreSQL', 'Git & GitHub', 'Linux CLI', 'Postman']
    },
    projects: projects.map((p) => ({
      title: p.title,
      category: p.category,
      techStack: p.techStack || [],
      description: p.description,
      bullets: [
        `Architected end-to-end ${p.category} application leveraging ${(p.techStack || []).join(', ')}.`,
        `Integrated responsive client UI with verified RESTful backend endpoints and persistent MongoDB schemas.`,
        p.githubUrl ? `Source code maintained at: ${p.githubUrl}` : 'Production-ready codebase structured with modern engineering patterns.'
      ],
      githubUrl: p.githubUrl,
      liveDemoUrl: p.liveDemoUrl
    })),
    certifications: (learningState?.certificates || []).map((c) => ({
      title: `Certificate of Course Completion: ${c.subjectName}`,
      issuer: 'Department of Computer Science & Engineering',
      grade: c.grade || 'A+',
      date: new Date(c.issuedAt).toLocaleDateString()
    })),
    achievements: [
      `Earned ${user?.badges?.length || 4} verified institutional achievement badges including Level ${levelInfo.level} (${levelInfo.rankTitle}).`,
      `Completed ${completedLessonsCount} interactive computing modules across university curriculum.`
    ]
  };

  res.json({ data: { resume: resumePayload } });
}));

/**
 * GET /career/interviews/categories
 * Get interview question categories & questions
 */
router.get('/interviews/categories', (_req, res) => {
  const categories = Array.from(new Set(INTERVIEW_QUESTIONS.map((q) => q.category)));
  res.json({ data: { categories } });
});

router.get('/interviews/questions', (req, res) => {
  const { category, difficulty } = req.query;
  let questions = INTERVIEW_QUESTIONS;

  if (category && category !== 'all') {
    questions = questions.filter((q) => q.category === category);
  }
  if (difficulty && difficulty !== 'all') {
    questions = questions.filter((q) => q.difficulty.toLowerCase() === difficulty.toLowerCase());
  }

  res.json({ data: { questions } });
});

/**
 * POST /career/interviews/mock/submit
 * Evaluate student answer against model rubric
 */
router.post('/interviews/mock/submit', authenticate, (req, res) => {
  const { questionId, answer } = req.body;
  if (!answer || !answer.trim()) {
    throw new HttpError(400, 'Answer content cannot be empty');
  }

  const questionObj = INTERVIEW_QUESTIONS.find((q) => q.id === questionId) || INTERVIEW_QUESTIONS[0];
  const words = answer.trim().split(/\s+/).length;

  // Rubric evaluation
  let score = 50;
  const feedbackPoints = [];

  // 1. Length & depth check
  if (words >= 60) {
    score += 20;
    feedbackPoints.push('Thorough response depth with solid conceptual elaboration.');
  } else if (words >= 30) {
    score += 10;
    feedbackPoints.push('Good answer structure, but consider providing more practical technical details.');
  } else {
    feedbackPoints.push('Response is somewhat brief; elaborate further on implementation mechanics.');
  }

  // 2. Keyword check against key points
  let matchedPoints = 0;
  (questionObj.keyPoints || []).forEach((point) => {
    const pointKeywords = point.toLowerCase().split(/\s+/).filter((w) => w.length > 4);
    const hasMatch = pointKeywords.some((w) => answer.toLowerCase().includes(w));
    if (hasMatch) matchedPoints++;
  });

  score += Math.min(30, matchedPoints * 10);
  score = Math.min(95, score);

  res.json({
    data: {
      evaluation: {
        score,
        rating: score >= 80 ? 'Excellent' : score >= 65 ? 'Good' : 'Needs Practice',
        feedbackPoints,
        sampleModelAnswer: questionObj.sampleAnswer,
        keyPointsExpected: questionObj.keyPoints,
        commonMistakesToAvoid: questionObj.commonMistakes
      }
    }
  });
});

/**
 * GET /career/placement/dashboard
 * Complete placement preparation packs, aptitude topics, and roadmaps
 */
router.get('/placement/dashboard', (_req, res) => {
  res.json({
    data: {
      companyPacks: COMPANY_PACKS,
      placementRoadmaps: PLACEMENT_ROADMAPS,
      aptitudeSections: [
        { title: 'Quantitative Aptitude', topicsCount: 18, practiceQuestions: 350 },
        { title: 'Logical Reasoning & Puzzles', topicsCount: 14, practiceQuestions: 280 },
        { title: 'Verbal Ability & Grammar', topicsCount: 12, practiceQuestions: 220 },
        { title: 'Programming Pseudocode & Output', topicsCount: 10, practiceQuestions: 200 }
      ]
    }
  });
});

export default router;
