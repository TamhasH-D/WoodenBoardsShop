import axios from 'axios';
import { API_CONFIG, ERROR_MESSAGES, LOADING_STATES } from '../utils/constants';

// Get API URL from environment variables or use default
const API_BASE_URL = (process.env.REACT_APP_API_URL || API_CONFIG.baseURL).replace(/\/+$/, '');

// Create axios instance with enhanced configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request cache for GET requests
const requestCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Request interceptor with enhanced logging and caching
api.interceptors.request.use(
  (config) => {
    // Add timestamp for debugging
    config.metadata = { startTime: new Date() };

    // Add request ID for tracking
    config.requestId = Math.random().toString(36).substr(2, 9);

    console.log(`[${config.requestId}] API Request: ${config.method?.toUpperCase()} ${config.url}`);

    // Check cache for GET requests
    if (config.method === 'get' && config.cache !== false) {
      const cacheKey = `${config.url}?${JSON.stringify(config.params)}`;
      const cached = requestCache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log(`[${config.requestId}] Using cached response`);
        config.cached = cached.data;
      }
    }

    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with enhanced error handling and caching
api.interceptors.response.use(
  (response) => {
    const { config } = response;
    const duration = new Date() - config.metadata.startTime;

    console.log(`[${config.requestId}] API Response: ${response.status} ${config.url} (${duration}ms)`);

    // Cache GET responses
    if (config.method === 'get' && config.cache !== false) {
      const cacheKey = `${config.url}?${JSON.stringify(config.params)}`;
      requestCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
    }

    return response;
  },
  (error) => {
    const { config } = error;
    const duration = config?.metadata ? new Date() - config.metadata.startTime : 0;

    console.error(`[${config?.requestId}] API Error: ${error.response?.status || 'Network'} ${config?.url} (${duration}ms)`, error.response?.data);

    // Enhanced error handling with user-friendly messages
    let userMessage = ERROR_MESSAGES.UNKNOWN_ERROR;

    if (error.code === 'ECONNABORTED') {
      userMessage = ERROR_MESSAGES.TIMEOUT;
    } else if (error.code === 'ERR_NETWORK') {
      userMessage = ERROR_MESSAGES.NETWORK_ERROR;
    } else if (error.response) {
      switch (error.response.status) {
        case 400:
          userMessage = ERROR_MESSAGES.VALIDATION_ERROR;
          break;
        case 401:
          userMessage = ERROR_MESSAGES.UNAUTHORIZED;
          break;
        case 404:
          userMessage = ERROR_MESSAGES.NOT_FOUND;
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          userMessage = ERROR_MESSAGES.SERVER_ERROR;
          break;
        default:
          userMessage = error.response.data?.message || ERROR_MESSAGES.UNKNOWN_ERROR;
      }
    }

    // Attach user-friendly message to error
    error.userMessage = userMessage;
    error.statusCode = error.response?.status;

    return Promise.reject(error);
  }
);

// Retry mechanism for failed requests
const retryRequest = async (config, retryCount = 0) => {
  try {
    return await api(config);
  } catch (error) {
    if (retryCount < API_CONFIG.retryAttempts &&
        (error.code === 'ERR_NETWORK' || error.response?.status >= 500)) {
      console.log(`Retrying request (${retryCount + 1}/${API_CONFIG.retryAttempts}): ${config.url}`);
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay * (retryCount + 1)));
      return retryRequest(config, retryCount + 1);
    }
    throw error;
  }
};

