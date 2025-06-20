import React, { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../utils/helpers';

/**
 * Professional Input Component for Admin Panel
 * Enterprise-grade design with enhanced states and accessibility
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
  size = 'md',
  className = '',
  style = {},
  id,
  name,
  rows = 4,
  loading = false,
  icon,
  iconPosition = 'left',
  autoComplete,
  autoFocus,
  maxLength,
  minLength,
  pattern,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false); // eslint-disable-line no-unused-vars
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const isTextarea = type === 'textarea';
  const hasError = Boolean(error);
  const hasIcon = Boolean(icon);

  // Enhanced container styles
  const containerClasses = cn(
    'w-full',
    {
      'opacity-60': disabled,
    }
  );

  // Enhanced label styles
  const labelClasses = cn(
    'block text-sm font-medium mb-2 transition-colors',
    {
      'text-gray-700': !hasError && !disabled,
      'text-red-600': hasError,
      'text-gray-500': disabled,
    }
  );

  // Enhanced input styles with professional design
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-sm',
    lg: 'px-4 py-4 text-base',
  };

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const inputClasses = cn(
    // Base styles
    'w-full border rounded-lg transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-1',
    'placeholder-gray-500',

    // Size
    sizeClasses[size],

    // State variants
    {
      // Normal state
      'border-gray-300 bg-white text-gray-900': !hasError && !disabled,
      'focus:border-blue-500 focus:ring-blue-500': !hasError && !disabled,

      // Error state
      'border-red-300 bg-red-50 text-red-900 placeholder-red-400': hasError,
      'focus:border-red-500 focus:ring-red-500': hasError,

      // Disabled state
      'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed': disabled,

      // Textarea specific
      'resize-none': isTextarea,

      // Icon padding
      'pl-10': hasIcon && iconPosition === 'left' && size === 'sm',
      'pl-11': hasIcon && iconPosition === 'left' && size === 'md',
      'pl-12': hasIcon && iconPosition === 'left' && size === 'lg',
      'pr-10': hasIcon && iconPosition === 'right' && size === 'sm',
      'pr-11': hasIcon && iconPosition === 'right' && size === 'md',
      'pr-12': hasIcon && iconPosition === 'right' && size === 'lg',
    },

    className
  );


  // Icon classes
  const iconClasses = cn(
    'absolute top-1/2 transform -translate-y-1/2 pointer-events-none',
    {
      'left-3': iconPosition === 'left',
      'right-3': iconPosition === 'right',
      'text-gray-400': !hasError && !disabled,
      'text-red-400': hasError,
      'text-gray-300': disabled,
      'w-4 h-4': size === 'sm',
      'w-5 h-5': size === 'md',
      'w-6 h-6': size === 'lg',
    }
  );

  // Loading spinner
  const LoadingSpinner = () => (
    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
    </div>
  );

  const InputElement = isTextarea ? 'textarea' : 'input';

  const inputProps = {
    ref,
    id: inputId,
    name,
    type: isTextarea ? undefined : type,
    className: inputClasses,
    value,
    defaultValue,
    onChange,
    onFocus: handleFocus,
    onBlur: handleBlur,
    disabled: disabled || loading,
    required,
    placeholder,
    rows: isTextarea ? rows : undefined,
    autoComplete,
    autoFocus,
    maxLength,
    minLength,
    pattern,
    'aria-invalid': !!error,
    'aria-describedby': error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined,
    ...props
  };

  return (
    <div className={containerClasses} style={style}>
      {/* Enhanced Label */}
      {label && (
        <label htmlFor={inputId} className={labelClasses}>
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="обязательное поле">
              *
            </span>
          )}
        </label>
      )}

      {/* Input Container with Icon Support */}
      <div className="relative">
        {/* Left icon */}
        {hasIcon && iconPosition === 'left' && (
          <div className={iconClasses}>
            {icon}
          </div>
        )}

        {/* Input Field */}
        <InputElement {...inputProps} />

        {/* Right icon */}
        {hasIcon && iconPosition === 'right' && !loading && (
          <div className={iconClasses}>
            {icon}
          </div>
        )}

        {/* Loading spinner */}
        {loading && <LoadingSpinner />}
      </div>

      {/* Error Message */}
      {error && (
        <div
          id={`${inputId}-error`}
          className="mt-2 text-sm text-red-600"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <div
          id={`${inputId}-helper`}
          className="mt-2 text-sm text-gray-500"
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
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  rows: PropTypes.number,
  className: PropTypes.string,
  style: PropTypes.object,
  id: PropTypes.string,
  name: PropTypes.string,
  loading: PropTypes.bool,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  autoComplete: PropTypes.string,
  autoFocus: PropTypes.bool,
  maxLength: PropTypes.number,
  minLength: PropTypes.number,
  pattern: PropTypes.string,
};

export default Input;
