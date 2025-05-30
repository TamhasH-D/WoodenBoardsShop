import axios from 'axios';

// Get API URL from environment variables or use default
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

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

// API service functions for sellers
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

  // Seller profile management
  async getSellerProfile(sellerId) {
    const response = await api.get(`/api/v1/sellers/${sellerId}`);
    return response.data;
  },

  async updateSellerProfile(sellerId, sellerData) {
    const response = await api.put(`/api/v1/sellers/${sellerId}`, sellerData);
    return response.data;
  },

  // Products management
  async getSellerProducts(sellerId, page = 0, size = 10) {
    const response = await api.get(`/api/v1/products?seller_id=${sellerId}&offset=${page * size}&limit=${size}`);
    return response.data;
  },

  async createProduct(productData) {
    const response = await api.post('/api/v1/products', productData);
    return response.data;
  },

  async updateProduct(productId, productData) {
    const response = await api.put(`/api/v1/products/${productId}`, productData);
    return response.data;
  },

  async deleteProduct(productId) {
    const response = await api.delete(`/api/v1/products/${productId}`);
    return response.data;
  },

  // Wood types
  async getWoodTypes() {
    const response = await api.get('/api/v1/wood-types');
    return response.data;
  },

  async getWoodTypePrices() {
    const response = await api.get('/api/v1/wood-type-prices');
    return response.data;
  },

  // Chat management
  async getSellerChats(sellerId, page = 0, size = 10) {
    const response = await api.get(`/api/v1/chat-threads?seller_id=${sellerId}&offset=${page * size}&limit=${size}`);
    return response.data;
  },

  async getChatMessages(threadId, page = 0, size = 20) {
    const response = await api.get(`/api/v1/chat-messages?thread_id=${threadId}&offset=${page * size}&limit=${size}`);
    return response.data;
  },

  async sendMessage(messageData) {
    const response = await api.post('/api/v1/chat-messages', messageData);
    return response.data;
  },

  // Analytics
  async getSellerStats(sellerId) {
    // This would be a custom endpoint for seller statistics
    try {
      const [products, chats] = await Promise.all([
        this.getSellerProducts(sellerId, 0, 1000),
        this.getSellerChats(sellerId, 0, 1000)
      ]);
      
      return {
        totalProducts: products.total || products.data?.length || 0,
        totalChats: chats.total || chats.data?.length || 0,
        totalVolume: products.data?.reduce((sum, product) => sum + (product.volume || 0), 0) || 0,
        totalValue: products.data?.reduce((sum, product) => sum + (product.price || 0), 0) || 0,
      };
    } catch (error) {
      console.error('Failed to get seller stats:', error);
      return {
        totalProducts: 0,
        totalChats: 0,
        totalVolume: 0,
        totalValue: 0,
      };
    }
  },
};

export default api;
