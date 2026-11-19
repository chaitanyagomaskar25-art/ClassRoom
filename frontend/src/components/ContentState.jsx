import { AlertCircle, LoaderCircle, Sparkles, RefreshCw } from 'lucide-react';

export function LoadingState({ label = 'Loading your learning space…' }) {
  return (
    <div className="content-state">
      <div className="spinner-wrapper">
        <LoaderCircle className="spinner" size={26} />
      </div>
      <span className="loading-state-label">{label}</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="error-state" role="alert">
      <div className="error-state-icon">
        <AlertCircle size={22} />
      </div>
      <div className="error-state-copy">
        <strong>We couldn’t load this right now</strong>
        <span>{message || 'An unexpected error occurred. Please try again.'}</span>
      </div>
      {onRetry && (
        <button type="button" className="button button-secondary button-small retry-btn" onClick={onRetry}>
          <RefreshCw size={13} />
          <span>Try again</span>
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title = 'No data available', detail = 'Items will appear here once available.', action }) {
  return (
    <div className="empty-state">
      <div className="empty-mark">
        <Sparkles size={24} />
      </div>
      <strong className="empty-state-title">{title}</strong>
      <span className="empty-state-detail">{detail}</span>
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}
