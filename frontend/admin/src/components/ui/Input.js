import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../utils/helpers';

/**
 * Corporate Input Component
 * Professional, minimal design suitable for enterprise admin panels
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
  // fullWidth = true,
  className = '',
  style = {},
  id,
  name,
  rows = 4,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const isTextarea = type === 'textarea';
  const hasError = Boolean(error);

  // Corporate container styles
  const containerClasses = cn(
    'w-full',
    {
      'opacity-50': disabled,
    }
  );

  // Corporate label styles
  const labelClasses = cn(
    'block text-sm font-medium mb-2 text-gray-700',
    {
      'text-error-600': hasError,
      'text-gray-500': disabled,
    }
  );

  // Corporate input styles - clean and professional
  const inputClasses = cn(
    'block w-full transition-colors duration-150',
    'border border-gray-300 rounded-md',
    'bg-white text-gray-900 placeholder-gray-500',
    'focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500',
    {
      // Size variants
      'px-3 py-1.5 text-sm h-8': size === 'sm',
      'px-3 py-2 text-sm h-10': size === 'md',
      'px-4 py-3 text-base h-12': size === 'lg',

      // Error state
      'border-error-500 focus:ring-error-500 focus:border-error-500': hasError,

      // Disabled state
      'bg-gray-50 text-gray-500 cursor-not-allowed': disabled,

      // Textarea specific
      'resize-none': isTextarea,
    },
    className
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
    onFocus,
    onBlur,
    disabled,
    required,
    placeholder,
    rows: isTextarea ? rows : undefined,
    'aria-invalid': !!error,
    'aria-describedby': error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined,
    ...props
  };

  return (
    <div className={containerClasses} style={style}>
      {/* Corporate Label */}
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

      {/* Input Field */}
      <InputElement {...inputProps} />

      {/* Error Message */}
      {error && (
        <div
          id={`${inputId}-error`}
          className="mt-1 text-sm text-error-600"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <div
          id={`${inputId}-helper`}
          className="mt-1 text-sm text-gray-500"
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
  fullWidth: PropTypes.bool,
  rows: PropTypes.number,
  className: PropTypes.string,
  style: PropTypes.object,
  id: PropTypes.string,
  name: PropTypes.string
};

export default Input;
