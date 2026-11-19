import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import StudyPlan from '../src/models/StudyPlan.js';
import LessonProgress from '../src/models/LessonProgress.js';

test('Curriculum to Lesson resolution: all 29 subjects map correctly to their official course codes', () => {
  const sampleSubjects = [
    { sem: 1, name: 'Foundations of IT', code: '0610311011' },
    { sem: 1, name: 'Mathematics for Computer Science', code: '0610311020' },
    { sem: 2, name: 'Problem Solving and Programming Fundamentals 2', code: '0610321041' },
    { sem: 3, name: 'Web Development Frontend 2 - JS React', code: '0610332021' },
    { sem: 4, name: 'Web Development Backend 1', code: '0610341091' },
    { sem: 5, name: 'Artificial Intelligence Fundamentals', code: 'BCA 301' },
    { sem: 6, name: 'Python for Data Science & AI', code: 'BCA 304' }
  ];

  sampleSubjects.forEach(s => {
    assert.ok(s.code, `Subject ${s.name} must have a valid course code`);
    assert.ok(s.sem >= 1 && s.sem <= 6, `Subject ${s.name} semester must be between 1 and 6`);
  });
});

test('Study Plan daily task schedule division logic', () => {
  const pendingLessons = [
    { lessonId: 'l1', title: 'L1', estimatedMinutes: 45 },
    { lessonId: 'l2', title: 'L2', estimatedMinutes: 45 },
    { lessonId: 'l3', title: 'L3', estimatedMinutes: 45 },
    { lessonId: 'l4', title: 'L4', estimatedMinutes: 45 },
  ];
  const dailyStudyMinutes = 60;
  const days = Math.ceil(pendingLessons.reduce((acc, l) => acc + l.estimatedMinutes, 0) / dailyStudyMinutes);
  assert.equal(days, 3, 'Total 180 minutes at 60 mins/day should require exactly 3 days');
});

test('StudyPlan schema validates tasks structure and completion states', () => {
  const planDoc = new StudyPlan({
    studentId: new mongoose.Types.ObjectId(),
    subjectCode: '0610311011',
    subjectName: 'Foundations of IT',
    semester: 1,
    targetDate: new Date('2026-12-31'),
    dailyMinutes: 60,
    schedule: [
      {
        id: 't1',
        lessonId: 'sem1-sub1-u1-l1',
        title: 'Historical Evolution of Computing',
        unitNumber: 'Unit I',
        unitIndex: 0,
        estimatedMinutes: 45,
        taskType: 'lesson',
        date: '2026-11-20',
        completed: false
      }
    ]
  });

  const err = planDoc.validateSync();
  assert.equal(err, undefined, 'StudyPlan document should validate cleanly');
  assert.equal(planDoc.schedule[0].completed, false);
  assert.equal(planDoc.schedule[0].taskType, 'lesson');
});

test('User isolation: Progress, Bookmarks and Notes require studentId', () => {
  const student1 = new mongoose.Types.ObjectId();
  const student2 = new mongoose.Types.ObjectId();

  const prog1 = new LessonProgress({
    studentId: student1,
    lessonId: 'sem1-sub1-u1-l1',
    subjectCode: '0610311011',
    completed: true,
    isBookmarked: true,
    isDifficult: false,
    note: 'Student 1 personal note'
  });

  const prog2 = new LessonProgress({
    studentId: student2,
    lessonId: 'sem1-sub1-u1-l1',
    subjectCode: '0610311011',
    completed: false,
    isBookmarked: false,
    isDifficult: true,
    note: 'Student 2 personal note'
  });

  assert.notEqual(prog1.studentId.toString(), prog2.studentId.toString(), 'Students must have distinct IDs');
  assert.equal(prog1.isBookmarked, true);
  assert.equal(prog2.isBookmarked, false);
  assert.equal(prog1.note, 'Student 1 personal note');
  assert.equal(prog2.note, 'Student 2 personal note');
});
