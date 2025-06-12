import axios from 'axios';
import { toast } from 'react-hot-toast';

/**
 * Enhanced API client with enterprise features
 */
class ApiClient {
  constructor(config = {}) {
    this.client = axios.create({
      baseURL: config.baseURL || process.env.REACT_APP_API_URL || 'http://localhost:8000',
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    });

    this.setupInterceptors();
    this.retryConfig = {
      retries: 3,
      retryDelay: 1000,
      retryCondition: (error) => {
        return error.response?.status >= 500 || error.code === 'NETWORK_ERROR';
      },
    };
  }

  setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request timestamp for performance monitoring
        config.metadata = { startTime: new Date() };

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Calculate request duration
        const duration = new Date() - response.config.metadata.startTime;
        
        // Log slow requests
        if (duration > 2000) {
          console.warn(`Slow API request: ${response.config.url} took ${duration}ms`);
        }

        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Handle authentication errors
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Handle retry logic
        if (this.shouldRetry(error, originalRequest)) {
          return this.retryRequest(originalRequest);
        }

        // Handle different error types
        this.handleError(error);

        return Promise.reject(error);
      }
    );
  }

  shouldRetry(error, config) {
    return (
      config &&
      !config._retry &&
      this.retryConfig.retryCondition(error) &&
      (config._retryCount || 0) < this.retryConfig.retries
    );
  }

  async retryRequest(config) {
    config._retryCount = (config._retryCount || 0) + 1;
    
    const delay = this.retryConfig.retryDelay * Math.pow(2, config._retryCount - 1);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return this.client(config);
  }

  handleError(error) {
    const message = this.getErrorMessage(error);
    
    // Don't show toast for certain error types
    const silentErrors = [401, 403];
    if (!silentErrors.includes(error.response?.status)) {
      toast.error(message);
    }

    // Log error for monitoring
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message,
      data: error.response?.data,
    });
  }

  getErrorMessage(error) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error.response?.data?.error) {
      return error.response.data.error;
    }

    if (error.response?.status) {
      const statusMessages = {
        400: 'Bad request. Please check your input.',
        401: 'Authentication required.',
        403: 'Access denied.',
        404: 'Resource not found.',
        409: 'Conflict. Resource already exists.',
        422: 'Validation error. Please check your input.',
        429: 'Too many requests. Please try again later.',
        500: 'Internal server error. Please try again.',
        502: 'Service temporarily unavailable.',
        503: 'Service unavailable. Please try again later.',
      };
      
      return statusMessages[error.response.status] || `Error ${error.response.status}`;
    }

    if (error.code === 'NETWORK_ERROR') {
      return 'Network error. Please check your connection.';
    }

    return 'An unexpected error occurred.';
  }

  // HTTP methods with enhanced error handling
  async get(url, config = {}) {
    try {
      const response = await this.client.get(url, config);
      return response.data;
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async post(url, data, config = {}) {
    try {
      const response = await this.client.post(url, data, config);
      return response.data;
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async put(url, data, config = {}) {
    try {
      const response = await this.client.put(url, data, config);
      return response.data;
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async patch(url, data, config = {}) {
    try {
      const response = await this.client.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async delete(url, config = {}) {
    try {
      const response = await this.client.delete(url, config);
      return response.data;
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  normalizeError(error) {
    return {
      message: this.getErrorMessage(error),
      status: error.response?.status,
      data: error.response?.data,
      code: error.code,
    };
  }

  // File upload with progress
  async uploadFile(url, file, onProgress) {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await this.client.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress?.(progress);
        },
      });
      return response.data;
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  // Batch requests
  async batch(requests) {
    try {
      const responses = await Promise.allSettled(
        requests.map(request => this.client(request))
      );
      
      return responses.map((response, index) => ({
        success: response.status === 'fulfilled',
        data: response.status === 'fulfilled' ? response.value.data : null,
        error: response.status === 'rejected' ? this.normalizeError(response.reason) : null,
        request: requests[index],
      }));
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      throw this.normalizeError(error);
    }
  }
}

// Create and export default instance
export const apiClient = new ApiClient();

// Export class for custom instances
export { ApiClient };
