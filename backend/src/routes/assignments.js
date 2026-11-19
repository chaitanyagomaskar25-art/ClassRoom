import express from 'express';
import mongoose from 'mongoose';
import Assignment from '../models/Assignment.js';
import User from '../models/User.js';
import { authenticate, allowRoles } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import HttpError from '../utils/httpError.js';
import { awardXP, checkAndUnlockBadges } from '../services/gamificationService.js';

const router = express.Router();

/**
 * GET /assignments
 * List assignments for current user
 */
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const isMentor = ['mentor', 'senior_mentor', 'admin', 'super_admin', 'scrum'].includes(req.user.role);

  if (isMentor) {
    const filter = req.user.role === 'super_admin' || req.user.role === 'admin' || req.user.role === 'scrum'
      ? {}
      : { mentorId: req.user.id };

    const assignments = await Assignment.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    const formatted = assignments.map((asg) => {
      const submissions = asg.submissions || [];
      const pendingReviews = submissions.filter((s) => s.status === 'submitted').length;
      const gradedCount = submissions.filter((s) => s.status === 'graded').length;

      return {
        ...asg,
        submissionStats: {
          totalSubmissions: submissions.length,
          pendingReviews,
          gradedCount
        }
      };
    });

    return res.json({ data: { assignments: formatted } });
  }

  // Student perspective - strictly scoped to enrolled semester
  const student = await User.findById(req.user.id).lean();
  const studentSemester = student?.semester || req.user.semester || 1;

  const assignments = await Assignment.find({
    status: { $ne: 'draft' },
    $or: [
      { targetSemester: studentSemester },
      { targetStudentIds: req.user.id }
    ]
  })
    .sort({ dueDate: 1 })
    .lean();

  const formatted = assignments.map((asg) => {
    const mySub = (asg.submissions || []).find((s) => String(s.studentId) === String(req.user.id));
    const isOverdue = !mySub && asg.dueDate && new Date(asg.dueDate) < new Date();

    return {
      _id: asg._id,
      title: asg.title,
      description: asg.description,
      subjectCode: asg.subjectCode,
      subjectName: asg.subjectName,
      topic: asg.topic,
      instructions: asg.instructions,
      attachments: asg.attachments,
      totalMarks: asg.totalMarks,
      passingMarks: asg.passingMarks,
      dueDate: asg.dueDate,
      status: asg.status,
      mentorName: asg.mentorName,
      isOverdue,
      mySubmission: mySub || null
    };
  });

  res.json({ data: { assignments: formatted } });
}));

/**
 * POST /assignments
 * Create assignment (Mentors and Admins)
 */
router.post(
  '/',
  authenticate,
  allowRoles('mentor', 'senior_mentor', 'admin', 'super_admin', 'scrum'),
  asyncHandler(async (req, res) => {
    const {
      title,
      description,
      subjectCode,
      subjectName,
      topic,
      instructions,
      attachments,
      targetType,
      targetSemester,
      targetBatch,
      targetStudentIds,
      totalMarks,
      passingMarks,
      dueDate
    } = req.body;

    if (!title || !subjectCode || !subjectName || !dueDate) {
      throw new HttpError(400, 'Title, subjectCode, subjectName, and dueDate are required');
    }

    const assignment = await Assignment.create({
      mentorId: req.user.id,
      mentorName: req.user.name || 'Mentor',
      title,
      description: description || '',
      subjectCode,
      subjectName,
      topic: topic || '',
      instructions: instructions || '',
      attachments: Array.isArray(attachments) ? attachments : [],
      targetType: targetType || 'semester',
      targetSemester: Number(targetSemester) || 1,
      targetBatch: targetBatch || '',
      targetStudentIds: Array.isArray(targetStudentIds) ? targetStudentIds : [],
      totalMarks: Number(totalMarks) || 25,
      passingMarks: Number(passingMarks) || 10,
      dueDate: new Date(dueDate),
      status: 'active'
    });

    res.status(201).json({
      data: {
        assignment,
        message: 'Assignment successfully created and published'
      }
    });
  })
);

/**
 * GET /assignments/:id
 * Get single assignment with submissions
 */
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id).lean();
  if (!assignment) throw new HttpError(404, 'Assignment not found');

  const isMentor = ['mentor', 'senior_mentor', 'admin', 'super_admin', 'scrum'].includes(req.user.role);

  if (isMentor) {
    return res.json({ data: { assignment } });
  }

  // Student semester lock verification
  const student = await User.findById(req.user.id).lean();
  const studentSemester = student?.semester || req.user.semester || 1;
  const isTargetStudent = (assignment.targetStudentIds || []).some((id) => String(id) === String(req.user.id));
  if (assignment.targetSemester && Number(assignment.targetSemester) !== Number(studentSemester) && !isTargetStudent) {
    throw new HttpError(403, `This assignment is for Semester ${assignment.targetSemester}. It is locked for your enrolled semester (Semester ${studentSemester}).`);
  }

  // If student, filter submissions to only their own
  const mySub = (assignment.submissions || []).find((s) => String(s.studentId) === String(req.user.id));
  delete assignment.submissions;

  res.json({
    data: {
      assignment: {
        ...assignment,
        mySubmission: mySub || null
      }
    }
  });
}));

/**
 * PUT /assignments/:id
 * Update assignment (Mentor or Admin)
 */
