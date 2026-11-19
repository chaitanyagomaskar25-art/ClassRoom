import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlarmClock,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Calendar,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Flame,
  GraduationCap,
  Hourglass,
  Layers,
  Play,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  X
} from 'lucide-react';
import { api, getErrorMessage, unwrap } from '../services/api.js';
import { EmptyState, ErrorState, LoadingState } from '../components/ContentState.jsx';
import { allSubjects, semestersList } from '../data/curriculumData.js';

function formatDateInput(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function StudyPlanner() {
  const user = useSelector((state) => state.auth?.user) || {};
  const activeSemesterNum = Number(user.semester || 1);
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSubjectParam = searchParams.get('subject') || searchParams.get('subjectCode') || 'all';
  const [selectedSubjectCode, setSelectedSubjectCode] = useState(initialSubjectParam);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [planData, setPlanData] = useState(null);
  const [savingAction, setSavingAction] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  // Configuration drawer / modal state
  const [configOpen, setConfigOpen] = useState(false);
  const [targetDateInput, setTargetDateInput] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return formatDateInput(d);
  });
  const [dailyMinutesInput, setDailyMinutesInput] = useState(60);

  // Active view filter: 'today', 'upcoming', 'all', 'history'
  const [scheduleFilter, setScheduleFilter] = useState('upcoming');

  // Load study plan from backend
  const loadPlan = useCallback(async (code = selectedSubjectCode) => {
    setLoading(true);
    setError('');
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 5000);
    try {
      const response = await api.get(`/study-plan?subjectCode=${code}`);
      const data = unwrap(response);
      setPlanData(data);
      if (data?.plan?.targetDate) {
        setTargetDateInput(formatDateInput(data.plan.targetDate));
      }
      if (data?.plan?.dailyMinutes) {
        setDailyMinutesInput(data.plan.dailyMinutes);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      clearTimeout(safetyTimer);
      setLoading(false);
    }
  }, [selectedSubjectCode]);

  useEffect(() => {
    loadPlan(selectedSubjectCode);
  }, [loadPlan, selectedSubjectCode]);

  // Handle subject change from dropdown
  const handleSubjectChange = (newCode) => {
    setSelectedSubjectCode(newCode);
    setSearchParams(newCode === 'all' ? {} : { subject: newCode });
  };

  // Configure / Recalculate study plan
  const handleSaveConfiguration = async (e) => {
    if (e) e.preventDefault();
    setSavingAction(true);
    setActionMessage('');
    try {
      const response = await api.post('/study-plan', {
        subjectCode: selectedSubjectCode,
        targetDate: targetDateInput,
        dailyMinutes: Number(dailyMinutesInput),
        semester: activeSemesterNum
      });
      const data = unwrap(response);
      setActionMessage(`🎉 Success! Study plan recalculated for ${dailyMinutesInput} mins/day.`);
      setConfigOpen(false);
      await loadPlan(selectedSubjectCode);
      setTimeout(() => setActionMessage(''), 4500);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSavingAction(false);
    }
  };

  // Reschedule overdue tasks
  const handleRescheduleOverdue = async () => {
    setSavingAction(true);
    setActionMessage('');
    try {
      const response = await api.post('/study-plan/reschedule', {
        subjectCode: selectedSubjectCode
      });
      const data = unwrap(response);
      setActionMessage(
        `✓ Rescheduled ${data.rescheduledCount || 'unfinished'} tasks into upcoming days!`
      );
      await loadPlan(selectedSubjectCode);
      setTimeout(() => setActionMessage(''), 4500);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSavingAction(false);
    }
  };

  // Toggle individual task completion
  const handleToggleTask = async (taskId) => {
    try {
      // Optimistic update
      setPlanData((prev) => {
        if (!prev?.plan?.schedule) return prev;
        const nextSchedule = prev.plan.schedule.map((t) => {
          if (t.id === taskId) {
            return {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? new Date() : null
            };
          }
          return t;
        });

        const todayStr = formatDateInput(new Date());
        const completedCount = nextSchedule.filter((t) => t.completed).length;
        const totalCount = nextSchedule.length;
        const todayItems = nextSchedule.filter((t) => t.date === todayStr);
        const todayDone = todayItems.filter((t) => t.completed).length;

        return {
          ...prev,
          plan: { ...prev.plan, schedule: nextSchedule },
          todayTasks: todayItems,
          stats: {
            ...prev.stats,
            completedTasks: completedCount,
            completionPercent: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
            todayCompletedTasks: todayDone,
            todayPercent: todayItems.length > 0 ? Math.round((todayDone / todayItems.length) * 100) : 0
          }
        };
      });

      await api.post(`/study-plan/tasks/${taskId}/toggle`, {
        subjectCode: selectedSubjectCode
      });
    } catch (err) {
      console.error('Failed to toggle task:', err);
      await loadPlan(selectedSubjectCode);
    }
  };

  // Quick preset button for target dates
  const handlePresetDays = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setTargetDateInput(formatDateInput(d));
  };

  // Extract variables
  const plan = planData?.plan || null;
  const stats = planData?.stats || {};
  const todayTasks = planData?.todayTasks || [];
  const overdueTasks = planData?.overdueTasks || [];
  const upcomingSchedule = planData?.upcomingSchedule || [];
  const completionHistory = planData?.completionHistory || [];
  const reminders = plan?.reminders || [];
  const weeklyGoals = plan?.weeklyGoals || [];

  // Group upcoming tasks by calendar date
  const groupedUpcoming = useMemo(() => {
    const list =
      scheduleFilter === 'history'
        ? completionHistory
        : scheduleFilter === 'all'
        ? plan?.schedule || []
        : upcomingSchedule;

    const map = {};
    for (const item of list) {
      const d = item.date;
      if (!map[d]) map[d] = [];
      map[d].push(item);
    }
    return Object.entries(map).sort(([a], [b]) => (scheduleFilter === 'history' ? b.localeCompare(a) : a.localeCompare(b)));
  }, [scheduleFilter, upcomingSchedule, plan, completionHistory]);

  const currentSemesterPlan = semestersList.find((s) => s.semester === activeSemesterNum) || semestersList[0];
  const semesterSubjects = currentSemesterPlan?.subjects || [];

  // Days remaining calculation
  const daysRemaining = useMemo(() => {
    if (!plan?.targetDate) return 30;
    const diff = new Date(plan.targetDate).getTime() - new Date().getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [plan?.targetDate]);

  return (
    <div className="content-page study-planner-page">
      {/* 1. Header Section with Subject Selector & Actions */}
      <header className="page-heading">
        <div className="page-heading-left">
          <span className="eyebrow">
            <CalendarClock size={13} />
            <span>Personalized Study Planning Engine</span>
          </span>
          <h1>Interactive Study Planner</h1>
          <p>
            Dynamically generated daily tasks, weekly milestones, and unit revision sessions tailored to your actual learning progress.
          </p>
        </div>

        <div className="study-planner-header-actions">
          {/* Subject Filter Dropdown */}
          <div className="planner-subject-select-wrap">
            <select
              className="planner-subject-select"
              value={selectedSubjectCode}
              onChange={(e) => handleSubjectChange(e.target.value)}
              aria-label="Select subject to plan"
            >
              <option value="all">Semester {activeSemesterNum} (All Subjects)</option>
              {allSubjects.map((sub) => (
                <option key={sub.code || sub.id} value={sub.code}>
                  Sem {sub.semester} · {sub.name} ({sub.code})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="button button-primary"
            onClick={() => setConfigOpen((prev) => !prev)}
          >
            <SlidersHorizontal size={15} />
            <span>{configOpen ? 'Close Settings' : 'Customize Plan'}</span>
          </button>
        </div>
      </header>

      {/* Success Notification Alert */}
      {actionMessage && (
        <div className="success-message" role="status">
          <CheckCircle2 size={18} />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* 2. Collapsible Plan Configuration Panel */}
      {configOpen && (
        <section className="panel planner-config-panel" aria-label="Study plan parameters">
          <div className="config-panel-header">
            <div>
              <span className="eyebrow" style={{ color: 'var(--color-primary)' }}>
                <Target size={13} />
                <span>Adjust Parameters</span>
              </span>
              <h2 style={{ fontSize: '18px', margin: '4px 0 0 0', fontWeight: 800 }}>
                Configure Target Date & Available Study Time
              </h2>
            </div>
            <button
              type="button"
              className="modal-close-icon-btn"
              onClick={() => setConfigOpen(false)}
              aria-label="Close configuration"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSaveConfiguration} className="planner-config-form">
            <div className="config-form-grid">
              {/* Target Date Input */}
              <div className="config-form-group">
                <label htmlFor="target-date-input">
                  <Calendar size={14} />
                  <span>Target Completion Date</span>
                </label>
                <input
                  id="target-date-input"
                  type="date"
                  className="config-date-input"
                  value={targetDateInput}
                  onChange={(e) => setTargetDateInput(e.target.value)}
                  min={formatDateInput(new Date())}
                  required
                />
                <div className="quick-preset-chips">
                  <button type="button" onClick={() => handlePresetDays(14)} className="preset-chip">
                    +2 Weeks
                  </button>
                  <button type="button" onClick={() => handlePresetDays(30)} className="preset-chip">
                    +30 Days
                  </button>
                  <button type="button" onClick={() => handlePresetDays(60)} className="preset-chip">
                    +60 Days
                  </button>
                  <button type="button" onClick={() => handlePresetDays(90)} className="preset-chip">
                    Semester End
                  </button>
                </div>
              </div>

              {/* Daily Available Study Time */}
              <div className="config-form-group">
                <label>
                  <Clock3 size={14} />
                  <span>Daily Available Study Time</span>
                </label>
                <div className="time-select-grid">
                  {[30, 45, 60, 90, 120].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      className={`time-option-chip ${dailyMinutesInput === mins ? 'selected' : ''}`}
                      onClick={() => setDailyMinutesInput(mins)}
                    >
                      <strong>{mins} mins</strong>
                      <small>{mins === 60 ? 'Recommended' : mins > 60 ? 'Intensive' : 'Steady'}</small>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="config-form-footer">
              <span className="config-estimate-note">
                Our scheduler will distribute pending syllabus lessons and insert revision milestones after each unit.
              </span>
              <button type="submit" className="button button-primary" disabled={savingAction}>
                <Sparkles size={15} />
                <span>{savingAction ? 'Recalculating…' : 'Generate Personalized Schedule'}</span>
              </button>
            </div>
          </form>
        </section>
      )}

      {loading ? (
        <LoadingState label="Synthesizing personalized study schedule…" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadPlan(selectedSubjectCode)} />
      ) : (
        <>
          {/* 3. Overdue & Smart Reminders Box */}
          {overdueTasks.length > 0 && (
            <div className="planner-overdue-alert" role="alert">
              <div className="overdue-alert-copy">
                <AlertTriangle size={20} className="alert-amber-icon" />
                <div>
                  <strong>{overdueTasks.length} Pending Task{overdueTasks.length === 1 ? '' : 's'} from Past Days</strong>
                  <p>
                    Life happens! You have uncompleted tasks from earlier dates. Click below to redistribute them smoothly into your upcoming study days without overwhelming your schedule.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="button button-secondary reschedule-btn"
                onClick={handleRescheduleOverdue}
                disabled={savingAction}
              >
                <RotateCcw size={15} />
                <span>{savingAction ? 'Rescheduling…' : 'Reschedule Unfinished Tasks'}</span>
              </button>
            </div>
          )}

          {/* 4. Analytics Summary KPIs (4 Cards) */}
          <section className="planner-kpis-grid" aria-label="Study Progress Analytics">
            {/* KPI 1: Today's Completion */}
            <div className="planner-kpi-card accent-indigo">
              <div className="kpi-card-top">
                <span className="kpi-label">Today's Study Agenda</span>
                <span className="kpi-icon-wrap indigo"><CalendarDays size={18} /></span>
              </div>
              <div className="kpi-value-row">
                <strong>{stats.todayCompletedTasks || 0} / {stats.todayTotalTasks || 0}</strong>
                <span className="kpi-badge">{stats.todayPercent || 0}% Done</span>
              </div>
              <div className="kpi-progress-bar">
                <span style={{ width: `${stats.todayPercent || 0}%`, background: '#6366f1' }} />
              </div>
              <span className="kpi-subtext">
                {stats.todayMinutes || 0} mins scheduled for today ({stats.todayCompletedMinutes || 0} mins complete)
              </span>
            </div>

            {/* KPI 2: Weekly Learning Goals */}
            <div className="planner-kpi-card accent-emerald">
              <div className="kpi-card-top">
                <span className="kpi-label">Weekly Learning Goals</span>
                <span className="kpi-icon-wrap emerald"><Target size={18} /></span>
              </div>
              <div className="kpi-value-row">
                <strong>
                  {stats.weeklyProgress?.completedLessons || 0} / {stats.weeklyProgress?.targetLessons || 0}
                </strong>
                <span className="kpi-badge emerald">This Week</span>
              </div>
              <div className="kpi-progress-bar">
                <span
                  style={{
                    width: `${
                      stats.weeklyProgress?.targetLessons > 0
                        ? Math.min(
                            100,
                            Math.round(
                              ((stats.weeklyProgress?.completedLessons || 0) /
                                stats.weeklyProgress.targetLessons) *
                                100
                            )
                          )
                        : 0
                    }%`,
                    background: '#10b981'
                  }}
                />
              </div>
              <span className="kpi-subtext">
                Target: {stats.weeklyProgress?.targetMinutes || 0} study mins this week
              </span>
            </div>

            {/* KPI 3: Target Completion Pace */}
            <div className="planner-kpi-card accent-amber">
              <div className="kpi-card-top">
                <span className="kpi-label">Target Completion Pace</span>
                <span className="kpi-icon-wrap amber"><Hourglass size={18} /></span>
              </div>
              <div className="kpi-value-row">
                <strong>{daysRemaining} Days Left</strong>
                <span className="kpi-badge amber">Pace On Track</span>
              </div>
              <div className="kpi-progress-bar">
                <span style={{ width: `${stats.completionPercent || 0}%`, background: '#f59e0b' }} />
              </div>
              <span className="kpi-subtext">
                Target date: {plan?.targetDate ? new Date(plan.targetDate).toLocaleDateString() : 'Set target'}
              </span>
            </div>

            {/* KPI 4: Overall Planned Curriculum */}
            <div className="planner-kpi-card accent-rose">
              <div className="kpi-card-top">
                <span className="kpi-label">Overall Plan Mastery</span>
                <span className="kpi-icon-wrap rose"><Trophy size={18} /></span>
              </div>
              <div className="kpi-value-row">
                <strong>{stats.completedTasks || 0} / {stats.totalTasks || 0}</strong>
                <span className="kpi-badge rose">{stats.completionPercent || 0}% Mastered</span>
              </div>
              <div className="kpi-progress-bar">
                <span style={{ width: `${stats.completionPercent || 0}%`, background: '#ec4899' }} />
              </div>
              <span className="kpi-subtext">
                Includes units & scheduled revision checkpoints
              </span>
            </div>
          </section>

          {/* 5. Today's Actionable Study Agenda */}
          <section className="panel today-agenda-panel" aria-label="Today's study tasks">
            <div className="section-heading">
              <div>
                <span className="eyebrow" style={{ color: '#6366f1' }}>
                  <CalendarCheck size={13} />
                  <span>Actionable Daily Schedule</span>
                </span>
                <h2>Today's Study Agenda ({todayTasks.length} Tasks)</h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="agenda-time-pill">
                  <Clock3 size={12} />
                  <span>{stats.todayMinutes || 0} mins planned</span>
                </span>
              </div>
            </div>

            {todayTasks.length ? (
              <div className="today-tasks-list">
                {todayTasks.map((task, idx) => (
                  <div
                    key={task.id || idx}
                    className={`today-task-card ${task.completed ? 'task-completed' : ''} ${
                      task.taskType === 'revision' ? 'task-revision' : task.taskType === 'milestone' ? 'task-milestone' : ''
                    }`}
                  >
                    <div className="task-checkbox-wrap">
                      <button
                        type="button"
                        className={`task-check-circle ${task.completed ? 'checked' : ''}`}
                        onClick={() => handleToggleTask(task.id)}
                        aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                      >
                        {task.completed && <Check size={14} />}
                      </button>
                    </div>

                    <div className="task-info-content">
                      <div className="task-tags-row">
                        <span className={`task-type-chip ${task.taskType}`}>
                          {task.taskType === 'revision' && <RotateCcw size={11} />}
                          {task.taskType === 'milestone' && <Trophy size={11} />}
                          {task.taskType === 'lesson' && <BookOpen size={11} />}
                          <span>{task.taskType === 'revision' ? 'Unit Revision Session' : task.taskType === 'milestone' ? 'Course Milestone' : 'Syllabus Lesson'}</span>
                        </span>
                        <span className="task-subject-tag">{task.subjectName || task.subjectCode}</span>
                        {task.unitNumber && <span className="task-unit-tag">{task.unitNumber}</span>}
                        {task.rescheduled && <span className="task-rescheduled-tag">Rescheduled</span>}
                      </div>

                      <h3 className="task-card-title">{task.title}</h3>
                    </div>

                    <div className="task-actions-wrap">
                      <span className="task-time-badge">
                        <Clock3 size={13} />
                        <span>{task.estimatedMinutes} mins</span>
                      </span>

                      {task.lessonId && (
                        <Link
                          to={`/learning/${task.subjectCode || selectedSubjectCode}?lesson=${task.lessonId}&open=true`}
                          className="button button-small task-study-btn"
                        >
                          <Play size={12} fill="currentColor" />
                          <span>Study Now</span>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="agenda-empty-card">
                <CheckCircle2 size={36} style={{ color: '#10b981' }} />
                <h3>All Caught Up for Today!</h3>
                <p>
                  You have completed all scheduled tasks for today. Take a break, review flashcards, or study ahead in your curriculum.
                </p>
                <Link to="/learning" className="button button-secondary" style={{ marginTop: '12px' }}>
                  <span>Explore Lessons Ahead</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </section>

          {/* 6. Weekly Goals & Revision Sessions Split Grid */}
          <div className="planner-split-grid">
            {/* Weekly Learning Goals Card */}
            <section className="panel weekly-goals-panel" aria-label="Weekly study goals">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">Milestones</span>
                  <h2>Weekly Learning Goals</h2>
                </div>
                <Target size={20} className="muted-icon" />
              </div>

              {weeklyGoals.length ? (
                <div className="weekly-goals-list">
                  {weeklyGoals.slice(0, 4).map((wGoal, wIdx) => {
                    const weekDone =
                      wGoal.targetLessons > 0 && wGoal.completedLessons >= wGoal.targetLessons;
                    return (
                      <div key={wIdx} className={`weekly-goal-row ${weekDone ? 'goal-achieved' : ''}`}>
                        <div className="goal-week-badge">
                          <span>W{wGoal.weekNumber}</span>
                        </div>
                        <div className="goal-info">
                          <div className="goal-title-line">
                            <strong>Week {wGoal.weekNumber} Target</strong>
                            <span>
                              {wGoal.completedLessons || 0} / {wGoal.targetLessons} Lessons
                            </span>
                          </div>
                          <div className="goal-progress-track">
                            <span
                              style={{
                                width: `${
                                  wGoal.targetLessons > 0
                                    ? Math.min(100, Math.round(((wGoal.completedLessons || 0) / wGoal.targetLessons) * 100))
                                    : 0
                                }%`,
                                background: weekDone ? '#10b981' : 'var(--color-primary, #6366f1)'
                              }}
                            />
                          </div>
                          <div className="goal-meta-line">
                            <small>{wGoal.startDate} to {wGoal.endDate}</small>
                            <small>{wGoal.revisionSessions} Revision Session{wGoal.revisionSessions === 1 ? '' : 's'}</small>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState title="No weekly goals configured" detail="Customize your study plan to establish weekly study milestones." />
              )}
            </section>

            {/* Smart Reminders & Upcoming Revisions Panel */}
            <section className="panel reminders-panel" aria-label="Smart reminders">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">Alerts & Reminders</span>
                  <h2>Study Reminders ({reminders.length})</h2>
                </div>
                <AlarmClock size={20} className="muted-icon" />
              </div>

              {reminders.length ? (
                <div className="reminders-list">
                  {reminders.map((rem, rIdx) => (
                    <div key={rem.id || rIdx} className={`reminder-item-card priority-${rem.priority}`}>
                      <div className="reminder-icon-circle">
                        {rem.type === 'upcoming_revision' ? (
                          <RotateCcw size={15} />
                        ) : rem.type === 'overdue' ? (
                          <AlertTriangle size={15} />
                        ) : (
                          <Clock3 size={15} />
                        )}
                      </div>
                      <div className="reminder-copy">
                        <p>{rem.message}</p>
                        <small>Scheduled: {rem.date}</small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="activity-empty">
                  <CheckCircle2 size={24} style={{ color: '#10b981' }} />
                  <strong>No pending reminders</strong>
                  <span>Your study cadence is clean and on track.</span>
                </div>
              )}
            </section>
          </div>

          {/* 7. Upcoming Study Schedule & Completion History */}
          <section className="panel upcoming-schedule-panel" aria-label="Study Schedule Timeline">
            <div className="schedule-toolbar">
              <div className="section-heading" style={{ margin: 0 }}>
                <div>
                  <span className="eyebrow">Comprehensive Calendar</span>
                  <h2>Study Schedule Timeline</h2>
                </div>
              </div>

              <div className="schedule-filter-pills" role="tablist">
                <button
                  type="button"
                  className={`filter-pill ${scheduleFilter === 'upcoming' ? 'active' : ''}`}
                  onClick={() => setScheduleFilter('upcoming')}
                >
                  Next 14 Days
                </button>
                <button
                  type="button"
                  className={`filter-pill ${scheduleFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setScheduleFilter('all')}
                >
                  Full Schedule ({plan?.schedule?.length || 0})
                </button>
                <button
                  type="button"
                  className={`filter-pill ${scheduleFilter === 'history' ? 'active' : ''}`}
                  onClick={() => setScheduleFilter('history')}
                >
                  Completed History ({completionHistory.length})
                </button>
              </div>
            </div>

            {groupedUpcoming.length ? (
              <div className="schedule-timeline-days">
                {groupedUpcoming.map(([dateStr, items]) => {
                  const isToday = dateStr === formatDateInput(new Date());
                  const dateObj = new Date(dateStr);
                  const formattedDay = dateObj.toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  });

                  return (
                    <div key={dateStr} className={`timeline-day-block ${isToday ? 'day-today' : ''}`}>
                      <div className="timeline-day-header">
                        <div className="day-date-group">
                          <span className="day-badge-dot" />
                          <strong>{formattedDay}</strong>
                          {isToday && <span className="today-chip">Today</span>}
                        </div>
                        <span className="day-tasks-count">
                          {items.length} Task{items.length === 1 ? '' : 's'} ·{' '}
                          {items.reduce((acc, t) => acc + t.estimatedMinutes, 0)} mins
                        </span>
                      </div>

                      <div className="timeline-day-items">
                        {items.map((task) => (
                          <div
                            key={task.id}
                            className={`timeline-task-row ${task.completed ? 'completed' : ''} ${
                              task.taskType === 'revision' ? 'revision-row' : ''
                            }`}
                          >
                            <button
                              type="button"
                              className={`task-row-checkbox ${task.completed ? 'checked' : ''}`}
                              onClick={() => handleToggleTask(task.id)}
                              aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                            >
                              {task.completed && <Check size={12} />}
                            </button>

                            <div className="task-row-text">
                              <span className="task-row-title">{task.title}</span>
                              <div className="task-row-meta">
                                <span>{task.subjectName}</span>
                                <span>•</span>
                                <span>{task.unitNumber}</span>
                                <span>•</span>
                                <span>{task.estimatedMinutes} mins</span>
                                {task.rescheduled && <span className="task-rescheduled-tag">Rescheduled</span>}
                              </div>
                            </div>

                            {task.lessonId && (
                              <Link
                                to={`/learning/${task.subjectCode || selectedSubjectCode}?lesson=${task.lessonId}&open=true`}
                                className="timeline-study-link"
                              >
                                <span>Study</span>
                                <ArrowRight size={12} />
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title="No tasks found for this view"
                detail="All tasks in this category have either been completed or none are scheduled."
              />
            )}
          </section>

          {/* 8. Motivation & Encouragement */}
          <div className="learning-encouragement">
            <Flame size={20} style={{ color: '#f59e0b' }} />
            <span>
              <strong>Study streaks build degree mastery.</strong> Sticking to your daily {dailyMinutesInput} mins schedule guarantees finishing by your target date of {plan?.targetDate ? new Date(plan.targetDate).toLocaleDateString() : 'target date'}.
            </span>
          </div>
        </>
      )}
    </div>
  );
}
