const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const env = require('./config/env');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
const allowedOrigins = env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean);

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return callback(null, true);
    const error = new Error('Origin is not allowed by CORS');
    error.status = 403;
    return callback(error);
  }
}));
app.use(express.json({ limit: '100kb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false }));

app.get('/api/v1/health', (_req, res) => {
  const mongoose = require('mongoose');
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({ data: { status: connected ? 'ok' : 'unavailable' } });
});

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-7', legacyHeaders: false });
app.use('/api/v1/auth', authLimiter, require('./routes/auth'));
app.use('/api/v1/profiles', require('./routes/profiles'));
app.use('/api/v1/curriculum', require('./routes/curriculum'));
app.use('/api/v1/progress', require('./routes/progress'));
app.use('/api/v1/quizzes', require('./routes/quizzes'));
app.use('/api/v1/dashboard', require('./routes/dashboard'));
app.use('/api/v1/mentor', require('./routes/mentor'));

// Stable, unversioned aliases used by the first-party frontend.
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/profiles', require('./routes/profiles'));
app.use('/api/curriculum', require('./routes/curriculum'));
app.use('/api', require('./routes/curriculum'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/quizzes', require('./routes/quizzes'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/mentors', require('./routes/mentor'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
