import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  Eye,
  EyeOff,
  Flame,
  GraduationCap,
  Hash,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
  UserPlus,
  Users,
  X
} from 'lucide-react';
import { api, getErrorMessage, unwrap } from '../services/api.js';
import { setCredentials } from '../state/authSlice.js';
import ThemeToggle from './ThemeToggle.jsx';
import './AuthPage.css';

export default function AuthPage({ register = false }) {
  const [selectedRole, setSelectedRole] = useState('student'); // 'student' | 'mentor' | 'scrum'
  const [form, setForm] = useState({
    name: '',
    email: localStorage.getItem('classroom_remembered_email') || '',
    password: '',
    confirmPassword: '',
    semester: '',
    enrollmentNumber: '',
    department: 'Computer Science & Applications',
    programTrack: 'BCA Agile Sprint Cohort',
    agreeTerms: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(
    Boolean(localStorage.getItem('classroom_remember_me') === 'true')
  );
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const currentUser = useSelector((state) => state.auth.user) || {};

  if (token) {
    const role = currentUser.role || 'student';
    if (role === 'scrum' || role === 'mentor' || role === 'senior_mentor') {
      return <Navigate to="/mentor" replace />;
    }
    if (role === 'admin' || role === 'super_admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    // Client-side validations for registration
    if (register) {
      if (!form.name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (selectedRole === 'student') {
        if (!form.semester || Number(form.semester) < 1 || Number(form.semester) > 6) {
          setError('Please choose your enrolled semester (Semester 1 to 6) to proceed.');
          return;
        }
      }
      if (form.password.length < 8) {
        setError('Password must be at least 8 characters long.');
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match. Please verify both password fields.');
        return;
      }
      if (!form.agreeTerms) {
        setError('Please agree to the academic guidelines and terms to proceed.');
        return;
      }
    }

    setLoading(true);

    try {
      const payload = register
        ? {
            name: form.name.trim(),
            email: form.email.trim().toLowerCase(),
            password: form.password,
            role: selectedRole,
            ...(selectedRole === 'student'
              ? {
                  semester: Number(form.semester),
                  ...(form.enrollmentNumber?.trim() ? { enrollmentNumber: form.enrollmentNumber.trim() } : {})
                }
              : {}),
            ...(selectedRole === 'mentor'
              ? {
                  institution: form.department?.trim() || 'Computer Science & Applications',
                  program: 'BCA (Hons. with Research)',
                  ...(form.enrollmentNumber?.trim() ? { enrollmentNumber: form.enrollmentNumber.trim() } : {})
                }
              : {}),
            ...(selectedRole === 'scrum'
              ? {
                  program: form.programTrack?.trim() || 'BCA Agile Sprint Cohort',
                  institution: form.department?.trim() || 'Computer Science & Applications',
                  ...(form.enrollmentNumber?.trim() ? { enrollmentNumber: form.enrollmentNumber.trim() } : {})
                }
              : {})
          }
        : {
            email: form.email.trim().toLowerCase(),
            password: form.password
          };

      const response = await api.post(register ? '/auth/register' : '/auth/login', payload);
      const result = unwrap(response);
      if (!result.token || !result.user) {
        throw new Error('The server returned an incomplete authentication response.');
      }

      if (rememberMe) {
        localStorage.setItem('classroom_remember_me', 'true');
        localStorage.setItem('classroom_remembered_email', form.email);
      } else {
        localStorage.removeItem('classroom_remember_me');
        localStorage.removeItem('classroom_remembered_email');
      }

      dispatch(setCredentials(result));
      const userRole = result.user?.role || selectedRole;
      const roleTitle =
        userRole === 'scrum'
          ? 'Scrum Master'
          : userRole === 'mentor' || userRole === 'senior_mentor'
          ? 'Teacher / Mentor'
          : 'Student';

      setSuccessMessage(
        register
          ? `${roleTitle} account created successfully! Redirecting…`
          : `Signed in as ${roleTitle}! Redirecting…`
      );

      setTimeout(() => {
        if (userRole === 'scrum' || userRole === 'mentor' || userRole === 'senior_mentor') {
          navigate('/mentor', { replace: true });
        } else if (userRole === 'admin' || userRole === 'super_admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }, 700);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  const fillDemoStudent = () => {
    setSelectedRole('student');
    setForm((prev) => ({
      ...prev,
      name: 'Aarav Student',
      email: 'student@demo.local',
      password: 'Student123!',
      semester: 3
    }));
    setError('');
  };

  const fillDemoMentor = () => {
    setSelectedRole('mentor');
    setForm((prev) => ({
      ...prev,
      name: 'Asha Mentor',
      email: 'mentor@demo.local',
      password: 'Mentor123!'
    }));
    setError('');
  };

  const fillDemoScrum = () => {
    setSelectedRole('scrum');
    setForm((prev) => ({
      ...prev,
      name: 'Priya Sharma (Scrum Lead)',
      email: 'scrum@demo.local',
      password: 'Scrum123!'
    }));
    setError('');
  };

  return (
    <div className="auth-page-root">
      {/* ====================================================================
          LEFT SIDE: Attractive Branding, Illustration & Story Panel
          ==================================================================== */}
      <section className="auth-hero-pane">
        <div className="auth-ambient-orbs" aria-hidden="true">
          <div className="auth-orb auth-orb-1" />
          <div className="auth-orb auth-orb-2" />
        </div>

        {/* Top Brand Logo */}
        <Link className="auth-brand-lockup" to="/">
          <span className="auth-brand-mark">C</span>
          <span className="auth-brand-text">classroom</span>
          <span className="auth-brand-badge">BCA Hons.</span>
        </Link>

        {/* Story & Welcome Message */}
        <div className="auth-hero-copy">
          <div className="auth-eyebrow-pill">
            <Sparkles size={13} />
            <span>BCA Student Success Platform</span>
          </div>

          <h1 className="auth-hero-title">
            {register ? (
              <>Embark on your BCA journey with purpose.</>
            ) : (
              <>Welcome back to your academic space.</>
            )}
          </h1>

          <p className="auth-hero-desc">
            {register ? (
              <>Join the specialized learning environment designed for BCA Hons. with Research students. Access verified semester curricula, interactive notes, and instant quizzes.</>
            ) : (
              <>Track your study streaks, master semester syllabi, review quiz scores, and stay connected with faculty mentors.</>
            )}
          </p>

          {/* Interactive Feature Showcase Card */}
          <div className="auth-showcase-card">
            {register ? (
              <>
                <div className="auth-card-row">
                  <span className="auth-badge-student">
                    <GraduationCap size={15} />
                    <span>Degree Inclusions</span>
                  </span>
                  <span className="auth-streak-pill" style={{ color: '#6ee7b7', background: 'rgba(110, 231, 183, 0.15)', borderColor: 'rgba(110, 231, 183, 0.3)' }}>
                    <CheckCircle2 size={13} />
                    <span>Free for Students</span>
                  </span>
                </div>

                <div className="auth-benefits-checklist">
                  <div className="auth-benefit-item">
                    <span className="auth-benefit-icon"><Check size={12} /></span>
                    <span><strong>Official 6-Semester Roadmap:</strong> From computing foundations to data science capstone.</span>
                  </div>
                  <div className="auth-benefit-item">
                    <span className="auth-benefit-icon"><Check size={12} /></span>
                    <span><strong>29 Mapped Core Subjects:</strong> C, C++, Web Development, DBMS, AI, and Cloud.</span>
                  </div>
                  <div className="auth-benefit-item">
                    <span className="auth-benefit-icon"><Check size={12} /></span>
                    <span><strong>Instant Self-Assessment Quizzes:</strong> Instant evaluation, answer breakdowns & streak tracking.</span>
                  </div>
                  <div className="auth-benefit-item">
                    <span className="auth-benefit-icon"><Check size={12} /></span>
                    <span><strong>Collaborative Mentorship:</strong> Direct academic feedback loops with department faculty.</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="auth-card-row">
                  <span className="auth-badge-student">
                    <GraduationCap size={15} />
                    <span>BCA Hons. with Research</span>
                  </span>
                  <span className="auth-streak-pill">
                    <Flame size={14} />
                    <span>5-Day Streak Active</span>
                  </span>
                </div>

                <div className="auth-progress-box">
                  <div className="auth-progress-label">
                    <span>Semester 2: Data Structures & OOP</span>
                    <span>88% Mastery</span>
                  </div>
                  <div className="auth-progress-track">
                    <div className="auth-progress-fill" style={{ width: '88%' }} />
                  </div>
                </div>

                <div className="auth-highlights-row">
                  <div className="auth-highlight-item">
                    <span className="auth-hl-num">6</span>
                    <span className="auth-hl-txt">Semesters</span>
                  </div>
                  <div className="auth-highlight-item">
                    <span className="auth-hl-num">29</span>
                    <span className="auth-hl-txt">Subjects</span>
                  </div>
                  <div className="auth-highlight-item">
                    <span className="auth-hl-num">100%</span>
                    <span className="auth-hl-txt">Instant Quiz</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bottom Security Assurance */}
        <div className="auth-hero-footer">
          <div className="auth-security-tag">
            <ShieldCheck size={16} />
            <span>Official Student Success System</span>
          </div>
          <span>Semesters 1—6</span>
        </div>
      </section>

      {/* ====================================================================
          RIGHT SIDE: Elegant Form inside a Clean Card
          ==================================================================== */}
      <section className="auth-form-pane">
        <div className={`auth-form-container ${register ? 'register-mode' : ''}`}>
          {/* Top Actions: Back to Home + Theme Toggle */}
          <div className="auth-top-actions">
            <Link to="/" className="auth-back-link">
              <ArrowLeft size={16} />
              <span>Back to Home</span>
            </Link>
            <ThemeToggle />
          </div>

          {/* Mobile Brand Link */}
          <div className="auth-mobile-header">
            <Link className="auth-brand-lockup" to="/" style={{ color: 'var(--text-primary)' }}>
              <span className="auth-brand-mark" style={{ background: 'var(--color-primary)', color: '#fff' }}>C</span>
              <span className="auth-brand-text">classroom</span>
            </Link>
          </div>

          <div className="auth-card-wrapper">
            <div className="auth-card-top-icon">
              {selectedRole === 'scrum' ? (
                <ShieldCheck size={24} />
              ) : selectedRole === 'mentor' ? (
                <Users size={24} />
              ) : register ? (
                <UserPlus size={24} />
              ) : (
                <GraduationCap size={24} />
              )}
            </div>

            {/* 3-Role Selection Tabs (Student / Teacher-Mentor / Scrum Master) */}
            <div className="auth-role-selector-wrap">
              <div className="auth-role-tabs">
                <button
                  type="button"
                  className={`auth-role-tab-btn ${selectedRole === 'student' ? 'active' : ''}`}
                  onClick={() => setSelectedRole('student')}
                >
                  <GraduationCap size={16} />
                  <span>Student</span>
                </button>
                <button
                  type="button"
                  className={`auth-role-tab-btn role-mentor ${selectedRole === 'mentor' ? 'active role-mentor' : ''}`}
                  onClick={() => setSelectedRole('mentor')}
                >
                  <Users size={16} />
                  <span>Teacher / Mentor</span>
                </button>
                <button
                  type="button"
                  className={`auth-role-tab-btn role-scrum ${selectedRole === 'scrum' ? 'active role-scrum' : ''}`}
                  onClick={() => setSelectedRole('scrum')}
                >
                  <ShieldCheck size={16} />
                  <span>Scrum Master</span>
                </button>
              </div>

              <div
                className={`auth-role-badge-desc ${
                  selectedRole === 'mentor'
                    ? 'role-mentor'
                    : selectedRole === 'scrum'
                    ? 'role-scrum'
                    : ''
                }`}
              >
                <Sparkles size={14} />
                <span>
                  {selectedRole === 'student' &&
                    'Student: View semester coursework, submit assignments & play quizzes'}
                  {selectedRole === 'mentor' &&
                    'Teacher / Mentor: View all students, create quizzes & assignments'}
                  {selectedRole === 'scrum' &&
                    'Scrum Master: Oversee all mentors & all students, quizzes & assignments'}
                </span>
              </div>
            </div>

            <h2 className="auth-card-heading">
              {register
                ? selectedRole === 'scrum'
                  ? 'Register as Scrum Master'
                  : selectedRole === 'mentor'
                  ? 'Register as Teacher / Mentor'
                  : 'Register as Student'
                : selectedRole === 'scrum'
                ? 'Sign in as Scrum Master'
                : selectedRole === 'mentor'
                ? 'Sign in as Teacher / Mentor'
                : 'Sign in to your space'}
            </h2>
            <p className="auth-card-subtitle">
              {register
                ? selectedRole === 'scrum'
                  ? 'Set up your Scrum account to supervise mentors, cohorts, and academic sprints.'
                  : selectedRole === 'mentor'
                  ? 'Set up your mentor account to monitor students, publish quizzes, and grade assignments.'
                  : 'Fill in your academic profile to get immediate access to your semester curriculum.'
                : 'Enter your credentials to continue to your dashboard.'}
            </p>

            {/* Quick Demo Credentials Autofill Pill (Login Only) */}
            {!register && (
              <div className="auth-demo-pill">
                <span>
                  Demo Credentials:
                </span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button type="button" className="auth-demo-btn" onClick={fillDemoStudent}>
                    Student
                  </button>
                  <button
                    type="button"
                    className="auth-demo-btn"
                    style={{ background: '#059669' }}
                    onClick={fillDemoMentor}
                  >
                    Teacher
                  </button>
                  <button
                    type="button"
                    className="auth-demo-btn"
                    style={{ background: '#4f46e5' }}
                    onClick={fillDemoScrum}
                  >
                    Scrum Master
                  </button>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={submit} className="auth-form-body">
              {/* Full Name (Register only) */}
              {register && (
                <div className="auth-field-group">
                  <label className="auth-field-label" htmlFor="register-name">
                    Full Name *
                  </label>
                  <div className="auth-input-wrapper">
                    <User size={18} className="auth-field-icon" />
                    <input
                      id="register-name"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder={
                        selectedRole === 'scrum'
                          ? 'e.g. Priya Sharma (Scrum Lead)'
                          : selectedRole === 'mentor'
                          ? 'e.g. Dr. Rajesh Kumar (Faculty)'
                          : 'e.g. Aarav Sharma'
                      }
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="auth-text-input"
                    />
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div className="auth-field-group">
                <label className="auth-field-label" htmlFor="auth-email">
                  University Email Address *
                </label>
                <div className="auth-input-wrapper">
                  <Mail size={18} className="auth-field-icon" />
                  <input
                    id="auth-email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder={
                      register
                        ? 'e.g. yourname@university.edu'
                        : selectedRole === 'scrum'
                        ? 'scrum@demo.local'
                        : selectedRole === 'mentor'
                        ? 'mentor@demo.local'
                        : 'student@demo.local'
                    }
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="auth-text-input"
                  />
                </div>
              </div>

              {/* Role-Specific Fields (Register only) */}
              {register && selectedRole === 'student' && (
                <div className="auth-fields-row">
                  <div className="auth-field-group">
                    <label className="auth-field-label" htmlFor="register-semester">
                      Choose Your Semester *
                    </label>
                    <div className="auth-input-wrapper">
                      <GraduationCap size={18} className="auth-field-icon" />
                      <select
                        id="register-semester"
                        value={form.semester}
                        onChange={(e) =>
                          setForm({ ...form, semester: e.target.value ? Number(e.target.value) : '' })
                        }
                        className="auth-select-input"
                        required
                      >
                        <option value="" disabled>
                          -- Select Your Semester (1 to 6) * --
                        </option>
                        <option value={1}>Semester 1 (Computing Foundations &amp; Core)</option>
                        <option value={2}>Semester 2 (Web Dev, OOP &amp; Systems)</option>
                        <option value={3}>Semester 3 (React, Data Structures &amp; Cloud)</option>
                        <option value={4}>Semester 4 (Backend, Distributed DB &amp; Cloud)</option>
                        <option value={5}>Semester 5 (Artificial Intelligence &amp; Capstone)</option>
                        <option value={6}>Semester 6 (Advanced Analytics &amp; Research)</option>
                      </select>
                      <ChevronDown size={15} style={{ color: '#9395a5', pointerEvents: 'none' }} />
                    </div>
                  </div>

                  <div className="auth-field-group">
                    <label className="auth-field-label" htmlFor="register-enrollment">
                      Roll / ID Number
                    </label>
                    <div className="auth-input-wrapper">
                      <Hash size={17} className="auth-field-icon" />
                      <input
                        id="register-enrollment"
                        type="text"
                        placeholder="e.g. BCA2026001 (optional)"
                        value={form.enrollmentNumber}
                        onChange={(e) => setForm({ ...form, enrollmentNumber: e.target.value })}
                        className="auth-text-input"
                      />
                    </div>
                  </div>
                </div>
              )}

              {register && selectedRole === 'mentor' && (
                <div className="auth-fields-row">
                  <div className="auth-field-group">
                    <label className="auth-field-label" htmlFor="mentor-department">
                      Department / Specialization *
                    </label>
                    <div className="auth-input-wrapper">
                      <Users size={17} className="auth-field-icon" />
                      <input
                        id="mentor-department"
                        type="text"
                        required
                        placeholder="e.g. Computer Science &amp; Applications"
                        value={form.department}
                        onChange={(e) => setForm({ ...form, department: e.target.value })}
                        className="auth-text-input"
                      />
                    </div>
                  </div>

                  <div className="auth-field-group">
                    <label className="auth-field-label" htmlFor="mentor-faculty-id">
                      Faculty / Staff ID
                    </label>
                    <div className="auth-input-wrapper">
                      <Hash size={17} className="auth-field-icon" />
                      <input
                        id="mentor-faculty-id"
                        type="text"
                        placeholder="e.g. FAC2026-CS (optional)"
                        value={form.enrollmentNumber}
                        onChange={(e) => setForm({ ...form, enrollmentNumber: e.target.value })}
                        className="auth-text-input"
                      />
                    </div>
                  </div>
                </div>
              )}

              {register && selectedRole === 'scrum' && (
                <div className="auth-fields-row">
                  <div className="auth-field-group">
                    <label className="auth-field-label" htmlFor="scrum-program">
                      Program / Sprint Cohort *
                    </label>
                    <div className="auth-input-wrapper">
                      <ShieldCheck size={17} className="auth-field-icon" />
                      <input
                        id="scrum-program"
                        type="text"
                        required
                        placeholder="e.g. BCA Agile Sprint Cohort"
                        value={form.programTrack}
                        onChange={(e) => setForm({ ...form, programTrack: e.target.value })}
                        className="auth-text-input"
                      />
                    </div>
                  </div>

                  <div className="auth-field-group">
                    <label className="auth-field-label" htmlFor="scrum-id">
                      Scrum Master ID
                    </label>
                    <div className="auth-input-wrapper">
                      <Hash size={17} className="auth-field-icon" />
                      <input
                        id="scrum-id"
                        type="text"
                        placeholder="e.g. SCRUM-BCA-01 (optional)"
                        value={form.enrollmentNumber}
                        onChange={(e) => setForm({ ...form, enrollmentNumber: e.target.value })}
                        className="auth-text-input"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Password Field with Show/Hide */}
              <div className="auth-field-group">
                <label className="auth-field-label" htmlFor="auth-password">
                  {register ? 'Password (min. 8 characters) *' : 'Password *'}
                </label>
                <div className="auth-input-wrapper">
                  <LockKeyhole size={18} className="auth-field-icon" />
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={register ? 8 : 1}
                    autoComplete={register ? 'new-password' : 'current-password'}
                    placeholder={register ? 'Choose a strong password (8+ characters)' : 'Enter your password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="auth-text-input"
                  />
                  <button
                    type="button"
                    className="auth-toggle-pwd-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {register && (
                  <span className="auth-pwd-hint">
                    <ShieldCheck size={12} color="#10b981" />
                    Must contain at least 8 characters.
                  </span>
                )}
              </div>

              {/* Confirm Password Field (Register only) */}
              {register && (
                <div className="auth-field-group">
                  <label className="auth-field-label" htmlFor="register-confirm-password">
                    Confirm Password *
                  </label>
                  <div className="auth-input-wrapper">
                    <LockKeyhole size={18} className="auth-field-icon" />
                    <input
                      id="register-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      placeholder="Repeat your password"
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      className="auth-text-input"
                    />
                    <button
                      type="button"
                      className="auth-toggle-pwd-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Terms Checkbox (Register only) */}
              {register && (
                <label className="auth-remember-label" style={{ marginTop: '2px' }}>
                  <input
                    type="checkbox"
                    checked={form.agreeTerms}
                    onChange={(e) => setForm({ ...form, agreeTerms: e.target.checked })}
                    className="auth-checkbox"
                  />
                  <span style={{ fontSize: '12px', lineHeight: '1.4' }}>
                    I agree to the academic integrity &amp; student guidelines.
                  </span>
                </label>
              )}

              {/* Remember Me and Forgot Password (on Login) */}
              {!register && (
                <div className="auth-options-row">
                  <label className="auth-remember-label">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="auth-checkbox"
                    />
                    <span>Remember me</span>
                  </label>

                  <button
                    type="button"
                    className="auth-forgot-link"
                    onClick={() => setForgotModalOpen(true)}
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Success Alert */}
              {successMessage && (
                <div className="auth-alert-success" role="status">
                  <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Error Alert */}
              {error && (
                <div className="auth-alert-error" role="alert">
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>{error}</span>
                  <button
                    type="button"
                    onClick={() => setError('')}
                    className="auth-alert-dismiss"
                    aria-label="Dismiss error"
                  >
                    <X size={15} />
                  </button>
                </div>
              )}

              {/* Gradient Login / Register Button */}
              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading || Boolean(successMessage)}
              >
                {loading ? (
                  <>
                    <span className="auth-btn-spinner" />
                    <span>{register ? 'Creating your account…' : 'Verifying credentials…'}</span>
                  </>
                ) : successMessage ? (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Success! Redirecting…</span>
                  </>
                ) : (
                  <>
                    <span>{register ? 'Create Student Account' : 'Sign In to Account'}</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            {/* Switch between Login and Register */}
            <div className="auth-switch-box">
              {register ? (
                <>
                  Already registered?
                  <Link to="/login" className="auth-switch-link">
                    Sign in to your account
                  </Link>
                </>
              ) : (
                <>
                  New to the platform?
                  <Link to="/register" className="auth-switch-link">
                    Create an account
                  </Link>
                </>
              )}
            </div>

            <div className="auth-card-footer">
              <ShieldCheck size={14} color="#10b981" />
              <span>Protected by institutional encryption</span>
            </div>
          </div>
        </div>
      </section>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="forgot-modal-backdrop" onClick={() => setForgotModalOpen(false)}>
          <div className="forgot-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="forgot-modal-icon">
              <LockKeyhole size={24} />
            </div>
            <h3 className="forgot-modal-title">Password Reset Assistance</h3>
            <p className="forgot-modal-desc">
              For security reasons, password resets for the BCA Hons. with Research portal are managed by your departmental academic administrator.
              <br /><br />
              <strong>Testing the platform?</strong> You can sign in using the seed account:
              <br />
              Email: <code style={{ background: '#f3f0fb', padding: '2px 6px', borderRadius: 4, color: '#7864c8' }}>student@demo.local</code>
              <br />
              Password: <code style={{ background: '#f3f0fb', padding: '2px 6px', borderRadius: 4, color: '#7864c8' }}>Student123!</code>
            </p>
            <button className="forgot-modal-btn" onClick={() => setForgotModalOpen(false)}>
              Got it, thanks!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
