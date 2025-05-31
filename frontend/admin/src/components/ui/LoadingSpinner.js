import React from 'react';
import PropTypes from 'prop-types';
import './LoadingSpinner.css';

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
  const spinnerClasses = [
    'loading-spinner',
    `loading-spinner--${size}`,
    `loading-spinner--${variant}`,
    overlay && 'loading-spinner--overlay',
    fullScreen && 'loading-spinner--fullscreen',
    className
  ].filter(Boolean).join(' ');

  const containerClasses = [
    'loading-spinner-container',
    overlay && 'loading-spinner-container--overlay',
    fullScreen && 'loading-spinner-container--fullscreen'
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} style={style}>
      <div className={spinnerClasses} role="status" aria-label="Loading">
        <div className="loading-spinner__circle">
          <div className="loading-spinner__path"></div>
        </div>
        {message && (
          <div className="loading-spinner__message" aria-live="polite">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large', 'xlarge']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'white', 'dark']),
  message: PropTypes.string,
  overlay: PropTypes.bool,
  fullScreen: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object
};

export default LoadingSpinner;
