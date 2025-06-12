import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../utils/helpers';

/**
 * Professional FormField Component for Admin Panel
 * Enterprise-grade form field with proper validation and accessibility
 */
const FormField = forwardRef(({
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
  containerClassName = '',
  labelClassName = '',
  inputClassName = '',
  errorClassName = '',
  helperClassName = '',
  id,
  name,
  rows = 4,
  options = [], // For select fields
  loading = false,
  icon,
  iconPosition = 'left',
  autoComplete,
  autoFocus,
  maxLength,
  minLength,
  pattern,
  step,
  min,
  max,
  ...props
}, ref) => {
  const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`;
  const isTextarea = type === 'textarea';
  const isSelect = type === 'select';
  const hasError = Boolean(error);
  const hasIcon = Boolean(icon);

  // Size variants
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-sm',
    lg: 'px-4 py-4 text-base',
  };

  // Container classes
  const containerClasses = cn(
    'w-full',
    {
      'opacity-60': disabled,
    },
    containerClassName
  );

  // Label classes
  const labelClasses = cn(
    'block text-sm font-medium mb-2 transition-colors',
    {
      'text-gray-700': !hasError && !disabled,
      'text-red-600': hasError,
      'text-gray-500': disabled,
    },
    labelClassName
  );

  // Input base classes
  const inputBaseClasses = cn(
    'w-full border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1',
    sizeClasses[size],
    {
      // Normal state
      'border-gray-300 bg-white text-gray-900 placeholder-gray-500': !hasError && !disabled,
      'focus:border-blue-500 focus:ring-blue-500': !hasError && !disabled,
      
      // Error state
      'border-red-300 bg-red-50 text-red-900 placeholder-red-400': hasError,
      'focus:border-red-500 focus:ring-red-500': hasError,
      
      // Disabled state
      'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed': disabled,
      
      // Icon padding
      'pl-10': hasIcon && iconPosition === 'left' && size === 'sm',
      'pl-11': hasIcon && iconPosition === 'left' && size === 'md',
      'pl-12': hasIcon && iconPosition === 'left' && size === 'lg',
      'pr-10': hasIcon && iconPosition === 'right' && size === 'sm',
      'pr-11': hasIcon && iconPosition === 'right' && size === 'md',
      'pr-12': hasIcon && iconPosition === 'right' && size === 'lg',
    },
    inputClassName
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

  // Render input element
  const renderInput = () => {
    const commonProps = {
      ref,
      id: fieldId,
      name: name || fieldId,
      value,
      defaultValue,
      onChange,
      onBlur,
      onFocus,
      disabled: disabled || loading,
      required,
      placeholder,
      className: inputBaseClasses,
      autoComplete,
      autoFocus,
      maxLength,
      minLength,
      pattern,
      step,
      min,
      max,
      'aria-invalid': hasError,
      'aria-describedby': hasError ? `${fieldId}-error` : helperText ? `${fieldId}-helper` : undefined,
      ...props,
    };

    if (isTextarea) {
      return (
        <textarea
          {...commonProps}
          rows={rows}
        />
      );
    }

    if (isSelect) {
      return (
        <select {...commonProps}>
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    return <input {...commonProps} type={type} />;
  };

  return (
    <div className={containerClasses}>
      {/* Label */}
      {label && (
        <label htmlFor={fieldId} className={labelClasses}>
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="обязательное поле">
              *
            </span>
          )}
        </label>
      )}

      {/* Input container */}
      <div className="relative">
        {/* Left icon */}
        {hasIcon && iconPosition === 'left' && (
          <div className={iconClasses}>
            {icon}
          </div>
        )}

        {/* Input element */}
        {renderInput()}

        {/* Right icon */}
        {hasIcon && iconPosition === 'right' && !loading && (
          <div className={iconClasses}>
            {icon}
          </div>
        )}

        {/* Loading spinner */}
        {loading && <LoadingSpinner />}
      </div>

      {/* Error message */}
      {error && (
        <div
          id={`${fieldId}-error`}
          className={cn('mt-2 text-sm text-red-600', errorClassName)}
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Helper text */}
      {helperText && !error && (
        <div
          id={`${fieldId}-helper`}
          className={cn('mt-2 text-sm text-gray-500', helperClassName)}
        >
          {helperText}
        </div>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';

FormField.propTypes = {
  type: PropTypes.oneOf([
    'text', 'email', 'password', 'number', 'tel', 'url', 'search',
    'textarea', 'select', 'date', 'datetime-local', 'time'
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
  className: PropTypes.string,
  containerClassName: PropTypes.string,
  labelClassName: PropTypes.string,
  inputClassName: PropTypes.string,
  errorClassName: PropTypes.string,
  helperClassName: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
  rows: PropTypes.number,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
      disabled: PropTypes.bool,
    })
  ),
  loading: PropTypes.bool,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  autoComplete: PropTypes.string,
  autoFocus: PropTypes.bool,
  maxLength: PropTypes.number,
  minLength: PropTypes.number,
  pattern: PropTypes.string,
  step: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default FormField;
