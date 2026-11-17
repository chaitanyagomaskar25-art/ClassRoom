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

function Protected({ children }) {
  const { token } = useSelector((state) => state.auth);
  return token ? children : <Navigate to="/login" replace />;
}

function RoleProtected({ children, roles }) {
  const { token, user } = useSelector((state) => state.auth);
  if (!token) return <Navigate to="/login" replace />;
  return roles.includes(String(user?.role || '').toLowerCase()) ? children : <Navigate to="/dashboard" replace />;
}

function HomeRedirect() {
  const user = useSelector((state) => state.auth.user);
  return String(user?.role || '').toLowerCase() === 'mentor'
    ? <Navigate to="/mentor" replace />
    : <Dashboard />;
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
        if (active) setCheckingSession(false);
      });
    return () => { active = false; };
  }, [dispatch, sessionRetry, token]);

  if (checkingSession) {
    return <div className="startup-screen"><div className="brand-mark">C</div><span>Getting your classroom ready…</span></div>;
  }

  return <>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage register />} />
      <Route element={<Protected><AppLayout /></Protected>}>
        <Route path="/dashboard" element={<HomeRedirect />} />
        <Route path="/curriculum" element={<Curriculum />} />
        <Route path="/learning" element={<RoleProtected roles={['student']}><Learning /></RoleProtected>} />
        <Route path="/quizzes" element={<RoleProtected roles={['student']}><Quizzes /></RoleProtected>} />
        <Route path="/progress" element={<RoleProtected roles={['student']}><Progress /></RoleProtected>} />
        <Route path="/mentor" element={<RoleProtected roles={['mentor', 'admin']}><Mentor /></RoleProtected>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    {sessionError && token && <div className="session-alert" role="alert"><span>Couldn’t verify your session: {sessionError}</span><button onClick={() => setSessionRetry((value) => value + 1)}>Retry</button></div>}
  </>;
}
