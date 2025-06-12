/**
 * Общие константы для всех frontend приложений
 * Используются для унификации и предотвращения дублирования
 */

// Mock IDs для разработки и тестирования
// В реальном приложении эти значения будут получены из аутентификации
export const MOCK_IDS = {
  SELLER_ID: '3ab0f210-ca78-4312-841b-8b1ae774adac',
  SELLER_KEYCLOAK_ID: 'seller-keycloak-uuid-placeholder'
};

// API Configuration
export const API_CONFIG = {
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000'
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

// Local Storage Keys - Use sparingly, prefer server-side storage
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'user_preferences', // Only for UI preferences
  // Removed draft_messages, recent_searches, cache_timestamp, cart_items
  // These should be stored server-side with real user accounts
};

// Development Configuration
export const DEV_CONFIG = {
  ENABLE_LOGGING: process.env.NODE_ENV === 'development',
  ENABLE_DEBUG_TOOLS: process.env.NODE_ENV === 'development',
  // Removed MOCK_DELAYS - no fake delays needed
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
  STORAGE_KEYS,
  DEV_CONFIG,
  UI_CONFIG,
};

export default constants;
