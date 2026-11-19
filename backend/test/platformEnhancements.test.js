import test from 'node:test';
import assert from 'node:assert/strict';
import {
  executeJavaScriptSafely,
  evaluateCodeSubmission,
  INITIAL_CODING_PROBLEMS
} from '../src/services/codeExecutionService.js';
import Notification from '../src/models/Notification.js';
import CommunityPost from '../src/models/CommunityPost.js';
import CodingProblem from '../src/models/CodingProblem.js';

test('Coding Sandbox: successfully runs valid JavaScript solution and matches output', async () => {
  const code = `
    function solution(input) {
      const [nums, target] = JSON.parse(input);
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const diff = target - nums[i];
        if (map.has(diff)) return [map.get(diff), i];
        map.set(nums[i], i);
      }
      return [];
    }
  `;

  const input = '[[2,7,11,15], 9]';
  const exec = await executeJavaScriptSafely(code, input);

  assert.equal(exec.success, true);
  assert.equal(exec.output, '[0,1]');
  assert.ok(exec.runtimeMs < 1000);
});

test('Coding Sandbox: catches Infinite Loop and triggers Time Limit Exceeded (TLE)', async () => {
  const infiniteLoopCode = `
    function solution(input) {
      let x = 0;
      while (true) {
        x++;
      }
      return x;
    }
  `;

  const exec = await executeJavaScriptSafely(infiniteLoopCode, 'test');
  assert.equal(exec.success, false);
  assert.equal(exec.status, 'time_limit_exceeded');
  assert.ok(exec.error.includes('Time Limit Exceeded'));
});

test('Coding Sandbox: handles Runtime Errors cleanly without crashing process', async () => {
  const crashingCode = `
    function solution(input) {
      const obj = null;
      return obj.nonExistentMethod();
    }
  `;

  const exec = await executeJavaScriptSafely(crashingCode, 'test');
  assert.equal(exec.success, false);
  assert.equal(exec.status, 'runtime_error');
  assert.ok(exec.error.length > 0);
});

test('Coding Evaluator: evaluates multiple test cases and reports results', async () => {
  const code = `
    function solution(s) {
      return s.trim() === '()[]{}';
    }
  `;

  const testCases = [
    { input: '()[]{}', expectedOutput: 'true' },
    { input: '(]', expectedOutput: 'false' }
  ];

  const evalResult = await evaluateCodeSubmission({
    code,
    language: 'javascript',
    testCases
  });

  assert.equal(evalResult.status, 'accepted');
  assert.equal(evalResult.passedTestCasesCount, 2);
  assert.equal(evalResult.totalTestCasesCount, 2);
});

test('Coding Problem catalog: contains required BCA curriculum challenges', () => {
  assert.ok(INITIAL_CODING_PROBLEMS.length >= 4);
  const twoSum = INITIAL_CODING_PROBLEMS.find((p) => p.slug === 'two-sum-target');
  assert.ok(twoSum);
  assert.equal(twoSum.category, 'arrays');
  assert.ok(twoSum.sampleTestCases.length >= 2);
  assert.ok(twoSum.hiddenTestCases.length >= 1);
});

test('Notification Model: validates required fields and category enums', () => {
  const notif = new Notification({
    recipientId: '507f1f77bcf86cd799439011',
    title: 'New Assignment Published',
    message: 'Data Structures Unit 3 Assignment is now open for submissions.',
    type: 'assignment',
    link: '/assignments'
  });

  const err = notif.validateSync();
  assert.equal(err, undefined);
  assert.equal(notif.isRead, false);
  assert.equal(notif.type, 'assignment');
});

test('Community Post Model: validates discussion structure and tags', () => {
  const post = new CommunityPost({
    authorId: '507f1f77bcf86cd799439011',
    authorName: 'Harpreet Singh',
    authorRole: 'student',
    title: 'How to optimize MongoDB aggregation pipelines for BCA project',
    content: 'Here are 3 indexing tips that reduced query latency by 80%...',
    category: 'database',
    subjectCode: '0610311031',
    tags: ['mongodb', 'indexing', 'performance']
  });

  const err = post.validateSync();
  assert.equal(err, undefined);
  assert.equal(post.moderationStatus, 'approved');
  assert.equal(post.isPinned, false);
  assert.equal(post.tags.length, 3);
});