router.put(
  '/:id',
  authenticate,
  allowRoles('mentor', 'senior_mentor', 'admin', 'super_admin', 'scrum'),
  asyncHandler(async (req, res) => {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) throw new HttpError(404, 'Assignment not found');

    if (
      req.user.role !== 'super_admin' &&
      req.user.role !== 'admin' &&
      req.user.role !== 'scrum' &&
      String(assignment.mentorId) !== String(req.user.id)
    ) {
      throw new HttpError(403, 'Permission denied to edit this assignment');
    }

    const updatable = [
      'title',
      'description',
      'subjectCode',
      'subjectName',
      'topic',
      'instructions',
      'attachments',
      'targetType',
      'targetSemester',
      'targetBatch',
      'targetStudentIds',
      'totalMarks',
      'passingMarks',
      'dueDate',
      'status'
    ];

    updatable.forEach((field) => {
      if (req.body[field] !== undefined) {
        assignment[field] = req.body[field];
      }
    });

    await assignment.save();
    res.json({ data: { assignment } });
  })
);

/**
 * DELETE /assignments/:id
 * Delete assignment (Mentor or Admin)
 */
router.delete(
  '/:id',
  authenticate,
  allowRoles('mentor', 'senior_mentor', 'admin', 'super_admin', 'scrum'),
  asyncHandler(async (req, res) => {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) throw new HttpError(404, 'Assignment not found');

    if (
      req.user.role !== 'super_admin' &&
      req.user.role !== 'admin' &&
      req.user.role !== 'scrum' &&
      String(assignment.mentorId) !== String(req.user.id)
    ) {
      throw new HttpError(403, 'Permission denied to delete this assignment');
    }

    await assignment.deleteOne();
    res.json({ data: { message: 'Assignment deleted successfully' } });
  })
);

/**
 * POST /assignments/:id/submit
 * Student submits work
 */
router.post(
  '/:id/submit',
  authenticate,
  allowRoles('student'),
  asyncHandler(async (req, res) => {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) throw new HttpError(404, 'Assignment not found');

    if (assignment.status === 'closed') {
      throw new HttpError(400, 'This assignment is closed for submissions');
    }

    const student = await User.findById(req.user.id).lean();
    const studentSemester = student?.semester || req.user.semester || 1;
    const isTargetStudent = (assignment.targetStudentIds || []).some((id) => String(id) === String(req.user.id));
    if (assignment.targetSemester && Number(assignment.targetSemester) !== Number(studentSemester) && !isTargetStudent) {
      throw new HttpError(403, `This assignment belongs to Semester ${assignment.targetSemester}. It is locked for your enrolled semester (Semester ${studentSemester}).`);
    }

    const { content, attachmentUrl, notes } = req.body;
    if (!content && !attachmentUrl) {
      throw new HttpError(400, 'Please provide written content or an attachment link for your submission');
    }

    // Find existing submission or append new
    const existingIndex = assignment.submissions.findIndex(
      (s) => String(s.studentId) === String(req.user.id)
    );

    const submissionData = {
      studentId: req.user.id,
      studentName: req.user.name,
      studentEmail: req.user.email,
      content: content || '',
      attachmentUrl: attachmentUrl || '',
      notes: notes || '',
      submittedAt: new Date(),
      status: 'submitted'
    };

    if (existingIndex >= 0) {
      // Overwrite/update previous submission
      assignment.submissions[existingIndex].content = submissionData.content;
      assignment.submissions[existingIndex].attachmentUrl = submissionData.attachmentUrl;
      assignment.submissions[existingIndex].notes = submissionData.notes;
      assignment.submissions[existingIndex].submittedAt = submissionData.submittedAt;
      assignment.submissions[existingIndex].status = 'submitted';
    } else {
      assignment.submissions.push(submissionData);
    }

    await assignment.save();

    // Award XP and check badges for student submission
    await awardXP(req.user.id, 30, 'assignment_submission');
    await checkAndUnlockBadges(req.user.id);

    res.status(200).json({
      data: {
        message: 'Assignment submitted successfully',
        submission: existingIndex >= 0 ? assignment.submissions[existingIndex] : submissionData
      }
    });
  })
);

/**
 * POST /assignments/:id/grade/:submissionId
 * Mentor reviews and grades a submission
 */
router.post(
  '/:id/grade/:submissionId',
  authenticate,
  allowRoles('mentor', 'senior_mentor', 'admin', 'super_admin', 'scrum'),
  asyncHandler(async (req, res) => {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) throw new HttpError(404, 'Assignment not found');

    if (
      req.user.role !== 'super_admin' &&
      req.user.role !== 'admin' &&
      req.user.role !== 'scrum' &&
      String(assignment.mentorId) !== String(req.user.id)
    ) {
      throw new HttpError(403, 'Permission denied: You can only grade assignments created by you');
    }

    const submission = assignment.submissions.id(req.params.submissionId);
    if (!submission) throw new HttpError(404, 'Submission not found');

    const { marksObtained, feedback, status } = req.body;

    if (marksObtained !== undefined) {
      const marks = Number(marksObtained);
      if (isNaN(marks) || marks < 0 || marks > assignment.totalMarks) {
        throw new HttpError(400, `Marks must be between 0 and total marks (${assignment.totalMarks})`);
      }
      submission.marksObtained = marks;
    }

    if (feedback !== undefined) {
      submission.feedback = feedback;
    }

    submission.status = status || 'graded';
    submission.gradedAt = new Date();
    submission.gradedBy = req.user.id;

    await assignment.save();

    // Award bonus XP to evaluated student
    if (submission.studentId) {
      await awardXP(submission.studentId, 20, 'assignment_graded');
      await checkAndUnlockBadges(submission.studentId);
    }

    res.json({
      data: {
        message: 'Submission successfully evaluated and feedback recorded',
        submission
      }
    });
  })
);

export default router;
