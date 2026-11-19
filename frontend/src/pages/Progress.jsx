import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  AlertCircle,
  ArrowRight,
  Award,
  BookCheck,
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Layers,
  ListChecks,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, getErrorMessage, unwrap } from '../services/api.js';
import { EmptyState, ErrorState, LoadingState } from '../components/ContentState.jsx';
import { listFrom, percentage } from '../utils/format.js';
import './Quizzes.css';

export default function Progress() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 5000);
    try {
      const [progressResponse, dashboardResponse, quizAnalyticsResponse] = await Promise.all([
        api.get('/progress/me'),
        api.get('/dashboard/student'),
        api.get('/quizzes/analytics').catch(() => ({ data: { data: null } }))
      ]);
      setData({
        ...unwrap(progressResponse),
        dashboard: unwrap(dashboardResponse),
        quizAnalytics: unwrap(quizAnalyticsResponse)
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      clearTimeout(safetyTimer);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const user = useSelector((state) => state.auth.user) || {};
  const studentSem = Number(user.semester || data?.dashboard?.student?.semester || 1);

  const dashboardMetrics = data?.dashboard?.metrics || {};
  const overall = percentage(
    dashboardMetrics.semesterCompletionPercent ??
    dashboardMetrics.completionPercent ??
    data?.overallProgress ??
    data?.overall ??
    0
  );
  const lessonProgress = listFrom(data?.progress, 'progress');
  const attempts = Number(dashboardMetrics.quizAttempts ?? 0);
  const quizAverage = dashboardMetrics.averageQuizScore == null ? null : percentage(dashboardMetrics.averageQuizScore);
  const completed = Number(dashboardMetrics.semesterCompletedLessons ?? dashboardMetrics.completedLessons ?? lessonProgress.filter((item) => item.status === 'completed').length);
  const total = Number(dashboardMetrics.semesterTotalLessons ?? dashboardMetrics.totalLessons ?? 0);

  // Performance Analytics from AI Quiz and Assessment Engine
  const quizAnalytics = data?.quizAnalytics || {};
  const totalQuizzesAttempted = quizAnalytics.totalQuizzes ?? attempts;
  const averageQuizScore = quizAnalytics.averageScore ?? (dashboardMetrics.averageQuizScore != null ? Math.round(dashboardMetrics.averageQuizScore) : 0);
  const highestQuizScore = quizAnalytics.highestScore ?? 0;
  const topicStrengths = quizAnalytics.topicStrengths || [];
  const topicWeaknesses = quizAnalytics.topicWeaknesses || [];
  const subjectsRequiringRevision = quizAnalytics.subjectsRequiringRevision || [];
  const previousQuizAttempts = quizAnalytics.previousAttempts || listFrom(data?.dashboard?.recentQuizAttempts, 'recentQuizAttempts');

  const activities = [
    ...lessonProgress.map((item) => ({
      id: `lesson-${item._id}`,
      type: 'lesson',
      title: item.lessonId?.title || 'Lesson module',
      subject: item.status === 'completed' ? 'Lesson completed' : 'Lesson in progress',
      date: item.completedAt ? new Date(item.completedAt).toLocaleDateString() : 'Recent'
    })),
    ...previousQuizAttempts.map((item) => ({
      id: `quiz-${item.id || item._id}`,
      type: 'quiz',
      title: item.title || item.lessonTitle || 'Quiz Assessment',
      subject: `Quiz Score: ${item.score}% (${item.correctCount || 0}/${item.totalQuestions || 10} correct)`,
      date: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'
    }))
  ].slice(0, 8);

  return (
    <div className="content-page">
      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <span className="eyebrow">Academic Learning Progress & Analytics</span>
          <h1>My Learning Progress</h1>
          <p>
            Track your semester milestones, module completions, assessment scores, and AI quiz performance.
          </p>
        </div>
        <div className="heading-illustration blue-illustration">
          <TrendingUp size={24} />
        </div>
      </div>

      {loading ? (
        <LoadingState label="Putting your learning analytics together…" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <>
          {/* Progress Hero Banner */}
          <section className="progress-hero">
            <div className="progress-hero-copy">
              <span className="eyebrow">CONTINUOUS LEARNING MOMENTUM</span>
              <h2>Building Academic Mastery Every Day</h2>
              <p>
                Every lesson studied and AI quiz answered reinforces your computing foundations and builds mastery toward your degree.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Link className="button button-light" to="/learning">
                  <span>Continue Learning</span>
                  <ArrowRight size={15} />
                </Link>
                <Link
                  className="button button-secondary"
                  to="/quizzes?tab=ai"
                  style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)' }}
                >
                  <Sparkles size={14} />
                  <span>Generate AI Quiz</span>
                </Link>
              </div>
            </div>
            <div className="progress-ring" style={{ '--progress': `${overall}%` }}>
              <div>
                <strong>
                  {overall}
                  <span>%</span>
                </strong>
                <small>SEM {studentSem}</small>
              </div>
            </div>
          </section>

          {/* Core Milestone Stats */}
          <section className="progress-stats">
            <ProgressMetric
              icon={BookCheck}
              label="Coursework Completed"
              value={`${completed}${total ? ` / ${total}` : ''}`}
              detail={`Semester ${studentSem} verified lesson modules`}
              color="lavender"
            />
            <ProgressMetric
              icon={CheckCircle2}
              label="Average Quiz Score"
              value={averageQuizScore != null ? `${averageQuizScore}%` : '—'}
              detail={`${totalQuizzesAttempted} total attempt${totalQuizzesAttempted === 1 ? '' : 's'}`}
              color="sage"
            />
            <ProgressMetric
              icon={Target}
              label="Quizzes Attempted"
              value={totalQuizzesAttempted}
              detail="Checkpoints to verify knowledge"
              color="peach"
            />
          </section>

          {/* -------------------------------------------------------------
              AI Quiz Performance Analytics Dashboard
              ------------------------------------------------------------- */}
          <section className="quiz-analytics-progress-section" style={{ marginTop: '28px', marginBottom: '28px' }}>
            <div className="section-heading" style={{ marginBottom: '16px' }}>
              <div>
                <span className="eyebrow">Academic Mastery Intelligence</span>
                <h2>Quiz & Assessment Performance Analytics</h2>
              </div>
              <Link
                to="/quizzes?tab=history"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--color-primary)'
                }}
              >
                <span>Full Quiz History & Filters</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* 4 KPI Cards: Average Score, Highest Score, Total Quizzes, Pass Rate */}
            <div
              className="analytics-kpi-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
                marginBottom: '20px'
              }}
            >
              <div className="panel" style={{ padding: '18px 20px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trophy size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {averageQuizScore != null ? `${averageQuizScore}%` : '—'}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Average Score</div>
                </div>
              </div>

              <div className="panel" style={{ padding: '18px 20px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Award size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {highestQuizScore ? `${highestQuizScore}%` : '—'}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Highest Score</div>
                </div>
              </div>

              <div className="panel" style={{ padding: '18px 20px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ListChecks size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {totalQuizzesAttempted}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Total Quizzes Attempted</div>
                </div>
              </div>

              <div className="panel" style={{ padding: '18px 20px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {quizAnalytics.passRate || 0}%
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Assessment Pass Rate</div>
                </div>
              </div>
            </div>

            {/* Strengths & Weaknesses Split Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '16px',
                marginBottom: '20px'
              }}
            >
              {/* Topic-Wise Strengths (Accuracy >= 75%) */}
              <div className="panel" style={{ padding: '20px', borderRadius: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp size={18} />
                    <span>Topic-Wise Strengths (≥ 75% Accuracy)</span>
                  </h3>
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.12)', color: '#059669' }}>
                    {topicStrengths.length} Topics
                  </span>
                </div>
                {topicStrengths.length === 0 ? (
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                    Take quizzes with 75%+ score to record verified topic strengths.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {topicStrengths.slice(0, 4).map((st, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-surface-subtle, #f8fafc)', borderRadius: '8px' }}>
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>{st.topic}</div>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{st.subjectName || st.subjectCode}</div>
                        </div>
                        <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#059669' }}>{st.accuracy}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Topic-Wise Weaknesses (Accuracy < 60%) */}
              <div className="panel" style={{ padding: '20px', borderRadius: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingDown size={18} />
                    <span>Topics Requiring Revision (&lt; 60% Accuracy)</span>
                  </h3>
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.12)', color: '#dc2626' }}>
                    {topicWeaknesses.length} Topics
                  </span>
                </div>
                {topicWeaknesses.length === 0 ? (
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                    Great job! No weak topics detected yet. Keep taking assessments to maintain readiness.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {topicWeaknesses.slice(0, 4).map((wk, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-surface-subtle, #f8fafc)', borderRadius: '8px' }}>
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>{wk.topic}</div>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{wk.subjectName || wk.subjectCode}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#dc2626' }}>{wk.accuracy}%</span>
                          <Link
                            to={`/quizzes?tab=ai&mode=weak_topics&semester=${wk.semester || studentSem || 1}&subject=${wk.subjectCode || ''}&topic=${encodeURIComponent(wk.topic || '')}`}
                            className="button button-secondary button-small"
                            style={{ padding: '3px 8px', fontSize: '11.5px' }}
                          >
                            <span>Practice Weak Topic</span>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Subjects Requiring More Revision */}
            {subjectsRequiringRevision.length > 0 && (
              <div className="panel" style={{ padding: '20px', borderRadius: '14px', marginBottom: '20px', borderLeft: '4px solid #f59e0b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <AlertCircle size={18} color="#f59e0b" />
                  <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: 700 }}>Subjects Requiring More Revision</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                  {subjectsRequiringRevision.map((sub, sIdx) => (
                    <div key={sIdx} style={{ padding: '12px 14px', background: 'var(--bg-surface-subtle, #f8fafc)', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>{sub.subjectName}</span>
                        <span style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', padding: '2px 6px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.15)', color: '#d97706' }}>
                          {sub.revisionPriority || 'Revision'}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Avg Score: <strong>{sub.averageScore}%</strong> • Failed: <strong>{sub.failedAttempts} attempts</strong>
                      </div>
                      <Link
                        to={`/quizzes?tab=ai&mode=revision&semester=${sub.semester || studentSem || 1}&subject=${sub.subjectCode}`}
                        className="button button-primary button-small"
                        style={{ marginTop: '4px', fontSize: '11.5px', width: 'fit-content' }}
                      >
                        <Sparkles size={12} />
                        <span>Practice Revision Quiz</span>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Previous Quiz Attempts Preview */}
            <div className="panel" style={{ padding: '20px', borderRadius: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RotateCcw size={16} />
                  <span>Recent Quiz Attempts</span>
                </h3>
                <Link to="/quizzes?tab=history" style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--color-primary)' }}>
                  View All & Filter →
                </Link>
              </div>

              {previousQuizAttempts.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                  No quiz attempts recorded yet. Visit the Quizzes hub to take an AI practice quiz.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {previousQuizAttempts.slice(0, 5).map((att, aIdx) => {
                    const isPassed = att.passed || att.score >= 70;
                    return (
                      <div
                        key={att.id || att._id || aIdx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          background: 'var(--bg-surface-subtle, #f8fafc)',
                          borderRadius: '8px',
                          flexWrap: 'wrap',
                          gap: '8px'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {att.title || att.lessonTitle || att.assessmentId || 'Quiz Attempt'}
                          </div>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                            {att.subjectName || att.subjectCode} • {att.topic || `Unit ${att.unitNumber || 1}`} • Attempt #{att.attemptNumber || 1} • {att.createdAt ? new Date(att.createdAt).toLocaleDateString() : 'Recent'}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 800, color: isPassed ? '#10b981' : '#f59e0b' }}>
                            {att.score}%
                          </span>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '6px',
                              background: isPassed ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                              color: isPassed ? '#059669' : '#dc2626'
                            }}
                          >
                            {isPassed ? 'Passed' : 'Needs Review'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Activity Split Grid */}
          <div className="progress-content-grid">
            {/* Recent Lessons Panel */}
            <section className="panel subject-progress-panel" aria-label="Recent lesson activity">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">YOUR RECENT LESSONS</span>
                  <h2>Learning activity</h2>
                </div>
                <BookOpen size={19} className="muted-icon" />
              </div>
              {lessonProgress.length ? (
                <div className="subject-progress-list">
                  {lessonProgress.slice(0, 5).map((item, index) => (
                    <div className="subject-progress-row" key={item._id || index}>
                      <div className={`subject-progress-icon progress-tone-${index % 4}`}>
                        <BookOpen size={16} />
                      </div>
                      <div className="subject-progress-info">
                        <div className="subject-progress-name">
                          <strong>{item.lessonId?.title || 'Lesson'}</strong>
                          <span>{item.status === 'completed' ? 'Complete' : 'In progress'}</span>
                        </div>
                        <div className="subject-progress-track">
                          <span style={{ width: item.status === 'completed' ? '100%' : '35%' }} />
                        </div>
                        <small>
                          {item.completedAt ? new Date(item.completedAt).toLocaleDateString() : 'Keep going at your own pace'}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Your lesson progress will show up here"
                  detail="Open a lesson and mark it complete to see your learning activity."
                />
              )}
            </section>

            {/* Recent Activity Timeline Panel */}
            <section className="panel progress-activity-panel" aria-label="Recent activity log">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">A RECORD OF SHOWING UP</span>
                  <h2>Recent activity</h2>
                </div>
                <Clock3 size={19} className="muted-icon" />
              </div>
              {activities.length ? (
                <div className="activity-list">
                  {activities.map((item, index) => (
                    <div className="activity-row" key={item.id || index}>
                      <span className="activity-marker">
                        <CheckCircle2 size={15} />
                      </span>
                      <div>
                        <strong>{item.title}</strong>
                        <span>{item.subject}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="activity-empty">
                  <span className="activity-empty-icon">
                    <TrendingUp size={17} />
                  </span>
                  <strong>Your first step is the hardest. You’ve got this.</strong>
                  <span>Activity will appear here as you complete lessons and quizzes.</span>
                  <Link to="/curriculum">
                    Explore your curriculum <ArrowRight size={13} />
                  </Link>
                </div>
              )}
            </section>
          </div>

          <div className="learning-encouragement">
            <Target size={18} />
            <span>
              <strong>Progress, not perfection.</strong> Your path is yours, and every step matters.
            </span>
          </div>
        </>
      )}
    </div>
  );
}

function ProgressMetric({ icon: Icon, label, value, detail, color }) {
  return (
    <article className="progress-metric">
      <span className={`progress-metric-icon ${color}`}>
        <Icon size={18} />
      </span>
      <span className="progress-metric-label">{label}</span>
      <strong>{value}</strong>
      <span className="progress-metric-detail">{detail}</span>
    </article>
  );
}
