/**
 * Общие константы для всех frontend приложений
 * Используются для унификации и предотвращения дублирования
 */

// Mock IDs для разработки и тестирования
// В реальном приложении эти значения будут получены из аутентификации
export const MOCK_IDS = {
  SELLER_ID: '3ab0f210-ca78-4312-841b-8b1ae774adac',
  BUYER_ID: '81f81c96-c56e-4b36-aec3-656f3576d09f',
  ADMIN_ID: 'admin-uuid-placeholder'
};

// API Configuration
export const API_CONFIG = {
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  baseURL: process.env.REACT_APP_API_URL || 'http://172.27.65.14:8000'
};

// Pagination Configuration
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 0,
};

// File Upload Configuration
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
};

// Error Messages (Russian)
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Ошибка сети. Проверьте подключение к интернету.',
  SERVER_ERROR: 'Ошибка сервера. Попробуйте позже.',
  VALIDATION_ERROR: 'Ошибка валидации данных.',
  UNAUTHORIZED: 'Необходима авторизация.',
  FORBIDDEN: 'Доступ запрещен.',
  NOT_FOUND: 'Ресурс не найден.',
  TIMEOUT: 'Превышено время ожидания.',
};

// Success Messages (Russian)
export const SUCCESS_MESSAGES = {
  CREATED: 'Успешно создано!',
  UPDATED: 'Успешно обновлено!',
  DELETED: 'Успешно удалено!',
  SAVED: 'Изменения сохранены!',
};

// Loading States
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
};

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/,
};

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'DD.MM.YYYY',
  LONG: 'DD.MM.YYYY HH:mm',
  ISO: 'YYYY-MM-DD',
  TIME: 'HH:mm',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  DRAFT_MESSAGES: 'draft_messages',
  RECENT_SEARCHES: 'recent_searches',
  CACHE_TIMESTAMP: 'cache_timestamp',
  CART_ITEMS: 'cart_items',
};

// Development Configuration
export const DEV_CONFIG = {
  ENABLE_LOGGING: process.env.NODE_ENV === 'development',
  ENABLE_DEBUG_TOOLS: process.env.NODE_ENV === 'development',
  MOCK_DELAYS: process.env.NODE_ENV === 'development',
};

// UI Configuration
export const UI_CONFIG = {
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 5000,
  ANIMATION_DURATION: 300,
  SKELETON_LINES: 3,
};

// Export all as default for convenience
const constants = {
  MOCK_IDS,
  API_CONFIG,
  PAGINATION_CONFIG,
  UPLOAD_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  LOADING_STATES,
  NOTIFICATION_TYPES,
  VALIDATION_RULES,
  DATE_FORMATS,
  STORAGE_KEYS,
  DEV_CONFIG,
  UI_CONFIG,
};

export default constants;
