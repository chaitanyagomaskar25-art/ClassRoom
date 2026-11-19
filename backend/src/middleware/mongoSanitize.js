/**
 * NoSQL Injection Sanitization Middleware
 * Recursively strips keys starting with '$' or containing '.' from request body, query, and params.
 * Protects against MongoDB operator injection attacks.
 */

function sanitizeObject(target) {
  if (!target || typeof target !== 'object') {
    return target;
  }

  if (Array.isArray(target)) {
    return target.map((item) => sanitizeObject(item));
  }

  const clean = {};
  for (const [key, value] of Object.entries(target)) {
    // Drop keys that start with '$' or contain '.' (MongoDB operators or path traversals)
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    clean[key] = sanitizeObject(value);
  }
  return clean;
}

export function mongoSanitize(req, _res, next) {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  next();
}

export default mongoSanitize;
