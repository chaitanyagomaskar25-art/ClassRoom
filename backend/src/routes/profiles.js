const express = require('express');
const { z } = require('zod');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const validate = require('../utils/validation');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/httpError');

const router = express.Router();
const profileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  semester: z.number().int().min(1).max(8).optional(),
  program: z.string().trim().min(2).max(100).optional(),
  bio: z.string().trim().max(500).optional()
}).strict();

router.get('/me', authenticate, (req, res) => res.json({ data: { profile: req.user } }));
router.patch('/me', authenticate, validate(profileSchema), asyncHandler(async (req, res) => {
  if (req.user.role !== 'student') throw new HttpError(403, 'Only students can update this profile');
  const profile = await User.findByIdAndUpdate(req.user.id, { $set: req.body }, {
    new: true, runValidators: true
  });
  res.json({ data: { profile } });
}));

module.exports = router;
