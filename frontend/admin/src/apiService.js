import config from './config.js';
import axios from 'axios';
import { toast } from 'react-toastify';

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
      toast.error('У вас нет прав для выполнения этого действия');
      return;
    }

    if (error.response?.status >= 500) {
      toast.error('Ошибка сервера. Попробуйте позже');
      return;
    }

    if (error.code === 'ECONNABORTED') {
      toast.error('Превышено время ожидания запроса');
      return;
    }

    if (!error.response) {
      toast.error('Ошибка сети. Проверьте подключение к интернету');
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
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', error.response.data);
      const message = error.response.data?.message ||
                     error.response.data?.detail ||
                     `HTTP ${error.response.status}: ${error.response.statusText}`;
      return new Error(message);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API Error Request:', error.request);
      return new Error('Нет ответа от сервера');
    } else {
      // Something happened in setting up the request that triggered an Error
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

  // Wood Types API
  async getWoodTypes(options = {}) {
    const params = this.buildParams(options);
    return this.get('/wood_types/', params);
  }

  async getWoodType(id) {
    return this.get(`/wood_types/${id}`);
  }

  async createWoodType(data) {
    return this.post('/wood_types/', data);
  }

  async updateWoodType(id, data) {
    return this.patch(`/wood_types/${id}`, data);
  }

  async deleteWoodType(id) {
    return this.delete(`/wood_types/${id}`);
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

  async createBuyer(data) {
    return this.post('/buyers/', data);
  }

  async updateBuyer(id, data) {
    return this.patch(`/buyers/${id}`, data);
  }

  async deleteBuyer(id) {
    return this.delete(`/buyers/${id}`);
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

  // Wooden Boards API
  async getWoodenBoards(options = {}) {
    const params = this.buildParams(options);
    return this.get('/wooden-boards/', params);
  }

  async getWoodenBoard(id) {
    return this.get(`/wooden-boards/${id}`);
  }

  async createWoodenBoard(data) {
    return this.post('/wooden-boards/', data);
  }

  async updateWoodenBoard(id, data) {
    return this.patch(`/wooden-boards/${id}`, data);
  }

  async deleteWoodenBoard(id) {
    return this.delete(`/wooden-boards/${id}`);
  }

  // Wood Type Prices API
  async getWoodTypePrices(options = {}) {
    const params = this.buildParams(options);
    return this.get('/wood-type-prices/', params);
  }

  async getWoodTypePrice(id) {
    return this.get(`/wood-type-prices/${id}`);
  }

  async createWoodTypePrice(data) {
    return this.post('/wood-type-prices/', data);
  }

  async updateWoodTypePrice(id, data) {
    return this.patch(`/wood-type-prices/${id}`, data);
  }

  async deleteWoodTypePrice(id) {
    return this.delete(`/wood-type-prices/${id}`);
  }

  // Images API
  async getImages(options = {}) {
    const params = this.buildParams(options);
    return this.get('/images/', params);
  }

  async getImage(id) {
    return this.get(`/images/${id}`);
  }

  async createImage(data) {
    return this.post('/images/', data);
  }

  async updateImage(id, data) {
    return this.patch(`/images/${id}`, data);
  }

  async deleteImage(id) {
    return this.delete(`/images/${id}`);
  }

  // Health Check API
  async checkHealth() {
    return this.get('/health');
  }

  // Dashboard Statistics API
  async getDashboardStats() {
    try {
      const [buyers, sellers, products, woodTypes] = await Promise.all([
        this.getBuyers({ limit: 1 }),
        this.getSellers({ limit: 1 }),
        this.getProducts({ limit: 1 }),
        this.getWoodTypes({ limit: 1 }),
      ]);

      return {
        buyers: buyers.pagination?.total || 0,
        sellers: sellers.pagination?.total || 0,
        products: products.pagination?.total || 0,
        woodTypes: woodTypes.pagination?.total || 0,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        buyers: 0,
        sellers: 0,
        products: 0,
        woodTypes: 0,
      };
    }
  }
}

export default new ApiService();
