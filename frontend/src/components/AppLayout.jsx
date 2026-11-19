import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Award,
  Bell,
  BookOpen,
  Bot,
  Briefcase,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  CircleHelp,
  Code2,
  Compass,
  FolderGit2,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  NotebookTabs,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Sparkles,
  Trophy,
  User,
  Users,
  ShieldCheck,
  X
} from 'lucide-react';
import { api, unwrap } from '../services/api.js';
import { clearCredentials } from '../state/authSlice.js';
import ThemeToggle from './ThemeToggle.jsx';
import { allSubjects } from '../data/curriculumData.js';
import { getSocket } from '../services/socket.js';
import './AppLayout.css';

const defaultNavItems = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/curriculum', label: 'Curriculum', icon: BookOpen },
  { to: '/learning', label: 'My Lessons', icon: NotebookTabs },
  { to: '/planner', label: 'Study Planner', icon: CalendarDays },
  { to: '/quizzes', label: 'Quizzes', icon: CheckSquare, badge: 'Active' },
  { to: '/coding', label: 'Code Practice', icon: Code2 },
  { to: '/community', label: 'Community', icon: Users },
  { to: '/ai-assistant', label: 'AI Mentor', icon: Bot, badge: 'AI' },
  { to: '/projects', label: 'Projects', icon: FolderGit2 },
  { to: '/career', label: 'Career & Placement', icon: Compass },
  { to: '/portfolio', label: 'My Portfolio', icon: Award },
  { to: '/progress', label: 'My Progress', icon: ChartNoAxesColumnIncreasing },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
];

