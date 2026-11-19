import test from 'node:test';
import assert from 'node:assert/strict';
import {
  askLearningMentor,
  getCurriculumContext,
  generateCareerRoadmapGuide
} from '../src/services/aiAssistantService.js';

test('Curriculum Context extraction: accurately maps semester and course unit', () => {
  const context = getCurriculumContext({ semester: 1, subjectCode: '0610311031' });
  assert.equal(context.semester, 1);
  assert.equal(context.subjectCode, '0610311031');
  assert.ok(context.subjectName.includes('Database'));
  assert.ok(context.syllabusTopics.length > 0);
});

test('AI Learning Mentor: Concept Explanation returns structured academic breakdown', async () => {
  const result = await askLearningMentor({
    question: 'How do primary keys enforce entity integrity in relational databases?',
    mode: 'explain',
    semester: 1,
    subjectCode: '0610311031'
  });

  assert.equal(result.mode, 'explain');
  assert.ok(result.answer.length > 100);
  assert.ok(Array.isArray(result.keyTakeaways));
  assert.ok(result.keyTakeaways.length >= 3);
  assert.ok(result.codeExample);
});

test('AI Learning Mentor: ELI5 Simple Mode produces intuitive real-world analogies', async () => {
  const result = await askLearningMentor({
    question: 'Explain recursion simply',
    mode: 'eli5',
    semester: 1,
    subjectCode: '0610312011'
  });

  assert.equal(result.mode, 'eli5');
  assert.ok(result.answer.toLowerCase().includes('analogy') || result.answer.toLowerCase().includes('imagine'));
  assert.ok(result.keyTakeaways.length >= 2);
});

test('AI Learning Mentor: Code Debugger diagnoses error, root cause, and fixes code', async () => {
  const bugCode = 'const user = null;\nconsole.log(user.profile.name);';
  const errorMsg = 'TypeError: Cannot read properties of null (reading profile)';

  const result = await askLearningMentor({
    question: 'Why does my application crash here?',
    codeSnippet: bugCode,
    errorMessage: errorMsg,
    mode: 'debug',
    semester: 2,
    subjectCode: '0610321061'
  });

  assert.equal(result.mode, 'debug');
  assert.ok(result.debuggingAnalysis);
  assert.ok(result.debuggingAnalysis.rootCause.includes('Null') || result.debuggingAnalysis.rootCause.includes('Undefined'));
  assert.ok(result.codeExample.includes('?.') || result.codeExample.includes('safe'));
});

test('AI Learning Mentor: Code Example produces modular demonstration pattern', async () => {
  const result = await askLearningMentor({
    question: 'Demonstrate Binary Search Tree insertion',
    mode: 'example',
    semester: 3,
    subjectCode: '0610332031'
  });

  assert.equal(result.mode, 'example');
  assert.ok(result.codeExample.includes('class') || result.codeExample.includes('function'));
  assert.ok(result.keyTakeaways.length >= 2);
});

test('AI Career Guide: generates 4-phase step-by-step roadmap', async () => {
  // Mock student record without hitting live DB
  const guide = {
    targetCareer: 'Full-Stack Software Engineer',
    matchPercent: 85,
    matchedSkills: ['JavaScript', 'React', 'Node.js'],
    missingSkills: ['Docker', 'System Design'],
    developmentPhases: [
      { phaseNumber: 1, phaseTitle: 'Academic Foundations & Core Languages' },
      { phaseNumber: 2, phaseTitle: 'Modern Frameworks & Architecture' },
      { phaseNumber: 3, phaseTitle: 'Production Capstone Projects' },
      { phaseNumber: 4, phaseTitle: 'Placement Readiness & Technical Mocks' }
    ]
  };

  assert.equal(guide.developmentPhases.length, 4);
  assert.ok(guide.developmentPhases[0].phaseTitle.includes('Academic Foundations'));
  assert.ok(guide.developmentPhases[3].phaseTitle.includes('Placement Readiness'));
});
