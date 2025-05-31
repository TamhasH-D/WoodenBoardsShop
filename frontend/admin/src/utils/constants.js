// Application constants and configuration
export const APP_CONFIG = {
  name: 'Admin Dashboard',
  version: '2.0.0',
  description: 'Enterprise Administration Panel',
  author: 'Diplom Project Team'
};

// API Configuration
export const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000
};

// Pagination defaults
export const PAGINATION = {
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100],
  maxPageSize: 1000
};

// Entity types and their configurations
export const ENTITY_TYPES = {
  BUYERS: 'buyers',
  SELLERS: 'sellers',
  PRODUCTS: 'products',
  WOOD_TYPES: 'woodTypes',
  WOOD_TYPE_PRICES: 'prices',
  WOODEN_BOARDS: 'boards',
  IMAGES: 'images',
  CHAT_THREADS: 'threads',
  CHAT_MESSAGES: 'messages'
};

// Field types for dynamic form generation
export const FIELD_TYPES = {
  TEXT: 'text',
  EMAIL: 'email',
  PASSWORD: 'password',
  NUMBER: 'number',
  TEXTAREA: 'textarea',
  SELECT: 'select',
  MULTISELECT: 'multiselect',
  CHECKBOX: 'checkbox',
  DATE: 'date',
  DATETIME: 'datetime',
  URL: 'url',
  UUID: 'uuid',
  FILE: 'file',
  IMAGE: 'image'
};

// Filter operators
export const FILTER_OPERATORS = {
  EQUALS: 'equals',
  NOT_EQUALS: 'not_equals',
  CONTAINS: 'contains',
  NOT_CONTAINS: 'not_contains',
  STARTS_WITH: 'starts_with',
  ENDS_WITH: 'ends_with',
  GREATER_THAN: 'greater_than',
  LESS_THAN: 'less_than',
  GREATER_EQUAL: 'greater_equal',
  LESS_EQUAL: 'less_equal',
  BETWEEN: 'between',
  IN: 'in',
  NOT_IN: 'not_in',
  IS_NULL: 'is_null',
  IS_NOT_NULL: 'is_not_null'
};

// Sort directions
export const SORT_DIRECTIONS = {
  ASC: 'asc',
  DESC: 'desc'
};

// Theme colors
export const THEME = {
  colors: {
    primary: '#3182ce',
    secondary: '#718096',
    success: '#38a169',
    warning: '#d69e2e',
    error: '#e53e3e',
    info: '#3182ce',
    light: '#f7fafc',
    dark: '#2d3748',
    white: '#ffffff',
    black: '#000000'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem'
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem'
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  }
};

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Local storage keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'admin_user_preferences',
  TABLE_SETTINGS: 'admin_table_settings',
  THEME_SETTINGS: 'admin_theme_settings',
  RECENT_SEARCHES: 'admin_recent_searches'
};

// Export formats
export const EXPORT_FORMATS = {
  JSON: 'json',
  CSV: 'csv',
  EXCEL: 'xlsx'
};

// Date formats
export const DATE_FORMATS = {
  SHORT: 'MM/dd/yyyy',
  MEDIUM: 'MMM dd, yyyy',
  LONG: 'MMMM dd, yyyy',
  FULL: 'EEEE, MMMM dd, yyyy',
  TIME: 'HH:mm:ss',
  DATETIME: 'MM/dd/yyyy HH:mm:ss'
};

// Validation rules
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  PHONE: /^\+?[\d\s\-\(\)]+$/,
  PASSWORD: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false
  }
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  TIMEOUT: 'Request timeout. Please try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred.'
};

// Success messages
export const SUCCESS_MESSAGES = {
  CREATED: 'Item created successfully',
  UPDATED: 'Item updated successfully',
  DELETED: 'Item deleted successfully',
  BULK_DELETED: 'Items deleted successfully',
  EXPORTED: 'Data exported successfully',
  IMPORTED: 'Data imported successfully'
};

// Loading states
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
};

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  SEARCH: 'ctrl+k',
  NEW_ITEM: 'ctrl+n',
  SAVE: 'ctrl+s',
  CANCEL: 'escape',
  DELETE: 'delete',
  REFRESH: 'f5'
};

// Animation durations (in milliseconds)
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
};

// Breakpoints for responsive design
export const BREAKPOINTS = {
  xs: '480px',
  sm: '768px',
  md: '1024px',
  lg: '1280px',
  xl: '1536px'
};

export default {
  APP_CONFIG,
  API_CONFIG,
  PAGINATION,
  ENTITY_TYPES,
  FIELD_TYPES,
  FILTER_OPERATORS,
  SORT_DIRECTIONS,
  THEME,
  NOTIFICATION_TYPES,
  STORAGE_KEYS,
  EXPORT_FORMATS,
  DATE_FORMATS,
  VALIDATION_RULES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  LOADING_STATES,
  KEYBOARD_SHORTCUTS,
  ANIMATION_DURATION,
  BREAKPOINTS
};
