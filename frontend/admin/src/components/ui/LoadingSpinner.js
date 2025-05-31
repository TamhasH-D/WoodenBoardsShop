import React from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../utils/helpers';

/**
 * Modern loading spinner component with multiple variants and sizes
 */
const LoadingSpinner = ({
  size = 'medium',
  variant = 'primary',
  message = '',
  overlay = false,
  fullScreen = false,
  className = '',
  style = {}
}) => {
  // Size configurations
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xlarge: 'w-16 h-16'
  };

  // Variant color configurations
  const variantClasses = {
    primary: 'text-brand-600',
    secondary: 'text-slate-600',
    success: 'text-success-600',
    warning: 'text-warning-600',
    error: 'text-error-600',
    white: 'text-white'
  };

  const containerClasses = cn(
    'flex flex-col items-center justify-center gap-3',
    {
      'fixed inset-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm': overlay || fullScreen,
      'p-8': overlay || fullScreen,
    },
    className
  );

  const spinnerClasses = cn(
    'animate-spin',
    sizeClasses[size],
    variantClasses[variant]
  );

  const messageClasses = cn(
    'text-sm font-medium text-center max-w-xs animate-pulse-soft',
    {
      'text-slate-600 dark:text-slate-400': variant !== 'white',
      'text-white': variant === 'white',
    }
  );

  return (
    <div className={containerClasses} style={style}>
      {/* Premium SVG Spinner with Glow Effect */}
      <div className="relative">
        <svg
          className={spinnerClasses}
          fill="none"
          viewBox="0 0 24 24"
          role="status"
          aria-label="Loading"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        {/* Glow effect */}
        <div className={cn(
          'absolute inset-0 animate-spin opacity-20 blur-sm',
          sizeClasses[size],
          variantClasses[variant]
        )}>
          <svg fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          </svg>
        </div>
      </div>

      {/* Loading Message with Animation */}
      {message && (
        <div className={messageClasses} aria-live="polite">
          {message}
        </div>
      )}
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large', 'xlarge']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'error', 'white']),
  message: PropTypes.string,
  overlay: PropTypes.bool,
  fullScreen: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object
};

export default LoadingSpinner;
