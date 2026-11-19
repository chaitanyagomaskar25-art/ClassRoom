import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import HttpError from '../utils/httpError.js';
import asyncHandler from '../utils/asyncHandler.js';
import env from '../config/env.js';

/**
 * Authentication Middleware:
 * Verifies Bearer JWT token, loads user, and validates tokenVersion for persistent session invalidation.
 */
export const authenticate = asyncHandler(async (req, _res, next) => {
  const [scheme, token] = (req.get('authorization') || '').split(' ');
  if (scheme !== 'Bearer' || !token) throw new HttpError(401, 'Authentication required');

  let payload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET);
  } catch {
    throw new HttpError(401, 'Invalid or expired token');
  }

  const user = await User.findById(payload.sub);
  if (!user) throw new HttpError(401, 'Account not found');

  // Session revocation check: if user logged out or invalidated tokens
  if (payload.tokenVersion !== undefined && user.tokenVersion !== undefined) {
    if (user.tokenVersion !== payload.tokenVersion) {
      throw new HttpError(401, 'Session has expired or was logged out. Please sign in again.');
    }
  }

  req.user = user;
  next();
});

/**
 * Role-Based Access Control Middleware:
 * Supports: 'student', 'mentor', 'senior_mentor', 'admin', 'super_admin'
 * Super admin inherits all admin permissions automatically.
 */
export function allowRoles(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new HttpError(401, 'Authentication required'));
    }

    const userRole = req.user.role;

    // Super admin has universal role clearance
    if (userRole === 'super_admin') {
      return next();
    }

    // Scrum master has clearance over mentor, senior_mentor, admin, and scrum oversight
    if (userRole === 'scrum' && (roles.includes('scrum') || roles.includes('mentor') || roles.includes('senior_mentor') || roles.includes('admin'))) {
      return next();
    }

    // Admin inherits senior_mentor and mentor permissions
    if (userRole === 'admin' && (roles.includes('admin') || roles.includes('senior_mentor') || roles.includes('mentor'))) {
      return next();
    }

    // Senior mentor inherits mentor permissions
    if (userRole === 'senior_mentor' && (roles.includes('senior_mentor') || roles.includes('mentor'))) {
      return next();
    }

    if (!roles.includes(userRole)) {
      return next(new HttpError(403, 'You do not have permission to access this resource'));
    }

    next();
  };
}

/**
 * Resource-Level Authorization (ABAC):
 * Ensures:
 * - Student: accesses ONLY their own record (studentId === req.user.id)
 * - Mentor: accesses their assigned students (student.mentorId === req.user.id)
 * - Senior Mentor: accesses students in their group or cohort (student.groupId === req.user.groupId || student.seniorMentorId === req.user.id)
 * - Admin / Super Admin: access institutional data
 */
export function authorizeStudentAccess(getStudentId = (req) => req.params.studentId || req.body.studentId) {
  return asyncHandler(async (req, _res, next) => {
    const targetStudentId = getStudentId(req);
    if (!targetStudentId) {
      return next(new HttpError(400, 'Student identifier is required'));
    }

    const user = req.user;
    if (!user) {
      return next(new HttpError(401, 'Authentication required'));
    }

    // Super Admin, Admin & Scrum have institutional clearance
    if (user.role === 'super_admin' || user.role === 'admin' || user.role === 'scrum') {
      return next();
    }

    // Student can only access their own record
    if (user.role === 'student') {
      if (String(user._id) !== String(targetStudentId)) {
        return next(new HttpError(403, 'Access denied: You cannot access another student\'s records'));
      }
      return next();
    }

    // Fetch the target student to check mentor/group hierarchy
    const student = await User.findById(targetStudentId).select('mentorId seniorMentorId groupId institution');
    if (!student) {
      return next(new HttpError(404, 'Student record not found'));
    }

    // Mentor: verify direct assignment
    if (user.role === 'mentor') {
      if (String(student.mentorId) !== String(user._id)) {
        return next(new HttpError(403, 'Access denied: This student is not assigned to your mentorship'));
      }
      return next();
    }

    // Senior Mentor: verify group assignment or senior mentor assignment
    if (user.role === 'senior_mentor') {
      const isDirectSenior = String(student.seniorMentorId) === String(user._id);
      const isGroupMatch = user.groupId && student.groupId && user.groupId === student.groupId;
      if (!isDirectSenior && !isGroupMatch) {
        return next(new HttpError(403, 'Access denied: This student is not in your assigned group or cohort'));
      }
      return next();
    }

    return next(new HttpError(403, 'Access denied: Unauthorized to view this resource'));
  });
}
