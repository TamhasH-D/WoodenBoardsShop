import React, { useState, useEffect } from 'react';

/**
 * Компактный компонент для отображения ошибок в фиксированной позиции
 * Не сдвигает контент страницы, автоматически исчезает через 5 секунд
 * Мемоизирован для оптимизации производительности
 */
const ErrorToast = React.memo(({ error, onDismiss, autoHide = true, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(!!error);

  useEffect(() => {
    if (error) {
      setIsVisible(true);
      
      if (autoHide) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => onDismiss && onDismiss(), 300); // Wait for animation
        }, duration);
        
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [error, autoHide, duration, onDismiss]);

  if (!error) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss && onDismiss(), 300);
  };

  return (
    <div 
      className={`error-toast ${isVisible ? 'error-toast-visible' : 'error-toast-hidden'}`}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        maxWidth: '400px',
        backgroundColor: '#fee2e2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        padding: '12px 16px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s ease-in-out',
        fontSize: '14px',
        lineHeight: '1.4'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        <span style={{ color: '#dc2626', fontSize: '16px', flexShrink: 0 }}>⚠️</span>
        <div style={{ flex: 1, color: '#7f1d1d' }}>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>
            Ошибка подключения
          </div>
          <div style={{ fontSize: '13px', opacity: 0.8 }}>
            {typeof error === 'string' ? error : 'Не удается подключиться к серверу'}
          </div>
        </div>
        <button
          onClick={handleDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: '#7f1d1d',
            cursor: 'pointer',
            fontSize: '18px',
            lineHeight: 1,
            padding: '0',
            flexShrink: 0
          }}
          aria-label="Закрыть"
        >
          ×
        </button>
      </div>
    </div>
  );
});

ErrorToast.displayName = 'ErrorToast';

/**
 * Hook для управления ошибками с debouncing
 */
export const useErrorHandler = (debounceMs = 1000) => {
  const [error, setError] = useState(null);
  const [debounceTimer, setDebounceTimer] = useState(null);

  const showError = (errorMessage) => {
    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new timer to prevent spam
    const timer = setTimeout(() => {
      setError(errorMessage);
    }, debounceMs);

    setDebounceTimer(timer);
  };

  const clearError = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      setDebounceTimer(null);
    }
    setError(null);
  };

  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return { error, showError, clearError };
};

export default ErrorToast;
