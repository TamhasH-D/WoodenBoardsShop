import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../utils/helpers';

/**
 * Premium checkbox component with glassmorphism and smooth animations
 */
const Checkbox = forwardRef(({
  checked = false,
  indeterminate = false,
  disabled = false,
  label,
  helperText,
  error,
  size = 'medium',
  variant = 'primary',
  onChange,
  onClick,
  className = '',
  style = {},
  id,
  name,
  value,
  ...props
}, ref) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  // Container styles
  const containerClasses = cn(
    'flex items-start gap-3 group',
    {
      'opacity-50 cursor-not-allowed': disabled,
    },
    className
  );

  // Checkbox styles with premium design
  const checkboxClasses = cn(
    'relative flex-shrink-0 appearance-none cursor-pointer transition-all duration-200 ease-out',
    'bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm',
    'border-2 border-slate-300 dark:border-slate-600',
    'rounded-lg shadow-soft',
    'focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500',
    'hover:border-slate-400 dark:hover:border-slate-500 hover:shadow-medium',
    'group-hover:scale-105',
    {
      // Size variants
      'w-4 h-4': size === 'small',
      'w-5 h-5': size === 'medium',
      'w-6 h-6': size === 'large',

      // Checked state with variants
      'bg-gradient-to-br from-brand-500 to-brand-600 border-brand-500 shadow-glow': checked && variant === 'primary',
      'bg-gradient-to-br from-success-500 to-success-600 border-success-500 shadow-glow': checked && variant === 'success',
      'bg-gradient-to-br from-warning-500 to-warning-600 border-warning-500 shadow-glow': checked && variant === 'warning',
      'bg-gradient-to-br from-error-500 to-error-600 border-error-500 shadow-glow': checked && variant === 'error',

      // Indeterminate state
      'bg-gradient-to-br from-slate-500 to-slate-600 border-slate-500': indeterminate,

      // Error state
      'border-error-300 dark:border-error-600 focus:ring-error-500/20 focus:border-error-500': error && !checked,

      // Disabled state
      'cursor-not-allowed bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600': disabled,
    }
  );

  // Label styles
  const labelClasses = cn(
    'text-sm font-medium cursor-pointer transition-colors duration-200 select-none',
    {
      'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100': !error && !disabled,
      'text-error-600 dark:text-error-400': error,
      'text-slate-500 dark:text-slate-500 cursor-not-allowed': disabled,
    }
  );

  const handleChange = (e) => {
    if (disabled) return;
    onChange?.(e.target.checked, e);
  };

  const handleClick = (e) => {
    onClick?.(e);
  };

  return (
    <div className={containerClasses} style={style}>
      {/* Checkbox Input with Custom Indicator */}
      <div className="relative">
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          name={name}
          value={value}
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
          onClick={handleClick}
          className={checkboxClasses}
          aria-invalid={!!error}
          aria-describedby={error ? `${checkboxId}-error` : helperText ? `${checkboxId}-helper` : undefined}
          {...props}
        />

        {/* Custom Check/Indeterminate Indicator */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {indeterminate ? (
            <svg
              className="w-3 h-3 text-white animate-scale-in"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
            </svg>
          ) : checked ? (
            <svg
              className="w-3 h-3 text-white animate-scale-in"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          ) : null}
        </div>
      </div>

      {/* Label and Helper Text */}
      {(label || helperText) && (
        <div className="flex-1 min-w-0">
          {label && (
            <label htmlFor={checkboxId} className={labelClasses}>
              {label}
            </label>
          )}
          {helperText && !error && (
            <div
              id={`${checkboxId}-helper`}
              className="text-xs text-slate-500 dark:text-slate-400 mt-1"
            >
              {helperText}
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div
          id={`${checkboxId}-error`}
          className="mt-2 text-sm text-error-600 dark:text-error-400 animate-fade-in-down"
          role="alert"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

Checkbox.propTypes = {
  checked: PropTypes.bool,
  indeterminate: PropTypes.bool,
  disabled: PropTypes.bool,
  label: PropTypes.string,
  helperText: PropTypes.string,
  error: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  variant: PropTypes.oneOf(['primary', 'success', 'warning', 'error']),
  onChange: PropTypes.func,
  onClick: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
  id: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export default Checkbox;
