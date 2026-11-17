import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ArrowRight, BookOpen, CheckCircle2, Clock3, Flame, Play, Sparkles, Target, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, getErrorMessage, unwrap } from '../services/api.js';
import { ErrorState, LoadingState } from '../components/ContentState.jsx';
import { firstName, listFrom, nameOf, percentage } from '../utils/format.js';

const fallbackRecommendations = [
  { title: 'Build a steady study rhythm', detail: 'A little practice today goes a long way.', icon: Target, color: 'lilac', path: '/learning' },
  { title: 'Pick up where you left off', detail: 'Continue with your next curriculum lesson.', icon: BookOpen, color: 'mint', path: '/learning' },
  { title: 'Check your understanding', detail: 'Try a quick quiz to reinforce what you know.', icon: Sparkles, color: 'peach', path: '/quizzes' },
];

export default function Dashboard() {
  const user = useSelector((state) => state.auth.user) || {};
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(unwrap(await api.get('/dashboard/student')));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const metrics = data?.metrics || {};
  const progress = percentage(data?.overallProgress ?? metrics.completionPercent ?? data?.progress?.overall);
  const averageValue = data?.quizAverage ?? data?.averageQuizScore ?? metrics.averageQuizScore ?? data?.progress?.quizAverage;
  const average = averageValue == null ? null : percentage(averageValue);
  const lessons = Number(data?.completedLessons ?? metrics.completedLessons ?? data?.progress?.completedLessons ?? 0);
  const semester = data?.currentSemester || data?.student?.semester || data?.semester;
  const semesterTitle = typeof semester === 'number' ? `Semester ${semester}` : semester ? nameOf(semester) : '—';
  const streakValue = data?.streak ?? data?.currentStreak;
  const activity = [
    ...listFrom(data?.recentProgress, 'recentProgress').map((item) => ({
      title: item.lessonId?.title || 'Lesson activity',
      subject: item.status === 'completed' ? 'Lesson completed' : 'Lesson in progress',
      _id: `progress-${item._id}`,
    })),
    ...listFrom(data?.recentQuizAttempts, 'recentQuizAttempts').map((item) => ({
      title: item.lessonId?.title || 'Quiz completed',
      subject: `Quiz score · ${item.score}%`,
      _id: `quiz-${item._id}`,
    })),
  ].slice(0, 4);

  return (
    <div className="dashboard-page">
      <section className="welcome-banner">
        <div className="welcome-copy">
          <span className="eyebrow welcome-eyebrow"><span className="sun-dot" /> YOUR LEARNING, AT YOUR PACE</span>
          <h1>Good to see you, {firstName(user.name)} <span className="wave">✳</span></h1>
          <p>A new day is a fresh chance to move one step closer to your goals.</p>
          <Link className="button button-light" to="/learning"><Play size={15} fill="currentColor" /> Continue learning</Link>
        </div>
        <div className="welcome-art" aria-hidden="true"><div className="art-sun" /><div className="art-card art-card-back"><span>01</span><i /><i /></div><div className="art-card art-card-front"><div className="art-book-icon"><BookOpen size={20} /></div><strong>Your next<br />big idea</strong><span>is one lesson away</span></div><span className="art-star star-one">✳</span><span className="art-star star-two">✦</span></div>
      </section>

      {loading ? <LoadingState label="Gathering your progress…" /> : error ? <ErrorState message={error} onRetry={load} /> : null}

      <section className="stats-grid" aria-label="Learning summary">
        <StatCard label="Overall progress" value={`${progress}%`} icon={Target} theme="lavender" sub={`${lessons} lessons completed`} progress={progress} />
        <StatCard label="Quiz average" value={average === null ? '—' : `${average}%`} icon={CheckCircle2} theme="sage" sub="Keep building your confidence" progress={average ?? undefined} />
        <StatCard label="Learning streak" value={streakValue == null ? '—' : `${Number(streakValue)} days`} icon={Flame} theme="peach" sub={streakValue == null ? 'Streak tracking is not enabled yet' : 'Showing up is the hard part'} />
        <StatCard label="Semester" value={semesterTitle} icon={BookOpen} theme="blue" sub={data?.academicYear || 'Your current learning path'} />
      </section>

      <div className="dashboard-columns">
        <section className="panel goal-panel">
          <div className="section-heading"><div><span className="eyebrow">YOUR NEXT STEP</span><h2>Start with a lesson</h2></div><span className="soft-badge"><Clock3 size={13} /> At your pace</span></div>
          <p className="panel-description">Choose one topic to explore. Your progress updates as you complete lessons and quizzes.</p>
          <div className="goal-foot"><span>No rush—one small step is enough.</span><Link to="/learning">Open my lessons <ArrowRight size={14} /></Link></div>
        </section>
        <section className="panel semester-panel">
          <div className="section-heading"><div><span className="eyebrow">YOUR ACADEMIC PATH</span><h2>{semesterTitle === '—' ? 'Your semester' : semesterTitle}</h2></div><span className="semester-stamp"><BookOpen size={17} /></span></div>
          <div className="semester-details"><span>{data?.subjectCount ?? 'Curriculum in progress'}</span><span className="detail-dot" /><span>{metrics.totalLessons ?? '—'} lessons in your plan</span></div>
          <div className="semester-progress"><span style={{ width: `${progress}%` }} /></div>
          <Link to="/curriculum" className="panel-link">Explore curriculum <ArrowRight size={15} /></Link>
        </section>
      </div>

      <section className="lower-grid">
        <div className="panel recommendations-panel">
          <div className="section-heading"><div><span className="eyebrow">A GOOD NEXT STEP</span><h2>Good next steps</h2></div><Link to="/curriculum" className="subtle-link">View curriculum <ArrowRight size={14} /></Link></div>
          <div className="recommendation-list">
            {(listFrom(data?.recommendations, 'recommendations').length ? listFrom(data.recommendations, 'recommendations') : fallbackRecommendations).slice(0, 3).map((item, index) => {
              const Icon = item.icon || [Target, BookOpen, Sparkles][index];
              return <Link className="recommendation-row" to={item.path || '/curriculum'} key={item._id || item.id || item.title || index}><span className={`recommendation-icon ${item.color || ['lilac', 'mint', 'peach'][index]}`}><Icon size={17} /></span><span className="recommendation-copy"><strong>{item.title || nameOf(item)}</strong><span>{item.detail || item.description || 'Take the next step in your learning plan.'}</span></span><ArrowRight className="recommendation-arrow" size={16} /></Link>;
            })}
          </div>
        </div>
        <div className="panel activity-panel">
          <div className="section-heading"><div><span className="eyebrow">MOMENTUM, NOT PERFECTION</span><h2>Recent activity</h2></div><span className="activity-badge"><Trophy size={15} /></span></div>
          {activity.length ? <div className="activity-list">{activity.map((item, index) => <div className="activity-row" key={item._id || index}><span className="activity-marker"><CheckCircle2 size={15} /></span><div><strong>{item.title || item.description}</strong><span>{item.subject || item.type || 'Learning activity'}</span></div></div>)}</div> : <div className="activity-empty"><span className="activity-empty-icon"><Sparkles size={17} /></span><strong>Your journey starts with one small step.</strong><span>Complete a lesson or quiz and your activity will show up here.</span><Link to="/learning">Find your first lesson <ArrowRight size={13} /></Link></div>}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, theme, sub, progress: bar }) {
  return <article className="stat-card"><div className="stat-topline"><span>{label}</span><span className={`stat-icon ${theme}`}><Icon size={17} /></span></div><strong className="stat-value">{value}</strong>{bar !== undefined && <div className="stat-progress"><span style={{ width: `${bar}%` }} /></div>}<span className="stat-sub">{sub}</span></article>;
}
