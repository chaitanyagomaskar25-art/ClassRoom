import HttpError from '../utils/httpError.js';

const DEFAULT_ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'text/plain',
  'application/json',
  'application/zip'
];

// Max file sizes
export const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2 MB
export const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * Validates a base64 Data URL or file payload against allowed MIME types and size limit.
 */
export function validateFilePayload(dataUriOrBase64, options = {}) {
  const {
    allowedTypes = DEFAULT_ALLOWED_TYPES,
    maxSizeBytes = MAX_ATTACHMENT_SIZE,
    fieldName = 'file'
  } = options;

  if (!dataUriOrBase64 || typeof dataUriOrBase64 !== 'string') {
    throw new HttpError(400, `${fieldName} must be a valid file payload or base64 string`);
  }

  let mimeType = 'application/octet-stream';
  let base64Data = dataUriOrBase64;

  const match = dataUriOrBase64.match(/^data:([^;]+);base64,(.+)$/);
  if (match) {
    mimeType = match[1].toLowerCase();
    base64Data = match[2];
  }

  if (!allowedTypes.includes(mimeType)) {
    throw new HttpError(
      400,
      `Invalid file format for ${fieldName}. Allowed types: ${allowedTypes.join(', ')}`
    );
  }

  // Calculate approximate decoded byte size: (base64 length * 3/4) - padding
  const padding = (base64Data.endsWith('==') ? 2 : base64Data.endsWith('=') ? 1 : 0);
  const sizeBytes = Math.floor((base64Data.length * 3) / 4) - padding;

  if (sizeBytes > maxSizeBytes) {
    const maxMb = (maxSizeBytes / (1024 * 1024)).toFixed(1);
    throw new HttpError(
      400,
      `${fieldName} exceeds maximum allowable size of ${maxMb}MB (received ~${(sizeBytes / (1024 * 1024)).toFixed(1)}MB)`
    );
  }

  return {
    valid: true,
    mimeType,
    sizeBytes
  };
}

/**
 * Express middleware to validate file payloads on incoming requests.
 */
export function validateUpload(options = {}) {
  const { fieldName = 'file', required = false } = options;

  return (req, _res, next) => {
    const payload = req.body?.[fieldName];
    if (!payload) {
      if (required) {
        return next(new HttpError(400, `${fieldName} is required`));
      }
      return next();
    }

    try {
      validateFilePayload(payload, options);
      next();
    } catch (err) {
      next(err);
    }
  };
}
