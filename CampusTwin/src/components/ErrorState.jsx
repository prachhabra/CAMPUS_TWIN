import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorState = ({
  message = 'Failed to load information from the server.',
  onRetry = null,
  className = ''
}) => {
  return (
    <div
      className={`empty-state ${className}`}
      style={{ borderColor: '#fed7d7', backgroundColor: '#fff5f5' }}
    >
      <div
        className="empty-state-icon"
        style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)' }}
      >
        <AlertCircle size={30} />
      </div>
      <h3 className="empty-state-title" style={{ color: 'var(--danger)' }}>
        Unable to Load Data
      </h3>
      <p className="empty-state-desc">{message}</p>
      {onRetry && (
        <button className="btn btn-secondary btn-sm" onClick={onRetry}>
          <RefreshCw size={14} /> Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;
