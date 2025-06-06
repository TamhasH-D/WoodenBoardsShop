/**
 * Constants for the seller frontend application
 */

// Mock seller ID for development and testing
// In a real application, this would come from authentication
export const MOCK_SELLER_ID = '3ab0f210-ca78-4312-841b-8b1ae774adac';

// API Configuration
export const API_CONFIG = {
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
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

// Wood Types Configuration
export const WOOD_CONFIG = {
  MIN_PRICE: 0.01,
  MAX_PRICE: 10000,
  PRICE_DECIMAL_PLACES: 2,
  DEFAULT_CURRENCY: 'RUB',
};

// Product Configuration
export const PRODUCT_CONFIG = {
  MIN_DIMENSIONS: 0.1,
  MAX_DIMENSIONS: 1000,
  DIMENSION_DECIMAL_PLACES: 2,
  MIN_VOLUME: 0.001,
  MAX_VOLUME: 100,
};

// Chat Configuration
export const CHAT_CONFIG = {
  MAX_MESSAGE_LENGTH: 1000,
  REFRESH_INTERVAL: 30000, // 30 seconds
  MAX_MESSAGES_PER_PAGE: 50,
};

// Auto-refresh Configuration
export const AUTO_REFRESH_CONFIG = {
  INTERVAL: 5 * 60 * 1000, // 5 minutes
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 5000, // 5 seconds
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Ошибка сети. Проверьте подключение к интернету.',
  SERVER_ERROR: 'Ошибка сервера. Попробуйте позже.',
  VALIDATION_ERROR: 'Ошибка валидации данных.',
  UNAUTHORIZED: 'Необходима авторизация.',
  FORBIDDEN: 'Доступ запрещен.',
  NOT_FOUND: 'Ресурс не найден.',
  TIMEOUT: 'Превышено время ожидания.',
  UNKNOWN_ERROR: 'Неизвестная ошибка.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  SAVE_SUCCESS: 'Данные успешно сохранены.',
  DELETE_SUCCESS: 'Данные успешно удалены.',
  UPDATE_SUCCESS: 'Данные успешно обновлены.',
  UPLOAD_SUCCESS: 'Файл успешно загружен.',
  SEND_SUCCESS: 'Сообщение отправлено.',
};

// Loading States
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  SELLER_PREFERENCES: 'seller_preferences',
  DRAFT_MESSAGES: 'draft_messages',
  RECENT_SEARCHES: 'recent_searches',
  CACHE_TIMESTAMP: 'cache_timestamp',
};

// Development Configuration
export const DEV_CONFIG = {
  ENABLE_LOGGING: process.env.NODE_ENV === 'development',
  ENABLE_DEBUG_TOOLS: process.env.NODE_ENV === 'development',
  MOCK_DELAYS: process.env.NODE_ENV === 'development',
};

const constants = {
  MOCK_SELLER_ID,
  API_CONFIG,
  PAGINATION_CONFIG,
  UPLOAD_CONFIG,
  WOOD_CONFIG,
  PRODUCT_CONFIG,
  CHAT_CONFIG,
  AUTO_REFRESH_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  LOADING_STATES,
  STORAGE_KEYS,
  DEV_CONFIG,
};

export default constants;
