import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { api, getErrorMessage, unwrap } from './services/api.js';
import { clearCredentials, updateUser } from './state/authSlice.js';
import AuthPage from './components/AuthPage.jsx';
import AppLayout from './components/AppLayout.jsx';
import LandingPage from './pages/LandingPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Curriculum from './pages/Curriculum.jsx';
import Learning from './pages/Learning.jsx';
import Quizzes from './pages/Quizzes.jsx';
import Progress from './pages/Progress.jsx';
import Mentor from './pages/Mentor.jsx';
import StudyPlanner from './pages/StudyPlanner.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import Projects from './pages/Projects.jsx';
import Portfolio from './pages/Portfolio.jsx';
import CareerHub from './pages/CareerHub.jsx';
import AIAssistant from './pages/AIAssistant.jsx';
import CodingPlatform from './pages/CodingPlatform.jsx';
import Community from './pages/Community.jsx';

function Protected({ children }) {
  const { token } = useSelector((state) => state.auth);
  return token ? children : <Navigate to="/login" replace />;
}

function RoleProtected({ children, roles }) {
  const { token, user } = useSelector((state) => state.auth);
  if (!token) return <Navigate to="/login" replace />;
  const userRole = String(user?.role || '').toLowerCase();
  const isAllowed =
    roles.includes(userRole) ||
    (roles.includes('admin') && userRole === 'super_admin') ||
    (roles.includes('mentor') && userRole === 'senior_mentor');
  return isAllowed ? children : <Navigate to="/dashboard" replace />;
}

function HomeRedirect() {
  const user = useSelector((state) => state.auth.user);
  const role = String(user?.role || '').toLowerCase();
  if (role === 'admin' || role === 'super_admin') {
    return <Navigate to="/admin" replace />;
  }
  if (role === 'mentor' || role === 'senior_mentor' || role === 'scrum') {
    return <Navigate to="/mentor" replace />;
  }
  return <Dashboard />;
}

export default function App() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const [checkingSession, setCheckingSession] = useState(Boolean(token));
  const [sessionError, setSessionError] = useState('');
  const [sessionRetry, setSessionRetry] = useState(0);

  useEffect(() => {
    if (!token) {
      setCheckingSession(false);
      setSessionError('');
      return;
    }
    let active = true;
    const safetyTimer = setTimeout(() => {
      if (active) {
        console.warn('Session check safety timeout reached; displaying application.');
        setCheckingSession(false);
      }
    }, 3500);

    setSessionError('');
    api.get('/auth/me')
      .then((response) => {
        if (active) dispatch(updateUser(unwrap(response).user || unwrap(response)));
      })
      .catch((requestError) => {
        if (!active) return;
        if (requestError.response?.status === 401) dispatch(clearCredentials());
        else setSessionError(getErrorMessage(requestError));
      })
      .finally(() => {
        clearTimeout(safetyTimer);
        if (active) setCheckingSession(false);
      });
    return () => {
      active = false;
      clearTimeout(safetyTimer);
    };
  }, [dispatch, sessionRetry, token]);

  if (checkingSession) {
    return (
      <div className="startup-screen">
        <div className="brand-mark">C</div>
        <span>Getting your classroom ready…</span>
        <button
          type="button"
          onClick={() => setCheckingSession(false)}
          style={{
            marginTop: '16px',
            background: 'none',
            border: 'none',
            color: '#6366f1',
            cursor: 'pointer',
            fontSize: '13px',
            textDecoration: 'underline'
          }}
        >
          Skip &amp; Continue
        </button>
      </div>
    );
  }

  return <>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage register />} />
      <Route path="/portfolio/:studentId" element={<Portfolio />} />
      <Route element={<Protected><AppLayout /></Protected>}>
        <Route path="/dashboard" element={<HomeRedirect />} />
        <Route path="/curriculum" element={<Curriculum />} />
        <Route path="/learning" element={<RoleProtected roles={['student', 'mentor', 'admin', 'scrum']}><Learning /></RoleProtected>} />
        <Route path="/learning/:subjectId" element={<RoleProtected roles={['student', 'mentor', 'admin', 'scrum']}><Learning /></RoleProtected>} />
        <Route path="/lessons" element={<RoleProtected roles={['student', 'mentor', 'admin', 'scrum']}><Learning /></RoleProtected>} />
        <Route path="/lessons/:subjectId" element={<RoleProtected roles={['student', 'mentor', 'admin', 'scrum']}><Learning /></RoleProtected>} />
        <Route path="/planner" element={<RoleProtected roles={['student', 'mentor', 'scrum']}><StudyPlanner /></RoleProtected>} />
        <Route path="/study-planner" element={<Navigate to="/planner" replace />} />
        <Route path="/quizzes" element={<RoleProtected roles={['student', 'mentor', 'admin', 'scrum']}><Quizzes /></RoleProtected>} />
        <Route path="/progress" element={<RoleProtected roles={['student', 'mentor', 'admin', 'scrum']}><Progress /></RoleProtected>} />
        <Route path="/mentor" element={<RoleProtected roles={['mentor', 'senior_mentor', 'admin', 'scrum']}><Mentor /></RoleProtected>} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/projects" element={<RoleProtected roles={['student', 'mentor', 'admin', 'scrum']}><Projects /></RoleProtected>} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/portfolio/:studentId" element={<Portfolio />} />
        <Route path="/career" element={<RoleProtected roles={['student', 'mentor', 'admin', 'scrum']}><CareerHub /></RoleProtected>} />
        <Route path="/coding" element={<RoleProtected roles={['student', 'mentor', 'admin', 'scrum']}><CodingPlatform /></RoleProtected>} />
        <Route path="/community" element={<Community />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
        <Route path="/ai-mentor" element={<Navigate to="/ai-assistant" replace />} />
        <Route path="/ai" element={<Navigate to="/ai-assistant" replace />} />
        <Route path="/resume" element={<Navigate to="/career" replace />} />
        <Route path="/placement" element={<Navigate to="/career" replace />} />
        <Route path="/admin" element={<RoleProtected roles={['admin', 'super_admin', 'scrum']}><AdminDashboard /></RoleProtected>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    {sessionError && token && <div className="session-alert" role="alert"><span>Couldn’t verify your session: {sessionError}</span><button onClick={() => setSessionRetry((value) => value + 1)}>Retry</button></div>}
  </>;
}
