import React from 'react';
import PropTypes from 'prop-types';
import Button from './Button';
import { cn } from '../../utils/helpers';
import { ADMIN_TEXTS } from '../../utils/localization';

/**
 * Empty state component for displaying when no data is available
 */
const EmptyState = ({
  icon = '📊',
  title = ADMIN_TEXTS.NO_DATA_AVAILABLE,
  description = ADMIN_TEXTS.NO_DATA_DESCRIPTION,
  action = null,
  size = 'medium',
  variant = 'default',
  className = '',
  style = {}
}) => {
  // Container styles with premium glassmorphism
  const containerClasses = cn(
    'flex flex-col items-center justify-center text-center rounded-2xl',
    'bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm',
    'border border-slate-200/50 dark:border-slate-700/50',
    'shadow-soft animate-fade-in-up',
    {
      // Size variants
      'py-8 px-6': size === 'small',
      'py-12 px-8': size === 'medium',
      'py-16 px-12': size === 'large',

      // Variant styles
      'border-brand-200/50 dark:border-brand-800/50 bg-brand-50/30 dark:bg-brand-900/10': variant === 'primary',
      'border-success-200/50 dark:border-success-800/50 bg-success-50/30 dark:bg-success-900/10': variant === 'success',
      'border-warning-200/50 dark:border-warning-800/50 bg-warning-50/30 dark:bg-warning-900/10': variant === 'warning',
      'border-error-200/50 dark:border-error-800/50 bg-error-50/30 dark:bg-error-900/10': variant === 'error',
    },
    className
  );

  // Icon styles with floating animation
  const iconClasses = cn(
    'flex items-center justify-center rounded-full mb-6 animate-float',
    'bg-gradient-to-br shadow-soft relative overflow-hidden group',
    {
      // Size variants
      'w-16 h-16 text-3xl': size === 'small',
      'w-20 h-20 text-4xl': size === 'medium',
      'w-24 h-24 text-5xl': size === 'large',

      // Variant colors
      'from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800': variant === 'default',
      'from-brand-100 to-brand-200 dark:from-brand-800 dark:to-brand-900': variant === 'primary',
      'from-success-100 to-success-200 dark:from-success-800 dark:to-success-900': variant === 'success',
      'from-warning-100 to-warning-200 dark:from-warning-800 dark:to-warning-900': variant === 'warning',
      'from-error-100 to-error-200 dark:from-error-800 dark:to-error-900': variant === 'error',
    }
  );

  return (
    <div className={containerClasses} style={style}>
      {/* Animated Icon with Glow Effect */}
      <div className={iconClasses}>
        <span className="relative z-10">
          {typeof icon === 'string' ? icon : icon}
        </span>
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12" />
      </div>

      {/* Content */}
      <div className="space-y-4 max-w-md">
        <h3 className={cn(
          'font-bold',
          {
            'text-lg': size === 'small',
            'text-xl': size === 'medium',
            'text-2xl': size === 'large',

            'text-slate-900 dark:text-slate-100': variant === 'default',
            'text-brand-900 dark:text-brand-100': variant === 'primary',
            'text-success-900 dark:text-success-100': variant === 'success',
            'text-warning-900 dark:text-warning-100': variant === 'warning',
            'text-error-900 dark:text-error-100': variant === 'error',
          }
        )}>
          {title}
        </h3>

        {description && (
          <p className={cn(
            'leading-relaxed',
            {
              'text-sm': size === 'small',
              'text-base': size === 'medium',
              'text-lg': size === 'large',

              'text-slate-600 dark:text-slate-400': variant === 'default',
              'text-brand-700 dark:text-brand-300': variant === 'primary',
              'text-success-700 dark:text-success-300': variant === 'success',
              'text-warning-700 dark:text-warning-300': variant === 'warning',
              'text-error-700 dark:text-error-300': variant === 'error',
            }
          )}>
            {description}
          </p>
        )}

        {action && (
          <div className="pt-2">
            {React.isValidElement(action) ? action : (
              <Button
                variant={variant === 'default' ? 'primary' : variant}
                size={size === 'large' ? 'large' : 'medium'}
                className="hover-lift"
              >
                {action}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

EmptyState.propTypes = {
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  title: PropTypes.string,
  description: PropTypes.string,
  action: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  variant: PropTypes.oneOf(['default', 'primary', 'success', 'warning', 'error']),
  className: PropTypes.string,
  style: PropTypes.object
};

export default EmptyState;
