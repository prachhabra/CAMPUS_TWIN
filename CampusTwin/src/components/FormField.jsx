import React from 'react';

const FormField = ({
  label,
  error,
  required = false,
  children,
  className = '',
  helperText
}) => {
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </label>
      )}
      {children}
      {helperText && !error && (
        <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>
          {helperText}
        </span>
      )}
      {error && <span className="form-error">{error}</span>}
    </div>
  );
};

export default FormField;
