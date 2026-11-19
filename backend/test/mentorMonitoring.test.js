import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateStudentRisk } from '../src/utils/atRiskDetection.js';
import { buildStudentQuery } from '../src/routes/mentor.js';
import Assignment from '../src/models/Assignment.js';
import MentorQuiz from '../src/models/MentorQuiz.js';
import Message from '../src/models/Message.js';

test('At-risk student detection: flags critical low progress and inactivity', () => {
  const result = evaluateStudentRisk({
    completionPercent: 12,
    averageQuizScore: 40,
    quizAttemptsCount: 3,
    failedQuizzesCount: 3,
    daysInactive: 10,
    overdueAssignmentsCount: 2
  });

  assert.equal(result.level, 'critical');
  assert.equal(result.needsAttention, true);
  assert.ok(result.flags.length >= 4);
  assert.ok(result.reasons.some((r) => r.includes('Low syllabus progress')));
  assert.ok(result.reasons.some((r) => r.includes('Critical quiz performance')));
  assert.ok(result.reasons.some((r) => r.includes('failed quiz attempts')));
  assert.ok(result.reasons.some((r) => r.includes('overdue assignment')));
});

test('At-risk student detection: categorizes moderate risk student', () => {
  const result = evaluateStudentRisk({
    completionPercent: 32,
    averageQuizScore: 55,
    quizAttemptsCount: 2,
    failedQuizzesCount: 1,
    daysInactive: 3,
    overdueAssignmentsCount: 0
  });

  assert.equal(result.level, 'moderate');
  assert.equal(result.needsAttention, true);
  assert.ok(result.flags.includes('MODERATE_LOW_PROGRESS'));
  assert.ok(result.flags.includes('LOW_QUIZ_SCORE'));
});

test('At-risk student detection: marks diligent active student as on_track', () => {
  const result = evaluateStudentRisk({
    completionPercent: 82,
    averageQuizScore: 88,
    quizAttemptsCount: 8,
    failedQuizzesCount: 0,
    daysInactive: 1,
    overdueAssignmentsCount: 0
  });

  assert.equal(result.level, 'on_track');
  assert.equal(result.needsAttention, false);
  assert.equal(result.flags.length, 0);
  assert.equal(result.score, 100);
});

test('buildStudentQuery enforces strict role scoping', () => {
  // 1. Regular mentor only sees directly assigned students
  const mentorQuery = buildStudentQuery({ id: 'mentor123', role: 'mentor' });
  assert.deepEqual(mentorQuery, { role: 'student', mentorId: 'mentor123' });

  // 2. Senior mentor sees assigned cohort
  const seniorQuery = buildStudentQuery({ id: 'senior456', role: 'senior_mentor', groupId: 'BCA-A' });
  assert.equal(seniorQuery.role, 'student');
  assert.ok(Array.isArray(seniorQuery.$or));

  // 3. Admin / Super admin has institutional scope
  const adminQuery = buildStudentQuery({ id: 'admin789', role: 'admin' });
  assert.deepEqual(adminQuery, { role: 'student' });

  const superAdminQuery = buildStudentQuery({ id: 'super999', role: 'super_admin' });
  assert.deepEqual(superAdminQuery, { role: 'student' });

  // 4. Scrum Master has cohort/institutional scope to see all students
  const scrumQuery = buildStudentQuery({ id: 'scrum101', role: 'scrum' });
  assert.deepEqual(scrumQuery, { role: 'student' });
});

test('Assignment model validates fields and submission sub-documents', () => {
  const assignment = new Assignment({
    mentorId: '507f1f77bcf86cd799439011',
    mentorName: 'Dr. Sharma',
    title: 'Data Structures Lab 2: Binary Search Trees',
    subjectCode: '0610311012',
    subjectName: 'Data Structures & Algorithms',
    dueDate: new Date(Date.now() + 86400000 * 5),
    totalMarks: 30,
    targetSemester: 2,
    submissions: [
      {
        studentId: '507f1f77bcf86cd799439022',
        studentName: 'Aman Deep',
        content: 'Implemented BST insertion, deletion, and in-order traversal in C++.',
        status: 'submitted'
      }
    ]
  });

  const err = assignment.validateSync();
  assert.equal(err, undefined);
  assert.equal(assignment.submissions.length, 1);
  assert.equal(assignment.submissions[0].status, 'submitted');
});

test('MentorQuiz model validates questions and target semester', () => {
  const quiz = new MentorQuiz({
    mentorId: '507f1f77bcf86cd799439011',
    mentorName: 'Prof. Verma',
    title: 'Operating Systems Unit 2 Diagnostic',
    semester: 3,
    subjectCode: '0610311021',
    subjectName: 'Operating Systems',
    durationMinutes: 25,
    totalMarks: 15,
    isPublished: true,
    questions: [
      {
        id: 'q1',
        text: 'Which scheduling algorithm is non-preemptive?',
        type: 'mcq',
        options: ['Round Robin', 'FCFS', 'SRTF', 'Priority Preemptive'],
        correctAnswer: 1,
        marks: 2
      }
    ]
  });

  const err = quiz.validateSync();
  assert.equal(err, undefined);
  assert.equal(quiz.questions.length, 1);
  assert.equal(quiz.isPublished, true);
});

test('Message model validates direct and broadcast scopes', () => {
  const directMessage = new Message({
    senderId: '507f1f77bcf86cd799439011',
    recipientId: '507f1f77bcf86cd799439022',
    scope: 'direct',
    content: 'Please submit your pending assignment before Friday.'
  });

  assert.equal(directMessage.validateSync(), undefined);

  const broadcastMessage = new Message({
    senderId: '507f1f77bcf86cd799439011',
    scope: 'semester',
    targetSemester: 2,
    subject: 'Midterm Practical Exam Schedule',
    content: 'The practical examinations will commence next Monday at 10:00 AM.'
  });

  assert.equal(broadcastMessage.validateSync(), undefined);
});
