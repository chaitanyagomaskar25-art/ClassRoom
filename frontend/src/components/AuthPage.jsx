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
  X
} from 'lucide-react';
import { api, getErrorMessage, unwrap } from '../services/api.js';
import { setCredentials } from '../state/authSlice.js';
import ThemeToggle from './ThemeToggle.jsx';
import './AuthPage.css';

export default function AuthPage({ register = false }) {
  const [form, setForm] = useState({
    name: '',
    email: localStorage.getItem('classroom_remembered_email') || '',
    password: '',
    confirmPassword: '',
    semester: 1,
    enrollmentNumber: '',
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

  if (token) return <Navigate to="/dashboard" replace />;

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
            semester: Number(form.semester) || 1,
            ...(form.enrollmentNumber?.trim() ? { enrollmentNumber: form.enrollmentNumber.trim() } : {})
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
      setSuccessMessage(register ? 'Student account created successfully! Redirecting to workspace…' : 'Signed in successfully! Redirecting to workspace…');
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 700);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  const fillDemoStudent = () => {
    setForm((prev) => ({
      ...prev,
      name: 'Aarav Student',
      email: 'student@demo.local',
      password: 'Student123!'
    }));
    setError('');
  };

  const fillDemoMentor = () => {
    setForm((prev) => ({
      ...prev,
      name: 'Asha Mentor',
      email: 'mentor@demo.local',
      password: 'Mentor123!'
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
            <span>Eternal University · BCA Platform</span>
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
              <>Join Eternal University's specialized learning environment designed for BCA Hons. with Research students. Access verified semester curricula, interactive notes, and instant quizzes.</>
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
            <span>Official Eternal University Student Success System</span>
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
              {register ? <UserPlus size={24} /> : <GraduationCap size={24} />}
            </div>

            <h2 className="auth-card-heading">
              {register ? 'Create your student account' : 'Sign in to your space'}
            </h2>
            <p className="auth-card-subtitle">
              {register
                ? 'Fill in your academic profile details to get immediate access to your curriculum.'
                : 'Enter your credentials to continue your learning journey.'}
            </p>

            {/* Quick Demo Credentials Autofill Pill (Login Only) */}
            {!register && (
              <div className="auth-demo-pill">
                <span>
                  Quick Demo: <strong>student@demo.local</strong>
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button type="button" className="auth-demo-btn" onClick={fillDemoStudent}>
                    Student
                  </button>
                  <button type="button" className="auth-demo-btn" style={{ background: '#059669' }} onClick={fillDemoMentor}>
                    Mentor
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
                      placeholder="e.g. Aarav Sharma"
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
                    placeholder={register ? "e.g. yourname@eternaluniversity.edu.in" : "student@demo.local or email"}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="auth-text-input"
                  />
                </div>
              </div>

              {/* Semester & Student ID Row (Register only) */}
              {register && (
                <div className="auth-fields-row">
                  <div className="auth-field-group">
                    <label className="auth-field-label" htmlFor="register-semester">
                      Current Semester *
                    </label>
                    <div className="auth-input-wrapper">
                      <GraduationCap size={18} className="auth-field-icon" />
                      <select
                        id="register-semester"
                        value={form.semester}
                        onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })}
                        className="auth-select-input"
                      >
                        <option value={1}>Semester 1 (Foundations)</option>
                        <option value={2}>Semester 2 (Web Dev & AI)</option>
                        <option value={3}>Semester 3 (React & Core)</option>
                        <option value={4}>Semester 4 (Backend & Cloud)</option>
                        <option value={5}>Semester 5 (AI & Capstone)</option>
                        <option value={6}>Semester 6 (Data Science)</option>
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
                    I agree to the Eternal University academic integrity &amp; student guidelines.
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
              <span>Protected by institutional encryption · Eternal University</span>
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
