import { AlertCircle, LoaderCircle } from 'lucide-react';

export function LoadingState({ label = 'Loading your learning space…' }) {
  return <div className="content-state"><LoaderCircle className="spinner" size={22} /><span>{label}</span></div>;
}

export function ErrorState({ message, onRetry }) {
  return <div className="error-state"><AlertCircle size={20} /><div><strong>We couldn’t load this yet</strong><span>{message}</span></div>{onRetry && <button className="button button-secondary button-small" onClick={onRetry}>Try again</button>}</div>;
}

export function EmptyState({ title, detail }) {
  return <div className="empty-state"><div className="empty-mark">✳</div><strong>{title}</strong><span>{detail}</span></div>;
}
