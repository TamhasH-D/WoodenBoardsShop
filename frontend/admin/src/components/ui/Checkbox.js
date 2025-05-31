import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import './Checkbox.css';

/**
 * Modern, accessible checkbox component with indeterminate state support
 */
const Checkbox = forwardRef(({
  checked = false,
  indeterminate = false,
  disabled = false,
  label,
  helperText,
  error,
  size = 'medium',
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

  const wrapperClasses = [
    'checkbox-wrapper',
    `checkbox-wrapper--${size}`,
    disabled && 'checkbox-wrapper--disabled',
    error && 'checkbox-wrapper--error',
    className
  ].filter(Boolean).join(' ');

  const checkboxClasses = [
    'checkbox',
    checked && 'checkbox--checked',
    indeterminate && 'checkbox--indeterminate',
    disabled && 'checkbox--disabled'
  ].filter(Boolean).join(' ');

  const handleChange = (e) => {
    if (disabled) return;
    onChange?.(e.target.checked, e);
  };

  const handleClick = (e) => {
    onClick?.(e);
  };

  return (
    <div className={wrapperClasses} style={style}>
      <div className="checkbox-container">
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
          className="checkbox__input"
          aria-invalid={!!error}
          aria-describedby={error ? `${checkboxId}-error` : helperText ? `${checkboxId}-helper` : undefined}
          {...props}
        />
        
        <div className={checkboxClasses} aria-hidden="true">
          <div className="checkbox__indicator">
            {indeterminate ? (
              <span className="checkbox__indeterminate-icon">−</span>
            ) : checked ? (
              <span className="checkbox__check-icon">✓</span>
            ) : null}
          </div>
        </div>
        
        {label && (
          <label htmlFor={checkboxId} className="checkbox__label">
            {label}
          </label>
        )}
      </div>
      
      {error && (
        <div id={`${checkboxId}-error`} className="checkbox__error" role="alert">
          {error}
        </div>
      )}
      
      {helperText && !error && (
        <div id={`${checkboxId}-helper`} className="checkbox__helper">
          {helperText}
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
  onChange: PropTypes.func,
  onClick: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
  id: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export default Checkbox;
