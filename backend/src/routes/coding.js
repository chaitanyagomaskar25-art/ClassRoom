import express from 'express';
import mongoose from 'mongoose';
import CodingProblem from '../models/CodingProblem.js';
import CodingSubmission from '../models/CodingSubmission.js';
import { authenticate } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import HttpError from '../utils/httpError.js';
import {
  evaluateCodeSubmission,
  INITIAL_CODING_PROBLEMS
} from '../services/codeExecutionService.js';
import { awardXP, unlockBadge } from '../services/gamificationService.js';

const router = express.Router();

// Auto-seed initial coding problems if empty
async function ensureProblemsSeeded() {
  const count = await CodingProblem.countDocuments();
  if (count === 0) {
    await CodingProblem.insertMany(INITIAL_CODING_PROBLEMS);
  }
}

/**
 * GET /coding/problems
 * List problems with filters and student completion status
 */
router.get(
  '/problems',
  authenticate,
  asyncHandler(async (req, res) => {
    await ensureProblemsSeeded();

    const { category, difficulty, search } = req.query;
    const filter = {};

    if (category && category !== 'all') {
      filter.category = category;
    }
    if (difficulty && difficulty !== 'all') {
      filter.difficulty = difficulty;
    }
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const [problems, userAcceptedSubmissions] = await Promise.all([
      CodingProblem.find(filter)
        .select('title slug category difficulty points submissionsCount acceptedCount createdAt')
        .sort({ difficulty: 1, points: 1 })
        .lean(),
      CodingSubmission.find({ studentId: req.user.id, status: 'accepted' })
        .select('problemId')
        .lean()
    ]);

    const solvedSet = new Set(userAcceptedSubmissions.map((s) => String(s.problemId)));

    const formatted = problems.map((p) => ({
      ...p,
      isSolved: solvedSet.has(String(p._id)),
      acceptanceRate: p.submissionsCount > 0 ? Math.round((p.acceptedCount / p.submissionsCount) * 100) : 0
    }));

    res.json({ data: { problems: formatted } });
  })
);

/**
 * GET /coding/problems/:id
 * Retrieve problem details with sample test cases (hidden test cases protected)
 */
router.get(
  '/problems/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    await ensureProblemsSeeded();
    const { id } = req.params;

    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { slug: id };
    const problem = await CodingProblem.findOne(query)
      .select('-hiddenTestCases') // Exclude hidden verification cases from client payload
      .lean();

    if (!problem) {
      throw new HttpError(404, 'Coding problem not found');
    }

    const previousSubmission = await CodingSubmission.findOne({
      studentId: req.user.id,
      problemId: problem._id
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      data: {
        problem,
        previousCode: previousSubmission?.code || null,
        isSolved: previousSubmission?.status === 'accepted'
      }
    });
  })
);

/**
 * POST /coding/problems/:id/run
 * Fast test run against visible sample test cases
 */
router.post(
  '/problems/:id/run',
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { code, language = 'javascript' } = req.body;

    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { slug: id };
    const problem = await CodingProblem.findOne(query).select('sampleTestCases').lean();

    if (!problem) throw new HttpError(404, 'Coding problem not found');

    const result = await evaluateCodeSubmission({
      code,
      language,
      testCases: problem.sampleTestCases || []
    });

    res.json({ data: { evaluation: result } });
  })
);

/**
 * POST /coding/problems/:id/submit
 * Authoritative submission evaluation against ALL test cases (visible + hidden)
 */
router.post(
  '/problems/:id/submit',
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { code, language = 'javascript' } = req.body;
    const studentId = req.user.id;

    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { slug: id };
    const problem = await CodingProblem.findOne(query);

    if (!problem) throw new HttpError(404, 'Coding problem not found');

    // Combine sample and hidden test cases for full evaluation
    const allTestCases = (problem.sampleTestCases || []).concat(problem.hiddenTestCases || []);

    const evalResult = await evaluateCodeSubmission({
      code,
      language,
      testCases: allTestCases
    });

    let earnedXP = 0;
    const isAccepted = evalResult.status === 'accepted';

    if (isAccepted) {
      // Check if student already solved this problem before
      const priorSolved = await CodingSubmission.findOne({
        studentId,
        problemId: problem._id,
        status: 'accepted'
      });

      if (!priorSolved) {
        earnedXP = problem.points || 20;
        await awardXP(studentId, earnedXP, `Solved coding problem: ${problem.title}`);
        await unlockBadge(studentId, 'coding_starter');
      }
    }

    // Record submission
    const submission = await CodingSubmission.create({
      studentId,
      studentName: req.user.name,
      problemId: problem._id,
      problemTitle: problem.title,
      category: problem.category,
      difficulty: problem.difficulty,
      language,
      code,
      status: evalResult.status,
      passedTestCasesCount: evalResult.passedTestCasesCount,
      totalTestCasesCount: evalResult.totalTestCasesCount,
      runtimeMs: evalResult.runtimeMs,
      memoryKb: evalResult.memoryKb,
      errorMessage: evalResult.errorMessage,
      earnedXP
    });

    // Increment statistics on problem
    await CodingProblem.findByIdAndUpdate(problem._id, {
      $inc: {
        submissionsCount: 1,
        acceptedCount: isAccepted ? 1 : 0
      }
    });

    res.json({
      data: {
        submissionId: submission._id,
        status: evalResult.status,
        passedTestCasesCount: evalResult.passedTestCasesCount,
        totalTestCasesCount: evalResult.totalTestCasesCount,
        runtimeMs: evalResult.runtimeMs,
        testCaseResults: evalResult.testCaseResults,
        errorMessage: evalResult.errorMessage,
        earnedXP
      }
    });
  })
);

/**
 * GET /coding/submissions/me
 * Student's submission history
 */
router.get(
  '/submissions/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const submissions = await CodingSubmission.find({ studentId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    res.json({ data: { submissions } });
  })
);

/**
 * GET /coding/progress
 * Student coding metrics: problems solved, category mastery, total points
 */
router.get(
  '/progress',
  authenticate,
  asyncHandler(async (req, res) => {
    const studentId = req.user.id;

    const [totalProblems, userSubmissions] = await Promise.all([
      CodingProblem.countDocuments(),
      CodingSubmission.find({ studentId }).sort({ createdAt: -1 }).lean()
    ]);

    const solvedProblemsMap = new Map();
    userSubmissions.forEach((sub) => {
      if (sub.status === 'accepted' && !solvedProblemsMap.has(String(sub.problemId))) {
        solvedProblemsMap.set(String(sub.problemId), sub);
      }
    });

    const solvedCount = solvedProblemsMap.size;
    const totalXPFromCoding = Array.from(solvedProblemsMap.values()).reduce((sum, s) => sum + (s.earnedXP || 0), 0);

    const categoryBreakdown = {};
    solvedProblemsMap.forEach((sub) => {
      categoryBreakdown[sub.category] = (categoryBreakdown[sub.category] || 0) + 1;
    });

    res.json({
      data: {
        totalProblems,
        solvedCount,
        totalSubmissionsCount: userSubmissions.length,
        totalXPFromCoding,
        categoryBreakdown,
        completionPercent: totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0
      }
    });
  })
);

export default router;
