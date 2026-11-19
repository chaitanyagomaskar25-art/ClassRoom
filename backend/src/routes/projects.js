import express from 'express';
import mongoose from 'mongoose';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { authenticate, allowRoles } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import HttpError from '../utils/httpError.js';
import { awardXP, checkAndUnlockBadges } from '../services/gamificationService.js';

const router = express.Router();

router.use(authenticate);

/**
 * GET /projects
 * List projects for current student or mentor reviewing cohort
 */
router.get('/', asyncHandler(async (req, res) => {
  const isMentor = ['mentor', 'senior_mentor', 'admin', 'super_admin'].includes(req.user.role);

  if (isMentor) {
    const { studentId, semester, status } = req.query;
    const query = {};

    if (studentId) query.studentId = studentId;
    if (semester) query.semester = Number(semester);
    if (status) query.status = status;

    const projects = await Project.find(query)
      .sort({ updatedAt: -1 })
      .lean();

    return res.json({ data: { projects } });
  }

  // Student perspective
  const projects = await Project.find({ studentId: req.user.id })
    .sort({ createdAt: -1 })
    .lean();

  res.json({ data: { projects } });
}));

/**
 * POST /projects
 * Student creates new project
 */
router.post(
  '/',
  allowRoles('student'),
  asyncHandler(async (req, res) => {
    const {
      title,
      description,
      category,
      techStack,
      requirements,
      milestones,
      tasks,
      githubUrl,
      liveDemoUrl,
      documentationUrl,
      semester
    } = req.body;

    if (!title || !title.trim()) {
      throw new HttpError(400, 'Project title is required');
    }

    const formattedMilestones = Array.isArray(milestones) && milestones.length > 0
      ? milestones.map((m, idx) => ({
          id: m.id || `ms-${Date.now()}-${idx + 1}`,
          title: m.title || `Milestone ${idx + 1}`,
          description: m.description || '',
          completed: Boolean(m.completed),
          completedAt: m.completed ? new Date() : null
        }))
      : [
          { id: `ms-${Date.now()}-1`, title: 'Architecture & Schema Specification', completed: true, completedAt: new Date() },
          { id: `ms-${Date.now()}-2`, title: 'Core Implementation & CRUD Modules', completed: false, completedAt: null },
          { id: `ms-${Date.now()}-3`, title: 'Quality Assurance & Testing', completed: false, completedAt: null },
          { id: `ms-${Date.now()}-4`, title: 'Production Deployment & Presentation', completed: false, completedAt: null }
        ];

    const completedMilestones = formattedMilestones.filter((m) => m.completed).length;
    const completionPercent = Math.round((completedMilestones / formattedMilestones.length) * 100);

    const project = await Project.create({
      studentId: req.user.id,
      studentName: req.user.name,
      studentEmail: req.user.email,
      semester: Number(semester || req.user.semester || 1),
      title: title.trim(),
      description: description || '',
      category: category || 'Full-Stack Web',
      techStack: Array.isArray(techStack) ? techStack : ['JavaScript', 'Node.js', 'Express', 'React'],
      requirements: Array.isArray(requirements) ? requirements : [],
      milestones: formattedMilestones,
      tasks: Array.isArray(tasks) ? tasks : [],
      githubUrl: githubUrl || '',
      liveDemoUrl: liveDemoUrl || '',
      documentationUrl: documentationUrl || '',
      status: completionPercent >= 100 ? 'completed' : 'in_progress',
      completionPercent
    });

    // Award +50 XP for launching a project
    await awardXP(req.user.id, 50, 'project_created');
    await checkAndUnlockBadges(req.user.id);

    res.status(201).json({
      data: {
        message: 'Project created and initialized in your portfolio',
        project
      }
    });
  })
);

/**
 * GET /projects/:id
 * Get single project
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).lean();
  if (!project) throw new HttpError(404, 'Project not found');

  res.json({ data: { project } });
}));

/**
 * PUT /projects/:id
 * Update project
 */
router.put('/:id', asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new HttpError(404, 'Project not found');

  const isOwner = String(project.studentId) === String(req.user.id);
  const isPrivileged = ['admin', 'super_admin'].includes(req.user.role);

  if (!isOwner && !isPrivileged) {
    throw new HttpError(403, 'Permission denied to edit this project');
  }

  const fields = [
    'title',
    'description',
    'category',
    'techStack',
    'requirements',
    'milestones',
    'tasks',
    'githubUrl',
    'liveDemoUrl',
    'documentationUrl',
    'status',
    'isPortfolioFeatured',
    'completionPercent'
  ];

  fields.forEach((f) => {
    if (req.body[f] !== undefined) {
      project[f] = req.body[f];
    }
  });

  // Re-calculate completion percent if milestones exist
  if (Array.isArray(project.milestones) && project.milestones.length > 0) {
    const done = project.milestones.filter((m) => m.completed).length;
    project.completionPercent = Math.round((done / project.milestones.length) * 100);
    if (project.completionPercent >= 100) {
      project.status = 'completed';
    }
  }

  await project.save();

  if (project.status === 'completed') {
    await awardXP(project.studentId, 50, 'project_completed');
    await checkAndUnlockBadges(project.studentId);
  }

  res.json({
    data: {
      message: 'Project updated successfully',
      project
    }
  });
}));

/**
 * POST /projects/:id/review
 * Mentor reviews and provides feedback on a project
 */
router.post(
  '/:id/review',
  allowRoles('mentor', 'senior_mentor', 'admin', 'super_admin'),
  asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);
    if (!project) throw new HttpError(404, 'Project not found');

    const { rating, feedback, approved = true } = req.body;

    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      throw new HttpError(400, 'Rating must be an integer between 1 and 5');
    }

    project.mentorReview = {
      mentorId: req.user.id,
      mentorName: req.user.name || 'Mentor',
      rating: Number(rating),
      feedback: feedback || '',
      approved: Boolean(approved),
      reviewedAt: new Date()
    };

    if (approved) {
      project.status = 'completed';
      project.completionPercent = 100;
      await awardXP(project.studentId, 40, 'project_mentor_approved');
      await checkAndUnlockBadges(project.studentId);
    }

    await project.save();

    res.json({
      data: {
        message: 'Project evaluation and mentor review recorded successfully',
        project
      }
    });
  })
);

/**
 * DELETE /projects/:id
 * Delete project
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new HttpError(404, 'Project not found');

  const isOwner = String(project.studentId) === String(req.user.id);
  const isPrivileged = ['admin', 'super_admin'].includes(req.user.role);

  if (!isOwner && !isPrivileged) {
    throw new HttpError(403, 'Permission denied to delete this project');
  }

  await project.deleteOne();
  res.json({ data: { message: 'Project removed successfully' } });
}));

export default router;
