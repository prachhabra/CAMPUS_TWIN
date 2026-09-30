import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message, type = 'info', duration = 4000) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 9);
      const newToast = { id, message, type };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const showSuccess = useCallback((msg, duration) => addToast(msg, 'success', duration), [addToast]);
  const showError = useCallback((msg, duration) => addToast(msg, 'error', duration), [addToast]);
  const showWarning = useCallback((msg, duration) => addToast(msg, 'warning', duration), [addToast]);
  const showInfo = useCallback((msg, duration) => addToast(msg, 'info', duration), [addToast]);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} color="var(--success)" />;
      case 'error':
        return <AlertCircle size={18} color="var(--danger)" />;
      case 'warning':
        return <AlertTriangle size={18} color="var(--warning)" />;
      default:
        return <Info size={18} color="var(--accent)" />;
    }
  };

  return (
    <ToastContext.Provider value={{ addToast, showSuccess, showError, showWarning, showInfo, removeToast }}>
      {children}
      <div className="toast-container" role="region" aria-label="Notifications">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <div style={{ flexShrink: 0, marginTop: 2 }}>{getIcon(toast.type)}</div>
            <div style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500, color: 'var(--text)' }}>
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                color: 'var(--muted)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 2
              }}
              aria-label="Close notification"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
