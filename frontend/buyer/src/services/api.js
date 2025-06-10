import axios from 'axios';
import { withUUID, ENTITY_TYPES } from '../utils/uuid';

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

// Simple cache for client-side filtering performance
const cache = new Map();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

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
    // Backend returns OffsetResults structure: { data: [...], pagination: { total: number } }
    return {
      data: response.data.data || response.data,
      total: response.data.pagination?.total || 0,
      offset: page * size,
      limit: size
    };
  },

  async getProduct(productId) {
    const response = await api.get(`/api/v1/products/${productId}`);
    return response.data;
  },

  async searchProducts(query, page = 0, size = 12) {
    // Backend doesn't support search, so we'll get all products and filter client-side
    const cacheKey = 'all_products';
    const now = Date.now();

    // Check cache first
    let allProducts;
    if (cache.has(cacheKey) && (now - cache.get(cacheKey).timestamp) < CACHE_DURATION) {
      allProducts = cache.get(cacheKey).data;
    } else {
      const response = await this.getProducts(0, 1000); // Get more products for search
      allProducts = response.data;
      cache.set(cacheKey, { data: allProducts, timestamp: now });
    }

    const filteredData = allProducts.filter(product =>
      product.title?.toLowerCase().includes(query.toLowerCase()) ||
      product.descrioption?.toLowerCase().includes(query.toLowerCase())
    );

    // Implement client-side pagination
    const startIndex = page * size;
    const endIndex = startIndex + size;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      total: filteredData.length,
      offset: startIndex,
      limit: size
    };
  },

  // Wood types and prices (for buyers to view)
  async getWoodTypes(page = 0, size = 20) {
    // Ensure size doesn't exceed backend limit of 20
    const actualSize = Math.min(size, 20);
    const response = await api.get(`/api/v1/wood-types?offset=${page * actualSize}&limit=${actualSize}`);
    // Backend returns OffsetResults structure: { data: [...], pagination: { total: number } }
    return {
      data: response.data.data || response.data,
      total: response.data.pagination?.total || 0,
      offset: page * actualSize,
      limit: actualSize
    };
  },

  async getWoodTypePrices(page = 0, size = 20) {
    // Ensure size doesn't exceed backend limit of 20
    const actualSize = Math.min(size, 20);
    const response = await api.get(`/api/v1/wood-type-prices?offset=${page * actualSize}&limit=${actualSize}`);
    // Backend returns OffsetResults structure: { data: [...], pagination: { total: number } }
    return {
      data: response.data.data || response.data,
      total: response.data.pagination?.total || 0,
      offset: page * actualSize,
      limit: actualSize
    };
  },

  // Buyer profile management with automatic creation
  async getBuyerProfile(buyerId) {
    try {
      const response = await api.get(`/api/v1/buyers/${buyerId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404 || error.response?.status === 422 || error.response?.status === 500) {
        // Buyer doesn't exist, try to create it
        console.warn(`Buyer ${buyerId} not found (${error.response?.status}), attempting to create...`);
        try {
          const newBuyer = await this.createBuyer({
            id: buyerId,
            keycloak_uuid: 'mock-keycloak-uuid-' + buyerId.substring(0, 8),
            is_online: true
          });
          console.log('Buyer created successfully:', newBuyer);
          return newBuyer;
        } catch (createError) {
          console.warn('Failed to create buyer, using mock data:', createError);
          // Return mock data as fallback
          return {
            id: buyerId,
            keycloak_uuid: 'mock-keycloak-uuid-' + buyerId.substring(0, 8),
            is_online: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }
      }
      throw error;
    }
  },

  async updateBuyerProfile(buyerId, buyerData) {
    try {
      // Ensure buyer exists before updating
      await this.ensureBuyerExists(buyerId);
      const response = await api.patch(`/api/v1/buyers/${buyerId}`, buyerData);
      return response.data;
    } catch (error) {
      console.error('Failed to update buyer profile:', error);
      throw error;
    }
  },

  async createBuyer(buyerData) {
    try {
      // Генерируем UUID если не передан
      const payload = buyerData.id ? buyerData : withUUID(buyerData, ENTITY_TYPES.BUYER);
      const response = await api.post('/api/v1/buyers', payload);
      return response.data;
    } catch (error) {
      console.error('Failed to create buyer:', error);
      throw error;
    }
  },

  // Helper method to ensure buyer exists before making buyer-specific API calls
  async ensureBuyerExists(buyerId) {
    try {
      await api.get(`/api/v1/buyers/${buyerId}`);
    } catch (error) {
      if (error.response?.status === 404 || error.response?.status === 422) {
        console.log(`Buyer ${buyerId} doesn't exist, creating...`);
        await this.createBuyer({
          id: buyerId,
          keycloak_uuid: 'mock-keycloak-uuid-' + buyerId.substring(0, 8),
          is_online: true
        });
      }
    }
  },

  // Chat functionality
  async getBuyerChats(buyerId, page = 0, size = 10) {
    try {
      // First ensure the buyer exists
      await this.ensureBuyerExists(buyerId);

      // Backend doesn't support buyer_id filtering, so we'll get all threads and filter client-side
      const response = await api.get(`/api/v1/chat-threads?offset=0&limit=20`);
      const allThreads = response.data.data || response.data;

      // Filter threads by buyer_id client-side
      const buyerThreads = allThreads.filter(thread => thread.buyer_id === buyerId);

      // Implement client-side pagination
      const startIndex = page * size;
      const endIndex = startIndex + size;
      const paginatedData = buyerThreads.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        total: buyerThreads.length,
        offset: startIndex,
        limit: size
      };
    } catch (error) {
      console.error('Failed to get buyer chats:', error);
      // Return empty result on error
      return {
        data: [],
        total: 0,
        offset: page * size,
        limit: size
      };
    }
  },

  async createChatThread(threadData) {
    // Генерируем UUID если не передан
    const payload = threadData.id ? threadData : withUUID(threadData, ENTITY_TYPES.CHAT_THREAD);
    const response = await api.post('/api/v1/chat-threads', payload);
    return response.data;
  },

  async getChatMessages(threadId, page = 0, size = 20) {
    // Backend doesn't support thread_id filtering, so we'll get all messages and filter client-side
    const response = await api.get(`/api/v1/chat-messages?offset=0&limit=20`);
    const allMessages = response.data.data || response.data;

    // Filter messages by thread_id client-side
    const threadMessages = allMessages.filter(message => message.thread_id === threadId);

    // Sort by created_at (newest first)
    threadMessages.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Implement client-side pagination
    const startIndex = page * size;
    const endIndex = startIndex + size;
    const paginatedData = threadMessages.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      total: threadMessages.length,
      offset: startIndex,
      limit: size
    };
  },

  async sendMessage(messageData) {
    try {
      // Ensure buyer exists before creating message
      if (messageData.buyer_id) {
        await this.ensureBuyerExists(messageData.buyer_id);
      }

      // Генерируем UUID если не передан
      const payload = messageData.id ? messageData : withUUID(messageData, ENTITY_TYPES.CHAT_MESSAGE);
      const response = await api.post('/api/v1/chat-messages', payload);
      return response.data;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  },

  // Seller information
  async getSeller(sellerId) {
    const response = await api.get(`/api/v1/sellers/${sellerId}`);
    return response.data;
  },

  async getSellers(page = 0, size = 10) {
    const response = await api.get(`/api/v1/sellers?offset=${page * size}&limit=${size}`);
    // Backend returns OffsetResults structure: { data: [...], pagination: { total: number } }
    return {
      data: response.data.data || response.data,
      total: response.data.pagination?.total || 0,
      offset: page * size,
      limit: size
    };
  },

  // Individual entity getters for consistency
  async getBuyer(id) {
    const response = await api.get(`/api/v1/buyers/${id}`);
    return response.data;
  },

  async getWoodType(id) {
    const response = await api.get(`/api/v1/wood-types/${id}`);
    return response.data;
  },

  async getWoodTypePrice(id) {
    const response = await api.get(`/api/v1/wood-type-prices/${id}`);
    return response.data;
  },

  // Wooden board analysis (Prosto Board integration)
  async analyzeWoodenBoard(imageFile, boardHeight = 0.0, boardLength = 0.0) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      // Конвертируем метры в миллиметры для API
      const heightInMm = boardHeight * 1000;
      const lengthInMm = boardLength * 1000;

      console.log(`Buyer Board Analysis: Sending request to ${API_BASE_URL}/api/v1/wooden-boards/calculate-volume`);
      console.log(`Board dimensions: height=${heightInMm}mm, length=${lengthInMm}mm`);

      // Правильный формат запроса с query параметрами в миллиметрах
      const response = await api.post(
        `/api/v1/wooden-boards/calculate-volume?board_height=${heightInMm}&board_length=${lengthInMm}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Board analysis response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to analyze wooden board:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw new Error(`Board analysis failed: ${error.response?.data?.detail || error.message}`);
    }
  },
};

export default api;
