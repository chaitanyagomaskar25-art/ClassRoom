const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../utils/validation');
const HttpError = require('../utils/httpError');
const { authenticate } = require('../middleware/auth');
const env = require('../config/env');

const router = express.Router();
const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(72),
  enrollmentNumber: z.string().trim().min(2).max(40).optional(),
  semester: z.number().int().min(1).max(8).optional()
});
const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(72)
});

function createToken(user) {
  return jwt.sign({ role: user.role }, env.JWT_SECRET, {
    subject: user.id,
    expiresIn: env.JWT_EXPIRES_IN
  });
}

router.post('/register', validate(registerSchema), asyncHandler(async (req, res) => {
  const { name, email, password, enrollmentNumber, semester } = req.body;
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name, email, passwordHash, enrollmentNumber, semester, role: 'student'
  });
  res.status(201).json({ data: { user, token: createToken(user) } });
}));

router.post('/login', validate(loginSchema), asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email.toLowerCase() }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(req.body.password, user.passwordHash))) {
    throw new HttpError(401, 'Email or password is incorrect');
  }
  res.json({ data: { user, token: createToken(user) } });
}));

router.get('/me', authenticate, (req, res) => {
  res.json({ data: { user: req.user } });
});

module.exports = router;
