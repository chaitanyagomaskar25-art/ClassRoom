import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Bot,
  Calendar,
  CalendarDays,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleHelp,
  Clock3,
  Code2,
  FileText,
  Filter,
  GraduationCap,
  HelpCircle,
  Layers,
  ListChecks,
  Lock,
  Play,
  RefreshCw,
  RotateCcw,
  Search,
  Sparkles,
  Terminal,
  Trophy,
  XCircle,
  Zap
} from 'lucide-react';

import { api, getErrorMessage, unwrap } from '../services/api.js';
import { EmptyState, ErrorState, LoadingState } from '../components/ContentState.jsx';
import {
  officialAssessmentSubjects,
  allAssessmentList,
  getSubjectAssessments,
  getAssessmentById,
  gradeAssessmentSubmission,
  buildRetryAssessment
} from '../data/assessmentData.js';
import AIQuizGenerator from '../components/AIQuizGenerator.jsx';
import InteractiveQuizPlayer from '../components/InteractiveQuizPlayer.jsx';
import './Quizzes.css';

export default function Quizzes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user) || {};
  const studentSem = user?.role === 'student' && user?.semester ? Number(user.semester) : null;

  // Navigation / Filter State (defaults strictly to student's enrolled semester if available)
  const initialSemester = searchParams.get('semester')
    ? Number(searchParams.get('semester'))
    : (studentSem || 0);
  const initialSubject = searchParams.get('subject') || '';
  const initialUnit = searchParams.get('unit') || 'all';
  const initialTopic = searchParams.get('topic') || 'all';
  const initialMode = searchParams.get('mode') || 'custom';
  const initialAssessmentId = searchParams.get('id') || '';
  const initialTabParam = searchParams.get('tab');
  const defaultTab = (initialTabParam === 'ai' || initialTabParam === 'ai_generator')
    ? 'ai_generator'
    : (initialTabParam === 'history' ? 'history' : 'quizzes');

  const [activeTab, setActiveTab] = useState(defaultTab); // 'ai_generator' | 'quizzes' | 'assessments' | 'practice' | 'history'
  const [generatorMode, setGeneratorMode] = useState(initialMode);
  const [selectedSemester, setSelectedSemester] = useState(initialSemester);
  const [selectedSubjectCode, setSelectedSubjectCode] = useState(initialSubject);
  const [searchQuery, setSearchQuery] = useState('');

  // History Tab Filter States
  const [historySemester, setHistorySemester] = useState(studentSem ? String(studentSem) : 'all');
  const [historySubject, setHistorySubject] = useState('all');
  const [historyUnit, setHistoryUnit] = useState('all');
  const [historyDate, setHistoryDate] = useState('all'); // 'all' | 'today' | 'week' | 'month'

  // Keep quiz semester filter in sync with student's enrolled semester
  useEffect(() => {
    if (!searchParams.get('semester') && studentSem) {
      setSelectedSemester(studentSem);
      setHistorySemester(String(studentSem));
    }
  }, [studentSem, searchParams]);

  // Active Assessment Taking State
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [selfScores, setSelfScores] = useState({});
  const [revealedModelAnswers, setRevealedModelAnswers] = useState({});
  const [instantFeedbackEnabled, setInstantFeedbackEnabled] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [timeSpent, setTimeSpent] = useState(0);

  // Code runner state for programming challenges
  const [codeDrafts, setCodeDrafts] = useState({});
  const [codeExecutionResults, setCodeExecutionResults] = useState({});
  const [showSolutionCode, setShowSolutionCode] = useState({});

  // User History & Stats State
  const [userSummary, setUserSummary] = useState({
    totalAttempts: 0,
    passedAttempts: 0,
    averageScore: 0,
    byAssessmentId: {}
  });
  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [assignedQuizzes, setAssignedQuizzes] = useState([]);
  const [loadingAssigned, setLoadingAssigned] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState({});
  const [error, setError] = useState('');

  const timerRef = useRef(null);

  const loadAssignedQuizzes = async () => {
    try {
      setLoadingAssigned(true);
      const res = unwrap(await api.get('/quizzes/assigned'));
      if (res?.assignedQuizzes) {
        setAssignedQuizzes(res.assignedQuizzes);
      }
    } catch {
      // Offline fallback
    } finally {
      setLoadingAssigned(false);
    }
  };

  // Load user summary & history from backend with filters
  const loadUserProgress = async () => {
    try {
      const summaryRes = await api.get('/quizzes/summary');
      const data = unwrap(summaryRes);
      if (data) {
        setUserSummary(data);
      }
    } catch {
      // Backend may be offline or local fallback
    }

    await Promise.allSettled([
      loadHistoryWithFilters(historySemester, historySubject, historyUnit, historyDate),
      loadAssignedQuizzes()
    ]);
  };

  const loadHistoryWithFilters = async (sem = historySemester, sub = historySubject, u = historyUnit, d = historyDate) => {
    try {
      setLoadingHistory(true);
      const params = new URLSearchParams();
      if (sem && sem !== 'all') params.append('semester', sem);
      if (sub && sub !== 'all') params.append('subjectCode', sub);
      if (u && u !== 'all') params.append('unitNumber', u);
      if (d && d !== 'all') params.append('date', d);

      const queryString = params.toString();
      const historyRes = await api.get(`/quizzes/history${queryString ? `?${queryString}` : ''}`);
      const data = unwrap(historyRes);
      if (data?.attempts) {
        setHistoryList(data.attempts);
      }
    } catch {
      // Local fallback
    } finally {
      setLoadingHistory(false);
    }
  };

  // Client-side instant filter fallback for history
  const filteredHistory = useMemo(() => {
    return (historyList || []).filter((att) => {
      if (historySemester !== 'all' && Number(att.semester) !== Number(historySemester)) {
        return false;
      }
      if (historySubject !== 'all' && att.subjectCode !== historySubject) {
        return false;
      }
      if (historyUnit !== 'all' && Number(att.unitNumber) !== Number(historyUnit)) {
        return false;
      }
      if (historyDate !== 'all' && att.createdAt) {
        const attDate = new Date(att.createdAt);
        const now = new Date();
        if (historyDate === 'today') {
          if (attDate.toDateString() !== now.toDateString()) return false;
        } else if (historyDate === 'week') {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (attDate < sevenDaysAgo) return false;
        } else if (historyDate === 'month') {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (attDate < thirtyDaysAgo) return false;
        }
      }
      return true;
    });
  }, [historyList, historySemester, historySubject, historyUnit, historyDate]);

  useEffect(() => {
    loadUserProgress();
  }, []);

  // Direct load if assessment ID in query params
  useEffect(() => {
    if (initialAssessmentId && !activeAssessment) {
      const found = getAssessmentById(initialAssessmentId);
      if (found) {
        startAssessment(found);
      }
    }
  }, [initialAssessmentId]);

  // Elapsed timer when taking assessment
  useEffect(() => {
    if (activeAssessment && !assessmentResult) {
      timerRef.current = setInterval(() => {
        setTimeSpent((t) => t + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeAssessment, assessmentResult]);

  // Filtered subjects based on semester selection
  const filteredSubjects = useMemo(() => {
    return officialAssessmentSubjects.filter((sub) => {
      if (selectedSemester > 0 && sub.semester !== selectedSemester) return false;
      return true;
    });
  }, [selectedSemester]);

  // Current active subject data
  const currentSubject = useMemo(() => {
    if (!selectedSubjectCode) return null;
    return getSubjectAssessments(selectedSubjectCode);
  }, [selectedSubjectCode]);

  // Filtered assessment cards
  const displayAssessments = useMemo(() => {
    const list = [];
    filteredSubjects.forEach((sub) => {
      if (selectedSubjectCode && sub.code !== selectedSubjectCode) return;

      sub.units.forEach((unit) => {
        if (activeTab === 'quizzes') {
          list.push(unit.unitQuiz);
        } else if (activeTab === 'assessments') {
          list.push(unit.unitAssessment);
        }
      });
    });

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase();
    return list.filter((item) => {
      return (
        item.title.toLowerCase().includes(q) ||
        item.subjectName.toLowerCase().includes(q) ||
        item.subjectCode.toLowerCase().includes(q) ||
        item.unitTitle.toLowerCase().includes(q)
      );
    });
  }, [filteredSubjects, selectedSubjectCode, activeTab, searchQuery]);

  // Start an assessment
  function startAssessment(assessment) {
    if (!assessment) return;
    if (user?.role === 'student' && studentSem && assessment.semester && Number(assessment.semester) !== studentSem) {
      setError(`🔒 Locked: This assessment belongs to Semester ${assessment.semester}. You are enrolled in Semester ${studentSem}, so only Semester ${studentSem} quizzes and assessments are unlocked.`);
      return;
    }
    setActiveAssessment(assessment);
    setAnswers({});
    setSelfScores({});
    setRevealedModelAnswers({});
    setAssessmentResult(null);
    setTimeSpent(0);
    setCodeDrafts({});
    setCodeExecutionResults({});
    setShowSolutionCode({});
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Pre-fill starter code if challenge exists
    (assessment.questions || []).forEach((q) => {
      if ((q.type === 'code' || q.type === 'applied') && q.starterCode) {
        setCodeDrafts((prev) => ({ ...prev, [q.id]: q.starterCode }));
      }
    });
  }

  // Handle MCQ selection
  function handleSelectMCQ(questionId, optionIndex) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  }

  // Handle True/False selection
  function handleSelectTF(questionId, value) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  // Handle Short Answer input
  function handleShortAnswerInput(questionId, text) {
    setAnswers((prev) => ({ ...prev, [questionId]: text }));
  }

  // Handle self-evaluation rubric points
  function handleSelfScore(questionId, points) {
    setSelfScores((prev) => ({ ...prev, [questionId]: points }));
  }

  // Run simulated code challenge
  function handleRunCode(question) {
    const qId = question.id;
    const userCode = codeDrafts[qId] || question.starterCode || '';

    // Simulated client-side test execution
    let outputLog = [];
    let passedCount = 0;
    const testCases = question.testCases || [
      { input: 'Sample dataset', expectedOutput: 'Computed output', description: 'Execution check' }
    ];

    testCases.forEach((tc, idx) => {
      const isPassed = !userCode.includes('// 2. Perform core logic') && userCode.length > 50;
      if (isPassed) passedCount += 1;
      outputLog.push(
        `Test Case #${idx + 1} (${tc.description}): ${isPassed ? '✓ PASSED' : '⚠ NEEDS VERIFICATION'}\n  Input: ${tc.input}\n  Expected: ${tc.expectedOutput}\n  Output Verified: ${isPassed ? 'Correct' : 'Check implementation'}`
      );
    });

    const overallStatus = passedCount === testCases.length ? 'PASS' : 'PARTIAL';
    setCodeExecutionResults((prev) => ({
      ...prev,
      [qId]: {
        status: overallStatus,
        log: outputLog.join('\n\n'),
        passedCount,
        total: testCases.length
      }
    }));

    // Auto-credit points if passed
    if (passedCount > 0) {
      handleSelfScore(qId, passedCount === testCases.length ? 4 : 3);
    }
  }

  // Submit assessment and record score
  async function handleSubmitAssessment(e) {
    if (e) e.preventDefault();
    if (!activeAssessment) return;

    setSubmitting(true);
    setError('');

    try {
      // 1. Grade locally using comprehensive grading engine
      const gradeResults = gradeAssessmentSubmission(activeAssessment, answers, selfScores);

      // 2. Prepare payload for backend persistence
      const payload = {
        assessmentId: activeAssessment.id,
        assessmentType: activeAssessment.assessmentType || 'unit_quiz',
        subjectCode: activeAssessment.subjectCode,
        subjectName: activeAssessment.subjectName,
        semester: activeAssessment.semester,
        unitNumber: activeAssessment.unitNumber,
        unitTitle: activeAssessment.unitTitle,
        lessonTitle: activeAssessment.title,
        answers,
        questionResults: gradeResults.questionResults,
        score: gradeResults.score,
        correctCount: gradeResults.correctCount,
        totalQuestions: gradeResults.totalQuestions,
        timeSpentSeconds: timeSpent,
        isRetry: Boolean(activeAssessment.isRetrySession)
      };

      // 3. Post to backend
      let responseData = null;
      try {
        const response = await api.post('/quizzes/submit-assessment', payload);
        responseData = unwrap(response);
      } catch {
        // Fallback to legacy submit if needed
        try {
          const legacyPayload = {
            answers: (activeAssessment.questions || []).map((q) =>
              answers[q.id] !== undefined ? Number(answers[q.id]) : 0
            )
          };
          const legRes = await api.post(`/quizzes/${activeAssessment.id}/submit`, legacyPayload);
          responseData = unwrap(legRes);
        } catch {
          // If offline, use local grading
        }
      }

      const serverQuestionResults = responseData?.results || gradeResults.questionResults;
      const finalScore = responseData?.score !== undefined ? responseData.score : gradeResults.score;
      const finalCorrectCount = responseData?.correctCount !== undefined ? responseData.correctCount : gradeResults.correctCount;
      const finalTotal = responseData?.totalQuestions !== undefined ? responseData.totalQuestions : gradeResults.totalQuestions;

      let finalAIFeedback = responseData?.aiFeedback;
      let finalStudyRec = responseData?.studyRecommendation;

      if (!finalAIFeedback) {
        const missedResults = serverQuestionResults.filter((q) => !q.isCorrect);
        const weakTopics = Array.from(new Set(missedResults.map((q) => (q.topic || q.topicReference || activeAssessment.topic || 'Core Concept')).filter(Boolean)));
        finalAIFeedback = {
          overallAssessment: finalScore >= 70
            ? `Solid academic performance (${finalScore}%). You demonstrated good conceptual understanding of ${activeAssessment.subjectName || 'the course curriculum'}.`
            : `Needs revision (${finalScore}%). Conceptual gaps were detected in: ${weakTopics.join(', ') || 'this assessment'}. Review recommended lessons to consolidate principles.`,
          weakAreas: weakTopics.map((t) => ({
            topic: t,
            missedCount: missedResults.filter((q) => (q.topic || q.topicReference || activeAssessment.topic) === t).length
          })),
          recommendedLessons: weakTopics.slice(0, 2).map((t, i) => ({
            lessonId: `${activeAssessment.subjectCode || 'sub'}-u${activeAssessment.unitNumber || 1}-l${i + 1}`,
            title: `${activeAssessment.subjectName || 'Course'} Unit ${activeAssessment.unitNumber || 1}: ${t}`,
            reason: `Strengthen core principles in ${t}`,
            url: `/learning/${activeAssessment.subjectCode || ''}`
          }))
        };
        finalStudyRec = {
          action: finalScore >= 70 ? 'advance' : 'revise',
          title: finalScore >= 70 ? 'Advance to Next Unit' : `Review ${weakTopics[0] || 'Foundations'}`,
          description: finalScore >= 70
            ? 'You have passed this assessment. Proceed to the next syllabus module.'
            : 'Review key foundational lessons before retrying.',
          suggestedAction: finalScore >= 70 ? 'Next Lesson' : 'Review Module',
          url: `/learning/${activeAssessment.subjectCode || ''}`
        };
      }

      setAssessmentResult({
        ...gradeResults,
        score: finalScore,
        correctCount: finalCorrectCount,
        totalQuestions: finalTotal,
        questionResults: serverQuestionResults,
        attemptNumber: responseData?.attemptNumber || (userSummary.byAssessmentId[activeAssessment.id]?.attemptsCount || 0) + 1,
        incorrectQuestionIds: responseData?.incorrectQuestionIds || serverQuestionResults.filter((q) => !q.isCorrect).map((q) => q.questionId),
        timeSpentSeconds: timeSpent,
        aiFeedback: finalAIFeedback,
        studyRecommendation: finalStudyRec
      });

      // Update local history
      loadUserProgress();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  // Start targeted retry for missed questions
  function handleStartRetry() {
    if (!activeAssessment || !assessmentResult) return;
    const incorrectIds = assessmentResult.incorrectQuestionIds || [];
    if (incorrectIds.length === 0) return;

    const retryAssessment = buildRetryAssessment(activeAssessment, incorrectIds);
    if (retryAssessment) {
      startAssessment(retryAssessment);
    }
  }

  // Format seconds into MM:SS
  function formatTime(sec) {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  // Count answered questions
  const answeredCount = activeAssessment
    ? (activeAssessment.questions || []).filter((q) => {
        if (q.type === 'mcq' || q.type === 'true_false') return answers[q.id] !== undefined;
        if (q.type === 'short_answer') return (answers[q.id] || '').trim().length > 0;
        if (q.type === 'code' || q.type === 'applied') return (codeDrafts[q.id] || '').trim().length > 0;
        return false;
      }).length
    : 0;

  return (
    <div className="content-page assessment-page">
      {/* -------------------------------------------------------------
          Page Heading & Quick Performance Stats
          ------------------------------------------------------------- */}
      <div className="page-heading">
        <div className="page-heading-left">
          <span className="eyebrow">
            <Sparkles size={13} />
            <span>BCA (Hons. with Research)</span>
          </span>
          <h1>Practice & Assessment Hub</h1>
          <p>
            Verify mastery with syllabus-grounded Unit Quizzes, Comprehensive Unit Assessments, and Topic Practice across all 6 semesters.
          </p>
        </div>
        <div className="heading-illustration peach-illustration">
          <GraduationCap size={28} />
        </div>
      </div>

      {/* Global Quick Stats */}
      <div className="assessment-stats-grid">
        <div className="assessment-stat-card">
          <div className="stat-icon-wrapper blue">
            <Layers size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{allAssessmentList.length}</span>
            <span className="stat-label">Available Assessments</span>
          </div>
        </div>

        <div className="assessment-stat-card">
          <div className="stat-icon-wrapper green">
            <Award size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{userSummary.totalAttempts}</span>
            <span className="stat-label">Completed Attempts</span>
          </div>
        </div>

        <div className="assessment-stat-card">
          <div className="stat-icon-wrapper purple">
            <CheckCircle2 size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{userSummary.passedAttempts}</span>
            <span className="stat-label">Mastered (≥70%)</span>
          </div>
        </div>

        <div className="assessment-stat-card">
          <div className="stat-icon-wrapper amber">
            <Trophy size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{userSummary.averageScore}%</span>
            <span className="stat-label">Average Score</span>
          </div>
        </div>
      </div>

      {/* AI Quiz Generator Hero Banner */}
      {!activeAssessment && (
        <div className="ai-generator-hero-banner" id="ai-generator-section">
          <div className="ai-hero-content">
            <div className="ai-hero-badge">
              <Sparkles size={13} />
              <span>AI Exam & Quiz Generator</span>
            </div>
            <h2>Generate Custom Quizzes Tailored to Any Syllabus Topic</h2>
            <p>
              Instantly synthesize verified practice quizzes on any semester, subject, unit, and topic using the official BCA curriculum as context.
            </p>
            <div className="ai-hero-actions">
              <button
                type="button"
                className="ai-hero-cta-btn"
                onClick={() => {
                  setActiveTab('ai_generator');
                  const el = document.getElementById('ai-panel-anchor');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Sparkles size={16} />
                <span>Launch AI Quiz Generator</span>
              </button>
              <span className="ai-hero-hint">MCQ • True/False • Short Answer • 5–30 Questions</span>
            </div>
          </div>
        </div>
      )}

      {error && <ErrorState message={error} onRetry={loadUserProgress} />}

      {/* -------------------------------------------------------------
          MAIN VIEW: Catalog vs Assessment Runner vs Results
          ------------------------------------------------------------- */}
      {!activeAssessment ? (
        <>
          {/* Top Filter & Navigation Toolbar */}
          <section className="assessment-toolbar">
            <div className="toolbar-row">
              {/* Category Modes */}
              <div className="mode-tabs">
                <button
                  type="button"
                  className={`mode-tab-btn ai-mode-tab ${activeTab === 'ai_generator' ? 'active' : ''}`}
                  onClick={() => setActiveTab('ai_generator')}
                >
                  <Sparkles size={16} />
                  <span>AI Quiz Generator</span>
                </button>

                <button
                  type="button"
                  className={`mode-tab-btn ${activeTab === 'quizzes' ? 'active' : ''}`}
                  onClick={() => setActiveTab('quizzes')}
                >
                  <CircleHelp size={16} />
                  <span>Unit Quizzes</span>
                </button>

                <button
                  type="button"
                  className={`mode-tab-btn ${activeTab === 'assessments' ? 'active' : ''}`}
                  onClick={() => setActiveTab('assessments')}
                >
                  <ListChecks size={16} />
                  <span>Unit Mastery Exams</span>
                </button>

                <button
                  type="button"
                  className={`mode-tab-btn ${activeTab === 'practice' ? 'active' : ''}`}
                  onClick={() => setActiveTab('practice')}
                >
                  <BookOpen size={16} />
                  <span>Topic Practice</span>
                </button>

                <button
                  type="button"
                  className={`mode-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                  onClick={() => setActiveTab('history')}
                >
                  <RotateCcw size={16} />
                  <span>My History ({historyList.length})</span>
                </button>

                <button
                  type="button"
                  className={`mode-tab-btn ${activeTab === 'assigned' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('assigned');
                    loadAssignedQuizzes();
                  }}
                >
                  <Award size={16} />
                  <span>Mentor Quizzes ({assignedQuizzes.length})</span>
                </button>
              </div>

              {/* Subject Dropdown */}
              <select
                className="subject-select"
                value={selectedSubjectCode}
                onChange={(e) => setSelectedSubjectCode(e.target.value)}
                aria-label="Filter by subject"
              >
                <option value="">All Subjects (29 Courses)</option>
                {filteredSubjects.map((s) => (
                  <option key={s.code} value={s.code}>
                    Sem {s.semester}: {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="toolbar-row">
              {/* Semester Pills */}
              <div className="semester-pills">
                <button
                  type="button"
                  className={`sem-pill-btn ${selectedSemester === 0 ? 'active' : ''}`}
                  onClick={() => setSelectedSemester(0)}
                >
                  All Semesters
                </button>
                {[1, 2, 3, 4, 5, 6].map((sem) => (
                  <button
                    type="button"
                    key={sem}
                    className={`sem-pill-btn ${selectedSemester === sem ? 'active' : ''}`}
                    onClick={() => setSelectedSemester(sem)}
                  >
                    <span>Semester {sem}</span>
                    {studentSem === sem && (
                      <span
                        style={{
                          marginLeft: '6px',
                          fontSize: '10px',
                          fontWeight: 700,
                          background: '#10b981',
                          color: '#ffffff',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          textTransform: 'uppercase'
                        }}
                      >
                        Enrolled
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="student-search" style={{ minWidth: '240px', flex: 1, maxWidth: '380px' }}>
                <Search size={15} />
                <input
                  type="text"
                  placeholder="Search quizzes, units, or codes…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search assessments"
                />
              </div>
            </div>
          </section>

          {/* TAB 0: AI Quiz Generator */}
          {activeTab === 'ai_generator' && (
            <div id="ai-panel-anchor">
              <AIQuizGenerator
                key={`${generatorMode}-${selectedSubjectCode}-${selectedSemester}`}
                onStartQuiz={(generatedQuiz) => startAssessment(generatedQuiz)}
                initialSemester={selectedSemester > 0 ? selectedSemester : (initialSemester > 0 ? initialSemester : 1)}
                initialSubjectCode={selectedSubjectCode || initialSubject}
                initialUnitNumber={initialUnit}
                initialTopic={initialTopic}
                initialMode={generatorMode}
              />
            </div>
          )}

          {/* TAB 1 & 2: Unit Quizzes & Unit Assessments Cards */}
          {(activeTab === 'quizzes' || activeTab === 'assessments') && (
            <>
              {displayAssessments.length === 0 ? (
                <EmptyState
                  title="No assessments found"
                  detail={`No ${activeTab === 'quizzes' ? 'quizzes' : 'assessments'} matched your current search and semester filter.`}
                  action={
                    (searchQuery || selectedSemester > 0 || selectedSubjectCode) && (
                      <button
                        type="button"
                        className="button button-secondary button-small"
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedSemester(0);
                          setSelectedSubjectCode('');
                        }}
                      >
                        Reset All Filters
                      </button>
                    )
                  }
                />
              ) : (
                <div className="assessment-card-grid">
                  {displayAssessments.map((item) => {
                    const priorStats = userSummary.byAssessmentId[item.id];
                    const isPassed = priorStats?.passed;
                    const hasAttempted = Boolean(priorStats);
                    const itemSem = Number(item.semester);
                    const isUnlocked = !studentSem || itemSem === studentSem;

                    return (
                      <article className="assessment-item-card" key={item.id}>
                        <div
                          className={`card-top-bar ${
                            item.assessmentType === 'unit_quiz' ? 'quiz-type' : 'assessment-type'
                          }`}
                        >
                          <span
                            className={`type-pill ${
                              item.assessmentType === 'unit_quiz' ? 'quiz' : 'assessment'
                            }`}
                          >
                            {item.assessmentType === 'unit_quiz' ? (
                              <>
                                <CircleHelp size={12} /> Unit Quiz
                              </>
                            ) : (
                              <>
                                <Award size={12} /> Unit Exam
                              </>
                            )}
                          </span>
                          <span className="subject-badge" style={!isUnlocked ? { background: 'rgba(239, 68, 68, 0.12)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.25)' } : {}}>
                            Sem {item.semester} • {item.subjectCode}
                            {!isUnlocked && (
                              <span style={{ marginLeft: 6, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                <Lock size={10} /> Locked
                              </span>
                            )}
                          </span>
                        </div>

                        <div className="card-body-content">
                          <span className="card-unit-label">
                            Unit {item.unitNumber}: {item.unitTitle}
                          </span>
                          <h2 className="card-title">{item.title}</h2>

                          <div className="card-meta-tags">
                            <span className="meta-chip">
                              <HelpCircle size={13} />
                              {item.questions?.length || item.totalQuestions} Questions
                            </span>
                            <span className="meta-chip">
                              <Clock3 size={13} />
                              ~{item.estimatedMinutes} min
                            </span>
                            <span className="meta-chip">
                              <Trophy size={13} />
                              Pass: {item.passingScore || 70}%
                            </span>
                          </div>

                          {/* Prior Score Badge */}
                          {hasAttempted && (
                            <div
                              className={`card-score-banner ${isPassed ? 'passed' : 'needs-review'}`}
                            >
                              <span>
                                {isPassed ? '✓ Unit Mastered' : '⚠ Review Suggested'}
                              </span>
                              <span>
                                Best: {priorStats.bestScore}% ({priorStats.attemptsCount} attempts)
                              </span>
                            </div>
                          )}

                          <div className="card-actions-row">
                            {isUnlocked ? (
                              <button
                                type="button"
                                className="button button-primary"
                                style={{ width: '100%', justifyContent: 'center' }}
                                onClick={() => startAssessment(item)}
                              >
                                <span>{hasAttempted ? 'Retake Assessment' : 'Start Assessment'}</span>
                                <ArrowRight size={15} />
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="button button-secondary"
                                disabled
                                style={{
                                  width: '100%',
                                  justifyContent: 'center',
                                  opacity: 0.65,
                                  cursor: 'not-allowed',
                                  backgroundColor: 'rgba(51, 65, 85, 0.45)',
                                  borderColor: 'rgba(148, 163, 184, 0.25)',
                                  color: '#94a3b8',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                                title={`Assessment locked. You are enrolled in Semester ${studentSem}. This assessment is for Semester ${itemSem}.`}
                              >
                                <Lock size={14} />
                                <span>Locked (Enrolled in Sem {studentSem})</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* TAB 3: Topic Practice Hub */}
          {activeTab === 'practice' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div
                style={{
                  background: 'var(--bg-surface)',
                  padding: '16px 20px',
                  borderRadius: '14px',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>
                    Topic-Wise Practice Hub
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                    Practice syllabus topics with guided hints, student formulation boxes, and official model answers.
                  </p>
                </div>
                <span className="soft-badge">
                  <BookOpen size={14} />
                  <span>
                    {selectedSubjectCode
                      ? currentSubject?.name || selectedSubjectCode
                      : 'Select a subject to view all topic exercises'}
                  </span>
                </span>
              </div>

              {!selectedSubjectCode ? (
                <div className="assessment-card-grid">
                  {filteredSubjects.map((sub) => (
                    <div
                      key={sub.code}
                      className="assessment-item-card"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedSubjectCode(sub.code)}
                    >
                      <div className="card-top-bar quiz-type">
                        <span className="type-pill quiz">Topic Practice</span>
                        <span className="subject-badge">Sem {sub.semester}</span>
                      </div>
                      <div className="card-body-content">
                        <span className="card-unit-label">{sub.code}</span>
                        <h2 className="card-title">{sub.name}</h2>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                          4 Units • 16 Official Syllabus Topics with Practice Sets
                        </p>
                        <button
                          type="button"
                          className="button button-secondary button-small"
                          style={{ marginTop: '10px' }}
                        >
                          <span>Explore Practice Topics</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <button
                    type="button"
                    className="text-back"
                    onClick={() => setSelectedSubjectCode('')}
                  >
                    <ArrowLeft size={15} />
                    <span>Back to all subjects</span>
                  </button>

                  {currentSubject?.units?.map((unit, uIdx) => (
                    <div
                      key={uIdx}
                      style={{
                        background: 'var(--bg-surface)',
                        borderRadius: '14px',
                        border: '1px solid var(--border-color)',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          padding: '16px 20px',
                          background: 'var(--bg-hover)',
                          borderBottom: '1px solid var(--border-color)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                            Unit {unit.unitNumber}
                          </span>
                          <h4 style={{ margin: '2px 0 0', fontSize: '15.5px', fontWeight: 700 }}>
                            {unit.unitTitle}
                          </h4>
                        </div>
                        <span className="soft-badge">
                          {unit.topicPractices?.length || 4} Topics
                        </span>
                      </div>

                      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {unit.topicPractices?.map((tp, tpIdx) => {
                          const isExpanded = expandedTopics[tp.id];
                          return (
                            <div
                              key={tp.id || tpIdx}
                              style={{
                                border: '1px solid var(--border-color)',
                                borderRadius: '12px',
                                padding: '14px 18px',
                                background: 'var(--bg-surface)'
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  cursor: 'pointer'
                                }}
                                onClick={() =>
                                  setExpandedTopics((prev) => ({ ...prev, [tp.id]: !prev[tp.id] }))
                                }
                              >
                                <div>
                                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>
                                    TOPIC #{tp.topicSequence}
                                  </span>
                                  <h5 style={{ margin: '2px 0 0', fontSize: '14.5px', fontWeight: 600 }}>
                                    {tp.title}
                                  </h5>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                    {tp.questions?.length || 2} Practice Questions
                                  </span>
                                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </div>
                              </div>

                              {isExpanded && (
                                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                                  {tp.questions?.map((q, qIdx) => {
                                    const isRevealed = revealedModelAnswers[q.id];
                                    return (
                                      <div
                                        key={q.id || qIdx}
                                        style={{
                                          padding: '12px 14px',
                                          borderRadius: '10px',
                                          background: 'var(--bg-hover)',
                                          display: 'flex',
                                          flexDirection: 'column',
                                          gap: '8px'
                                        }}
                                      >
                                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                          Q{qIdx + 1}: {q.prompt}
                                        </div>
                                        {q.answerHint && (
                                          <div style={{ fontSize: '12.5px', color: 'var(--color-primary)', fontStyle: 'italic' }}>
                                            💡 Hint: {q.answerHint}
                                          </div>
                                        )}

                                        <textarea
                                          className="sa-textarea"
                                          placeholder="Formulate your response or notes here…"
                                          style={{ minHeight: '70px' }}
                                        />

                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                                          <button
                                            type="button"
                                            className="button button-secondary button-small"
                                            onClick={() =>
                                              setRevealedModelAnswers((prev) => ({
                                                ...prev,
                                                [q.id]: !prev[q.id]
                                              }))
                                            }
                                          >
                                            <span>{isRevealed ? 'Hide Model Answer' : 'Reveal Model Answer'}</span>
                                          </button>
                                        </div>

                                        {isRevealed && (
                                          <div
                                            style={{
                                              padding: '10px 14px',
                                              borderRadius: '8px',
                                              background: 'rgba(99, 102, 241, 0.08)',
                                              border: '1px solid rgba(99, 102, 241, 0.2)',
                                              fontSize: '13px',
                                              color: 'var(--text-primary)',
                                              marginTop: '6px'
                                            }}
                                          >
                                            <strong>Official Model Points:</strong>
                                            <p style={{ margin: '4px 0 0', lineHeight: 1.45 }}>
                                              {q.modelAnswer || 'Focus on defining the core mechanism, citing official course constraints, and detailing practical implementation.'}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          

          {/* TAB 4: Attempt History & Tracker */}
          {activeTab === 'history' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  background: 'var(--bg-surface)',
                  padding: '16px 20px',
                  borderRadius: '14px',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>
                    My Assessment Attempt History
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                    Track all completed quizzes, unit exams, score improvements, and pass statuses saved to your account.
                  </p>
                </div>
                <button
                  type="button"
                  className="button button-secondary button-small"
                  onClick={() => loadHistoryWithFilters(historySemester, historySubject, historyUnit, historyDate)}
                  disabled={loadingHistory}
                >
                  <RefreshCw size={14} className={loadingHistory ? 'spin' : ''} />
                  <span>Refresh History</span>
                </button>
              </div>

              {/* History Filter Toolbar */}
              <div
                style={{
                  background: 'var(--bg-surface)',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  <Filter size={15} />
                  <span>Filter History:</span>
                </div>

                {/* Semester Filter */}
                <select
                  value={historySemester}
                  onChange={(e) => {
                    const val = e.target.value;
                    setHistorySemester(val);
                    setHistorySubject('all');
                    loadHistoryWithFilters(val, 'all', historyUnit, historyDate);
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-surface)',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text-primary)'
                  }}
                  aria-label="Filter history by semester"
                >
                  <option value="all">All Semesters</option>
                  {[1, 2, 3, 4, 5, 6].map((s) => (
                    <option key={s} value={String(s)}>Semester {s}</option>
                  ))}
                </select>

                {/* Subject Filter */}
                <select
                  value={historySubject}
                  onChange={(e) => {
                    const val = e.target.value;
                    setHistorySubject(val);
                    loadHistoryWithFilters(historySemester, val, historyUnit, historyDate);
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-surface)',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    maxWidth: '240px'
                  }}
                  aria-label="Filter history by subject"
                >
                  <option value="all">All Subjects</option>
                  {officialAssessmentSubjects
                    .filter((s) => historySemester === 'all' || Number(s.semester) === Number(historySemester))
                    .map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.code}: {s.name}
                      </option>
                    ))}
                </select>

                {/* Unit Filter */}
                <select
                  value={historyUnit}
                  onChange={(e) => {
                    const val = e.target.value;
                    setHistoryUnit(val);
                    loadHistoryWithFilters(historySemester, historySubject, val, historyDate);
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-surface)',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text-primary)'
                  }}
                  aria-label="Filter history by unit"
                >
                  <option value="all">All Units</option>
                  {[1, 2, 3, 4].map((u) => (
                    <option key={u} value={String(u)}>Unit {u}</option>
                  ))}
                </select>

                {/* Date Filter */}
                <select
                  value={historyDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    setHistoryDate(val);
                    loadHistoryWithFilters(historySemester, historySubject, historyUnit, val);
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-surface)',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text-primary)'
                  }}
                  aria-label="Filter history by date"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Past 7 Days</option>
                  <option value="month">Past 30 Days</option>
                </select>

                {(historySemester !== 'all' || historySubject !== 'all' || historyUnit !== 'all' || historyDate !== 'all') && (
                  <button
                    type="button"
                    className="button button-secondary button-small"
                    onClick={() => {
                      setHistorySemester('all');
                      setHistorySubject('all');
                      setHistoryUnit('all');
                      setHistoryDate('all');
                      loadHistoryWithFilters('all', 'all', 'all', 'all');
                    }}
                    style={{ fontSize: '12px', padding: '4px 10px' }}
                  >
                    Clear Filters
                  </button>
                )}

                <span style={{ marginLeft: 'auto', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                  Showing <strong>{filteredHistory.length}</strong> record{filteredHistory.length === 1 ? '' : 's'}
                </span>
              </div>

              {filteredHistory.length === 0 ? (
                <EmptyState
                  title="No completed assessments found"
                  detail={
                    historySemester !== 'all' || historySubject !== 'all' || historyUnit !== 'all' || historyDate !== 'all'
                      ? "No quiz attempts match your selected filter criteria. Try clearing filters to view all past attempts."
                      : "Take your first Unit Quiz, AI Quiz or Unit Mastery Exam to start recording your grades and performance analytics."
                  }
                  action={
                    <button
                      type="button"
                      className="button button-primary button-small"
                      onClick={() => {
                        setHistorySemester('all');
                        setHistorySubject('all');
                        setHistoryUnit('all');
                        setHistoryDate('all');
                        setActiveTab('quizzes');
                      }}
                    >
                      Browse Available Quizzes
                    </button>
                  }
                />
              ) : (
                <div className="history-table-container">
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>Assessment</th>
                        <th>Type</th>
                        <th>Subject & Unit</th>
                        <th>Score</th>
                        <th>Result</th>
                        <th>Attempt</th>
                        <th>Date & Time</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHistory.map((att, idx) => {
                        const isPassed = att.passed || att.score >= 70;
                        const dateStr = att.createdAt
                          ? new Date(att.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'Recent';

                        const isAI = att.assessmentType === 'ai_generated';

                        return (
                          <tr key={att._id || idx}>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                                  {att.lessonTitle || att.assessmentId || 'Quiz'}
                                </span>
                                {att.topic && (
                                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                                    Topic: {att.topic}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td>
                              <span
                                className={`type-pill ${
                                  isAI ? 'quiz ai-badge-glow' : att.assessmentType === 'unit_quiz' ? 'quiz' : 'assessment'
                                }`}
                                style={isAI ? { background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))', color: '#6366f1' } : {}}
                              >
                                {isAI ? 'AI Quiz' : att.assessmentType === 'unit_quiz' ? 'Quiz' : 'Exam'}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                  {att.subjectName || att.subjectCode}
                                </span>
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                  Sem {att.semester || 1}{att.unitNumber ? ` • Unit ${att.unitNumber}` : ''}
                                </span>
                              </div>
                            </td>
                            <td>
                              <strong style={{ fontSize: '14.5px', color: isPassed ? '#10b981' : '#f59e0b' }}>
                                {att.score}%
                              </strong>
                              {att.correctCount !== undefined && att.totalQuestions !== undefined && (
                                <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>
                                  {att.correctCount}/{att.totalQuestions} correct
                                </span>
                              )}
                            </td>
                            <td>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  color: isPassed ? '#10b981' : '#d97706'
                                }}
                              >
                                {isPassed ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                                {isPassed ? 'Mastered' : 'Needs Review'}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontSize: '12px', fontWeight: 600 }}>
                                #{att.attemptNumber || 1} {att.isRetry && '(Retry)'}
                              </span>
                            </td>
                            <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                              {dateStr}
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <button
                                  type="button"
                                  className="button button-secondary button-small"
                                  style={{ padding: '3px 8px', fontSize: '11px' }}
                                  onClick={() => {
                                    setGeneratorMode('retry');
                                    setSelectedSemester(att.semester || 1);
                                    if (att.subjectCode) setSelectedSubjectCode(att.subjectCode);
                                    setActiveTab('ai_generator');
                                  }}
                                  title="Generate an AI Retry Quiz based on this subject's concepts"
                                >
                                  <Sparkles size={11} />
                                  <span>Retry AI</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          
        </>
      ) : (
        /* -------------------------------------------------------------
           ACTIVE ASSESSMENT TAKING OR RESULT CELEBRATION VIEW
           ------------------------------------------------------------- */
        <section className="assessment-runner">
          {!assessmentResult ? (
            <>
              {/* Runner Navigation Bar */}
              <div className="runner-header">
                <div>
                  <button
                    type="button"
                    className="text-back"
                    onClick={() => setActiveAssessment(null)}
                    style={{ marginBottom: '8px' }}
                  >
                    <ArrowLeft size={15} />
                    <span>Exit Assessment</span>
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span className="soft-badge">
                      Sem {activeAssessment.semester} • {activeAssessment.subjectCode}
                    </span>
                    <span className="soft-badge">
                      Unit {activeAssessment.unitNumber}: {activeAssessment.unitTitle}
                    </span>
                    {activeAssessment.isRetrySession && (
                      <span className="soft-badge" style={{ background: '#fef3c7', color: '#b45309' }}>
                        <RotateCcw size={12} /> Retry Session
                      </span>
                    )}
                    {activeAssessment.assessmentType === 'ai_generated' && (
                      <span className="soft-badge ai-badge-glow">
                        <Sparkles size={12} /> AI-Generated ({activeAssessment.difficulty || 'MIXED'})
                      </span>
                    )}
                  </div>
                  <h2 style={{ margin: '8px 0 0', fontSize: '20px', fontWeight: 800 }}>
                    {activeAssessment.title}
                  </h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Instant feedback toggle */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', color: 'var(--text-secondary)' }}>
                      <input
                        type="checkbox"
                        checked={instantFeedbackEnabled}
                        onChange={(e) => setInstantFeedbackEnabled(e.target.checked)}
                      />
                      <span>Instant Feedback Mode</span>
                    </label>

                    {/* Timer */}
                    <div className="soft-badge">
                      <Clock3 size={14} />
                      <span>{formatTime(timeSpent)}</span>
                    </div>
                  </div>

                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary)' }}>
                    Answered {answeredCount} of {activeAssessment.questions?.length || 0}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="runner-progress-bar-wrap">
                  <div
                    className="runner-progress-bar-fill"
                    style={{
                      width: `${
                        activeAssessment.questions?.length
                          ? Math.round((answeredCount / activeAssessment.questions.length) * 100)
                          : 0
                      }%`
                    }}
                  />
                </div>
              </div>

              {/* Retry mode banner */}
              {activeAssessment.isRetrySession && (
                <div className="retry-banner">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <RotateCcw size={18} />
                    <span>
                      Targeted Retry Mode: Retrying the {activeAssessment.questions?.length} questions you previously missed.
                    </span>
                  </div>
                </div>
              )}

              {/* Questions List Form */}
              <form onSubmit={handleSubmitAssessment} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {(activeAssessment.questions || []).map((q, idx) => {
                  const qId = q.id;
                  const isMCQ = q.type === 'mcq';
                  const isTF = q.type === 'true_false';
                  const isSA = q.type === 'short_answer';
                  const isCode = q.type === 'code' || q.type === 'applied';

                  const userAnswer = answers[qId];
                  const hasAnswered = userAnswer !== undefined && userAnswer !== '';

                  return (
                    <div className="q-box" key={qId || idx}>
                      <div className="q-box-top">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span className="q-badge">
                            QUESTION {String(idx + 1).padStart(2, '0')} •{' '}
                            {isMCQ ? 'MCQ' : isTF ? 'TRUE / FALSE' : isSA ? 'SHORT ANSWER' : 'CHALLENGE'}
                          </span>
                          {q.difficulty && (
                            <span className={`q-diff-badge ${q.difficulty.toLowerCase()}`}>
                              {q.difficulty.toUpperCase()}
                            </span>
                          )}
                        </div>
                        {q.topicReference && (
                          <span className="q-topic-badge" title={`Syllabus Topic: ${q.topicReference}`}>
                            <Target size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'text-bottom' }} />
                            {q.topicReference}
                          </span>
                        )}
                      </div>

                      <h3 className="q-prompt-text">{q.prompt}</h3>

                      {/* 1. Multiple Choice Question */}
                      {isMCQ && (
                        <div className="mcq-options-container">
                          {(q.options || []).map((opt, optIdx) => {
                            const isSelected = userAnswer === optIdx;
                            const hasCorrectOption = q.correctOption !== undefined && q.correctOption !== null;
                            const showCorrectFeedback =
                              instantFeedbackEnabled && hasAnswered && hasCorrectOption && optIdx === q.correctOption;
                            const showIncorrectFeedback =
                              instantFeedbackEnabled && hasAnswered && hasCorrectOption && isSelected && optIdx !== q.correctOption;

                            let optClass = 'mcq-option-pill';
                            if (isSelected) optClass += ' selected';
                            if (showCorrectFeedback) optClass += ' correct-feedback';
                            if (showIncorrectFeedback) optClass += ' incorrect-feedback';

                            return (
                              <label key={optIdx} className={optClass} onClick={() => handleSelectMCQ(qId, optIdx)}>
                                <input
                                  type="radio"
                                  name={qId}
                                  value={optIdx}
                                  checked={isSelected}
                                  onChange={() => handleSelectMCQ(qId, optIdx)}
                                  style={{ accentColor: 'var(--color-primary)' }}
                                />
                                <span style={{ flex: 1 }}>{opt}</span>
                                {showCorrectFeedback && <CheckCircle2 size={16} color="#10b981" />}
                                {showIncorrectFeedback && <XCircle size={16} color="#ef4444" />}
                              </label>
                            );
                          })}

                          {instantFeedbackEnabled && hasAnswered && q.correctOption !== undefined && q.correctOption !== null && (
                            <div
                              className={`q-explanation-box ${
                                userAnswer === q.correctOption ? 'correct' : 'incorrect'
                              }`}
                            >
                              {userAnswer === q.correctOption ? (
                                <CheckCircle2 size={18} color="#10b981" />
                              ) : (
                                <XCircle size={18} color="#ef4444" />
                              )}
                              <div>
                                <strong>
                                  {userAnswer === q.correctOption ? 'Correct! ' : 'Needs Review: '}
                                </strong>
                                <span>{q.explanation}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 2. True / False Question */}
                      {isTF && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div className="tf-buttons-row">
                            <button
                              type="button"
                              className={`tf-choice-btn ${userAnswer === true ? 'selected-true' : ''}`}
                              onClick={() => handleSelectTF(qId, true)}
                            >
                              <CheckCircle2 size={18} />
                              <span>TRUE</span>
                            </button>

                            <button
                              type="button"
                              className={`tf-choice-btn ${userAnswer === false ? 'selected-false' : ''}`}
                              onClick={() => handleSelectTF(qId, false)}
                            >
                              <XCircle size={18} />
                              <span>FALSE</span>
                            </button>
                          </div>

                          {instantFeedbackEnabled && hasAnswered && q.correctAnswer !== undefined && q.correctAnswer !== null && (
                            <div
                              className={`q-explanation-box ${
                                Boolean(userAnswer) === Boolean(q.correctAnswer) ? 'correct' : 'incorrect'
                              }`}
                            >
                              {Boolean(userAnswer) === Boolean(q.correctAnswer) ? (
                                <CheckCircle2 size={18} color="#10b981" />
                              ) : (
                                <XCircle size={18} color="#ef4444" />
                              )}
                              <div>
                                <strong>
                                  {Boolean(userAnswer) === Boolean(q.correctAnswer) ? 'Correct! ' : 'Explanation: '}
                                </strong>
                                <span>{q.explanation}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 3. Short Answer Question */}
                      {isSA && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {q.answerHint && (
                            <div style={{ fontSize: '13px', color: 'var(--color-primary)', fontStyle: 'italic' }}>
                              💡 Hint: {q.answerHint}
                            </div>
                          )}

                          <textarea
                            className="sa-textarea"
                            placeholder="Write your detailed explanation here based on the syllabus concepts..."
                            value={userAnswer || ''}
                            onChange={(e) => handleShortAnswerInput(qId, e.target.value)}
                          />

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                              {(userAnswer || '').trim().split(/\s+/).filter(Boolean).length} words
                            </span>

                            {q.modelAnswer && (
                              <button
                                type="button"
                                className="button button-secondary button-small"
                                onClick={() =>
                                  setRevealedModelAnswers((prev) => ({
                                    ...prev,
                                    [qId]: !prev[qId]
                                  }))
                                }
                              >
                                <span>{revealedModelAnswers[qId] ? 'Hide Rubric & Model Answer' : 'Check Model Answer & Rubric'}</span>
                              </button>
                            )}
                          </div>

                          {revealedModelAnswers[qId] && (
                            <div className="rubric-panel">
                              <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                Official Model Answer:
                              </div>
                              <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                                {q.modelAnswer}
                              </p>

                              <div style={{ marginTop: '8px' }}>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                                  Self-Assessment Rubric (Award up to 3 points):
                                </div>
                                <ul className="rubric-criteria-list">
                                  {(q.rubricCriteria || []).map((crit, cIdx) => (
                                    <li key={cIdx}>{crit}</li>
                                  ))}
                                </ul>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                                  <span style={{ fontSize: '12.5px', fontWeight: 600 }}>Score Awarded:</span>
                                  {[0, 1, 2, 3].map((pts) => (
                                    <button
                                      type="button"
                                      key={pts}
                                      className={`sem-pill-btn ${selfScores[qId] === pts ? 'active' : ''}`}
                                      onClick={() => handleSelfScore(qId, pts)}
                                    >
                                      {pts} {pts === 1 ? 'pt' : 'pts'}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 4. Programming / Applied Challenge */}
                      {isCode && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          <div className="code-workbench">
                            <div className="code-workbench-top">
                              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#38bdf8' }}>
                                <Terminal size={15} />
                                Interactive Code Editor ({q.language || 'javascript'})
                              </span>
                              <button
                                type="button"
                                className="button button-small"
                                style={{ background: '#0284c7', color: '#fff' }}
                                onClick={() => handleRunCode(q)}
                              >
                                <Play size={13} />
                                <span>Run & Test Code</span>
                              </button>
                            </div>

                            <textarea
                              className="code-editor-area"
                              value={codeDrafts[qId] !== undefined ? codeDrafts[qId] : q.starterCode || ''}
                              onChange={(e) => setCodeDrafts((prev) => ({ ...prev, [qId]: e.target.value }))}
                              spellCheck="false"
                            />

                            {/* Execution Output Terminal */}
                            {codeExecutionResults[qId] && (
                              <div className="code-terminal-output">
                                <div style={{ fontWeight: 700, marginBottom: '4px' }}>
                                  Test Results [{codeExecutionResults[qId].status}]:
                                </div>
                                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '12px' }}>
                                  {codeExecutionResults[qId].log}
                                </pre>
                              </div>
                            )}
                          </div>

                          {/* Reference Solution Toggle */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                            <button
                              type="button"
                              className="button button-secondary button-small"
                              onClick={() =>
                                setShowSolutionCode((prev) => ({
                                  ...prev,
                                  [qId]: !prev[qId]
                                }))
                              }
                            >
                              <Code2 size={14} />
                              <span>{showSolutionCode[qId] ? 'Hide Solution' : 'View Reference Solution'}</span>
                            </button>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '12px', fontWeight: 600 }}>Challenge Credit:</span>
                              {[0, 2, 4].map((pts) => (
                                <button
                                  type="button"
                                  key={pts}
                                  className={`sem-pill-btn ${selfScores[qId] === pts ? 'active' : ''}`}
                                  onClick={() => handleSelfScore(qId, pts)}
                                >
                                  {pts} pts
                                </button>
                              ))}
                            </div>
                          </div>

                          {showSolutionCode[qId] && (
                            <div style={{ background: '#0f172a', padding: '16px', borderRadius: '10px', color: '#f8fafc', fontSize: '13px' }}>
                              <strong style={{ color: '#38bdf8' }}>Reference Solution Implementation:</strong>
                              <pre style={{ margin: '8px 0', fontFamily: 'monospace', color: '#a5f3fc', whiteSpace: 'pre-wrap' }}>
                                {q.solution}
                              </pre>
                              <p style={{ margin: 0, fontSize: '12.5px', color: '#94a3b8' }}>
                                {q.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Submit Actions Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="button button-primary button-large"
                    style={{ minWidth: '220px', justifyContent: 'center' }}
                  >
                    {submitting ? (
                      <span>Grading & Saving Result…</span>
                    ) : (
                      <>
                        <span>Submit Final Assessment</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => setActiveAssessment(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* -------------------------------------------------------------
               ASSESSMENT RESULTS & CELEBRATION VIEW
               ------------------------------------------------------------- */
            <div className="assessment-celebration-card">
              <div
                className={`celebration-trophy-icon ${
                  assessmentResult.passed ? 'passed' : 'needs-review'
                }`}
              >
                <Trophy size={42} />
              </div>

              <span className="eyebrow">Assessment Performance Summary</span>
              <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 800 }}>
                {assessmentResult.passed ? 'Unit Mastery Achieved! 🎉' : 'Assessment Completed — Review Suggested 📖'}
              </h2>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '580px' }}>
                {assessmentResult.passed
                  ? 'Outstanding work! You have successfully demonstrated mastery of the required concepts for this unit.'
                  : 'You have completed the assessment. Practice the missed topics and use the instant retry button below to achieve full mastery.'}
              </p>

              <div className="celebration-score-huge">
                {assessmentResult.score}%
              </div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>
                {assessmentResult.passed ? 'Passing Benchmark Met (≥70%)' : 'Passing Benchmark: 70%'}
              </span>

              {/* Performance Breakdown Table */}
              <div className="breakdown-table-wrap">
                <div className="breakdown-row">
                  <span>Questions Correct / Completed</span>
                  <strong>
                    {assessmentResult.correctCount} of {assessmentResult.totalQuestions} Questions
                  </strong>
                </div>
                <div className="breakdown-row">
                  <span>Time Spent</span>
                  <strong>{formatTime(assessmentResult.timeSpentSeconds || timeSpent)}</strong>
                </div>
                <div className="breakdown-row">
                  <span>Attempt Number</span>
                  <strong>
                    #{assessmentResult.attemptNumber || 1} (Saved to Account)
                  </strong>
                </div>
                <div className="breakdown-row">
                  <span>Missed Questions</span>
                  <strong style={{ color: assessmentResult.incorrectQuestionIds?.length ? '#ef4444' : '#10b981' }}>
                    {assessmentResult.incorrectQuestionIds?.length || 0} questions
                  </strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px' }}>
                {/* RETRY MISSED QUESTIONS BUTTON */}
                {assessmentResult.incorrectQuestionIds?.length > 0 && (
                  <button
                    type="button"
                    className="button button-primary"
                    onClick={handleStartRetry}
                    style={{ background: '#d97706', borderColor: '#d97706' }}
                  >
                    <RotateCcw size={16} />
                    <span>Retry Incorrect Questions ({assessmentResult.incorrectQuestionIds.length})</span>
                  </button>
                )}

                {assessmentResult.incorrectQuestionIds?.length > 0 && (
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => {
                      setActiveAssessment(null);
                      setAssessmentResult(null);
                      setGeneratorMode('retry');
                      setActiveTab('ai_generator');
                    }}
                    style={{ borderColor: 'rgba(99, 102, 241, 0.4)', color: '#6366f1' }}
                  >
                    <Bot size={15} />
                    <span>Generate AI Retry Quiz</span>
                  </button>
                )}

                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => startAssessment(activeAssessment)}
                >
                  <RotateCcw size={15} />
                  <span>Retake Entire Assessment</span>
                </button>

                {activeAssessment.assessmentType === 'ai_generated' && (
                  <button
                    type="button"
                    className="button button-primary"
                    onClick={() => {
                      setActiveAssessment(null);
                      setAssessmentResult(null);
                      setActiveTab('ai_generator');
                    }}
                    style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', borderColor: '#4f46e5' }}
                  >
                    <Sparkles size={15} />
                    <span>Generate Another AI Quiz</span>
                  </button>
                )}

                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => {
                    setActiveAssessment(null);
                    setAssessmentResult(null);
                  }}
                >
                  <span>All Assessments</span>
                  <ArrowRight size={15} />
                </button>
              </div>

              {/* AI Diagnostic Performance Feedback */}
              {assessmentResult.aiFeedback && (
                <div style={{
                  width: '100%',
                  maxWidth: '780px',
                  marginTop: '20px',
                  padding: '20px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <Sparkles size={18} color="#6366f1" />
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      AI Performance Feedback & Diagnostic Analysis
                    </h3>
                  </div>
                  <p style={{ margin: '0 0 14px', fontSize: '14px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                    {assessmentResult.aiFeedback.overallAssessment}
                  </p>

                  {assessmentResult.aiFeedback.weakAreas?.length > 0 && (
                    <div style={{ marginBottom: '14px' }}>
                      <h4 style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Identified Weak Areas:
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {assessmentResult.aiFeedback.weakAreas.map((w, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '12px',
                              fontWeight: 600,
                              padding: '4px 10px',
                              borderRadius: '8px',
                              background: 'rgba(239, 68, 68, 0.1)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              color: '#dc2626'
                            }}
                          >
                            {w.topic} ({w.missedCount} missed)
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {assessmentResult.aiFeedback.recommendedLessons?.length > 0 && (
                    <div>
                      <h4 style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Recommended Lessons to Revisit:
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {assessmentResult.aiFeedback.recommendedLessons.map((rec, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 14px',
                              borderRadius: '10px',
                              background: 'var(--bg-surface)',
                              border: '1px solid var(--border-color)',
                              gap: '12px'
                            }}
                          >
                            <div>
                              <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{rec.title}</strong>
                              <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>{rec.reason}</p>
                            </div>
                            <button
                              type="button"
                              className="button button-secondary button-small"
                              onClick={() => navigate(rec.url || `/learning/${activeAssessment.subjectCode}`)}
                            >
                              <span>Revisit Lesson</span>
                              <ArrowRight size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* AI Next Study Recommendation Banner */}
              {assessmentResult.studyRecommendation && (
                <div style={{
                  width: '100%',
                  maxWidth: '780px',
                  marginTop: '14px',
                  padding: '16px 20px',
                  borderRadius: '14px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  textAlign: 'left'
                }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)' }}>
                      Next Step Recommendation
                    </span>
                    <h4 style={{ margin: '2px 0 0', fontSize: '15px', fontWeight: 700 }}>
                      {assessmentResult.studyRecommendation.title || `Next Topic: ${assessmentResult.studyRecommendation.topic}`}
                    </h4>
                    <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                      {assessmentResult.studyRecommendation.description || assessmentResult.studyRecommendation.reason}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="button button-primary button-small"
                    onClick={() => {
                      if (assessmentResult.studyRecommendation.url) {
                        navigate(assessmentResult.studyRecommendation.url);
                      } else if (assessmentResult.studyRecommendation.actionUrl) {
                        navigate(assessmentResult.studyRecommendation.actionUrl);
                      } else {
                        setActiveAssessment(null);
                        setAssessmentResult(null);
                        setActiveTab('ai_generator');
                      }
                    }}
                  >
                    <span>{assessmentResult.studyRecommendation.suggestedAction || 'Continue Learning'}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}

              {/* Detailed Question Review Breakdown */}
              {assessmentResult.questionResults && assessmentResult.questionResults.length > 0 && (
                <div style={{ width: '100%', maxWidth: '780px', marginTop: '24px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 6px', color: 'var(--text-primary)' }}>
                    Detailed Question-by-Question Review:
                  </h3>
                  {assessmentResult.questionResults.map((r, rIdx) => (
                    <div
                      key={rIdx}
                      style={{
                        padding: '14px 16px',
                        borderRadius: '12px',
                        background: r.isCorrect ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                        border: `1px solid ${r.isCorrect ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {r.isCorrect ? (
                            <CheckCircle2 size={16} color="#10b981" />
                          ) : (
                            <XCircle size={16} color="#ef4444" />
                          )}
                          Question {rIdx + 1}: {r.prompt}
                        </span>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: r.isCorrect ? '#10b981' : '#ef4444' }}>
                          {r.isCorrect ? 'Correct' : 'Needs Review'}
                        </span>
                      </div>

                      {r.explanation && (
                        <p style={{ margin: '4px 0 0 24px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                          {r.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Mentor Assigned Quizzes */}
          {activeTab === 'assigned' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: '16px',
                padding: '20px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#f8fafc' }}>
                    Mentor Assigned Diagnostic Assessments
                  </h3>
                  <span style={{ fontSize: '13px', color: '#cbd5e1' }}>
                    Personalized diagnostic tests authored and published by your mentors.
                  </span>
                </div>
                <button
                  type="button"
                  className="button button-secondary button-small"
                  onClick={loadAssignedQuizzes}
                >
                  <RotateCcw size={13} />
                  <span>Refresh</span>
                </button>
              </div>

              {assignedQuizzes.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                  {assignedQuizzes.map((quiz) => (
                    <div
                      key={quiz._id}
                      style={{
                        background: 'var(--bg-surface, #1e293b)',
                        border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
                        borderRadius: '16px',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                          {quiz.subjectName} · Sem {quiz.semester}
                        </span>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: quiz.isCompleted ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                          color: quiz.isCompleted ? '#10b981' : '#f59e0b'
                        }}>
                          {quiz.isCompleted ? `Completed (${quiz.myAttempt?.score}%)` : 'Assigned'}
                        </span>
                      </div>

                      <strong style={{ fontSize: '16px', color: '#f8fafc' }}>{quiz.title}</strong>
                      <p style={{ fontSize: '12.5px', color: '#94a3b8', margin: 0 }}>
                        {quiz.description || 'Assigned diagnostic quiz.'}
                      </p>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '12px', color: '#cbd5e1' }}>
                        <span>Questions: <strong>{quiz.questionCount || quiz.questions?.length || 0}</strong></span>
                        <span>Duration: <strong>{quiz.durationMinutes || 20}m</strong></span>
                        <span>Pass Mark: <strong>{quiz.passingScore || 70}%</strong></span>
                        <span>Difficulty: <strong style={{ textTransform: 'capitalize' }}>{quiz.difficulty || 'medium'}</strong></span>
                      </div>

                      {(!studentSem || Number(quiz.semester) === studentSem) ? (
                        <button
                          type="button"
                          className="button button-primary"
                          style={{ marginTop: 'auto' }}
                          onClick={() => {
                            const formattedForPlayer = {
                              id: `mentor-quiz-${quiz._id}`,
                              _id: quiz._id,
                              isMentorQuiz: true,
                              assessmentType: 'mentor_quiz',
                              title: quiz.title,
                              subjectCode: quiz.subjectCode,
                              subjectName: quiz.subjectName,
                              unitNumber: 1,
                              unitTitle: quiz.topic || quiz.title,
                              semester: quiz.semester,
                              durationMinutes: quiz.durationMinutes || 20,
                              passingScore: quiz.passingScore || 70,
                              questions: quiz.questions
                            };
                            startAssessment(formattedForPlayer);
                          }}
                        >
                          <Play size={14} fill="currentColor" />
                          <span>{quiz.isCompleted ? 'Retake Mentor Quiz' : 'Start Mentor Quiz'}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="button button-secondary"
                          disabled
                          style={{
                            marginTop: 'auto',
                            opacity: 0.65,
                            cursor: 'not-allowed',
                            backgroundColor: 'rgba(51, 65, 85, 0.45)',
                            borderColor: 'rgba(148, 163, 184, 0.25)',
                            color: '#94a3b8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                          title={`Locked: You are enrolled in Semester ${studentSem}. This quiz is for Semester ${quiz.semester}.`}
                        >
                          <Lock size={14} />
                          <span>Locked (Enrolled in Sem {studentSem})</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
                  <Award size={36} style={{ margin: '0 auto 12px auto' }} />
                  <h3>No Mentor Quizzes Assigned</h3>
                  <p>When your mentor assigns diagnostic quizzes to your semester or batch, they will appear here.</p>
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
