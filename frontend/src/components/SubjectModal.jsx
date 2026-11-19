import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Code2,
  ExternalLink,
  GraduationCap,
  Hash,
  Layers,
  Lock,
  Sparkles,
  Target,
  Wrench,
  X
} from 'lucide-react';
import SubjectIcon from './SubjectIcon.jsx';
import './SubjectModal.css';

export default function SubjectModal({ subject, semester, colors, onClose }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  if (!subject) return null;

  const semNumber = semester || subject.semester || 1;
  const user = useSelector((state) => state.auth?.user) || {};
  const studentSem = user?.role === 'student' && user?.semester ? Number(user.semester) : null;
  const isEnrolledSem = !studentSem || Number(semNumber) === studentSem;

  const primaryColor = colors?.primary || '#6366f1';
  const lightColor = colors?.light || 'rgba(99, 102, 241, 0.12)';
  const primaryDarkColor = colors?.primaryDark || '#4f46e5';

  const hasObjectives = Array.isArray(subject.objectives) && subject.objectives.length > 0;
  const hasUnits = Array.isArray(subject.units) && subject.units.length > 0;
  const hasLabWork = Array.isArray(subject.labWork) && subject.labWork.length > 0;
  const hasResources = Array.isArray(subject.resources) && subject.resources.length > 0;
  const hasOutcomes = Array.isArray(subject.outcomes) && subject.outcomes.length > 0;
  const hasTopics = Array.isArray(subject.topics) && subject.topics.length > 0;

  const handleExplore = () => {
    onClose();
    const sId = subject.id || subject.code || subject._id;
    navigate(`/lessons/${encodeURIComponent(sId)}?semester=${encodeURIComponent(semNumber)}&subject=${encodeURIComponent(sId)}&name=${encodeURIComponent(subject.name)}&code=${encodeURIComponent(subject.code)}`, {
      state: {
        semesterId: semNumber,
        subjectId: sId,
        subjectName: subject.name,
        courseCode: subject.code,
        subject
      }
    });
  };

  return (
    <div
      className="subject-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-subject-title"
    >
      <div
        className="subject-modal-card detailed-syllabus-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          borderTop: `4px solid ${primaryColor}`
        }}
      >
        <button className="subject-modal-close" onClick={onClose} aria-label="Close details">
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="subject-modal-header">
          <div
            className="subject-modal-icon-badge"
            style={{
              backgroundColor: lightColor,
              color: primaryColor
            }}
          >
            <SubjectIcon iconName={subject.iconName} name={subject.iconName} size={28} />
          </div>

          <div className="subject-modal-meta">
            <div className="subject-modal-tags">
              <span
                className="subject-modal-sem-tag"
                style={{ color: primaryDarkColor, backgroundColor: lightColor }}
              >
                Semester {semNumber}
              </span>
              {subject.nature && (
                <span className="subject-modal-nature-badge" title="Nature of Course">
                  {subject.nature}
                </span>
              )}
              {subject.category && (
                <span className="subject-modal-cat-tag">
                  {subject.category}
                </span>
              )}
              {studentSem && (
                isEnrolledSem ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#10b981',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      padding: '2px 8px',
                      borderRadius: '6px'
                    }}
                    title="Enrolled semester: full course study and lessons unlocked"
                  >
                    <CheckCircle2 size={11} /> Enrolled (Study Open)
                  </span>
                ) : (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: '#f87171',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      padding: '2px 8px',
                      borderRadius: '6px'
                    }}
                    title={`Study is locked for this semester. You are enrolled in Semester ${studentSem}.`}
                  >
                    <Lock size={11} /> View Only (Study Locked)
                  </span>
                )
              )}
            </div>

            <h3 id="modal-subject-title" className="subject-modal-title">
              {subject.name}
            </h3>

            <div className="subject-modal-subline">
              <span className="subject-modal-code">
                <Hash size={13} />
                <span>Course Code: <strong>{subject.code}</strong></span>
              </span>
              <span className="modal-subline-divider">•</span>
              <span className="subject-modal-credits-chip">
                <GraduationCap size={13} />
                <strong>{subject.credits || 4} Credits</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Section A: Quick LTP & Structure Bar */}
        <div className="syllabus-ltp-strip">
          <div className="ltp-pill">
            <span className="ltp-label">Lecture (L)</span>
            <span className="ltp-val">{subject.l ?? subject.hours?.l ?? 0} hrs/wk</span>
          </div>
          <div className="ltp-pill">
            <span className="ltp-label">Tutorial (T)</span>
            <span className="ltp-val">{subject.t ?? subject.hours?.t ?? 0} hrs/wk</span>
          </div>
          <div className="ltp-pill">
            <span className="ltp-label">Practical (P)</span>
            <span className="ltp-val">{subject.p ?? subject.hours?.p ?? 0} hrs/wk</span>
          </div>
          <div className="ltp-pill highlight">
            <span className="ltp-label">Total Credits</span>
            <span className="ltp-val">{subject.credits || 4} Credits</span>
          </div>
        </div>

        {/* Navigation Tabs inside modal */}
        <div className="syllabus-modal-tabs">
          <button
            type="button"
            className={`syllabus-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
            style={activeTab === 'overview' ? { borderColor: primaryColor, color: primaryColor } : {}}
          >
            Overview & Objectives
          </button>
          {hasUnits && (
            <button
              type="button"
              className={`syllabus-tab-btn ${activeTab === 'units' ? 'active' : ''}`}
              onClick={() => setActiveTab('units')}
              style={activeTab === 'units' ? { borderColor: primaryColor, color: primaryColor } : {}}
            >
              Course Units ({subject.units.length})
            </button>
          )}
          {hasLabWork && (
            <button
              type="button"
              className={`syllabus-tab-btn ${activeTab === 'labWork' ? 'active' : ''}`}
              onClick={() => setActiveTab('labWork')}
              style={activeTab === 'labWork' ? { borderColor: primaryColor, color: primaryColor } : {}}
            >
              Practical Lab ({subject.labWork.length})
            </button>
          )}
          {hasResources && (
            <button
              type="button"
              className={`syllabus-tab-btn ${activeTab === 'resources' ? 'active' : ''}`}
              onClick={() => setActiveTab('resources')}
              style={activeTab === 'resources' ? { borderColor: primaryColor, color: primaryColor } : {}}
            >
              Resources ({subject.resources.length})
            </button>
          )}
          {hasOutcomes && (
            <button
              type="button"
              className={`syllabus-tab-btn ${activeTab === 'outcomes' ? 'active' : ''}`}
              onClick={() => setActiveTab('outcomes')}
              style={activeTab === 'outcomes' ? { borderColor: primaryColor, color: primaryColor } : {}}
            >
              Outcomes ({subject.outcomes.length})
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="subject-modal-body detailed-body">
          {/* TAB 1: OVERVIEW & OBJECTIVES */}
          {activeTab === 'overview' && (
            <div className="syllabus-section-view">
              {/* Course Information Summary */}
              <div className="subject-modal-section">
                <span className="subject-modal-section-title">A. Course Information</span>
                <div className="course-info-grid">
                  <div className="course-info-item">
                    <span className="info-item-label">Course Title</span>
                    <span className="info-item-val">{subject.name}</span>
                  </div>
                  <div className="course-info-item">
                    <span className="info-item-label">Course Code</span>
                    <span className="info-item-val font-mono">{subject.code}</span>
                  </div>
                  <div className="course-info-item">
                    <span className="info-item-label">Semester</span>
                    <span className="info-item-val">Semester {semNumber}</span>
                  </div>
                  <div className="course-info-item">
                    <span className="info-item-label">Nature of Course</span>
                    <span className="info-item-val badge-nature">{subject.nature || 'Core Computing'}</span>
                  </div>
                  <div className="course-info-item">
                    <span className="info-item-label">L-T-P Structure</span>
                    <span className="info-item-val font-mono">
                      {subject.l ?? 0}-{subject.t ?? 0}-{subject.p ?? 0}
                    </span>
                  </div>
                  <div className="course-info-item">
                    <span className="info-item-label">Total Credits</span>
                    <span className="info-item-val font-semibold">{subject.credits || 4} Credits</span>
                  </div>
                </div>

                <p className="subject-modal-description" style={{ marginTop: '12px' }}>
                  {subject.description}
                </p>
              </div>

              {/* B. Course Objectives */}
              {hasObjectives && (
                <div className="subject-modal-section">
                  <span className="subject-modal-section-title">
                    <Target size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />
                    B. Learning Objectives
                  </span>
                  <ul className="syllabus-objective-list">
                    {subject.objectives.map((obj, idx) => (
                      <li key={idx} className="syllabus-objective-item">
                        <CheckCircle2
                          size={16}
                          style={{ color: primaryColor, flexShrink: 0, marginTop: 2 }}
                        />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Key topics overview if present */}
              {hasTopics && (
                <div className="subject-modal-section">
                  <span className="subject-modal-section-title">Core Topic Themes</span>
                  <div className="syllabus-topic-chips">
                    {subject.topics.map((t, idx) => (
                      <span key={idx} className="topic-chip">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: COURSE UNITS (Unit I, II, III, IV) */}
          {activeTab === 'units' && hasUnits && (
            <div className="syllabus-section-view">
              <div className="subject-modal-section">
                <span className="subject-modal-section-title">C. Course Units (I – IV)</span>
                <p className="syllabus-section-hint">
                  Detailed topics and subtopics organized into official units.
                </p>

                <div className="syllabus-units-container">
                  {subject.units.map((unitObj, idx) => (
                    <article key={idx} className="syllabus-unit-card">
                      <header className="syllabus-unit-header">
                        <span className="unit-badge" style={{ backgroundColor: lightColor, color: primaryDarkColor }}>
                          {unitObj.unit || `Unit ${idx + 1}`}
                        </span>
                        <h4 className="unit-title">{unitObj.title}</h4>
                      </header>

                      {Array.isArray(unitObj.topics) && unitObj.topics.length > 0 && (
                        <ul className="syllabus-unit-topics">
                          {unitObj.topics.map((subtopic, sIdx) => (
                            <li key={sIdx} className="unit-subtopic-item">
                              <span className="subtopic-bullet" style={{ backgroundColor: primaryColor }} />
                              <span>{subtopic}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LAB WORK / PRACTICALS */}
          {activeTab === 'labWork' && hasLabWork && (
            <div className="syllabus-section-view">
              <div className="subject-modal-section">
                <span className="subject-modal-section-title">
                  <Code2 size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />
                  D. Lab Work & Practical Assignments
                </span>
                <p className="syllabus-section-hint">
                  Practical laboratory assignments, programming exercises, and engineering projects.
                </p>

                <div className="syllabus-lab-list">
                  {subject.labWork.map((labItem, idx) => (
                    <div key={idx} className="syllabus-lab-card">
                      <div className="lab-number-badge" style={{ backgroundColor: lightColor, color: primaryDarkColor }}>
                        Ex {idx + 1}
                      </div>
                      <div className="lab-card-text">
                        <span>{labItem}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LEARNING RESOURCES */}
          {activeTab === 'resources' && hasResources && (
            <div className="syllabus-section-view">
              <div className="subject-modal-section">
                <span className="subject-modal-section-title">
                  <BookOpen size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />
                  E. Learning Resources & Recommended Books
                </span>
                <p className="syllabus-section-hint">
                  Recommended textbooks, official documentation, and open learning platforms.
                </p>

                <div className="syllabus-resources-list">
                  {subject.resources.map((res, idx) => (
                    <div key={idx} className="syllabus-resource-card">
                      <div className="resource-type-tag">{res.type || 'Resource'}</div>
                      <div className="resource-info">
                        <strong className="resource-title">{res.title}</strong>
                        {res.author && (
                          <span className="resource-author">Author: {res.author}</span>
                        )}
                        {res.url && (
                          <a
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="resource-external-link"
                          >
                            <span>Open Resource</span>
                            <ExternalLink size={13} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: COURSE OUTCOMES */}
          {activeTab === 'outcomes' && hasOutcomes && (
            <div className="syllabus-section-view">
              <div className="subject-modal-section">
                <span className="subject-modal-section-title">
                  <Sparkles size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />
                  F. Course Outcomes (COs)
                </span>
                <p className="syllabus-section-hint">
                  Measurable competencies and abilities students attain upon completing this course.
                </p>

                <div className="syllabus-outcomes-list">
                  {subject.outcomes.map((co, idx) => (
                    <div key={idx} className="syllabus-co-card">
                      <span className="co-badge" style={{ backgroundColor: lightColor, color: primaryDarkColor }}>
                        CO{idx + 1}
                      </span>
                      <p className="co-text">{co}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Institutional note footer inside modal */}
          <div className="subject-modal-institution-note">
            <Layers size={15} style={{ color: primaryColor }} />
            <span>
              Department of Computer Science & Engineering · BCA (Hons. with Research)
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="subject-modal-footer">
          <button className="subject-modal-btn-secondary" onClick={onClose}>
            Close
          </button>
          {isEnrolledSem ? (
            <button
              className="subject-modal-btn-primary"
              onClick={handleExplore}
              style={{
                backgroundColor: primaryColor
              }}
            >
              <BookOpen size={15} />
              <span>Study Course</span>
              <ArrowRight size={15} />
            </button>
          ) : (
            <button
              className="subject-modal-btn-locked"
              disabled
              style={{
                opacity: 0.65,
                cursor: 'not-allowed',
                background: 'rgba(51, 65, 85, 0.45)',
                border: '1px solid rgba(148, 163, 184, 0.25)',
                color: '#94a3b8',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600
              }}
              title={`Study modules are unlocked for your enrolled semester (Semester ${studentSem}). You can still browse the full syllabus here.`}
            >
              <Lock size={15} />
              <span>Study Locked (Enrolled in Sem {studentSem})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
