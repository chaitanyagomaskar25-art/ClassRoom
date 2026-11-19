import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  Code2,
  Crown,
  Flame,
  HelpCircle,
  Layers,
  Medal,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  Trophy,
  Users,
  X,
  Zap
} from 'lucide-react';
import { api, getErrorMessage, unwrap } from '../services/api.js';
import { LoadingState, ErrorState } from '../components/ContentState.jsx';
import './Leaderboard.css';

export default function Leaderboard() {
  const user = useSelector((state) => state.auth.user) || {};
  const [activeTab, setActiveTab] = useState('leaderboard'); // 'leaderboard' | 'goals' | 'badges' | 'levels'
  const [selectedSemester, setSelectedSemester] = useState('all');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Gamification Data State
  const [profileData, setProfileData] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState({ leaderboard: [], totalRanked: 0, requesterRank: null });

  // Custom Goal Form State
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [customGoalTitle, setCustomGoalTitle] = useState('');
  const [customGoalCategory, setCustomGoalCategory] = useState('lesson');
  const [goalActionFeedback, setGoalActionFeedback] = useState('');

  // 1. Load Data
  const loadGamificationData = useCallback(async () => {
    setLoading(true);
    setError('');
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 5000);
    try {
      const [profRes, leadRes] = await Promise.allSettled([
        api.get('/gamification/profile'),
        api.get(`/gamification/leaderboard?semester=${selectedSemester}`)
      ]);

      if (profRes.status === 'fulfilled') {
        setProfileData(unwrap(profRes.value));
      }
      if (leadRes.status === 'fulfilled') {
        setLeaderboardData(unwrap(leadRes.value));
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      clearTimeout(safetyTimer);
      setLoading(false);
    }
  }, [selectedSemester]);

  useEffect(() => {
    loadGamificationData();
  }, [loadGamificationData]);

  // 2. Toggle Daily Goal Completion
  const handleToggleGoal = async (goalId) => {
    try {
      const res = unwrap(await api.post(`/gamification/daily-goals/${goalId}/toggle`, {}));
      if (res?.dailyGoals) {
        setProfileData((prev) => ({
          ...prev,
          dailyGoals: res.dailyGoals,
          xp: res.xpResult?.newXp || prev.xp,
          levelInfo: res.xpResult?.levelInfo || prev.levelInfo
        }));
      }
      if (res?.bonusAwarded) {
        setGoalActionFeedback('🎉 Fantastic! Completed all daily goals — +35 Bonus XP awarded!');
        setTimeout(() => setGoalActionFeedback(''), 5000);
      }
      loadGamificationData();
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Create Custom Goal
  const handleAddCustomGoal = async (e) => {
    e.preventDefault();
    if (!customGoalTitle.trim()) return;
    try {
      const res = unwrap(await api.post('/gamification/daily-goals', {
        title: customGoalTitle.trim(),
        category: customGoalCategory
      }));
      if (res?.dailyGoals) {
        setProfileData((prev) => ({
          ...prev,
          dailyGoals: res.dailyGoals
        }));
      }
      setCustomGoalTitle('');
      setShowAddGoalModal(false);
      setGoalActionFeedback('Custom goal added to your daily agenda!');
      setTimeout(() => setGoalActionFeedback(''), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const levelInfo = profileData?.levelInfo || {
    level: 1,
    rankTitle: 'Novice Coder',
    currentXp: 0,
    progressPercent: 0,
    xpToNextLevel: 100
  };

  const streak = profileData?.streak || { currentStreak: 1, longestStreak: 1 };
  const dailyGoals = profileData?.dailyGoals || { goals: [], progressPercent: 0, completedGoals: 0, totalGoals: 0 };
  const badgesList = profileData?.badges || [];
  const rankings = profileData?.rankings || {};
  const leaderboard = leaderboardData?.leaderboard || [];

  const topThree = leaderboard.slice(0, 3);
  const remainingRanks = leaderboard.slice(3);

  if (loading && !profileData) {
    return <LoadingState label="Loading leaderboard rankings, XP levels, and daily goals..." />;
  }

  return (
    <div className="content-page leaderboard-page">
      {/* 1. Header Banner */}
      <header className="gamification-hero">
        <div className="gamification-hero-info">
          <h1>
            <Trophy size={30} color="#fbbf24" />
            Cohort Leaderboard &amp; Student Achievements
          </h1>
          <p>
            Earn XP by completing curriculum lessons, solving coding problems, mastering quizzes, and submitting projects. Maintain study streaks to unlock exclusive university badges.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(255,255,255,0.12)', padding: '10px 16px', borderRadius: '12px', textAlign: 'center' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#c7d2fe', display: 'block' }}>Overall Standing</span>
            <strong style={{ fontSize: '20px', color: '#fbbf24' }}>
              #{rankings.overallRank || '—'}
            </strong>
          </div>
          <button
            type="button"
            className="button button-secondary"
            onClick={loadGamificationData}
            title="Refresh rankings"
          >
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      {/* Global Action Feedback Alert */}
      {goalActionFeedback && (
        <div className="alert alert-success" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{goalActionFeedback}</span>
          <button onClick={() => setGoalActionFeedback('')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}><X size={14} /></button>
        </div>
      )}

      {/* 2. Top-Level Navigation Tabs */}
      <nav className="gamification-nav-tabs" aria-label="Leaderboard views">
        <button
          type="button"
          className={`gamification-nav-tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          <Trophy size={16} />
          <span>Cohort Leaderboard</span>
        </button>

        <button
          type="button"
          className={`gamification-nav-tab ${activeTab === 'goals' ? 'active' : ''}`}
          onClick={() => setActiveTab('goals')}
        >
          <Target size={16} />
          <span>Daily Learning Goals</span>
          <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.2)', padding: '2px 7px', borderRadius: '999px' }}>
            {dailyGoals.completedGoals || 0}/{dailyGoals.totalGoals || 0}
          </span>
        </button>

        <button
          type="button"
          className={`gamification-nav-tab ${activeTab === 'badges' ? 'active' : ''}`}
          onClick={() => setActiveTab('badges')}
        >
          <Award size={16} />
          <span>Badges &amp; Streaks</span>
          <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.2)', padding: '2px 7px', borderRadius: '999px' }}>
            {profileData?.unlockedBadgesCount || 0}/{profileData?.totalBadgesCount || 7}
          </span>
        </button>

        <button
          type="button"
          className={`gamification-nav-tab ${activeTab === 'levels' ? 'active' : ''}`}
          onClick={() => setActiveTab('levels')}
        >
          <Zap size={16} />
          <span>XP &amp; Level Matrix</span>
        </button>
      </nav>

      {/* ====================================================================
          TAB 1: COHORT LEADERBOARD (Item 26)
          ==================================================================== */}
      {activeTab === 'leaderboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Semester Filter Tabs */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {['all', '1', '2', '3', '4', '5', '6'].map((sem) => (
              <button
                key={sem}
                type="button"
                className={`button button-small ${selectedSemester === sem ? 'button-primary' : 'button-secondary'}`}
                onClick={() => setSelectedSemester(sem)}
              >
                {sem === 'all' ? 'All Semesters' : `Semester ${sem}`}
              </button>
            ))}
          </div>

          {/* Top 3 Podium Cards */}
          {topThree.length >= 1 && (
            <div className="podium-container">
              {/* 2nd Place */}
              {topThree[1] && (
                <div className="podium-card second">
                  <div className="podium-rank-badge">Rank 2 · Silver</div>
                  <div className="student-avatar" style={{ width: '52px', height: '52px', fontSize: '20px', background: '#94a3b8' }}>
                    {topThree[1].displayName.charAt(0)}
                  </div>
                  <strong style={{ fontSize: '15px', color: '#f8fafc' }}>{topThree[1].displayName}</strong>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                    Sem {topThree[1].semester} · Level {topThree[1].level}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#fbbf24', fontWeight: 700 }}>
                    <Zap size={14} fill="#fbbf24" />
                    <span>{topThree[1].xp} XP</span>
                  </div>
                </div>
              )}

              {/* 1st Place */}
              {topThree[0] && (
                <div className="podium-card first">
                  <Crown size={28} color="#f59e0b" className="podium-crown" />
                  <div className="podium-rank-badge">Rank 1 · Gold Champion</div>
                  <div className="student-avatar" style={{ width: '64px', height: '64px', fontSize: '24px', background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                    {topThree[0].displayName.charAt(0)}
                  </div>
                  <strong style={{ fontSize: '16px', color: '#f8fafc' }}>{topThree[0].displayName}</strong>
                  <span style={{ fontSize: '12px', color: '#fbbf24', fontWeight: 600 }}>
                    {topThree[0].rankTitle}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '15px', color: '#f59e0b', fontWeight: 800 }}>
                    <Zap size={16} fill="#f59e0b" />
                    <span>{topThree[0].xp} XP</span>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {topThree[2] && (
                <div className="podium-card third">
                  <div className="podium-rank-badge">Rank 3 · Bronze</div>
                  <div className="student-avatar" style={{ width: '52px', height: '52px', fontSize: '20px', background: '#d97706' }}>
                    {topThree[2].displayName.charAt(0)}
                  </div>
                  <strong style={{ fontSize: '15px', color: '#f8fafc' }}>{topThree[2].displayName}</strong>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                    Sem {topThree[2].semester} · Level {topThree[2].level}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#fbbf24', fontWeight: 700 }}>
                    <Zap size={14} fill="#fbbf24" />
                    <span>{topThree[2].xp} XP</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Privacy Notice Banner */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '10px 16px', fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={14} color="#818cf8" />
            <span>
              <strong>Privacy Protection:</strong> Full personal identities, contact numbers, and private feedback are hidden. Only masked display names, academic levels, and verified XP are displayed.
            </span>
          </div>

          {/* Full Leaderboard Table */}
          <div className="leaderboard-table-wrap">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Rank</th>
                  <th>Student</th>
                  <th>Semester</th>
                  <th>Academic Level</th>
                  <th>Badges</th>
                  <th>Streak</th>
                  <th style={{ textAlign: 'right' }}>Total XP</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.length > 0 ? (
                  leaderboard.map((item) => (
                    <tr key={item.studentId} className={item.isCurrentUser ? 'current-user-row' : ''}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {item.rank === 1 && <Crown size={15} color="#f59e0b" />}
                          {item.rank === 2 && <Medal size={15} color="#94a3b8" />}
                          {item.rank === 3 && <Medal size={15} color="#d97706" />}
                          <strong>#{item.rank}</strong>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="student-avatar" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                            {item.displayName.charAt(0)}
                          </div>
                          <div>
                            <strong>{item.displayName}</strong>
                            {item.isCurrentUser && (
                              <span style={{ display: 'inline-block', fontSize: '10px', background: '#6366f1', color: '#fff', padding: '1px 6px', borderRadius: '4px', marginLeft: '6px' }}>
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>Semester {item.semester}</td>
                      <td>
                        <span style={{ fontSize: '12.5px', color: '#c7d2fe', fontWeight: 600 }}>
                          Level {item.level} · {item.rankTitle}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600 }}>
                          {item.badgesCount} badges
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#f59e0b' }}>
                          <Flame size={13} fill="#f59e0b" />
                          <span>{item.streakDays}d</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <strong style={{ fontSize: '14px', color: '#10b981' }}>
                          {item.xp} XP
                        </strong>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                      No rankings available for this semester yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 2: DAILY LEARNING GOALS (Item 23)
          ==================================================================== */}
      {activeTab === 'goals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="daily-goals-card">
            <div className="daily-goals-header">
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Target size={20} color="#10b981" />
                  Today's Daily Learning Agenda
                </h2>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                  Achieve daily study targets to earn consistent XP, advance your level, and maintain streak momentum.
                </span>
              </div>

              <button
                type="button"
                className="button button-small button-primary"
                onClick={() => setShowAddGoalModal(true)}
              >
                <Plus size={14} />
                <span>Add Custom Goal</span>
              </button>
            </div>

            {/* Daily Goal Progress Strip */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '14px 18px', borderRadius: '12px' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '14px', color: '#f8fafc' }}>
                  Daily Goal Progress: {dailyGoals.completedGoals} of {dailyGoals.totalGoals} Completed ({dailyGoals.progressPercent}%)
                </strong>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                  {dailyGoals.allCompleted ? '🎉 All goals complete! Daily bonus awarded.' : 'Complete all goals today to unlock an extra +35 Bonus XP!'}
                </span>
              </div>
              <div style={{ minWidth: '180px' }}>
                <div className="level-progress-bar">
                  <div className="level-progress-fill" style={{ width: `${dailyGoals.progressPercent}%`, background: 'linear-gradient(90deg, #10b981, #059669)' }} />
                </div>
              </div>
            </div>

            {/* Daily Goals Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(dailyGoals.goals || []).map((goal) => (
                <div key={goal.id} className={`daily-goal-item ${goal.isCompleted ? 'completed' : ''}`}>
                  <button
                    type="button"
                    className={`daily-goal-check ${goal.isCompleted ? 'checked' : ''}`}
                    onClick={() => handleToggleGoal(goal.id)}
                    aria-label={goal.isCompleted ? 'Mark goal incomplete' : 'Mark goal complete'}
                  >
                    {goal.isCompleted && <Check size={14} />}
                  </button>

                  <div className="daily-goal-body">
                    <span className="daily-goal-category-pill">{goal.category}</span>
                    <strong className={goal.isCompleted ? 'completed-text' : ''}>{goal.title}</strong>
                    {goal.details?.subjectName && (
                      <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                        Subject: {goal.details.subjectName}
                      </span>
                    )}
                  </div>

                  <div className="daily-goal-xp-tag">
                    <Zap size={13} fill="#f59e0b" />
                    <span>+{goal.xpValue || 15} XP</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 3: BADGES & STREAKS (Item 25)
          ==================================================================== */}
      {activeTab === 'badges' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Study Streak Milestone Card */}
          <div className="level-card" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(30, 41, 59, 0.95) 100%)', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Flame size={32} color="#f59e0b" />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '20px', color: '#f8fafc' }}>
                    {streak.currentStreak || 1} Day Study Streak 🔥
                  </h3>
                  <span style={{ fontSize: '13px', color: '#cbd5e1' }}>
                    Personal Longest Streak: <strong>{streak.longestStreak || streak.currentStreak || 1} consecutive days</strong>. Study daily to keep the flame alive!
                  </span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className="level-badge-pill">
                  7-Day Streak Goal: {Math.min(7, streak.currentStreak || 1)}/7 Days
                </span>
              </div>
            </div>
          </div>

          {/* Badges Grid */}
          <div>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '18px', color: '#f8fafc' }}>
              University Achievement Badges ({profileData?.unlockedBadgesCount || 0}/{badgesList.length})
            </h3>

            <div className="badges-grid">
              {badgesList.map((badge) => (
                <div key={badge.id} className={`badge-card ${badge.isUnlocked ? 'unlocked' : 'locked'}`}>
                  <div className="badge-icon-box">
                    {badge.id === 'quiz_master' && <Award size={26} />}
                    {badge.id === 'streak_7_days' && <Flame size={26} />}
                    {badge.id === 'coding_starter' && <Code2 size={26} />}
                    {badge.id === 'semester_champion' && <Trophy size={26} />}
                    {badge.id === 'project_builder' && <Layers size={26} />}
                    {badge.id === 'first_step' && <Zap size={26} />}
                    {badge.id === 'fast_learner' && <Sparkles size={26} />}
                  </div>

                  <strong style={{ fontSize: '15px', color: '#f8fafc' }}>{badge.title}</strong>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>{badge.description}</p>

                  <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
                    {badge.isUnlocked ? (
                      <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={12} />
                        <span>Unlocked {badge.unlockedAt ? new Date(badge.unlockedAt).toLocaleDateString() : 'Active'}</span>
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>Locked</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 4: XP & LEVEL PROGRESSION MATRIX (Item 24)
          ==================================================================== */}
      {activeTab === 'levels' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Current Level Status Card */}
          <div className="level-card">
            <div className="level-header">
              <span className="level-badge-pill">
                Level {levelInfo.level} · {levelInfo.badgeIcon || '⚡'}
              </span>
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                Total Accumulated XP: <strong>{levelInfo.currentXp} XP</strong>
              </span>
            </div>

            <div className="level-title-large">
              <span>{levelInfo.rankTitle}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8' }}>
              <span>Level Progress: <strong>{levelInfo.progressPercent}%</strong></span>
              <span><strong>{levelInfo.xpToNextLevel} XP</strong> needed for next milestone</span>
            </div>

            <div className="level-progress-bar">
              <div className="level-progress-fill" style={{ width: `${levelInfo.progressPercent}%` }} />
            </div>
          </div>

          {/* XP Point System Reference */}
          <div className="daily-goals-card">
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#f8fafc' }}>
              XP Point Rewards Matrix
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 14px', borderRadius: '10px' }}>
                <strong style={{ display: 'block', fontSize: '13px', color: '#f8fafc' }}>Curriculum Lesson</strong>
                <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 700 }}>+10 XP</span>
                <p style={{ fontSize: '11.5px', color: '#94a3b8', margin: '4px 0 0 0' }}>Awarded on lesson completion</p>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 14px', borderRadius: '10px' }}>
                <strong style={{ display: 'block', fontSize: '13px', color: '#f8fafc' }}>Assessment Quiz</strong>
                <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 700 }}>+20 XP (+10 Bonus)</span>
                <p style={{ fontSize: '11.5px', color: '#94a3b8', margin: '4px 0 0 0' }}>+10 bonus if score ≥ 90%</p>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 14px', borderRadius: '10px' }}>
                <strong style={{ display: 'block', fontSize: '13px', color: '#f8fafc' }}>Coding Challenge</strong>
                <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 700 }}>+25 XP</span>
                <p style={{ fontSize: '11.5px', color: '#94a3b8', margin: '4px 0 0 0' }}>Solved programming lab problem</p>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 14px', borderRadius: '10px' }}>
                <strong style={{ display: 'block', fontSize: '13px', color: '#f8fafc' }}>Mentor Assignment</strong>
                <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 700 }}>+30 XP</span>
                <p style={{ fontSize: '11.5px', color: '#94a3b8', margin: '4px 0 0 0' }}>Submitted lab or theory problem</p>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 14px', borderRadius: '10px' }}>
                <strong style={{ display: 'block', fontSize: '13px', color: '#f8fafc' }}>Capstone Project</strong>
                <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 700 }}>+50 XP</span>
                <p style={{ fontSize: '11.5px', color: '#94a3b8', margin: '4px 0 0 0' }}>Completed project deliverable</p>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 14px', borderRadius: '10px' }}>
                <strong style={{ display: 'block', fontSize: '13px', color: '#f8fafc' }}>Daily Agenda Complete</strong>
                <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 700 }}>+35 XP Bonus</span>
                <p style={{ fontSize: '11.5px', color: '#94a3b8', margin: '4px 0 0 0' }}>Finish all scheduled daily goals</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: ADD CUSTOM GOAL (Item 23)
          ==================================================================== */}
      {showAddGoalModal && (
        <div className="mentor-modal-backdrop" onClick={() => setShowAddGoalModal(false)}>
          <div className="mentor-modal-card" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleAddCustomGoal}>
              <div className="mentor-modal-header">
                <h3>Add Personal Daily Goal</h3>
                <button
                  type="button"
                  className="button-icon"
                  onClick={() => setShowAddGoalModal(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mentor-modal-body">
                <div className="mentor-form-group">
                  <label>Goal Objective *</label>
                  <input
                    type="text"
                    required
                    className="mentor-form-input"
                    placeholder="e.g. Implement Binary Search algorithm in C++"
                    value={customGoalTitle}
                    onChange={(e) => setCustomGoalTitle(e.target.value)}
                  />
                </div>

                <div className="mentor-form-group">
                  <label>Category</label>
                  <select
                    className="mentor-form-select"
                    value={customGoalCategory}
                    onChange={(e) => setCustomGoalCategory(e.target.value)}
                  >
                    <option value="lesson">Syllabus Lesson</option>
                    <option value="coding">Coding Problem / Lab</option>
                    <option value="revision">Weak Topic Revision</option>
                    <option value="quiz">Assessment Quiz</option>
                    <option value="custom">General Academic Task</option>
                  </select>
                </div>
              </div>

              <div className="mentor-modal-footer">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setShowAddGoalModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="button button-primary">
                  Add to Daily Agenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
