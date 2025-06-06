import React, { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../utils/helpers';

/**
 * Premium input component with glassmorphism and advanced animations
 */
const Input = forwardRef(({
  type = 'text',
  label,
  placeholder,
  value,
  defaultValue,
  onChange,
  onBlur,
  onFocus,
  disabled = false,
  required = false,
  error,
  helperText,
  size = 'medium',
  fullWidth = false,
  icon,
  iconPosition = 'left',
  clearable = false,
  autoComplete,
  autoFocus = false,
  maxLength,
  minLength,
  pattern,
  step,
  min,
  max,
  rows = 3,
  className = '',
  style = {},
  id,
  name,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const isTextarea = type === 'textarea';
  const isPassword = type === 'password';
  const hasValue = value !== undefined ? value !== '' : defaultValue !== '';
  const hasError = Boolean(error);

  // Container styles with premium design
  const containerClasses = cn(
    'relative group',
    {
      'w-full': fullWidth,
      'opacity-50 cursor-not-allowed': disabled,
    }
  );

  // Label styles with floating animation
  const labelClasses = cn(
    'block text-sm font-medium mb-2 transition-colors duration-200',
    {
      'text-slate-700 dark:text-slate-300': !hasError && !disabled,
      'text-error-600 dark:text-error-400': hasError,
      'text-slate-500 dark:text-slate-500': disabled,
    }
  );

  // Input field styles with glassmorphism and animations
  const inputClasses = cn(
    'w-full transition-all duration-200 ease-out',
    'bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm',
    'border border-slate-300 dark:border-slate-600',
    'rounded-xl shadow-soft',
    'text-slate-900 dark:text-slate-100',
    'placeholder:text-slate-400 dark:placeholder:text-slate-500',
    'focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500',
    'hover:border-slate-400 dark:hover:border-slate-500 hover:shadow-medium',
    {
      // Size variants
      'px-3 py-2 text-sm': size === 'small',
      'px-4 py-3 text-base': size === 'medium',
      'px-6 py-4 text-lg': size === 'large',

      // Icon spacing
      'pl-11': icon && iconPosition === 'left' && size === 'small',
      'pr-11': icon && iconPosition === 'right' && size === 'small',
      'pl-12': icon && iconPosition === 'left' && size === 'medium',
      'pr-12': icon && iconPosition === 'right' && size === 'medium',
      'pl-14': icon && iconPosition === 'left' && size === 'large',
      'pr-14': icon && iconPosition === 'right' && size === 'large',

      // Action button spacing (clear/password toggle)
      'pr-10': (clearable && hasValue) || isPassword,

      // Error state
      'border-error-300 dark:border-error-600 focus:ring-error-500/20 focus:border-error-500 bg-error-50/50 dark:bg-error-900/10': hasError,

      // Disabled state
      'bg-slate-100 dark:bg-slate-700 cursor-not-allowed': disabled,

      // Textarea specific
      'resize-none min-h-[100px]': isTextarea,
    },
    className
  );



  const handleClear = () => {
    if (onChange) {
      const event = {
        target: { value: '', name }
      };
      onChange(event);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Icon positioning styles
  const iconClasses = cn(
    'absolute top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none transition-colors duration-200',
    {
      'left-3': iconPosition === 'left' && size === 'small',
      'left-4': iconPosition === 'left' && size === 'medium',
      'left-5': iconPosition === 'left' && size === 'large',
      'right-3': iconPosition === 'right' && size === 'small',
      'right-4': iconPosition === 'right' && size === 'medium',
      'right-5': iconPosition === 'right' && size === 'large',
    }
  );

  // Action button styles
  const actionButtonClasses = cn(
    'absolute top-1/2 transform -translate-y-1/2 right-3',
    'w-5 h-5 flex items-center justify-center',
    'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300',
    'transition-colors duration-200 cursor-pointer',
    'focus:outline-none focus:ring-2 focus:ring-brand-500/20 rounded',
    {
      'right-2': size === 'small',
      'right-3': size === 'medium',
      'right-4': size === 'large',
    }
  );

  const inputProps = {
    ref,
    id: inputId,
    name,
    className: inputClasses,
    value,
    defaultValue,
    onChange,
    onFocus,
    onBlur,
    disabled,
    required,
    placeholder,
    autoComplete,
    autoFocus,
    maxLength,
    minLength,
    pattern,
    step,
    min,
    max,
    'aria-invalid': !!error,
    'aria-describedby': error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined,
    ...props
  };

  const InputElement = isTextarea ? 'textarea' : 'input';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={containerClasses} style={style}>
      {/* Premium Label with Required Indicator */}
      {label && (
        <label htmlFor={inputId} className={labelClasses}>
          {label}
          {required && (
            <span className="text-error-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>
      )}

      {/* Input Container with Glassmorphism */}
      <div className="relative">
        {/* Left Icon */}
        {icon && iconPosition === 'left' && (
          <div className={iconClasses}>
            {icon}
          </div>
        )}

        {/* Input Field */}
        <InputElement
          {...inputProps}
          type={isTextarea ? undefined : inputType}
          rows={isTextarea ? rows : undefined}
        />

        {/* Right Icon */}
        {icon && iconPosition === 'right' && !clearable && !isPassword && (
          <div className={iconClasses}>
            {icon}
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-1/2 transform -translate-y-1/2 right-3 flex items-center gap-1">
          {clearable && hasValue && !disabled && (
            <button
              type="button"
              className={actionButtonClasses}
              onClick={handleClear}
              aria-label="Clear input"
              tabIndex={-1}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {isPassword && (
            <button
              type="button"
              className={actionButtonClasses}
              onClick={togglePasswordVisibility}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div
          id={`${inputId}-error`}
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

      {/* Helper Text */}
      {helperText && !error && (
        <div
          id={`${inputId}-helper`}
          className="mt-2 text-sm text-slate-500 dark:text-slate-400"
        >
          {helperText}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  type: PropTypes.oneOf([
    'text',
    'email',
    'password',
    'number',
    'tel',
    'url',
    'search',
    'date',
    'datetime-local',
    'time',
    'textarea'
  ]),
  label: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  error: PropTypes.string,
  helperText: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  fullWidth: PropTypes.bool,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  clearable: PropTypes.bool,
  autoComplete: PropTypes.string,
  autoFocus: PropTypes.bool,
  maxLength: PropTypes.number,
  minLength: PropTypes.number,
  pattern: PropTypes.string,
  step: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  rows: PropTypes.number,
  className: PropTypes.string,
  style: PropTypes.object,
  id: PropTypes.string,
  name: PropTypes.string
};

export default Input;
