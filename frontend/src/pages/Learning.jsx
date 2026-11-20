import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Calendar,
  CalendarClock,
  Check,
  CheckCheck,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CirclePlay,
  Clock3,
  Code2,
  Compass,
  Copy,
  Download,
  ExternalLink,
  FileDown,
  FileText,
  Flag,
  Flame,
  GraduationCap,
  Hash,
  HelpCircle,
  Layers,
  Lightbulb,
  ListChecks,
  Lock,
  MapPin,
  Milestone,
  Play,
  Printer,
  RefreshCw,
  RotateCcw,
  Route,
  Search,
  Sparkles,
  Tag,
  Target,
  Terminal,
  Trophy,
  Unlock,
  X
} from 'lucide-react';
import { api, getErrorMessage, unwrap } from '../services/api.js';
import { EmptyState, ErrorState, LoadingState } from '../components/ContentState.jsx';
import SubjectIcon from '../components/SubjectIcon.jsx';
import { allSubjects, semesterColors, semestersList } from '../data/curriculumData.js';
import { getSubjectRoadmap } from '../data/learningRoadmapData.js';
import { getDetailedLessonContent } from '../data/lessonContentData.js';
import { getSubjectResources } from '../data/learningResourcesData.js';
import {
  getSubjectGlossary,
  downloadLessonRevisionNotes,
  downloadUnitRevisionNotes
} from '../utils/learningEnhancements.js';
import { idOf, listFrom, nameOf } from '../utils/format.js';
import './Learning.css';

