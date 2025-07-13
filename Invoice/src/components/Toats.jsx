import React, { useState, useEffect, useRef } from 'react';
import './Toats.css';

// Toast Types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  LOADING: 'loading'
};

// Toast Positions
export const TOAST_POSITIONS = {
  TOP_RIGHT: 'top-right',
  TOP_LEFT: 'top-left',
  TOP_CENTER: 'top-center',
  BOTTOM_RIGHT: 'bottom-right',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_CENTER: 'bottom-center'
};

// Individual Toast Component
const Toast = ({ 
  id, 
  type, 
  title, 
  message, 
  duration = 5000, 
  onClose, 
  position = 'top-right',
  showProgress = true,
  showCloseButton = true,
  icon,
  actions
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const progressRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto dismiss
    if (duration > 0 && type !== TOAST_TYPES.LOADING) {
      timeoutRef.current = setTimeout(() => {
        handleClose();
      }, duration);
    }

    // Progress bar animation
    if (showProgress && duration > 0 && type !== TOAST_TYPES.LOADING) {
      const startTime = Date.now();
      const animateProgress = () => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
        setProgress(remaining);
        
        if (remaining > 0) {
          progressRef.current = requestAnimationFrame(animateProgress);
        }
      };
      progressRef.current = requestAnimationFrame(animateProgress);
    }

    return () => {
      clearTimeout(timer);
      if (progressRef.current) {
        cancelAnimationFrame(progressRef.current);
      }
    };
  }, [duration, type, showProgress]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose(id);
    }, 300); // Wait for exit animation
  };

  const getIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case TOAST_TYPES.SUCCESS:
        return (
          <svg className="toast-icon success" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
        );
      case TOAST_TYPES.ERROR:
        return (
          <svg className="toast-icon error" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        );
      case TOAST_TYPES.WARNING:
        return (
          <svg className="toast-icon warning" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
          </svg>
        );
      case TOAST_TYPES.INFO:
        return (
          <svg className="toast-icon info" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
        );
      case TOAST_TYPES.LOADING:
        return (
          <div className="toast-icon loading">
            <div className="spinner"></div>
          </div>
        );
      default:
        return null;
    }
  };

  const getTypeClass = () => {
    return `toast toast-${type} ${isVisible ? 'toast-visible' : ''} toast-${position}`;
  };

  return (
    <div className={getTypeClass()}>
      <div className="toast-content">
        <div className="toast-header">
          {getIcon()}
          <div className="toast-text">
            {title && <div className="toast-title">{title}</div>}
            {message && <div className="toast-message">{message}</div>}
          </div>
          {showCloseButton && type !== TOAST_TYPES.LOADING && (
            <button 
              className="toast-close" 
              onClick={handleClose}
              aria-label="Close toast"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          )}
        </div>
        
        {actions && actions.length > 0 && (
          <div className="toast-actions">
            {actions.map((action, index) => (
              <button
                key={index}
                className={`toast-action ${action.className || ''}`}
                onClick={() => {
                  action.onClick();
                  if (action.closeOnClick !== false) {
                    handleClose();
                  }
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {showProgress && duration > 0 && type !== TOAST_TYPES.LOADING && (
        <div className="toast-progress">
          <div 
            className="toast-progress-bar" 
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

// Toast Container Component
const ToastContainer = ({ 
  toasts, 
  position = TOAST_POSITIONS.TOP_RIGHT,
  maxToasts = 5,
  onClose 
}) => {
  return (
    <div className={`toast-container toast-${position}`}>
      {toasts.slice(0, maxToasts).map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          position={position}
          onClose={onClose}
        />
      ))}
    </div>
  );
};

// Toast Hook
export const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const [position, setPosition] = useState(TOAST_POSITIONS.TOP_RIGHT);

  const addToast = (toastConfig) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      type: TOAST_TYPES.INFO,
      duration: 5000,
      showProgress: true,
      showCloseButton: true,
      ...toastConfig
    };

    setToasts(prev => [...prev, newToast]);
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  const updateToast = (id, updates) => {
    setToasts(prev => 
      prev.map(toast => 
        toast.id === id ? { ...toast, ...updates } : toast
      )
    );
  };

  // Convenience methods
  const success = (message, title = 'Success', options = {}) => {
    return addToast({ type: TOAST_TYPES.SUCCESS, message, title, ...options });
  };

  const error = (message, title = 'Error', options = {}) => {
    return addToast({ type: TOAST_TYPES.ERROR, message, title, ...options });
  };

  const warning = (message, title = 'Warning', options = {}) => {
    return addToast({ type: TOAST_TYPES.WARNING, message, title, ...options });
  };

  const info = (message, title = 'Info', options = {}) => {
    return addToast({ type: TOAST_TYPES.INFO, message, title, ...options });
  };

  const loading = (message, title = 'Loading', options = {}) => {
    return addToast({ 
      type: TOAST_TYPES.LOADING, 
      message, 
      title, 
      duration: 0, // No auto-dismiss for loading
      showProgress: false,
      showCloseButton: false,
      ...options 
    });
  };

  const dismiss = (id) => {
    removeToast(id);
  };

  return {
    toasts,
    position,
    setPosition,
    addToast,
    removeToast,
    clearAllToasts,
    updateToast,
    success,
    error,
    warning,
    info,
    loading,
    dismiss,
    ToastContainer: () => (
      <ToastContainer 
        toasts={toasts} 
        position={position} 
        onClose={removeToast} 
      />
    )
  };
};

// Main Toast Component
const Toats = ({ 
  children, 
  position = TOAST_POSITIONS.TOP_RIGHT,
  maxToasts = 5 
}) => {
  const toast = useToast();

  // Set position
  React.useEffect(() => {
    toast.setPosition(position);
  }, [position]);

  return (
    <>
      {children}
      <toast.ToastContainer maxToasts={maxToasts} />
    </>
  );
};

export default Toats;
