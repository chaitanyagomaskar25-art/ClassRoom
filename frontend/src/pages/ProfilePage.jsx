import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  User,
  Mail,
  Phone,
  BookOpen,
  GraduationCap,
  Sparkles,
  Award,
  Flame,
  CheckCircle2,
  AlertCircle,
  Save,
  Plus,
  X,
  Target,
  Compass,
  Layers,
  Calendar,
  Hash,
  ShieldCheck
} from 'lucide-react';
import { api, getErrorMessage, unwrap } from '../services/api.js';
import { updateUser } from '../state/authSlice.js';
import './ProfilePage.css';

const avatarPresets = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
];

export default function ProfilePage() {
  const currentUser = useSelector((state) => state.auth.user) || {};
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    name: currentUser.name || '',
    email: currentUser.email || '',
    phone: currentUser.phone || '',
    bio: currentUser.bio || '',
    avatar: currentUser.avatar || currentUser.profilePhoto || avatarPresets[0],
    enrollmentNumber: currentUser.enrollmentNumber || '',
    semester: currentUser.semester || 1,
    academicYear: currentUser.academicYear || 'Academic Year',
    batch: currentUser.batch || '',
    section: currentUser.section || 'A',
    program: currentUser.program || 'BCA (Hons. with Research)',
    skills: currentUser.skills || ['JavaScript', 'HTML/CSS', 'Python', 'Data Structures'],
    interests: currentUser.interests || ['Artificial Intelligence', 'Web Development', 'Cloud Computing'],
    careerGoals: currentUser.careerGoals || 'Become a Full Stack Software Engineer and AI Solutions Architect.'
  });

  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Sync profile data on mount
  useEffect(() => {
    api.get('/profiles/me')
      .then((res) => {
        const p = unwrap(res).profile;
        if (p) {
          setForm((prev) => ({
            ...prev,
            name: p.name || prev.name,
            email: p.email || prev.email,
            phone: p.phone || prev.phone,
            bio: p.bio || prev.bio,
            avatar: p.avatar || p.profilePhoto || prev.avatar,
            enrollmentNumber: p.enrollmentNumber || prev.enrollmentNumber,
            semester: p.semester || prev.semester,
            academicYear: p.academicYear || prev.academicYear,
            batch: p.batch || prev.batch,
            section: p.section || prev.section,
            program: p.program || prev.program,
            skills: p.skills?.length ? p.skills : prev.skills,
            interests: p.interests?.length ? p.interests : prev.interests,
            careerGoals: p.careerGoals || prev.careerGoals
          }));
        }
      })
      .catch(() => {});
  }, []);

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !form.skills.includes(newSkill.trim())) {
      setForm((prev) => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove)
    }));
  };

  const handleAddInterest = (e) => {
    e.preventDefault();
    if (newInterest.trim() && !form.interests.includes(newInterest.trim())) {
      setForm((prev) => ({ ...prev, interests: [...prev.interests, newInterest.trim()] }));
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interestToRemove) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.filter((i) => i !== interestToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await api.patch('/profiles/me', {
        name: form.name.trim(),
        bio: form.bio.trim(),
        avatar: form.avatar,
        profilePhoto: form.avatar,
        phone: form.phone.trim(),
        enrollmentNumber: form.enrollmentNumber.trim(),
        semester: Number(form.semester) || 1,
        academicYear: form.academicYear,
        batch: form.batch,
        section: form.section,
        skills: form.skills,
        interests: form.interests,
        careerGoals: form.careerGoals.trim()
      });

      const updated = unwrap(res).profile;
      dispatch(updateUser(updated));
      setSuccessMsg(`Your student profile has been updated! Active coursework is now set to Semester ${form.semester}.`);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setErrorMsg(getErrorMessage(err) || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page-container">
      {/* Page Header */}
      <div className="profile-header-banner">
        <div className="profile-avatar-wrapper">
          <img src={form.avatar} alt={form.name} className="profile-avatar-img" />
          <span className="profile-role-badge">
            <GraduationCap size={14} />
            <span>{currentUser.role?.toUpperCase() || 'STUDENT'}</span>
          </span>
        </div>

        <div className="profile-header-info">
          <h2>{form.name || 'Student Name'}</h2>
          <p className="profile-sub-tag">
            {form.program} • Semester {form.semester} • Batch {form.batch}
          </p>
          <div className="profile-quick-stats">
            <span className="profile-stat-chip">
              <Hash size={13} />
              <span>{form.enrollmentNumber || 'BCA2024001'}</span>
            </span>
            <span className="profile-stat-chip">
              <Flame size={13} color="#f59e0b" />
              <span>Streak: Active</span>
            </span>
            <span className="profile-stat-chip">
              <ShieldCheck size={13} color="#10b981" />
              <span>Verified Student</span>
            </span>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="profile-alert success">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="profile-alert error">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Profile Form Grid */}
      <form onSubmit={handleSubmit} className="profile-edit-grid">
        {/* Left Column: Personal & Academic Details */}
        <div className="profile-card">
          <div className="profile-card-header">
            <User size={18} />
            <h3>Personal & Academic Details</h3>
          </div>

          <div className="profile-field-row">
            <div className="profile-field">
              <label>Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="profile-field">
              <label>Institutional Email</label>
              <input type="email" value={form.email} disabled className="disabled-input" />
            </div>
          </div>

          <div className="profile-field-row">
            <div className="profile-field">
              <label>Contact Phone</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            <div className="profile-field">
              <label>Enrollment / Roll Number</label>
              <input
                type="text"
                value={form.enrollmentNumber}
                onChange={(e) => setForm({ ...form, enrollmentNumber: e.target.value })}
              />
            </div>
          </div>

          <div className="profile-field-row" style={{ alignItems: 'flex-start' }}>
            <div className="profile-field" style={{ flex: '1 1 60%' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BookOpen size={15} color="#4f46e5" />
                <span>Enrolled Academic Semester *</span>
              </label>
              <select
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })}
                style={{ fontWeight: 600 }}
              >
                <option value={1}>Semester 1 · Computing Foundations & Core Principles</option>
                <option value={2}>Semester 2 · Web Technologies, OOP & Systems Design</option>
                <option value={3}>Semester 3 · React, Data Structures & Cloud Computing</option>
                <option value={4}>Semester 4 · Backend Systems, Databases & Microservices</option>
                <option value={5}>Semester 5 · Artificial Intelligence, ML & Capstone I</option>
                <option value={6}>Semester 6 · Advanced Analytics, Cloud & Final Capstone II</option>
              </select>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary, #64748b)', marginTop: '4px', display: 'block' }}>
                Changing your semester updates your Dashboard, Curriculum, Learning lessons, and Quizzes to focus on that semester.
              </span>
            </div>

            <div className="profile-field" style={{ flex: '1 1 35%' }}>
              <label>Academic Year</label>
              <input
                type="text"
                value={form.academicYear || ''}
                onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
              />
            </div>
          </div>

          <div className="profile-field">
            <label>Personal Bio</label>
            <textarea
              rows={3}
              placeholder="Tell mentors and peers about your academic interests and background..."
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>

          <div className="profile-field">
            <label>Choose Avatar Preset</label>
            <div className="avatar-presets-grid">
              {avatarPresets.map((preset, idx) => (
                <img
                  key={idx}
                  src={preset}
                  alt={`Preset ${idx + 1}`}
                  className={`avatar-preset-thumbnail ${form.avatar === preset ? 'selected' : ''}`}
                  onClick={() => setForm({ ...form, avatar: preset })}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Skills, Interests & Career Goals */}
        <div className="profile-card">
          <div className="profile-card-header">
            <Sparkles size={18} />
            <h3>Skills, Interests & Career Goals</h3>
          </div>

          {/* Skills Management */}
          <div className="profile-field">
            <label>Technical & Core Skills</label>
            <div className="tag-pills-container">
              {form.skills.map((skill, idx) => (
                <span key={idx} className="tag-pill skill">
                  <span>{skill}</span>
                  <button type="button" onClick={() => handleRemoveSkill(skill)} aria-label="Remove skill">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="tag-input-wrapper">
              <input
                type="text"
                placeholder="Add skill (e.g. React, C++, SQL)..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddSkill(e);
                }}
              />
              <button type="button" onClick={handleAddSkill} className="tag-add-btn">
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Interests Management */}
          <div className="profile-field">
            <label>Academic & Tech Interests</label>
            <div className="tag-pills-container">
              {form.interests.map((interest, idx) => (
                <span key={idx} className="tag-pill interest">
                  <span>{interest}</span>
                  <button type="button" onClick={() => handleRemoveInterest(interest)} aria-label="Remove interest">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="tag-input-wrapper">
              <input
                type="text"
                placeholder="Add interest (e.g. Cybersecurity, Machine Learning)..."
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddInterest(e);
                }}
              />
              <button type="button" onClick={handleAddInterest} className="tag-add-btn">
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Career Goals */}
          <div className="profile-field">
            <label>Career Goals & Aspirations</label>
            <textarea
              rows={4}
              placeholder="Outline your immediate learning goals and career objectives..."
              value={form.careerGoals}
              onChange={(e) => setForm({ ...form, careerGoals: e.target.value })}
            />
          </div>

          <div className="profile-submit-wrapper">
            <button type="submit" className="button button-primary" disabled={saving}>
              <Save size={16} />
              <span>{saving ? 'Saving to Database...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
