import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, BookOpen, ChartNoAxesColumnIncreasing, CheckSquare, ChevronDown, CircleHelp, GraduationCap, LayoutDashboard, LogOut, Menu, NotebookTabs, PanelLeftClose, PanelLeftOpen, Sparkles, X } from 'lucide-react';
import { clearCredentials } from '../state/authSlice.js';

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/curriculum', label: 'Curriculum', icon: BookOpen },
  { to: '/learning', label: 'My lessons', icon: NotebookTabs },
  { to: '/quizzes', label: 'Quizzes', icon: CheckSquare },
  { to: '/progress', label: 'My progress', icon: ChartNoAxesColumnIncreasing },
];

export default function AppLayout() {
  const user = useSelector((state) => state.auth.user) || {};
  const role = String(user.role || 'student').toLowerCase();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const activeLabel = [...navItems, { to: '/mentor', label: 'Mentor space' }].find((item) => item.to === location.pathname)?.label || 'Overview';
  const initials = (user.name || 'Student').split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  const items = role === 'mentor' || role === 'admin'
    ? [{ to: '/mentor', label: role === 'admin' ? 'Student monitoring' : 'My students', icon: GraduationCap }]
    : navItems;

  function logout() {
    dispatch(clearCredentials());
    navigate('/login', { replace: true });
  }

  return (
    <div className={`app-shell ${collapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'mobile-nav-open' : ''}`}>
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }} title="Visit Homepage">
            <span className="brand-mark">C</span>
            {!collapsed && <span className="brand-word">classroom</span>}
          </Link>
          <button className="icon-button sidebar-toggle" aria-label={collapsed ? 'Expand menu' : 'Collapse menu'} onClick={() => setCollapsed(!collapsed)}>{collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}</button>
        </div>
        <div className="workspace-tag">{!collapsed && <><span className="workspace-dot" /> STUDENT WORKSPACE</>}</div>
        <nav className="side-nav" aria-label="Main navigation">
          {!collapsed && <span className="nav-caption">YOUR SPACE</span>}
          {items.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} title={collapsed ? label : undefined} onClick={() => setMobileOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Icon size={19} strokeWidth={1.8} /><span>{label}</span>{label === 'Quizzes' && <span className="nav-indicator" />}</NavLink>)}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip"><span className="tip-icon"><Sparkles size={15} /></span>{!collapsed && <div><strong>Small steps add up</strong><span>Consistency beats cramming.</span></div>}</div>
          <button className="nav-link help-link" title={collapsed ? 'Help & support' : undefined}><CircleHelp size={19} /><span>Help &amp; support</span></button>
          <div className="sidebar-profile">
            <div className="avatar avatar-small">{initials}</div>{!collapsed && <div className="profile-text"><strong>{user.name || 'Student'}</strong><span>{user.role || 'Student'}</span></div>}
            <button className="icon-button logout-button" onClick={logout} aria-label="Sign out" title="Sign out"><LogOut size={17} /></button>
          </div>
        </div>
      </aside>
      <div className="mobile-scrim" onClick={() => setMobileOpen(false)} />
      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Open menu" onClick={() => setMobileOpen(true)}><Menu size={20} /></button>
          <div className="breadcrumbs"><span>Workspace</span><span className="crumb-separator">/</span><strong>{activeLabel}</strong></div>
          <div className="topbar-actions">
            <span className="term-chip"><span className="workspace-dot" /> BCA learning space</span>
            <button className="icon-button notification-button" aria-label="Notifications"><Bell size={19} /><i /></button>
            <button className="topbar-user" onClick={() => setProfileOpen(!profileOpen)}><span className="avatar avatar-tiny">{initials}</span><ChevronDown size={15} /></button>
            {profileOpen && <div className="profile-menu"><strong>{user.name || 'Student'}</strong><span>{user.email}</span><button onClick={logout}><LogOut size={15} /> Sign out</button></div>}
          </div>
        </header>
        <div className="page-content"><Outlet /></div>
        <footer className="page-footer"><span>Made for the way you learn.</span><span>CLASSROOM <i>·</i> BCA STUDENT SUCCESS</span></footer>
      </main>
      <button className="mobile-close" aria-label="Close menu" onClick={() => setMobileOpen(false)}><X size={20} /></button>
    </div>
  );
}
