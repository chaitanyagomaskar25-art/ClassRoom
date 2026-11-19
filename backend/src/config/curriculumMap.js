/**
 * BCA (Hons. with Research)
 * Canonical Curriculum Map for Progress Tracking
 */

export const officialSemesters = [
  {
    semester: 1,
    title: 'Semester 1',
    subjects: [
      { code: '0610311011', id: 'sem1-1', name: 'Foundations of IT', nature: 'DSC', credits: 4 },
      { code: '0610311020', id: 'sem1-2', name: 'Mathematics for Computer Science', nature: 'DSC', credits: 4 },
      { code: '0610311031', id: 'sem1-3', name: 'Database Management System', nature: 'DSC', credits: 4 },
      { code: '0610312011', id: 'sem1-4', name: 'Problem Solving and Programming Fundamentals 1', nature: 'DSE', credits: 4 },
      { code: '0610315010', id: 'sem1-5', name: 'Environmental Studies for Technology', nature: 'AEC', credits: 2 },
      { code: '0610316011', id: 'sem1-6', name: 'New Age Life Skills 1', nature: 'SEC', credits: 2 }
    ]
  },
  {
    semester: 2,
    title: 'Semester 2',
    subjects: [
      { code: '0610321041', id: 'sem2-1', name: 'Problem Solving and Programming Fundamentals 2', nature: 'DSC', credits: 4 },
      { code: '0610321050', id: 'sem2-2', name: 'Agile Software Development Life Cycle', nature: 'DSC', credits: 4 },
      { code: '0610321061', id: 'sem2-3', name: 'Web Development Frontend 1 - HTML-CSS', nature: 'DSC', credits: 4 },
      { code: '0610326021', id: 'sem2-4', name: 'New Age Life Skills 2', nature: 'SEC', credits: 2 },
      { code: '0610324010', id: 'sem2-5', name: 'Introduction to Generative AI', nature: 'IDC', credits: 3 }
    ]
  },
  {
    semester: 3,
    title: 'Semester 3',
    subjects: [
      { code: '0610332021', id: 'sem3-1', name: 'Web Development Frontend 2 - JS React', nature: 'DSE', credits: 4 },
      { code: '0610331071', id: 'sem3-2', name: 'Operating System Fundamentals', nature: 'DSC', credits: 4 },
      { code: '0610331080', id: 'sem3-3', name: 'Computer Network', nature: 'DSC', credits: 4 },
      { code: '0610332031', id: 'sem3-4', name: 'Data Structures and Algorithms (Problem Solving 3)', nature: 'DSE', credits: 4 },
      { code: '0610335021', id: 'sem3-5', name: 'New Age Life Skills 3', nature: 'AEC', credits: 2 },
      { code: '0610334020', id: 'sem3-6', name: 'Introduction to ChatGPT', nature: 'IDC', credits: 3 }
    ]
  },
  {
    semester: 4,
    title: 'Semester 4',
    subjects: [
      { code: '0610341091', id: 'sem4-1', name: 'Web Development Backend 1', nature: 'DSC', credits: 4 },
      { code: '0610341101', id: 'sem4-2', name: 'Web Development Backend (Deployment, Security, and Scalability of Web Apps)', nature: 'DSC', credits: 4 },
      { code: '0610342040', id: 'sem4-3', name: 'System Design (Low Level)', nature: 'DSE', credits: 4 },
      { code: '0610345031', id: 'sem4-4', name: 'New Age Life Skills 4', nature: 'AEC', credits: 2 },
      { code: '0610344041', id: 'sem4-5', name: 'Introduction to Cloud Computing', nature: 'IDC', credits: 3 }
    ]
  },
  {
    semester: 5,
    title: 'Semester 5',
    subjects: [
      { code: 'BCA 301', id: 'sem5-1', name: 'Artificial Intelligence Fundamentals', nature: 'DSC', credits: 4 },
      { code: 'BCA 302', id: 'sem5-2', name: 'Introduction to Competitive Programming', nature: 'DSE', credits: 4 },
      { code: 'BCA 303', id: 'sem5-3', name: 'Introduction to Prompt Engineering', nature: 'IDC', credits: 3 },
      { code: 'PROJ 301', id: 'sem5-4', name: 'Major Project / Internship', nature: 'Project', credits: 6 }
    ]
  },
  {
    semester: 6,
    title: 'Semester 6',
    subjects: [
      { code: 'BCA 304', id: 'sem6-1', name: 'Python for Data Science & AI', nature: 'DSC', credits: 4 },
      { code: 'GP 301', id: 'sem6-2', name: 'NCC/NSS and Evaluation of Overall Extracurricular Activities', nature: 'SEC', credits: 2 },
      { code: 'PROJ 302', id: 'sem6-3', name: 'Major Project / Internship', nature: 'Project', credits: 6 }
    ]
  }
];

export const allCurriculumSubjects = officialSemesters.flatMap((sem) =>
  sem.subjects.map((sub) => ({ ...sub, semester: sem.semester }))
);

export const TOTAL_CURRICULUM_LESSONS = 464; // 29 subjects * 16 lessons
export const LESSONS_PER_SUBJECT = 16;
export const LESSONS_PER_UNIT = 4;
export const UNITS_PER_SUBJECT = 4;

export function findSubjectByCodeOrId(identifier) {
  if (!identifier) return null;
  const clean = String(identifier).trim().toLowerCase();
  return allCurriculumSubjects.find(
    (s) => s.code.toLowerCase() === clean || s.id.toLowerCase() === clean || s.name.toLowerCase() === clean
  ) || null;
}

export function generateSubjectLessonIds(subjectCode) {
  const ids = [];
  for (let u = 1; u <= 4; u++) {
    for (let l = 1; l <= 4; l++) {
      ids.push(`${subjectCode}-u${u}-l${l}`);
    }
  }
  return ids;
}
