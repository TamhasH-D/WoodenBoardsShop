import React, { forwardRef, useState, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, focusRing, animation } from '../../utils/cn';

/**
 * Enterprise-grade Input component with floating labels and premium animations
 */
const Input = forwardRef(({
  label,
  placeholder,
  helperText,
  error,
  success,
  type = 'text',
  size = 'medium',
  variant = 'default',
  icon,
  iconPosition = 'left',
  suffix,
  prefix,
  isRequired = false,
  isDisabled = false,
  isReadOnly = false,
  isLoading = false,
  fullWidth = true,
  rounded = 'medium',
  floatingLabel = false,
  showPasswordToggle = false,
  maxLength,
  minLength,
  pattern,
  autoComplete,
  autoFocus,
  className,
  containerClassName,
  labelClassName,
  helperClassName,
  errorClassName,
  value,
  defaultValue,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  onKeyUp,
  onKeyPress,
  ...props
}, ref) => {
  const id = useId();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue || '');

  const inputId = props.id || id;
  const isControlled = value !== undefined;
  const inputValue = isControlled ? value : internalValue;
  const hasValue = inputValue && inputValue.toString().length > 0;
  const isPasswordType = type === 'password';
  const actualType = isPasswordType && showPassword ? 'text' : type;

  // Base styles
  const baseInputStyles = cn(
    'block w-full border transition-all duration-200 ease-out',
    'placeholder-slate-400 dark:placeholder-slate-500',
    'focus:outline-none focus:ring-2 focus:ring-offset-0',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'read-only:bg-slate-50 dark:read-only:bg-slate-800',
    animation('default'),
    focusRing('primary')
  );

  // Variant styles
  const variantStyles = {
    default: cn(
      'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100',
      'border-slate-300 dark:border-slate-600',
      'hover:border-slate-400 dark:hover:border-slate-500',
      'focus:border-primary-500 dark:focus:border-primary-400'
    ),
    filled: cn(
      'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100',
      'border-transparent',
      'hover:bg-slate-200 dark:hover:bg-slate-700',
      'focus:bg-white dark:focus:bg-slate-900 focus:border-primary-500'
    ),
    outlined: cn(
      'bg-transparent text-slate-900 dark:text-slate-100',
      'border-2 border-slate-300 dark:border-slate-600',
      'hover:border-slate-400 dark:hover:border-slate-500',
      'focus:border-primary-500 dark:focus:border-primary-400'
    ),
    ghost: cn(
      'bg-transparent text-slate-900 dark:text-slate-100',
      'border-transparent border-b-2 border-b-slate-300 dark:border-b-slate-600',
      'rounded-none hover:border-b-slate-400 dark:hover:border-b-slate-500',
      'focus:border-b-primary-500 dark:focus:border-b-primary-400'
    ),
  };

  // Size styles
  const sizeStyles = {
    small: 'px-3 py-2 text-sm h-9',
    medium: 'px-4 py-2.5 text-sm h-11',
    large: 'px-5 py-3 text-base h-13',
  };

  // Rounded styles
  const roundedStyles = {
    none: 'rounded-none',
    small: 'rounded-sm',
    medium: 'rounded-lg',
    large: 'rounded-xl',
  };

  // Error/success styles
  const stateStyles = cn({
    'border-error-300 dark:border-error-600 focus:border-error-500 focus:ring-error-500/20': error,
    'border-success-300 dark:border-success-600 focus:border-success-500 focus:ring-success-500/20': success,
  });

  // Icon styles
  const iconStyles = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6',
  };

  // Handle input change
  const handleChange = (e) => {
    if (!isControlled) {
      setInternalValue(e.target.value);
    }
    onChange?.(e);
  };

  // Handle focus
  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  // Handle blur
  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Build input className
  const inputClassName = cn(
    baseInputStyles,
    variantStyles[variant],
    sizeStyles[size],
    roundedStyles[rounded],
    stateStyles,
    {
      'pl-10': icon && iconPosition === 'left' && size === 'small',
      'pl-11': icon && iconPosition === 'left' && size === 'medium',
      'pl-12': icon && iconPosition === 'left' && size === 'large',
      'pr-10': (icon && iconPosition === 'right') || suffix || (isPasswordType && showPasswordToggle) && size === 'small',
      'pr-11': (icon && iconPosition === 'right') || suffix || (isPasswordType && showPasswordToggle) && size === 'medium',
      'pr-12': (icon && iconPosition === 'right') || suffix || (isPasswordType && showPasswordToggle) && size === 'large',
      'w-full': fullWidth,
    },
    className
  );

  // Label styles
  const labelStyles = cn(
    'block text-sm font-medium transition-all duration-200',
    {
      'text-slate-700 dark:text-slate-300': !error && !success,
      'text-error-600 dark:text-error-400': error,
      'text-success-600 dark:text-success-400': success,
      'mb-2': !floatingLabel,
      'absolute left-4 transition-all duration-200 pointer-events-none': floatingLabel,
      'top-3 text-slate-400 dark:text-slate-500': floatingLabel && !isFocused && !hasValue,
      '-top-2 text-xs bg-white dark:bg-slate-900 px-1 text-primary-600 dark:text-primary-400': floatingLabel && (isFocused || hasValue),
    },
    labelClassName
  );

  // Container styles
  const containerStyles = cn(
    'relative',
    {
      'w-full': fullWidth,
    },
    containerClassName
  );

  return (
    <div className={containerStyles}>
      {/* Label */}
      {label && (
        <label htmlFor={inputId} className={labelStyles}>
          {label}
          {isRequired && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}

      {/* Input container */}
      <div className="relative">
        {/* Prefix */}
        {prefix && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400">
            {prefix}
          </div>
        )}

        {/* Left icon */}
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400">
            <span className={iconStyles[size]}>{icon}</span>
          </div>
        )}

        {/* Input */}
        <input
          ref={ref}
          id={inputId}
          type={actualType}
          value={inputValue}
          defaultValue={isControlled ? undefined : defaultValue}
          placeholder={floatingLabel ? '' : placeholder}
          disabled={isDisabled}
          readOnly={isReadOnly}
          required={isRequired}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className={inputClassName}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          onKeyPress={onKeyPress}
          {...props}
        />

        {/* Right icon */}
        {icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400">
            <span className={iconStyles[size]}>{icon}</span>
          </div>
        )}

        {/* Suffix */}
        {suffix && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400">
            {suffix}
          </div>
        )}

        {/* Password toggle */}
        {isPasswordType && showPasswordToggle && (
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? (
              <svg className={iconStyles[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg className={iconStyles[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}

        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg className={cn('animate-spin', iconStyles[size])} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        )}
      </div>

      {/* Helper text, error, or success message */}
      <AnimatePresence mode="wait">
        {(helperText || error || success) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mt-2"
          >
            {error && (
              <p className={cn('text-sm text-error-600 dark:text-error-400 flex items-center gap-1', errorClassName)}>
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            )}
            {success && !error && (
              <p className="text-sm text-success-600 dark:text-success-400 flex items-center gap-1">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {success}
              </p>
            )}
            {helperText && !error && !success && (
              <p className={cn('text-sm text-slate-500 dark:text-slate-400', helperClassName)}>
                {helperText}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Character count */}
      {maxLength && (
        <div className="mt-1 text-right">
          <span className={cn(
            'text-xs',
            inputValue.length > maxLength * 0.9 ? 'text-warning-600' : 'text-slate-500',
            inputValue.length >= maxLength ? 'text-error-600' : ''
          )}>
            {inputValue.length}/{maxLength}
          </span>
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
