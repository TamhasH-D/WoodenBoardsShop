import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { THEME } from '../../utils/constants';
import './Button.css';

/**
 * Modern, accessible button component with multiple variants and states
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
  const baseClasses = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth && 'btn--full-width',
    loading && 'btn--loading',
    disabled && 'btn--disabled',
    icon && !children && 'btn--icon-only',
    className
  ].filter(Boolean).join(' ');

  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  const renderIcon = () => {
    if (loading) {
      return <span className="btn__spinner" aria-hidden="true" />;
    }
    if (icon) {
      return <span className="btn__icon" aria-hidden="true">{icon}</span>;
    }
    return null;
  };

  const renderContent = () => {
    if (loading && !children) {
      return <span className="btn__spinner" aria-hidden="true" />;
    }

    return (
      <>
        {(icon || loading) && iconPosition === 'left' && renderIcon()}
        {children && <span className="btn__text">{children}</span>}
        {icon && iconPosition === 'right' && !loading && renderIcon()}
      </>
    );
  };

  return (
    <button
      ref={ref}
      type={type}
      className={baseClasses}
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
