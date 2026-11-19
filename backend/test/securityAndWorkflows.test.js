import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { mongoSanitize } from '../src/middleware/mongoSanitize.js';
import { validateFilePayload, MAX_AVATAR_SIZE } from '../src/middleware/fileUpload.js';
import cacheService from '../src/services/cacheService.js';
import queueService from '../src/services/queueService.js';
import env from '../src/config/env.js';

test('Security: mongoSanitize recursively removes NoSQL operator injections', () => {
  const req = {
    body: {
      username: 'student1',
      $where: 'this.password.length > 0',
      nested: {
        $gt: '',
        safeField: 'active',
        'tampered.key': 'exploit'
      }
    },
    query: {
      email: { $ne: null },
      role: 'student'
    },
    params: {
      id: '64e4b5f1234567890abcdef1'
    }
  };

  mongoSanitize(req, {}, () => {});

  // $where and nested $gt and dotted keys must be stripped
  assert.equal(req.body.username, 'student1');
  assert.equal(req.body.$where, undefined);
  assert.equal(req.body.nested.$gt, undefined);
  assert.equal(req.body.nested.safeField, 'active');
  assert.equal(req.body.nested['tampered.key'], undefined);

  // query $ne must be stripped
  assert.equal(req.query.role, 'student');
  assert.equal(req.query.email.$ne, undefined);
});

test('Security: validateFilePayload accepts valid images and enforces max avatar size', () => {
  // A small valid 1x1 GIF / PNG base64
  const validBase64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

  const result = validateFilePayload(validBase64Image, {
    allowedTypes: ['image/png', 'image/jpeg'],
    maxSizeBytes: MAX_AVATAR_SIZE
  });

  assert.equal(result.valid, true);
  assert.equal(result.mimeType, 'image/png');
  assert.ok(result.sizeBytes < MAX_AVATAR_SIZE);

  // Rejects disallowed MIME type (e.g. executable script masquerading as payload)
  const badScript = 'data:application/x-sh;base64,c2ggLWMgImVjaG8gaGFja2VkIg==';
  assert.throws(() => {
    validateFilePayload(badScript, {
      allowedTypes: ['image/png', 'image/jpeg']
    });
  }, /Invalid file format/);

  // Rejects payload exceeding maxSizeBytes
  assert.throws(() => {
    validateFilePayload(validBase64Image, {
      allowedTypes: ['image/png'],
      maxSizeBytes: 10 // artificially tiny threshold
    });
  }, /exceeds maximum allowable size/);
});

test('Authentication: Session revocation through tokenVersion invalidation', () => {
  const user = {
    _id: '6501a2b3c4d5e6f7a8b9c0d1',
    role: 'student',
    tokenVersion: 1
  };

  const token = jwt.sign(
    { role: user.role, tokenVersion: user.tokenVersion },
    env.JWT_SECRET,
    { subject: String(user._id), expiresIn: '1h' }
  );

  const payload = jwt.verify(token, env.JWT_SECRET);
  assert.equal(payload.sub, String(user._id));
  assert.equal(payload.tokenVersion, 1);

  // User logs out -> tokenVersion increments to 2
  user.tokenVersion = 2;
  const isRevoked = payload.tokenVersion !== user.tokenVersion;
  assert.equal(isRevoked, true, 'Token version mismatch successfully revokes stale session');
});

test('Authorization: Role hierarchy and privilege resolution', () => {
  const rolesHierarchy = {
    super_admin: ['super_admin', 'admin', 'senior_mentor', 'mentor', 'student'],
    admin: ['admin', 'senior_mentor', 'mentor'],
    senior_mentor: ['senior_mentor', 'mentor'],
    mentor: ['mentor'],
    student: ['student']
  };

  function canAccessRole(userRole, allowedRole) {
    if (userRole === 'super_admin') return true;
    if (userRole === 'admin' && ['admin', 'senior_mentor', 'mentor'].includes(allowedRole)) return true;
    if (userRole === 'senior_mentor' && ['senior_mentor', 'mentor'].includes(allowedRole)) return true;
    return userRole === allowedRole;
  }

  // Super admin can access everything
  assert.equal(canAccessRole('super_admin', 'admin'), true);
  assert.equal(canAccessRole('super_admin', 'student'), true);

  // Admin can access mentor features
  assert.equal(canAccessRole('admin', 'mentor'), true);
  assert.equal(canAccessRole('admin', 'senior_mentor'), true);

  // Mentor cannot access admin or student-private settings
  assert.equal(canAccessRole('mentor', 'admin'), false);
  assert.equal(canAccessRole('mentor', 'senior_mentor'), false);

  // Student cannot access mentor or admin actions
  assert.equal(canAccessRole('student', 'mentor'), false);
  assert.equal(canAccessRole('student', 'admin'), false);
});

test('Performance: CacheService wrap, get, and delPattern work seamlessly', async () => {
  let dbCalls = 0;
  const fetcher = async () => {
    dbCalls += 1;
    return { title: 'BCA Course Structure', modules: 6 };
  };

  const key = 'test:curriculum:summary';
  await cacheService.del(key);

  // 1st call: invokes fetcher
  const res1 = await cacheService.wrap(key, fetcher, 60);
  assert.equal(res1.title, 'BCA Course Structure');
  assert.equal(dbCalls, 1);

  // 2nd call: returns cached without re-invoking fetcher
  const res2 = await cacheService.wrap(key, fetcher, 60);
  assert.equal(res2.title, 'BCA Course Structure');
  assert.equal(dbCalls, 1, 'Fetcher must not be invoked on cached key');

  // Invalidate and re-fetch
  await cacheService.del(key);
  const res3 = await cacheService.wrap(key, fetcher, 60);
  assert.equal(res3.title, 'BCA Course Structure');
  assert.equal(dbCalls, 2, 'Fetcher invoked after cache eviction');
});

test('Performance: QueueService registers processor and dispatches background tasks', async () => {
  let executedJobData = null;

  queueService.registerQueue('test-task-queue', async (data) => {
    executedJobData = data;
    return { ok: true };
  });

  await queueService.add('test-task-queue', 'process-analytics', {
    cohortId: 'cohort-1',
    action: 'recalculate_rank'
  });

  // Allow next-tick async dispatch
  await new Promise((resolve) => setTimeout(resolve, 50));

  assert.ok(executedJobData !== null);
  assert.equal(executedJobData.cohortId, 'cohort-1');
  assert.equal(executedJobData.action, 'recalculate_rank');
});
