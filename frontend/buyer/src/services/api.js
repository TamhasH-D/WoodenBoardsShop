
import axios from 'axios';
import { withUUID, ENTITY_TYPES, generateEntityUUID } from '../utils/uuid';

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
    // Более детальная обработка ошибок
    const errorDetails = {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    };

    console.error('API Response Error:', errorDetails);

    // Handle common error cases
    if (error.response?.status === 401) {
      console.warn('Unauthorized - token may be expired or invalid');
      // В будущем здесь можно добавить логику обновления токена
    } else if (error.response?.status === 403) {
      console.warn('Forbidden - insufficient permissions');
    } else if (error.response?.status === 404) {
      console.warn('Resource not found');
    } else if (error.response?.status >= 500) {
      console.error('Server error occurred');
    } else if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
    } else if (error.code === 'ERR_NETWORK' || error.code === 'NETWORK_ERROR') {
      console.error('Network error - backend may be unavailable');
      console.error('Check if backend is running and API_URL is correct:', API_BASE_URL);
    } else if (error.message?.includes('ERR_SSL_PROTOCOL_ERROR')) {
      console.error('SSL Protocol Error - check HTTPS configuration');
      console.error('Consider using HTTP for local development');
    }

    return Promise.reject(error);
  }
);

// Enhanced cache for preventing excessive API calls
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const requestCache = new Map(); // Cache for identical requests
// Request debouncing configuration (unused but kept for future use)
// const REQUEST_DEBOUNCE_TIME = 500; // 500ms debounce

