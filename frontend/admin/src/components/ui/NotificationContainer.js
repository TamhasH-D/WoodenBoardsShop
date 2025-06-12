import React from 'react';
import { createPortal } from 'react-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import { cn } from '../../utils/helpers';

/**
 * Premium notification component with glassmorphism and smooth animations
 */
const Notification = ({ notification }) => {
  const { removeNotification } = useNotifications();
  const { id, type, title, message, autoClose = true } = notification;

  React.useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        removeNotification(id);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [autoClose, id, removeNotification]);

  // Notification styles with premium glassmorphism
  const notificationClasses = cn(
    'relative flex items-start gap-3 p-4 rounded-xl shadow-large backdrop-blur-sm border',
    'animate-slide-in-right transition-all duration-300 ease-out',
    'hover:shadow-glow hover:-translate-y-1',
    'max-w-md w-full',
    {
      // Type variants with glassmorphism
      'bg-success-50/90 dark:bg-success-900/20 border-success-200 dark:border-success-800 text-success-800 dark:text-success-200': type === 'success',
      'bg-error-50/90 dark:bg-error-900/20 border-error-200 dark:border-error-800 text-error-800 dark:text-error-200': type === 'error',
      'bg-warning-50/90 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800 text-warning-800 dark:text-warning-200': type === 'warning',
      'bg-brand-50/90 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800 text-brand-800 dark:text-brand-200': type === 'info',
    }
  );

  // Icon mapping with premium SVGs
  const icons = {
    success: (
      <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
  };

  return (
    <div className={notificationClasses}>
      {/* Icon with Glow Effect */}
      <div className="flex-shrink-0 pt-0.5 relative">
        {icons[type]}
        <div className="absolute inset-0 blur-sm opacity-30">
          {icons[type]}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="text-sm font-semibold mb-1 leading-tight">
            {title}
          </h4>
        )}
        <p className="text-sm opacity-90 leading-relaxed">
          {message}
        </p>
      </div>

      {/* Close Button with Hover Effect */}
      <button
        onClick={() => removeNotification(id)}
        className="flex-shrink-0 p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-current focus:ring-offset-2 hover:scale-110 active:scale-95"
        aria-label="Close notification"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

/**
 * Premium notification container with smooth animations
 */
const NotificationContainer = () => {
  const { notifications } = useNotifications();

  if (notifications.length === 0) {
    return null;
  }

  return createPortal(
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md w-full pointer-events-none">
      <div className="space-y-3 pointer-events-auto">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            notification={notification}
          />
        ))}
      </div>
    </div>,
    document.body
  );
};

export default NotificationContainer;
