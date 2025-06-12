import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

/**
 * Professional Toast Hook for Admin Panel
 * Manages toast notifications with proper state management
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  // Generate unique toast ID
  const generateId = useCallback(() => {
    toastIdRef.current += 1;
    return `toast-${toastIdRef.current}-${Date.now()}`;
  }, []);

  // Add toast notification
  const addToast = useCallback((options) => {
    const {
      type = 'info',
      title,
      message,
      duration = 5000,
      showProgress = true,
      closable = true,
      ...rest
    } = options;

    if (!message) {
      console.warn('Toast message is required');
      return null;
    }

    const id = generateId();
    const toast = {
      id,
      type,
      title,
      message,
      duration,
      showProgress,
      closable,
      createdAt: Date.now(),
      ...rest,
    };

    setToasts(prev => [...prev, toast]);
    return id;
  }, [generateId]);

  // Remove specific toast
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Clear all toasts
  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods for different toast types
  const success = useCallback((message, options = {}) => {
    return addToast({
      type: 'success',
      message,
      title: options.title || 'Успешно',
      duration: options.duration || 4000,
      ...options,
    });
  }, [addToast]);

  const error = useCallback((message, options = {}) => {
    return addToast({
      type: 'error',
      message,
      title: options.title || 'Ошибка',
      duration: options.duration || 6000,
      ...options,
    });
  }, [addToast]);

  const warning = useCallback((message, options = {}) => {
    return addToast({
      type: 'warning',
      message,
      title: options.title || 'Предупреждение',
      duration: options.duration || 5000,
      ...options,
    });
  }, [addToast]);

  const info = useCallback((message, options = {}) => {
    return addToast({
      type: 'info',
      message,
      title: options.title || 'Информация',
      duration: options.duration || 4000,
      ...options,
    });
  }, [addToast]);

  // Handle API errors with proper formatting
  const handleApiError = useCallback((error, customMessage) => {
    let message = customMessage || 'Произошла ошибка при выполнении операции';
    
    if (error?.response?.data?.message) {
      message = error.response.data.message;
    } else if (error?.message) {
      message = error.message;
    }

    // Handle validation errors
    if (error?.response?.status === 422 && error?.response?.data?.errors) {
      const validationErrors = error.response.data.errors;
      if (Array.isArray(validationErrors)) {
        message = validationErrors.join(', ');
      } else if (typeof validationErrors === 'object') {
        message = Object.values(validationErrors).flat().join(', ');
      }
    }

    return error({
      message,
      title: 'Ошибка API',
      duration: 7000,
    });
  }, [error]);

  // Handle API success with proper formatting
  const handleApiSuccess = useCallback((message = 'Операция выполнена успешно', options = {}) => {
    return success(message, {
      title: 'Операция завершена',
      duration: 3000,
      ...options,
    });
  }, [success]);

  // Promise-based toast for async operations
  const promise = useCallback(async (
    promiseOrFunction,
    {
      loading = 'Выполняется операция...',
      success: successMessage = 'Операция выполнена успешно',
      error: errorMessage = 'Произошла ошибка',
    } = {}
  ) => {
    // Show loading toast
    const loadingId = info(loading, {
      title: 'Загрузка',
      duration: 0, // Don't auto-close
      closable: false,
    });

    try {
      // Execute promise
      const result = typeof promiseOrFunction === 'function' 
        ? await promiseOrFunction() 
        : await promiseOrFunction;

      // Remove loading toast
      removeToast(loadingId);

      // Show success toast
      success(successMessage);

      return result;
    } catch (err) {
      // Remove loading toast
      removeToast(loadingId);

      // Show error toast
      handleApiError(err, errorMessage);

      throw err;
    }
  }, [info, success, handleApiError, removeToast]);

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info,
    handleApiError,
    handleApiSuccess,
    promise,
  };
}

// Global toast context for app-wide usage

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const toast = useToast();

  return (
    <ToastContext.Provider value={toast}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
}

export default useToast;