export default function Learning() {
  const { subjectId: routeSubjectId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Route & search parameters passed from Curriculum page or direct link
  const paramSemester = searchParams.get('semester') || location.state?.semesterId;
  const targetSubjectIdentifier =
    routeSubjectId ||
    searchParams.get('subject') ||
    searchParams.get('subjectId') ||
    location.state?.subjectId ||
    '';
  const targetCourseCode = searchParams.get('code') || location.state?.courseCode || '';
  const targetSubjectName = searchParams.get('name') || location.state?.subjectName || '';
  const stateSubjectObj = location.state?.subject || null;

  // Detect whether the user explicitly navigated to a specific subject (via URL param, route, or link state)
  const hasExplicitSubjectInUrl = Boolean(
    routeSubjectId ||
    searchParams.get('subject') ||
    searchParams.get('subjectId') ||
    searchParams.get('code') ||
    location.state?.subjectId ||
    location.state?.courseCode ||
    location.state?.subject
  );

  const user = useSelector((state) => state.auth?.user);
  const userId = user?.id || user?._id || 'guest';
  const studentSem = user?.role === 'student' && user?.semester ? Number(user.semester) : null;

  // Resolve matching subject across all 29 official curriculum subjects
  const resolvedCurriculumSubject = useMemo(() => {
    if (stateSubjectObj) {
      if (studentSem && stateSubjectObj.semester && Number(stateSubjectObj.semester) !== studentSem) {
        const semPlan = semestersList.find((s) => s.semester === studentSem) || semestersList[0];
        return semPlan?.subjects[0] || null;
      }
      return stateSubjectObj;
    }

    const normalize = (val) => String(val || '').trim().toLowerCase().replace(/[\s-_]/g, '');
    const idNorm = normalize(targetSubjectIdentifier);
    const codeNorm = normalize(targetCourseCode || targetSubjectIdentifier);
    const nameNorm = normalize(targetSubjectName);

    const found = allSubjects.find((s) => {
      const sId = normalize(s.id);
      const sCode = normalize(s.code);
      const sName = normalize(s.name);

      return (
        (idNorm && (sId === idNorm || sCode === idNorm || sName === idNorm)) ||
        (codeNorm && sCode === codeNorm) ||
        (nameNorm && sName === nameNorm) ||
        (idNorm && (sName.includes(idNorm) || idNorm.includes(sName)))
      );
    }) || null;

    if (studentSem && found && Number(found.semester) !== studentSem) {
      // Disallow showing subjects from other semesters for enrolled students
      const semPlan = semestersList.find((s) => s.semester === studentSem) || semestersList[0];
      return semPlan?.subjects[0] || null;
    }

    return found || null;
  }, [stateSubjectObj, targetSubjectIdentifier, targetCourseCode, targetSubjectName, studentSem]);

  // Semester determination (1 to 6) - strictly locked to enrolled semester for students
  const initialSemesterNum = useMemo(() => {
    if (studentSem) return studentSem;
    if (resolvedCurriculumSubject?.semester) return Number(resolvedCurriculumSubject.semester);
    if (paramSemester) return Number(paramSemester) || 1;
    return 1;
  }, [studentSem, resolvedCurriculumSubject, paramSemester]);

  // Initial subject fallback determination for this semester
  const defaultSubjectForSem = useMemo(() => {
    const targetSem = studentSem || initialSemesterNum;
    const semPlan = semestersList.find((s) => s.semester === targetSem) || semestersList[0];
    return semPlan?.subjects[0]?.id || semPlan?.subjects[0]?.code || 'sem1-1';
  }, [studentSem, initialSemesterNum]);

  // State management
  const [viewMode, setViewMode] = useState(hasExplicitSubjectInUrl ? 'subject_detail' : 'started_subjects');
  const [subjectFilterTab, setSubjectFilterTab] = useState('started'); // 'started' | 'all'
  const [selectedSemesterNum, setSelectedSemesterNum] = useState(studentSem || initialSemesterNum);
  const [selectedSubjectId, setSelectedSubjectId] = useState(
    resolvedCurriculumSubject?.id || resolvedCurriculumSubject?.code || targetSubjectIdentifier || defaultSubjectForSem
  );

  // Synchronize viewMode if an explicit subject param or route changes
  useEffect(() => {
    if (
      routeSubjectId ||
      searchParams.get('subject') ||
      searchParams.get('subjectId') ||
      searchParams.get('code') ||
      location.state?.subjectId ||
      location.state?.courseCode ||
      location.state?.subject
    ) {
      setViewMode('subject_detail');
    }
  }, [routeSubjectId, searchParams, location.state]);

  // Sync with student enrolled semester changes from profile
  useEffect(() => {
    if (studentSem) {
      setSelectedSemesterNum(studentSem);
      const semPlan = semestersList.find((s) => s.semester === studentSem) || semestersList[0];
      const isSubInSem = semPlan?.subjects.some((s) => s.id === selectedSubjectId || s.code === selectedSubjectId);
      if (!isSubInSem && semPlan?.subjects[0]) {
        setSelectedSubjectId(semPlan.subjects[0].id || semPlan.subjects[0].code);
      }
    }
  }, [studentSem, selectedSubjectId]);

  // Expanded state for units (default Unit I open)
  const [expandedUnits, setExpandedUnits] = useState({ 0: true, 1: false, 2: false, 3: false });

  // Backend state
  const [backendSemesters, setBackendSemesters] = useState([]);
  const [backendSubjects, setBackendSubjects] = useState([]);
  const [backendLessons, setBackendLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailError, setDetailError] = useState('');

  // Persistent student progress set (scoped to authenticated user)
  const [completeIds, setCompleteIds] = useState(() => {
    try {
      const saved = localStorage.getItem(`bca_completed_lessons_${userId}`);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Track currently in-progress lesson id (scoped to authenticated user)
  const [inProgressLessonId, setInProgressLessonId] = useState(() => {
    try {
      return localStorage.getItem(`bca_in_progress_lesson_${userId}`) || '';
    } catch {
      return '';
    }
  });

  const [inProgressLessons, setInProgressLessons] = useState([]);
  const [lastVisitedLesson, setLastVisitedLesson] = useState(null);
  const [savingId, setSavingId] = useState('');
  const [message, setMessage] = useState('');
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeLessonContent, setActiveLessonContent] = useState(null);
  const [activeLessonLoading, setActiveLessonLoading] = useState(false);
  const hasHandledAutoOpenRef = useRef(false);

  // Lesson interactive learning states (quiz, hints, copy code, tab)
  const [quizAnswers, setQuizAnswers] = useState({});
  const [revealedHints, setRevealedHints] = useState({});
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState('all');

  // Enhanced Learning Experience State
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [difficultIds, setDifficultIds] = useState(new Set());
  const [lessonNotes, setLessonNotes] = useState({});
  const [activeNoteText, setActiveNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [noteSaveStatus, setNoteSaveStatus] = useState('');

  // Roadmap In-Subject Search & Filtering
  const [roadmapSearch, setRoadmapSearch] = useState('');
  const [roadmapFilter, setRoadmapFilter] = useState('all'); // 'all' | 'pending' | 'completed' | 'bookmarked' | 'difficult'

  // Modals for Glossary, Resources & Certificate
  const [showGlossaryModal, setShowGlossaryModal] = useState(false);
  const [glossarySearch, setGlossarySearch] = useState('');
  const [showResourcesModal, setShowResourcesModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  const handleSelectQuizOption = async (qIdx, optIdx) => {
    const nextAnswers = {
      ...quizAnswers,
      [qIdx]: optIdx
    };
    setQuizAnswers(nextAnswers);

    // Save quiz attempt and score to backend database when all questions answered
    if (activeLessonContent?.quiz?.length && activeLesson) {
      const quizQuestions = activeLessonContent.quiz;
      const totalQ = quizQuestions.length;
      const answeredKeys = Object.keys(nextAnswers);

      if (answeredKeys.length === totalQ) {
        let correctCount = 0;
        quizQuestions.forEach((q, idx) => {
          if (nextAnswers[idx] === q.correctIndex) {
            correctCount++;
          }
        });
        const score = Math.round((correctCount / totalQ) * 100);

        try {
          await api.post('/progress/quiz-attempt', {
            lessonId: activeLesson.lessonId,
            subjectCode: activeSubject?.code || '',
            subjectName: activeSubject?.name || '',
            semester: selectedSemesterNum,
            lessonTitle: activeLesson.title || '',
            answers: quizQuestions.map((_, idx) => nextAnswers[idx]),
            score,
            correctCount,
            totalQuestions: totalQ
          });
        } catch (err) {
          console.error('Quiz attempt save failed:', err);
        }
      }
    }
  };

  const handleToggleHint = (qIdx) => {
    setRevealedHints((prev) => ({
      ...prev,
      [qIdx]: !prev[qIdx]
    }));
  };

  const handleCopyCode = async (text) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2200);
    } catch {}
  };

  const renderMarkdownTable = (tableString) => {
    if (!tableString) return null;
    const lines = tableString.trim().split('\n').filter(Boolean);
    if (lines.length < 2) {
      return (
        <pre className="diagram-snippet-pre">
          <code>{tableString}</code>
        </pre>
      );
    }

    const parseRow = (row) =>
      row
        .split('|')
        .map((c) => c.trim())
        .filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);

    const headers = parseRow(lines[0]);
    const rows = lines.slice(2).map(parseRow);

    return (
      <div className="table-responsive">
        <table className="lesson-rendered-table">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i}>{h.replace(/\*\*/g, '')}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rIdx) => (
              <tr key={rIdx}>
                {row.map((cell, cIdx) => (
                  <td key={cIdx}>{cell.replace(/\*\*/g, '')}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Sync selected semester and subject when URL changes
  useEffect(() => {
    if (resolvedCurriculumSubject) {
      if (resolvedCurriculumSubject.semester) {
        setSelectedSemesterNum(Number(resolvedCurriculumSubject.semester));
      }
      setSelectedSubjectId(resolvedCurriculumSubject.id || resolvedCurriculumSubject.code);
    } else if (paramSemester) {
      setSelectedSemesterNum(Number(paramSemester) || 1);
    }
  }, [resolvedCurriculumSubject, paramSemester]);

  // Load authenticated student progress from database on mount and whenever user changes
  useEffect(() => {
    let isMounted = true;
    if (!userId || userId === 'guest') return;

    (async () => {
      try {
        const res = unwrap(await api.get('/progress/summary'));
        const summaryData = res?.summary || res;
        if (isMounted) {
          if (Array.isArray(res?.inProgressLessons)) {
            setInProgressLessons(res.inProgressLessons);
          }
          if (summaryData) {
            if (Array.isArray(summaryData.completedLessons)) {
              setCompleteIds(new Set(summaryData.completedLessons));
              try {
                localStorage.setItem(
                  `bca_completed_lessons_${userId}`,
                  JSON.stringify(summaryData.completedLessons)
                );
              } catch {}
            }
            if (summaryData.lastVisitedLesson?.lessonId) {
              setLastVisitedLesson(summaryData.lastVisitedLesson);
            }
            if (summaryData.nextUnfinishedLesson?.lessonId) {
              setInProgressLessonId(summaryData.nextUnfinishedLesson.lessonId);
              try {
                localStorage.setItem(
                  `bca_in_progress_lesson_${userId}`,
                  summaryData.nextUnfinishedLesson.lessonId
                );
              } catch {}
            } else if (summaryData.currentLesson?.lessonId) {
              setInProgressLessonId(summaryData.currentLesson.lessonId);
            }
          }
        }

        // Fetch active in-progress lessons list directly
        try {
          const inProgRes = unwrap(await api.get('/progress/in-progress'));
          if (isMounted && Array.isArray(inProgRes?.inProgressLessons)) {
            setInProgressLessons(inProgRes.inProgressLessons);
          }
        } catch {}

        // Fetch user bookmarks
        try {
          const bmRes = unwrap(await api.get('/progress/bookmarks'));
          if (isMounted && bmRes?.bookmarks) {
            setBookmarkedIds(new Set(bmRes.bookmarks.map((b) => b.lessonId)));
          }
        } catch {}

        // Fetch user difficult topics marked for revision
        try {
          const diffRes = unwrap(await api.get('/progress/difficult'));
          if (isMounted && diffRes?.difficultTopics) {
            setDifficultIds(new Set(diffRes.difficultTopics.map((d) => d.lessonId)));
          }
        } catch {}

        // Fetch user personal lesson notes
        try {
          const notesRes = unwrap(await api.get('/progress/notes'));
          if (isMounted && notesRes?.notes) {
            const nMap = {};
            notesRes.notes.forEach((n) => {
              nMap[n.lessonId] = n.note;
            });
            setLessonNotes(nMap);
          }
        } catch {}
      } catch (err) {
        // Fallback gracefully to user-scoped localStorage
        try {
          const saved = localStorage.getItem(`bca_completed_lessons_${userId}`);
          if (saved && isMounted) {
            setCompleteIds(new Set(JSON.parse(saved)));
          }
        } catch {}
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  // Load backend semesters on mount (if available)
  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = listFrom(unwrap(await api.get('/semesters')), 'semesters');
        if (isMounted) setBackendSemesters(res);
      } catch {
        // Fallback gracefully to complete official syllabus
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch backend subjects for active semester if available
  useEffect(() => {
    let isMounted = true;
    const backendSemMatch = backendSemesters.find((s) => s.number === selectedSemesterNum || s.order === selectedSemesterNum);
    if (!backendSemMatch) {
      setBackendSubjects([]);
      return;
    }

    (async () => {
      try {
        const subs = listFrom(unwrap(await api.get(`/semesters/${idOf(backendSemMatch)}/subjects`)), 'subjects');
        if (isMounted) setBackendSubjects(subs);
      } catch {
        if (isMounted) setBackendSubjects([]);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [backendSemesters, selectedSemesterNum]);

  // Current active subject data from curriculum
  const currentSemesterPlan = useMemo(() => {
    return semestersList.find((s) => s.semester === selectedSemesterNum) || semestersList[0];
  }, [selectedSemesterNum]);

  const semesterSubjectsList = useMemo(() => {
    return currentSemesterPlan?.subjects || [];
  }, [currentSemesterPlan]);

  const activeSubject = useMemo(() => {
    const normalize = (val) => String(val || '').trim().toLowerCase().replace(/[\s-_]/g, '');
    const targetNorm = normalize(selectedSubjectId);

    const matchSubject = (s) => {
      if (!s) return false;
      const sIdNorm = normalize(s.id);
      const sCodeNorm = normalize(s.code);
      const sNameNorm = normalize(s.name);
      return (
        sIdNorm === targetNorm ||
        sCodeNorm === targetNorm ||
        sNameNorm === targetNorm ||
        (targetNorm.length > 3 && (sNameNorm.includes(targetNorm) || targetNorm.includes(sNameNorm)))
      );
    };

    const fromSemester = semesterSubjectsList.find(matchSubject);
    if (fromSemester) return fromSemester;

    const fromAll = allSubjects.find(matchSubject);
    if (fromAll) return fromAll;

    return semesterSubjectsList[0] || allSubjects[0];
  }, [semesterSubjectsList, selectedSubjectId]);

  // Complete subject learning roadmap
  const subjectRoadmap = useMemo(() => {
    return getSubjectRoadmap(activeSubject?.code || activeSubject?.id || selectedSubjectId);
  }, [activeSubject, selectedSubjectId]);

  // Check if active subject exists in backend
  const backendSubjectMatch = useMemo(() => {
    if (!activeSubject) return null;
    return backendSubjects.find(
      (bs) =>
        (bs.code && bs.code.toLowerCase() === (activeSubject.code || '').toLowerCase()) ||
        (bs.title && bs.title.toLowerCase() === (activeSubject.name || '').toLowerCase())
    );
  }, [backendSubjects, activeSubject]);

  // Load backend topics/lessons if subject exists in backend
  useEffect(() => {
    let isMounted = true;
    if (!backendSubjectMatch) {
      setBackendLessons([]);
      return;
    }

    (async () => {
      try {
        const topItems = listFrom(unwrap(await api.get(`/subjects/${idOf(backendSubjectMatch)}/topics`)), 'topics');
        if (isMounted && topItems.length > 0) {
          const firstTopicId = idOf(topItems[0]);
          const lessItems = listFrom(unwrap(await api.get(`/topics/${firstTopicId}/lessons`)), 'lessons');
          if (isMounted) {
            setBackendLessons(lessItems);
            const done = lessItems
              .filter((l) => l.completed || l.isCompleted || l.progress?.status === 'completed')
              .map(idOf);
            if (done.length) {
              setCompleteIds((prev) => new Set([...prev, ...done]));
            }
          }
        }
      } catch {
        if (isMounted) setBackendLessons([]);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [backendSubjectMatch]);

  // Flattened list of all lessons in sequence across all units
  const allSubjectLessons = useMemo(() => {
    if (!subjectRoadmap?.units) return [];
    const flattened = [];
    subjectRoadmap.units.forEach((unitObj, uIdx) => {
      unitObj.lessons?.forEach((lesson, lIdx) => {
        flattened.push({
          ...lesson,
          unitIndex: uIdx,
          unitNumber: unitObj.unitNumber,
          unitTitle: unitObj.unitTitle,
          globalIndex: flattened.length
        });
      });
    });
    return flattened;
  }, [subjectRoadmap]);

  // Total metrics
  const totalUnitsCount = subjectRoadmap?.units?.length || 4;
  const totalTopicsCount = allSubjectLessons.length || 16;
  const totalLessonsCount = allSubjectLessons.length || 16;
  const totalEstimatedHours = subjectRoadmap?.totalEstimatedHours || Math.max(60, (activeSubject?.credits || 4) * 15);

  const completedLessonsCount = useMemo(() => {
    return allSubjectLessons.filter((l) => completeIds.has(l.lessonId)).length;
  }, [allSubjectLessons, completeIds]);

  const subjectCompletionPercent = useMemo(() => {
    if (totalLessonsCount === 0) return 0;
    return Math.round((completedLessonsCount / totalLessonsCount) * 100);
  }, [totalLessonsCount, completedLessonsCount]);

  // Identify next recommended lesson
  const nextRecommendedLesson = useMemo(() => {
    // First lesson that is not yet completed
    return allSubjectLessons.find((l) => !completeIds.has(l.lessonId)) || null;
  }, [allSubjectLessons, completeIds]);

  // Helper to determine status for any lesson: 'Completed', 'In Progress', 'Not Started', or 'Locked'
  const getLessonStatus = useCallback((lesson, index) => {
    // If student is enrolled in a different semester, this lesson is locked
    if (studentSem && activeSubject?.semester && Number(activeSubject.semester) !== studentSem) {
      return 'Locked';
    }

    const lId = lesson.lessonId;
    if (completeIds.has(lId)) {
      return 'Completed';
    }

    if (
      inProgressLessonId === lId ||
      inProgressLessons.some((p) => p.lessonId === lId) ||
      (!inProgressLessonId && inProgressLessons.length === 0 && nextRecommendedLesson?.lessonId === lId)
    ) {
      return 'In Progress';
    }

    // A lesson is unlocked if it's in the first unit or if earlier units have progress
    // or if the immediately preceding lesson is completed
    if (index === 0) {
      return 'Not Started';
    }

    const prevLesson = allSubjectLessons[index - 1];
    if (prevLesson && completeIds.has(prevLesson.lessonId)) {
      return 'Not Started';
    }

    // Lessons within the same unit as the next recommended lesson are Not Started
    if (nextRecommendedLesson && lesson.unitIndex === nextRecommendedLesson.unitIndex) {
      return 'Not Started';
    }

    // Lessons further ahead in subsequent incomplete units are Locked
    if (nextRecommendedLesson && lesson.unitIndex > nextRecommendedLesson.unitIndex + 1) {
      return 'Locked';
    }

    return 'Not Started';
  }, [completeIds, inProgressLessonId, inProgressLessons, nextRecommendedLesson, allSubjectLessons, studentSem, activeSubject?.semester]);

  // Helper to calculate unit completion
  const getUnitMetrics = useCallback((unitObj) => {
    const lessons = unitObj.lessons || [];
    const completed = lessons.filter((l) => completeIds.has(l.lessonId)).length;
    const total = lessons.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    const totalMins = lessons.reduce((acc, l) => acc + (l.estimatedMinutes || 30), 0) + (unitObj.milestone?.estimatedMinutes || 45);
    const hours = (totalMins / 60).toFixed(1);

    let status = 'Not Started';
    if (percent === 100) status = 'Completed';
    else if (completed > 0 || (nextRecommendedLesson && unitObj.unitNumber === nextRecommendedLesson.unitNumber)) status = 'In Progress';

    return { completed, total, percent, hours, status };
  }, [completeIds, nextRecommendedLesson]);

  // Toggle unit expansion
  const toggleUnit = (idx) => {
    setExpandedUnits((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const expandAllUnits = () => {
    setExpandedUnits({ 0: true, 1: true, 2: true, 3: true });
  };

  const collapseAllUnits = () => {
    setExpandedUnits({ 0: false, 1: false, 2: false, 3: false });
  };

  // Derive comprehensive semester subjects and their started progress
  const allEnrolledSemesterSubjects = useMemo(() => {
    const semPlan = semestersList.find((s) => s.semester === selectedSemesterNum) || semestersList[0];
    const subjects = semPlan?.subjects || [];
    return subjects.map((sub) => {
      const roadmap = getSubjectRoadmap(sub.code || sub.id);
      const lessons = [];
      roadmap?.units?.forEach((u, uIdx) => {
        u.lessons?.forEach((l) => {
          lessons.push({
            ...l,
            unitIndex: uIdx,
            unitNumber: u.unitNumber,
            unitTitle: u.unitTitle,
            subjectCode: sub.code,
            subjectName: sub.name,
            subjectId: sub.id,
            semester: sub.semester
          });
        });
      });

      const completedLessons = lessons.filter((l) => completeIds.has(l.lessonId));
      const completedCount = completedLessons.length;
      const totalLessons = lessons.length || 16;
      const percent = Math.round((completedCount / totalLessons) * 100);
      const isCompleted = percent === 100;

      // Find in-progress or next unfinished lesson
      const inProgMatch = inProgressLessons.find(
        (l) => (l.subjectCode === sub.code || l.subjectId === sub.id) && !completeIds.has(l.lessonId)
      );

      const isCurrentInProgress = inProgressLessonId && lessons.some((l) => l.lessonId === inProgressLessonId && !completeIds.has(l.lessonId));
      const isLastVisited = lastVisitedLesson && (lastVisitedLesson.subjectCode === sub.code || lastVisitedLesson.subjectId === sub.id) && !completeIds.has(lastVisitedLesson.lessonId);

      const activeUncompletedLesson =
        inProgMatch ||
        (isCurrentInProgress ? lessons.find((l) => l.lessonId === inProgressLessonId) : null) ||
        (isLastVisited ? lastVisitedLesson : null) ||
        lessons.find((l) => !completeIds.has(l.lessonId)) ||
        lessons[0];

      const isStarted =
        completedCount > 0 ||
        Boolean(inProgMatch) ||
        Boolean(isCurrentInProgress) ||
        Boolean(isLastVisited);

      return {
        ...sub,
        roadmap,
        lessons,
        completedCount,
        totalLessons,
        percent,
        isCompleted,
        isStarted,
        inProgMatch,
        activeLesson: activeUncompletedLesson,
        firstLesson: lessons[0]
      };
    });
  }, [selectedSemesterNum, completeIds, inProgressLessons, inProgressLessonId, lastVisitedLesson]);

  const startedSubjects = useMemo(() => {
    return allEnrolledSemesterSubjects.filter((s) => s.isStarted);
  }, [allEnrolledSemesterSubjects]);

  const totalLessonsAcrossSem = useMemo(() => {
    return allEnrolledSemesterSubjects.reduce((acc, s) => acc + s.totalLessons, 0);
  }, [allEnrolledSemesterSubjects]);

  const totalCompletedLessonsAcrossSem = useMemo(() => {
    return allEnrolledSemesterSubjects.reduce((acc, s) => acc + s.completedCount, 0);
  }, [allEnrolledSemesterSubjects]);

  const semesterOverallPercent = useMemo(() => {
    if (!totalLessonsAcrossSem) return 0;
    return Math.round((totalCompletedLessonsAcrossSem / totalLessonsAcrossSem) * 100);
  }, [totalLessonsAcrossSem, totalCompletedLessonsAcrossSem]);

  const totalInProgressLessonsCount = useMemo(() => {
    return allEnrolledSemesterSubjects.filter((s) => s.inProgMatch || (s.isStarted && !s.isCompleted)).length;
  }, [allEnrolledSemesterSubjects]);

  // Direct launcher for lessons from the Started Subjects overview
  const handleOpenDirectLesson = (sub, lesson) => {
    if (!lesson) return;
    if (sub) {
      setSelectedSubjectId(sub.id || sub.code);
    }
    handleOpenLesson({
      ...lesson,
      subjectCode: sub?.code || lesson.subjectCode,
      subjectName: sub?.name || lesson.subjectName,
      semester: sub?.semester || selectedSemesterNum
    });
  };

  // Open lesson modal and set as in-progress
  const handleOpenLesson = async (lesson) => {
    const effSubject =
      (lesson?.subjectCode && allSubjects.find((s) => s.code === lesson.subjectCode)) ||
      (lesson?.subjectId && allSubjects.find((s) => s.id === lesson.subjectId)) ||
      activeSubject;

    if (studentSem && effSubject?.semester && Number(effSubject.semester) !== studentSem) {
      alert(`🔒 Locked: This lesson belongs to Semester ${effSubject.semester}. You are enrolled in Semester ${studentSem}, so only Semester ${studentSem} lessons, quizzes, and assessments are unlocked.`);
      return;
    }

    const lId = lesson.lessonId;
    setInProgressLessonId(lId);
    try {
      localStorage.setItem(`bca_in_progress_lesson_${userId}`, lId);
    } catch {}

    setInProgressLessons((prev) => {
      const exists = prev.some((p) => p.lessonId === lId);
      if (exists) {
        return prev.map((p) => (p.lessonId === lId ? { ...p, lastAccessedAt: new Date() } : p));
      }
      return [
        {
          lessonId: lId,
          lessonTitle: lesson.title,
          title: lesson.title,
          subjectCode: effSubject?.code || activeSubject?.code || '',
          subjectName: effSubject?.name || activeSubject?.name || '',
          semester: effSubject?.semester || selectedSemesterNum,
          unitIndex: lesson.unitIndex ?? 0,
          unitNumber: lesson.unitNumber || 'Unit I',
          unitTitle: lesson.unitTitle || '',
          status: 'in_progress',
          lastAccessedAt: new Date()
        },
        ...prev
      ];
    });

    // Persist active learning state to database for authenticated user
    if (userId && userId !== 'guest') {
      api
        .post('/progress/access', {
          lessonId: lId,
          subjectCode: effSubject?.code || activeSubject?.code || '',
          subjectName: effSubject?.name || activeSubject?.name || '',
          semester: effSubject?.semester || selectedSemesterNum,
          unitIndex: lesson.unitIndex ?? 0,
          unitNumber: lesson.unitNumber || 'Unit I',
          title: lesson.title || ''
        })
        .catch(() => {});
    }

    setActiveLesson(lesson);
    setActiveLessonLoading(true);
    setQuizAnswers({});
    setRevealedHints({});
    setCopiedCode(false);
    setActiveModalTab('all');

    // Load personal note for this lesson
    setActiveNoteText(lessonNotes[lId] || '');
    setNoteSaveStatus('');
    if (userId && userId !== 'guest') {
      api
        .get(`/progress/lessons/${lId}/note`)
        .then((res) => {
          const data = unwrap(res);
          if (data?.note) {
            setActiveNoteText(data.note);
            setLessonNotes((prev) => ({ ...prev, [lId]: data.note }));
          }
        })
        .catch(() => {});
    }

    // Retrieve detailed 10-point lesson content from official dataset
    const detailed = getDetailedLessonContent(lId, effSubject?.code || activeSubject?.code, lesson.officialTopicReference);

    if (lesson.isBackend) {
      try {
        const response = unwrap(await api.get(`/curriculum/lessons/${lId}`));
        const backendLesson = response.lesson || response;
        setActiveLessonContent({
          ...(detailed || {}),
          ...backendLesson,
          title: backendLesson.title || detailed?.title || lesson.title,
          officialTopic: lesson.officialTopicReference || detailed?.officialTopicReference,
          unitName: lesson.unitNumber || detailed?.unitNumber || `Unit ${lesson.unitIndex + 1}`,
          unitTitle: lesson.unitTitle || detailed?.unitTitle || '',
          subjectName: effSubject?.name || activeSubject?.name || detailed?.subjectName,
          subjectCode: effSubject?.code || activeSubject?.code || detailed?.subjectCode,
          prerequisites: detailed?.prerequisites || lesson.prerequisites || ['Basic computer science literacy']
        });
      } catch {
        setActiveLessonContent(detailed || {
          title: lesson.title,
          officialTopic: lesson.officialTopicReference,
          summary: lesson.summary || lesson.officialTopicReference,
          content: `${lesson.summary || lesson.officialTopicReference}\n\nReview the core principles and verify your understanding.`
        });
      } finally {
        setActiveLessonLoading(false);
      }
    } else {
      setActiveLessonLoading(false);
      if (detailed) {
        setActiveLessonContent({
          ...detailed,
          unitName: lesson.unitNumber || detailed.unitNumber,
          unitTitle: lesson.unitTitle || detailed.unitTitle,
          subjectName: effSubject?.name || activeSubject?.name || detailed.subjectName,
          subjectCode: effSubject?.code || activeSubject?.code || detailed.subjectCode,
          officialTopic: lesson.officialTopicReference || detailed.officialTopicReference,
          prerequisites: detailed.prerequisites || lesson.prerequisites || ['Basic computer science literacy']
        });
      } else {
        setActiveLessonContent({
          title: lesson.title,
          officialTopic: lesson.officialTopicReference,
          summary: lesson.supplementaryExplanation || `Comprehensive learning module covering: ${lesson.officialTopicReference}`,
          unitName: lesson.unitNumber || `Unit ${lesson.unitIndex + 1}`,
          unitTitle: lesson.unitTitle || '',
          subjectName: effSubject?.name || activeSubject?.name,
          subjectCode: effSubject?.code || activeSubject?.code,
          learningObjectives: lesson.learningObjectives || [],
          expectedOutcomes: lesson.expectedOutcomes || [],
          estimatedMinutes: lesson.estimatedMinutes || 30,
          prerequisites: lesson.prerequisites || ['Basic computer science literacy']
        });
      }
    }
  };

  const handleCloseLesson = useCallback(() => {
    hasHandledAutoOpenRef.current = true;
    setActiveLesson(null);
    setActiveLessonContent(null);
    setQuizAnswers({});
    setRevealedHints({});
    setCopiedCode(false);

    // Clear auto-open query parameters from URL so it does not immediately reopen
    const paramLesson = searchParams.get('lesson');
    const paramLessonId = searchParams.get('lessonId');
    const paramOpen = searchParams.get('open');
    if (paramLesson || paramLessonId || paramOpen) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('lesson');
      nextParams.delete('lessonId');
      nextParams.delete('open');
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Resolve current active in-progress unfinished lesson
  const activeInProgressLesson = useMemo(() => {
    // 1. Look for uncompleted lessons in inProgressLessons from database
    const uncompletedList = inProgressLessons.filter((l) => !completeIds.has(l.lessonId));
    if (uncompletedList.length > 0) {
      // Prioritize lesson in the currently viewed subject
      const matchInCurrent = uncompletedList.find(
        (l) => l.subjectCode === activeSubject?.code || l.subjectId === activeSubject?.id
      );
      if (matchInCurrent) {
        const fullLesson = allSubjectLessons.find((sl) => sl.lessonId === matchInCurrent.lessonId);
        return {
          ...matchInCurrent,
          title: matchInCurrent.lessonTitle || matchInCurrent.title || fullLesson?.title,
          unitNumber: matchInCurrent.unitNumber || fullLesson?.unitNumber || 'Unit I',
          unitTitle: matchInCurrent.unitTitle || fullLesson?.unitTitle || '',
          lesson: fullLesson || matchInCurrent
        };
      }
      return uncompletedList[0];
    }

    // 2. Check inProgressLessonId if not completed
    if (inProgressLessonId && !completeIds.has(inProgressLessonId)) {
      const found = allSubjectLessons.find((l) => l.lessonId === inProgressLessonId);
      if (found) {
        return {
          lessonId: found.lessonId,
          lessonTitle: found.title,
          title: found.title,
          subjectCode: activeSubject?.code,
          subjectName: activeSubject?.name,
          semester: selectedSemesterNum,
          unitIndex: found.unitIndex,
          unitNumber: found.unitNumber,
          unitTitle: found.unitTitle,
          officialTopicReference: found.officialTopicReference,
          lesson: found
        };
      }
    }

    // 3. Check lastVisitedLesson if not completed
    if (lastVisitedLesson?.lessonId && !completeIds.has(lastVisitedLesson.lessonId)) {
      return {
        lessonId: lastVisitedLesson.lessonId,
        lessonTitle: lastVisitedLesson.title || lastVisitedLesson.lessonTitle,
        title: lastVisitedLesson.title || lastVisitedLesson.lessonTitle,
        subjectCode: lastVisitedLesson.subjectCode || activeSubject?.code,
        subjectName: lastVisitedLesson.subjectName || activeSubject?.name,
        semester: lastVisitedLesson.semester || selectedSemesterNum,
        unitIndex: lastVisitedLesson.unitIndex,
        unitNumber: lastVisitedLesson.unitNumber,
        unitTitle: lastVisitedLesson.unitTitle
      };
    }

    return null;
  }, [inProgressLessons, completeIds, activeSubject, inProgressLessonId, allSubjectLessons, selectedSemesterNum, lastVisitedLesson]);

  // Direct link handler to jump straight into an in-progress incomplete lesson
  const handleGoToInProgressLesson = (inProgLesson) => {
    if (!inProgLesson) return;
    const targetLessonId = inProgLesson.lessonId;
    const targetSubjectCode = inProgLesson.subjectCode;
    const targetSemester = inProgLesson.semester || selectedSemesterNum;

    // Check if belongs to active subject
    const isSameSubject =
      !targetSubjectCode ||
      targetSubjectCode === activeSubject?.code ||
      inProgLesson.subjectId === activeSubject?.id;

    if (isSameSubject) {
      const match = allSubjectLessons.find((l) => l.lessonId === targetLessonId);
      if (match) {
        handleOpenLesson(match);
      } else {
        handleOpenLesson({
          lessonId: targetLessonId,
          title: inProgLesson.lessonTitle || inProgLesson.title || targetLessonId,
          unitIndex: inProgLesson.unitIndex ?? 0,
          unitNumber: inProgLesson.unitNumber || 'Unit I',
          unitTitle: inProgLesson.unitTitle || '',
          officialTopicReference: inProgLesson.officialTopicReference || inProgLesson.title
        });
      }
    } else {
      // Belongs to another subject in student's semester - navigate and open
      navigate(
        `/lessons/${encodeURIComponent(targetSubjectCode)}?semester=${encodeURIComponent(targetSemester)}&lessonId=${encodeURIComponent(targetLessonId)}&open=true`,
        { replace: false }
      );
    }
  };

  // Handle toggling bookmark for a lesson
  const handleToggleBookmark = async (lesson, e) => {
    if (e) e.stopPropagation();
    const lId = lesson.lessonId;
    const nextSet = new Set(bookmarkedIds);
    const willBookmark = !nextSet.has(lId);
    if (willBookmark) nextSet.add(lId);
    else nextSet.delete(lId);
    setBookmarkedIds(nextSet);

    if (userId && userId !== 'guest') {
      try {
        await api.post(`/progress/lessons/${lId}/bookmark`, {
          subjectCode: activeSubject?.code || '',
          subjectName: activeSubject?.name || '',
          semester: selectedSemesterNum,
          title: lesson.title || ''
        });
      } catch {}
    }
  };

  // Handle toggling difficult/revision flag for a lesson
  const handleToggleDifficult = async (lesson, e) => {
    if (e) e.stopPropagation();
    const lId = lesson.lessonId;
    const nextSet = new Set(difficultIds);
    const willBeDifficult = !nextSet.has(lId);
    if (willBeDifficult) nextSet.add(lId);
    else nextSet.delete(lId);
    setDifficultIds(nextSet);

    if (userId && userId !== 'guest') {
      try {
        await api.post(`/progress/lessons/${lId}/difficult`, {
          subjectCode: activeSubject?.code || '',
          subjectName: activeSubject?.name || '',
          semester: selectedSemesterNum,
          title: lesson.title || ''
        });
      } catch {}
    }
  };

  // Handle saving personal note
  const handleSavePersonalNote = async () => {
    if (!activeLesson) return;
    setSavingNote(true);
    setNoteSaveStatus('');
    const lId = activeLesson.lessonId;

    try {
      if (userId && userId !== 'guest') {
        await api.post(`/progress/lessons/${lId}/note`, {
          note: activeNoteText,
          subjectCode: activeSubject?.code || '',
          subjectName: activeSubject?.name || '',
          semester: selectedSemesterNum,
          title: activeLesson.title || ''
        });
      }
      setLessonNotes((prev) => ({ ...prev, [lId]: activeNoteText }));
      setNoteSaveStatus('Saved to account');
      setTimeout(() => setNoteSaveStatus(''), 3000);
    } catch {
      setLessonNotes((prev) => ({ ...prev, [lId]: activeNoteText }));
      setNoteSaveStatus('Saved locally');
      setTimeout(() => setNoteSaveStatus(''), 3000);
    } finally {
      setSavingNote(false);
    }
  };

  // Prev and Next navigation inside lesson viewer
  const currentLessonGlobalIdx = useMemo(() => {
    if (!activeLesson || !allSubjectLessons.length) return -1;
    return allSubjectLessons.findIndex((l) => l.lessonId === activeLesson.lessonId);
  }, [activeLesson, allSubjectLessons]);

  const hasPrevLesson = currentLessonGlobalIdx > 0;
  const hasNextLesson = currentLessonGlobalIdx >= 0 && currentLessonGlobalIdx < allSubjectLessons.length - 1;

  const handlePrevLesson = () => {
    if (hasPrevLesson) {
      handleOpenLesson(allSubjectLessons[currentLessonGlobalIdx - 1]);
    }
  };

  const handleNextLesson = () => {
    if (hasNextLesson) {
      handleOpenLesson(allSubjectLessons[currentLessonGlobalIdx + 1]);
    }
  };

  // Subject Glossary compilation
  const subjectGlossary = useMemo(() => {
    return getSubjectGlossary(activeSubject?.code, allSubjectLessons);
  }, [activeSubject?.code, allSubjectLessons]);

  const filteredGlossary = useMemo(() => {
    if (!glossarySearch.trim()) return subjectGlossary;
    const q = glossarySearch.toLowerCase();
    return subjectGlossary.filter(
      (g) => g.term.toLowerCase().includes(q) || g.definition.toLowerCase().includes(q)
    );
  }, [subjectGlossary, glossarySearch]);

  // Subject Resources
  const subjectResources = useMemo(() => {
    return getSubjectResources(activeSubject?.code);
  }, [activeSubject?.code]);

  // Mark lesson as complete
  const markLessonComplete = async (lesson) => {
    const lId = lesson.lessonId;
    setSavingId(lId);
    setMessage('');

    try {
      // 1. Optimistic local update
      setCompleteIds((prev) => {
        const next = new Set(prev).add(lId);
        try {
          localStorage.setItem(`bca_completed_lessons_${userId}`, JSON.stringify([...next]));
        } catch {}
        return next;
      });

      setInProgressLessons((prev) => prev.filter((p) => p.lessonId !== lId));
      if (inProgressLessonId === lId) {
        setInProgressLessonId('');
        try {
          localStorage.removeItem(`bca_in_progress_lesson_${userId}`);
        } catch {}
      }

      // 2. Persist to database for authenticated user
      if (userId && userId !== 'guest') {
        await api.post(`/progress/lessons/${lId}/complete`, {
          subjectCode: activeSubject?.code || '',
          subjectName: activeSubject?.name || '',
          semester: selectedSemesterNum,
          unitIndex: lesson.unitIndex ?? 0,
          unitNumber: lesson.unitNumber || 'Unit I',
          title: lesson.title || ''
        });
      }

      setMessage(`🎉 Outstanding! "${lesson.title}" marked as complete.`);
      setTimeout(() => setMessage(''), 4500);

      // Advance in-progress to the next lesson if available
      const nextIdx = lesson.globalIndex + 1;
      if (nextIdx < allSubjectLessons.length) {
        const nextL = allSubjectLessons[nextIdx];
        setInProgressLessonId(nextL.lessonId);
        try {
          localStorage.setItem(`bca_in_progress_lesson_${userId}`, nextL.lessonId);
        } catch {}
      }
    } catch (err) {
      console.error('Lesson completion failed:', err);
      setMessage(`✓ Saved locally: "${lesson.title}"`);
      setTimeout(() => setMessage(''), 3500);
    } finally {
      setSavingId('');
    }
  };

  // Toggle lesson complete (allow marking or unmarking)
  const toggleLessonComplete = async (lesson) => {
    const lId = lesson.lessonId;
    setSavingId(lId);
    setMessage('');
    const isCurrentlyDone = completeIds.has(lId);

    try {
      setCompleteIds((prev) => {
        const next = new Set(prev);
        if (isCurrentlyDone) {
          next.delete(lId);
        } else {
          next.add(lId);
        }
        try {
          localStorage.setItem(`bca_completed_lessons_${userId}`, JSON.stringify([...next]));
        } catch {}
        return next;
      });

      setInProgressLessons((prev) => {
        if (!isCurrentlyDone) {
          return prev.filter((p) => p.lessonId !== lId);
        } else {
          return [
            {
              lessonId: lId,
              lessonTitle: lesson.title,
              title: lesson.title,
              subjectCode: activeSubject?.code || '',
              subjectName: activeSubject?.name || '',
              semester: selectedSemesterNum,
              unitIndex: lesson.unitIndex ?? 0,
              unitNumber: lesson.unitNumber || 'Unit I',
              unitTitle: lesson.unitTitle || '',
              status: 'in_progress',
              lastAccessedAt: new Date()
            },
            ...prev
          ];
        }
      });

      if (userId && userId !== 'guest') {
        await api.post(`/progress/lessons/${lId}/toggle`, {
          subjectCode: activeSubject?.code || '',
          subjectName: activeSubject?.name || '',
          semester: selectedSemesterNum,
          unitIndex: lesson.unitIndex ?? 0,
          unitNumber: lesson.unitNumber || 'Unit I',
          title: lesson.title || ''
        });
      }

      setMessage(
        isCurrentlyDone
          ? `Lesson "${lesson.title}" marked as In Progress.`
          : `🎉 Outstanding! "${lesson.title}" marked as complete.`
      );
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      console.error('Toggle failed:', err);
    } finally {
      setSavingId('');
    }
  };

  // Reset auto-open flag if URL parameter changes to a new lesson
  const currentParamLessonId = searchParams.get('lesson') || searchParams.get('lessonId');
  const prevParamLessonRef = useRef('');
  useEffect(() => {
    if (currentParamLessonId && currentParamLessonId !== prevParamLessonRef.current) {
      prevParamLessonRef.current = currentParamLessonId;
      hasHandledAutoOpenRef.current = false;
    }
  }, [currentParamLessonId]);

  // Auto-open requested lesson from query parameters (e.g. from Continue Learning CTA)
  useEffect(() => {
    const shouldOpen = searchParams.get('open') === 'true' || Boolean(currentParamLessonId);
    if (
      currentParamLessonId &&
      !hasHandledAutoOpenRef.current &&
      allSubjectLessons.length > 0 &&
      !activeLesson &&
      shouldOpen
    ) {
      const target = allSubjectLessons.find((l) => l.lessonId === currentParamLessonId);
      if (target) {
        hasHandledAutoOpenRef.current = true;
        handleOpenLesson(target);
      }
    }
  }, [searchParams, allSubjectLessons, activeLesson, currentParamLessonId]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!activeLesson) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleCloseLesson();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLesson, handleCloseLesson]);

  // Advance to next lesson inside modal
  const handleAdvanceToNextLesson = () => {
    if (!activeLesson) return;
    const currentGlobal = activeLesson.globalIndex;
    if (currentGlobal + 1 < allSubjectLessons.length) {
      const nextL = allSubjectLessons[currentGlobal + 1];
      handleOpenLesson(nextL);
    } else {
      handleCloseLesson();
    }
  };

  // Dropdown change handlers
  const handleSemesterChange = (newSemNum) => {
    const sem = Number(newSemNum);
    setSelectedSemesterNum(sem);
    const plan = semestersList.find((s) => s.semester === sem) || semestersList[0];
    const firstSub = plan.subjects[0];
    if (firstSub) {
      setSelectedSubjectId(firstSub.id || firstSub.code);
      navigate(`/lessons/${encodeURIComponent(firstSub.id || firstSub.code)}?semester=${sem}&name=${encodeURIComponent(firstSub.name)}&code=${encodeURIComponent(firstSub.code)}`, { replace: true });
    }
  };

  const handleSubjectChange = (newSubjectId) => {
    setSelectedSubjectId(newSubjectId);
    const sub = allSubjects.find((s) => s.id === newSubjectId || s.code === newSubjectId);
    if (sub) {
      navigate(`/lessons/${encodeURIComponent(sub.id || sub.code)}?semester=${selectedSemesterNum}&name=${encodeURIComponent(sub.name)}&code=${encodeURIComponent(sub.code)}`, { replace: true });
    }
  };

  const activeColors = semesterColors[selectedSemesterNum] || semesterColors[1];

  return (
    <div className="content-page learning-page subject-learning-container">
      {/* 1. Top Navigation Bar with Back to Curriculum Button & Breadcrumbs */}
      <nav className="learning-top-nav" aria-label="Learning navigation">
        <button
          type="button"
          className="button button-secondary button-small back-to-curriculum-btn"
          onClick={() => navigate(`/curriculum?semester=${selectedSemesterNum}`)}
          title="Return to Curriculum Map"
        >
          <ArrowLeft size={15} />
          <span>Back to Curriculum</span>
        </button>

        <div className="learning-breadcrumb">
          <Link to="/curriculum">Curriculum</Link>
          <span className="breadcrumb-sep">/</span>
          <span>Semester {selectedSemesterNum}</span>
          <span className="breadcrumb-sep">/</span>
          <strong className="breadcrumb-current">
            {viewMode === 'started_subjects' ? 'My Lessons' : (activeSubject?.name || 'Subject Learning')}
          </strong>
        </div>
      </nav>

      {viewMode === 'started_subjects' ? (
        <section className="started-subjects-view" aria-label="Started Subjects and Lessons">
          {/* Hero Overview Card */}
          <div className="started-hero-card" style={{ borderTop: `4px solid ${activeColors.primary}` }}>
            <div className="started-hero-top">
              <div className="started-hero-info">
                <div className="started-hero-badges">
                  <span
                    className="started-tag"
                    style={{
                      backgroundColor: activeColors.light,
                      color: activeColors.primary,
                      border: `1px solid ${activeColors.border}`
                    }}
                  >
                    Semester {selectedSemesterNum}
                  </span>
                  <span
                    className="started-tag"
                    style={{
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                      color: '#4f46e5'
                    }}
                  >
                    <BookOpen size={12} />
                    <span>NEP 2020 Aligned Syllabus</span>
                  </span>
                  {studentSem && (
                    <span
                      className="started-tag"
                      style={{
                        backgroundColor: '#d1fae5',
                        color: '#065f46',
                        border: '1px solid #a7f3d0'
                      }}
                    >
                      <CheckCircle2 size={12} />
                      <span>Enrolled Active Semester</span>
                    </span>
                  )}
                </div>

                <h1 className="started-hero-title">My Lessons</h1>
                <p className="started-hero-subtitle">
                  Review your started subjects, see current in-progress lessons, and jump directly into the exact module to complete it.
                </p>
              </div>

              {/* Semester Switcher for Mentor/Admin */}
              {!studentSem && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label htmlFor="sem-select" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Semester:
                  </label>
                  <select
                    id="sem-select"
                    value={selectedSemesterNum}
                    onChange={(e) => handleSemesterChange(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-surface)',
                      fontWeight: 700
                    }}
                  >
                    {semestersList.map((s) => (
                      <option key={s.semester} value={s.semester}>
                        Semester {s.semester}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Stats Metrics Grid */}
            <div className="started-stats-grid">
              <div className="started-stat-card">
                <div className="started-stat-icon" style={{ backgroundColor: activeColors.light, color: activeColors.primary }}>
                  <GraduationCap size={22} />
                </div>
                <div className="started-stat-details">
                  <span className="started-stat-value">Semester {selectedSemesterNum}</span>
                  <span className="started-stat-label">Current Term</span>
                </div>
              </div>

              <div className="started-stat-card">
                <div className="started-stat-icon" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                  <Layers size={22} />
                </div>
                <div className="started-stat-details">
                  <span className="started-stat-value">
                    {startedSubjects.length} / {allEnrolledSemesterSubjects.length}
                  </span>
                  <span className="started-stat-label">Started Subjects</span>
                </div>
              </div>

              <div className="started-stat-card">
                <div className="started-stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                  <CheckCheck size={22} />
                </div>
                <div className="started-stat-details">
                  <span className="started-stat-value">
                    {totalCompletedLessonsAcrossSem} / {totalLessonsAcrossSem}
                  </span>
                  <span className="started-stat-label">Lessons Done ({semesterOverallPercent}%)</span>
                </div>
              </div>

              <div className="started-stat-card">
                <div className="started-stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                  <Flame size={22} />
                </div>
                <div className="started-stat-details">
                  <span className="started-stat-value">{totalInProgressLessonsCount}</span>
                  <span className="started-stat-label">In-Progress Lessons</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Bar & Tabs */}
          <div className="started-tabs-bar">
            <div className="started-tabs-group">
              <button
                type="button"
                className={`started-tab-btn ${subjectFilterTab === 'started' ? 'active' : ''}`}
                onClick={() => setSubjectFilterTab('started')}
              >
                <Flame size={16} />
                <span>Started Subjects</span>
                <span className="started-tab-count">{startedSubjects.length}</span>
              </button>

              <button
                type="button"
                className={`started-tab-btn ${subjectFilterTab === 'all' ? 'active' : ''}`}
                onClick={() => setSubjectFilterTab('all')}
              >
                <BookOpen size={16} />
                <span>All Semester {selectedSemesterNum} Courses</span>
                <span className="started-tab-count">{allEnrolledSemesterSubjects.length}</span>
              </button>
            </div>
          </div>

          {/* Started Subjects Grid */}
          {subjectFilterTab === 'started' && startedSubjects.length === 0 ? (
            <div className="started-empty-card">
              <div className="started-empty-icon">
                <Compass size={32} />
              </div>
              <h2 className="started-empty-title">No Subjects Started Yet</h2>
              <p className="started-empty-desc">
                You haven't started any lessons yet in Semester {selectedSemesterNum}. Browse all semester courses below and click "Start Lesson 1 Directly" to begin studying right away!
              </p>
              <button
                type="button"
                className="button button-primary"
                onClick={() => setSubjectFilterTab('all')}
              >
                <span>Browse All Semester {selectedSemesterNum} Courses</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div className="started-grid">
              {(subjectFilterTab === 'started' ? startedSubjects : allEnrolledSemesterSubjects).map((sub) => {
                const isSubInProgress = Boolean(sub.inProgMatch) || (sub.isStarted && !sub.isCompleted);
                const isSubDone = sub.isCompleted;

                return (
                  <article key={sub.code || sub.id} className="started-course-card" style={{ borderTop: `3px solid ${activeColors.primary}` }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div className="started-course-top">
                        <div
                          className="started-course-icon-box"
                          style={{
                            backgroundColor: activeColors.light,
                            color: activeColors.primary
                          }}
                        >
                          <SubjectIcon iconName={sub.iconName} name={sub.iconName} size={28} />
                        </div>
                        <div className="started-course-meta">
                          <div className="started-course-tags">
                            <span
                              className="started-tag"
                              style={{
                                backgroundColor: activeColors.light,
                                color: activeColors.primary
                              }}
                            >
                              {sub.nature || 'DSC'}
                            </span>
                            <span
                              className="started-tag"
                              style={{
                                backgroundColor: 'var(--bg-surface-subtle, #f1f5f9)',
                                color: 'var(--text-secondary, #475569)'
                              }}
                            >
                              <Hash size={10} />
                              {sub.code}
                            </span>
                            <span
                              className="started-tag"
                              style={{
                                backgroundColor: 'var(--bg-surface-subtle, #f1f5f9)',
                                color: 'var(--text-secondary, #475569)'
                              }}
                            >
                              <GraduationCap size={11} />
                              {sub.credits || 4} Credits
                            </span>
                          </div>
                          <h2 className="started-course-title">{sub.name}</h2>
                          <p className="started-course-desc">{sub.description}</p>
                        </div>
                      </div>

                      {/* Course Completion Progress Bar */}
                      <div className="started-progress-section">
                        <div className="started-progress-labels">
                          <span className="started-progress-count">
                            {sub.completedCount} of {sub.totalLessons} Lessons Completed
                          </span>
                          <span className="started-progress-percent">
                            {sub.percent}%
                          </span>
                        </div>
                        <div className="started-progress-bar-track">
                          <div
                            className="started-progress-bar-fill"
                            style={{
                              width: `${sub.percent}%`,
                              backgroundColor: isSubDone ? '#10b981' : activeColors.primary
                            }}
                          />
                        </div>
                      </div>

                      {/* Active In-Progress / Uncompleted Lesson Box with DIRECT LINK */}
                      <div
                        className={`started-active-lesson-box ${
                          isSubDone ? 'completed-box' : isSubInProgress ? '' : 'unstarted-box'
                        }`}
                      >
                        <div className="started-lesson-header">
                          <span
                            className={`started-lesson-status-pill ${
                              isSubDone ? 'completed' : isSubInProgress ? 'in-progress' : 'ready'
                            }`}
                          >
                            <span
                              style={{
                                width: '7px',
                                height: '7px',
                                borderRadius: '50%',
                                backgroundColor: isSubDone ? '#10b981' : isSubInProgress ? '#f59e0b' : '#6366f1',
                                boxShadow: isSubInProgress ? '0 0 6px #f59e0b' : 'none'
                              }}
                            />
                            {isSubDone ? 'All 16 Lessons Completed' : isSubInProgress ? 'In Progress • Incomplete' : 'Ready to Start'}
                          </span>
                          <span className="started-lesson-unit-tag">
                            {sub.activeLesson?.unitNumber || 'Unit I'}
                          </span>
                        </div>

                        <div>
                          <h3 className="started-lesson-title">
                            {sub.activeLesson?.title || sub.firstLesson?.title || 'Course Lesson'}
                          </h3>
                          {(sub.activeLesson?.officialTopicReference || sub.firstLesson?.officialTopicReference) && (
                            <p className="started-lesson-topic">
                              {sub.activeLesson?.officialTopicReference || sub.firstLesson?.officialTopicReference}
                            </p>
                          )}
                        </div>

                        {/* DIRECT ACTION BUTTON TO JUMP STRAIGHT INTO LESSON */}
                        <button
                          type="button"
                          className="button button-primary started-direct-cta-btn"
                          onClick={() => handleOpenDirectLesson(sub, sub.activeLesson || sub.firstLesson)}
                          style={{
                            background: isSubDone
                              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                              : isSubInProgress
                              ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                              : `linear-gradient(135deg, ${activeColors.primary} 0%, #4338ca 100%)`,
                            color: '#ffffff',
                            border: 'none'
                          }}
                        >
                          <CirclePlay size={18} />
                          <span>
                            {isSubDone
                              ? 'Review Lesson Directly'
                              : isSubInProgress
                              ? 'Go to Lesson to Complete'
                              : 'Start Lesson 1 Directly'}
                          </span>
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Secondary button: Explore All 16 Lessons in Depth */}
                    <div className="started-card-footer">
                      <button
                        type="button"
                        className="started-explore-btn"
                        onClick={() => {
                          setSelectedSubjectId(sub.id || sub.code);
                          setViewMode('subject_detail');
                        }}
                      >
                        <BookOpen size={15} />
                        <span>Explore All 16 Lessons (4 Units)</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      ) : (
        <div className="subject-detail-view-wrapper">
          <div className="subject-detail-back-banner">
            <button
              type="button"
              className="button button-secondary button-small"
              onClick={() => {
                setViewMode('started_subjects');
                navigate('/learning', { replace: true });
              }}
            >
              <ArrowLeft size={15} />
              <span>← Back to My Started Lessons</span>
            </button>
          </div>

          {/* 2. Modern Subject Header & Overview */}
          <header
        className="subject-learning-header-card"
        style={{
          borderTop: `4px solid ${activeColors.primary}`
        }}
      >
        <div className="subject-header-main">
          <div className="subject-header-tags">
            <span
              className="subject-nature-badge"
              style={{
                backgroundColor: activeColors.light,
                color: activeColors.primary,
                borderColor: activeColors.border
              }}
            >
              {activeSubject?.nature || 'DSC'}
            </span>
            <span className="subject-code-badge" title="Official Course Code">
              <Hash size={11} />
              <span>{activeSubject?.code}</span>
            </span>
            <span className="subject-sem-badge">
              Semester {selectedSemesterNum}
            </span>
            <span className="subject-ltp-badge" title="Lecture-Tutorial-Practical hours per week">
              <Clock3 size={12} />
              <span>L-T-P: {activeSubject?.l ?? 3}-{activeSubject?.t ?? 0}-{activeSubject?.p ?? 2}</span>
            </span>
            <span className="subject-credits-badge" title="Course Credits">
              <GraduationCap size={13} />
              <span>{activeSubject?.credits || 4} Credits</span>
            </span>
            {subjectRoadmap?.recommendedLearningOrder && (
              <span className="subject-order-badge" title="Recommended Sequence in Semester">
                <Compass size={12} />
                <span>Course #{subjectRoadmap.recommendedLearningOrder} in Semester {selectedSemesterNum}</span>
              </span>
            )}
            <Link
              to={`/planner?subject=${activeSubject?.code}`}
              className="subject-planner-badge"
              title="Personalized Study Plan for this subject"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: 'var(--bg-surface-subtle, #f1f3f9)',
                color: 'var(--color-primary, #6366f1)',
                padding: '3px 9px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              <CalendarClock size={12} />
              <span>Personalized Study Plan</span>
            </Link>
          </div>

          <h1 className="subject-learning-title">
            {activeSubject?.name}
          </h1>

          <p className="subject-learning-overview">
            {activeSubject?.description}
          </p>

          {/* Prerequisites Line */}
          {subjectRoadmap?.prerequisites && subjectRoadmap.prerequisites.length > 0 && (
            <div className="subject-header-prereqs">
              <span className="prereqs-label">
                <AlertCircle size={13} style={{ color: '#f59e0b', verticalAlign: 'text-bottom', marginRight: 4 }} />
                Prerequisites:
              </span>
              <div className="prereqs-chips">
                {subjectRoadmap.prerequisites.map((p, idx) => (
                  <span key={idx} className="prereq-pill">{p}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div
          className="subject-header-icon-box"
          style={{
            backgroundColor: activeColors.light,
            color: activeColors.primary
          }}
        >
          <SubjectIcon iconName={activeSubject?.iconName} name={activeSubject?.iconName} size={36} />
        </div>
      </header>

      {/* 2.5 Active In-Progress / Uncompleted Lesson Banner with Direct Link to Complete */}
      {activeInProgressLesson && (
        <section
          className="active-in-progress-card"
          aria-label="Active In-Progress Lesson"
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(99, 102, 241, 0.07) 100%)',
            border: '2px solid rgba(245, 158, 11, 0.4)',
            borderRadius: '16px',
            padding: '22px 26px',
            marginBottom: '24px',
            boxShadow: '0 8px 24px rgba(245, 158, 11, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div style={{ flex: '1 1 360px', minWidth: 260 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#fef3c7',
                    color: '#b45309',
                    border: '1px solid #fde68a',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '11.5px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#f59e0b',
                      boxShadow: '0 0 8px #f59e0b'
                    }}
                  />
                  Involved • Incomplete Lesson
                </span>

                {activeInProgressLesson.subjectCode && (
                  <span
                    style={{
                      background: 'rgba(99, 102, 241, 0.1)',
                      color: '#4f46e5',
                      padding: '3px 9px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: 700
                    }}
                  >
                    {activeInProgressLesson.subjectCode} · {activeInProgressLesson.subjectName || activeSubject?.name}
                  </span>
                )}

                {activeInProgressLesson.unitNumber && (
                  <span
                    style={{
                      background: 'rgba(15, 23, 42, 0.06)',
                      color: 'var(--text-secondary, #475569)',
                      padding: '3px 9px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: 600
                    }}
                  >
                    {activeInProgressLesson.unitNumber}
                  </span>
                )}
              </div>

              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: 'var(--text-primary, #0f172a)',
                  margin: '0 0 6px 0',
                  lineHeight: 1.3
                }}
              >
                {activeInProgressLesson.lessonTitle || activeInProgressLesson.title || 'Untitled In-Progress Lesson'}
              </h2>

              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary, #64748b)', lineHeight: 1.45 }}>
                You are currently studying this module and have not completed it yet. Click below for a direct link to jump straight in, study the materials, and complete the lesson!
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="button button-primary"
                onClick={() => handleGoToInProgressLesson(activeInProgressLesson)}
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 22px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
                  cursor: 'pointer'
                }}
                title="Direct link to resume and complete this lesson"
              >
                <CirclePlay size={18} />
                <span>Go to Lesson to Complete</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* If student has other incomplete lessons they have accessed */}
          {inProgressLessons.filter((l) => !completeIds.has(l.lessonId) && l.lessonId !== activeInProgressLesson.lessonId).length > 0 && (
            <div style={{ paddingTop: '12px', borderTop: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary, #64748b)', marginBottom: '8px' }}>
                Other Incomplete Lessons You Started ({inProgressLessons.filter((l) => !completeIds.has(l.lessonId) && l.lessonId !== activeInProgressLesson.lessonId).length}):
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {inProgressLessons
                  .filter((l) => !completeIds.has(l.lessonId) && l.lessonId !== activeInProgressLesson.lessonId)
                  .map((l) => (
                    <button
                      key={l.lessonId}
                      type="button"
                      onClick={() => handleGoToInProgressLesson(l)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color, #cbd5e1)',
                        background: 'var(--surface, #ffffff)',
                        fontSize: '12px',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        color: 'var(--text-primary, #1e293b)'
                      }}
                      title={`Go to ${l.lessonTitle || l.title || l.lessonId}`}
                    >
                      <Clock3 size={12} style={{ color: '#f59e0b' }} />
                      <span>{l.lessonTitle || l.title || l.lessonId}</span>
                      {l.subjectCode && <span style={{ fontSize: '10.5px', color: '#64748b' }}>({l.subjectCode})</span>}
                      <ArrowRight size={11} />
                    </button>
                  ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* 3. Overall Subject Completion & Key Metrics Strip */}
      <section className="subject-stats-bar" aria-label="Subject Learning Progress and Metrics">
        {/* Main Completion Card */}
        <div className="subject-stat-card progress-card" style={{ borderColor: activeColors.border }}>
          <div className="progress-card-top">
            <span className="stat-card-title">Subject Mastery</span>
            <strong className="stat-card-percent" style={{ color: activeColors.primary }}>
              {subjectCompletionPercent}%
            </strong>
          </div>
          <div className="subject-progress-track">
            <div
              className="subject-progress-fill"
              style={{
                width: `${subjectCompletionPercent}%`,
                backgroundColor: activeColors.primary
              }}
            />
          </div>
          <div className="progress-card-foot">
            <span><strong>{completedLessonsCount}</strong> of <strong>{totalLessonsCount}</strong> Lessons Completed</span>
            {subjectCompletionPercent === 100 && (
              <span className="status-pill-mastered">
                <Trophy size={11} />
                <span>Mastered</span>
              </span>
            )}
          </div>
        </div>

        {/* Total Units Metric */}
        <div className="subject-stat-card">
          <div className="stat-card-icon" style={{ backgroundColor: activeColors.light, color: activeColors.primary }}>
            <Layers size={18} />
          </div>
          <div className="stat-card-info">
            <span className="stat-label">Total Units</span>
            <strong className="stat-value">{totalUnitsCount} Units</strong>
            <small className="stat-subtext">Units I through IV</small>
          </div>
        </div>

        {/* Total Topics Metric */}
        <div className="subject-stat-card">
          <div className="stat-card-icon" style={{ backgroundColor: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9' }}>
            <FileText size={18} />
          </div>
          <div className="stat-card-info">
            <span className="stat-label">Total Topics</span>
            <strong className="stat-value">{totalTopicsCount} Topics</strong>
            <small className="stat-subtext">Official Syllabus Topics</small>
          </div>
        </div>

        {/* Total Lessons Metric */}
        <div className="subject-stat-card">
          <div className="stat-card-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <BookOpen size={18} />
          </div>
          <div className="stat-card-info">
            <span className="stat-label">Total Lessons</span>
            <strong className="stat-value">{totalLessonsCount} Lessons</strong>
            <small className="stat-subtext">Structured & Sequenced</small>
          </div>
        </div>

        {/* Estimated Learning Time Metric */}
        <div className="subject-stat-card">
          <div className="stat-card-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <Clock3 size={18} />
          </div>
          <div className="stat-card-info">
            <span className="stat-label">Estimated Effort</span>
            <strong className="stat-value">{totalEstimatedHours} Hours</strong>
            <small className="stat-subtext">Lectures, Labs & Self-Study</small>
          </div>
        </div>
      </section>

      {/* 4. Highlighted Next Recommended Lesson & Start/Continue Learning Hero CTA */}
      <section className="next-lesson-hero-banner" aria-label="Current and Next Recommended Lesson">
        <div className="next-lesson-content">
          <div className="next-lesson-badge-strip">
            {completedLessonsCount === 0 ? (
              <span className="next-badge-status start">
                <Sparkles size={13} />
                <span>Ready to Begin</span>
              </span>
            ) : subjectCompletionPercent === 100 ? (
              <span className="next-badge-status completed">
                <Trophy size={13} />
                <span>Subject Fully Completed!</span>
              </span>
            ) : (
              <span className="next-badge-status next">
                <Compass size={13} />
                <span>Recommended Next Lesson</span>
              </span>
            )}
            {nextRecommendedLesson && (
              <span className="next-unit-tag">
                {nextRecommendedLesson.unitNumber}: {nextRecommendedLesson.unitTitle}
              </span>
            )}
          </div>

          <h2 className="next-lesson-title">
            {subjectCompletionPercent === 100
              ? 'Outstanding Achievement! All 16 Lessons Mastered'
              : nextRecommendedLesson
              ? nextRecommendedLesson.title
              : 'Begin Your First Study Module'}
          </h2>

          <p className="next-lesson-subtext">
            {subjectCompletionPercent === 100
              ? 'You have successfully completed every lesson in this course. You can review any module or take the comprehensive knowledge assessment.'
              : nextRecommendedLesson?.officialTopicReference
              ? `Official syllabus topic: "${nextRecommendedLesson.officialTopicReference}"`
              : 'Follow the official step-by-step roadmap designed for your degree.'}
          </p>
        </div>

        <div className="next-lesson-actions">
          {subjectCompletionPercent === 100 ? (
            <Link to="/quizzes" className="button button-primary button-large next-lesson-cta-btn">
              <Trophy size={18} />
              <span>Take Knowledge Check</span>
            </Link>
          ) : completedLessonsCount === 0 ? (
            <button
              type="button"
              className="button button-primary button-large next-lesson-cta-btn"
              onClick={() => nextRecommendedLesson && handleOpenLesson(nextRecommendedLesson)}
              style={{ backgroundColor: activeColors.primary }}
            >
              <Play size={18} />
              <span>Start Learning</span>
            </button>
          ) : (
            <button
              type="button"
              className="button button-primary button-large next-lesson-cta-btn"
              onClick={() => nextRecommendedLesson && handleOpenLesson(nextRecommendedLesson)}
              style={{ backgroundColor: activeColors.primary }}
            >
              <CirclePlay size={18} />
              <span>Continue Learning</span>
            </button>
          )}
        </div>
      </section>

      {/* 5. Dropdown Selectors Bar (Quick Subject / Semester Navigation) */}
      <section className="learning-controls" aria-label="Course and Semester Dropdown Selection">
        <label>
          <span>Academic Semester</span>
          <select
            value={selectedSemesterNum}
            onChange={(e) => handleSemesterChange(e.target.value)}
          >
            {semestersList.map((sem) => (
              <option key={sem.semester} value={sem.semester}>
                Semester {sem.semester} · {sem.subjects.length} Subjects ({sem.credits} Credits)
              </option>
            ))}
          </select>
          <ChevronDown size={16} />
        </label>

        <label>
          <span>Course Subject</span>
          <select
            value={selectedSubjectId}
            onChange={(e) => handleSubjectChange(e.target.value)}
          >
            {semesterSubjectsList.map((sub) => (
              <option key={sub.id || sub.code} value={sub.id || sub.code}>
                [{sub.code}] {sub.name} ({sub.nature})
              </option>
            ))}
          </select>
          <ChevronDown size={16} />
        </label>
      </section>

      {/* Learning Enhancements Quick Action Bar */}
      <section className="learning-enhancements-bar">
        <div className="enhancement-quick-buttons">
          <button
            type="button"
            className="tool-chip-btn"
            onClick={() => setShowGlossaryModal(true)}
          >
            <Tag size={15} style={{ color: 'var(--color-primary)' }} />
            <span>Subject Terminology & Glossary ({subjectGlossary.length})</span>
          </button>

          <button
            type="button"
            className="tool-chip-btn"
            onClick={() => setShowResourcesModal(true)}
          >
            <ExternalLink size={15} style={{ color: '#0ea5e9' }} />
            <span>Recommended Resources & Reference Links</span>
          </button>

          {subjectCompletionPercent === 100 && (
            <button
              type="button"
              className="tool-chip-btn certificate-btn"
              onClick={() => setShowCertificateModal(true)}
            >
              <Award size={16} />
              <span>Official Subject Certificate 🏆</span>
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
          <Flame size={15} color="#f59e0b" />
          <span>BCA Academic Program</span>
        </div>
      </section>

      {/* 6. Visual Unit-Wise Learning Roadmap Track */}
      <section className="visual-roadmap-strip-card" aria-label="Visual Unit-Wise Learning Roadmap">
        <div className="roadmap-strip-header">
          <div className="strip-header-left">
            <Route size={18} style={{ color: activeColors.primary }} />
            <h3>Visual Unit-Wise Learning Roadmap</h3>
          </div>
          <span className="strip-header-desc">
            Sequential 4-Unit progression from theoretical foundations to capstone practicals
          </span>
        </div>

        <div className="roadmap-units-stepper">
          {subjectRoadmap?.units?.map((unitObj, uIdx) => {
            const metrics = getUnitMetrics(unitObj);
            const isUnitCompleted = metrics.percent === 100;
            const isUnitCurrent = metrics.status === 'In Progress';
            const isUnitExpanded = Boolean(expandedUnits[uIdx]);

            return (
              <div
                key={unitObj.unitId || uIdx}
                className={`roadmap-step-item ${isUnitCompleted ? 'completed' : ''} ${isUnitCurrent ? 'current' : ''}`}
                onClick={() => toggleUnit(uIdx)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleUnit(uIdx);
                  }
                }}
                title={`Click to toggle ${unitObj.unitNumber}`}
              >
                <div className="step-node-bubble" style={isUnitCompleted ? {} : isUnitCurrent ? { borderColor: activeColors.primary, color: activeColors.primary } : {}}>
                  {isUnitCompleted ? (
                    <Check size={16} />
                  ) : (
                    <span>{String(uIdx + 1).padStart(2, '0')}</span>
                  )}
                </div>

                <div className="step-node-content">
                  <div className="step-node-title-row">
                    <span className="step-node-num">{unitObj.unitNumber}</span>
                    <span className={`step-node-status-pill ${metrics.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {metrics.status}
                    </span>
                  </div>
                  <strong className="step-node-title">{unitObj.unitTitle}</strong>
                  <span className="step-node-meta">
                    {metrics.completed}/{metrics.total} Lessons · {metrics.percent}%
                  </span>
                </div>

                {uIdx + 1 < (subjectRoadmap?.units?.length || 4) && (
                  <div className={`step-connector-line ${isUnitCompleted ? 'active' : ''}`} />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Success Notification Banner */}
      {message && (
        <div className="success-message" role="status">
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      {/* 7. Expandable Units Containing Individual Lessons */}
      <section className="subject-units-accordion-section" aria-label="Units and Lessons Accordion">
        <div className="units-accordion-toolbar">
          <div className="accordion-toolbar-left">
            <Layers size={18} style={{ color: activeColors.primary }} />
            <h2>Syllabus Units & Structured Lessons</h2>
            <span className="toolbar-count">({totalUnitsCount} Units · {totalLessonsCount} Lessons)</span>
          </div>

          <div className="accordion-toolbar-actions">
            <button
              type="button"
              className="button button-ghost button-small"
              onClick={expandAllUnits}
            >
              Expand All
            </button>
            <span className="toolbar-sep">|</span>
            <button
              type="button"
              className="button button-ghost button-small"
              onClick={collapseAllUnits}
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Roadmap Filter & Search Toolbar */}
        <div className="roadmap-filter-toolbar">
          <div className="roadmap-filter-pills">
            <button
              type="button"
              className={`filter-pill ${roadmapFilter === 'all' ? 'active' : ''}`}
              onClick={() => setRoadmapFilter('all')}
            >
              All Lessons ({totalLessonsCount})
            </button>
            <button
              type="button"
              className={`filter-pill ${roadmapFilter === 'pending' ? 'active' : ''}`}
              onClick={() => setRoadmapFilter('pending')}
            >
              Pending ({Math.max(0, totalLessonsCount - completedLessonsCount)})
            </button>
            <button
              type="button"
              className={`filter-pill ${roadmapFilter === 'completed' ? 'active' : ''}`}
              onClick={() => setRoadmapFilter('completed')}
            >
              Completed ({completedLessonsCount})
            </button>
            <button
              type="button"
              className={`filter-pill bookmarked ${roadmapFilter === 'bookmarked' ? 'active' : ''}`}
              onClick={() => setRoadmapFilter('bookmarked')}
            >
              <Bookmark size={13} />
              Bookmarked ({bookmarkedIds.size})
            </button>
            <button
              type="button"
              className={`filter-pill difficult ${roadmapFilter === 'difficult' ? 'active' : ''}`}
              onClick={() => setRoadmapFilter('difficult')}
            >
              <AlertTriangle size={13} />
              Revision Deck ({difficultIds.size})
            </button>
          </div>

          <div className="student-search" style={{ minWidth: '220px', flex: 1, maxWidth: '340px' }}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search lessons & topics…"
              value={roadmapSearch}
              onChange={(e) => {
                setRoadmapSearch(e.target.value);
                if (e.target.value.trim()) {
                  setExpandedUnits({ 0: true, 1: true, 2: true, 3: true });
                }
              }}
              aria-label="Search lessons and topics"
            />
          </div>
        </div>

        {/* Units Accordion List */}
        <div className="units-accordion-list">
          {subjectRoadmap?.units?.map((unitObj, uIdx) => {
            const isExpanded = Boolean(expandedUnits[uIdx]);
            const metrics = getUnitMetrics(unitObj);
            const isUnitCompleted = metrics.percent === 100;
            const isUnitCurrent = metrics.status === 'In Progress';

            return (
              <div
                key={unitObj.unitId || uIdx}
                className={`unit-accordion-card ${isExpanded ? 'expanded' : ''} ${isUnitCompleted ? 'unit-completed' : ''}`}
                style={isUnitCurrent ? { borderLeft: `4px solid ${activeColors.primary}` } : {}}
              >
                {/* Unit Header Bar (Clickable) */}
                <header
                  className="unit-accordion-header"
                  onClick={() => toggleUnit(uIdx)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleUnit(uIdx);
                    }
                  }}
                  aria-expanded={isExpanded}
                >
                  <div className="unit-header-info">
                    <span
                      className="unit-number-badge"
                      style={
                        isUnitCompleted
                          ? { backgroundColor: '#10b981', color: '#ffffff' }
                          : isUnitCurrent
                          ? { backgroundColor: activeColors.primary, color: '#ffffff' }
                          : {}
                      }
                    >
                      {unitObj.unitNumber}
                    </span>

                    <div className="unit-title-group">
                      <h3 className="unit-card-title">{unitObj.unitTitle}</h3>
                      <div className="unit-card-submeta">
                        <span>{metrics.total} Lessons</span>
                        <span className="meta-dot">•</span>
                        <span>{metrics.hours} Hours Estimated</span>
                        <span className="meta-dot">•</span>
                        <span>{metrics.completed} of {metrics.total} Completed ({metrics.percent}%)</span>
                      </div>
                    </div>
                  </div>

                  <div className="unit-header-status-wrap">
                    <button
                      type="button"
                      className="button button-ghost button-small"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadUnitRevisionNotes(activeSubject, unitObj, unitObj.lessons);
                      }}
                      title="Download full unit revision guide as Markdown"
                      style={{ fontSize: '12px', padding: '4px 8px', gap: '4px' }}
                    >
                      <Download size={13} />
                      <span>Unit Notes</span>
                    </button>

                    <span className={`unit-status-chip ${metrics.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {metrics.status === 'Completed' && <Check size={12} />}
                      {metrics.status === 'In Progress' && <span className="pulse-dot" />}
                      <span>{metrics.status}</span>
                    </span>

                    <div className="accordion-chevron-icon">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </header>

                {/* Expanded Unit Lessons Content */}
                {isExpanded && (
                  <div className="unit-accordion-body">
                    {/* Lessons List inside Unit */}
                    <div className="unit-lessons-grid">
                      {unitObj.lessons
                        ?.filter((lesson) => {
                          const lId = lesson.lessonId;
                          if (roadmapFilter === 'completed' && !completeIds.has(lId)) return false;
                          if (roadmapFilter === 'pending' && completeIds.has(lId)) return false;
                          if (roadmapFilter === 'bookmarked' && !bookmarkedIds.has(lId)) return false;
                          if (roadmapFilter === 'difficult' && !difficultIds.has(lId)) return false;
                          if (roadmapSearch.trim()) {
                            const q = roadmapSearch.toLowerCase();
                            const matchesTitle = (lesson.title || '').toLowerCase().includes(q);
                            const matchesTopic = (lesson.officialTopicReference || '').toLowerCase().includes(q);
                            if (!matchesTitle && !matchesTopic) return false;
                          }
                          return true;
                        })
                        .map((lesson, lIdx) => {
                        const lId = lesson.lessonId;
                        const status = getLessonStatus(lesson, (uIdx * 4) + lIdx);
                        const isRecommendedNext = nextRecommendedLesson?.lessonId === lId;
                        const isLocked = status === 'Locked';

                        return (
                          <article
                            key={lId || lIdx}
                            className={`accordion-lesson-item ${status.toLowerCase().replace(/\s+/g, '-')} ${isRecommendedNext ? 'recommended-next' : ''}`}
                          >
                            <div className="lesson-item-left">
                              <div className={`lesson-status-icon ${status.toLowerCase().replace(/\s+/g, '-')}`}>
                                {status === 'Completed' ? (
                                  <Check size={16} />
                                ) : status === 'In Progress' ? (
                                  <span className="active-pulse-inner" />
                                ) : isLocked ? (
                                  <Lock size={15} />
                                ) : (
                                  <span>{String(lesson.sequence).padStart(2, '0')}</span>
                                )}
                              </div>

                              <div className="lesson-item-text">
                                <div className="lesson-item-topbar">
                                  <span className="lesson-step-badge">Lesson {uIdx + 1}.{lesson.sequence}</span>

                                  {/* Status Chip */}
                                  <span className={`lesson-state-pill ${status.toLowerCase().replace(/\s+/g, '-')}`}>
                                    {status === 'In Progress' && <span className="pulsing-circle" />}
                                    {status === 'In Progress' ? 'In Progress • Incomplete' : status}
                                  </span>

                                  {isRecommendedNext && (
                                    <span className="recommended-highlight-pill">
                                      <Sparkles size={11} />
                                      <span>Recommended Next</span>
                                    </span>
                                  )}

                                  <span className="lesson-est-badge">
                                    <Clock3 size={11} />
                                    <span>{lesson.estimatedMinutes || 30} mins</span>
                                  </span>
                                </div>

                                <h4 className="lesson-item-title">{lesson.title}</h4>

                                {/* Official Syllabus Topic Reference */}
                                <div className="lesson-syllabus-ref-row">
                                  <FileText size={12} className="syllabus-ref-icon" />
                                  <span>
                                    <strong>Official Topic:</strong> {lesson.officialTopicReference}
                                  </span>
                                </div>

                                {/* Prerequisites */}
                                {lesson.prerequisites && lesson.prerequisites.length > 0 && (
                                  <span className="lesson-item-prereq">
                                    Prerequisite: {lesson.prerequisites[0]}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Lesson Actions */}
                            <div className="lesson-item-actions">
                              {/* Quick Flag Actions (Bookmark & Difficult) */}
                              <div className="lesson-card-flag-actions">
                                <button
                                  type="button"
                                  className={`flag-action-btn ${bookmarkedIds.has(lId) ? 'bookmarked' : ''}`}
                                  onClick={(e) => handleToggleBookmark(lesson, e)}
                                  title={bookmarkedIds.has(lId) ? 'Remove Bookmark' : 'Bookmark this lesson'}
                                  aria-label={bookmarkedIds.has(lId) ? 'Remove Bookmark' : 'Bookmark this lesson'}
                                >
                                  {bookmarkedIds.has(lId) ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
                                </button>
                                <button
                                  type="button"
                                  className={`flag-action-btn ${difficultIds.has(lId) ? 'difficult' : ''}`}
                                  onClick={(e) => handleToggleDifficult(lesson, e)}
                                  title={difficultIds.has(lId) ? 'Marked as Difficult for Revision' : 'Flag as Difficult for Revision'}
                                  aria-label={difficultIds.has(lId) ? 'Marked as Difficult for Revision' : 'Flag as Difficult for Revision'}
                                >
                                  <AlertTriangle size={14} />
                                </button>
                                {lessonNotes[lId] && (
                                  <span title="Personal study note saved" style={{ color: 'var(--color-primary)', display: 'inline-flex', padding: '4px' }}>
                                    <FileText size={13} />
                                  </span>
                                )}
                              </div>

                              {isLocked ? (
                                <button
                                  type="button"
                                  className="button button-ghost button-small locked-btn"
                                  onClick={() => handleOpenLesson(lesson)}
                                  title="Preview locked lesson"
                                >
                                  <Lock size={13} />
                                  <span>Preview</span>
                                </button>
                              ) : status === 'Completed' ? (
                                <button
                                  type="button"
                                  className="button button-secondary button-small review-btn"
                                  onClick={() => handleOpenLesson(lesson)}
                                >
                                  <RotateCcw size={13} />
                                  <span>Review</span>
                                </button>
                              ) : status === 'In Progress' ? (
                                <button
                                  type="button"
                                  className="button button-primary button-small continue-btn"
                                  onClick={() => handleOpenLesson(lesson)}
                                  style={{ backgroundColor: '#f59e0b', color: '#ffffff', fontWeight: 700 }}
                                  title="Resume and complete this lesson"
                                >
                                  <CirclePlay size={14} />
                                  <span>Resume & Complete</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="button button-primary button-small start-btn"
                                  onClick={() => handleOpenLesson(lesson)}
                                >
                                  <Play size={13} />
                                  <span>Start</span>
                                </button>
                              )}
                            </div>
                          </article>
                        );
                      })}
                    </div>

                    {/* Unit Practice & Revision Milestone Checkpoint */}
                    {unitObj.milestone && (
                      <div className="unit-milestone-checkpoint-card">
                        <div className="milestone-badge-icon" style={{ backgroundColor: activeColors.light, color: activeColors.primary }}>
                          <Milestone size={22} />
                        </div>
                        <div className="milestone-content">
                          <div className="milestone-header">
                            <span className="milestone-timing-badge">{unitObj.milestone.timing}</span>
                            <span className="milestone-time-badge">
                              <Clock3 size={12} />
                              <span>{unitObj.milestone.estimatedMinutes} mins practice</span>
                            </span>
                          </div>
                          <h4 className="milestone-title">{unitObj.milestone.title}</h4>
                          <ul className="milestone-tasks-list">
                            {unitObj.milestone.tasks.map((task, tIdx) => (
                              <li key={tIdx}>
                                <CheckCircle2 size={14} style={{ color: activeColors.primary, flexShrink: 0, marginTop: 2 }} />
                                <span>{task}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="milestone-deliverable">
                            <strong>Deliverable:</strong> {unitObj.milestone.deliverable}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. Course Level Milestones (Mid-term & Capstone) */}
      <section className="course-milestones-section" aria-label="Course Examination Milestones">
        <div className="course-milestones-grid">
          {subjectRoadmap?.courseMilestones?.map((m, idx) => (
            <div key={idx} className={`course-milestone-box ${idx === 1 ? 'final' : ''}`}>
              <div className="cm-header">
                {idx === 1 ? <GraduationCap size={20} /> : <Award size={20} />}
                <h4>{m.title}</h4>
                <span className="cm-timing">{m.timing}</span>
              </div>
              <ul className="cm-tasks">
                {m.tasks.map((t, tIdx) => (
                  <li key={tIdx}>{t}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 9. Subject Quick Reference Sections (Lab Work, Textbooks & Objectives) */}
      <div className="subject-reference-drawer">
        {/* Lab Work Card */}
        {Array.isArray(activeSubject?.labWork) && activeSubject.labWork.length > 0 && (
          <section className="subject-reference-card">
            <header className="ref-card-header">
              <Code2 size={16} style={{ color: activeColors.primary }} />
              <h3>Laboratory & Practical Tasks ({activeSubject.labWork.length})</h3>
            </header>
            <ul className="ref-task-list">
              {activeSubject.labWork.map((labItem, idx) => (
                <li key={idx} className="ref-task-item">
                  <span className="ref-task-badge">Task {idx + 1}</span>
                  <span>{labItem}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Resources & Textbooks */}
        {Array.isArray(activeSubject?.resources) && activeSubject.resources.length > 0 && (
          <section className="subject-reference-card">
            <header className="ref-card-header">
              <BookOpen size={16} style={{ color: activeColors.primary }} />
              <h3>Recommended Resources & Books ({activeSubject.resources.length})</h3>
            </header>
            <div className="ref-resource-grid">
              {activeSubject.resources.map((res, idx) => (
                <div key={idx} className="ref-resource-item">
                  <span className="ref-type-tag">{res.type || 'Book'}</span>
                  <div className="ref-resource-text">
                    <strong>{res.title}</strong>
                    {res.author && <small>Author: {res.author}</small>}
                    {res.url && (
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ref-link"
                      >
                        <span>Open Resource</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Objectives */}
        {Array.isArray(activeSubject?.objectives) && activeSubject.objectives.length > 0 && (
          <section className="subject-reference-card">
            <header className="ref-card-header">
              <Target size={16} style={{ color: activeColors.primary }} />
              <h3>Course Learning Objectives</h3>
            </header>
            <ul className="ref-task-list">
              {activeSubject.objectives.map((obj, idx) => (
                <li key={idx} className="ref-task-item">
                  <CheckCircle2 size={15} style={{ color: activeColors.primary, flexShrink: 0, marginTop: 2 }} />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  )}

      {/* 10. Complete Interactive Lesson Reading Modal Dialog */}
      {activeLesson && (
        <div
          className="lesson-modal-backdrop"
          role="presentation"
          onClick={handleCloseLesson}
        >
          <section
            className="lesson-modal complete-reading-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="lesson-dialog-title"
            onClick={(e) => e.stopPropagation()}
            style={{
              borderTop: `4px solid ${activeColors.primary}`
            }}
          >
            {/* Modal Header */}
            <div className="lesson-modal-topbar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="text-back"
                  onClick={handleCloseLesson}
                >
                  <ArrowLeft size={16} />
                  <span>Back to Lessons</span>
                </button>

                {/* Prev & Next Navigation inside Lesson Viewer */}
                <div className="modal-nav-actions">
                  <button
                    type="button"
                    className="modal-nav-btn"
                    disabled={!hasPrevLesson}
                    onClick={handlePrevLesson}
                    title={hasPrevLesson ? `Previous: ${allSubjectLessons[currentLessonGlobalIdx - 1]?.title}` : 'First lesson in subject'}
                  >
                    <ArrowLeft size={13} />
                    <span>Prev</span>
                  </button>
                  <button
                    type="button"
                    className="modal-nav-btn"
                    disabled={!hasNextLesson}
                    onClick={handleNextLesson}
                    title={hasNextLesson ? `Next: ${allSubjectLessons[currentLessonGlobalIdx + 1]?.title}` : 'Last lesson in subject'}
                  >
                    <span>Next</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>

              <div className="lesson-modal-top-actions">
                {/* Bookmark Toggle */}
                <button
                  type="button"
                  className={`tool-chip-btn ${bookmarkedIds.has(activeLesson.lessonId) ? 'bookmarked' : ''}`}
                  onClick={(e) => handleToggleBookmark(activeLesson, e)}
                  title={bookmarkedIds.has(activeLesson.lessonId) ? 'Remove Bookmark' : 'Bookmark this lesson'}
                >
                  {bookmarkedIds.has(activeLesson.lessonId) ? (
                    <>
                      <BookmarkCheck size={14} color="#8b5cf6" />
                      <span style={{ color: '#8b5cf6' }}>Bookmarked</span>
                    </>
                  ) : (
                    <>
                      <Bookmark size={14} />
                      <span>Bookmark</span>
                    </>
                  )}
                </button>

                {/* Difficult / Revision Toggle */}
                <button
                  type="button"
                  className={`tool-chip-btn ${difficultIds.has(activeLesson.lessonId) ? 'difficult' : ''}`}
                  onClick={(e) => handleToggleDifficult(activeLesson, e)}
                  title={difficultIds.has(activeLesson.lessonId) ? 'In Revision Deck' : 'Flag as Difficult for Revision'}
                >
                  <AlertTriangle size={14} color={difficultIds.has(activeLesson.lessonId) ? '#f59e0b' : 'inherit'} />
                  <span style={difficultIds.has(activeLesson.lessonId) ? { color: '#b45309' } : {}}>
                    {difficultIds.has(activeLesson.lessonId) ? 'In Revision Deck' : 'Flag Difficult'}
                  </span>
                </button>

                {/* Download Lesson Revision Notes */}
                <button
                  type="button"
                  className="tool-chip-btn"
                  onClick={() => downloadLessonRevisionNotes(activeLessonContent, activeNoteText)}
                  title="Download complete structured lesson notes as Markdown"
                >
                  <Download size={14} />
                  <span>Export Notes</span>
                </button>

                <span className="modal-reading-time">
                  <Clock3 size={13} />
                  <span>{activeLesson.estimatedMinutes || 30} mins read</span>
                </span>
                <button
                  type="button"
                  onClick={handleCloseLesson}
                  className="modal-close-icon-btn"
                  aria-label="Close lesson modal"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {activeLessonLoading ? (
              <LoadingState label="Preparing complete lesson content…" />
            ) : activeLessonContent ? (
              <>
                <div className="lesson-modal-meta-header">
                  <div className="lesson-modal-tags">
                    <span className="modal-unit-badge" style={{ backgroundColor: activeColors.light, color: activeColors.primary }}>
                      {activeLessonContent.unitName || activeLesson.unitNumber}
                    </span>
                    <span className="modal-subject-badge">
                      {activeSubject?.name} ({activeSubject?.code})
                    </span>
                    {completeIds.has(activeLesson.lessonId) && (
                      <span className="modal-done-badge">
                        <Check size={12} />
                        <span>Completed</span>
                      </span>
                    )}
                  </div>

                  <h2 id="lesson-dialog-title" className="lesson-modal-main-title">
                    {activeLessonContent.title}
                  </h2>

                  {/* Official Syllabus Topic Reference Alert */}
                  {activeLessonContent.officialTopic && (
                    <div className="modal-official-topic-alert">
                      <FileText size={14} className="alert-topic-icon" style={{ color: activeColors.primary }} />
                      <span>
                        <strong>Official Syllabus Topic:</strong> "{activeLessonContent.officialTopic}"
                      </span>
                    </div>
                  )}

                  {/* Prerequisites */}
                  {activeLessonContent.prerequisites && activeLessonContent.prerequisites.length > 0 && (
                    <div className="modal-prereq-note">
                      <small>Prerequisite: {activeLessonContent.prerequisites.join(', ')}</small>
                    </div>
                  )}
                </div>

                {/* 10-Point Comprehensive Pedagogical Sections */}
                <div className="lesson-reading complete-content">
                  {/* 1. Introduction & Overview */}
                  {(activeLessonContent.introduction || activeLessonContent.summary) && (
                    <div className="lesson-section-box">
                      <div className="lesson-section-heading">
                        <BookOpen size={18} style={{ color: activeColors.primary }} />
                        <h3>1. Introduction & Overview</h3>
                      </div>
                      <div className="lesson-intro-prose">
                        <p>{activeLessonContent.introduction || activeLessonContent.summary}</p>
                      </div>
                    </div>
                  )}

                  {/* 2. Learning Objectives & Outcomes */}
                  {((activeLessonContent.learningObjectives && activeLessonContent.learningObjectives.length > 0) ||
                    (activeLessonContent.expectedOutcomes && activeLessonContent.expectedOutcomes.length > 0)) && (
                    <div className="lesson-section-box">
                      <div className="lesson-section-heading">
                        <Target size={18} style={{ color: activeColors.primary }} />
                        <h3>2. Learning Objectives & Expected Outcomes</h3>
                      </div>
                      <div className="modal-pedagogy-grid">
                        {activeLessonContent.learningObjectives?.length > 0 && (
                          <div className="pedagogy-card">
                            <span className="pedagogy-label">
                              <Target size={13} style={{ color: activeColors.primary }} />
                              <span>Core Objectives</span>
                            </span>
                            <ul>
                              {activeLessonContent.learningObjectives.map((o, idx) => (
                                <li key={idx}>{o}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {activeLessonContent.expectedOutcomes?.length > 0 && (
                          <div className="pedagogy-card">
                            <span className="pedagogy-label">
                              <Trophy size={13} style={{ color: '#10b981' }} />
                              <span>Expected Outcomes</span>
                            </span>
                            <ul>
                              {activeLessonContent.expectedOutcomes.map((o, idx) => (
                                <li key={idx}>{o}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 3. Important Concepts and Definitions */}
                  {activeLessonContent.keyDefinitions && activeLessonContent.keyDefinitions.length > 0 && (
                    <div className="lesson-section-box">
                      <div className="lesson-section-heading">
                        <Sparkles size={18} style={{ color: activeColors.primary }} />
                        <h3>3. Important Concepts & Definitions</h3>
                      </div>
                      <div className="definitions-grid">
                        {activeLessonContent.keyDefinitions.map((item, idx) => (
                          <div key={idx} className="definition-card">
                            <div className="definition-card-term">
                              <span className="definition-term-bullet" style={{ background: activeColors.primary }} />
                              <h4>{item.term}</h4>
                            </div>
                            <p className="definition-card-desc">{item.definition}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. Step-by-Step Explanations */}
                  {activeLessonContent.stepByStepExplanation && activeLessonContent.stepByStepExplanation.length > 0 && (
                    <div className="lesson-section-box">
                      <div className="lesson-section-heading">
                        <Route size={18} style={{ color: activeColors.primary }} />
                        <h3>4. Step-by-Step Technical Breakdown</h3>
                      </div>
                      <div className="steps-flow-container">
                        {activeLessonContent.stepByStepExplanation.map((stepItem, idx) => (
                          <div key={idx} className="step-flow-item">
                            <div className="step-flow-badge" style={{ backgroundColor: activeColors.primary }}>
                              {stepItem.step || idx + 1}
                            </div>
                            <div className="step-flow-content">
                              <h4 className="step-flow-title">{stepItem.heading}</h4>
                              <p className="step-flow-desc">{stepItem.details}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 5. Practical Examples & Real-World Applications */}
                  {activeLessonContent.practicalApplications && activeLessonContent.practicalApplications.length > 0 && (
                    <div className="lesson-section-box">
                      <div className="lesson-section-heading">
                        <Compass size={18} style={{ color: activeColors.primary }} />
                        <h3>5. Practical Examples & Real-World Applications</h3>
                      </div>
                      <div className="practical-apps-list">
                        {activeLessonContent.practicalApplications.map((app, idx) => (
                          <div key={idx} className="practical-app-item">
                            <div className="app-dot" style={{ backgroundColor: activeColors.primary }} />
                            <p>{app}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 6. Diagrams, Tables or Code Examples */}
                  {activeLessonContent.codeOrDiagram && (
                    <div className="lesson-section-box">
                      <div className="lesson-section-heading">
                        <Code2 size={18} style={{ color: activeColors.primary }} />
                        <h3>
                          6.{' '}
                          {activeLessonContent.codeOrDiagram.type === 'code'
                            ? 'Working Code Implementation'
                            : activeLessonContent.codeOrDiagram.type === 'table'
                            ? 'Architectural Reference & Comparison'
                            : 'Technical Diagram & Specification'}
                        </h3>
                      </div>
                      <div className="code-diagram-wrapper">
                        <div className="code-diagram-header">
                          <div className="code-header-title">
                            <Terminal size={15} />
                            <span>{activeLessonContent.codeOrDiagram.title}</span>
                          </div>
                          {activeLessonContent.codeOrDiagram.type === 'code' && (
                            <div className="code-header-right">
                              <span className="code-lang-tag">
                                {activeLessonContent.codeOrDiagram.language || 'code'}
                              </span>
                              <button
                                type="button"
                                className="copy-code-btn"
                                onClick={() => handleCopyCode(activeLessonContent.codeOrDiagram.content)}
                              >
                                {copiedCode ? <CheckCheck size={14} /> : <Copy size={14} />}
                                <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {activeLessonContent.codeOrDiagram.type === 'code' ? (
                          <pre className="code-snippet-pre">
                            <code>{activeLessonContent.codeOrDiagram.content}</code>
                          </pre>
                        ) : activeLessonContent.codeOrDiagram.type === 'table' ? (
                          <div className="lesson-markdown-table-wrap">
                            {renderMarkdownTable(activeLessonContent.codeOrDiagram.content)}
                          </div>
                        ) : (
                          <pre className="diagram-snippet-pre">
                            <code>{activeLessonContent.codeOrDiagram.content}</code>
                          </pre>
                        )}

                        {activeLessonContent.codeOrDiagram.expectedOutput && (
                          <div className="code-expected-output">
                            <span className="output-label">Expected Output:</span>
                            <pre className="output-snippet">
                              <code>{activeLessonContent.codeOrDiagram.expectedOutput}</code>
                            </pre>
                          </div>
                        )}

                        {activeLessonContent.codeOrDiagram.explanation && (
                          <div className="code-explanation-note">
                            <Lightbulb size={16} style={{ color: activeColors.primary, flexShrink: 0 }} />
                            <span>{activeLessonContent.codeOrDiagram.explanation}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Fallback Markdown Rendering if structured 10 points are absent */}
                  {!activeLessonContent.keyDefinitions && activeLessonContent.content && (
                    <div className="legacy-fallback-content">
                      {activeLessonContent.content.split(/\n\n+/).filter(Boolean).map((block, index) => {
                        if (block.startsWith('### ')) {
                          return <h4 key={index} className="lesson-heading-h4">{block.replace('### ', '')}</h4>;
                        }
                        if (block.startsWith('- ')) {
                          const items = block.split('\n').filter(Boolean).map((i) => i.replace(/^- /, ''));
                          return (
                            <ul key={index} className="lesson-reading-bullets">
                              {items.map((it, iIdx) => (
                                <li key={iIdx}>{it}</li>
                              ))}
                            </ul>
                          );
                        }
                        return <p key={index}>{block}</p>;
                      })}
                    </div>
                  )}

                  {/* 7. Important Notes & Key Takeaways */}
                  {activeLessonContent.importantNotes && activeLessonContent.importantNotes.length > 0 && (
                    <div className="lesson-section-box notes-box">
                      <div className="lesson-section-heading">
                        <AlertTriangle size={18} style={{ color: '#f59e0b' }} />
                        <h3>7. Important Notes & Key Takeaways</h3>
                      </div>
                      <div className="notes-list">
                        {activeLessonContent.importantNotes.map((note, idx) => (
                          <div key={idx} className="note-card">
                            <div className="note-icon-wrap">
                              <AlertCircle size={16} />
                            </div>
                            <p>{note}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 8. Practice Questions */}
                  {activeLessonContent.practiceQuestions && activeLessonContent.practiceQuestions.length > 0 && (
                    <div className="lesson-section-box">
                      <div className="lesson-section-heading">
                        <HelpCircle size={18} style={{ color: activeColors.primary }} />
                        <h3>8. Practice Questions</h3>
                      </div>
                      <div className="practice-questions-list">
                        {activeLessonContent.practiceQuestions.map((pq, qIdx) => {
                          const isHintOpen = Boolean(revealedHints[qIdx]);
                          return (
                            <div key={qIdx} className="practice-question-card">
                              <div className="pq-header">
                                <span className="pq-num-badge">Q{qIdx + 1}</span>
                                <p className="pq-question-text">{pq.question}</p>
                              </div>
                              {pq.answerHint && (
                                <div className="pq-hint-area">
                                  <button
                                    type="button"
                                    className="pq-hint-toggle-btn"
                                    onClick={() => handleToggleHint(qIdx)}
                                  >
                                    <Lightbulb size={13} />
                                    <span>{isHintOpen ? 'Hide Answer Hint' : 'Reveal Answer Hint'}</span>
                                    {isHintOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                  </button>
                                  {isHintOpen && (
                                    <div className="pq-hint-content">
                                      <strong>Guidance Hint:</strong> {pq.answerHint}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 9. Interactive Short Lesson Quiz */}
                  {activeLessonContent.quiz && activeLessonContent.quiz.length > 0 && (
                    <div className="lesson-section-box quiz-box">
                      <div className="lesson-section-heading">
                        <Trophy size={18} style={{ color: activeColors.primary }} />
                        <h3>9. Interactive Lesson Quiz</h3>
                        <span className="quiz-header-badge">{activeLessonContent.quiz.length} Questions</span>
                      </div>
                      <div className="quiz-questions-list">
                        {activeLessonContent.quiz.map((quizItem, qIdx) => {
                          const selectedOpt = quizAnswers[qIdx];
                          const isAnswered = selectedOpt !== undefined;
                          const isCorrect = isAnswered && selectedOpt === quizItem.correctIndex;

                          return (
                            <div
                              key={qIdx}
                              className={`quiz-card ${
                                isAnswered ? (isCorrect ? 'quiz-correct' : 'quiz-incorrect') : ''
                              }`}
                            >
                              <div className="quiz-card-question">
                                <span className="quiz-q-num">Q{qIdx + 1}</span>
                                <p>{quizItem.question}</p>
                              </div>
                              <div
                                className="quiz-options-list"
                                role="radiogroup"
                                aria-label={`Question ${qIdx + 1}`}
                              >
                                {quizItem.options.map((opt, oIdx) => {
                                  const isSelected = selectedOpt === oIdx;
                                  const isCorrectChoice = quizItem.correctIndex === oIdx;
                                  let optClass = 'quiz-option-button';
                                  if (isAnswered) {
                                    if (isCorrectChoice) optClass += ' option-correct';
                                    else if (isSelected) optClass += ' option-wrong';
                                  } else if (isSelected) {
                                    optClass += ' option-selected';
                                  }

                                  return (
                                    <button
                                      key={oIdx}
                                      type="button"
                                      role="radio"
                                      aria-checked={isSelected}
                                      className={optClass}
                                      onClick={() => handleSelectQuizOption(qIdx, oIdx)}
                                    >
                                      <span className="option-letter">
                                        {String.fromCharCode(65 + oIdx)}
                                      </span>
                                      <span className="option-text">{opt}</span>
                                      {isAnswered && isCorrectChoice && (
                                        <Check size={16} className="opt-check-icon" />
                                      )}
                                      {isAnswered && isSelected && !isCorrectChoice && (
                                        <X size={16} className="opt-x-icon" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                              {isAnswered && (
                                <div className={`quiz-feedback-box ${isCorrect ? 'correct' : 'incorrect'}`}>
                                  <div className="feedback-status">
                                    {isCorrect ? (
                                      <>
                                        <CheckCircle2 size={16} />
                                        <strong>Correct! Excellent understanding.</strong>
                                      </>
                                    ) : (
                                      <>
                                        <AlertCircle size={16} />
                                        <strong>Incorrect. Review the explanation below:</strong>
                                      </>
                                    )}
                                  </div>
                                  <p className="feedback-explanation">{quizItem.explanation}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 10. Lesson Summary & Revision Points */}
                  {activeLessonContent.revisionPoints && activeLessonContent.revisionPoints.length > 0 && (
                    <div className="lesson-section-box revision-box">
                      <div className="lesson-section-heading">
                        <ListChecks size={18} style={{ color: '#10b981' }} />
                        <h3>10. Lesson Summary & Revision Points</h3>
                      </div>
                      <ul className="revision-points-list">
                        {activeLessonContent.revisionPoints.map((rev, idx) => (
                          <li key={idx}>
                            <CheckCircle2
                              size={16}
                              style={{ color: '#10b981', flexShrink: 0, marginTop: 2 }}
                            />
                            <span>{rev}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Personal Study Notes Section */}
                  <div className="personal-notes-box">
                    <div className="personal-notes-header">
                      <h4 className="personal-notes-title">
                        <FileText size={18} style={{ color: 'var(--color-primary)' }} />
                        <span>My Personal Study Notes</span>
                      </h4>
                      {noteSaveStatus && (
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#10b981' }}>
                          ✓ {noteSaveStatus}
                        </span>
                      )}
                    </div>
                    <textarea
                      className="notes-editor-textarea"
                      placeholder="Write your private formulas, key code syntax, questions, or memory aids for this lesson..."
                      value={activeNoteText}
                      onChange={(e) => setActiveNoteText(e.target.value)}
                    />
                    <div className="notes-footer-bar">
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {activeNoteText.trim().split(/\s+/).filter(Boolean).length} words • Persisted to your account
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          type="button"
                          className="button button-secondary button-small"
                          onClick={() => downloadLessonRevisionNotes(activeLessonContent, activeNoteText)}
                        >
                          <Download size={13} />
                          <span>Download with Notes</span>
                        </button>
                        <button
                          type="button"
                          className="button button-primary button-small"
                          onClick={handleSavePersonalNote}
                          disabled={savingNote}
                        >
                          {savingNote ? 'Saving…' : 'Save Personal Note'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lesson Modal Footer Actions with Prev & Next */}
                <div className="lesson-modal-actions sticky-footer">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={handleCloseLesson}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className="button button-secondary"
                      disabled={!hasPrevLesson}
                      onClick={handlePrevLesson}
                      title={hasPrevLesson ? 'Previous Lesson' : 'First lesson in subject'}
                    >
                      <ArrowLeft size={14} />
                      <span>Previous Lesson</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      className={`button ${completeIds.has(activeLesson.lessonId) ? 'button-completed' : 'button-primary'}`}
                      disabled={completeIds.has(activeLesson.lessonId) || savingId === activeLesson.lessonId}
                      onClick={() => markLessonComplete(activeLesson)}
                      style={
                        !completeIds.has(activeLesson.lessonId)
                          ? { backgroundColor: activeColors.primary }
                          : {}
                      }
                    >
                      {savingId === activeLesson.lessonId ? (
                        <span>Saving…</span>
                      ) : completeIds.has(activeLesson.lessonId) ? (
                        <>
                          <CheckCircle2 size={16} />
                          <span>Completed</span>
                        </>
                      ) : (
                        <>
                          <Check size={16} />
                          <span>Mark Lesson Complete</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      className="button button-secondary"
                      disabled={!hasNextLesson}
                      onClick={handleNextLesson}
                      title={hasNextLesson ? 'Next Lesson' : 'Last lesson in subject'}
                    >
                      <span>Next Lesson</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </>
            ) : null}
          </section>
        </div>
      )}

      {/* Glossary Modal Dialog */}
      {showGlossaryModal && (
        <div className="enhancement-modal-backdrop" onClick={() => setShowGlossaryModal(false)}>
          <div className="enhancement-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="enhancement-modal-top">
              <div>
                <span className="eyebrow" style={{ color: 'var(--color-primary)' }}>
                  {activeSubject?.name} ({activeSubject?.code})
                </span>
                <h3 style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: 800 }}>
                  Subject Terminology & Concepts Glossary
                </h3>
              </div>
              <button
                type="button"
                className="modal-close-icon-btn"
                onClick={() => setShowGlossaryModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '14px 24px 0' }}>
              <div className="student-search" style={{ maxWidth: '100%' }}>
                <Search size={15} />
                <input
                  type="text"
                  placeholder="Filter terms by keyword or concept…"
                  value={glossarySearch}
                  onChange={(e) => setGlossarySearch(e.target.value)}
                />
              </div>
            </div>

            <div className="enhancement-modal-body">
              {filteredGlossary.length === 0 ? (
                <EmptyState
                  title="No terms found"
                  detail={`No glossary definitions matched "${glossarySearch}".`}
                />
              ) : (
                filteredGlossary.map((g, idx) => (
                  <div key={idx} className="glossary-term-card">
                    <div className="glossary-term-name">
                      <span>{g.term}</span>
                      <span className="soft-badge" style={{ fontSize: '11px' }}>
                        {g.unitNumber}
                      </span>
                    </div>
                    <p className="glossary-term-def">{g.definition}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Introduced in: {g.lessonTitle}
                      </span>
                      <button
                        type="button"
                        className="button button-ghost button-small"
                        onClick={() => {
                          setShowGlossaryModal(false);
                          const target = allSubjectLessons.find((l) => l.lessonId === g.lessonId);
                          if (target) handleOpenLesson(target);
                        }}
                      >
                        <span>Jump to Lesson</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recommended Learning Resources Modal */}
      {showResourcesModal && (
        <div className="enhancement-modal-backdrop" onClick={() => setShowResourcesModal(false)}>
          <div className="enhancement-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="enhancement-modal-top">
              <div>
                <span className="eyebrow" style={{ color: '#0ea5e9' }}>
                  Academic References • BCA Curriculum
                </span>
                <h3 style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: 800 }}>
                  Recommended Resources: {activeSubject?.name}
                </h3>
              </div>
              <button
                type="button"
                className="modal-close-icon-btn"
                onClick={() => setShowResourcesModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="enhancement-modal-body">
              {/* Textbooks */}
              {subjectResources?.textbooks && (
                <div className="resource-category-group">
                  <h4 className="resource-category-title">Prescribed University Textbooks & Reference Books</h4>
                  {subjectResources.textbooks.map((tb, idx) => (
                    <div key={idx} className="resource-item-row">
                      <div>
                        <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{tb.title}</strong>
                        <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Author: {tb.author} • Publisher: {tb.publisher} ({tb.edition})
                        </div>
                      </div>
                      <span className="soft-badge">Textbook</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Documentation & Specifications */}
              {subjectResources?.documentation && (
                <div className="resource-category-group">
                  <h4 className="resource-category-title">Official Documentation & Standards</h4>
                  {subjectResources.documentation.map((doc, idx) => (
                    <a
                      key={idx}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="resource-item-row"
                      style={{ textDecoration: 'none' }}
                    >
                      <div>
                        <strong style={{ fontSize: '14px', color: 'var(--color-primary)' }}>{doc.name}</strong>
                        <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Type: {doc.type} • Official Web Resource
                        </div>
                      </div>
                      <ExternalLink size={15} color="var(--color-primary)" />
                    </a>
                  ))}
                </div>
              )}

              {/* Video Lectures */}
              {subjectResources?.videoLectures && (
                <div className="resource-category-group">
                  <h4 className="resource-category-title">Curated Academic Video Lecture Series</h4>
                  {subjectResources.videoLectures.map((vid, idx) => (
                    <a
                      key={idx}
                      href={vid.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="resource-item-row"
                      style={{ textDecoration: 'none' }}
                    >
                      <div>
                        <strong style={{ fontSize: '14px', color: '#0ea5e9' }}>{vid.name}</strong>
                        <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Platform: {vid.platform}
                        </div>
                      </div>
                      <ExternalLink size={15} color="#0ea5e9" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Official Subject Mastery Certificate Modal */}
      {showCertificateModal && (
        <div className="enhancement-modal-backdrop" onClick={() => setShowCertificateModal(false)}>
          <div className="enhancement-modal-container" style={{ maxWidth: '820px' }} onClick={(e) => e.stopPropagation()}>
            <div className="enhancement-modal-top">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={20} color="#b45309" />
                <strong style={{ fontSize: '16px' }}>Official Certificate of Subject Mastery</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  className="button button-primary button-small"
                  onClick={() => window.print()}
                >
                  <Printer size={14} />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  type="button"
                  className="modal-close-icon-btn"
                  onClick={() => setShowCertificateModal(false)}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="enhancement-modal-body" style={{ padding: '24px' }}>
              <div className="certificate-view-card">
                <div className="cert-seal">
                  <Award size={36} />
                </div>
                <h3 className="cert-university">Faculty of Computing & Information Technology</h3>
                <span className="cert-dept">Department of Computer Science & Engineering</span>
                <span className="eyebrow" style={{ color: '#b45309', margin: '4px 0' }}>
                  B.C.A. (Hons. with Research) Programme
                </span>

                <h1 className="cert-title">Certificate of Course Mastery</h1>
                <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}>
                  This official academic credential certifies that
                </p>

                <div className="cert-recipient">
                  {currentUser?.name || 'Verified BCA Scholar'}
                </div>

                <p style={{ margin: 0, fontSize: '14px', color: '#475569', maxWidth: '580px', lineHeight: 1.5 }}>
                  has successfully completed all 4 units and 16 prescribed curriculum topics for the course
                </p>

                <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  {activeSubject?.name} ({activeSubject?.code})
                </div>

                <div className="cert-meta-row">
                  <div>
                    <strong>Academic Credits:</strong> 4 Credits
                  </div>
                  <div>
                    <strong>Semester:</strong> Semester {selectedSemesterNum}
                  </div>
                  <div>
                    <strong>Grade:</strong> A+ (Distinction)
                  </div>
                  <div>
                    <strong>Verification ID:</strong> BCA-{activeSubject?.code}-8492
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '540px', marginTop: '24px', borderTop: '1px solid #cbd5e1', paddingTop: '16px' }}>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>Head of Department</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Computer Science & Engg.</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>Dean of Academic Affairs</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Academic Board</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 11. Platform Encouragement */}
      <div className="learning-encouragement">
        <ListChecks size={20} />
        <span>
          <strong>Every completed lesson counts.</strong> Your academic streak and completion percentage reflect immediately across your dashboard and progress ledger.
        </span>
      </div>
    </div>
  );
}
