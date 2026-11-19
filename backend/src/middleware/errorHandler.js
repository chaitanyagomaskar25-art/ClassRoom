import mongoose from 'mongoose';

export function notFound(req, _res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  next(error);
}

export function errorHandler(error, _req, res, _next) {
  let status = error.status || 500;
  let message = error.message || 'Internal server error';
  let details = error.details;

  if (error instanceof mongoose.Error.ValidationError) {
    status = 400;
    message = 'Database validation failed';
    details = Object.fromEntries(Object.entries(error.errors).map(([key, value]) => [key, value.message]));
  } else if (error instanceof mongoose.Error.CastError) {
    status = 400;
    message = 'Invalid resource identifier';
  } else if (error.code === 11000) {
    status = 409;
    message = 'A record with that value already exists';
  }

  if (status >= 500) console.error(error);
  res.status(status).json({
    error: { message, ...(details ? { details } : {}) }
  });
}
