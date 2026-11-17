import { ChevronRight, Hash } from 'lucide-react';
import SubjectIcon from './SubjectIcon.jsx';

export default function SubjectCard({ subject, semester, colors, onSelect }) {
  return (
    <article
      className="subject-card-item"
      onClick={() => onSelect(subject)}
      style={{
        '--card-accent': colors.primary,
        '--card-accent-light': colors.light,
        '--card-accent-border': colors.border,
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
            backgroundColor: colors.light,
            color: colors.primary,
            borderColor: colors.border
          }}
        >
          <SubjectIcon name={subject.iconName} size={20} />
        </div>

        <div className="subject-card-badges">
          {subject.code && (
            <span className="subject-badge-code" title="Subject Code">
              <Hash size={11} />
              {subject.code}
            </span>
          )}
          {subject.category && (
            <span className="subject-badge-category">
              {subject.category}
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

      <div className="subject-card-footer">
        <span className="subject-card-hint">
          Click for modules
        </span>
        <span className="subject-card-arrow" style={{ color: colors.primary }}>
          <ChevronRight size={15} />
        </span>
      </div>
    </article>
  );
}
