import express from 'express';
import { z } from 'zod';
import User from '../models/User.js';
import UserLearningState from '../models/UserLearningState.js';
import { authenticate, allowRoles } from '../middleware/auth.js';
import validate from '../utils/validation.js';
import asyncHandler from '../utils/asyncHandler.js';
import HttpError from '../utils/httpError.js';
import { validateFilePayload, MAX_AVATAR_SIZE } from '../middleware/fileUpload.js';

const router = express.Router();

const profileUpdateSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  bio: z.string().trim().max(1000).optional(),
  avatar: z.string().trim().optional(),
  profilePhoto: z.string().trim().optional(),
  academicYear: z.string().trim().optional(),
  semester: z.coerce.number().int().min(1, 'Semester must be between 1 and 6').max(6, 'Semester must be between 1 and 6').optional(),
  batch: z.string().trim().optional(),
  section: z.string().trim().optional(),
  skills: z.array(z.string().trim()).optional(),
  interests: z.array(z.string().trim()).optional(),
  careerGoals: z.string().trim().max(1000).optional(),
  phone: z.string().trim().max(20).optional(),
  program: z.string().trim().max(100).optional(),
  enrollmentNumber: z.string().trim().max(40).optional()
});

/**
 * GET /profiles/me
 * Returns the currently authenticated user's profile
 */
router.get('/me', authenticate, (req, res) => {
  res.json({ data: { profile: req.user } });
});

/**
 * PATCH /profiles/me or PUT /profiles/me
 * Updates student personal details, avatar, batch, skills, interests and career goals
 */
async function updateProfileHandler(req, res) {
  const allowedFields = { ...req.body };

  // Validate avatar/profilePhoto if uploaded as data URI
  const photoPayload = allowedFields.profilePhoto || allowedFields.avatar;
  if (photoPayload && typeof photoPayload === 'string' && photoPayload.startsWith('data:')) {
    validateFilePayload(photoPayload, {
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      maxSizeBytes: MAX_AVATAR_SIZE,
      fieldName: 'profilePhoto'
    });
  }

  // Prevent users from tampering with their own role or credentials via profile update
  delete allowedFields.role;
  delete allowedFields.passwordHash;
  delete allowedFields.tokenVersion;

  if (allowedFields.semester !== undefined) {
    allowedFields.semester = Number(allowedFields.semester);
    await UserLearningState.findOneAndUpdate(
      { studentId: req.user.id },
      { $set: { activeSemester: allowedFields.semester } }
    );
  }

  const profile = await User.findByIdAndUpdate(
    req.user.id,
    { $set: allowedFields },
    { new: true, runValidators: true }
  );

  res.json({
    data: {
      profile,
      message: 'Profile updated successfully'
    }
  });
}

router.patch('/me', authenticate, validate(profileUpdateSchema), asyncHandler(updateProfileHandler));
router.put('/me', authenticate, validate(profileUpdateSchema), asyncHandler(updateProfileHandler));

/**
 * GET /profiles/:userId
 * Retrieves user profile with role-based visibility:
 * - Users can view their own profile
 * - Mentors/Senior Mentors/Admins can view student profiles
 */
router.get('/:userId', authenticate, asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const targetUser = await User.findById(userId).select('-passwordHash');

  if (!targetUser) {
    throw new HttpError(404, 'User profile not found');
  }

  // Authorization check
  const isSelf = String(req.user._id) === String(targetUser._id);
  const isPrivileged = ['mentor', 'senior_mentor', 'admin', 'super_admin'].includes(req.user.role);

  if (!isSelf && !isPrivileged) {
    throw new HttpError(403, 'Access denied: You do not have permission to view this profile');
  }

  res.json({ data: { profile: targetUser } });
}));

export default router;
