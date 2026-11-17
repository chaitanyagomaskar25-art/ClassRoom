import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, BookCheck, BookOpen, CheckCircle2, Clock3, Target, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, getErrorMessage, unwrap } from '../services/api.js';
import { EmptyState, ErrorState, LoadingState } from '../components/ContentState.jsx';
import { listFrom, percentage } from '../utils/format.js';

export default function Progress() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [progressResponse, dashboardResponse] = await Promise.all([
        api.get('/progress/me'),
        api.get('/dashboard/student'),
      ]);
      setData({ ...unwrap(progressResponse), dashboard: unwrap(dashboardResponse) });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const overall = percentage(data?.overallProgress ?? data?.overall ?? data?.summary?.overallProgress ?? data?.dashboard?.metrics?.completionPercent);
  const dashboardMetrics = data?.dashboard?.metrics || {};
  const lessonProgress = listFrom(data?.progress, 'progress');
  const attempts = Number(dashboardMetrics.quizAttempts ?? 0);
  const quizAverage = dashboardMetrics.averageQuizScore == null ? null : percentage(dashboardMetrics.averageQuizScore);
  const completed = Number(dashboardMetrics.completedLessons ?? lessonProgress.filter((item) => item.status === 'completed').length);
  const total = Number(dashboardMetrics.totalLessons ?? 0);
  const activities = [
    ...lessonProgress.map((item) => ({
      id: `lesson-${item._id}`,
      title: item.lessonId?.title || 'Lesson activity',
      subject: item.status === 'completed' ? 'Lesson completed' : 'Lesson in progress',
    })),
    ...listFrom(data?.dashboard?.recentQuizAttempts, 'recentQuizAttempts').map((item) => ({
      id: `quiz-${item._id}`,
      title: item.lessonId?.title || 'Quiz completed',
      subject: `Quiz score · ${item.score}%`,
    })),
  ].slice(0, 6);

  return <div className="content-page">
    <div className="page-heading"><div><span className="eyebrow">LOOK HOW FAR YOU'VE COME</span><h1>My progress</h1><p>Progress is made of small steps that you keep taking.</p></div><div className="heading-illustration blue-illustration"><TrendingUp size={24} /></div></div>
    {loading ? <LoadingState label="Putting your progress together…" /> : error ? <ErrorState message={error} onRetry={load} /> : <>
      <section className="progress-hero"><div className="progress-hero-copy"><span className="eyebrow">YOUR LEARNING JOURNEY</span><h2>You're building something good.</h2><p>Keep showing up and your understanding will grow along with your progress.</p><Link className="button button-light" to="/learning">Continue learning <ArrowRight size={15} /></Link></div><div className="progress-ring" style={{ '--progress': `${overall}%` }}><div><strong>{overall}<span>%</span></strong><small>OVERALL</small></div></div></section>
      <section className="progress-stats"><ProgressMetric icon={BookCheck} label="Lessons completed" value={`${completed}${total ? ` / ${total}` : ''}`} detail="A strong foundation, one lesson at a time" color="lavender" /><ProgressMetric icon={CheckCircle2} label="Quiz average" value={quizAverage === null ? '—' : `${quizAverage}%`} detail={`${attempts} attempts to learn from`} color="sage" /><ProgressMetric icon={Target} label="Quiz attempts" value={attempts} detail="Each try is a chance to learn" color="peach" /></section>
      <div className="progress-content-grid">
        <section className="panel subject-progress-panel"><div className="section-heading"><div><span className="eyebrow">YOUR RECENT LESSONS</span><h2>Learning activity</h2></div><BookOpen size={19} className="muted-icon" /></div>{lessonProgress.length ? <div className="subject-progress-list">{lessonProgress.slice(0, 5).map((item, index) => <div className="subject-progress-row" key={item._id || index}><div className={`subject-progress-icon progress-tone-${index % 4}`}><BookOpen size={16} /></div><div className="subject-progress-info"><div className="subject-progress-name"><strong>{item.lessonId?.title || 'Lesson'}</strong><span>{item.status === 'completed' ? 'Complete' : 'In progress'}</span></div><div className="subject-progress-track"><span style={{ width: item.status === 'completed' ? '100%' : '35%' }} /></div><small>{item.completedAt ? new Date(item.completedAt).toLocaleDateString() : 'Keep going at your own pace'}</small></div></div>)}</div> : <EmptyState title="Your lesson progress will show up here" detail="Open a lesson and mark it complete to see your learning activity." />}</section>
        <section className="panel progress-activity-panel"><div className="section-heading"><div><span className="eyebrow">A RECORD OF SHOWING UP</span><h2>Recent activity</h2></div><Clock3 size={19} className="muted-icon" /></div>{activities.length ? <div className="activity-list">{activities.map((item, index) => <div className="activity-row" key={item.id || index}><span className="activity-marker"><CheckCircle2 size={15} /></span><div><strong>{item.title}</strong><span>{item.subject}</span></div></div>)}</div> : <div className="activity-empty"><span className="activity-empty-icon"><TrendingUp size={17} /></span><strong>Your first step is the hardest. You’ve got this.</strong><span>Activity will appear here as you complete lessons and quizzes.</span><Link to="/curriculum">Explore your curriculum <ArrowRight size={13} /></Link></div>}</section>
      </div>
      <div className="learning-encouragement"><Target size={18} /><span><strong>Progress, not perfection.</strong> Your path is yours, and every step matters.</span></div>
    </>}
  </div>;
}

function ProgressMetric({ icon: Icon, label, value, detail, color }) {
  return <article className="progress-metric"><span className={`progress-metric-icon ${color}`}><Icon size={18} /></span><span className="progress-metric-label">{label}</span><strong>{value}</strong><span className="progress-metric-detail">{detail}</span></article>;
}
