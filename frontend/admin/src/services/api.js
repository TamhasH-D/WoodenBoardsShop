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
