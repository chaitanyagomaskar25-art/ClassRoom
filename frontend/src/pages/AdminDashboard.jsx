import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Layers,
  Award,
  Bell,
  Settings,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Sliders,
  BarChart3
} from 'lucide-react';
import { api, getErrorMessage, unwrap } from '../services/api.js';
import { semestersList as officialSemesters } from '../data/curriculumData.js';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'curriculum' | 'announcements' | 'settings'

  // Overview Stats
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalMentors: 0,
    totalSeniorMentors: 0,
    totalAdmins: 0,
    totalAcademicYears: 1,
    totalSemesters: 6,
    totalSubjects: 29,
    totalLessons: 464,
    totalQuizAttempts: 0,
    quizPassRate: 0
  });

  // Users Directory State
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // New User Modal State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    semester: 1,
    enrollmentNumber: '',
    batch: ''
  });

  // Announcements State
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    category: 'academic',
    targetRole: 'all',
    isPinned: false
  });
  const [showAddAnnounceModal, setShowAddAnnounceModal] = useState(false);

  // Academic Years State
  const [academicYears, setAcademicYears] = useState([]);

  // Institutional Analytics State (Item 43)
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [analyticsError, setAnalyticsError] = useState('');
  const [analyticsSemester, setAnalyticsSemester] = useState('all');
  const [analyticsBatch, setAnalyticsBatch] = useState('all');

  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  const loadStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      const data = unwrap(res).stats;
      if (data) setStats(data);
    } catch {
      // Offline fallback
    }
  };

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const params = {
        role: userRoleFilter,
        search: userSearch,
        page: userPage,
        limit: 15
      };
      if (params.role === 'all') delete params.role;
      if (!params.search) delete params.search;

      const res = await api.get('/admin/users', { params });
      const data = unwrap(res);
      if (data?.users) {
        setUsers(data.users);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch {
      // Fallback demo users
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadAnnouncements = async () => {
    try {
      const res = await api.get('/admin/announcements');
      const data = unwrap(res).announcements;
      if (data) setAnnouncements(data);
    } catch {}
  };

  const loadAcademicYears = async () => {
    try {
      const res = await api.get('/admin/academic-years');
      const data = unwrap(res).academicYears;
      if (data) setAcademicYears(data);
    } catch {}
  };

  useEffect(() => {
    loadStats();
    loadAnnouncements();
    loadAcademicYears();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab, userRoleFilter, userPage]);

  const loadAnalytics = async () => {
    setLoadingAnalytics(true);
    setAnalyticsError('');
    try {
      const res = await api.get(`/admin/analytics/institution?semester=${analyticsSemester}&batch=${analyticsBatch}`);
      const data = unwrap(res);
      setAnalyticsData(data);
    } catch (err) {
      setAnalyticsError(getErrorMessage(err) || 'Failed to load institutional analytics.');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'analytics') {
      loadAnalytics();
    }
  }, [activeTab, analyticsSemester, analyticsBatch]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');

    try {
      await api.post('/admin/users', newUserForm);
      setActionSuccess(`User ${newUserForm.name} created successfully!`);
      setShowAddUserModal(false);
      setNewUserForm({
        name: '',
        email: '',
        password: '',
        role: 'student',
        semester: 1,
        enrollmentNumber: '',
        batch: ''
      });
      loadUsers();
      loadStats();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setActionError(getErrorMessage(err) || 'Failed to create user');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user: ${userName}?`)) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setActionSuccess(`User ${userName} deleted successfully.`);
      loadUsers();
      loadStats();
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setActionError(getErrorMessage(err) || 'Failed to delete user');
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/announcements', newAnnouncement);
      setActionSuccess('Announcement published successfully!');
      setShowAddAnnounceModal(false);
      setNewAnnouncement({
        title: '',
        content: '',
        category: 'academic',
        targetRole: 'all',
        isPinned: false
      });
      loadAnnouncements();
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setActionError(getErrorMessage(err) || 'Failed to publish announcement');
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    try {
      await api.delete(`/admin/announcements/${id}`);
      loadAnnouncements();
    } catch {}
  };

  return (
    <div className="admin-page-container">
      {/* Header Banner */}
      <div className="admin-header-banner">
        <div>
          <div className="admin-badge">
            <ShieldCheck size={14} />
            <span>Institutional Administration & Control Center</span>
          </div>
          <h2>Academic & User Management Hub</h2>
          <p>
            Oversee students, mentors, curriculum hierarchy, assessments, and academic policies.
          </p>
        </div>
        <button
          type="button"
          className="button button-secondary button-small"
          onClick={() => {
            loadStats();
            if (activeTab === 'users') loadUsers();
            if (activeTab === 'announcements') loadAnnouncements();
          }}
        >
          <RefreshCw size={14} />
          <span>Refresh Data</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="profile-alert success">
          <CheckCircle2 size={16} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="profile-alert error">
          <AlertCircle size={16} />
          <span>{actionError}</span>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="admin-nav-tabs">
        <button
          type="button"
          className={`admin-nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Sliders size={16} />
          <span>Platform Overview</span>
        </button>

        <button
          type="button"
          className={`admin-nav-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={16} />
          <span>Users & Mentors ({stats.totalStudents + stats.totalMentors})</span>
        </button>

        <button
          type="button"
          className={`admin-nav-btn ${activeTab === 'curriculum' ? 'active' : ''}`}
          onClick={() => setActiveTab('curriculum')}
        >
          <BookOpen size={16} />
          <span>Curriculum Hierarchy (6 Sem / 29 Courses)</span>
        </button>

        <button
          type="button"
          className={`admin-nav-btn ${activeTab === 'announcements' ? 'active' : ''}`}
          onClick={() => setActiveTab('announcements')}
        >
          <Bell size={16} />
          <span>Announcements ({announcements.length})</span>
        </button>

        <button
          type="button"
          className={`admin-nav-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <BarChart3 size={16} />
          <span>Institutional Analytics</span>
        </button>
      </div>

      {/* -------------------------------------------------------------
          TAB 1: Overview
          ------------------------------------------------------------- */}
      {activeTab === 'overview' && (
        <div className="admin-overview-grid">
          <div className="admin-stat-card">
            <div className="admin-stat-icon blue">
              <Users size={22} />
            </div>
            <div className="admin-stat-info">
              <span className="stat-val">{stats.totalStudents}</span>
              <span className="stat-lbl">Enrolled Students</span>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon purple">
              <GraduationCap size={22} />
            </div>
            <div className="admin-stat-info">
              <span className="stat-val">{stats.totalMentors + stats.totalSeniorMentors}</span>
              <span className="stat-lbl">Active Mentors & Supervisors</span>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon amber">
              <BookOpen size={22} />
            </div>
            <div className="admin-stat-info">
              <span className="stat-val">29</span>
              <span className="stat-lbl">Courses Across 6 Semesters</span>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon green">
              <Award size={22} />
            </div>
            <div className="admin-stat-info">
              <span className="stat-val">{stats.quizPassRate}%</span>
              <span className="stat-lbl">Institutional Quiz Pass Rate</span>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 2: Users Management Directory
          ------------------------------------------------------------- */}
      {activeTab === 'users' && (
        <div className="admin-users-section">
          {/* Controls Bar */}
          <div className="admin-controls-row">
            <div className="admin-search-wrapper">
              <Search size={15} />
              <input
                type="text"
                placeholder="Search by student name, email, or roll no..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') loadUsers();
                }}
              />
            </div>

            <div className="admin-filter-group">
              <select
                value={userRoleFilter}
                onChange={(e) => {
                  setUserRoleFilter(e.target.value);
                  setUserPage(1);
                }}
              >
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="mentor">Mentors</option>
                <option value="senior_mentor">Senior Mentors</option>
                <option value="admin">Administrators</option>
              </select>

              <button
                type="button"
                className="button button-primary button-small"
                onClick={() => setShowAddUserModal(true)}
              >
                <Plus size={14} />
                <span>Add User</span>
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="history-table-container">
            <table className="history-table">
              <thead>
                <tr>
                  <th>User & Email</th>
                  <th>Role</th>
                  <th>Enrollment / Batch</th>
                  <th>Semester</th>
                  <th>Assigned Mentor</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <strong style={{ fontSize: '13.5px' }}>{u.name}</strong>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{u.email}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`type-pill ${u.role === 'student' ? 'quiz' : 'assessment'}`}>
                        {u.role?.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12.5px' }}>
                        {u.enrollmentNumber || 'N/A'}{u.batch ? ` • ${u.batch}` : ''}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>Sem {u.semester || 1}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {u.mentorId?.name || 'Unassigned'}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="button button-ghost button-small"
                        onClick={() => handleDeleteUser(u._id, u.name)}
                        title="Delete user record"
                      >
                        <Trash2 size={14} color="#ef4444" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="admin-pagination-row">
              <button
                type="button"
                disabled={userPage <= 1}
                onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                className="button button-secondary button-small"
              >
                <ChevronLeft size={14} />
                <span>Previous</span>
              </button>
              <span>Page {userPage} of {totalPages}</span>
              <button
                type="button"
                disabled={userPage >= totalPages}
                onClick={() => setUserPage((p) => p + 1)}
                className="button button-secondary button-small"
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 3: Curriculum Hierarchy Explorer
          ------------------------------------------------------------- */}
      {activeTab === 'curriculum' && (
        <div className="admin-curriculum-overview">
          <div className="admin-card-header">
            <h3>Academic Course Hierarchy (Academic Year 2024–2025)</h3>
            <span className="soft-badge">29 Official University Courses</span>
          </div>

          <div className="admin-semester-cards-grid">
            {officialSemesters.map((sem) => (
              <div key={sem.semester} className="admin-sem-card">
                <h4>Semester {sem.semester} ({sem.subjects.length} Subjects)</h4>
                <div className="admin-sem-subjects-list">
                  {sem.subjects.map((sub) => (
                    <div key={sub.code} className="admin-sub-item">
                      <span className="sub-code-badge">{sub.code}</span>
                      <span className="sub-title-text">{sub.name}</span>
                      <span className="sub-credits-chip">{sub.credits} Credits</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 4: Announcements
          ------------------------------------------------------------- */}
      {activeTab === 'announcements' && (
        <div className="admin-announcements-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Institutional Announcements</h3>
            <button
              type="button"
              className="button button-primary button-small"
              onClick={() => setShowAddAnnounceModal(true)}
            >
              <Plus size={14} />
              <span>New Announcement</span>
            </button>
          </div>

          <div className="admin-announcements-list">
            {announcements.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No active announcements. Publish your first institutional notice.</p>
            ) : (
              announcements.map((a) => (
                <div key={a._id} className="admin-announcement-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span className="announcement-tag">{a.category?.toUpperCase()}</span>
                      <h4 style={{ margin: '4px 0' }}>{a.title}</h4>
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>{a.content}</p>
                    </div>
                    <button
                      type="button"
                      className="button button-ghost button-small"
                      onClick={() => handleDeleteAnnouncement(a._id)}
                    >
                      <Trash2 size={14} color="#ef4444" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 5: Institutional Performance Analytics (Item 43)
          ------------------------------------------------------------- */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Filters Bar */}
          <div className="admin-search-bar" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, marginRight: '6px', color: 'var(--text-secondary)' }}>
                  Semester Filter:
                </span>
                <select
                  className="admin-select"
                  value={analyticsSemester}
                  onChange={(e) => setAnalyticsSemester(e.target.value)}
                >
                  <option value="all">All Semesters (1–6)</option>
                  {[1, 2, 3, 4, 5, 6].map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>

              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, marginRight: '6px', color: 'var(--text-secondary)' }}>
                  Batch Filter:
                </span>
                <select
                  className="admin-select"
                  value={analyticsBatch}
                  onChange={(e) => setAnalyticsBatch(e.target.value)}
                >
                  <option value="all">All Academic Batches</option>
                  <option value="current">Current Academic Cohort</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              className="button button-secondary button-small"
              onClick={loadAnalytics}
              disabled={loadingAnalytics}
            >
              <RefreshCw size={14} className={loadingAnalytics ? 'spin' : ''} />
              <span>Refresh Analytics</span>
            </button>
          </div>

          {loadingAnalytics ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--card-bg)', borderRadius: '1rem' }}>
              <p>Aggregating institutional scores, syllabus completion rates, and topic failure metrics…</p>
            </div>
          ) : analyticsError ? (
            <div className="profile-alert error">
              <AlertCircle size={16} />
              <span>{analyticsError}</span>
            </div>
          ) : analyticsData ? (
            <>
              {/* Activity Trend KPI Cards */}
              <div className="admin-overview-grid">
                <div className="admin-stat-card">
                  <div className="admin-stat-icon green">
                    <Users size={22} />
                  </div>
                  <div className="admin-stat-info">
                    <span className="stat-val">{analyticsData.activeLast7Days}</span>
                    <span className="stat-lbl">Active Past 7 Days</span>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-icon blue">
                    <Users size={22} />
                  </div>
                  <div className="admin-stat-info">
                    <span className="stat-val">{analyticsData.activeLast30Days}</span>
                    <span className="stat-lbl">Active Past 30 Days</span>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-icon red">
                    <AlertCircle size={22} />
                  </div>
                  <div className="admin-stat-info">
                    <span className="stat-val">{analyticsData.inactiveStudents}</span>
                    <span className="stat-lbl">Inactive (&gt; 7 Days)</span>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-icon purple">
                    <GraduationCap size={22} />
                  </div>
                  <div className="admin-stat-info">
                    <span className="stat-val">{analyticsData.totalStudentsCount}</span>
                    <span className="stat-lbl">Total Enrolled Cohort</span>
                  </div>
                </div>
              </div>

              {/* Semester-wise Performance Breakdown */}
              <div className="admin-table-card">
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: 'var(--text-primary)' }}>
                  Semester-wise Academic Performance & Progress
                </h3>
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Semester</th>
                        <th>Students</th>
                        <th>Average Quiz Score</th>
                        <th>Quiz Pass Rate</th>
                        <th>Curriculum Completion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.semesterBreakdown?.map((sem) => (
                        <tr key={sem.semester}>
                          <td>
                            <strong>Semester {sem.semester}</strong>
                          </td>
                          <td>{sem.studentCount} students</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '80px', height: '6px', background: 'rgba(0,0,0,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${sem.averageQuizScore}%`, height: '100%', background: '#4f46e5' }} />
                              </div>
                              <span style={{ fontWeight: 700 }}>{sem.averageQuizScore}%</span>
                            </div>
                          </td>
                          <td>
                            <span style={{ fontWeight: 700, color: sem.quizPassRate >= 70 ? '#15803d' : '#b91c1c' }}>
                              {sem.quizPassRate}%
                            </span>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '4px' }}>
                              ({sem.totalAttempts} attempts)
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '80px', height: '6px', background: 'rgba(0,0,0,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${sem.completionRate}%`, height: '100%', background: '#10b981' }} />
                              </div>
                              <span>{sem.completionRate}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Common Weak Topics Across Institution */}
              <div className="admin-table-card">
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: 'var(--text-primary)' }}>
                  Common Weak Topics Across Institution (Requires Academic Intervention)
                </h3>
                {analyticsData.commonWeakTopics?.length > 0 ? (
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Subject Code</th>
                          <th>Topic Focus</th>
                          <th>Average Score</th>
                          <th>Total Attempts</th>
                          <th>Failure Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData.commonWeakTopics.map((item, idx) => (
                          <tr key={idx}>
                            <td>
                              <span className="announcement-tag">{item.subjectCode}</span>
                            </td>
                            <td>
                              <strong>{item.topic}</strong>
                            </td>
                            <td style={{ fontWeight: 700 }}>
                              {item.averageScore}%
                            </td>
                            <td>{item.totalAttempts} attempts</td>
                            <td>
                              <span style={{ fontWeight: 800, color: '#ef4444', background: '#fee2e2', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                                {item.failureRate}% Failed
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '13px' }}>
                    No recurring weak topics detected with multiple failed attempts.
                  </p>
                )}
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="attempt-modal-backdrop" onClick={() => setShowAddUserModal(false)}>
          <div className="attempt-modal-card" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="attempt-modal-header">
              <h3>Create New User Account</h3>
            </div>
            <form onSubmit={handleCreateUser} className="attempt-modal-body">
              <div className="profile-field">
                <label>Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                />
              </div>

              <div className="profile-field">
                <label>Institutional Email</label>
                <input
                  type="email"
                  required
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                />
              </div>

              <div className="profile-field">
                <label>Temporary Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                />
              </div>

              <div className="profile-field-row">
                <div className="profile-field">
                  <label>Role</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                  >
                    <option value="student">Student</option>
                    <option value="mentor">Mentor</option>
                    <option value="senior_mentor">Senior Mentor</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div className="profile-field">
                  <label>Semester</label>
                  <select
                    value={newUserForm.semester}
                    onChange={(e) => setNewUserForm({ ...newUserForm, semester: Number(e.target.value) })}
                  >
                    {[1, 2, 3, 4, 5, 6].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="attempt-modal-footer">
                <button type="button" className="button button-secondary" onClick={() => setShowAddUserModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="button button-primary">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Announcement Modal */}
      {showAddAnnounceModal && (
        <div className="attempt-modal-backdrop" onClick={() => setShowAddAnnounceModal(false)}>
          <div className="attempt-modal-card" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="attempt-modal-header">
              <h3>Publish Announcement</h3>
            </div>
            <form onSubmit={handleCreateAnnouncement} className="attempt-modal-body">
              <div className="profile-field">
                <label>Title</label>
                <input
                  type="text"
                  required
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                />
              </div>

              <div className="profile-field">
                <label>Category</label>
                <select
                  value={newAnnouncement.category}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, category: e.target.value })}
                >
                  <option value="academic">Academic Notice</option>
                  <option value="exam">Examinations</option>
                  <option value="placement">Placement & Internships</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="profile-field">
                <label>Content</label>
                <textarea
                  rows={4}
                  required
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                />
              </div>

              <div className="attempt-modal-footer">
                <button type="button" className="button button-secondary" onClick={() => setShowAddAnnounceModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="button button-primary">
                  Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
