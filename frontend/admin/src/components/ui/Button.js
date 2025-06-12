import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../utils/helpers';

/**
 * Corporate Button Component
 * Professional, minimal design suitable for enterprise admin panels
 */
const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon = null,
  iconPosition = 'left',
  onClick,
  type = 'button',
  className = '',
  style = {},
  ariaLabel,
  ...props
}, ref) => {
  // Corporate base styles - minimal and professional
  const baseStyles = cn(
    // Core layout and typography
    'inline-flex items-center justify-center font-medium transition-colors duration-150',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',

    // Size variants
    {
      'px-3 py-1.5 text-sm rounded-md gap-1.5 h-8': size === 'sm',
      'px-4 py-2 text-sm rounded-md gap-2 h-10': size === 'md',
      'px-6 py-3 text-base rounded-md gap-2.5 h-12': size === 'lg',
    },

    // Full width
    fullWidth && 'w-full',

    // Icon only styles
    icon && !children && {
      'w-8 h-8 p-0': size === 'sm',
      'w-10 h-10 p-0': size === 'md',
      'w-12 h-12 p-0': size === 'lg',
    },

    className
  );

  // Corporate variant styles - clean and professional
  const variantStyles = cn({
    // Primary - Corporate blue
    'bg-accent-600 text-white hover:bg-accent-700 focus:ring-accent-500 border border-transparent': variant === 'primary',

    // Secondary - Light gray
    'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500 border border-gray-300': variant === 'secondary',

    // Outline - Clean border
    'bg-white text-gray-700 hover:bg-gray-50 focus:ring-accent-500 border border-gray-300': variant === 'outline',

    // Ghost - Minimal
    'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500 border border-transparent': variant === 'ghost',

    // Success - Muted green
    'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500 border border-transparent': variant === 'success',

    // Warning - Muted amber
    'bg-warning-500 text-white hover:bg-warning-600 focus:ring-warning-500 border border-transparent': variant === 'warning',

    // Error - Muted red
    'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500 border border-transparent': variant === 'error',
  });

  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  const renderIcon = () => {
    if (loading) {
      return (
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
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
      );
    }
    if (icon) {
      return <span className="flex-shrink-0" aria-hidden="true">{icon}</span>;
    }
    return null;
  };

  return (
    <button
      ref={ref}
      type={type}
      className={cn(baseStyles, variantStyles)}
      style={style}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      aria-disabled={disabled || loading}
      {...props}
    >
      <div className="flex items-center justify-center gap-2">
        {(icon || loading) && iconPosition === 'left' && renderIcon()}
        {children && <span className="truncate">{children}</span>}
        {icon && iconPosition === 'right' && !loading && renderIcon()}
      </div>
    </button>
  );
});

Button.displayName = 'Button';

Button.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf([
    'primary',
    'secondary',
    'outline',
    'ghost',
    'success',
    'warning',
    'error'
  ]),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  fullWidth: PropTypes.bool,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
  style: PropTypes.object,
  ariaLabel: PropTypes.string
};

export default Button;
