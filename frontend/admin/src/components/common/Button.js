import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn, createVariants, animation, focusRing, loading, disabled } from '../../utils/cn';

/**
 * Enterprise-grade Button component with premium animations and variants
 */
const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  isLoading = false,
  isDisabled = false,
  fullWidth = false,
  rounded = 'medium',
  shadow = 'soft',
  animation: animationType = 'default',
  href,
  target,
  rel,
  type = 'button',
  className,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  ...props
}, ref) => {
  // Base button styles
  const baseStyles = cn(
    'inline-flex items-center justify-center font-medium transition-all duration-200 ease-out',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    'relative overflow-hidden group',
    animation(animationType),
    focusRing(variant),
    loading(isLoading),
    disabled(isDisabled)
  );

  // Variant styles
  const variantStyles = createVariants(baseStyles, {
    primary: cn(
      'text-white bg-gradient-to-r from-primary-600 to-primary-700',
      'hover:from-primary-700 hover:to-primary-800 hover:shadow-glow',
      'active:from-primary-800 active:to-primary-900',
      'focus:ring-primary-500'
    ),
    secondary: cn(
      'text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800',
      'border border-slate-300 dark:border-slate-600',
      'hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500',
      'active:bg-slate-100 dark:active:bg-slate-600',
      'focus:ring-slate-500'
    ),
    success: cn(
      'text-white bg-gradient-to-r from-success-600 to-success-700',
      'hover:from-success-700 hover:to-success-800 hover:shadow-glow-success',
      'active:from-success-800 active:to-success-900',
      'focus:ring-success-500'
    ),
    warning: cn(
      'text-white bg-gradient-to-r from-warning-600 to-warning-700',
      'hover:from-warning-700 hover:to-warning-800 hover:shadow-glow-warning',
      'active:from-warning-800 active:to-warning-900',
      'focus:ring-warning-500'
    ),
    error: cn(
      'text-white bg-gradient-to-r from-error-600 to-error-700',
      'hover:from-error-700 hover:to-error-800 hover:shadow-glow-error',
      'active:from-error-800 active:to-error-900',
      'focus:ring-error-500'
    ),
    ghost: cn(
      'text-slate-700 dark:text-slate-300 bg-transparent',
      'hover:bg-slate-100 dark:hover:bg-slate-800',
      'active:bg-slate-200 dark:active:bg-slate-700',
      'focus:ring-slate-500'
    ),
    outline: cn(
      'text-primary-700 dark:text-primary-400 bg-transparent',
      'border border-primary-300 dark:border-primary-600',
      'hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-400 dark:hover:border-primary-500',
      'active:bg-primary-100 dark:active:bg-primary-900/30',
      'focus:ring-primary-500'
    ),
    link: cn(
      'text-primary-600 dark:text-primary-400 bg-transparent p-0 h-auto',
      'hover:text-primary-700 dark:hover:text-primary-300 hover:underline',
      'active:text-primary-800 dark:active:text-primary-200',
      'focus:ring-primary-500'
    ),
  });

  // Size styles
  const sizeStyles = {
    small: 'px-3 py-1.5 text-sm h-8',
    medium: 'px-4 py-2 text-sm h-10',
    large: 'px-6 py-3 text-base h-12',
    xl: 'px-8 py-4 text-lg h-14',
  };

  // Rounded styles
  const roundedStyles = {
    none: 'rounded-none',
    small: 'rounded-sm',
    medium: 'rounded-lg',
    large: 'rounded-xl',
    full: 'rounded-full',
  };

  // Shadow styles
  const shadowStyles = {
    none: '',
    soft: 'shadow-soft hover:shadow-medium',
    medium: 'shadow-medium hover:shadow-large',
    large: 'shadow-large hover:shadow-xl',
  };

  // Icon size mapping
  const iconSizes = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6',
    xl: 'w-7 h-7',
  };

  // Loading spinner
  const LoadingSpinner = () => (
    <svg
      className={cn('animate-spin', iconSizes[size])}
      fill="none"
      viewBox="0 0 24 24"
    >
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
  );

  // Build final className
  const buttonClassName = cn(
    variantStyles(variant),
    sizeStyles[size],
    roundedStyles[rounded],
    shadowStyles[shadow],
    {
      'w-full': fullWidth,
      'cursor-wait': isLoading,
      'cursor-not-allowed opacity-50': isDisabled,
    },
    className
  );

  // Motion variants for animations
  const motionVariants = {
    hover: {
      scale: 1.02,
      transition: { duration: 0.2, ease: 'easeOut' },
    },
    tap: {
      scale: 0.98,
      transition: { duration: 0.1, ease: 'easeInOut' },
    },
  };

  // Handle click
  const handleClick = (e) => {
    if (isLoading || isDisabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  // Render content
  const renderContent = () => (
    <>
      {/* Shimmer effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%]" />
      
      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <span className={cn('flex-shrink-0', iconSizes[size])}>
                {icon}
              </span>
            )}
            {children && <span>{children}</span>}
            {icon && iconPosition === 'right' && (
              <span className={cn('flex-shrink-0', iconSizes[size])}>
                {icon}
              </span>
            )}
          </>
        )}
      </span>
    </>
  );

  // Render as link if href is provided
  if (href) {
    return (
      <motion.a
        ref={ref}
        href={href}
        target={target}
        rel={rel}
        className={buttonClassName}
        onClick={handleClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onFocus={onFocus}
        onBlur={onBlur}
        variants={motionVariants}
        whileHover="hover"
        whileTap="tap"
        {...props}
      >
        {renderContent()}
      </motion.a>
    );
  }

  // Render as button
  return (
    <motion.button
      ref={ref}
      type={type}
      className={buttonClassName}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      disabled={isLoading || isDisabled}
      variants={motionVariants}
      whileHover="hover"
      whileTap="tap"
      {...props}
    >
      {renderContent()}
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;
