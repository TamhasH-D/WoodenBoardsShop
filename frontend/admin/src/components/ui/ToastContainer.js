import React from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/helpers';
import Toast from './Toast';

/**
 * Toast Container Component
 * Manages positioning and rendering of multiple toasts
 */
const ToastContainer = ({ 
  toasts = [], 
  position = 'top-right',
  onRemoveToast,
  className = '',
}) => {
  if (!toasts.length) return null;

  // Position classes
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  };

  const containerClasses = cn(
    'fixed z-50 pointer-events-none',
    positionClasses[position],
    className
  );

  const stackClasses = cn(
    'flex flex-col space-y-3',
    {
      'items-end': position.includes('right'),
      'items-start': position.includes('left'),
      'items-center': position.includes('center'),
    }
  );

  return createPortal(
    <div className={containerClasses}>
      <div className={stackClasses}>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={onRemoveToast}
            position={position}
          />
        ))}
      </div>
    </div>,
    document.body
  );
};

ToastContainer.propTypes = {
  toasts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
      title: PropTypes.string,
      message: PropTypes.string.isRequired,
      duration: PropTypes.number,
    })
  ),
  position: PropTypes.oneOf([
    'top-right',
    'top-left', 
    'bottom-right',
    'bottom-left',
    'top-center',
    'bottom-center'
  ]),
  onRemoveToast: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default ToastContainer;
