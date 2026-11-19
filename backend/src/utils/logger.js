import env from '../config/env.js';

const isProduction = env.NODE_ENV === 'production';

function formatLog(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  if (isProduction) {
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...meta
    });
  }
  const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  const colors = {
    info: '\x1b[36m[INFO]\x1b[0m',
    warn: '\x1b[33m[WARN]\x1b[0m',
    error: '\x1b[31m[ERROR]\x1b[0m',
    debug: '\x1b[90m[DEBUG]\x1b[0m'
  };
  return `${colors[level] || `[${level.toUpperCase()}]`} ${timestamp}: ${message}${metaStr}`;
}

export const logger = {
  info(message, meta) {
    console.log(formatLog('info', message, meta));
  },
  warn(message, meta) {
    console.warn(formatLog('warn', message, meta));
  },
  error(message, meta) {
    console.error(formatLog('error', message, meta));
  },
  debug(message, meta) {
    if (!isProduction) {
      console.log(formatLog('debug', message, meta));
    }
  }
};

/**
 * Request logging middleware
 */
export function requestLogger(req, res, next) {
  const start = Date.now();
  const requestId = Math.random().toString(36).substring(2, 10);
  req.id = requestId;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const meta = {
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.statusCode,
      durationMs: duration,
      ip: req.ip || req.connection.remoteAddress,
      requestId
    };

    if (res.statusCode >= 500) {
      logger.error(`HTTP Server Error ${res.statusCode}`, meta);
    } else if (res.statusCode >= 400) {
      logger.warn(`HTTP Client Request ${res.statusCode}`, meta);
    } else {
      logger.info(`HTTP Request ${res.statusCode}`, meta);
    }
  });

  next();
}

export default logger;
