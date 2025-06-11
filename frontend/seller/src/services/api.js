import axios from 'axios';
import { generateEntityUUID, withUUID, ENTITY_TYPES } from '../utils/uuid';
import { fetchAllPages } from '../utils/paginationUtils';

// Get API URL from environment variables or use default
const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

// Get Wooden Boards microservice URL from environment variables or use default
const WOODEN_BOARDS_API_URL = (process.env.REACT_APP_WOODEN_BOARDS_API_URL || 'http://localhost:8001').replace(/\/+$/, '');

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create separate axios instance for wooden-boards microservice
const woodenBoardsApi = axios.create({
  baseURL: WOODEN_BOARDS_API_URL,
  timeout: 60000, // Longer timeout for image processing
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

// Request interceptor for wooden-boards API
woodenBoardsApi.interceptors.request.use(
  (config) => {
    console.log(`Wooden Boards API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Wooden Boards API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for wooden-boards API
woodenBoardsApi.interceptors.response.use(
  (response) => {
    console.log(`Wooden Boards API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('Wooden Boards API Response Error:', error.response?.status, error.response?.data);

    // Handle common error cases for wooden-boards API
    if (error.response?.status === 404) {
      console.warn('Wooden boards endpoint not found');
    } else if (error.response?.status >= 500) {
      console.error('Wooden boards service error occurred');
    } else if (error.code === 'ECONNABORTED') {
      console.error('Wooden boards request timeout');
    } else if (error.code === 'ERR_NETWORK') {
      console.error('Network error - wooden boards service may be unavailable');
    }

    return Promise.reject(error);
  }
);

// Simple cache for client-side filtering performance
const cache = new Map();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

// API service functions for sellers
export const apiService = {
  // Cache management
  clearCache() {
    cache.clear();
    if (process.env.NODE_ENV === 'development') {
      console.log('API cache cleared');
    }
  },

  // Health check
  async healthCheck() {
    try {
      const response = await api.get('/api/v1/health');
      return response.data;
    } catch (error) {
      throw new Error('Backend health check failed');
    }
  },

  // Seller profile management by keycloak_id with automatic creation
  async getSellerProfileByKeycloakId(keycloakId) {
    try {
      const response = await api.get(`/api/v1/sellers/by-keycloak/${keycloakId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        // Seller doesn't exist, try to create it
        console.warn(`Seller with keycloak_id ${keycloakId} not found, attempting to create...`);
        try {
          const newSeller = await this.createSeller({
            id: generateEntityUUID(ENTITY_TYPES.SELLER),
            keycloak_uuid: keycloakId,
            is_online: true
          });
          console.log('Seller created successfully:', newSeller);
          return newSeller;
        } catch (createError) {
          console.warn('Failed to create seller, using mock data:', createError);
          // Return mock data as fallback
          return {
            id: generateEntityUUID(ENTITY_TYPES.SELLER),
            keycloak_uuid: keycloakId,
            is_online: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }
      }
      throw error;
    }
  },

  // Legacy method for backward compatibility (deprecated)
  async getSellerProfile(sellerId) {
    console.warn('getSellerProfile is deprecated, use getSellerProfileByKeycloakId instead');
    return this.getSellerProfileByKeycloakId(sellerId);
  },

  async createSeller(sellerData) {
    try {
      // Генерируем UUID если не передан
      const payload = sellerData.id ? sellerData : withUUID(sellerData, ENTITY_TYPES.SELLER);
      const response = await api.post('/api/v1/sellers', payload);
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

  // Update seller profile by keycloak_id (gets seller_id first)
  async updateSellerProfileByKeycloakId(keycloakId, updateData) {
    try {
      // First get seller by keycloak_id to get the actual seller_id
      const sellerResponse = await this.getSellerProfileByKeycloakId(keycloakId);
      const sellerId = sellerResponse.data.id;

      // Then update using seller_id
      return await this.updateSellerProfile(sellerId, updateData);
    } catch (error) {
      console.error('Failed to update seller profile by keycloak_id:', error);
      throw error;
    }
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
        const response = await api.get(`/api/v1/products?offset=0&limit=20`);
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

  // Get seller products by keycloak_id (gets seller_id first)
  async getSellerProductsByKeycloakId(keycloakId, page = 0, size = 10) {
    try {
      // First get seller by keycloak_id to get the actual seller_id
      const sellerResponse = await this.getSellerProfileByKeycloakId(keycloakId);
      const sellerId = sellerResponse.data.id;

      // Then get products using seller_id
      return await this.getSellerProducts(sellerId, page, size);
    } catch (error) {
      console.error('Failed to get seller products by keycloak_id:', error);
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

      // Handle backend typo: 'description' -> 'descrioption'
      // Генерируем UUID если не передан
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

      const response = await api.post('/api/v1/products', payload);

      // Clear products cache to force refresh
      cache.delete('all_products');

      return response.data;
    } catch (error) {
      console.error('Failed to create product:', error);
      throw error;
    }
  },

  // Create product with image analysis in atomic transaction
  async createProductWithImage(productData, imageFile, boardHeight, boardLength) {
    try {
      // Ensure seller exists before creating product
      if (productData.seller_id) {
        await this.ensureSellerExists(productData.seller_id);
      }

      const formData = new FormData();

      // Add image file
      formData.append('image', imageFile);

      // Add product data with UUID
      formData.append('id', productData.id || generateEntityUUID(ENTITY_TYPES.PRODUCT));
      formData.append('title', productData.title);
      formData.append('description', productData.description || '');
      formData.append('price', parseFloat(productData.price));
      formData.append('delivery_possible', productData.delivery_possible || false);
      formData.append('pickup_location', productData.pickup_location || '');
      formData.append('seller_id', productData.seller_id);
      formData.append('wood_type_id', productData.wood_type_id);

      // Add board dimensions
      formData.append('board_height', boardHeight);
      formData.append('board_length', boardLength);

      if (process.env.NODE_ENV === 'development') {
        console.log('Creating product with image analysis...');
        console.log(`Product: ${productData.title}`);
        console.log(`Image: ${imageFile.name}, size: ${imageFile.size} bytes`);
        console.log(`Board dimensions: ${boardHeight}m x ${boardLength}m`);
      }

      const response = await api.post('/api/v1/products/with-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutes timeout for complete workflow
      });

      // Clear products cache to force refresh
      cache.delete('all_products');

      if (process.env.NODE_ENV === 'development') {
        console.log('Product created successfully with image analysis:', response.data);
      }
      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to create product with image:', error);
      }

      // Provide detailed error information
      let errorMessage = 'Failed to create product with image analysis';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  },

  async updateProduct(productId, productData) {
    try {
      // Handle backend typo: 'description' -> 'descrioption'
      const payload = {
        ...productData,
        descrioption: productData.description || productData.descrioption || null
      };

      // Remove the frontend 'description' field to avoid confusion
      if (payload.description !== undefined) {
        delete payload.description;
      }

      const response = await api.patch(`/api/v1/products/${productId}`, payload);

      // Clear products cache to force refresh
      cache.delete('all_products');

      return response.data;
    } catch (error) {
      console.error('Failed to update product:', error);
      throw error;
    }
  },

  // Update product with image analysis using new layered architecture endpoint
  async updateProductWithImage(productId, productData, imageFile, boardHeight, boardLength) {
    try {
      // Prepare form data for multipart request
      const formData = new FormData();

      // Add product data (only non-null values)
      if (productData.title) {
        formData.append('title', productData.title);
      }
      if (productData.description !== undefined) {
        formData.append('description', productData.description || '');
      }
      if (productData.wood_type_id) {
        formData.append('wood_type_id', productData.wood_type_id);
      }
      if (productData.price) {
        formData.append('price', productData.price.toString());
      }
      if (productData.delivery_possible !== undefined) {
        formData.append('delivery_possible', productData.delivery_possible.toString());
      }
      if (productData.pickup_location !== undefined) {
        formData.append('pickup_location', productData.pickup_location || '');
      }

      // Add board dimensions if provided
      if (boardHeight) {
        formData.append('board_height', boardHeight.toString());
      }
      if (boardLength) {
        formData.append('board_length', boardLength.toString());
      }

      // Add image file if provided
      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('Updating product with image analysis...');
        console.log(`Product ID: ${productId}`);
        if (imageFile) {
          console.log(`Image: ${imageFile.name}, size: ${imageFile.size} bytes`);
          console.log(`Board dimensions: ${boardHeight}m x ${boardLength}m`);
        }
      }

      const response = await api.patch(`/api/v1/products/${productId}/with-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutes timeout for complete workflow
      });

      // Clear products cache to force refresh
      cache.delete('all_products');

      if (process.env.NODE_ENV === 'development') {
        console.log('Product updated successfully with image analysis:', response.data);
      }

      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to update product with image:', error);
      }

      // Provide detailed error information
      let errorMessage = 'Failed to update product with image analysis';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  },

  async deleteProduct(productId) {
    try {
      const response = await api.delete(`/api/v1/products/${productId}`);

      // Clear products cache to force refresh
      cache.delete('all_products');

      return response.data;
    } catch (error) {
      console.error('Failed to delete product:', error);
      throw error;
    }
  },

  // Wood types management
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

  async getWoodType(woodTypeId) {
    const response = await api.get(`/api/v1/wood-types/${woodTypeId}`);
    return response.data;
  },

  async createWoodType(woodTypeData) {
    // Генерируем UUID если не передан
    const payload = woodTypeData.id ? woodTypeData : withUUID(woodTypeData, ENTITY_TYPES.WOOD_TYPE);
    const response = await api.post('/api/v1/wood-types', payload);
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

  async getWoodTypePrice(priceId) {
    const response = await api.get(`/api/v1/wood-type-prices/${priceId}`);
    return response.data;
  },

  async createWoodTypePrice(priceData) {
    // Генерируем UUID если не передан
    const payload = priceData.id ? priceData : withUUID(priceData, ENTITY_TYPES.WOOD_TYPE_PRICE);
    const response = await api.post('/api/v1/wood-type-prices', payload);
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
      const response = await api.get(`/api/v1/chat-threads?offset=0&limit=20`);
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

  // Get seller chats by keycloak_id (gets seller_id first)
  async getSellerChatsByKeycloakId(keycloakId, page = 0, size = 10) {
    try {
      // First get seller by keycloak_id to get the actual seller_id
      const sellerResponse = await this.getSellerProfileByKeycloakId(keycloakId);
      const sellerId = sellerResponse.data.id;

      // Then get chats using seller_id
      return await this.getSellerChats(sellerId, page, size);
    } catch (error) {
      console.error('Failed to get seller chats by keycloak_id:', error);
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

      // Генерируем UUID если не передан
      const payload = messageData.id ? messageData : withUUID(messageData, ENTITY_TYPES.CHAT_MESSAGE);
      const response = await api.post('/api/v1/chat-messages', payload);
      return response.data;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  },

  async createChatThread(threadData) {
    // Генерируем UUID если не передан
    const payload = threadData.id ? threadData : withUUID(threadData, ENTITY_TYPES.CHAT_THREAD);
    const response = await api.post('/api/v1/chat-threads', payload);
    return response.data;
  },

  // Image processing for volume calculation
  async analyzeBoardImage(file, height, length) {
    try {
      const formData = new FormData();
      formData.append('image', file);

      // Правильный endpoint с query параметрами (в миллиметрах)
      const heightInMm = height * 1000; // Конвертируем метры в миллиметры
      const lengthInMm = length * 1000; // Конвертируем метры в миллиметры
      const url = `/api/v1/wooden-boards/calculate-volume?board_height=${heightInMm}&board_length=${lengthInMm}`;

      if (process.env.NODE_ENV === 'development') {
        console.log(`Sending image analysis request to main backend: ${API_BASE_URL}${url}`);
        console.log(`Image file: ${file.name}, size: ${file.size} bytes`);
        console.log(`Board dimensions: height=${heightInMm}mm, length=${lengthInMm}mm`);
      }

      const response = await api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // Increase timeout for image processing
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('Image analysis successful:', response.data);
      }
      return response;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Image processing failed:', error);
      }

      // Provide more detailed error information
      let errorMessage = 'Failed to process image';
      if (error.code === 'ERR_NETWORK') {
        errorMessage = `Cannot connect to backend service at ${API_BASE_URL}. Please ensure the service is running.`;
      } else if (error.response?.status === 404) {
        errorMessage = `Image analysis endpoint not found. Check if the service is properly configured.`;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  },

  // Create product with image analysis using new backend API
  async createProductWithAnalysis(productData, imageFile) {
    try {
      const formData = new FormData();

      // Add all product fields
      formData.append('keycloak_id', productData.keycloak_id);
      formData.append('title', productData.title);
      if (productData.description) {
        formData.append('description', productData.description);
      }
      formData.append('wood_type_id', productData.wood_type_id);
      formData.append('board_height', productData.board_height);
      formData.append('board_length', productData.board_length);
      formData.append('volume', productData.volume);
      formData.append('price', productData.price);
      formData.append('delivery_possible', productData.delivery_possible);
      if (productData.pickup_location) {
        formData.append('pickup_location', productData.pickup_location);
      }
      formData.append('image', imageFile);

      console.log('Creating product with analysis:', productData);

      const response = await api.post('/api/v1/products/with-analysis', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // Увеличенный timeout для обработки изображений
      });

      console.log('Product created with analysis:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to create product with analysis:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw new Error(`Product creation failed: ${error.response?.data?.detail || error.message}`);
    }
  },

  // Wooden board analysis (same as buyer frontend for consistency)
  async analyzeWoodenBoard(imageFile, boardHeight = 0.0, boardLength = 0.0) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      // Конвертируем метры в миллиметры для API
      const heightInMm = boardHeight * 1000;
      const lengthInMm = boardLength * 1000;

      console.log(`Seller Board Analysis: Sending request to ${API_BASE_URL}/api/v1/wooden-boards/calculate-volume`);
      console.log(`Board dimensions: height=${heightInMm}mm, length=${lengthInMm}mm`);

      // Правильный формат запроса с query параметрами в миллиметрах
      const response = await api.post(
        `/api/v1/wooden-boards/calculate-volume?board_height=${heightInMm}&board_length=${lengthInMm}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000, // Увеличенный timeout для обработки изображений
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

  // Get all seller products (handles pagination automatically)
  async getAllSellerProducts(sellerId, options = {}) {
    const fetchFunction = async (offset, limit) => {
      return await this.getSellerProducts(sellerId, Math.floor(offset / limit), limit);
    };

    return await fetchAllPages(fetchFunction, {
      cacheKey: `all_seller_products_${sellerId}`,
      debug: process.env.NODE_ENV === 'development',
      ...options
    });
  },

  // Get all seller chats (handles pagination automatically)
  async getAllSellerChats(sellerId, options = {}) {
    const fetchFunction = async (offset, limit) => {
      return await this.getSellerChats(sellerId, Math.floor(offset / limit), limit);
    };

    return await fetchAllPages(fetchFunction, {
      cacheKey: `all_seller_chats_${sellerId}`,
      debug: process.env.NODE_ENV === 'development',
      ...options
    });
  },

  // Analytics - now uses proper pagination
  async getSellerStats(sellerId) {
    try {
      const [products, chats] = await Promise.all([
        this.getAllSellerProducts(sellerId),
        this.getAllSellerChats(sellerId)
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
