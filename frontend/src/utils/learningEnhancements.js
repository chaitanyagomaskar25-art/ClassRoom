/**
 * Learning Enhancements Utilities
 * Handles Glossary Compilation, Revision Notes Download, and Certificate Generation
 */

import { lessonContentMap } from '../data/lessonContentData.js';

/**
 * Extracts and aggregates all key terminology across all lessons of a subject
 */
export function getSubjectGlossary(subjectCode, subjectLessons = []) {
  if (!subjectCode) return [];

  const termMap = new Map();

  subjectLessons.forEach((lesson) => {
    const lId = lesson.lessonId;
    const content = lessonContentMap[lId];

    if (content?.keyDefinitions && Array.isArray(content.keyDefinitions)) {
      content.keyDefinitions.forEach((item) => {
        const cleanTerm = (item.term || '').trim();
        if (!cleanTerm) return;
        const key = cleanTerm.toLowerCase();

        if (!termMap.has(key)) {
          termMap.set(key, {
            term: cleanTerm,
            definition: item.definition || '',
            unitNumber: lesson.unitNumber || content.unitNumber || 'Unit I',
            unitTitle: lesson.unitTitle || content.unitTitle || '',
            lessonId: lId,
            lessonTitle: lesson.title || content.title
          });
        }
      });
    }
  });

  // Sort alphabetically by term name
  return Array.from(termMap.values()).sort((a, b) => a.term.localeCompare(b.term));
}

/**
 * Downloads formatted Markdown revision notes for a single lesson
 */
export function downloadLessonRevisionNotes(lessonContent, personalNote = '') {
  if (!lessonContent) return;

  const title = lessonContent.title || 'Lesson-Notes';
  const subjectName = lessonContent.subjectName || 'Course';
  const subjectCode = lessonContent.subjectCode || 'BCA';
  const semester = lessonContent.semester || 1;
  const unitName = lessonContent.unitName || lessonContent.unitNumber || 'Unit I';
  const unitTitle = lessonContent.unitTitle || '';
  const officialTopic = lessonContent.officialTopic || lessonContent.officialTopicReference || title;

  let md = `# Department of Computer Science & Engineering
### B.C.A. (Hons. with Research) • Semester ${semester}
**Course:** ${subjectName} (\`${subjectCode}\`)  
**Module:** ${unitName}: ${unitTitle}  
**Lesson Title:** ${title}  
**Official Syllabus Topic Reference:** "${officialTopic}"  
**Export Date:** ${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}

---

## 1. Learning Objectives
${(lessonContent.learningObjectives || ['Understand core principles of ' + officialTopic])
  .map((obj, i) => `${i + 1}. ${obj}`)
  .join('\n')}

---

## 2. Executive Introduction & Summary
${lessonContent.introduction || lessonContent.summary || 'Essential theoretical and practical foundational concepts.'}

---

## 3. Important Subject Terminology & Formal Definitions
${(lessonContent.keyDefinitions || [])
  .map((d) => `### 📌 ${d.term}\n${d.definition}\n`)
  .join('\n')}

---

## 4. Step-by-Step Conceptual Breakdown
${(lessonContent.stepByStepExplanation || [])
  .map((step) => `#### Step ${step.stepNumber}: ${step.heading}\n${step.explanation}\n`)
  .join('\n')}

---

## 5. Working Implementation & Technical Architecture
\`\`\`${lessonContent.codeOrDiagram?.language || 'text'}
${lessonContent.codeOrDiagram?.snippet || '// Code, architecture diagrams, and syntax walkthrough'}
\`\`\`
${lessonContent.codeOrDiagram?.explanation ? `\n*Explanation:* ${lessonContent.codeOrDiagram.explanation}\n` : ''}

---

## 6. Practical Applications & Real-World Use Cases
${(lessonContent.practicalApplications || [])
  .map((app) => `- **${app.domain}:** ${app.example}`)
  .join('\n')}

---

## 7. Key Takeaways & Exam Tips
${(lessonContent.importantNotes || lessonContent.revisionPoints || [])
  .map((n) => `- ${n}`)
  .join('\n')}

---

## 8. Practice Questions & Conceptual Exercises
${(lessonContent.practiceQuestions || [])
  .map((pq, i) => `### Question ${i + 1}\n**${pq.question}**\n*Answer Hint:* ${pq.answerHint}\n`)
  .join('\n')}

---

## 9. Personal Student Study Notes
${personalNote && personalNote.trim() ? personalNote.trim() : '*No personal notes recorded yet for this lesson.*'}

---
*Generated via BCA Success Platform • Verified Syllabus Accreditation*
`;

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeFilename = `${subjectCode}-${unitName.replace(/\s+/g, '')}-${title.replace(/[^a-zA-Z0-9]/g, '-')}-Revision-Notes.md`;
  a.href = url;
  a.download = safeFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Downloads comprehensive revision notes for an entire unit (all 4 lessons)
 */
export function downloadUnitRevisionNotes(subject, unit, unitLessons = []) {
  if (!subject || !unit) return;

  const subjectName = subject.name || 'Course';
  const subjectCode = subject.code || 'BCA';
  const semester = subject.semester || 1;
  const unitNumber = unit.unitNumber || 'Unit I';
  const unitTitle = unit.unitTitle || '';

  let md = `# Department of Computer Science & Engineering
### B.C.A. (Hons. with Research) • Semester ${semester}
# Complete Unit Revision Guide: ${unitNumber} - ${unitTitle}
**Course:** ${subjectName} (\`${subjectCode}\`)  
**Generated:** ${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}

---

## Official Topics in this Unit:
${(unit.officialTopics || [])
  .map((top, i) => `${i + 1}. ${top}`)
  .join('\n')}

---
`;

  unitLessons.forEach((lesson, idx) => {
    const content = lessonContentMap[lesson.lessonId];
    md += `\n# Lesson ${idx + 1}: ${lesson.title}\n`;
    md += `**Topic Reference:** "${lesson.officialTopicReference || lesson.title}"\n\n`;

    if (content) {
      md += `### Summary\n${content.introduction || content.summary || ''}\n\n`;

      if (content.keyDefinitions?.length) {
        md += `### Key Definitions\n`;
        content.keyDefinitions.forEach((d) => {
          md += `- **${d.term}:** ${d.definition}\n`;
        });
        md += `\n`;
      }

      if (content.stepByStepExplanation?.length) {
        md += `### Step-by-Step Concepts\n`;
        content.stepByStepExplanation.forEach((s) => {
          md += `1. **${s.heading}:** ${s.explanation}\n`;
        });
        md += `\n`;
      }

      if (content.importantNotes?.length) {
        md += `### Key Takeaways\n`;
        content.importantNotes.forEach((n) => {
          md += `- ${n}\n`;
        });
        md += `\n`;
      }
    }

    md += `---\n`;
  });

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeFilename = `${subjectCode}-${unitNumber.replace(/\s+/g, '')}-Comprehensive-Revision-Guide.md`;
  a.href = url;
  a.download = safeFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
