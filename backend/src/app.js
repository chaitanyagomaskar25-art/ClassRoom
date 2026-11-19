import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import env from './config/env.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profiles.js';
import curriculumRoutes from './routes/curriculum.js';
import progressRoutes from './routes/progress.js';
import quizRoutes from './routes/quizzes.js';
import dashboardRoutes from './routes/dashboard.js';
import mentorRoutes from './routes/mentor.js';
import studyPlanRoutes from './routes/studyPlan.js';
import adminRoutes from './routes/admin.js';
import assignmentRoutes from './routes/assignments.js';
import mentorQuizRoutes from './routes/mentorQuizzes.js';
import communicationRoutes from './routes/communication.js';
import gamificationRoutes from './routes/gamification.js';
import projectRoutes from './routes/projects.js';
import careerRoutes from './routes/career.js';
import aiRoutes from './routes/aiAssistant.js';
import codingRoutes from './routes/coding.js';
import communityRoutes from './routes/community.js';
import notificationRoutes from './routes/notifications.js';
import mongoSanitize from './middleware/mongoSanitize.js';
import { requestLogger } from './utils/logger.js';

const app = express();
app.set('trust proxy', 1);

const allowedOrigins = env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean);
const isDev = env.NODE_ENV === 'development';
const isLocalhostOrigin = (origin) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

app.disable('x-powered-by');
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false
}));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin) || (isDev && isLocalhostOrigin(origin))) {
      return callback(null, true);
    }
    const error = new Error('Origin is not allowed by CORS');
    error.status = 403;
    return callback(error);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '100kb' }));
app.use(mongoSanitize);
app.use(requestLogger);
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: isDev ? 1000 : 300, standardHeaders: 'draft-7', legacyHeaders: false }));

app.get('/api/v1/health', (_req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({ data: { status: connected ? 'ok' : 'unavailable' } });
});

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: isDev ? 200 : 20, standardHeaders: 'draft-7', legacyHeaders: false });
const aiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: isDev ? 300 : 50, standardHeaders: 'draft-7', legacyHeaders: false });
const codingLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: isDev ? 500 : 100, standardHeaders: 'draft-7', legacyHeaders: false });

app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/profiles', profileRoutes);
app.use('/api/v1/curriculum', curriculumRoutes);
app.use('/api/v1/progress', progressRoutes);
app.use('/api/v1/quizzes', quizRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/mentor', mentorRoutes);
app.use('/api/v1/mentors', mentorRoutes);
app.use('/api/v1/mentor/quizzes', mentorQuizRoutes);
app.use('/api/v1/mentor-quizzes', mentorQuizRoutes);
app.use('/api/v1/assignments', assignmentRoutes);
app.use('/api/v1/communication', communicationRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/v1/gamification', gamificationRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/career', careerRoutes);
app.use('/api/v1/ai', aiLimiter, aiRoutes);
app.use('/api/v1/coding', codingLimiter, codingRoutes);
app.use('/api/v1/community', communityRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/study-plan', studyPlanRoutes);
app.use('/api/v1/planner', studyPlanRoutes);
app.use('/api/v1/admin', adminRoutes);

// Stable, unversioned aliases used by the first-party frontend.
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/curriculum', curriculumRoutes);
app.use('/api', curriculumRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/mentor/quizzes', mentorQuizRoutes);
app.use('/api/mentor-quizzes', mentorQuizRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/career', careerRoutes);
app.use('/api/ai', aiLimiter, aiRoutes);
app.use('/api/coding', codingLimiter, codingRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/study-plan', studyPlanRoutes);
app.use('/api/planner', studyPlanRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
