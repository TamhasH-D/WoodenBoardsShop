import { clsx } from 'clsx';

/**
 * Enhanced className utility with conditional logic support
 * Combines clsx for conditional classes with additional utilities
 */
export function cn(...inputs) {
  return clsx(inputs);
}

/**
 * Variant-based className generator for consistent component styling
 */
export function createVariants(base, variants = {}) {
  return function(variant, className) {
    return cn(base, variants[variant], className);
  };
}

/**
 * Responsive className helper
 */
export function responsive(classes) {
  return Object.entries(classes)
    .map(([breakpoint, className]) => {
      if (breakpoint === 'base') return className;
      return `${breakpoint}:${className}`;
    })
    .join(' ');
}

/**
 * Focus ring utility for accessibility
 */
export function focusRing(variant = 'primary') {
  const variants = {
    primary: 'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900',
    secondary: 'focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900',
    success: 'focus:outline-none focus:ring-2 focus:ring-success-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900',
    warning: 'focus:outline-none focus:ring-2 focus:ring-warning-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900',
    error: 'focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900',
  };
  
  return variants[variant] || variants.primary;
}

/**
 * Animation utility for consistent micro-interactions
 */
export function animation(type = 'default') {
  const animations = {
    default: 'transition-all duration-200 ease-out',
    fast: 'transition-all duration-150 ease-out',
    slow: 'transition-all duration-300 ease-out',
    bounce: 'transition-all duration-200 ease-bounce',
    spring: 'transition-all duration-300 ease-out-back',
    fade: 'transition-opacity duration-200 ease-out',
    scale: 'transition-transform duration-200 ease-out',
    slide: 'transition-transform duration-300 ease-out',
  };
  
  return animations[type] || animations.default;
}

/**
 * Glassmorphism utility
 */
export function glass(intensity = 'medium') {
  const intensities = {
    light: 'bg-white/10 dark:bg-black/10 backdrop-blur-sm border border-white/20 dark:border-white/10',
    medium: 'bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/30 dark:border-white/20',
    heavy: 'bg-white/30 dark:bg-black/30 backdrop-blur-lg border border-white/40 dark:border-white/30',
  };
  
  return intensities[intensity] || intensities.medium;
}

/**
 * Shadow utility for consistent depth
 */
export function shadow(level = 'medium') {
  const shadows = {
    none: '',
    xs: 'shadow-xs',
    sm: 'shadow-sm',
    medium: 'shadow-soft',
    large: 'shadow-medium',
    xl: 'shadow-large',
    glow: 'shadow-glow',
    inner: 'shadow-inner-soft',
  };
  
  return shadows[level] || shadows.medium;
}

/**
 * Hover effect utility
 */
export function hover(effect = 'lift') {
  const effects = {
    lift: 'hover:-translate-y-1 hover:shadow-medium',
    scale: 'hover:scale-105',
    glow: 'hover:shadow-glow',
    brightness: 'hover:brightness-110',
    none: '',
  };
  
  return effects[effect] || effects.lift;
}

/**
 * Loading state utility
 */
export function loading(isLoading = false) {
  return isLoading ? 'opacity-50 pointer-events-none cursor-wait' : '';
}

/**
 * Disabled state utility
 */
export function disabled(isDisabled = false) {
  return isDisabled ? 'opacity-50 pointer-events-none cursor-not-allowed' : '';
}

/**
 * Screen reader only utility
 */
export function srOnly() {
  return 'sr-only';
}

/**
 * Truncate text utility
 */
export function truncate(lines = 1) {
  if (lines === 1) {
    return 'truncate';
  }
  return `line-clamp-${lines}`;
}

/**
 * Gradient utility
 */
export function gradient(direction = 'to-r', colors = ['primary-600', 'primary-700']) {
  return `bg-gradient-${direction} from-${colors[0]} to-${colors[1]}`;
}
