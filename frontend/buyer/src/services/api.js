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

// API service functions for buyers
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

  // Products browsing
  async getProducts(page = 0, size = 12) {
    const response = await api.get(`/api/v1/products?offset=${page * size}&limit=${size}`);
    return response.data;
  },

  async getProduct(productId) {
    const response = await api.get(`/api/v1/products/${productId}`);
    return response.data;
  },

  async searchProducts(query, page = 0, size = 12) {
    const response = await api.get(`/api/v1/products?search=${encodeURIComponent(query)}&offset=${page * size}&limit=${size}`);
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

  // Buyer profile management
  async getBuyerProfile(buyerId) {
    const response = await api.get(`/api/v1/buyers/${buyerId}`);
    return response.data;
  },

  async updateBuyerProfile(buyerId, buyerData) {
    const response = await api.put(`/api/v1/buyers/${buyerId}`, buyerData);
    return response.data;
  },

  async createBuyer(buyerData) {
    const response = await api.post('/api/v1/buyers', buyerData);
    return response.data;
  },

  // Chat functionality
  async getBuyerChats(buyerId, page = 0, size = 10) {
    const response = await api.get(`/api/v1/chat-threads?buyer_id=${buyerId}&offset=${page * size}&limit=${size}`);
    return response.data;
  },

  async createChatThread(threadData) {
    const response = await api.post('/api/v1/chat-threads', threadData);
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

  // Seller information
  async getSeller(sellerId) {
    const response = await api.get(`/api/v1/sellers/${sellerId}`);
    return response.data;
  },

  async getSellers(page = 0, size = 10) {
    const response = await api.get(`/api/v1/sellers?offset=${page * size}&limit=${size}`);
    return response.data;
  },

  // Wooden board analysis (Prosto Board integration)
  async analyzeWoodenBoard(imageData) {
    try {
      // This would integrate with the Prosto Board detection service
      // For now, we'll return a mock response
      return {
        success: true,
        volume: Math.random() * 10 + 1, // Mock volume calculation
        confidence: 0.85,
        message: 'Board analysis completed'
      };
    } catch (error) {
      console.error('Failed to analyze wooden board:', error);
      throw new Error('Board analysis failed');
    }
  },
};

export default api;
