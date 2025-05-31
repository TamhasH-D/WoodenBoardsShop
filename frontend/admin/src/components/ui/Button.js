import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../utils/helpers';

/**
 * Premium button component with Tailwind CSS styling and advanced animations
 */
const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'medium',
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
  // Base button styles with premium animations
  const baseStyles = cn(
    // Core layout and typography
    'inline-flex items-center justify-center font-medium transition-all duration-200 ease-out',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus-visible:ring-2',
    'transform active:scale-95 disabled:transform-none',
    'relative overflow-hidden',

    // Size variants
    {
      'px-3 py-1.5 text-xs rounded-md gap-1.5 min-h-[28px]': size === 'small',
      'px-4 py-2 text-sm rounded-lg gap-2 min-h-[36px]': size === 'medium',
      'px-6 py-3 text-base rounded-lg gap-2.5 min-h-[44px]': size === 'large',
    },

    // Full width
    fullWidth && 'w-full',

    // Icon only styles
    icon && !children && {
      'w-7 h-7 p-0': size === 'small',
      'w-9 h-9 p-0': size === 'medium',
      'w-11 h-11 p-0': size === 'large',
    },

    // Loading state
    loading && 'cursor-wait',

    // Disabled state
    disabled && 'cursor-not-allowed opacity-60',

    className
  );

  // Variant styles with premium gradients and effects
  const variantStyles = cn({
    // Primary - Premium gradient with glow effect
    'bg-gradient-to-r from-brand-600 via-brand-700 to-brand-800 text-white shadow-soft hover:shadow-glow hover:from-brand-700 hover:via-brand-800 hover:to-brand-900 focus:ring-brand-500 hover:scale-105': variant === 'primary',

    // Secondary - Elegant outline with subtle fill
    'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 shadow-soft hover:bg-slate-50 dark:hover:bg-slate-700 hover:shadow-medium focus:ring-brand-500 hover:scale-105': variant === 'secondary',

    // Success - Green gradient
    'bg-gradient-to-r from-success-600 via-success-700 to-success-800 text-white shadow-soft hover:shadow-glow hover:from-success-700 hover:via-success-800 hover:to-success-900 focus:ring-success-500 hover:scale-105': variant === 'success',

    // Warning - Amber gradient
    'bg-gradient-to-r from-warning-600 via-warning-700 to-warning-800 text-white shadow-soft hover:shadow-glow hover:from-warning-700 hover:via-warning-800 hover:to-warning-900 focus:ring-warning-500 hover:scale-105': variant === 'warning',

    // Error - Red gradient
    'bg-gradient-to-r from-error-600 via-error-700 to-error-800 text-white shadow-soft hover:shadow-glow hover:from-error-700 hover:via-error-800 hover:to-error-900 focus:ring-error-500 hover:scale-105': variant === 'error',

    // Ghost - Transparent with subtle hover
    'bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-brand-500 hover:scale-105': variant === 'ghost',

    // Link - Text only with underline effect
    'bg-transparent text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 underline-offset-4 hover:underline focus:ring-brand-500': variant === 'link',
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
        <div className="animate-spin">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
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
        </div>
      );
    }
    if (icon) {
      return <span className="flex-shrink-0" aria-hidden="true">{icon}</span>;
    }
    return null;
  };

  const renderContent = () => {
    return (
      <>
        {/* Shimmer effect overlay for premium feel */}
        <div className="absolute inset-0 -top-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 transform -skew-x-12" />

        {/* Content */}
        <div className="relative flex items-center justify-center gap-2">
          {(icon || loading) && iconPosition === 'left' && renderIcon()}
          {children && <span className="truncate">{children}</span>}
          {icon && iconPosition === 'right' && !loading && renderIcon()}
        </div>
      </>
    );
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
      {renderContent()}
    </button>
  );
});

Button.displayName = 'Button';

Button.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf([
    'primary',
    'secondary',
    'success',
    'warning',
    'error',
    'info',
    'ghost',
    'link'
  ]),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
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
