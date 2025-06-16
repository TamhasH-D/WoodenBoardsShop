import axios from 'axios';
import { generateEntityUUID, ENTITY_TYPES } from '../utils/uuid';
import { API_CONFIG, ERROR_MESSAGES } from '../utils/constants';
import { fetchAllPages, clearPaginationCache } from '../utils/paginationUtils';

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

    // eslint-disable-next-line no-console
    console.log(`[${config.requestId}] API Request: ${config.method?.toUpperCase()} ${config.url}`);

    // Check cache for GET requests
    if (config.method === 'get' && config.cache !== false) {
      const cacheKey = `${config.url}?${JSON.stringify(config.params)}`;
      const cached = requestCache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        // eslint-disable-next-line no-console
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

    // eslint-disable-next-line no-console
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



// Clear cache utility
export const clearApiCache = () => {
  requestCache.clear();
  clearPaginationCache(); // Also clear pagination cache
  // eslint-disable-next-line no-console
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
  async getBuyers(page = 0, size = 20) {
    const response = await api.get(`/api/v1/buyers/?offset=${page * size}&limit=${size}`);
    // Backend returns OffsetResults structure: { data: [...], pagination: { total: number } }
    return {
      data: response.data.data || response.data,
      pagination: {
        total: response.data.pagination?.total || 0,
        offset: page * size,
        limit: size
      },
      total: response.data.pagination?.total || 0, // Keep for backward compatibility
      offset: page * size,
      limit: size
    };
  },

  // Get all buyers with progressive loading
  async getAllBuyers() {
    let allBuyers = [];
    let page = 0;
    let hasMore = true;

    while (hasMore) {
      const response = await this.getBuyers(page, 20);
      allBuyers = [...allBuyers, ...response.data];

      // Check if we have more data
      hasMore = response.data.length === 20 && allBuyers.length < response.total;
      page++;
    }

    return {
      data: allBuyers,
      total: allBuyers.length
    };
  },

  async createBuyer(buyerData) {
    // Генерируем UUID если не передан
    const payload = {
      id: buyerData.id || generateEntityUUID(ENTITY_TYPES.BUYER),
      keycloak_uuid: buyerData.keycloak_uuid,
      is_online: buyerData.is_online || false
    };
    const response = await api.post('/api/v1/buyers/', payload);
    return response.data;
  },

  async getBuyer(id) {
    const response = await api.get(`/api/v1/buyers/${id}`);
    return response.data;
  },

  async updateBuyer(id, buyerData) {
    const response = await api.patch(`/api/v1/buyers/${id}`, buyerData);
    return response.data;
  },

  async deleteBuyer(id) {
    const response = await api.delete(`/api/v1/buyers/${id}`);
    return response.data;
  },



  // Sellers
  async getSellers(page = 0, size = 20) {
    const response = await api.get(`/api/v1/sellers/?offset=${page * size}&limit=${size}`);
    // Backend returns OffsetResults structure: { data: [...], pagination: { total: number } }
    return {
      data: response.data.data || response.data,
      pagination: {
        total: response.data.pagination?.total || 0,
        offset: page * size,
        limit: size
      },
      total: response.data.pagination?.total || 0, // Keep for backward compatibility
      offset: page * size,
      limit: size
    };
  },

  // Get all sellers with progressive loading
  async getAllSellers() {
    let allSellers = [];
    let page = 0;
    let hasMore = true;

    while (hasMore) {
      const response = await this.getSellers(page, 20);
      allSellers = [...allSellers, ...response.data];

      // Check if we have more data
      hasMore = response.data.length === 20 && allSellers.length < response.total;
      page++;
    }

    return {
      data: allSellers,
      total: allSellers.length
    };
  },

  async createSeller(sellerData) {
    // Генерируем UUID если не передан
    const payload = {
      id: sellerData.id || generateEntityUUID(ENTITY_TYPES.SELLER),
      keycloak_uuid: sellerData.keycloak_uuid,
      is_online: sellerData.is_online || false
    };
    const response = await api.post('/api/v1/sellers/', payload);
    return response.data;
  },

  async getSeller(id) {
    const response = await api.get(`/api/v1/sellers/${id}`);
    return response.data;
  },

  async updateSeller(id, sellerData) {
    const response = await api.patch(`/api/v1/sellers/${id}`, sellerData);
    return response.data;
  },

  async deleteSeller(id) {
    const response = await api.delete(`/api/v1/sellers/${id}`);
    return response.data;
  },



  // Products
  async getProducts(page = 0, size = 10) {
    const response = await api.get(`/api/v1/products/?offset=${page * size}&limit=${size}`);
    // Backend returns OffsetResults structure: { data: [...], pagination: { total: number } }
    return {
      data: response.data.data || response.data,
      pagination: {
        total: response.data.pagination?.total || 0,
        offset: page * size,
        limit: size
      },
      total: response.data.pagination?.total || 0, // Keep for backward compatibility
      offset: page * size,
      limit: size
    };
  },

  async createProduct(productData) {
    // Генерируем UUID если не передан, uses 'descrioption' (typo in backend)
    const payload = {
      id: productData.id || generateEntityUUID(ENTITY_TYPES.PRODUCT),
      volume: parseFloat(productData.volume),
      price: parseFloat(productData.price),
      title: productData.title,
      descrioption: productData.description || productData.descrioption || null, // Handle backend typo
      delivery_possible: productData.delivery_possible || false,
      pickup_location: productData.pickup_location || null,
      seller_id: productData.seller_id,
      wood_type_id: productData.wood_type_id
    };
    const response = await api.post('/api/v1/products/', payload);
    return response.data;
  },

  async getProduct(id) {
    const response = await api.get(`/api/v1/products/${id}`);
    return response.data;
  },

  async updateProduct(id, productData) {
    const response = await api.patch(`/api/v1/products/${id}`, productData);
    return response.data;
  },

  async deleteProduct(id) {
    const response = await api.delete(`/api/v1/products/${id}`);
    return response.data;
  },

  // Get all products (handles pagination automatically)
  async getAllProducts(options = {}) {
    const fetchFunction = async (offset, limit) => {
      return await this.getProducts(Math.floor(offset / limit), limit);
    };

    return await fetchAllPages(fetchFunction, {
      cacheKey: 'all_products',
      debug: process.env.NODE_ENV === 'development',
      ...options
    });
  },

  // Wood Types
  async getWoodTypes(page = 0, size = 20) {
    // Ensure size doesn't exceed backend limit of 20
    const actualSize = Math.min(size, 20);
    const response = await api.get(`/api/v1/wood-types/?offset=${page * actualSize}&limit=${actualSize}`);
    // Backend returns OffsetResults structure: { data: [...], pagination: { total: number } }
    return {
      data: response.data.data || response.data,
      pagination: {
        total: response.data.pagination?.total || 0,
        offset: page * actualSize,
        limit: actualSize
      },
      total: response.data.pagination?.total || 0, // Keep for backward compatibility
      offset: page * actualSize,
      limit: actualSize
    };
  },

  async getAllWoodTypes() {
    // Fetch all wood types by making multiple requests if needed
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

  async getWoodType(id) {
    const response = await api.get(`/api/v1/wood-types/${id}`);
    return response.data;
  },

  async createWoodType(woodTypeData) {
    // Генерируем UUID если не передан, uses 'neme' field (typo in backend)
    const payload = {
      id: woodTypeData.id || generateEntityUUID(ENTITY_TYPES.WOOD_TYPE),
      neme: woodTypeData.name || woodTypeData.neme, // Handle both frontend 'name' and backend 'neme'
      description: woodTypeData.description || null
    };
    const response = await api.post('/api/v1/wood-types/', payload);
    return response.data;
  },

  async updateWoodType(id, woodTypeData) {
    const response = await api.patch(`/api/v1/wood-types/${id}`, woodTypeData);
    return response.data;
  },

  async deleteWoodType(id) {
    const response = await api.delete(`/api/v1/wood-types/${id}`);
    return response.data;
  },

  // Wood Type Prices
  async getWoodTypePrices(page = 0, size = 20) {
    // Ensure size doesn't exceed backend limit of 20
    const actualSize = Math.min(size, 20);
    const response = await api.get(`/api/v1/wood-type-prices/?offset=${page * actualSize}&limit=${actualSize}`);
    // Backend returns OffsetResults structure: { data: [...], pagination: { total: number } }
    return {
      data: response.data.data || response.data,
      pagination: {
        total: response.data.pagination?.total || 0,
        offset: page * actualSize,
        limit: actualSize
      },
      total: response.data.pagination?.total || 0, // Keep for backward compatibility
      offset: page * actualSize,
      limit: actualSize
    };
  },

  async getAllWoodTypePrices() {
    // Fetch all wood type prices by making multiple requests if needed
    try {
      const firstPage = await this.getWoodTypePrices(0, 20);
      const total = firstPage.total;
      let allPrices = [...firstPage.data];

      // If there are more prices, fetch them
      if (total > 20) {
        const remainingPages = Math.ceil((total - 20) / 20);
        const promises = [];

        for (let page = 1; page <= remainingPages; page++) {
          promises.push(this.getWoodTypePrices(page, 20));
        }

        const additionalPages = await Promise.all(promises);
        additionalPages.forEach(pageData => {
          allPrices = allPrices.concat(pageData.data);
        });
      }

      return {
        data: allPrices,
        total: total,
        offset: 0,
        limit: allPrices.length
      };
    } catch (error) {
      console.error('Failed to fetch all wood type prices:', error);
      throw error;
    }
  },

  async getWoodTypePrice(id) {
    const response = await api.get(`/api/v1/wood-type-prices/${id}`);
    return response.data;
  },

  async createWoodTypePrice(priceData) {
    // Генерируем UUID если не передан
    const payload = {
      id: priceData.id || generateEntityUUID(ENTITY_TYPES.WOOD_TYPE_PRICE),
      price_per_m3: parseFloat(priceData.price_per_m3),
      wood_type_id: priceData.wood_type_id
    };
    const response = await api.post('/api/v1/wood-type-prices/', payload);
    return response.data;
  },

  async updateWoodTypePrice(id, priceData) {
    const response = await api.patch(`/api/v1/wood-type-prices/${id}`, priceData);
    return response.data;
  },

  async deleteWoodTypePrice(id) {
    const response = await api.delete(`/api/v1/wood-type-prices/${id}`);
    return response.data;
  },

  // Wooden Boards
  async getWoodenBoards(page = 0, size = 20) {
    const response = await api.get(`/api/v1/wooden-boards/?offset=${page * size}&limit=${size}`);
    // Backend returns OffsetResults structure: { data: [...], pagination: { total: number } }
    return {
      data: response.data.data || response.data,
      pagination: {
        total: response.data.pagination?.total || 0,
        offset: page * size,
        limit: size
      },
      total: response.data.pagination?.total || 0, // Keep for backward compatibility
      offset: page * size,
      limit: size
    };
  },

  async getWoodenBoard(id) {
    const response = await api.get(`/api/v1/wooden-boards/${id}`);
    return response.data;
  },

  async createWoodenBoard(boardData) {
    // Генерируем UUID если не передан, Backend DTO uses 'length' (typo was fixed in DTO)
    const payload = {
      id: boardData.id || generateEntityUUID(ENTITY_TYPES.WOODEN_BOARD),
      height: parseFloat(boardData.height),
      width: parseFloat(boardData.width),
      length: parseFloat(boardData.length || boardData.lenght), // Backend uses 'length'
      volume: parseFloat(boardData.volume),
      confidence: parseFloat(boardData.confidence),
      image_id: boardData.image_id,
      product_id: boardData.product_id
    };
    const response = await api.post('/api/v1/wooden-boards/', payload);
    return response.data;
  },

  async updateWoodenBoard(id, boardData) {
    const response = await api.patch(`/api/v1/wooden-boards/${id}`, boardData);
    return response.data;
  },

  async deleteWoodenBoard(id) {
    const response = await api.delete(`/api/v1/wooden-boards/${id}`);
    return response.data;
  },

  // Get all wooden boards (handles pagination automatically)
  async getAllWoodenBoards(options = {}) {
    const fetchFunction = async (offset, limit) => {
      return await this.getWoodenBoards(Math.floor(offset / limit), limit);
    };

    return await fetchAllPages(fetchFunction, {
      cacheKey: 'all_wooden_boards',
      debug: process.env.NODE_ENV === 'development',
      ...options
    });
  },

  // Images
  async getImages(page = 0, size = 20) {
    const response = await api.get(`/api/v1/images/?offset=${page * size}&limit=${size}`);
    // Backend returns OffsetResults structure: { data: [...], pagination: { total: number } }
    return {
      data: response.data.data || response.data,
      pagination: {
        total: response.data.pagination?.total || 0,
        offset: page * size,
        limit: size
      },
      total: response.data.pagination?.total || 0, // Keep for backward compatibility
      offset: page * size,
      limit: size
    };
  },

  async getImage(id) {
    const response = await api.get(`/api/v1/images/${id}`);
    return response.data;
  },

  // Get image file by ID (optimized for display)
  async getImageFile(id) {
    const response = await api.get(`/api/v1/images/${id}/file`, {
      responseType: 'blob'
    });
    return response.data;
  },

  async createImage(imageData) {
    // Генерируем UUID если не передан
    const payload = {
      id: imageData.id || generateEntityUUID(ENTITY_TYPES.IMAGE),
      image_path: imageData.image_path,
      product_id: imageData.product_id
    };
    const response = await api.post('/api/v1/images/', payload);
    return response.data;
  },

  async updateImage(id, imageData) {
    const response = await api.patch(`/api/v1/images/${id}`, imageData);
    return response.data;
  },

  async deleteImage(id) {
    const response = await api.delete(`/api/v1/images/${id}`);
    return response.data;
  },

  // Get all images (handles pagination automatically)
  async getAllImages(options = {}) {
    const fetchFunction = async (offset, limit) => {
      return await this.getImages(Math.floor(offset / limit), limit);
    };

    return await fetchAllPages(fetchFunction, {
      cacheKey: 'all_images',
      debug: process.env.NODE_ENV === 'development',
      ...options
    });
  },

  // Chat Threads
  async getChatThreads(page = 0, size = 10) {
    const response = await api.get(`/api/v1/chat-threads/?offset=${page * size}&limit=${size}`);
    // Backend returns OffsetResults structure: { data: [...], pagination: { total: number } }
    return {
      data: response.data.data || response.data,
      pagination: {
        total: response.data.pagination?.total || 0,
        offset: page * size,
        limit: size
      },
      total: response.data.pagination?.total || 0, // Keep for backward compatibility
      offset: page * size,
      limit: size
    };
  },

  async getChatThread(id) {
    const response = await api.get(`/api/v1/chat-threads/${id}`);
    return response.data;
  },

  async createChatThread(threadData) {
    // Генерируем UUID если не передан
    const payload = {
      id: threadData.id || generateEntityUUID(ENTITY_TYPES.CHAT_THREAD),
      buyer_id: threadData.buyer_id,
      seller_id: threadData.seller_id
    };
    const response = await api.post('/api/v1/chat-threads/', payload);
    return response.data;
  },

  async updateChatThread(id, threadData) {
    const response = await api.patch(`/api/v1/chat-threads/${id}`, threadData);
    return response.data;
  },

  async deleteChatThread(id) {
    const response = await api.delete(`/api/v1/chat-threads/${id}`);
    return response.data;
  },

  // Get all chat threads (handles pagination automatically)
  async getAllChatThreads(options = {}) {
    const fetchFunction = async (offset, limit) => {
      return await this.getChatThreads(Math.floor(offset / limit), limit);
    };

    return await fetchAllPages(fetchFunction, {
      cacheKey: 'all_chat_threads',
      debug: process.env.NODE_ENV === 'development',
      ...options
    });
  },

  // Chat Messages
  async getChatMessages(page = 0, size = 10) {
    const response = await api.get(`/api/v1/chat-messages/?offset=${page * size}&limit=${size}`);
    // Backend returns OffsetResults structure: { data: [...], pagination: { total: number } }
    return {
      data: response.data.data || response.data,
      pagination: {
        total: response.data.pagination?.total || 0,
        offset: page * size,
        limit: size
      },
      total: response.data.pagination?.total || 0, // Keep for backward compatibility
      offset: page * size,
      limit: size
    };
  },

  async getChatMessage(id) {
    const response = await api.get(`/api/v1/chat-messages/${id}`);
    return response.data;
  },

  async createChatMessage(messageData) {
    // Генерируем UUID если не передан, Backend uses 'thread_id' field (not 'chat_thread_id')
    const payload = {
      id: messageData.id || generateEntityUUID(ENTITY_TYPES.CHAT_MESSAGE),
      message: messageData.message,
      is_read_by_buyer: messageData.is_read_by_buyer || false,
      is_read_by_seller: messageData.is_read_by_seller || false,
      thread_id: messageData.thread_id || messageData.chat_thread_id, // Handle both field names
      buyer_id: messageData.buyer_id,
      seller_id: messageData.seller_id
    };
    const response = await api.post('/api/v1/chat-messages/', payload);
    return response.data;
  },

  async updateChatMessage(id, messageData) {
    const response = await api.patch(`/api/v1/chat-messages/${id}`, messageData);
    return response.data;
  },

  async deleteChatMessage(id) {
    const response = await api.delete(`/api/v1/chat-messages/${id}`);
    return response.data;
  },

  // Get all chat messages (handles pagination automatically)
  async getAllChatMessages(options = {}) {
    const fetchFunction = async (offset, limit) => {
      return await this.getChatMessages(Math.floor(offset / limit), limit);
    };

    return await fetchAllPages(fetchFunction, {
      cacheKey: 'all_chat_messages',
      debug: process.env.NODE_ENV === 'development',
      ...options
    });
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



  async getSystemAnalytics() {
    try {
      // Use lightweight first-page requests for dashboard stats to prevent excessive API calls
      // This provides quick overview stats without overwhelming the backend
      const [buyers, sellers, products, woodTypes, prices, boards, images, threads, messages] = await Promise.all([
        this.getBuyers(0, 20),
        this.getSellers(0, 20),
        this.getProducts(0, 20),
        this.getWoodTypes(0, 20),
        this.getWoodTypePrices(0, 20),
        this.getWoodenBoards(0, 20),
        this.getImages(0, 20),
        this.getChatThreads(0, 20),
        this.getChatMessages(0, 20)
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
        messages: messages.data || [],
        // Include totals from pagination info for accurate counts
        totals: {
          buyers: buyers.total || 0,
          sellers: sellers.total || 0,
          products: products.total || 0,
          woodTypes: woodTypes.total || 0,
          prices: prices.total || 0,
          boards: boards.total || 0,
          images: images.total || 0,
          threads: threads.total || 0,
          messages: messages.total || 0
        }
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
        messages: [],
        totals: {
          buyers: 0, sellers: 0, products: 0, woodTypes: 0, prices: 0,
          boards: 0, images: 0, threads: 0, messages: 0
        }
      };
    }
  },






};

export default api;
