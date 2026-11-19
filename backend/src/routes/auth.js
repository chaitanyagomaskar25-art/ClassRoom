import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import validate from '../utils/validation.js';
import HttpError from '../utils/httpError.js';
import { authenticate } from '../middleware/auth.js';
import env from '../config/env.js';

const router = express.Router();

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(72),
  role: z.enum(['student', 'mentor', 'senior_mentor', 'admin', 'super_admin', 'scrum']).optional().default('student'),
  enrollmentNumber: z.string().trim().min(2).max(40).optional(),
  semester: z.coerce.number().int().min(1, 'Please select your semester (1 to 6)').max(6, 'Semester must be between 1 and 6').optional().default(1),
  program: z.string().trim().optional().default('BCA (Hons. with Research)'),
  academicYear: z.string().trim().optional(),
  batch: z.string().trim().optional(),
  section: z.string().trim().optional(),
  groupId: z.string().trim().optional(),
  skills: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  careerGoals: z.string().trim().max(1000).optional()
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(72)
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(72),
  newPassword: z.string().min(8).max(72)
});

function createToken(user) {
  return jwt.sign(
    {
      role: user.role,
      tokenVersion: user.tokenVersion || 0
    },
    env.JWT_SECRET,
    {
      subject: String(user.id || user._id),
      expiresIn: env.JWT_EXPIRES_IN
    }
  );
}

/**
 * POST /auth/register
 * Supports Student, Mentor, Senior Mentor, Admin and Super Admin
 */
router.post('/register', validate(registerSchema), asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    role = 'student',
    enrollmentNumber,
    semester = 1,
    program = 'BCA (Hons. with Research)',
    academicYear,
    batch,
    section,
    groupId,
    skills,
    interests,
    careerGoals
  } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new HttpError(409, 'An account with this email address already exists');
  }

  // Enforce semester selection for student registrations
  if (!role || role === 'student') {
    if (!req.body.semester || Number(req.body.semester) < 1 || Number(req.body.semester) > 6) {
      throw new HttpError(400, 'Please select your enrolled semester (Semester 1 to 6) to complete registration');
    }
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role,
    enrollmentNumber,
    semester,
    program,
    academicYear: academicYear || '',
    batch: batch || '',
    section: section || 'A',
    groupId: groupId || '',
    skills: skills || [],
    interests: interests || [],
    careerGoals: careerGoals || '',
    tokenVersion: 0
  });

  res.status(201).json({
    data: {
      user,
      token: createToken(user)
    }
  });
}));

/**
 * POST /auth/login
 * Verifies credentials, generates JWT with session version tracking
 */
router.post('/login', validate(loginSchema), asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email.toLowerCase() }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(req.body.password, user.passwordHash))) {
    throw new HttpError(401, 'Email or password is incorrect');
  }

  res.json({
    data: {
      user,
      token: createToken(user)
    }
  });
}));

/**
 * POST /auth/logout
 * Persistent session termination: increments tokenVersion in MongoDB to revoke all active tokens
 */
router.post('/logout', authenticate, asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { $inc: { tokenVersion: 1 } });
  res.json({
    data: {
      message: 'Logged out successfully. All sessions revoked.'
    }
  });
}));

/**
 * GET /auth/me
 * Returns authenticated user profile and permissions
 */
router.get('/me', authenticate, (req, res) => {
  res.json({ data: { user: req.user } });
});

/**
 * POST /auth/change-password
 * Verifies current password, sets new password, increments tokenVersion to revoke old sessions, and issues a fresh token.
 */
router.post('/change-password', authenticate, validate(changePasswordSchema), asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select('+passwordHash');
  if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
    throw new HttpError(400, 'Current password is incorrect');
  }

  if (currentPassword === newPassword) {
    throw new HttpError(400, 'New password must be different from current password');
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  user.passwordHash = passwordHash;
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  await user.save();

  res.json({
    data: {
      message: 'Password changed successfully. All previous sessions have been revoked.',
      token: createToken(user)
    }
  });
}));

export default router;
