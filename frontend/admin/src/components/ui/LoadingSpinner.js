import React from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../utils/helpers';

/**
 * Corporate Loading Spinner Component
 * Professional, minimal design suitable for enterprise admin panels
 */
const LoadingSpinner = ({
  size = 'md',
  message = '',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <svg
        className={cn('animate-spin text-accent-600', sizeClasses[size])}
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

      {message && (
        <div className="text-sm text-gray-600 text-center" aria-live="polite">
          {message}
        </div>
      )}
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  message: PropTypes.string,
  className: PropTypes.string,
};

export default LoadingSpinner;
