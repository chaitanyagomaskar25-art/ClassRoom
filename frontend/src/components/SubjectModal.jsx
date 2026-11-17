import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle2, Hash, Layers, X } from 'lucide-react';
import SubjectIcon from './SubjectIcon.jsx';

export default function SubjectModal({ subject, semester, colors, onClose }) {
  const navigate = useNavigate();

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

  const handleExplore = () => {
    onClose();
    navigate('/curriculum');
  };

  return (
    <div className="subject-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-subject-title">
      <div
        className="subject-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          borderTop: `4px solid ${colors?.primary || '#6366f1'}`
        }}
      >
        <button className="subject-modal-close" onClick={onClose} aria-label="Close details">
          <X size={20} />
        </button>

        <div className="subject-modal-header">
          <div
            className="subject-modal-icon-badge"
            style={{
              backgroundColor: colors?.light || '#eef2ff',
              color: colors?.primary || '#6366f1'
            }}
          >
            <SubjectIcon name={subject.iconName} size={28} />
          </div>

          <div className="subject-modal-meta">
            <div className="subject-modal-tags">
              <span className="subject-modal-sem-tag" style={{ color: colors?.primaryDark, backgroundColor: colors?.light }}>
                Semester {semester}
              </span>
              <span className="subject-modal-cat-tag">
                {subject.category}
              </span>
            </div>

            <h3 id="modal-subject-title" className="subject-modal-title">
              {subject.name}
            </h3>

            <div className="subject-modal-code">
              <Hash size={13} />
              <span>Course Code: <strong>{subject.code}</strong></span>
            </div>
          </div>
        </div>

        <div className="subject-modal-body">
          <div className="subject-modal-section">
            <span className="subject-modal-section-title">Course Overview</span>
            <p className="subject-modal-description">{subject.description}</p>
          </div>

          {subject.topics && subject.topics.length > 0 && (
            <div className="subject-modal-section">
              <span className="subject-modal-section-title">Key Learning Modules & Concepts</span>
              <ul className="subject-modal-topic-list">
                {subject.topics.map((topic, idx) => (
                  <li key={idx} className="subject-modal-topic-item">
                    <CheckCircle2 size={15} style={{ color: colors?.primary || '#6366f1', flexShrink: 0, marginTop: 2 }} />
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="subject-modal-institution-note">
            <Layers size={15} style={{ color: colors?.primary }} />
            <span>BCA Hons. with Research Syllabus · Eternal University</span>
          </div>
        </div>

        <div className="subject-modal-footer">
          <button className="subject-modal-btn-secondary" onClick={onClose}>
            Close
          </button>
          <button
            className="subject-modal-btn-primary"
            onClick={handleExplore}
            style={{
              backgroundColor: colors?.primary || '#6366f1'
            }}
          >
            <span>Explore in Curriculum</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
