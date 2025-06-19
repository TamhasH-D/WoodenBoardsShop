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

// --- Token Management for API calls ---
let currentToken = null;

export const updateApiToken = (newToken) => {
  currentToken = newToken;
  if (newToken) {
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    console.log('[apiService] Auth token updated in Axios defaults.');
  } else {
    delete api.defaults.headers.common['Authorization'];
    console.log('[apiService] Auth token removed from Axios defaults.');
  }
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // If a token exists and the header isn't already set, set it.
    // This primarily covers cases where a request might be initiated before AuthContext updates the default.
    if (currentToken && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${currentToken}`;
      console.log('[apiService] Auth token applied by interceptor.');
    }
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
    const errorDetails = {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    };
    console.error('API Response Error:', errorDetails);

    if (error.response?.status === 401) {
      console.warn('[apiService] Unauthorized (401) - Token may be expired or invalid. Keycloak should handle refresh or prompt login.');
      // Potentially trigger a custom event or callback if global logout/re-auth is needed from here.
    } else if (error.response?.status === 403) {
      console.warn('[apiService] Forbidden (403) - Insufficient permissions.');
    } else if (error.response?.status === 404) {
      console.warn('[apiService] Resource not found (404).');
    } else if (error.response?.status >= 500) {
      console.error('[apiService] Server error occurred (5xx).');
    } else if (error.code === 'ECONNABORTED') {
      console.error('[apiService] Request timeout (ECONNABORTED).');
    } else if (error.code === 'ERR_NETWORK' || error.code === 'NETWORK_ERROR') {
      console.error('[apiService] Network error - backend may be unavailable. Check API_URL:', API_BASE_URL);
    } else if (error.message?.includes('ERR_SSL_PROTOCOL_ERROR')) {
      console.error('[apiService] SSL Protocol Error - check HTTPS configuration.');
    }
    return Promise.reject(error);
  }
);

// --- Buyer Profile API ---

export const getMyBuyerProfile = async (keycloak_id) => {
  try {
    console.log(`[apiService] Attempting to fetch buyer profile from /api/v1/buyers/by-keycloak/${keycloak_id}`);
    const response = await api.get(`/api/v1/buyers/by-keycloak/${keycloak_id}`);
    console.log('[apiService] Buyer profile fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error(`[apiService] Error fetching buyer profile from /api/v1/buyers/by-keycloak/${keycloak_id}:`, error.response ? error.response.data : error.message);
    if (error.response) {
      console.error('[apiService] Error response details:', {
        status: error.response.status,
        headers: error.response.headers,
        data: error.response.data,
      });
      if (error.response.status === 404) {
        console.log(`[apiService] Buyer with keycloak_id ${keycloak_id} not found. Attempting to create...`);
        try {
          const newBuyerId = generateEntityUUID(ENTITY_TYPES.BUYER);
          const createResponse = await api.post('/api/v1/buyers/', {
            id: newBuyerId,
            keycloak_uuid: keycloak_id,
            is_online: true,
          });
          console.log('[apiService] Buyer created successfully:', createResponse.data);
          // Attempt to fetch the profile again after creation
          console.log(`[apiService] Attempting to fetch buyer profile again from /api/v1/buyers/by-keycloak/${keycloak_id}`);
          const retryResponse = await api.get(`/api/v1/buyers/by-keycloak/${keycloak_id}`);
          console.log('[apiService] Buyer profile fetched successfully after creation:', retryResponse.data);
          return retryResponse.data;
        } catch (createError) {
          console.error('[apiService] Error creating buyer:', createError.response ? createError.response.data : createError.message);
          throw createError; // Re-throw creation error
        }
      }
    }
    throw error; // Re-throw original error if not 404 or if creation fails
  }
};

// Enhanced cache for preventing excessive API calls
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const requestCache = new Map();

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

    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (now - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }
    }
    if (requestCache.has(cacheKey)) {
      return requestCache.get(cacheKey);
    }
    const requestPromise = (async () => {
      try {
        const response = await api.get(`/api/v1/products/?offset=${page * size}&limit=${size}`);
        const result = {
          data: response.data.data || response.data,
          total: response.data.pagination?.total || 0,
          offset: page * size,
          limit: size
        };
        cache.set(cacheKey, { data: result, timestamp: now });
        return result;
      } finally {
        requestCache.delete(cacheKey);
      }
    })();
    requestCache.set(cacheKey, requestPromise);
    return requestPromise;
  },

  async getProduct(productId) {
    const response = await api.get(`/api/v1/products/${productId}`);
    return response.data;
  },

  // Search products
  async searchProducts(filters = {}, page = 0, size = 20) {
    const cacheKey = `search_${JSON.stringify(filters)}_${page}_${size}`;
    const now = Date.now();
    const SEARCH_CACHE_DURATION = 30000;

    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (now - cached.timestamp < SEARCH_CACHE_DURATION) {
        return cached.data;
      }
    }
    if (requestCache.has(cacheKey)) {
      return requestCache.get(cacheKey);
    }
    const requestPromise = (async () => {
      try {
        const params = new URLSearchParams({
          offset: (page * size).toString(),
          limit: size.toString()
        });
        if (filters.search_query && filters.search_query.trim() !== '') params.append('search_query', filters.search_query.trim());
        if (filters.price_min !== undefined && filters.price_min !== '' && filters.price_min !== null) params.append('price_min', filters.price_min.toString());
        if (filters.price_max !== undefined && filters.price_max !== '' && filters.price_max !== null) params.append('price_max', filters.price_max.toString());
        if (filters.volume_min !== undefined && filters.volume_min !== '' && filters.volume_min !== null) params.append('volume_min', filters.volume_min.toString());
        if (filters.volume_max !== undefined && filters.volume_max !== '' && filters.volume_max !== null) params.append('volume_max', filters.volume_max.toString());
        if (filters.wood_type_ids && filters.wood_type_ids.length > 0) filters.wood_type_ids.forEach(id => params.append('wood_type_ids', id));
        if (filters.seller_ids && filters.seller_ids.length > 0) filters.seller_ids.forEach(id => params.append('seller_ids', id));
        if (filters.delivery_possible !== undefined && filters.delivery_possible !== null) params.append('delivery_possible', filters.delivery_possible.toString());
        if (filters.has_pickup_location !== undefined && filters.has_pickup_location !== null) params.append('has_pickup_location', filters.has_pickup_location.toString());
        params.append('sort_by', filters.sort_by || 'created_at');
        params.append('sort_order', filters.sort_order || 'desc');

        const url = `/api/v1/products/search?${params.toString()}`;
        const response = await api.get(url);
        const result = {
          data: response.data.data || response.data,
          total: response.data.pagination?.total || 0,
          offset: page * size,
          limit: size
        };
        cache.set(cacheKey, { data: result, timestamp: now });
        return result;
      } finally {
        requestCache.delete(cacheKey);
      }
    })();
    requestCache.set(cacheKey, requestPromise);
    return requestPromise;
  },

  clearSearchCache() {
    const keysToDelete = [];
    for (const key of cache.keys()) {
      if (key.startsWith('search_')) keysToDelete.push(key);
    }
    keysToDelete.forEach(key => cache.delete(key));
    console.log('[apiService] Cleared search cache');
  },

  // Wood types and prices
  async getWoodTypes(page = 0, size = 20) {
    const actualSize = Math.min(size, 20);
    const response = await api.get(`/api/v1/wood-types/?offset=${page * actualSize}&limit=${actualSize}`);
    return {
      data: response.data.data || response.data,
      total: response.data.pagination?.total || 0,
      offset: page * actualSize,
      limit: actualSize
    };
  },

  async getWoodTypePrices(page = 0, size = 20) {
    const actualSize = Math.min(size, 20);
    const response = await api.get(`/api/v1/wood-type-prices/?offset=${page * actualSize}&limit=${actualSize}`);
    return {
      data: response.data.data || response.data,
      total: response.data.pagination?.total || 0,
      offset: page * actualSize,
      limit: actualSize
    };
  },

  async getAllWoodTypes() {
    try {
      const firstPage = await this.getWoodTypes(0, 20);
      let allWoodTypes = [...firstPage.data];
      if (firstPage.total > 20) {
        const remainingPages = Math.ceil((firstPage.total - 20) / 20);
        const promises = Array.from({ length: remainingPages }, (_, i) => this.getWoodTypes(i + 1, 20));
        const additionalPages = await Promise.all(promises);
        additionalPages.forEach(pageData => allWoodTypes = allWoodTypes.concat(pageData.data));
      }
      return { data: allWoodTypes, total: firstPage.total, offset: 0, limit: allWoodTypes.length };
    } catch (error) {
      console.error('[apiService] Failed to fetch all wood types:', error);
      throw error;
    }
  },

  async getAllSellers() {
    try {
      const firstPage = await this.getSellers(0, 20);
      let allSellers = [...firstPage.data];
      if (firstPage.total > 20) {
        const remainingPages = Math.ceil((firstPage.total - 20) / 20);
        const promises = Array.from({ length: remainingPages }, (_, i) => this.getSellers(i + 1, 20));
        const additionalPages = await Promise.all(promises);
        additionalPages.forEach(pageData => allSellers = allSellers.concat(pageData.data));
      }
      return { data: allSellers, total: firstPage.total, offset: 0, limit: allSellers.length };
    } catch (error) {
      console.error('[apiService] Failed to fetch all sellers:', error);
      throw error;
    }
  },

  // Buyer profile (old methods, to be deprecated by getMyBuyerProfile)
  async getBuyerProfile(buyerId) {
    // This method might be deprecated in favor of getMyBuyerProfile
    console.warn("[apiService] getBuyerProfile(buyerId) is called. Consider using getMyBuyerProfile().");
    try {
      const response = await api.get(`/api/v1/buyers/${buyerId}`);
      return response.data;
    } catch (error) {
      // ... (existing error handling for this old method)
      throw error;
    }
  },

  async updateBuyerProfile(buyerId, buyerData) {
    // This method might be deprecated
    console.warn("[apiService] updateBuyerProfile(buyerId, buyerData) is called. Profile updates should go via a /me endpoint.");
    try {
      await this.ensureBuyerExists(buyerId); // Old logic
      const response = await api.patch(`/api/v1/buyers/${buyerId}`, buyerData);
      return response.data;
    } catch (error) {
      console.error('[apiService] Failed to update buyer profile (legacy method):', error);
      throw error;
    }
  },

  async createBuyer(buyerData) {
    // This method might be deprecated
    console.warn("[apiService] createBuyer(buyerData) is called. Profile creation should be handled by backend via /me endpoint.");
    try {
      const payload = buyerData.id ? buyerData : withUUID(buyerData, ENTITY_TYPES.BUYER);
      const response = await api.post('/api/v1/buyers/', payload);
      return response.data;
    } catch (error) {
      console.error('[apiService] Failed to create buyer (legacy method):', error);
      throw error;
    }
  },

  async getBuyerProfileByKeycloakId(keycloakId) {
    // This method should be replaced by getMyBuyerProfile which uses the token implicitly
    console.warn("[apiService] getBuyerProfileByKeycloakId is deprecated. Use getMyBuyerProfile().");
    try {
      const response = await api.get(`/api/v1/buyers/by-keycloak/${keycloakId}`);
      return response.data;
    } catch (error) {
        if (error.response?.status === 404) {
          console.warn(`[apiService] Buyer with keycloak_id ${keycloakId} not found (legacy method), attempting to create...`);
          // Old creation logic
          try {
            const newBuyer = await this.createBuyer({
              id: generateEntityUUID(ENTITY_TYPES.BUYER),
              keycloak_uuid: keycloakId,
              is_online: true
            });
            return newBuyer;
          } catch (createError) {
            console.error('[apiService] Failed to create buyer (legacy method):', createError);
            throw createError;
          }
        }
      console.error('[apiService] Failed to get buyer profile by keycloak_id (legacy method):', error);
      throw error;
    }
  },

  async ensureBuyerExists(buyerId) {
    // This is part of the old logic, may not be needed with /me/profile endpoint
    console.warn("[apiService] ensureBuyerExists is part of legacy logic.");
    try {
      await api.get(`/api/v1/buyers/${buyerId}`);
    } catch (error) {
      if (error.response?.status === 404 || error.response?.status === 422) {
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
    // This method should ideally use the authenticated user's ID from token via a /me/chats endpoint
    console.warn("[apiService] getBuyerChats(buyerId,...) called. Consider a /me/chats endpoint.");
    try {
      // await this.ensureBuyerExists(buyerId); // This might be problematic if buyerId is not the authenticated one
      const response = await api.get(`/api/v1/chat-threads/by-buyer/${buyerId}?offset=${page * size}&limit=${size}`); // Assuming backend handles pagination
      const threads = response.data.data || response.data || [];
      return {
        data: threads, // Assuming backend returns paginated data correctly
        total: response.data.pagination?.total || threads.length, // Adjust if backend pagination differs
        offset: page*size,
        limit: size
      };
    } catch (error) {
      console.error('[apiService] Failed to get buyer chats:', error);
      return { data: [], total: 0, offset: page * size, limit: size };
    }
  },

  async getChatThreadDetails(threadId) {
    try {
      const response = await api.get(`/api/v1/chat-threads/${threadId}`);
      return response.data;
    } catch (error) {
      console.error(`[apiService] Error fetching chat thread details for thread ${threadId}:`, error.response ? error.response.data : error.message);
      throw error;
    }
  },

  async getBuyerChatsByKeycloakId(keycloakId, page = 0, size = 10) {
    // DEPRECATED: AuthContext should provide buyer profile, then use getMyBuyerChats (new method to be created)
    console.warn("[apiService] getBuyerChatsByKeycloakId is deprecated.");
    try {
      const buyerProfile = await this.getBuyerProfileByKeycloakId(keycloakId); // old call
      return await this.getBuyerChats(buyerProfile.id, page, size); // old call
    } catch (error) {
      console.error('[apiService] Failed to get buyer chats by keycloak_id (legacy):', error);
      return { data: [], total: 0, offset: page * size, limit: size };
    }
  },

  async createChatThread(threadData) {
    const payload = threadData.id ? threadData : withUUID(threadData, ENTITY_TYPES.CHAT_THREAD);
    const response = await api.post('/api/v1/chat-threads/', payload);
    return response.data;
  },

  async startChatWithSeller(buyerId, sellerId) {
    // DEPRECATED: Should use a /me/chats/start or similar endpoint
    console.warn("[apiService] startChatWithSeller is deprecated. Use an endpoint that infers buyer_id from token.");
    try {
      const response = await api.post('/api/v1/chat-threads/start-with-seller', {
        buyer_id: buyerId, // This should come from token on backend
        seller_id: sellerId
      });
      return response.data;
    } catch (error) {
      console.error('[apiService] Failed to start chat with seller (legacy):', error);
      throw error;
    }
  },

  async startChatWithSellerByKeycloakId(keycloakId, sellerId) {
    // DEPRECATED
    console.warn("[apiService] startChatWithSellerByKeycloakId is deprecated.");
    try {
      const buyerProfile = await this.getBuyerProfileByKeycloakId(keycloakId); // old call
      return await this.startChatWithSeller(buyerProfile.id, sellerId); // old call
    } catch (error) {
      console.error('[apiService] Failed to start chat with seller by keycloak_id (legacy):', error);
      throw error;
    }
  },

  async getChatMessages(threadId, page = 0, size = 20) {
    try {
      const response = await api.get(`/api/v1/chat-messages/by-thread/${threadId}?offset=${page*size}&limit=${size}`); // Assuming backend handles pagination
      const messages = response.data.data || response.data || [];
      messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      return {
        data: messages,
        total: response.data.pagination?.total || messages.length,
        offset: page*size,
        limit: size
      };
    } catch (error) {
      console.error('[apiService] Failed to get chat messages:', error);
      return { data: [], total: 0, offset: page * size, limit: size };
    }
  },

  async sendMessage(messageData) {
    // DEPRECATED: Should use an endpoint that infers sender from token
    console.warn("[apiService] sendMessage is deprecated. Use an endpoint that infers sender from token.");
    try {
      // if (messageData.buyer_id) await this.ensureBuyerExists(messageData.buyer_id); // Old logic
      const payload = messageData.id ? messageData : withUUID(messageData, ENTITY_TYPES.CHAT_MESSAGE);
      const response = await api.post('/api/v1/chat-messages/', payload);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('[apiService] Failed to send message (legacy):', error.response?.data || error.message);
      return { success: false, error: error.response?.data || error.message };
    }
  },

  async sendMessageByKeycloakId(keycloakId, messageData) {
    // DEPRECATED
    console.warn("[apiService] sendMessageByKeycloakId is deprecated.");
     try {
      const buyerProfile = await this.getBuyerProfileByKeycloakId(keycloakId); // old call
      return await this.sendMessage({ ...messageData, buyer_id: buyerProfile.id }); // old call
    } catch (error) {
      console.error('[apiService] Failed to send message by keycloak_id (legacy):', error);
      throw error;
    }
  },

  async markMessagesAsRead(threadId, userId, userType) {
    // This might need adjustment based on whether userId is Keycloak ID or DB ID.
    // Assuming backend expects DB ID for 'user_id' here.
    console.warn("[apiService] markMessagesAsRead: ensure userId is the correct DB ID, not Keycloak subject.");
    try {
      const response = await api.patch(`/api/v1/chat-messages/${threadId}/mark-read?user_id=${userId}&user_type=${userType}`);
      return response.data;
    } catch (error) {
      console.error('[apiService] Failed to mark messages as read:', error.response?.data || error.message);
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
    return {
      data: response.data.data || response.data,
      total: response.data.pagination?.total || 0,
      offset: page * size,
      limit: size
    };
  },

  // ... (other existing methods like getWoodType, getWoodTypePrice, Images, etc. remain unchanged for now) ...
  // Individual entity getters for consistency
  async getBuyer(id) { // This specific one is problematic if used for "current buyer"
    console.warn("[apiService] getBuyer(id) is called. For current buyer, use getMyBuyerProfile().");
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

  async getAllImages() {
    const cacheKey = 'all_images';
    const now = Date.now();
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (now - cached.timestamp < CACHE_DURATION) return cached.data;
    }
    let allImages = [];
    let page = 0;
    let hasMore = true;
    while (hasMore) {
      const response = await this.getImages(page, 20);
      allImages = [...allImages, ...response.data];
      hasMore = response.data.length === 20;
      page++;
    }
    cache.set(cacheKey, { data: allImages, timestamp: now });
    return allImages;
  },

  getProductImageUrl(productId) {
    return `${API_BASE_URL}/api/v1/products/${productId}/image`;
  },

  async getProductImageBlob(productId) {
    const response = await fetch(`${API_BASE_URL}/api/v1/products/${productId}/image`, {
      method: 'GET',
      credentials: 'include', // Important for session cookies if any, though Keycloak uses tokens
      headers: { 'Accept': 'image/*' },
    });
    if (!response.ok) throw new Error(`Failed to fetch product image: ${response.status}`);
    return await response.blob();
  },

  async getProductBoardsStats(productId) {
    const response = await fetch(`${API_BASE_URL}/api/v1/products/${productId}/boards/stats`);
    if (!response.ok) throw new Error(`Failed to fetch boards stats: ${response.status}`);
    return (await response.json()).data;
  },

  async getWoodenBoardsByProduct(productId, page = 0, size = 20) {
    const response = await api.get(`/api/v1/products/${productId}/wooden-boards?offset=${page * size}&limit=${size}`);
    return {
      data: response.data.data || response.data,
      total: response.data.pagination?.total || 0, // Corrected from response.data.total
      offset: page * size,
      limit: size
    };
  },

  getImageFileUrl(imageId) {
    return `${API_BASE_URL}/api/v1/images/${imageId}/file`;
  },

  async getImageMetadata(imageId) {
    const response = await api.get(`/api/v1/images/${imageId}`);
    return response.data;
  },

  async uploadImage(productId, imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);
    const response = await api.post(`/api/v1/images/upload?product_id=${productId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async deleteImage(imageId) {
    const response = await api.delete(`/api/v1/images/${imageId}`);
    return response.data;
  },

  async analyzeWoodenBoard(imageFile, boardHeight = 0.0, boardLength = 0.0) {
    const formData = new FormData();
    formData.append('image', imageFile);
    const heightInMm = boardHeight * 1000;
    const lengthInMm = boardLength * 1000;
    const response = await api.post(
      `/api/v1/wooden-boards/calculate-volume?board_height=${heightInMm}&board_length=${lengthInMm}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },
};

export default api; // Export the main axios instance
