import React, { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import './Input.css';

/**
 * Modern, accessible input component with validation and various types
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
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const isTextarea = type === 'textarea';
  const isPassword = type === 'password';
  const hasValue = value !== undefined ? value !== '' : defaultValue !== '';

  const baseClasses = [
    'input-wrapper',
    `input-wrapper--${size}`,
    fullWidth && 'input-wrapper--full-width',
    focused && 'input-wrapper--focused',
    error && 'input-wrapper--error',
    disabled && 'input-wrapper--disabled',
    hasValue && 'input-wrapper--has-value',
    className
  ].filter(Boolean).join(' ');

  const inputClasses = [
    'input',
    icon && `input--with-icon-${iconPosition}`,
    (clearable || isPassword) && 'input--with-action'
  ].filter(Boolean).join(' ');

  const handleFocus = (e) => {
    setFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setFocused(false);
    onBlur?.(e);
  };

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

  const renderIcon = () => {
    if (!icon) return null;
    return (
      <span className={`input__icon input__icon--${iconPosition}`} aria-hidden="true">
        {icon}
      </span>
    );
  };

  const renderActions = () => {
    const actions = [];

    if (clearable && hasValue && !disabled) {
      actions.push(
        <button
          key="clear"
          type="button"
          className="input__action input__action--clear"
          onClick={handleClear}
          aria-label="Clear input"
          tabIndex={-1}
        >
          ✕
        </button>
      );
    }

    if (isPassword) {
      actions.push(
        <button
          key="toggle-password"
          type="button"
          className="input__action input__action--toggle-password"
          onClick={togglePasswordVisibility}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {showPassword ? '👁️' : '👁️‍🗨️'}
        </button>
      );
    }

    return actions.length > 0 ? (
      <div className="input__actions">
        {actions}
      </div>
    ) : null;
  };

  const inputProps = {
    ref,
    id: inputId,
    name,
    className: inputClasses,
    value,
    defaultValue,
    onChange,
    onFocus: handleFocus,
    onBlur: handleBlur,
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
    <div className={baseClasses} style={style}>
      {label && (
        <label htmlFor={inputId} className="input__label">
          {label}
          {required && <span className="input__required" aria-label="required">*</span>}
        </label>
      )}
      
      <div className="input__container">
        {icon && iconPosition === 'left' && renderIcon()}
        
        <InputElement
          {...inputProps}
          type={isTextarea ? undefined : inputType}
          rows={isTextarea ? rows : undefined}
        />
        
        {icon && iconPosition === 'right' && renderIcon()}
        {renderActions()}
      </div>
      
      {error && (
        <div id={`${inputId}-error`} className="input__error" role="alert">
          {error}
        </div>
      )}
      
      {helperText && !error && (
        <div id={`${inputId}-helper`} className="input__helper">
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
