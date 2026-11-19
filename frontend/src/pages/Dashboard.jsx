import { useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Award,
  BarChart3,
  Bookmark,
  BookOpen,
  Calendar,
  CalendarCheck,
  CalendarClock,
  Check,
  CheckCircle2,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  FileText,
  Filter,
  Flame,
  GraduationCap,
  Layers,
  Minus,
  Play,
  RotateCcw,
  Search,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  X,
  Zap
} from 'lucide-react';
import { api, getErrorMessage, unwrap } from '../services/api.js';
import { ErrorState, LoadingState } from '../components/ContentState.jsx';
import SubjectIcon from '../components/SubjectIcon.jsx';
import SubjectModal from '../components/SubjectModal.jsx';
import { firstName, listFrom, percentage } from '../utils/format.js';
import { semestersList, universityInfo } from '../data/curriculumData.js';
import { updateUser } from '../state/authSlice.js';
import './Dashboard.css';

export default function Dashboard() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user) || {};
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Interactive Chart & Table State
  const [chartMode, setChartMode] = useState('weekly'); // 'weekly' | 'subjects'
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [activityTab, setActivityTab] = useState('all'); // 'all' | 'lessons' | 'quizzes'
  const [activitySearch, setActivitySearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSubjectModal, setSelectedSubjectModal] = useState(null);
  const [workspaceTab, setWorkspaceTab] = useState('pending'); // 'pending' | 'bookmarks' | 'difficult' | 'notes' | 'achievements' | 'activity'

  // Next Semester Advancement State
  const [advancingSemester, setAdvancingSemester] = useState(false);
  const [advanceSuccessMessage, setAdvanceSuccessMessage] = useState('');
  const [advanceErrorMessage, setAdvanceErrorMessage] = useState('');
  const [showNextSemPreviewModal, setShowNextSemPreviewModal] = useState(false);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 5000);
    try {
      const response = await api.get('/dashboard/student');
      setData(unwrap(response));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      clearTimeout(safetyTimer);
      setLoading(false);
    }
  }, []);

  const [todayPlan, setTodayPlan] = useState(null);

  const loadTodayPlan = useCallback(async () => {
    try {
      const res = unwrap(await api.get('/study-plan/today'));
      setTodayPlan(res);
    } catch {}
  }, []);

  useEffect(() => {
    loadDashboard();
    loadTodayPlan();
  }, [loadDashboard, loadTodayPlan, user.semester]);

  const handleToggleTodayTask = async (taskId) => {
    try {
      setTodayPlan((prev) => {
        if (!prev?.todayTasks) return prev;
        const nextTasks = prev.todayTasks.map((t) =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        );
        return {
          ...prev,
          todayTasks: nextTasks,
          completedTasksCount: nextTasks.filter((t) => t.completed).length
        };
      });
      await api.post(`/study-plan/tasks/${taskId}/toggle`, {});
      await loadDashboard();
    } catch {}
  };

  // Semester & Academic Calculation
  const activeSemesterNumber = Number(user.semester || data?.student?.semester || 1);
  const currentSemesterPlan = semestersList.find((s) => s.semester === activeSemesterNumber) || semestersList[0];
  const semesterSubjects = currentSemesterPlan?.subjects || [];

  // Metrics Extraction
  const metrics = data?.metrics || {};
  const totalLessons = Number(metrics.semesterTotalLessons ?? metrics.totalLessons ?? data?.totalLessons ?? 0);
  const completedLessons = Number(metrics.semesterCompletedLessons ?? metrics.completedLessons ?? data?.completedLessons ?? 0);
  const progressPercent = percentage(metrics.semesterCompletionPercent ?? metrics.completionPercent ?? (totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0));
  
  // Semester Specific Progress & 75% Unlock Threshold
  const semesterTotalLessons = Number(metrics.semesterTotalLessons ?? totalLessons);
  const semesterCompletedLessons = Number(metrics.semesterCompletedLessons ?? completedLessons);
  const semesterCompletionPercent = percentage(metrics.semesterCompletionPercent ?? progressPercent);

  // Continue Learning Reference (Last Unfinished or Visited Lesson)
  const continueLesson = data?.continueLearning || data?.lastVisitedLesson || null;

  // Personalized Learning Hub & Streak Data
  const streak = data?.streak || { currentStreak: metrics.streakDays || 1, longestStreak: metrics.streakDays || 1 };
  const currentSubjectsWithProgress = data?.currentSubjects || [];
  const pendingLessonsList = data?.pendingLessons || [];
  const bookmarksList = data?.bookmarks || [];
  const difficultList = data?.difficultTopics || [];
  const notesList = data?.notes || [];
  const achievementsList = data?.achievements || [];
  const certificatesList = data?.certificates || [];
  const activitiesList = data?.activities || [];

  const dailyGoals = data?.dailyGoals || {
    targetLessons: 3,
    completedToday: 0,
    targetMinutes: 45,
    minutesStudiedToday: 0,
    percentComplete: 0
  };
  const weakSubjectsList = data?.weakSubjects || [];
  const assignmentsList = data?.assignments || [];
  const projectsList = data?.projects || [];
  const studentXP = Number(data?.student?.xp ?? metrics.xp ?? 0);
  const studentLevel = Math.floor(studentXP / 100) + 1;

  const nextSemesterNumber = activeSemesterNumber < 6 ? activeSemesterNumber + 1 : null;
  const nextSemesterPlan = nextSemesterNumber ? semestersList.find((s) => s.semester === nextSemesterNumber) : null;
  const isEligibleForNextSem = semesterCompletionPercent >= 75 || Boolean(metrics.canAdvanceSemester);

  const handleAdvanceToNextSemester = async () => {
    if (!nextSemesterNumber || advancingSemester) return;
    setAdvancingSemester(true);
    setAdvanceSuccessMessage('');
    setAdvanceErrorMessage('');
    try {
      const response = await api.patch('/profiles/me', { semester: nextSemesterNumber });
      const updatedProfile = unwrap(response)?.profile;
      if (updatedProfile) {
        dispatch(updateUser(updatedProfile));
      } else {
        dispatch(updateUser({ ...user, semester: nextSemesterNumber }));
      }
      setAdvanceSuccessMessage(`🎉 Outstanding! You have advanced to Semester ${nextSemesterNumber} (${nextSemesterPlan?.title || `Semester ${nextSemesterNumber}`})!`);
      await loadDashboard();
    } catch (err) {
      setAdvanceErrorMessage(getErrorMessage(err));
    } finally {
      setAdvancingSemester(false);
    }
  };
  
  const rawQuizAvg = metrics.averageQuizScore ?? data?.quizAverage;
  const quizAverage = rawQuizAvg != null ? percentage(rawQuizAvg) : null;
  const quizAttemptsCount = Number(metrics.quizAttempts ?? data?.recentQuizAttempts?.length ?? 0);

  // Activity Feed Formatting
  const rawProgress = listFrom(data?.recentProgress, 'recentProgress');
  const rawQuizzes = listFrom(data?.recentQuizAttempts, 'recentQuizAttempts');

  // Authentic historical quiz trend (only when at least 2 real attempts exist in backend data)
  const quizTrend = rawQuizzes.length >= 2
    ? (() => {
        const latest = Number(rawQuizzes[0]?.score ?? 0);
        const previous = Number(rawQuizzes[1]?.score ?? 0);
        const delta = latest - previous;
        return {
          delta,
          direction: delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat',
          label: delta > 0 ? `+${delta}% vs last quiz` : delta < 0 ? `${delta}% vs last quiz` : `0% vs last quiz`
        };
      })()
    : null;

  const passedQuizzesCount = rawQuizzes.filter((item) => Number(item?.score) >= 70).length;
  const remainingLessons = Math.max(0, totalLessons - completedLessons);

  // Weekly study activity mapped to days of the week
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyData = daysOfWeek.map((day, idx) => {
    const matchingLessons = rawProgress.filter((p) => {
      if (!p.updatedAt && !p.createdAt) return false;
      const d = new Date(p.updatedAt || p.createdAt).getDay();
      const dayIndex = d === 0 ? 6 : d - 1;
      return dayIndex === idx;
    });

    const matchingQuizzes = rawQuizzes.filter((q) => {
      if (!q.createdAt) return false;
      const d = new Date(q.createdAt).getDay();
      const dayIndex = d === 0 ? 6 : d - 1;
      return dayIndex === idx;
    });

    const lessonsCount = matchingLessons.length;
    const quizzesCount = matchingQuizzes.length;
    const avgScore = quizzesCount > 0
      ? Math.round(matchingQuizzes.reduce((acc, cur) => acc + (Number(cur.score) || 0), 0) / quizzesCount)
      : null;

    return {
      day,
      lessons: lessonsCount,
      quizzes: quizzesCount,
      avgScore,
      total: lessonsCount + quizzesCount
    };
  });

  // Subject competency data
  const subjectChartData = semesterSubjects.map((sub, idx) => {
    const topicsCount = sub.topics?.length || 5;
    const hasProgress = completedLessons > idx;
    const progressRate = hasProgress
      ? Math.min(100, Math.round(((idx + 1) / Math.max(1, semesterSubjects.length)) * 100))
      : 0;
    return {
      name: sub.name,
      code: sub.code || `BCA-${idx + 1}`,
      category: sub.category,
      topicsCount,
      rate: progressRate
    };
  });

  // Table activity data combining lessons and quizzes
  const allFormattedActivities = [
    ...rawProgress.map((item) => ({
      id: `lesson-${item._id}`,
      type: 'lesson',
      title: item.lessonId?.title || 'Interactive Course Lesson',
      category: 'Coursework Module',
      score: item.status === 'completed' ? 100 : null,
      status: item.status === 'completed' ? 'Completed' : 'In Progress',
      statusType: item.status === 'completed' ? 'success' : 'info',
      date: item.updatedAt ? new Date(item.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
      path: '/learning'
    })),
    ...rawQuizzes.map((item) => ({
      id: `quiz-${item._id}`,
      type: 'quiz',
      title: item.lessonId?.title || 'Module Assessment Quiz',
      category: 'Knowledge Check',
      score: item.score,
      status: Number(item.score) >= 70 ? 'Passed' : 'Needs Practice',
      statusType: Number(item.score) >= 70 ? 'success' : 'warning',
      date: item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
      path: '/quizzes'
    }))
  ];

  // Search and Tab Filtering
  const filteredActivities = allFormattedActivities.filter((item) => {
    const matchesTab = activityTab === 'all' || item.type === (activityTab === 'lessons' ? 'lesson' : 'quiz');
    const matchesQuery = activitySearch.trim() === '' ||
      item.title.toLowerCase().includes(activitySearch.toLowerCase()) ||
      item.category.toLowerCase().includes(activitySearch.toLowerCase()) ||
      item.status.toLowerCase().includes(activitySearch.toLowerCase());
    return matchesTab && matchesQuery;
  });

  // Pagination
  const PAGE_SIZE = 5;
  const totalPages = Math.max(1, Math.ceil(filteredActivities.length / PAGE_SIZE));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * PAGE_SIZE;
  const paginatedActivities = filteredActivities.slice(startIndex, startIndex + PAGE_SIZE);

  const lessonCountTotal = allFormattedActivities.filter((a) => a.type === 'lesson').length;
  const quizCountTotal = allFormattedActivities.filter((a) => a.type === 'quiz').length;

  if (loading && !data) {
    return (
      <div style={{ padding: '60px 0' }}>
        <LoadingState label="Preparing your academic dashboard…" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div style={{ padding: '40px 0' }}>
        <ErrorState message={error} onRetry={loadDashboard} />
      </div>
    );
  }

  return (
    <div className="modern-dashboard">
      {/* ====================================================================
          1. Welcoming Hero Banner
          ==================================================================== */}
      <section className="dashboard-hero-banner" aria-label="Welcome and learning overview">
        <div className="dashboard-hero-content">
          <div className="hero-pill-badge">
            <span className="hero-pill-dot" />
            <span>{universityInfo.program}</span>
          </div>

          <h1 className="dashboard-hero-title">
            Welcome back, {firstName(user.name)} 👋
          </h1>

          <p className="dashboard-hero-subtitle">
            You are enrolled in <strong>Semester {activeSemesterNumber}</strong>. Track your progress, explore active subjects, and complete quizzes to master your curriculum.
          </p>

          {continueLesson && (
            <div className="continue-learning-pill-box">
              <span className="continue-pill-tag">Next Up</span>
              <span className="continue-lesson-title">
                <strong>{continueLesson.subjectName || 'Coursework'}:</strong>{' '}
                {continueLesson.title || 'Next Lesson'}
              </span>
            </div>
          )}

          {/* Study Streak & Experience Stats */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', margin: '14px 0' }}>
            <div className="study-streak-indicator-card" style={{ flex: '1 1 200px' }}>
              <div className="streak-flame-circle">
                <Flame size={20} color="#f59e0b" />
              </div>
              <div className="streak-content">
                <strong>{streak.currentStreak || 1} Day Streak 🔥</strong>
                <span>
                  Longest: {streak.longestStreak || streak.currentStreak || 1} days · Active
                </span>
              </div>
            </div>

            <div className="study-streak-indicator-card" style={{ flex: '1 1 200px', background: 'rgba(255, 255, 255, 0.12)' }}>
              <div className="streak-flame-circle" style={{ background: 'rgba(234, 179, 8, 0.2)' }}>
                <Zap size={20} color="#facc15" />
              </div>
              <div className="streak-content">
                <strong>{studentXP} XP · Level {studentLevel} ⚡</strong>
                <span>
                  {100 - (studentXP % 100)} XP to next level milestone
                </span>
              </div>
            </div>
          </div>

          <div className="dashboard-hero-actions">
            <Link
              to={
                continueLesson
                  ? `/learning/${continueLesson.subjectCode || continueLesson.subjectId}?lesson=${continueLesson.lessonId}&open=true`
                  : '/learning'
              }
              className="hero-btn-primary"
            >
              <Play size={16} fill="currentColor" />
              <span>
                Continue Learning: {continueLesson ? continueLesson.unitNumber || 'Next Lesson' : 'Resume'}
              </span>
            </Link>
            <Link to="/curriculum" className="hero-btn-secondary">
              <BookOpen size={16} />
              <span>View Semester {activeSemesterNumber} Syllabus</span>
            </Link>
          </div>
        </div>

        <div className="dashboard-hero-art" aria-hidden="true">
          <div className="hero-art-glass-card">
            <div className="hero-art-icon-circle">
              <GraduationCap size={20} />
            </div>
            <div className="hero-art-card-text">
              <strong>Semester {activeSemesterNumber}</strong>
              <span>{semesterSubjects.length} Core Subjects Active</span>
            </div>
          </div>
          <div className="hero-art-glass-card" style={{ padding: '10px 14px' }}>
            <div className="hero-art-icon-circle" style={{ width: '28px', height: '28px' }}>
              <Sparkles size={16} />
            </div>
            <div className="hero-art-card-text">
              <strong>{universityInfo.institution}</strong>
              <span>Academic Year 2026</span>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. KPI Summary Statistics Cards (4 Cards)
          ==================================================================== */}
      <section className="dashboard-stats-grid" aria-label="Key Performance Indicators">
        {/* KPI 1: Enrolled Semester Progress */}
        <div className="modern-stat-card accent-primary">
          <div className="stat-card-header">
            <span className="stat-card-label">Semester {activeSemesterNumber} Progress</span>
            <div className="stat-card-icon-wrap primary" title={`Semester ${activeSemesterNumber} Completion`}>
              <Target size={20} />
            </div>
          </div>
          <div className="stat-card-value">{semesterCompletionPercent}%</div>
          <div className="stat-card-progress-bar">
            <div
              className="stat-card-progress-fill"
              style={{ width: `${Math.min(100, Math.max(0, semesterCompletionPercent))}%` }}
            />
          </div>
          <div className="stat-card-subtext">
            <span>{semesterCompletedLessons} of {semesterTotalLessons} lessons</span>
            <span className="stat-trend-tag neutral">
              {Math.max(0, semesterTotalLessons - semesterCompletedLessons) > 0
                ? `${Math.max(0, semesterTotalLessons - semesterCompletedLessons)} remaining`
                : 'Completed'}
            </span>
          </div>
        </div>

        {/* KPI 2: Quiz Average & Actual Historical Trend */}
        <div className="modern-stat-card accent-emerald">
          <div className="stat-card-header">
            <span className="stat-card-label">Quiz Score Average</span>
            <div className="stat-card-icon-wrap emerald" title="Assessment Performance">
              <Award size={20} />
            </div>
          </div>
          <div className="stat-card-value">
            {quizAverage != null ? `${quizAverage}%` : '—'}
          </div>
          <div className="stat-card-progress-bar">
            <div
              className="stat-card-progress-fill"
              style={{
                width: `${quizAverage != null ? Math.min(100, Math.max(0, quizAverage)) : 0}%`,
                background: 'linear-gradient(90deg, #10b981, #059669)'
              }}
            />
          </div>
          <div className="stat-card-subtext">
            <span>
              {quizAverage != null
                ? quizAverage >= 80
                  ? 'Proficient'
                  : quizAverage >= 60
                  ? 'Good standing'
                  : 'Needs practice'
                : 'No attempts yet'}
            </span>
            {quizTrend ? (
              <span className={`stat-trend-tag ${quizTrend.direction === 'up' ? 'positive' : quizTrend.direction === 'down' ? 'negative' : 'neutral'}`}>
                {quizTrend.direction === 'up' ? (
                  <TrendingUp size={11} />
                ) : quizTrend.direction === 'down' ? (
                  <TrendingDown size={11} />
                ) : (
                  <Minus size={11} />
                )}
                <span>{quizTrend.label}</span>
              </span>
            ) : (
              <span className="stat-trend-tag neutral">
                {rawQuizzes.length === 1 ? '1 attempt' : 'Baseline'}
              </span>
            )}
          </div>
        </div>

        {/* KPI 3: Quizzes Taken */}
        <div className="modern-stat-card accent-amber">
          <div className="stat-card-header">
            <span className="stat-card-label">Quizzes Completed</span>
            <div className="stat-card-icon-wrap amber" title="Assessment Checkpoints">
              <CheckSquare size={20} />
            </div>
          </div>
          <div className="stat-card-value">{quizAttemptsCount}</div>
          <div className="stat-card-progress-bar">
            <div
              className="stat-card-progress-fill"
              style={{
                width: `${Math.min(100, Math.max(0, quizAttemptsCount * 10))}%`,
                background: 'linear-gradient(90deg, #f59e0b, #d97706)'
              }}
            />
          </div>
          <div className="stat-card-subtext">
            <span>
              {quizAttemptsCount > 0 ? `${passedQuizzesCount} scored ≥ 70%` : 'No submissions'}
            </span>
            <span className="stat-trend-tag neutral">
              {quizAttemptsCount > 0 ? `${quizAttemptsCount} tested` : 'Ready to start'}
            </span>
          </div>
        </div>

        {/* KPI 4: Enrolled Semester */}
        <div className="modern-stat-card accent-sky">
          <div className="stat-card-header">
            <span className="stat-card-label">Academic Semester</span>
            <div className="stat-card-icon-wrap sky" title="Enrolled Term">
              <BookOpen size={20} />
            </div>
          </div>
          <div className="stat-card-value">Semester {activeSemesterNumber}</div>
          <div className="stat-card-progress-bar">
            <div
              className="stat-card-progress-fill"
              style={{
                width: `${(activeSemesterNumber / 6) * 100}%`,
                background: 'linear-gradient(90deg, #0284c7, #0369a1)'
              }}
            />
          </div>
          <div className="stat-card-subtext">
            <span>{semesterSubjects.length} Core subjects</span>
            <span className={`stat-trend-tag ${isEligibleForNextSem ? 'positive' : 'neutral'}`}>
              {isEligibleForNextSem && nextSemesterNumber
                ? `Sem ${nextSemesterNumber} Unlocked!`
                : `Year ${Math.ceil(activeSemesterNumber / 2)} of 3`}
            </span>
          </div>
        </div>
      </section>

      {/* ====================================================================
          Next Semester Option Banner (Displayed when >= 75% of current semester completed)
          ==================================================================== */}
      {isEligibleForNextSem && nextSemesterNumber && (
        <section className="next-semester-unlock-banner" aria-label="Next semester advancement">
          <div className="unlock-banner-sparkle-halo" aria-hidden="true" />

          <div className="unlock-banner-left">
            <div className="unlock-badge-pill">
              <Trophy size={14} className="trophy-bounce" />
              <span>75%+ Completed · Eligible for Next Semester</span>
            </div>

            <h2 className="unlock-banner-title">
              Advance to Semester {nextSemesterNumber} ({nextSemesterPlan?.shortTitle || `Semester ${nextSemesterNumber}`})
            </h2>

            <p className="unlock-banner-desc">
              Outstanding work, {firstName(user.name)}! You have completed <strong>{semesterCompletionPercent}%</strong> of your <strong>Semester {activeSemesterNumber}</strong> curriculum ({semesterCompletedLessons} of {semesterTotalLessons} lessons). You've surpassed the 75% milestone and unlocked access to <strong>Semester {nextSemesterNumber}</strong>.
            </p>

            <div className="unlock-progress-capsule">
              <div className="capsule-track">
                <div
                  className="capsule-fill"
                  style={{ width: `${Math.min(100, Math.max(75, semesterCompletionPercent))}%` }}
                />
              </div>
              <span className="capsule-text">{semesterCompletionPercent}% Current Semester Progress</span>
            </div>

            {advanceSuccessMessage && (
              <div className="unlock-banner-alert success">
                <CheckCircle2 size={16} />
                <span>{advanceSuccessMessage}</span>
              </div>
            )}

            {advanceErrorMessage && (
              <div className="unlock-banner-alert error">
                <AlertCircle size={16} />
                <span>{advanceErrorMessage}</span>
              </div>
            )}

            <div className="unlock-banner-actions">
              <button
                type="button"
                className="unlock-advance-btn"
                onClick={handleAdvanceToNextSemester}
                disabled={advancingSemester}
                title={`Advance your enrolled status to Semester ${nextSemesterNumber}`}
              >
                {advancingSemester ? (
                  <span>Switching to Semester {nextSemesterNumber}…</span>
                ) : (
                  <>
                    <GraduationCap size={18} />
                    <span>Go to Semester {nextSemesterNumber}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <button
                type="button"
                className="unlock-preview-btn"
                onClick={() => setShowNextSemPreviewModal(true)}
                title={`Preview Semester ${nextSemesterNumber} subjects`}
              >
                <BookOpen size={16} />
                <span>Preview Semester {nextSemesterNumber} Subjects</span>
              </button>
            </div>
          </div>

          <div className="unlock-banner-preview-card">
            <div className="preview-card-header">
              <span className="preview-tag">Upcoming Term</span>
              <strong>Semester {nextSemesterNumber}</strong>
            </div>
            <p className="preview-card-subtitle">{nextSemesterPlan?.subtitle || 'Next Academic Stage'}</p>
            <div className="preview-subjects-count">
              <Layers size={14} />
              <span>{nextSemesterPlan?.subjects?.length || 5} Core Subjects</span>
            </div>
            <ul className="preview-subject-pills">
              {nextSemesterPlan?.subjects?.slice(0, 3).map((sub) => (
                <li key={sub.id || sub.code}>
                  <CheckCircle2 size={12} style={{ color: '#10b981' }} />
                  <span>{sub.name}</span>
                </li>
              ))}
              {(nextSemesterPlan?.subjects?.length || 0) > 3 && (
                <li className="more-pill">
                  +{(nextSemesterPlan?.subjects?.length || 0) - 3} more subjects in syllabus
                </li>
              )}
            </ul>
          </div>
        </section>
      )}

      {isEligibleForNextSem && !nextSemesterNumber && (
        <section className="next-semester-unlock-banner" aria-label="Final semester completion">
          <div className="unlock-banner-sparkle-halo" aria-hidden="true" />
          <div className="unlock-banner-left">
            <div className="unlock-badge-pill" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
              <Award size={14} />
              <span>Final Semester Milestone · {semesterCompletionPercent}% Completed</span>
            </div>
            <h2 className="unlock-banner-title">
              Final Semester Completion Milestone Reached!
            </h2>
            <p className="unlock-banner-desc">
              Congratulations! You have completed <strong>{semesterCompletionPercent}%</strong> of your final semester (Semester 6) coursework. You are on track for your degree completion and final research thesis evaluation.
            </p>
            <div className="unlock-banner-actions">
              <Link to="/curriculum" className="unlock-advance-btn">
                <Trophy size={18} />
                <span>Review Capstone Curriculum</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ====================================================================
          3. Today's Personalized Study Planner Widget
          ==================================================================== */}
      <section className="dashboard-study-plan-banner" aria-label="Today's study plan">
        <div className="study-plan-banner-header">
          <div className="study-plan-header-title">
            <span className="study-plan-badge">
              <CalendarClock size={13} />
              <span>Personalized Study Plan</span>
            </span>
            <h3>Today's Study Agenda</h3>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Link to="/leaderboard" className="study-plan-view-all">
              <Trophy size={13} color="#f59e0b" />
              <span>Leaderboard &amp; Badges</span>
            </Link>
            <Link to="/planner" className="study-plan-view-all">
              <span>Full Planner</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Daily Study Goals Strip */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Target size={18} style={{ color: '#10b981' }} />
            <div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main, #f8fafc)' }}>
                Daily Goal: {dailyGoals.completedToday} of {dailyGoals.targetLessons} Lessons Completed
              </span>
              <span style={{ display: 'block', fontSize: '11.5px', color: 'var(--color-text-muted, #94a3b8)' }}>
                {dailyGoals.minutesStudiedToday} of {dailyGoals.targetMinutes} minutes studied today
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '180px' }}>
            <div style={{ flex: 1, height: '7px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${dailyGoals.percentComplete}%`,
                background: 'linear-gradient(90deg, #10b981, #059669)',
                borderRadius: '999px'
              }} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#10b981' }}>{dailyGoals.percentComplete}%</span>
          </div>
        </div>

        {/* Weak Subjects Revision Alert */}
        {weakSubjectsList.length > 0 && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle size={18} style={{ color: '#ef4444' }} />
              <div>
                <strong style={{ display: 'block', fontSize: '13px', color: '#f87171' }}>
                  Targeted Revision Recommended ({weakSubjectsList.length} Subject{weakSubjectsList.length > 1 ? 's' : ''})
                </strong>
                <span style={{ fontSize: '11.5px', color: 'var(--color-text-muted, #cbd5e1)' }}>
                  {weakSubjectsList.map(s => `${s.name} (${s.averageScore}%)`).join(', ')} — Review lessons and generate AI practice quizzes.
                </span>
              </div>
            </div>
            <Link
              to="/quizzes"
              style={{
                background: '#ef4444',
                color: '#fff',
                fontWeight: 600,
                fontSize: '11.5px',
                padding: '6px 12px',
                borderRadius: '6px',
                textDecoration: 'none'
              }}
            >
              Practice Quizzes
            </Link>
          </div>
        )}

        {todayPlan?.todayTasks?.length ? (
          <div className="dashboard-today-tasks-grid">
            {todayPlan.todayTasks.slice(0, 3).map((task) => (
              <div key={task.id} className={`dash-task-card ${task.completed ? 'completed' : ''}`}>
                <button
                  type="button"
                  className={`dash-task-check ${task.completed ? 'checked' : ''}`}
                  onClick={() => handleToggleTodayTask(task.id)}
                  aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                >
                  {task.completed && <Check size={12} />}
                </button>
                <div className="dash-task-body">
                  <span className="dash-task-type">
                    {task.taskType === 'revision'
                      ? 'Revision Session'
                      : task.taskType === 'milestone'
                      ? 'Milestone'
                      : 'Syllabus Lesson'}
                  </span>
                  <strong>{task.title}</strong>
                  <small>
                    {task.estimatedMinutes} mins · {task.subjectName}
                  </small>
                </div>
                {task.lessonId && (
                  <Link
                    to={`/learning/${task.subjectCode}?lesson=${task.lessonId}&open=true`}
                    className="dash-task-link"
                    title="Study now"
                  >
                    <Play size={12} fill="currentColor" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="dashboard-today-empty">
            <CheckCircle2 size={18} style={{ color: '#10b981' }} />
            <span>
              All scheduled tasks for today are complete! Visit the Study Planner to adjust your target date or review upcoming days.
            </span>
            <Link to="/planner" className="dash-plan-btn">
              Configure Schedule
            </Link>
          </div>
        )}
      </section>

      {/* ====================================================================
          Personalized Learning Hub (Pending Lessons, Bookmarks, Revision Deck, Notes, Certificates)
          ==================================================================== */}
      <section className="dashboard-card-section" style={{ marginTop: '20px' }}>
        <div className="section-top-header">
          <div className="section-top-header-info">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={20} color="var(--color-primary)" />
              Personalized Learning Hub
            </h2>
            <p>Access your pending lessons, bookmarked topics, revision deck, personal notes, and verified certificates.</p>
          </div>
        </div>

        {/* Workspace Mode Tabs */}
        <div className="workspace-tabs-bar">
          <button
            type="button"
            className={`workspace-tab-btn ${workspaceTab === 'pending' ? 'active' : ''}`}
            onClick={() => setWorkspaceTab('pending')}
          >
            <Clock3 size={15} />
            <span>Pending Lessons ({pendingLessonsList.length})</span>
          </button>

          <button
            type="button"
            className={`workspace-tab-btn ${workspaceTab === 'bookmarks' ? 'active' : ''}`}
            onClick={() => setWorkspaceTab('bookmarks')}
          >
            <Bookmark size={15} />
            <span>Bookmarks ({bookmarksList.length})</span>
          </button>

          <button
            type="button"
            className={`workspace-tab-btn ${workspaceTab === 'difficult' ? 'active' : ''}`}
            onClick={() => setWorkspaceTab('difficult')}
          >
            <AlertTriangle size={15} />
            <span>Revision Deck ({difficultList.length})</span>
          </button>

          <button
            type="button"
            className={`workspace-tab-btn ${workspaceTab === 'notes' ? 'active' : ''}`}
            onClick={() => setWorkspaceTab('notes')}
          >
            <FileText size={15} />
            <span>My Notes ({notesList.length})</span>
          </button>

          <button
            type="button"
            className={`workspace-tab-btn ${workspaceTab === 'achievements' ? 'active' : ''}`}
            onClick={() => setWorkspaceTab('achievements')}
          >
            <Award size={15} />
            <span>Certificates & Badges ({certificatesList.length + achievementsList.length})</span>
          </button>

          <button
            type="button"
            className={`workspace-tab-btn ${workspaceTab === 'activity' ? 'active' : ''}`}
            onClick={() => setWorkspaceTab('activity')}
          >
            <Sparkles size={15} />
            <span>Activity Timeline ({activitiesList.length})</span>
          </button>
        </div>

        {/* Tab 1: Pending Lessons */}
        {workspaceTab === 'pending' && (
          <div>
            {pendingLessonsList.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 8px' }} />
                <strong>All caught up!</strong>
                <p style={{ margin: '4px 0 0', fontSize: '13px' }}>
                  No pending lessons found in your current semester. Outstanding academic performance!
                </p>
              </div>
            ) : (
              <div className="pending-lessons-grid">
                {pendingLessonsList.map((p, idx) => (
                  <div key={p.lessonId || idx} className="pending-lesson-card">
                    <div className="pending-lesson-info">
                      <span className="pending-lesson-subject">
                        {p.unitNumber} • {p.subjectName || p.subjectCode}
                      </span>
                      <strong className="pending-lesson-title">{p.title}</strong>
                    </div>
                    <Link
                      to={`/learning/${p.subjectCode}?lesson=${p.lessonId}&open=true`}
                      className="button button-primary button-small"
                      style={{ flexShrink: 0 }}
                    >
                      <Play size={12} fill="currentColor" />
                      <span>Study</span>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Bookmarks */}
        {workspaceTab === 'bookmarks' && (
          <div className="workspace-items-list">
            {bookmarksList.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Bookmark size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                <strong>No bookmarked lessons yet</strong>
                <p style={{ margin: '4px 0 0', fontSize: '13px' }}>
                  Click the bookmark ribbon on any lesson in your Subject Learning page to save it for quick access.
                </p>
              </div>
            ) : (
              bookmarksList.map((bm, idx) => (
                <div key={bm.lessonId || idx} className="workspace-item-row">
                  <div>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#8b5cf6' }}>
                      {bm.unitNumber} • {bm.subjectName || bm.subjectCode}
                    </span>
                    <h4 style={{ margin: '2px 0 0', fontSize: '14px', fontWeight: 700 }}>
                      {bm.lessonTitle || bm.lessonId}
                    </h4>
                  </div>
                  <Link
                    to={`/learning/${bm.subjectCode}?lesson=${bm.lessonId}&open=true`}
                    className="button button-secondary button-small"
                  >
                    <span>Open Lesson</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Difficult Topics Revision Deck */}
        {workspaceTab === 'difficult' && (
          <div className="workspace-items-list">
            {difficultList.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 8px' }} />
                <strong>Revision deck is clear!</strong>
                <p style={{ margin: '4px 0 0', fontSize: '13px' }}>
                  When encountering challenging formulas or algorithms, click "Flag Difficult" to review them here.
                </p>
              </div>
            ) : (
              difficultList.map((d, idx) => (
                <div key={d.lessonId || idx} className="workspace-item-row" style={{ borderLeft: '3px solid #f59e0b' }}>
                  <div>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#d97706' }}>
                      {d.unitNumber} • {d.subjectName || d.subjectCode} • Flagged for Revision
                    </span>
                    <h4 style={{ margin: '2px 0 0', fontSize: '14px', fontWeight: 700 }}>
                      {d.lessonTitle || d.lessonId}
                    </h4>
                  </div>
                  <Link
                    to={`/learning/${d.subjectCode}?lesson=${d.lessonId}&open=true`}
                    className="button button-secondary button-small"
                    style={{ borderColor: '#f59e0b', color: '#b45309' }}
                  >
                    <span>Revise Now</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 4: My Personal Notes */}
        {workspaceTab === 'notes' && (
          <div className="workspace-items-list">
            {notesList.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <FileText size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                <strong>No personal notes recorded yet</strong>
                <p style={{ margin: '4px 0 0', fontSize: '13px' }}>
                  Write notes directly inside any lesson view to build your personal knowledge base.
                </p>
              </div>
            ) : (
              notesList.map((n, idx) => (
                <div key={n.lessonId || idx} className="workspace-item-row">
                  <div style={{ maxWidth: '80%' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--color-primary)' }}>
                      {n.subjectName || n.subjectCode} • {n.lessonTitle || n.lessonId}
                    </span>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.45, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      "{n.note}"
                    </p>
                  </div>
                  <Link
                    to={`/learning/${n.subjectCode}?lesson=${n.lessonId}&open=true`}
                    className="button button-secondary button-small"
                  >
                    <span>View Notes</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 5: Certificates & Badges */}
        {workspaceTab === 'achievements' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Certificates */}
            {certificatesList.length > 0 && (
              <div>
                <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: '#b45309', margin: '0 0 10px' }}>
                  Verified Subject Completion Certificates ({certificatesList.length})
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                  {certificatesList.map((cert, idx) => (
                    <div key={cert.certificateId || idx} className="achievement-badge-card" style={{ border: '1.5px solid rgba(245, 158, 11, 0.3)', background: 'rgba(245, 158, 11, 0.04)' }}>
                      <div className="achievement-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#b45309' }}>
                        <Award size={20} />
                      </div>
                      <div>
                        <strong style={{ fontSize: '14px', color: '#92400e' }}>{cert.subjectName}</strong>
                        <div style={{ fontSize: '12px', color: '#b45309' }}>
                          ID: {cert.certificateId} • Grade: {cert.grade || 'A+'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements */}
            <div>
              <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-muted)', margin: '0 0 10px' }}>
                Academic Badges & Milestones
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                {achievementsList.length === 0 ? (
                  <div style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '13px' }}>
                    Complete lessons and quizzes to unlock achievement badges!
                  </div>
                ) : (
                  achievementsList.map((ach, idx) => (
                    <div key={ach.id || idx} className="achievement-badge-card">
                      <div className="achievement-icon-wrap">
                        <Sparkles size={18} />
                      </div>
                      <div>
                        <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>{ach.title}</strong>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {ach.description}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Activity History Timeline */}
        {workspaceTab === 'activity' && (
          <div className="workspace-items-list">
            {activitiesList.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Clock3 size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                <strong>No activity logged yet</strong>
                <p style={{ margin: '4px 0 0', fontSize: '13px' }}>
                  Your study actions, completions, and notes will automatically create a chronological timeline here.
                </p>
              </div>
            ) : (
              activitiesList.map((act, idx) => (
                <div key={act._id || idx} className="workspace-item-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>{act.title}</strong>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {act.description || (act.subjectName ? `Course: ${act.subjectName}` : '')}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {act.createdAt ? new Date(act.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </section>

      {/* ====================================================================
          4. Main Content Split Grid
          ==================================================================== */}
      <div className="dashboard-main-grid">
        {/* Left Column (Semester Subjects & Activity Feed) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Section A: Semester Subjects At a Glance */}
          <section className="dashboard-card-section" aria-label="Current semester subjects">
            <div className="section-top-header">
              <div className="section-top-header-info">
                <h2>{currentSemesterPlan?.title || `Semester ${activeSemesterNumber} Subjects`}</h2>
                <p>Official BCA curriculum subjects for your current semester.</p>
              </div>
              <Link to="/curriculum" className="section-header-link">
                <span>View Full Syllabus</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="semester-subjects-mini-grid">
              {semesterSubjects.map((subject) => {
                const subProg = currentSubjectsWithProgress.find((s) => s.code === subject.code);
                const pct = subProg ? subProg.percent : 0;
                const completedCount = subProg ? subProg.completed : 0;
                const totalCount = subProg ? subProg.total : 16;
                const isDone = pct === 100;

                return (
                  <div
                    key={subject.id}
                    className="dashboard-subject-item"
                    onClick={() => setSelectedSubjectModal(subject)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedSubjectModal(subject);
                      }
                    }}
                    title={`View course overview for ${subject.name}`}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="subject-item-topbar">
                      <div className="subject-item-icon-box">
                        <SubjectIcon iconName={subject.iconName} size={18} />
                      </div>
                      {subject.code && (
                        <span className="subject-item-code-badge">{subject.code}</span>
                      )}
                    </div>
                    <h3 className="subject-item-name">{subject.name}</h3>
                    <p className="subject-item-desc">{subject.description}</p>

                    {/* Progress Bar & Metric */}
                    <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', fontWeight: 600 }}>
                        <span style={{ color: 'var(--text-muted)' }}>
                          {completedCount} of {totalCount} Lessons
                        </span>
                        <span style={{ color: isDone ? '#10b981' : 'var(--color-primary)' }}>
                          {pct}%
                        </span>
                      </div>
                      <div style={{ height: '4px', background: 'var(--bg-hover)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${pct}%`,
                            background: isDone ? '#10b981' : 'var(--color-primary)',
                            transition: 'width 0.3s ease'
                          }}
                        />
                      </div>
                    </div>

                    <div className="subject-item-footer" style={{ marginTop: '12px' }}>
                      <span className="subject-item-category">{subject.category}</span>
                      <Link
                        to={`/learning/${subject.code}`}
                        onClick={(e) => e.stopPropagation()}
                        className="button button-ghost button-small"
                        style={{ fontSize: '12px', padding: '4px 8px', gap: '4px' }}
                      >
                        <span>Study Course</span>
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section B: Academic Momentum & Performance Chart */}
          <section className="dashboard-card-section" aria-label="Performance analytics chart">
            <div className="chart-header-row">
              <div className="section-top-header-info">
                <h2>Academic Momentum & Study Trends</h2>
                <p>Visual analytics of your active semester study cadence and performance.</p>
              </div>

              {/* Chart Mode Toggles */}
              <div className="chart-mode-toggles">
                <button
                  type="button"
                  className={`chart-mode-btn ${chartMode === 'weekly' ? 'active' : ''}`}
                  onClick={() => setChartMode('weekly')}
                >
                  <BarChart3 size={13} style={{ display: 'inline', marginRight: '5px' }} />
                  <span>Weekly Cadence</span>
                </button>
                <button
                  type="button"
                  className={`chart-mode-btn ${chartMode === 'subjects' ? 'active' : ''}`}
                  onClick={() => setChartMode('subjects')}
                >
                  <Layers size={13} style={{ display: 'inline', marginRight: '5px' }} />
                  <span>Subject Mastery</span>
                </button>
              </div>
            </div>

            {/* Chart Legends */}
            <div className="chart-legend-row">
              {chartMode === 'weekly' ? (
                <>
                  <div className="chart-legend-item">
                    <span className="legend-dot lessons" />
                    <span>Completed Lessons</span>
                  </div>
                  <div className="chart-legend-item">
                    <span className="legend-dot quizzes" />
                    <span>Quiz Assessments</span>
                  </div>
                  <div className="chart-legend-item">
                    <span className="legend-dot score" />
                    <span>Score Average (%)</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="chart-legend-item">
                    <span className="legend-dot lessons" />
                    <span>Coursework Progress</span>
                  </div>
                  <div className="chart-legend-item">
                    <span className="legend-dot score" />
                    <span>Curriculum Units</span>
                  </div>
                </>
              )}
            </div>

            {/* Responsive Vector Chart */}
            <div className="chart-svg-container">
              {hoveredPoint && (
                <div className="chart-tooltip-floating">
                  <Activity size={13} style={{ color: '#38bdf8' }} />
                  <span>{hoveredPoint.label}: {hoveredPoint.subtext}</span>
                </div>
              )}

              <svg
                className="modern-chart-svg"
                viewBox="0 0 620 170"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="lessonGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7864c8" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#5d4aa7" stopOpacity="0.75" />
                  </linearGradient>
                  <linearGradient id="quizGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#059669" stopOpacity="0.75" />
                  </linearGradient>
                  <linearGradient id="subjectGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0284c7" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#0369a1" stopOpacity="0.7" />
                  </linearGradient>
                </defs>

                {/* Grid guidelines */}
                <line x1="30" y1="20" x2="610" y2="20" className="chart-grid-line" />
                <line x1="30" y1="58" x2="610" y2="58" className="chart-grid-line" />
                <line x1="30" y1="96" x2="610" y2="96" className="chart-grid-line" />
                <line x1="30" y1="134" x2="610" y2="134" className="chart-grid-line" />

                {/* Y-Axis scale labels */}
                <text x="5" y="24" className="chart-axis-label">100%</text>
                <text x="10" y="62" className="chart-axis-label">75%</text>
                <text x="10" y="100" className="chart-axis-label">50%</text>
                <text x="10" y="138" className="chart-axis-label">25%</text>

                {/* Chart Mode 1: Weekly Cadence Bars */}
                {chartMode === 'weekly' &&
                  weeklyData.map((item, idx) => {
                    const groupWidth = 72;
                    const groupX = 45 + idx * groupWidth;
                    // Max height is 114px (from y=20 to y=134)
                    const lessonH = item.lessons > 0 ? Math.min(114, Math.max(12, item.lessons * 28)) : 6;
                    const quizH = item.quizzes > 0 ? Math.min(114, Math.max(12, item.quizzes * 32)) : 6;
                    const barYLesson = 134 - lessonH;
                    const barYQuiz = 134 - quizH;

                    return (
                      <g
                        key={item.day}
                        className="chart-bar-group"
                        onMouseEnter={() =>
                          setHoveredPoint({
                            label: item.day,
                            subtext: `${item.lessons} lessons, ${item.quizzes} quizzes${
                              item.avgScore != null ? ` (avg ${item.avgScore}%)` : ''
                            }`
                          })
                        }
                        onMouseLeave={() => setHoveredPoint(null)}
                      >
                        {/* Lesson bar */}
                        <rect
                          x={groupX}
                          y={barYLesson}
                          width="16"
                          height={lessonH}
                          fill="url(#lessonGradient)"
                          rx="4"
                          className="chart-bar-lesson"
                        />
                        {/* Quiz bar */}
                        <rect
                          x={groupX + 20}
                          y={barYQuiz}
                          width="16"
                          height={quizH}
                          fill="url(#quizGradient)"
                          rx="4"
                          className="chart-bar-quiz"
                        />
                        {/* Day label */}
                        <text
                          x={groupX + 18}
                          y="156"
                          textAnchor="middle"
                          className="chart-axis-label"
                          style={{ fontWeight: 600 }}
                        >
                          {item.day}
                        </text>
                      </g>
                    );
                  })}

                {/* Chart Mode 2: Subject Mastery Bars */}
                {chartMode === 'subjects' &&
                  subjectChartData.map((sub, idx) => {
                    const barW = Math.floor(540 / Math.max(1, subjectChartData.length));
                    const barX = 45 + idx * barW;
                    const rateH = Math.min(114, Math.max(14, (sub.rate / 100) * 114));
                    const barY = 134 - rateH;

                    return (
                      <g
                        key={sub.code}
                        className="chart-bar-group"
                        onMouseEnter={() =>
                          setHoveredPoint({
                            label: sub.code,
                            subtext: `${sub.name} · ${sub.topicsCount} units`
                          })
                        }
                        onMouseLeave={() => setHoveredPoint(null)}
                      >
                        <rect
                          x={barX + 8}
                          y={barY}
                          width={Math.max(18, barW - 16)}
                          height={rateH}
                          fill="url(#subjectGradient)"
                          rx="4"
                          className="chart-bar-subject"
                        />
                        <text
                          x={barX + barW / 2}
                          y="156"
                          textAnchor="middle"
                          className="chart-axis-label"
                          style={{ fontWeight: 600, fontSize: '9px' }}
                        >
                          {sub.code.length > 8 ? sub.code.slice(0, 7) + '…' : sub.code}
                        </text>
                      </g>
                    );
                  })}
              </svg>
            </div>
          </section>

          {/* Section C: Modern Interactive Activity Table */}
          <section className="dashboard-card-section" aria-label="Recent activity table">
            <div className="section-top-header">
              <div className="section-top-header-info">
                <h2>Learning Progress & Assessment History</h2>
                <p>Complete ledger of your module progressions, quiz scores, and verification checkpoints.</p>
              </div>
              <Link to="/progress" className="section-header-link">
                <span>Detailed Analytics</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Table Toolbar: Search and Filter Tabs */}
            <div className="table-toolbar-row">
              <div className="table-search-box">
                <Search size={15} style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="table-search-input"
                  placeholder="Filter by title, module, or status…"
                  value={activitySearch}
                  onChange={(e) => {
                    setActivitySearch(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div className="activity-filter-tabs">
                <button
                  type="button"
                  className={`activity-tab-btn ${activityTab === 'all' ? 'active' : ''}`}
                  onClick={() => {
                    setActivityTab('all');
                    setCurrentPage(1);
                  }}
                >
                  All ({allFormattedActivities.length})
                </button>
                <button
                  type="button"
                  className={`activity-tab-btn ${activityTab === 'lessons' ? 'active' : ''}`}
                  onClick={() => {
                    setActivityTab('lessons');
                    setCurrentPage(1);
                  }}
                >
                  Lessons ({lessonCountTotal})
                </button>
                <button
                  type="button"
                  className={`activity-tab-btn ${activityTab === 'quizzes' ? 'active' : ''}`}
                  onClick={() => {
                    setActivityTab('quizzes');
                    setCurrentPage(1);
                  }}
                >
                  Quizzes ({quizCountTotal})
                </button>
              </div>
            </div>

            {/* Modern Table or Empty State */}
            {paginatedActivities.length > 0 ? (
              <>
                <div className="modern-table-responsive-wrapper">
                  <table className="modern-dashboard-table">
                    <thead>
                      <tr>
                        <th className="modern-table-header-cell">Activity / Module</th>
                        <th className="modern-table-header-cell">Type</th>
                        <th className="modern-table-header-cell">Date</th>
                        <th className="modern-table-header-cell">Score / Result</th>
                        <th className="modern-table-header-cell">Status</th>
                        <th className="modern-table-header-cell" style={{ textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedActivities.map((item) => (
                        <tr key={item.id} className="modern-table-row">
                          <td className="modern-table-cell primary">
                            <div className="activity-item-col">
                              <div className={`activity-type-icon ${item.type}`}>
                                {item.type === 'lesson' ? (
                                  <BookOpen size={16} />
                                ) : (
                                  <Trophy size={16} />
                                )}
                              </div>
                              <div className="activity-text-info">
                                <strong>{item.title}</strong>
                                <span>{item.category}</span>
                              </div>
                            </div>
                          </td>
                          <td className="modern-table-cell">
                            <span className="subject-item-code-badge" style={{ textTransform: 'uppercase' }}>
                              {item.type}
                            </span>
                          </td>
                          <td className="modern-table-cell" style={{ whiteSpace: 'nowrap' }}>
                            {item.date}
                          </td>
                          <td className="modern-table-cell">
                            {item.score != null ? (
                              <strong style={{ color: Number(item.score) >= 70 ? '#059669' : '#d97706' }}>
                                {item.score}%
                              </strong>
                            ) : (
                              <span>100% complete</span>
                            )}
                          </td>
                          <td className="modern-table-cell">
                            <span className={`table-status-badge ${item.statusType}`}>
                              <span
                                style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  background: 'currentColor'
                                }}
                              />
                              <span>{item.status}</span>
                            </span>
                          </td>
                          <td className="modern-table-cell" style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <Link to={item.path} className="table-action-link">
                              <span>Continue</span>
                              <ArrowRight size={13} />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="table-pagination-row">
                  <span>
                    Showing {startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, filteredActivities.length)} of {filteredActivities.length} activities
                  </span>
                  <div className="pagination-controls">
                    <button
                      type="button"
                      className="pagination-btn"
                      disabled={validCurrentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      aria-label="Previous page"
                    >
                      <ChevronLeft size={14} />
                      <span>Prev</span>
                    </button>
                    <span className="pagination-page-indicator">
                      {validCurrentPage} / {totalPages}
                    </span>
                    <button
                      type="button"
                      className="pagination-btn"
                      disabled={validCurrentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      aria-label="Next page"
                    >
                      <span>Next</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="dashboard-empty-state">
                <div className="empty-state-icon-box">
                  <Sparkles size={24} />
                </div>
                <h3>{activitySearch ? 'No matching activities found' : 'No recent activity yet'}</h3>
                <p>
                  {activitySearch
                    ? `No learning or quiz records match your query "${activitySearch}".`
                    : `Start your first lesson in Semester ${activeSemesterNumber} or complete a quiz to see your live learning momentum here.`}
                </p>
                {activitySearch ? (
                  <button
                    type="button"
                    className="empty-state-action-btn"
                    onClick={() => {
                      setActivitySearch('');
                      setActivityTab('all');
                    }}
                  >
                    <span>Clear Search &amp; Filters</span>
                  </button>
                ) : (
                  <Link to="/learning" className="empty-state-action-btn">
                    <span>Start a Lesson</span>
                    <ArrowRight size={14} />
                  </Link>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Right Column (Recommendations & Academic Program Card) */}
        <div className="dashboard-side-column">
          {/* Recommended Next Steps */}
          <section className="dashboard-card-section" aria-label="Personalized study recommendations">
            <div className="section-top-header">
              <div className="section-top-header-info">
                <h2>Recommended Next Steps</h2>
                <p>Curated actions to keep your academic momentum going.</p>
              </div>
            </div>

            <div className="study-recommendation-list">
              <Link to="/learning" className="recommendation-card-row">
                <div className="rec-card-icon-box indigo">
                  <Play size={18} fill="currentColor" />
                </div>
                <div className="rec-card-content">
                  <strong>Continue Interactive Lessons</strong>
                  <span>Resume computing topics in your current semester plan.</span>
                </div>
                <ArrowRight size={16} className="rec-card-arrow" />
              </Link>

              <Link to="/quizzes" className="recommendation-card-row">
                <div className="rec-card-icon-box emerald">
                  <CheckSquare size={18} />
                </div>
                <div className="rec-card-content">
                  <strong>Take a Knowledge Check</strong>
                  <span>Reinforce programming logic and database concepts.</span>
                </div>
                <ArrowRight size={16} className="rec-card-arrow" />
              </Link>

              <Link to="/curriculum" className="recommendation-card-row">
                <div className="rec-card-icon-box amber">
                  <BookOpen size={18} />
                </div>
                <div className="rec-card-content">
                  <strong>Review Course Syllabus</strong>
                  <span>Explore units, learning outcomes, and subject codes.</span>
                </div>
                <ArrowRight size={16} className="rec-card-arrow" />
              </Link>
            </div>
          </section>

          {/* Assignments & Capstone Projects */}
          <section className="dashboard-card-section" aria-label="Academic deliverables">
            <div className="section-top-header">
              <div className="section-top-header-info">
                <h2>Assignments &amp; Projects</h2>
                <p>Term deliverables and practical milestones.</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {assignmentsList.slice(0, 2).map((asg) => (
                <div key={asg.id} style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: 'var(--color-card-subtle, rgba(255,255,255,0.03))',
                  border: '1px solid var(--color-border-subtle, rgba(255,255,255,0.08))',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '12.5px', color: 'var(--color-text-main, #f8fafc)' }}>
                      {asg.title}
                    </strong>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted, #94a3b8)' }}>
                      {asg.subject} · {asg.totalMarks} Marks
                    </span>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    textTransform: 'capitalize',
                    background: asg.status === 'submitted' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: asg.status === 'submitted' ? '#10b981' : '#f59e0b'
                  }}>
                    {asg.status}
                  </span>
                </div>
              ))}
              {projectsList.slice(0, 1).map((prj) => (
                <div key={prj.id} style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: 'var(--color-card-subtle, rgba(255,255,255,0.03))',
                  border: '1px solid var(--color-border-subtle, rgba(255,255,255,0.08))',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '12.5px', color: 'var(--color-text-main, #f8fafc)' }}>
                      {prj.title}
                    </strong>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted, #94a3b8)' }}>
                      {prj.weightage} · {prj.description}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    textTransform: 'capitalize',
                    background: prj.status === 'active' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                    color: prj.status === 'active' ? '#3b82f6' : '#94a3b8'
                  }}>
                    {prj.status}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Academic Milestone & Degree Overview Card */}
          <div className="milestone-feature-card">
            <div className="milestone-badge-top">
              <Sparkles size={14} />
              <span>Program Benchmark</span>
            </div>
            <h4>BCA (Hons. with Research)</h4>
            <p>
              Your curriculum integrates industry-relevant computing, modern web architectures, agile processes, and AI engineering across 6 semesters.
            </p>

            <div className="milestone-points-list">
              <div className="milestone-point-item">
                <CheckCircle2 size={14} style={{ color: 'var(--color-primary)' }} />
                <span>29 Total Curriculum Subjects</span>
              </div>
              <div className="milestone-point-item">
                <CheckCircle2 size={14} style={{ color: 'var(--color-primary)' }} />
                <span>Continuous Assessment & Grading</span>
              </div>
              <div className="milestone-point-item">
                <CheckCircle2 size={14} style={{ color: 'var(--color-primary)' }} />
                <span>Industry Capstone & Research Project</span>
              </div>
            </div>

            <Link
              to="/curriculum"
              style={{
                marginTop: '10px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12.5px',
                fontWeight: 700,
                color: 'var(--color-primary)',
                textDecoration: 'none'
              }}
            >
              <span>Explore All 6 Semesters</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Course Overview Dialog / Modal */}
      {selectedSubjectModal && (
        <SubjectModal
          subject={selectedSubjectModal}
          semester={activeSemesterNumber}
          colors={{
            primary: '#7864c8',
            primaryDark: '#5d4aa7',
            light: 'rgba(120, 100, 200, 0.12)'
          }}
          onClose={() => setSelectedSubjectModal(null)}
        />
      )}

      {/* Next Semester Preview Modal */}
      {showNextSemPreviewModal && nextSemesterPlan && (
        <div className="modal-backdrop" onClick={() => setShowNextSemPreviewModal(false)}>
          <div className="next-sem-preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="next-sem-modal-header">
              <div>
                <span className="hero-pill-badge" style={{ marginBottom: '6px' }}>Upcoming Curriculum</span>
                <h2>{nextSemesterPlan.title}</h2>
                <p>{nextSemesterPlan.subtitle}</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowNextSemPreviewModal(false)}
                aria-label="Close preview modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="next-sem-modal-body">
              <div className="preview-subjects-grid">
                {nextSemesterPlan.subjects.map((sub) => (
                  <div key={sub.id || sub.code} className="preview-subject-card">
                    <div className="preview-subject-card-header">
                      <div className="subject-item-icon-box">
                        <SubjectIcon iconName={sub.iconName} size={18} />
                      </div>
                      <span className="subject-item-code-badge">{sub.code}</span>
                    </div>
                    <h4>{sub.name}</h4>
                    <p>{sub.description}</p>
                    <span className="subject-item-category">{sub.category}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="next-sem-modal-footer">
              <button
                type="button"
                className="hero-btn-secondary"
                onClick={() => setShowNextSemPreviewModal(false)}
              >
                Close Preview
              </button>
              <button
                type="button"
                className="unlock-advance-btn"
                onClick={() => {
                  setShowNextSemPreviewModal(false);
                  handleAdvanceToNextSemester();
                }}
                disabled={advancingSemester}
              >
                <GraduationCap size={18} />
                <span>Advance to Semester {nextSemesterNumber} Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
