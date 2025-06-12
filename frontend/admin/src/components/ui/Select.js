import React, { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../utils/helpers';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

/**
 * Professional Select Component for Admin Panel
 * Enterprise-grade design with enhanced states and accessibility
 */
const Select = forwardRef(({
  label,
  placeholder = 'Выберите опцию...',
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
  loading = false,
  options = [],
  optionValue = 'value',
  optionLabel = 'label',
  emptyOption = true,
  emptyOptionText = 'Не выбрано',
  autoFocus,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false); // eslint-disable-line no-unused-vars
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = Boolean(error);

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

  // Enhanced select styles with professional design
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

  const selectClasses = cn(
    // Base styles
    'w-full border rounded-lg transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-1',
    'appearance-none cursor-pointer',
    'pr-10', // Space for chevron icon

    // Size
    sizeClasses[size],

    // State variants
    {
      // Normal state
      'border-gray-300 bg-white text-gray-900': !hasError && !disabled,
      'focus:border-blue-500 focus:ring-blue-500': !hasError && !disabled,

      // Error state
      'border-red-300 bg-red-50 text-red-900': hasError,
      'focus:border-red-500 focus:ring-red-500': hasError,

      // Disabled state
      'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed': disabled,
    },

    className
  );

  // Icon classes
  const iconClasses = cn(
    'absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none',
    {
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
    <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
    </div>
  );

  const selectProps = {
    ref,
    id: selectId,
    name,
    className: selectClasses,
    value,
    defaultValue,
    onChange,
    onFocus: handleFocus,
    onBlur: handleBlur,
    disabled: disabled || loading,
    required,
    autoFocus,
    'aria-invalid': !!error,
    'aria-describedby': error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined,
    ...props
  };

  // Render option value
  const getOptionValue = (option) => {
    if (typeof option === 'string' || typeof option === 'number') {
      return option;
    }
    return option[optionValue];
  };

  // Render option label
  const getOptionLabel = (option) => {
    if (typeof option === 'string' || typeof option === 'number') {
      return option;
    }
    return option[optionLabel];
  };

  return (
    <div className={containerClasses} style={style}>
      {/* Enhanced Label */}
      {label && (
        <label htmlFor={selectId} className={labelClasses}>
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="обязательное поле">
              *
            </span>
          )}
        </label>
      )}

      {/* Select Container with Icon Support */}
      <div className="relative">
        {/* Select Field */}
        <select {...selectProps}>
          {/* Empty option */}
          {emptyOption && (
            <option value="">
              {placeholder || emptyOptionText}
            </option>
          )}

          {/* Options */}
          {options.map((option, index) => {
            const optValue = getOptionValue(option);
            const optLabel = getOptionLabel(option);
            
            return (
              <option key={`${optValue}-${index}`} value={optValue}>
                {optLabel}
              </option>
            );
          })}
        </select>

        {/* Chevron icon */}
        {!loading && (
          <div className={iconClasses}>
            <ChevronDownIcon />
          </div>
        )}

        {/* Loading spinner */}
        {loading && <LoadingSpinner />}
      </div>

      {/* Error Message */}
      {error && (
        <div
          id={`${selectId}-error`}
          className="mt-2 text-sm text-red-600"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <div
          id={`${selectId}-helper`}
          className="mt-2 text-sm text-gray-500"
        >
          {helperText}
        </div>
      )}
    </div>
  );
});

Select.displayName = 'Select';

Select.propTypes = {
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
  style: PropTypes.object,
  id: PropTypes.string,
  name: PropTypes.string,
  loading: PropTypes.bool,
  options: PropTypes.array,
  optionValue: PropTypes.string,
  optionLabel: PropTypes.string,
  emptyOption: PropTypes.bool,
  emptyOptionText: PropTypes.string,
  autoFocus: PropTypes.bool,
};

export default Select;