export default function AppLayout() {
  const user = useSelector((state) => state.auth.user) || {};
  const token = useSelector((state) => state.auth.token);
  const role = String(user.role || 'student').toLowerCase();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  // Real-time Notifications State (Items 41 & 42)
  const [notificationsList, setNotificationsList] = useState([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  const searchInputRef = useRef(null);
  const searchWrapRef = useRef(null);
  const notificationsRef = useRef(null);
  const profileMenuRef = useRef(null);

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await api.get('/notifications');
      const data = unwrap(res);
      setNotificationsList(data?.notifications || []);
      setUnreadNotificationsCount(data?.unreadCount || 0);
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const socket = getSocket(token);
    if (!socket) return;

    const handleNewNotif = (notif) => {
      setNotificationsList((prev) => [notif, ...prev]);
      setUnreadNotificationsCount((c) => c + 1);
    };

    socket.on('notification:new', handleNewNotif);
    return () => {
      socket.off('notification:new', handleNewNotif);
    };
  }, [token]);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotificationsList((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadNotificationsCount(0);
    } catch {}
  };

  const navItems = (() => {
    if (role === 'admin' || role === 'super_admin') {
      return [
        { to: '/admin', label: 'Admin Hub', icon: ShieldCheck },
        { to: '/mentor', label: 'Student Monitoring', icon: GraduationCap },
        { to: '/ai-assistant', label: 'AI Learning Hub', icon: Bot, badge: 'AI' },
        { to: '/coding', label: 'Coding Platform', icon: Code2 },
        { to: '/community', label: 'Community Feed', icon: Users },
        { to: '/curriculum', label: 'Curriculum Catalog', icon: BookOpen },
        { to: '/quizzes', label: 'Assessment Engine', icon: CheckSquare },
        { to: '/projects', label: 'Projects Review', icon: FolderGit2 },
        { to: '/career', label: 'Career Hub', icon: Compass },
        { to: '/leaderboard', label: 'Leaderboard', icon: Trophy }
      ];
    }
    if (role === 'scrum') {
      return [
        { to: '/mentor', label: 'Scrum Oversight', icon: GraduationCap },
        { to: '/quizzes', label: 'Quizzes & Tests', icon: CheckSquare },
        { to: '/ai-assistant', label: 'AI Learning Hub', icon: Bot, badge: 'AI' },
        { to: '/coding', label: 'Coding Practice', icon: Code2 },
        { to: '/community', label: 'Community Feed', icon: Users },
        { to: '/projects', label: 'Project Milestones', icon: FolderGit2 },
        { to: '/curriculum', label: 'Curriculum Catalog', icon: BookOpen },
        { to: '/career', label: 'Career Hub', icon: Compass },
        { to: '/leaderboard', label: 'Leaderboard', icon: Trophy }
      ];
    }
    if (role === 'mentor' || role === 'senior_mentor') {
      return [
        { to: '/mentor', label: role === 'senior_mentor' ? 'Group Monitoring' : 'My Students', icon: GraduationCap },
        { to: '/quizzes', label: 'Quizzes & Tests', icon: CheckSquare },
        { to: '/ai-assistant', label: 'AI Learning Hub', icon: Bot, badge: 'AI' },
        { to: '/coding', label: 'Coding Practice', icon: Code2 },
        { to: '/community', label: 'Community Feed', icon: Users },
        { to: '/projects', label: 'Project Reviews', icon: FolderGit2 },
        { to: '/curriculum', label: 'Curriculum Guide', icon: BookOpen },
        { to: '/learning', label: 'Course Lessons', icon: NotebookTabs },
        { to: '/career', label: 'Career Hub', icon: Compass },
        { to: '/leaderboard', label: 'Leaderboard', icon: Trophy }
      ];
    }
    return defaultNavItems;
  })();

  const activeLabel = [...navItems, { to: '/mentor', label: 'Mentor Space' }].find(
    (item) => item.to === location.pathname
  )?.label || 'Overview';

  const initials = (user.name || 'Student')
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  // Keyboard shortcut Ctrl+K / Cmd+K for search & Escape to dismiss
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchOpen(true);
      } else if (e.key === 'Escape') {
        setSearchOpen(false);
        setNotificationsOpen(false);
        setProfileOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter subjects for live search
  const filteredSearchResults = searchQuery.trim().length > 1
    ? (allSubjects || []).filter((sub) =>
        sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sub.code && sub.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (sub.category && sub.category.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 5)
    : [];

  async function logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // Offline fallback
    } finally {
      dispatch(clearCredentials());
      navigate('/login', { replace: true });
    }
  }

  return (
    <div
      className={`modern-app-shell ${collapsed ? 'sidebar-collapsed' : ''} ${
        mobileOpen ? 'mobile-nav-open' : ''
      }`}
    >
      {/* ====================================================================
          Sidebar
          ==================================================================== */}
      <aside className="modern-sidebar" aria-label="Main Navigation">
        <div className="modern-sidebar-header">
          <Link to="/" className="modern-sidebar-brand" title="BCA Student Success Platform">
            <div className="modern-brand-icon">
              <GraduationCap size={22} />
            </div>
            {!collapsed && (
              <div className="modern-brand-info">
                <span className="modern-brand-title">Classroom</span>
                <span className="modern-brand-subtitle">Student Portal</span>
              </div>
            )}
          </Link>
          <button
            type="button"
            className="modern-sidebar-toggle-btn desktop-only"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
          <button
            type="button"
            className="modern-sidebar-close-btn mobile-only"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="modern-sidebar-nav-container">
          {!collapsed && <span className="modern-nav-section-title">Academic Workspace</span>}
          {navItems.map(({ to, label, icon: Icon, badge }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `modern-nav-item ${isActive ? 'active' : ''}`
              }
            >
              <div className="modern-nav-icon-wrap">
                <Icon size={19} strokeWidth={2} />
              </div>
              <span className="modern-nav-label">{label}</span>
              {badge && <span className="modern-nav-badge">{badge}</span>}
              {/* Floating Tooltip when Collapsed */}
              <span className="modern-nav-tooltip" role="tooltip">
                {label}
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="modern-sidebar-footer">
          {!collapsed && (
            <div className="modern-sidebar-card">
              <div className="modern-sidebar-card-icon">
                <Sparkles size={16} />
              </div>
              <div className="modern-sidebar-card-text">
                <strong>
                  {role === 'scrum'
                    ? 'Scrum Leadership'
                    : role === 'mentor' || role === 'senior_mentor'
                    ? 'Faculty Portal'
                    : role === 'admin' || role === 'super_admin'
                    ? 'Administration'
                    : 'BCA (Hons. with Research)'}
                </strong>
                <span>
                  {role === 'scrum'
                    ? 'Scrum Master · Cohort Lead'
                    : role === 'mentor' || role === 'senior_mentor'
                    ? 'Academic Mentor'
                    : role === 'admin' || role === 'super_admin'
                    ? 'System Administrator'
                    : `Semester ${user.semester || 1} · Active Learner`}
                </span>
              </div>
            </div>
          )}

          <div className="modern-sidebar-profile-box">
            <div className="modern-sidebar-avatar-wrap">
              <div className="modern-sidebar-avatar">
                {initials}
              </div>
              <span className="modern-nav-tooltip" role="tooltip">
                {user.name || 'Student'}
              </span>
            </div>
            {!collapsed && (
              <div className="modern-sidebar-user-details">
                <span className="modern-sidebar-user-name">{user.name || 'Student'}</span>
                <span className="modern-sidebar-user-role">
                  {user.enrollmentNumber || user.email || 'BCA Candidate'}
                </span>
              </div>
            )}
            <div className="modern-sidebar-logout-wrap">
              <button
                type="button"
                className="modern-sidebar-logout-btn"
                onClick={logout}
                aria-label="Sign out"
              >
                <LogOut size={16} />
              </button>
              <span className="modern-nav-tooltip" role="tooltip">
                Sign Out
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Backdrop */}
      <div
        className="modern-mobile-scrim"
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* ====================================================================
          Main Area (Topbar + Outlet + Footer)
          ==================================================================== */}
      <div className="modern-main-area">
        <header className="modern-topbar">
          <div className="modern-topbar-left">
            <button
              type="button"
              className="modern-mobile-toggle-btn mobile-only"
              aria-label="Open mobile menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="modern-topbar-breadcrumbs desktop-only">
              <span className="modern-breadcrumb-root">Workspace</span>
              <span className="modern-breadcrumb-sep">/</span>
              <span className="modern-breadcrumb-current">{activeLabel}</span>
            </div>
            <div className="modern-topbar-mobile-title mobile-only">
              <strong>{activeLabel}</strong>
            </div>
          </div>

          {/* Search Box with Shortcut */}
          <div className="modern-topbar-search-wrap" ref={searchWrapRef}>
            <div className="modern-topbar-search-box">
              <Search size={16} className="modern-search-icon" />
              <input
                ref={searchInputRef}
                type="text"
                className="modern-search-input"
                placeholder="Search subjects, lessons, quizzes..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
              />
              <span className="modern-search-shortcut">⌘K</span>
            </div>

            {/* Quick Live Search Results Dropdown */}
            {searchOpen && searchQuery.trim().length > 1 && (
              <div className="modern-search-dropdown">
                {filteredSearchResults.length > 0 ? (
                  filteredSearchResults.map((item) => (
                    <Link
                      key={item.id}
                      to="/curriculum"
                      className="modern-search-dropdown-item"
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery('');
                      }}
                    >
                      <BookOpen size={14} style={{ color: 'var(--color-primary)' }} />
                      <div>
                        <strong>{item.name}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {item.code} · {item.category}
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div style={{ padding: '10px 14px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                    No matching course found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Topbar Right Actions */}
          <div className="modern-topbar-right">
            <div className="modern-program-badge">
              <span className="modern-program-dot" />
              <span>BCA Hons.</span>
            </div>

            {/* Theme Toggle Button */}
            <ThemeToggle variant="icon" />

            {/* Notifications Icon & Drawer */}
            <div ref={notificationsRef} style={{ position: 'relative' }}>
              <button
                type="button"
                className="modern-icon-action-btn"
                aria-label="Notifications"
                title="Notifications"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <Bell size={18} />
                {unreadNotificationsCount > 0 && (
                  <span className="modern-notification-badge" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'white', fontWeight: 700 }}>
                    {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="modern-notifications-menu" style={{ width: '320px' }}>
                  <div className="modern-notifications-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>Notifications</strong>
                    {unreadNotificationsCount > 0 ? (
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        style={{ background: 'transparent', border: 'none', color: 'var(--color-primary)', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Mark All Read
                      </button>
                    ) : (
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>All caught up</span>
                    )}
                  </div>
                  <div className="modern-notification-list" style={{ maxHeight: '340px', overflowY: 'auto' }}>
                    {notificationsList.length > 0 ? (
                      notificationsList.map((notif) => (
                        <div
                          key={notif._id}
                          className="modern-notification-item"
                          style={{ opacity: notif.isRead ? 0.75 : 1, cursor: notif.link ? 'pointer' : 'default' }}
                          onClick={() => {
                            if (notif.link) {
                              setNotificationsOpen(false);
                              navigate(notif.link);
                            }
                          }}
                        >
                          <CheckCircle2 size={16} style={{ color: notif.type === 'achievement' ? '#f59e0b' : 'var(--color-primary)', flexShrink: 0, marginTop: '2px' }} />
                          <div>
                            <strong style={{ display: 'block', fontSize: '12px' }}>{notif.title}</strong>
                            <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>{notif.message}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="modern-notification-item">
                        <CheckCircle2 size={16} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <strong>Welcome to Classroom BCA</strong>
                          <span>Your real-time notifications for quizzes, assignments, and updates will appear here.</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Menu */}
            <div ref={profileMenuRef} style={{ position: 'relative' }}>
              <button
                type="button"
                className="modern-topbar-user-trigger"
                onClick={() => setProfileOpen(!profileOpen)}
                aria-label="User profile options"
              >
                <div className="modern-topbar-avatar">{initials}</div>
                <div className="modern-topbar-user-info">
                  <span className="modern-topbar-user-name">{user.name || 'Student'}</span>
                  <span className="modern-topbar-user-sub">Semester {user.semester || 1}</span>
                </div>
                <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
              </button>

              {profileOpen && (
                <div className="modern-user-profile-menu">
                  <div className="modern-profile-menu-header">
                    <strong>{user.name || 'Student'}</strong>
                    <span>{user.email}</span>
                  </div>
                  <div className="modern-profile-menu-links">
                    <Link
                      to="/profile"
                      className="modern-profile-menu-link"
                      onClick={() => setProfileOpen(false)}
                    >
                      <User size={16} />
                      <span>My Profile & Goals</span>
                    </Link>
                    <Link
                      to="/portfolio"
                      className="modern-profile-menu-link"
                      onClick={() => setProfileOpen(false)}
                    >
                      <Award size={16} />
                      <span>My Academic Portfolio</span>
                    </Link>
                    {(role === 'admin' || role === 'super_admin') && (
                      <Link
                        to="/admin"
                        className="modern-profile-menu-link"
                        onClick={() => setProfileOpen(false)}
                      >
                        <ShieldCheck size={16} />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                    <Link
                      to="/progress"
                      className="modern-profile-menu-link"
                      onClick={() => setProfileOpen(false)}
                    >
                      <ChartNoAxesColumnIncreasing size={16} />
                      <span>Academic Progress</span>
                    </Link>
                    <Link
                      to="/curriculum"
                      className="modern-profile-menu-link"
                      onClick={() => setProfileOpen(false)}
                    >
                      <BookOpen size={16} />
                      <span>Course Syllabus</span>
                    </Link>
                    <button
                      type="button"
                      className="modern-profile-menu-link logout"
                      onClick={logout}
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="modern-page-content">
          <Outlet />
        </main>

        <footer className="modern-page-footer">
          <span>BCA (Hons. with Research) Program</span>
          <strong>CLASSROOM STUDENT SUCCESS PLATFORM</strong>
        </footer>
      </div>
    </div>
  );
}
