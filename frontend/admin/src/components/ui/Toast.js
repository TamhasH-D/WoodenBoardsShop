import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../utils/helpers';

/**
 * Professional Toast Component for Admin Panel
 * Corporate design with proper animations and accessibility
 */
const Toast = ({
  id,
  type = 'info',
  title,
  message,
  duration = 5000,
  onClose,
  position = 'top-right', // eslint-disable-line no-unused-vars
  showProgress = true,
  closable = true,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [progress, setProgress] = useState(100);

  const handleClose = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose?.(id);
    }, 300);
  }, [onClose, id]);

  useEffect(() => {
    // Show animation
    const showTimer = setTimeout(() => setIsVisible(true), 10);
    
    // Auto close timer
    let closeTimer;
    let progressTimer;
    
    if (duration > 0) {
      closeTimer = setTimeout(() => {
        handleClose();
      }, duration);

      // Progress bar animation
      if (showProgress) {
        const interval = 50;
        const steps = duration / interval;
        let currentStep = 0;
        
        progressTimer = setInterval(() => {
          currentStep++;
          setProgress(100 - (currentStep / steps) * 100);
          
          if (currentStep >= steps) {
            clearInterval(progressTimer);
          }
        }, interval);
      }
    }

    return () => {
      clearTimeout(showTimer);
      clearTimeout(closeTimer);
      clearInterval(progressTimer);
    };
  }, [duration, showProgress, handleClose]);

  // Icon mapping
  const icons = {
    success: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
  };

  // Style variants
  const variants = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const iconColors = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
  };

  const progressColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  };

  const toastClasses = cn(
    // Base styles
    'relative max-w-sm w-full border rounded-lg shadow-lg pointer-events-auto overflow-hidden',
    'transform transition-all duration-300 ease-in-out',
    
    // Variant styles
    variants[type],
    
    // Animation states
    {
      'translate-x-0 opacity-100': isVisible && !isLeaving,
      'translate-x-full opacity-0': !isVisible || isLeaving,
    },
    
    className
  );

  return (
    <div className={toastClasses} role="alert" aria-live="polite">
      <div className="p-4">
        <div className="flex items-start">
          {/* Icon */}
          <div className={cn('flex-shrink-0', iconColors[type])}>
            {icons[type]}
          </div>
          
          {/* Content */}
          <div className="ml-3 w-0 flex-1">
            {title && (
              <p className="text-sm font-semibold">
                {title}
              </p>
            )}
            {message && (
              <p className={cn('text-sm', title ? 'mt-1' : '')}>
                {message}
              </p>
            )}
          </div>
          
          {/* Close button */}
          {closable && (
            <div className="ml-4 flex-shrink-0 flex">
              <button
                type="button"
                className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md"
                onClick={handleClose}
                aria-label="Закрыть уведомление"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Progress bar */}
      {showProgress && duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
          <div
            className={cn('h-full transition-all duration-75 ease-linear', progressColors[type])}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

Toast.propTypes = {
  id: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  title: PropTypes.string,
  message: PropTypes.string.isRequired,
  duration: PropTypes.number,
  onClose: PropTypes.func,
  position: PropTypes.oneOf(['top-right', 'top-left', 'bottom-right', 'bottom-left']),
  showProgress: PropTypes.bool,
  closable: PropTypes.bool,
  className: PropTypes.string,
};

export default Toast;
