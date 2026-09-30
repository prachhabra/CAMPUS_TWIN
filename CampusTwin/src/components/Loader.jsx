import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({ message = 'Loading...', size = 32, fullPage = false }) => {
  const content = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        gap: '12px',
        color: 'var(--muted)'
      }}
    >
      <Loader2
        size={size}
        style={{
          animation: 'spin 1s linear infinite',
          color: 'var(--accent)'
        }}
      />
      {message && <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{message}</span>}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  if (fullPage) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}
      >
        {content}
      </div>
    );
  }

  return content;
};

export default Loader;
