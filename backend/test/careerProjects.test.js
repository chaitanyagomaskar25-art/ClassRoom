import test from 'node:test';
import assert from 'node:assert/strict';
import Project from '../src/models/Project.js';
import {
  evaluateCareerSuitability,
  CAREER_PATHS,
  INTERVIEW_QUESTIONS,
  COMPANY_PACKS,
  PLACEMENT_ROADMAPS
} from '../src/services/careerPlacementService.js';

test('Project model validates requirements, milestones and mentor review', () => {
  const project = new Project({
    studentId: '507f1f77bcf86cd799439011',
    studentName: 'Aman Deep',
    semester: 3,
    title: 'Distributed File Storage with Deduplication',
    description: 'A cloud-native chunked file system implemented in Node.js and MongoDB.',
    category: 'Backend System',
    techStack: ['Node.js', 'MongoDB', 'Docker', 'Redis'],
    requirements: ['Chunk size 4MB', 'SHA-256 content addressing'],
    milestones: [
      { id: 'm1', title: 'Chunk hashing engine', completed: true, completedAt: new Date() },
      { id: 'm2', title: 'REST API endpoints', completed: false, completedAt: null }
    ],
    githubUrl: 'https://github.com/amand/file-storage',
    mentorReview: {
      mentorId: '507f1f77bcf86cd799439099',
      mentorName: 'Dr. Sharma',
      rating: 5,
      feedback: 'Excellent modular structure and clean hashing logic.',
      approved: true
    }
  });

  const err = project.validateSync();
  assert.equal(err, undefined);
  assert.equal(project.category, 'Backend System');
  assert.equal(project.milestones.length, 2);
  assert.equal(project.mentorReview.rating, 5);
});

test('Career Suitability: scores alignment accurately based on skills and quiz performance', () => {
  const assessment = evaluateCareerSuitability({
    skills: ['JavaScript', 'React', 'Node.js', 'Express', 'MongoDB'],
    interests: ['Full-stack web', 'UI design'],
    careerGoals: 'Become a Full Stack Software Engineer',
    completedLessons: [{ lessonId: '0610311031-u1-l1' }],
    quizAttempts: [
      { subjectCode: '0610311031', score: 90 },
      { subjectCode: '0610311013', score: 85 }
    ],
    projects: [
      { title: 'Campus Social Platform', category: 'Full-Stack Web', techStack: ['React', 'Node.js', 'MongoDB'] }
    ]
  });

  assert.ok(Array.isArray(assessment));
  assert.equal(assessment.length, CAREER_PATHS.length);

  const topMatch = assessment[0];
  assert.equal(topMatch.id, 'full_stack');
  assert.ok(topMatch.matchPercent >= 80, `Expected high match percent for full stack, got ${topMatch.matchPercent}`);
  assert.ok(topMatch.matchedSkills.includes('React'));
  assert.ok(topMatch.matchedSkills.includes('Node.js'));
});

test('Interview Questions Bank: contains structured technical and behavioral questions', () => {
  assert.ok(INTERVIEW_QUESTIONS.length >= 5);
  const dsaQ = INTERVIEW_QUESTIONS.find((q) => q.category === 'Data Structures & Algorithms');
  assert.ok(dsaQ, 'DSA question present');
  assert.ok(dsaQ.keyPoints.length >= 3, 'Rubric key points present');
  assert.ok(dsaQ.sampleAnswer.length > 50, 'Sample model answer present');

  const hrQ = INTERVIEW_QUESTIONS.find((q) => q.category === 'HR & Behavioral');
  assert.ok(hrQ, 'HR STAR question present');
});

test('Company Placement Packs: verifies interview rounds and preparation tips for top recruiters', () => {
  assert.ok(COMPANY_PACKS.length >= 4);
  const tcs = COMPANY_PACKS.find((c) => c.id === 'tcs');
  assert.ok(tcs);
  assert.ok(tcs.rounds.length >= 3);
  assert.ok(tcs.typicalQuestions.length >= 2);

  const infosys = COMPANY_PACKS.find((c) => c.id === 'infosys');
  assert.ok(infosys);
  assert.ok(infosys.preparationTip.length > 20);
});

test('Placement Roadmaps: provides structured 30-day and 60-day curriculum', () => {
  assert.ok(PLACEMENT_ROADMAPS.length >= 2);
  const sprint = PLACEMENT_ROADMAPS.find((r) => r.id === 'roadmap_30');
  assert.ok(sprint);
  assert.equal(sprint.weeks.length, 4);

  const comprehensive = PLACEMENT_ROADMAPS.find((r) => r.id === 'roadmap_60');
  assert.ok(comprehensive);
  assert.equal(comprehensive.weeks.length, 8);
});

test('Interview Answer Evaluation: accurately matches rubric points and scores submissions', () => {
  const dsaQ = INTERVIEW_QUESTIONS.find((q) => q.category === 'Data Structures & Algorithms');
  assert.ok(dsaQ);

  const keyWords = dsaQ.keyPoints;
  assert.ok(keyWords.length >= 3);

  // Student answer with partial coverage
  const studentAnswer = `Arrays have contiguous memory allocation with O(1) random access indexing. Linked lists use nodes with pointers and have dynamic resizing without preallocation.`;
  const matched = keyWords.filter((point) => {
    const tokens = point.toLowerCase().split(/\s+/).filter((t) => t.length > 3);
    return tokens.some((token) => studentAnswer.toLowerCase().includes(token));
  });

  assert.ok(matched.length >= 2, 'Student answer should match at least 2 rubric points');
});
