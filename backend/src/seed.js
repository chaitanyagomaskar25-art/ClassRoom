const bcrypt = require('bcryptjs');
const connectDatabase = require('./config/database');
const User = require('./models/User');
const Semester = require('./models/Semester');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
const Lesson = require('./models/Lesson');
const LessonProgress = require('./models/LessonProgress');
const QuizAttempt = require('./models/QuizAttempt');
const mongoose = require('mongoose');

const accounts = {
  mentor: { name: 'Asha Mentor', email: 'mentor@demo.local', password: 'Mentor123!' },
  students: [
    { name: 'Aarav Student', email: 'student@demo.local', password: 'Student123!', enrollmentNumber: 'BCA2026001' },
    { name: 'Mira Student', email: 'student2@demo.local', password: 'Student123!', enrollmentNumber: 'BCA2026002' }
  ]
};

async function upsertAccount(account, role, mentorId = null) {
  const passwordHash = await bcrypt.hash(account.password, 12);
  const { password, ...profile } = account;
  return User.findOneAndUpdate(
    { email: account.email },
    { $set: { ...profile, passwordHash, role, ...(mentorId ? { mentorId } : {}) } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
}

async function seed() {
  await connectDatabase();
  const mentor = await upsertAccount(accounts.mentor, 'mentor');
  const students = await Promise.all(accounts.students.map((account) => upsertAccount(account, 'student', mentor.id)));
  await Promise.all([
    LessonProgress.deleteMany({ studentId: { $in: students.map((student) => student.id) } }),
    QuizAttempt.deleteMany({ studentId: { $in: students.map((student) => student.id) } })
  ]);
  await Promise.all([Lesson.deleteMany({}), Topic.deleteMany({}), Subject.deleteMany({}), Semester.deleteMany({})]);

  const semester1 = await Semester.create({
    number: 1, title: 'Semester 1', description: 'Foundations of computing and programming.', order: 1
  });
  const semester2 = await Semester.create({
    number: 2, title: 'Semester 2', description: 'Core programming and data structures.', order: 2
  });
  const subjects = await Subject.create([
    { semesterId: semester1.id, code: 'BCA101', title: 'Programming Fundamentals', description: 'Problem solving with programming.', order: 1 },
    { semesterId: semester1.id, code: 'BCA102', title: 'Computer Systems', description: 'How computer systems work.', order: 2 },
    { semesterId: semester2.id, code: 'BCA201', title: 'Data Structures', description: 'Organizing and processing data.', order: 1 }
  ]);
  const topics = await Topic.create([
    { subjectId: subjects[0].id, title: 'Getting Started with JavaScript', description: 'Syntax, values, and expressions.', order: 1 },
    { subjectId: subjects[0].id, title: 'Control Flow', description: 'Branching and repetition.', order: 2 },
    { subjectId: subjects[1].id, title: 'Computer Organization', description: 'CPU, memory, and input/output.', order: 1 },
    { subjectId: subjects[2].id, title: 'Arrays and Complexity', description: 'Array operations and efficiency.', order: 1 }
  ]);
  const lessonDocs = [
    {
      topicId: topics[0].id, title: 'Values and Variables', summary: 'Store and use information in JavaScript.',
      content: 'A variable is a named binding to a value. Use const when the binding will not be reassigned and let when it will. JavaScript values include numbers, strings, booleans, null, and undefined.',
      order: 1, estimatedMinutes: 15,
      quiz: [
        { prompt: 'Which keyword is preferred when a binding will not be reassigned?', options: ['var', 'const', 'static'], correctOption: 1, explanation: 'const prevents reassignment of the binding.' },
        { prompt: 'Which is a JavaScript primitive value?', options: ['Boolean', 'Class', 'Package'], correctOption: 0 }
      ]
    },
    {
      topicId: topics[0].id, title: 'Expressions and Types', summary: 'Understand common value types and expressions.',
      content: 'Expressions combine values and operators to produce a result. Use strict equality (===) when comparing values to avoid implicit type conversion.',
      order: 2, estimatedMinutes: 12,
      quiz: [{ prompt: 'Which operator compares value and type?', options: ['==', '===', '='], correctOption: 1 }]
    },
    {
      topicId: topics[1].id, title: 'Conditions and Loops', summary: 'Choose between branches and repeat work.',
      content: 'if/else selects a branch based on a condition. Loops such as for and while repeat a block while a condition holds.',
      order: 1, estimatedMinutes: 18,
      quiz: [{ prompt: 'Which construct repeats a block while a condition holds?', options: ['while', 'switch', 'return'], correctOption: 0 }]
    },
    {
      topicId: topics[2].id, title: 'CPU and Memory', summary: 'Explore the processor and working memory.',
      content: 'The CPU executes instructions. Main memory temporarily stores data and instructions that active programs need.',
      order: 1, estimatedMinutes: 16,
      quiz: [{ prompt: 'What executes program instructions?', options: ['CPU', 'Monitor', 'Keyboard'], correctOption: 0 }]
    },
    {
      topicId: topics[3].id, title: 'Array Operations', summary: 'Store ordered collections and reason about cost.',
      content: 'Arrays store elements in order. Accessing an element by index is typically constant time; searching an unsorted array requires checking elements.',
      order: 1, estimatedMinutes: 20,
      quiz: [{ prompt: 'What is typical indexed access time for an array?', options: ['Constant time', 'Always quadratic', 'Exponential'], correctOption: 0 }]
    }
  ];
  const lessons = await Lesson.create(lessonDocs);
  await LessonProgress.create({
    studentId: students[0].id, lessonId: lessons[0].id, status: 'completed', completedAt: new Date()
  });
  await QuizAttempt.create({
    studentId: students[0].id, lessonId: lessons[0].id, answers: [1, 0],
    correctCount: 2, totalQuestions: 2, score: 100
  });
  console.log('Seed complete. Demo accounts:');
  console.log(`Mentor: ${accounts.mentor.email} / ${accounts.mentor.password}`);
  accounts.students.forEach((account) => console.log(`Student: ${account.email} / ${account.password}`));
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => mongoose.disconnect());
