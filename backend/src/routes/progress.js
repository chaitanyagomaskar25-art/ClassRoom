const express = require('express');
const { z } = require('zod');
const Lesson = require('../models/Lesson');
const LessonProgress = require('../models/LessonProgress');
const { authenticate, allowRoles } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../utils/validation');
const HttpError = require('../utils/httpError');

const router = express.Router();
const progressSchema = z.object({
  status: z.enum(['in_progress', 'completed'])
});

router.get('/me', authenticate, allowRoles('student'), asyncHandler(async (req, res) => {
  const progress = await LessonProgress.find({ studentId: req.user.id })
    .populate({ path: 'lessonId', select: 'title topicId order' })
    .sort({ updatedAt: -1 });
  res.json({ data: { progress } });
}));

async function updateLessonProgress(req, res, status) {
    if (!await Lesson.exists({ _id: req.params.lessonId })) throw new HttpError(404, 'Lesson not found');
    const now = new Date();
    const progress = await LessonProgress.findOneAndUpdate(
      { studentId: req.user.id, lessonId: req.params.lessonId },
      {
        $set: {
          status,
          lastAccessedAt: now,
          completedAt: status === 'completed' ? now : null
        },
        $setOnInsert: { studentId: req.user.id, lessonId: req.params.lessonId }
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.json({ data: { progress } });
}

router.put('/lessons/:lessonId', authenticate, allowRoles('student'),
  validate(progressSchema), asyncHandler(async (req, res) => {
    await updateLessonProgress(req, res, req.body.status);
  }));

router.post('/lessons/:lessonId/complete', authenticate, allowRoles('student'),
  asyncHandler(async (req, res) => {
    await updateLessonProgress(req, res, 'completed');
  }));

module.exports = router;
