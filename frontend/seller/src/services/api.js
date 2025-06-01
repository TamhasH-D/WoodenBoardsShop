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

// Simple cache for client-side filtering performance
const cache = new Map();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

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

  // Seller profile management with automatic creation
  async getSellerProfile(sellerId) {
    try {
      const response = await api.get(`/api/v1/sellers/${sellerId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404 || error.response?.status === 422 || error.response?.status === 500) {
        // Seller doesn't exist, try to create it
        console.warn(`Seller ${sellerId} not found (${error.response?.status}), attempting to create...`);
        try {
          const newSeller = await this.createSeller({
            id: sellerId,
            keycloak_uuid: 'mock-keycloak-uuid-' + sellerId.substring(0, 8),
            is_online: true
          });
          console.log('Seller created successfully:', newSeller);
          return newSeller;
        } catch (createError) {
          console.warn('Failed to create seller, using mock data:', createError);
          // Return mock data as fallback
          return {
            id: sellerId,
            keycloak_uuid: 'mock-keycloak-uuid-' + sellerId.substring(0, 8),
            is_online: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }
      }
      throw error;
    }
  },

  async createSeller(sellerData) {
    try {
      const response = await api.post('/api/v1/sellers', sellerData);
      return response.data;
    } catch (error) {
      console.error('Failed to create seller:', error);
      throw error;
    }
  },

  async updateSellerProfile(sellerId, sellerData) {
    const response = await api.patch(`/api/v1/sellers/${sellerId}`, sellerData);
    return response.data;
  },

  // Products management
  async getSellerProducts(sellerId, page = 0, size = 10) {
    try {
      // First ensure the seller exists
      await this.ensureSellerExists(sellerId);

      // Backend doesn't support seller_id filtering, so we'll get all products and filter client-side
      const cacheKey = 'all_products';
      const now = Date.now();

      // Check cache first
      let allProducts;
      if (cache.has(cacheKey) && (now - cache.get(cacheKey).timestamp) < CACHE_DURATION) {
        allProducts = cache.get(cacheKey).data;
      } else {
        const response = await api.get(`/api/v1/products?offset=0&limit=1000`);
        allProducts = response.data.data || response.data;
        cache.set(cacheKey, { data: allProducts, timestamp: now });
      }

      // Filter products by seller_id client-side
      const sellerProducts = allProducts.filter(product => product.seller_id === sellerId);

      // Implement client-side pagination
      const startIndex = page * size;
      const endIndex = startIndex + size;
      const paginatedData = sellerProducts.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        total: sellerProducts.length,
        offset: startIndex,
        limit: size
      };
    } catch (error) {
      console.error('Failed to get seller products:', error);
      // Return empty result on error
      return {
        data: [],
        total: 0,
        offset: page * size,
        limit: size
      };
    }
  },

  // Helper method to ensure seller exists before making seller-specific API calls
  async ensureSellerExists(sellerId) {
    try {
      await api.get(`/api/v1/sellers/${sellerId}`);
    } catch (error) {
      if (error.response?.status === 404 || error.response?.status === 422) {
        console.log(`Seller ${sellerId} doesn't exist, creating...`);
        await this.createSeller({
          id: sellerId,
          keycloak_uuid: 'mock-keycloak-uuid-' + sellerId.substring(0, 8),
          is_online: true
        });
      }
    }
  },

  async createProduct(productData) {
    try {
      // Ensure seller exists before creating product
      if (productData.seller_id) {
        await this.ensureSellerExists(productData.seller_id);
      }

      const response = await api.post('/api/v1/products', productData);

      // Clear products cache to force refresh
      cache.delete('all_products');

      return response.data;
    } catch (error) {
      console.error('Failed to create product:', error);
      throw error;
    }
  },

  async updateProduct(productId, productData) {
    const response = await api.patch(`/api/v1/products/${productId}`, productData);
    return response.data;
  },

  async deleteProduct(productId) {
    const response = await api.delete(`/api/v1/products/${productId}`);
    return response.data;
  },

  // Wood types management
  async getWoodTypes(page = 0, size = 20) {
    const response = await api.get(`/api/v1/wood-types?offset=${page * size}&limit=${size}`);
    // Backend returns OffsetResults structure: { data: [...], pagination: { total: number } }
    return {
      data: response.data.data || response.data,
      total: response.data.pagination?.total || 0,
      offset: page * size,
      limit: size
    };
  },

  async getWoodType(woodTypeId) {
    const response = await api.get(`/api/v1/wood-types/${woodTypeId}`);
    return response.data;
  },

  async createWoodType(woodTypeData) {
    const response = await api.post('/api/v1/wood-types', woodTypeData);
    return response.data;
  },

  async updateWoodType(woodTypeId, woodTypeData) {
    const response = await api.patch(`/api/v1/wood-types/${woodTypeId}`, woodTypeData);
    return response.data;
  },

  async deleteWoodType(woodTypeId) {
    const response = await api.delete(`/api/v1/wood-types/${woodTypeId}`);
    return response.data;
  },

  // Wood type prices management
  async getWoodTypePrices(page = 0, size = 20) {
    const response = await api.get(`/api/v1/wood-type-prices?offset=${page * size}&limit=${size}`);
    // Backend returns OffsetResults structure: { data: [...], pagination: { total: number } }
    return {
      data: response.data.data || response.data,
      total: response.data.pagination?.total || 0,
      offset: page * size,
      limit: size
    };
  },

  async getWoodTypePrice(priceId) {
    const response = await api.get(`/api/v1/wood-type-prices/${priceId}`);
    return response.data;
  },

  async createWoodTypePrice(priceData) {
    const response = await api.post('/api/v1/wood-type-prices', priceData);
    return response.data;
  },

  async updateWoodTypePrice(priceId, priceData) {
    const response = await api.patch(`/api/v1/wood-type-prices/${priceId}`, priceData);
    return response.data;
  },

  async deleteWoodTypePrice(priceId) {
    const response = await api.delete(`/api/v1/wood-type-prices/${priceId}`);
    return response.data;
  },

  // Chat management
  async getSellerChats(sellerId, page = 0, size = 10) {
    try {
      // First ensure the seller exists
      await this.ensureSellerExists(sellerId);

      // Backend doesn't support seller_id filtering, so we'll get all threads and filter client-side
      const response = await api.get(`/api/v1/chat-threads?offset=0&limit=1000`);
      const allThreads = response.data.data || response.data;

      // Filter threads by seller_id client-side
      const sellerThreads = allThreads.filter(thread => thread.seller_id === sellerId);

      // Implement client-side pagination
      const startIndex = page * size;
      const endIndex = startIndex + size;
      const paginatedData = sellerThreads.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        total: sellerThreads.length,
        offset: startIndex,
        limit: size
      };
    } catch (error) {
      console.error('Failed to get seller chats:', error);
      // Return empty result on error
      return {
        data: [],
        total: 0,
        offset: page * size,
        limit: size
      };
    }
  },

  async getChatMessages(threadId, page = 0, size = 20) {
    try {
      // Backend doesn't support thread_id filtering, so we'll get all messages and filter client-side
      const response = await api.get(`/api/v1/chat-messages?offset=0&limit=1000`);
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
    } catch (error) {
      console.error('Failed to get chat messages:', error);
      // Return empty result on error
      return {
        data: [],
        total: 0,
        offset: page * size,
        limit: size
      };
    }
  },

  async sendMessage(messageData) {
    try {
      // Ensure seller exists before creating message
      if (messageData.seller_id) {
        await this.ensureSellerExists(messageData.seller_id);
      }

      const response = await api.post('/api/v1/chat-messages', messageData);
      return response.data;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  },

  async createChatThread(threadData) {
    const response = await api.post('/api/v1/chat-threads', threadData);
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
