import config from './config.js';
import axios from 'axios';

class ApiService {
  constructor() {
    this.baseURL = config.api.baseURL + '/api/v1';
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 seconds timeout
    });

    // Add request interceptor for authentication
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for better error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        this.handleGlobalError(error);
        return Promise.reject(error);
      }
    );
  }

  handleGlobalError(error) {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
      return;
    }

    if (error.response?.status === 403) {
      console.error('У вас нет прав для выполнения этого действия');
      return;
    }

    if (error.response?.status >= 500) {
      console.error('Ошибка сервера. Попробуйте позже');
      return;
    }

    if (error.code === 'ECONNABORTED') {
      console.error('Превышено время ожидания запроса');
      return;
    }

    if (!error.response) {
      console.error('Ошибка сети. Проверьте подключение к интернету');
      return;
    }
  }

  // Generic API methods
  async get(endpoint, params = {}) {
    try {
      const response = await this.api.get(endpoint, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post(endpoint, data) {
    try {
      const response = await this.api.post(endpoint, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async patch(endpoint, data) {
    try {
      const response = await this.api.patch(endpoint, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete(endpoint) {
    try {
      const response = await this.api.delete(endpoint);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async put(endpoint, data) {
    try {
      const response = await this.api.put(endpoint, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      console.error('API Error Response:', error.response.data);
      const message = error.response.data?.message ||
                     error.response.data?.detail ||
                     `HTTP ${error.response.status}: ${error.response.statusText}`;
      return new Error(message);
    } else if (error.request) {
      console.error('API Error Request:', error.request);
      return new Error('Нет ответа от сервера');
    } else {
      console.error('API Error:', error.message);
      return new Error(error.message);
    }
  }

  // Utility method to build query parameters for pagination and filtering
  buildParams(options = {}) {
    const params = {};

    // Pagination
    if (options.page) params.offset = (options.page - 1) * (options.limit || 20);
    if (options.limit) params.limit = options.limit;
    if (options.offset !== undefined) params.offset = options.offset;

    // Sorting
    if (options.sortBy) params.sort_by = options.sortBy;
    if (options.sortDirection) params.sort_direction = options.sortDirection;

    // Filtering
    if (options.search) params.search = options.search;
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params[key] = value;
        }
      });
    }

    return params;
  }

  // Sellers API
  async getSellers(options = {}) {
    const params = this.buildParams(options);
    return this.get('/sellers/', params);
  }

  async getSeller(id) {
    return this.get(`/sellers/${id}`);
  }

  async createSeller(data) {
    return this.post('/sellers/', data);
  }

  async updateSeller(id, data) {
    return this.patch(`/sellers/${id}`, data);
  }

  async deleteSeller(id) {
    return this.delete(`/sellers/${id}`);
  }

  // Products API
  async getProducts(options = {}) {
    const params = this.buildParams(options);
    return this.get('/products/', params);
  }

  async getProduct(id) {
    return this.get(`/products/${id}`);
  }

  async createProduct(data) {
    return this.post('/products/', data);
  }

  async updateProduct(id, data) {
    return this.patch(`/products/${id}`, data);
  }

  async deleteProduct(id) {
    return this.delete(`/products/${id}`);
  }

  // Wood Types API
  async getWoodTypes(options = {}) {
    const params = this.buildParams(options);
    return this.get('/wood_types/', params);
  }

  async getWoodType(id) {
    return this.get(`/wood_types/${id}`);
  }

  // Chat Messages API
  async getChatMessages(options = {}) {
    const params = this.buildParams(options);
    return this.get('/chat-messages/', params);
  }

  async getChatMessage(id) {
    return this.get(`/chat-messages/${id}`);
  }

  async createChatMessage(data) {
    return this.post('/chat-messages/', data);
  }

  async updateChatMessage(id, data) {
    return this.patch(`/chat-messages/${id}`, data);
  }

  async deleteChatMessage(id) {
    return this.delete(`/chat-messages/${id}`);
  }

  // Chat Threads API
  async getChatThreads(options = {}) {
    const params = this.buildParams(options);
    return this.get('/chat-threads/', params);
  }

  async getChatThread(id) {
    return this.get(`/chat-threads/${id}`);
  }

  async createChatThread(data) {
    return this.post('/chat-threads/', data);
  }

  async updateChatThread(id, data) {
    return this.patch(`/chat-threads/${id}`, data);
  }

  async deleteChatThread(id) {
    return this.delete(`/chat-threads/${id}`);
  }

  // Buyers API
  async getBuyers(options = {}) {
    const params = this.buildParams(options);
    return this.get('/buyers/', params);
  }

  async getBuyer(id) {
    return this.get(`/buyers/${id}`);
  }

  // Health Check API
  async checkHealth() {
    return this.get('/health');
  }

  // Dashboard Statistics API for Seller
  async getSellerDashboardStats(sellerId) {
    try {
      const [products, chatMessages] = await Promise.all([
        this.getProducts({ limit: 1, filters: { seller_id: sellerId } }),
        this.getChatMessages({ limit: 1, filters: { sender_id: sellerId } }),
      ]);

      return {
        products: products.pagination?.total || 0,
        messages: chatMessages.pagination?.total || 0,
        orders: 0, // No orders API available
        revenue: 0, // No revenue API available
      };
    } catch (error) {
      console.error('Error fetching seller dashboard stats:', error);
      return {
        products: 0,
        messages: 0,
        orders: 0,
        revenue: 0,
      };
    }
  }
}

export default new ApiService();