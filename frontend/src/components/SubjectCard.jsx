import { BookOpen, ChevronRight, FileText, GraduationCap, Hash } from 'lucide-react';
import SubjectIcon from './SubjectIcon.jsx';

export default function SubjectCard({ subject, semester, colors, onSelect, onStudy }) {
  const nature = subject.nature || subject.category;
  const l = subject.l ?? subject.hours?.l ?? 0;
  const t = subject.t ?? subject.hours?.t ?? 0;
  const p = subject.p ?? subject.hours?.p ?? 0;
  const credits = subject.credits || 4;

  const handleStudy = (e) => {
    e.stopPropagation();
    if (onStudy) {
      onStudy(subject);
    } else {
      onSelect(subject);
    }
  };

  return (
    <article
      className="subject-card-item"
      onClick={() => onSelect(subject)}
      style={{
        '--card-accent': colors?.primary || '#6366f1',
        '--card-accent-light': colors?.light || 'rgba(99, 102, 241, 0.1)',
        '--card-accent-border': colors?.border || 'rgba(99, 102, 241, 0.25)',
      }}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(subject);
        }
      }}
      aria-label={`View details for ${subject.name}`}
    >
      <div className="subject-card-topbar">
        <div
          className="subject-icon-box"
          style={{
            backgroundColor: colors?.light || '#eef2ff',
            color: colors?.primary || '#6366f1',
            borderColor: colors?.border || '#c7d2fe'
          }}
        >
          <SubjectIcon iconName={subject.iconName} name={subject.iconName} size={20} />
        </div>

        <div className="subject-card-badges">
          {subject.code && (
            <span className="subject-badge-code" title="Course Code">
              <Hash size={11} />
              {subject.code}
            </span>
          )}
          {nature && (
            <span className="subject-badge-nature" title="Nature of Course">
              {nature}
            </span>
          )}
        </div>
      </div>

      <div className="subject-card-content">
        <h4 className="subject-card-name" title={subject.name}>
          {subject.name}
        </h4>
        <p className="subject-card-desc">
          {subject.description}
        </p>
      </div>

      {/* Course Structure Metadata Strip (L-T-P & Credits) */}
      <div className="subject-card-metrics">
        <div className="subject-metric-pill" title="Lecture - Tutorial - Practical hours">
          <span className="metric-tag">LTP</span>
          <span className="metric-num">{l}-{t}-{p}</span>
        </div>
        <div className="subject-metric-pill credits" title="Course Credits">
          <GraduationCap size={12} />
          <span className="metric-num">{credits} Credits</span>
        </div>
      </div>

      <div className="subject-card-footer">
        <button
          type="button"
          className="subject-card-study-btn"
          onClick={handleStudy}
          title={`Start studying ${subject.name}`}
          aria-label={`Study ${subject.name}`}
        >
          <BookOpen size={13} />
          <span>Study</span>
        </button>

        <span className="subject-card-view-btn">
          <FileText size={13} />
          <span>Details</span>
          <ChevronRight size={13} style={{ marginLeft: 2 }} />
        </span>
      </div>
    </article>
  );
}
