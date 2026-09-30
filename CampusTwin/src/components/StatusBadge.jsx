import React from 'react';

const StatusBadge = ({ status, className = '' }) => {
  if (!status) return null;

  return (
    <span className={`status-badge ${status} ${className}`}>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: 'currentColor'
        }}
      />
      {status}
    </span>
  );
};

export default StatusBadge;
