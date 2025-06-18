import React, { useState, useEffect, useCallback } from 'react';

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
      className={`error-toast ${isVisible ? 'error-toast-visible' : 'error-toast-hidden'} fixed top-5 right-5 z-[9999] max-w-md bg-red-50 border border-red-300 rounded-lg px-4 py-3 shadow-lg text-sm leading-normal transition-transform duration-300 ease-in-out`}
      // The transform and transition properties might be overridden by error-toast-visible/hidden classes if they also define transform/transition
      // style prop removed
    >
      <div className="flex items-start gap-2">
        <span className="text-red-600 text-base flex-shrink-0">⚠️</span>
        <div className="flex-1 text-red-800">
          <div className="font-semibold mb-1">
            Ошибка подключения
          </div>
          <div className="text-[13px] opacity-80">
            {typeof error === 'string' ? error : 'Не удается подключиться к серверу'}
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="bg-transparent border-none text-red-800 cursor-pointer text-lg leading-none p-0 flex-shrink-0 hover:text-red-900"
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

  const showError = useCallback((errorMessage) => {
    // Prevent duplicate errors
    if (error === errorMessage) return;

    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new timer to prevent spam
    const timer = setTimeout(() => {
      setError(errorMessage);
    }, debounceMs);

    setDebounceTimer(timer);
  }, [error, debounceTimer, debounceMs]);

  const clearError = useCallback(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      setDebounceTimer(null);
    }
    setError(null);
  }, [debounceTimer]);

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