// Debounce function to prevent rapid successive calls (unused but kept for future use)
// const debounce = (func, wait) => {
//   let timeout;
//   return function executedFunction(...args) {
//     const later = () => {
//       clearTimeout(timeout);
//       func(...args);
//     };
//     clearTimeout(timeout);
//     timeout = setTimeout(later, wait);
//   };
// };

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
  async getProducts(page = 0, size = 20) {
    const cacheKey = `products_${page}_${size}`;
    const now = Date.now();

    // Check cache first
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (now - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }
    }

    // Check if identical request is already in progress
    if (requestCache.has(cacheKey)) {
      return requestCache.get(cacheKey);
    }

    // Make the request
    const requestPromise = (async () => {
      try {
        const response = await api.get(`/api/v1/products/?offset=${page * size}&limit=${size}`);
        const result = {
          data: response.data.data || response.data,
          total: response.data.pagination?.total || 0,
          offset: page * size,
          limit: size
        };

        // Cache the result
        cache.set(cacheKey, { data: result, timestamp: now });
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

  // Search products using backend search API
  async searchProducts(filters = {}, page = 0, size = 20) {
    const cacheKey = `search_${JSON.stringify(filters)}_${page}_${size}`;
    const now = Date.now();

    // Reduce cache duration for search to make filters more responsive
    const SEARCH_CACHE_DURATION = 30000; // 30 seconds instead of 5 minutes

    // Check cache first
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (now - cached.timestamp < SEARCH_CACHE_DURATION) {
        console.log('Returning cached search results');
        return cached.data;
      }
    }

    // Check if identical request is already in progress
    if (requestCache.has(cacheKey)) {
      console.log('Request already in progress, waiting...');
      return requestCache.get(cacheKey);
    }

    // Make the request
    const requestPromise = (async () => {
      try {
        // Build query parameters
        const params = new URLSearchParams({
          offset: (page * size).toString(),
          limit: size.toString()
        });

        // Add filter parameters
        if (filters.search_query && filters.search_query.trim() !== '') {
          params.append('search_query', filters.search_query.trim());
        }
        if (filters.price_min !== undefined && filters.price_min !== '' && filters.price_min !== null) {
          params.append('price_min', filters.price_min.toString());
        }
        if (filters.price_max !== undefined && filters.price_max !== '' && filters.price_max !== null) {
          params.append('price_max', filters.price_max.toString());
        }
        if (filters.volume_min !== undefined && filters.volume_min !== '' && filters.volume_min !== null) {
          params.append('volume_min', filters.volume_min.toString());
        }
        if (filters.volume_max !== undefined && filters.volume_max !== '' && filters.volume_max !== null) {
          params.append('volume_max', filters.volume_max.toString());
        }
        if (filters.wood_type_ids && filters.wood_type_ids.length > 0) {
          filters.wood_type_ids.forEach(id => params.append('wood_type_ids', id));
        }
        if (filters.seller_ids && filters.seller_ids.length > 0) {
          filters.seller_ids.forEach(id => params.append('seller_ids', id));
        }
        if (filters.delivery_possible !== undefined && filters.delivery_possible !== null) {
          params.append('delivery_possible', filters.delivery_possible.toString());
        }
        if (filters.has_pickup_location !== undefined && filters.has_pickup_location !== null) {
          params.append('has_pickup_location', filters.has_pickup_location.toString());
        }
        // Всегда добавляем параметры сортировки (с дефолтными значениями)
        params.append('sort_by', filters.sort_by || 'created_at');
        params.append('sort_order', filters.sort_order || 'desc');

        const url = `/api/v1/products/search?${params.toString()}`;
        console.log('Making API request to:', url);
        console.log('Filters object:', filters);

        const response = await api.get(url);
        const result = {
          data: response.data.data || response.data,
          total: response.data.pagination?.total || 0,
          offset: page * size,
          limit: size
        };

        // Cache the result
        cache.set(cacheKey, { data: result, timestamp: now });
        console.log('Search completed, cached result');
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

  // Clear search cache (useful when filters change)
  clearSearchCache() {
    const keysToDelete = [];
    for (const key of cache.keys()) {
      if (key.startsWith('search_')) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => cache.delete(key));
    console.log('Cleared search cache');
  },

  // Wood types and prices (for buyers to view)
  async getWoodTypes(page = 0, size = 20) {
    // Ensure size doesn't exceed backend limit of 20
    const actualSize = Math.min(size, 20);
    const response = await api.get(`/api/v1/wood-types/?offset=${page * actualSize}&limit=${actualSize}`);
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
    const response = await api.get(`/api/v1/wood-type-prices/?offset=${page * actualSize}&limit=${actualSize}`);
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
      const response = await api.post('/api/v1/buyers/', payload);
      return response.data;
    } catch (error) {
      console.error('Failed to create buyer:', error);
      throw error;
    }
  },

  // Buyer profile management by keycloak_id with automatic creation
  async getBuyerProfileByKeycloakId(keycloakId) {
    try {
      const response = await api.get(`/api/v1/buyers/by-keycloak/${keycloakId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        // Buyer doesn't exist, try to create it
        console.warn(`Buyer with keycloak_id ${keycloakId} not found, attempting to create...`);
        try {
          const newBuyer = await this.createBuyer({
            id: generateEntityUUID(ENTITY_TYPES.BUYER),
            keycloak_uuid: keycloakId,
            is_online: true
          });
          return newBuyer;
        } catch (createError) {
          console.error('Failed to create buyer:', createError);
          throw createError;
        }
      }
      console.error('Failed to get buyer profile by keycloak_id:', error);
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
        // For development/testing, allow creation with mock keycloak_uuid
        // In production, this should use real keycloak authentication
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

      // Use the dedicated backend endpoint for buyer chats
      const response = await api.get(`/api/v1/chat-threads/by-buyer/${buyerId}`);
      const threads = response.data.data || response.data || [];

      // Implement client-side pagination if needed
      const startIndex = page * size;
      const endIndex = startIndex + size;
      const paginatedData = threads.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        total: threads.length,
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

  // Get buyer chats by keycloak_id (gets buyer_id first)
  async getBuyerChatsByKeycloakId(keycloakId, page = 0, size = 10) {
    try {
      // First get buyer by keycloak_id to get the actual buyer_id
      const buyerResponse = await this.getBuyerProfileByKeycloakId(keycloakId);
      const buyerId = buyerResponse.data.id;

      // Then get chats using buyer_id
      return await this.getBuyerChats(buyerId, page, size);
    } catch (error) {
      console.error('Failed to get buyer chats by keycloak_id:', error);
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
    const response = await api.post('/api/v1/chat-threads/', payload);
    return response.data;
  },

  async startChatWithSeller(buyerId, sellerId) {
    try {
      const response = await api.post('/api/v1/chat-threads/start-with-seller', {
        buyer_id: buyerId,
        seller_id: sellerId
      });
      return response.data;
    } catch (error) {
      console.error('Failed to start chat with seller:', error);
      throw error;
    }
  },

  // Start chat with seller by keycloak_id (gets buyer_id first)
  async startChatWithSellerByKeycloakId(keycloakId, sellerId) {
    try {
      // First get buyer by keycloak_id to get the actual buyer_id
      const buyerResponse = await this.getBuyerProfileByKeycloakId(keycloakId);
      const buyerId = buyerResponse.data.id;

      // Then start chat using buyer_id
      return await this.startChatWithSeller(buyerId, sellerId);
    } catch (error) {
      console.error('Failed to start chat with seller by keycloak_id:', error);
      throw error;
    }
  },

  async getChatMessages(threadId, page = 0, size = 20) {
    try {
      // Use the dedicated backend endpoint for thread messages
      const response = await api.get(`/api/v1/chat-messages/by-thread/${threadId}?limit=${size}`);
      const messages = response.data.data || response.data || [];

      // Sort by created_at (oldest first for chat display)
      messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

      // Implement client-side pagination if needed
      const startIndex = page * size;
      const endIndex = startIndex + size;
      const paginatedData = messages.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        total: messages.length,
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
      console.log('[API] Sending message:', messageData);

      // Ensure buyer exists before creating message
      if (messageData.buyer_id) {
        await this.ensureBuyerExists(messageData.buyer_id);
      }

      // Генерируем UUID если не передан
      const payload = messageData.id ? messageData : withUUID(messageData, ENTITY_TYPES.CHAT_MESSAGE);

      console.log('[API] Message payload:', payload);

      const response = await api.post('/api/v1/chat-messages/', payload);

      console.log('[API] Message sent successfully:', response.data);

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('[API] Failed to send message:', error);

      // Более детальная информация об ошибке
      const errorInfo = {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      };

      console.error('[API] Error details:', errorInfo);

      return {
        success: false,
        error: errorInfo
      };
    }
  },

  async markMessagesAsRead(threadId, userId, userType) {
    try {
      const response = await api.patch(`/api/v1/chat-messages/${threadId}/mark-read?user_id=${userId}&user_type=${userType}`);
      return response.data;
    } catch (error) {
      console.error('Failed to mark messages as read:', error.response?.data || error.message);
      throw error;
    }
  },

  // Send message by keycloak_id (gets buyer_id first)
  async sendMessageByKeycloakId(keycloakId, messageData) {
    try {
      // First get buyer by keycloak_id to get the actual buyer_id
      const buyerResponse = await this.getBuyerProfileByKeycloakId(keycloakId);
      const buyerId = buyerResponse.data.id;

      // Then send message using buyer_id
      return await this.sendMessage({
        ...messageData,
        buyer_id: buyerId
      });
    } catch (error) {
      console.error('Failed to send message by keycloak_id:', error);
      throw error;
    }
  },

  // Seller information
  async getSeller(sellerId) {
    const response = await api.get(`/api/v1/sellers/${sellerId}`);
    return response.data;
  },

  async getSellers(page = 0, size = 10) {
    const response = await api.get(`/api/v1/sellers/?offset=${page * size}&limit=${size}`);
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
    const response = await api.get(`/api/v1/images/?offset=${page * size}&limit=${size}`);
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

  // Get images for specific product (legacy method - kept for compatibility)
  async getProductImages(productId) {
    try {
      const response = await fetch(`${this.baseURL}/products/${productId}/images`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Найдено ${data.length} изображений для товара ${productId}:`, data);
      return data;
    } catch (error) {
      console.error(`Ошибка загрузки изображений для товара ${productId}:`, error);
      return [];
    }
  },

  // Get product image URL directly (for single image per product)
  getProductImageUrl(productId) {
    return `${API_BASE_URL}/api/v1/products/${productId}/image`;
  },

  // Get product image as blob (for analysis)
  async getProductImageBlob(productId) {
    const response = await fetch(`${API_BASE_URL}/api/v1/products/${productId}/image`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'image/*',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch product image: ${response.status}`);
    }

    return await response.blob();
  },

  // Get product boards statistics
  async getProductBoardsStats(productId) {
    const response = await fetch(`${API_BASE_URL}/api/v1/products/${productId}/boards/stats`);
    if (!response.ok) {
      throw new Error(`Failed to fetch boards stats: ${response.status}`);
    }
    const result = await response.json();
    return result.data;
  },

  // Get image file URL
  getImageFileUrl(imageId) {
    const baseUrl = (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/\/+$/, '');
    const imageUrl = `${baseUrl}/api/v1/images/${imageId}/file`;
    console.log(`Сформирован URL изображения ${imageId}:`, imageUrl);
    return imageUrl;
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
