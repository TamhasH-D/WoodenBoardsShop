import { toast } from 'react-toastify';

export const handleApiError = (error, showToast = true) => {
  console.error('API Error:', error);

  let errorMessage = 'Произошла неожиданная ошибка';
  let errorCode = 'UNKNOWN_ERROR';

  if (!error) {
    return { message: errorMessage, code: errorCode };
  }

  // Network errors
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      errorMessage = 'Превышено время ожидания запроса';
      errorCode = 'TIMEOUT_ERROR';
    } else if (error.message === 'Network Error') {
      errorMessage = 'Ошибка сети. Проверьте подключение к интернету';
      errorCode = 'NETWORK_ERROR';
    } else {
      errorMessage = 'Сервер недоступен';
      errorCode = 'SERVER_UNAVAILABLE';
    }
  } else {
    // HTTP errors
    const status = error.response.status;
    const data = error.response.data;

    switch (status) {
      case 400:
        errorMessage = data?.message || 'Некорректный запрос';
        errorCode = 'BAD_REQUEST';
        break;
      case 401:
        errorMessage = 'Необходима авторизация';
        errorCode = 'UNAUTHORIZED';
        break;
      case 403:
        errorMessage = 'Доступ запрещен';
        errorCode = 'FORBIDDEN';
        break;
      case 404:
        errorMessage = 'Ресурс не найден';
        errorCode = 'NOT_FOUND';
        break;
      case 422:
        errorMessage = data?.message || 'Ошибка валидации данных';
        errorCode = 'VALIDATION_ERROR';
        break;
      case 429:
        errorMessage = 'Слишком много запросов. Попробуйте позже';
        errorCode = 'RATE_LIMIT';
        break;
      case 500:
        errorMessage = 'Внутренняя ошибка сервера';
        errorCode = 'INTERNAL_SERVER_ERROR';
        break;
      case 502:
        errorMessage = 'Сервер временно недоступен';
        errorCode = 'BAD_GATEWAY';
        break;
      case 503:
        errorMessage = 'Сервис временно недоступен';
        errorCode = 'SERVICE_UNAVAILABLE';
        break;
      default:
        errorMessage = data?.message || `Ошибка сервера (${status})`;
        errorCode = 'SERVER_ERROR';
    }
  }

  if (showToast) {
    toast.error(errorMessage);
  }

  return {
    message: errorMessage,
    code: errorCode,
    status: error.response?.status,
    originalError: error
  };
};

export const createApiWrapper = (apiFunction) => {
  return async (...args) => {
    try {
      const response = await apiFunction(...args);
      
      // Validate response structure
      if (response && typeof response === 'object') {
        return {
          data: response.data || response,
          success: true,
          error: null
        };
      }
      
      return {
        data: response,
        success: true,
        error: null
      };
    } catch (error) {
      const handledError = handleApiError(error, false);
      return {
        data: null,
        success: false,
        error: handledError
      };
    }
  };
};

export const retryApiCall = async (apiFunction, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await apiFunction();
      return result;
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
  
  throw lastError;
};
