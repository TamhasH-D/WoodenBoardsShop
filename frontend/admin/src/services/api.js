import axios from 'axios';

// Get API URL from environment variables or use default
const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data);
    
    // Handle common error cases
    if (error.response?.status === 404) {
      console.warn('Resource not found');
    } else if (error.response?.status >= 500) {
      console.error('Server error occurred');
    } else if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
    } else if (error.code === 'ERR_NETWORK') {
      console.error('Network error - backend may be unavailable');
    }
    
    return Promise.reject(error);
  }
);

// API service functions
export const apiService = {
  // Health check
  async healthCheck() {
    try {
      const response = await api.get('/api/v1/health');
      return response.data;
    } catch (error) {
      throw new Error('Backend health check failed');
    }
  },

  // Buyers
  async getBuyers(page = 0, size = 10) {
    const response = await api.get(`/api/v1/buyers?offset=${page * size}&limit=${size}`);
    return response.data;
  },

  async createBuyer(buyerData) {
    const response = await api.post('/api/v1/buyers', buyerData);
    return response.data;
  },

  async getBuyer(id) {
    const response = await api.get(`/api/v1/buyers/${id}`);
    return response.data;
  },

  async updateBuyer(id, buyerData) {
    const response = await api.put(`/api/v1/buyers/${id}`, buyerData);
    return response.data;
  },

  async deleteBuyer(id) {
    const response = await api.delete(`/api/v1/buyers/${id}`);
    return response.data;
  },

  // Sellers
  async getSellers(page = 0, size = 10) {
    const response = await api.get(`/api/v1/sellers?offset=${page * size}&limit=${size}`);
    return response.data;
  },

  async createSeller(sellerData) {
    const response = await api.post('/api/v1/sellers', sellerData);
    return response.data;
  },

  async getSeller(id) {
    const response = await api.get(`/api/v1/sellers/${id}`);
    return response.data;
  },

  async updateSeller(id, sellerData) {
    const response = await api.put(`/api/v1/sellers/${id}`, sellerData);
    return response.data;
  },

  async deleteSeller(id) {
    const response = await api.delete(`/api/v1/sellers/${id}`);
    return response.data;
  },

  // Products
  async getProducts(page = 0, size = 10) {
    const response = await api.get(`/api/v1/products?offset=${page * size}&limit=${size}`);
    return response.data;
  },

  async createProduct(productData) {
    const response = await api.post('/api/v1/products', productData);
    return response.data;
  },

  async getProduct(id) {
    const response = await api.get(`/api/v1/products/${id}`);
    return response.data;
  },

  async updateProduct(id, productData) {
    const response = await api.put(`/api/v1/products/${id}`, productData);
    return response.data;
  },

  async deleteProduct(id) {
    const response = await api.delete(`/api/v1/products/${id}`);
    return response.data;
  },

  // Wood Types
  async getWoodTypes(page = 0, size = 20) {
    const response = await api.get(`/api/v1/wood-types?offset=${page * size}&limit=${size}`);
    return response.data;
  },

  // Wood Type Prices
  async getWoodTypePrices(page = 0, size = 20) {
    const response = await api.get(`/api/v1/wood-type-prices?offset=${page * size}&limit=${size}`);
    return response.data;
  },

  // Chat Threads
  async getChatThreads(page = 0, size = 10) {
    const response = await api.get(`/api/v1/chat-threads?offset=${page * size}&limit=${size}`);
    return response.data;
  },

  // Chat Messages
  async getChatMessages(page = 0, size = 10) {
    const response = await api.get(`/api/v1/chat-messages?offset=${page * size}&limit=${size}`);
    return response.data;
  },
};

export default api;