// Clear cache utility
export const clearApiCache = () => {
  requestCache.clear();
  console.log('API cache cleared');
};

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

  async getWoodType(id) {
    const response = await api.get(`/api/v1/wood-types/${id}`);
    return response.data;
  },

  async createWoodType(woodTypeData) {
    const response = await api.post('/api/v1/wood-types', woodTypeData);
    return response.data;
  },

  async updateWoodType(id, woodTypeData) {
    const response = await api.put(`/api/v1/wood-types/${id}`, woodTypeData);
    return response.data;
  },

  async deleteWoodType(id) {
    const response = await api.delete(`/api/v1/wood-types/${id}`);
    return response.data;
  },

  // Wood Type Prices
  async getWoodTypePrices(page = 0, size = 20) {
    const response = await api.get(`/api/v1/wood-type-prices?offset=${page * size}&limit=${size}`);
    return response.data;
  },

  async getWoodTypePrice(id) {
    const response = await api.get(`/api/v1/wood-type-prices/${id}`);
    return response.data;
  },

  async createWoodTypePrice(priceData) {
    const response = await api.post('/api/v1/wood-type-prices', priceData);
    return response.data;
  },

  async updateWoodTypePrice(id, priceData) {
    const response = await api.put(`/api/v1/wood-type-prices/${id}`, priceData);
    return response.data;
  },

  async deleteWoodTypePrice(id) {
    const response = await api.delete(`/api/v1/wood-type-prices/${id}`);
    return response.data;
  },

  // Wooden Boards
  async getWoodenBoards(page = 0, size = 20) {
    const response = await api.get(`/api/v1/wooden-boards?offset=${page * size}&limit=${size}`);
    return response.data;
  },

  async getWoodenBoard(id) {
    const response = await api.get(`/api/v1/wooden-boards/${id}`);
    return response.data;
  },

  async createWoodenBoard(boardData) {
    const response = await api.post('/api/v1/wooden-boards', boardData);
    return response.data;
  },

  async updateWoodenBoard(id, boardData) {
    const response = await api.put(`/api/v1/wooden-boards/${id}`, boardData);
    return response.data;
  },

  async deleteWoodenBoard(id) {
    const response = await api.delete(`/api/v1/wooden-boards/${id}`);
    return response.data;
  },

  // Images
  async getImages(page = 0, size = 20) {
    const response = await api.get(`/api/v1/images?offset=${page * size}&limit=${size}`);
    return response.data;
  },

  async getImage(id) {
    const response = await api.get(`/api/v1/images/${id}`);
    return response.data;
  },

  async createImage(imageData) {
    const response = await api.post('/api/v1/images', imageData);
    return response.data;
  },

  async updateImage(id, imageData) {
    const response = await api.put(`/api/v1/images/${id}`, imageData);
    return response.data;
  },

  async deleteImage(id) {
    const response = await api.delete(`/api/v1/images/${id}`);
    return response.data;
  },

  // Chat Threads
  async getChatThreads(page = 0, size = 10) {
    const response = await api.get(`/api/v1/chat-threads?offset=${page * size}&limit=${size}`);
    return response.data;
  },

  async getChatThread(id) {
    const response = await api.get(`/api/v1/chat-threads/${id}`);
    return response.data;
  },

  async createChatThread(threadData) {
    const response = await api.post('/api/v1/chat-threads', threadData);
    return response.data;
  },

  async updateChatThread(id, threadData) {
    const response = await api.put(`/api/v1/chat-threads/${id}`, threadData);
    return response.data;
  },

  async deleteChatThread(id) {
    const response = await api.delete(`/api/v1/chat-threads/${id}`);
    return response.data;
  },

  // Chat Messages
  async getChatMessages(page = 0, size = 10) {
    const response = await api.get(`/api/v1/chat-messages?offset=${page * size}&limit=${size}`);
    return response.data;
  },

  async getChatMessage(id) {
    const response = await api.get(`/api/v1/chat-messages/${id}`);
    return response.data;
  },

  async createChatMessage(messageData) {
    const response = await api.post('/api/v1/chat-messages', messageData);
    return response.data;
  },

  async updateChatMessage(id, messageData) {
    const response = await api.put(`/api/v1/chat-messages/${id}`, messageData);
    return response.data;
  },

  async deleteChatMessage(id) {
    const response = await api.delete(`/api/v1/chat-messages/${id}`);
    return response.data;
  },

  // Bulk operations
  async bulkDeleteBuyers(ids) {
    const promises = ids.map(id => this.deleteBuyer(id));
    return Promise.all(promises);
  },

  async bulkDeleteSellers(ids) {
    const promises = ids.map(id => this.deleteSeller(id));
    return Promise.all(promises);
  },

  async bulkDeleteProducts(ids) {
    const promises = ids.map(id => this.deleteProduct(id));
    return Promise.all(promises);
  },

  async bulkDeleteWoodTypes(ids) {
    const promises = ids.map(id => this.deleteWoodType(id));
    return Promise.all(promises);
  },

  async bulkDeleteWoodTypePrices(ids) {
    const promises = ids.map(id => this.deleteWoodTypePrice(id));
    return Promise.all(promises);
  },

  async bulkDeleteWoodenBoards(ids) {
    const promises = ids.map(id => this.deleteWoodenBoard(id));
    return Promise.all(promises);
  },

  async bulkDeleteImages(ids) {
    const promises = ids.map(id => this.deleteImage(id));
    return Promise.all(promises);
  },

  async bulkDeleteChatThreads(ids) {
    const promises = ids.map(id => this.deleteChatThread(id));
    return Promise.all(promises);
  },

  async bulkDeleteChatMessages(ids) {
    const promises = ids.map(id => this.deleteChatMessage(id));
    return Promise.all(promises);
  },

  // System analytics and stats
  async getSystemStats() {
    try {
      const analytics = await this.getSystemAnalytics();

      // Calculate statistics from the analytics data
      const stats = {
        buyers: {
          total: analytics.buyers.length,
          online: analytics.buyers.filter(b => b.is_online).length
        },
        sellers: {
          total: analytics.sellers.length,
          online: analytics.sellers.filter(s => s.is_online).length
        },
        products: {
          total: analytics.products.length,
          totalVolume: analytics.products.reduce((sum, p) => sum + (p.volume || 0), 0),
          totalValue: analytics.products.reduce((sum, p) => sum + (p.price || 0), 0)
        },
        woodTypes: {
          total: analytics.woodTypes.length
        },
        prices: {
          total: analytics.prices.length,
          avgPrice: analytics.prices.length > 0
            ? analytics.prices.reduce((sum, p) => sum + (p.price_per_m3 || 0), 0) / analytics.prices.length
            : 0
        },
        boards: {
          total: analytics.boards.length
        },
        images: {
          total: analytics.images.length
        },
        communication: {
          threads: analytics.threads.length,
          messages: analytics.messages.length
        }
      };

      return stats;
    } catch (error) {
      console.error('Failed to get system stats:', error);
      // Return default stats if analytics fails
      return {
        buyers: { total: 0, online: 0 },
        sellers: { total: 0, online: 0 },
        products: { total: 0, totalVolume: 0, totalValue: 0 },
        woodTypes: { total: 0 },
        prices: { total: 0, avgPrice: 0 },
        boards: { total: 0 },
        images: { total: 0 },
        communication: { threads: 0, messages: 0 }
      };
    }
  },

  async getSystemAnalytics() {
    try {
      const [buyers, sellers, products, woodTypes, prices, boards, images, threads, messages] = await Promise.all([
        this.getBuyers(0, 1000),
        this.getSellers(0, 1000),
        this.getProducts(0, 1000),
        this.getWoodTypes(0, 1000),
        this.getWoodTypePrices(0, 1000),
        this.getWoodenBoards(0, 1000),
        this.getImages(0, 1000),
        this.getChatThreads(0, 1000),
        this.getChatMessages(0, 1000)
      ]);

      return {
        buyers: buyers.data || [],
        sellers: sellers.data || [],
        products: products.data || [],
        woodTypes: woodTypes.data || [],
        prices: prices.data || [],
        boards: boards.data || [],
        images: images.data || [],
        threads: threads.data || [],
        messages: messages.data || []
      };
    } catch (error) {
      console.error('Failed to fetch system analytics:', error);
      return {
        buyers: [],
        sellers: [],
        products: [],
        woodTypes: [],
        prices: [],
        boards: [],
        images: [],
        threads: [],
        messages: []
      };
    }
  },

  // Data export functionality
  async exportData(entityType, format = 'json') {
    let data;

    switch (entityType) {
      case 'buyers':
        data = await this.getBuyers(0, 1000);
        break;
      case 'sellers':
        data = await this.getSellers(0, 1000);
        break;
      case 'products':
        data = await this.getProducts(0, 1000);
        break;
      case 'woodTypes':
        data = await this.getWoodTypes(0, 1000);
        break;
      case 'prices':
        data = await this.getWoodTypePrices(0, 1000);
        break;
      case 'boards':
        data = await this.getWoodenBoards(0, 1000);
        break;
      case 'images':
        data = await this.getImages(0, 1000);
        break;
      case 'threads':
        data = await this.getChatThreads(0, 1000);
        break;
      case 'messages':
        data = await this.getChatMessages(0, 1000);
        break;
      default:
        throw new Error(`Unknown entity type: ${entityType}`);
    }

    if (format === 'csv') {
      return this.convertToCSV(data.data || []);
    }

    return data;
  },

  // Convert data to CSV format
  convertToCSV(data) {
    if (!data || data.length === 0) {
      return '';
    }

    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');

    const csvRows = data.map(row => {
      return headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',');
    });

    return [csvHeaders, ...csvRows].join('\n');
  },
};

export default api;
