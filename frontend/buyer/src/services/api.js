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

// Enhanced cache for preventing excessive API calls
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const requestCache = new Map(); // Cache for identical requests
const REQUEST_DEBOUNCE_TIME = 500; // 500ms debounce

// Debounce function to prevent rapid successive calls
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

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

  // Products browsing with caching
  async getProducts(page = 0, size = 12) {
    const cacheKey = `products_${page}_${size}`;
    const now = Date.now();

    // Check cache first
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (now - cached.timestamp < CACHE_DURATION) {
        console.log('Returning cached products for page', page);
        return cached.data;
      }
    }

    // Check if identical request is already in progress
    if (requestCache.has(cacheKey)) {
      console.log('Request already in progress, waiting for result...');
      return requestCache.get(cacheKey);
    }

    // Make the request
    const requestPromise = (async () => {
      try {
        const response = await api.get(`/api/v1/products?offset=${page * size}&limit=${size}`);
        const result = {
          data: response.data.data || response.data,
          total: response.data.pagination?.total || 0,
          offset: page * size,
          limit: size
        };

        // Cache the result
        cache.set(cacheKey, { data: result, timestamp: now });
        console.log('Cached products for page', page);

        return result;
      } finally {
        // Remove from request cache when done
        requestCache.delete(cacheKey);
      }
    })();

    // Store the promise to prevent duplicate requests
    requestCache.set(cacheKey, requestPromise);

    return requestPromise;
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

  // Get all wood types (fetch all pages)
  async getAllWoodTypes() {
    try {
      const firstPage = await this.getWoodTypes(0, 20);
      const total = firstPage.total;
      let allWoodTypes = [...firstPage.data];

      // If there are more wood types, fetch them
      if (total > 20) {
        const remainingPages = Math.ceil((total - 20) / 20);
        const promises = [];

        for (let page = 1; page <= remainingPages; page++) {
          promises.push(this.getWoodTypes(page, 20));
        }

        const additionalPages = await Promise.all(promises);
        additionalPages.forEach(pageData => {
          allWoodTypes = allWoodTypes.concat(pageData.data);
        });
      }

      return {
        data: allWoodTypes,
        total: total,
        offset: 0,
        limit: allWoodTypes.length
      };
    } catch (error) {
      console.error('Failed to fetch all wood types:', error);
      throw error;
    }
  },

  // Get all sellers (fetch all pages)
  async getAllSellers() {
    try {
      const firstPage = await this.getSellers(0, 20);
      const total = firstPage.total;
      let allSellers = [...firstPage.data];

      // If there are more sellers, fetch them
      if (total > 20) {
        const remainingPages = Math.ceil((total - 20) / 20);
        const promises = [];

        for (let page = 1; page <= remainingPages; page++) {
          promises.push(this.getSellers(page, 20));
        }

        const additionalPages = await Promise.all(promises);
        additionalPages.forEach(pageData => {
          allSellers = allSellers.concat(pageData.data);
        });
      }

      return {
        data: allSellers,
        total: total,
        offset: 0,
        limit: allSellers.length
      };
    } catch (error) {
      console.error('Failed to fetch all sellers:', error);
      throw error;
    }
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

  // Images
  async getImages(page = 0, size = 20) {
    const response = await api.get(`/api/v1/images?offset=${page * size}&limit=${size}`);
    return {
      data: response.data.data || response.data,
      total: response.data.pagination?.total || 0,
      offset: page * size,
      limit: size
    };
  },

  async getImage(id) {
    const response = await api.get(`/api/v1/images/${id}`);
    return response.data;
  },

  // Get all images for caching and filtering
  async getAllImages() {
    const cacheKey = 'all_images';
    const now = Date.now();

    // Check cache first
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (now - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }
    }

    // Fetch all images (backend limit is 20 per request)
    let allImages = [];
    let page = 0;
    let hasMore = true;

    while (hasMore) {
      const response = await this.getImages(page, 20);
      allImages = [...allImages, ...response.data];
      hasMore = response.data.length === 20;
      page++;
    }

    // Cache the result
    cache.set(cacheKey, { data: allImages, timestamp: now });
    return allImages;
  },

  // Get images for specific product
  async getProductImages(productId) {
    const allImages = await this.getAllImages();
    return allImages.filter(image => image.product_id === productId);
  },

  // Get image file URL
  getImageFileUrl(imageId) {
    const baseUrl = (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/\/+$/, '');
    return `${baseUrl}/api/v1/images/${imageId}/file`;
  },

  // Get image metadata
  async getImageMetadata(imageId) {
    try {
      const response = await api.get(`/api/v1/images/${imageId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get image metadata:', error);
      throw error;
    }
  },

  // Upload image file
  async uploadImage(productId, imageFile) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await api.post(`/api/v1/images/upload?product_id=${productId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Failed to upload image:', error);
      throw error;
    }
  },

  // Delete image (removes both DB record and file)
  async deleteImage(imageId) {
    try {
      const response = await api.delete(`/api/v1/images/${imageId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete image:', error);
      throw error;
    }
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
