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

// Request interceptor for logging (only in development and only for errors)
api.interceptors.request.use(
  (config) => {
    // Only log in development and only for specific debugging
    if (process.env.NODE_ENV === 'development' && config.url?.includes('debug')) {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('API Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor for error handling (reduced logging)
api.interceptors.response.use(
  (response) => {
    // Only log successful responses in development for debugging specific endpoints
    if (process.env.NODE_ENV === 'development' && response.config.url?.includes('debug')) {
      console.log(`API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    // Only log errors in development
    if (process.env.NODE_ENV === 'development') {
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
    }

    return Promise.reject(error);
  }
);

// Request interceptor for wooden-boards API (reduced logging)
woodenBoardsApi.interceptors.request.use(
  (config) => {
    // Only log in development for debugging
    if (process.env.NODE_ENV === 'development' && config.url?.includes('debug')) {
      console.log(`Wooden Boards API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Wooden Boards API Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor for wooden-boards API (reduced logging)
woodenBoardsApi.interceptors.response.use(
  (response) => {
    // Only log in development for debugging
    if (process.env.NODE_ENV === 'development' && response.config.url?.includes('debug')) {
      console.log(`Wooden Boards API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    // Only log errors in development
    if (process.env.NODE_ENV === 'development') {
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
          console.error('Failed to create seller:', createError);
          throw createError; // Don't return fake data, let the error propagate
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

  // Products management (legacy method - kept for backward compatibility)
  async getSellerProducts(sellerId, page = 0, size = 10) {
    try {
      // First ensure the seller exists
      await this.ensureSellerExists(sellerId);

      // Get seller by ID to get keycloak_uuid, then use new secure endpoint
      const sellerResponse = await api.get(`/api/v1/sellers/${sellerId}`);
      const keycloakId = sellerResponse.data.data.keycloak_uuid;

      // Use the new secure endpoint
      return await this.getSellerProductsByKeycloakId(keycloakId, page, size);
    } catch (error) {
      console.error('Failed to get seller products:', error);
      // Fallback to old client-side filtering method if new endpoint fails
      try {
        console.warn('Falling back to client-side filtering...');

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
      } catch (fallbackError) {
        console.error('Fallback method also failed:', fallbackError);
        // Return empty result on error
        return {
          data: [],
          total: 0,
          offset: page * size,
          limit: size
        };
      }
    }
  },

  // Get seller products by seller_id using secure backend endpoint
  async getSellerProductsBySellerId(sellerId, page = 0, size = 10, sortBy = 'created_at', sortOrder = 'desc') {
    console.log('getSellerProductsBySellerId called with:', { sellerId, page, size, sortBy, sortOrder });
    try {
      // Use the secure backend endpoint that automatically filters by seller
      const actualSize = Math.min(size, 20); // Backend limit
      const offset = page * actualSize;

      const params = {
        seller_id: sellerId,
        offset: offset,
        limit: actualSize,
        sort_by: sortBy,
        sort_order: sortOrder
      };

      console.log('Making API request with params:', params);

      const response = await api.get(`/api/v1/products/my-products`, { params });

      console.log('API response received:', response.data);

      return {
        data: response.data.data || response.data,
        total: response.data.pagination?.total || 0,
        offset: offset,
        limit: actualSize
      };
    } catch (error) {
      console.error('Failed to get seller products by seller_id:', error);
      // Return empty result on error
      return {
        data: [],
        total: 0,
        offset: page * size,
        limit: size
      };
    }
  },

  // Search seller products with filters using secure backend endpoint
  async searchSellerProductsBySellerId(sellerId, filters = {}, page = 0, size = 10, sortBy = 'created_at', sortOrder = 'desc') {
    console.log('searchSellerProductsBySellerId called with:', { sellerId, filters, page, size, sortBy, sortOrder });
    try {
      const actualSize = Math.min(size, 20); // Backend limit
      const offset = page * actualSize;

      const params = {
        seller_id: sellerId,
        offset: offset,
        limit: actualSize,
        sort_by: sortBy,
        sort_order: sortOrder,
        ...filters // Include all search filters
      };

      console.log('Making search API request with params:', params);

      const response = await api.get(`/api/v1/products/my-products/search`, { params });

      console.log('Search API response received:', response.data);

      return {
        data: response.data.data || response.data,
        total: response.data.pagination?.total || 0,
        offset: offset,
        limit: actualSize
      };
    } catch (error) {
      console.error('Failed to search seller products by seller_id:', error);
      // Return empty result on error
      return {
        data: [],
        total: 0,
        offset: page * size,
        limit: size
      };
    }
  },

  // Backward compatibility: Get seller products by keycloak_id (gets seller_id first)
  async getSellerProductsByKeycloakId(keycloakId, page = 0, size = 10, sortBy = 'created_at', sortOrder = 'desc') {
    console.log('getSellerProductsByKeycloakId called with:', { keycloakId, page, size, sortBy, sortOrder });
    try {
      // First get seller by keycloak_id to get the actual seller_id
      const sellerResponse = await this.getSellerProfileByKeycloakId(keycloakId);
      const sellerId = sellerResponse.data.id;

      // Then get products using seller_id
      return await this.getSellerProductsBySellerId(sellerId, page, size, sortBy, sortOrder);
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

  // Backward compatibility: Search seller products by keycloak_id (gets seller_id first)
  async searchSellerProductsByKeycloakId(keycloakId, filters = {}, page = 0, size = 10, sortBy = 'created_at', sortOrder = 'desc') {
    console.log('searchSellerProductsByKeycloakId called with:', { keycloakId, filters, page, size, sortBy, sortOrder });
    try {
      // First get seller by keycloak_id to get the actual seller_id
      const sellerResponse = await this.getSellerProfileByKeycloakId(keycloakId);
      const sellerId = sellerResponse.data.id;

      // Then search products using seller_id
      return await this.searchSellerProductsBySellerId(sellerId, filters, page, size, sortBy, sortOrder);
    } catch (error) {
      console.error('Failed to search seller products by keycloak_id:', error);
      // Return empty result on error
      return {
        data: [],
        total: 0,
        offset: page * size,
        limit: size
      };
    }
  },

  // Helper method to clear seller products cache
  clearSellerProductsCache() {
    // Clear any cached seller product data
    // This ensures fresh data is fetched after product changes
    const keysToDelete = [];
    for (const key of cache.keys()) {
      if (key.includes('seller_products_') || key.includes('my_products_')) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => cache.delete(key));
  },

  // Helper method to ensure seller exists before making seller-specific API calls
  async ensureSellerExists(sellerId) {
    try {
      await api.get(`/api/v1/sellers/${sellerId}`);
    } catch (error) {
      if (error.response?.status === 404 || error.response?.status === 422) {
        console.log(`Seller ${sellerId} doesn't exist, creating...`);
        // Don't create sellers with fake keycloak_uuid
        console.error('Cannot create seller without real keycloak_uuid');
        throw new Error('Real authentication required');
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
      // Also clear any seller-specific product caches
      this.clearSellerProductsCache();

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

      // Add product data - backend now expects seller_id
      formData.append('seller_id', productData.seller_id);
      formData.append('title', productData.title);
      formData.append('description', productData.description || '');
      formData.append('price', parseFloat(productData.price));
      formData.append('delivery_possible', productData.delivery_possible || false);
      formData.append('pickup_location', productData.pickup_location || '');
      formData.append('wood_type_id', productData.wood_type_id);
      formData.append('volume', parseFloat(productData.volume || 0));

      // Add board dimensions - convert from meters to millimeters for API
      const boardHeightMm = boardHeight * 1000;
      const boardLengthMm = boardLength * 1000;
      formData.append('board_height', boardHeightMm);
      formData.append('board_length', boardLengthMm);

      if (process.env.NODE_ENV === 'development') {
        console.log('Creating product with image analysis...');
        console.log(`Product: ${productData.title}`);
        console.log(`Image: ${imageFile.name}, size: ${imageFile.size} bytes`);
        console.log(`Board dimensions: ${boardHeight}m x ${boardLength}m (${boardHeightMm}mm x ${boardLengthMm}mm)`);
      }

      const response = await api.post('/api/v1/products/with-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutes timeout for complete workflow
      });

      // Clear products cache to force refresh
      cache.delete('all_products');
      this.clearSellerProductsCache();

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
      this.clearSellerProductsCache();

      return response.data;
    } catch (error) {
      console.error('Failed to update product:', error.response?.data || error.message);
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

      // Add board dimensions if provided - convert from meters to millimeters for API
      if (boardHeight) {
        const boardHeightMm = boardHeight * 1000;
        formData.append('board_height', boardHeightMm.toString());
      }
      if (boardLength) {
        const boardLengthMm = boardLength * 1000;
        formData.append('board_length', boardLengthMm.toString());
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
          if (boardHeight && boardLength) {
            const boardHeightMm = boardHeight * 1000;
            const boardLengthMm = boardLength * 1000;
            console.log(`Board dimensions: ${boardHeight}m x ${boardLength}m (${boardHeightMm}mm x ${boardLengthMm}mm)`);
          }
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
      this.clearSellerProductsCache();

      if (process.env.NODE_ENV === 'development') {
        console.log('Product updated successfully with image analysis:', response.data);
      }

      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to update product with image:', error.response?.data || error.message);
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
      this.clearSellerProductsCache();

      return response.data;
    } catch (error) {
      console.error('Failed to delete product:', error.response?.data || error.message);
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

      // Use the dedicated backend endpoint for seller chats
      const response = await api.get(`/api/v1/chat-threads/by-seller/${sellerId}`);
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
      // Ensure seller exists before creating message
      if (messageData.seller_id) {
        await this.ensureSellerExists(messageData.seller_id);
      }

      // Генерируем UUID если не передан
      const payload = messageData.id ? messageData : withUUID(messageData, ENTITY_TYPES.CHAT_MESSAGE);
      const response = await api.post('/api/v1/chat-messages', payload);
      return response.data;
    } catch (error) {
      console.error('Failed to send message:', error.response?.data || error.message);
      throw error;
    }
  },

  async createChatThread(threadData) {
    // Генерируем UUID если не передан
    const payload = threadData.id ? threadData : withUUID(threadData, ENTITY_TYPES.CHAT_THREAD);
    const response = await api.post('/api/v1/chat-threads', payload);
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
      console.error('Failed to start chat with seller:', error.response?.data || error.message);
      throw error;
    }
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
        console.error('Image processing failed:', error.response?.data || error.message);
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

  // Create product with image using new backend API (replaces old with-analysis)
  async createProductWithAnalysis(productData, imageFile) {
    try {
      const formData = new FormData();

      // Add all product fields as per ProductWithImageInputDTO
      formData.append('seller_id', productData.seller_id);
      formData.append('title', productData.title);
      // Ensure description is appended only if it exists and is not an empty string
      if (productData.description && String(productData.description).trim() !== '') {
        formData.append('description', productData.description);
      }
      formData.append('wood_type_id', productData.wood_type_id);
      formData.append('board_height', productData.board_height); // Expected in mm
      formData.append('board_length', productData.board_length); // Expected in mm
      formData.append('volume', productData.volume);
      formData.append('price', productData.price);
      formData.append('delivery_possible', productData.delivery_possible);
      // Ensure pickup_location is appended only if it exists and is not an empty string
      if (productData.pickup_location && String(productData.pickup_location).trim() !== '') {
        formData.append('pickup_location', productData.pickup_location);
      }

      // Ensure imageFile is present before appending
      if (imageFile) {
        formData.append('image', imageFile);
      } else {
        // This case should ideally be handled by form validation before calling the API
        const errorMsg = 'Image file is required to create a product with an image.';
        if (process.env.NODE_ENV === 'development') {
            console.error(errorMsg + ' Product data:', productData);
        }
        throw new Error(errorMsg);
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('Creating product with image. Product data:', JSON.stringify(productData, null, 2));
        console.log('Image file:', imageFile ? { name: imageFile.name, size: imageFile.size, type: imageFile.type } : 'No image file provided (this should not happen if error handling above is correct)');
        console.log('FormData entries:');
        for (let pair of formData.entries()) {
          if (pair[1] instanceof File) {
            console.log(`${pair[0]}: ${pair[1].name} (size: ${pair[1].size}, type: ${pair[1].type})`);
          } else {
            console.log(`${pair[0]}: ${pair[1]}`);
          }
        }
      }

      const response = await api.post('/api/v1/products/with-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // Keep existing timeout, suitable for image uploads
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('Product created with image successfully:', response.data);
      }

      // Clear products cache to force refresh
      cache.delete('all_products');
      this.clearSellerProductsCache(); // Ensure any seller-specific caches are also cleared

      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to create product with image:', error);
        if (error.response) {
          console.error('Error response data:', JSON.stringify(error.response.data, null, 2));
          console.error('Error response status:', error.response.status);
          console.error('Error response headers:', JSON.stringify(error.response.headers, null, 2));
        } else if (error.request) {
          console.error('Error request (no response received):', error.request);
        } else {
          console.error('Error message (setup issue):', error.message);
        }
      }

      let errorMessage = 'Product creation with image failed. ';
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage += error.response.data.detail.map(err => {
            const loc = err.loc && err.loc.length > 1 ? err.loc[1] : (err.loc ? err.loc[0] : 'field');
            return `${loc}: ${err.msg}`;
          }).join('; ');
        } else if (typeof error.response.data.detail === 'string') {
          errorMessage += error.response.data.detail;
        } else {
          errorMessage += JSON.stringify(error.response.data.detail);
        }
      } else if (error.message) {
        errorMessage += error.message;
      }
      throw new Error(errorMessage);
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

      // Only log in development for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log(`Seller Board Analysis: Sending request to ${API_BASE_URL}/api/v1/wooden-boards/calculate-volume`);
        console.log(`Board dimensions: height=${heightInMm}mm, length=${lengthInMm}mm`);
      }

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

      if (process.env.NODE_ENV === 'development') {
        console.log('Board analysis response:', response.data);
      }
      return response.data;
    } catch (error) {
      console.error('Failed to analyze wooden board:', error.response?.data || error.message);
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

  // Image management
  async getAllImages() {
    try {
      const response = await api.get('/api/v1/images');
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('Failed to get all images:', error);
      return [];
    }
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

  // Get wooden boards detected in image
  async getImageBoards(imageId) {
    try {
      const response = await api.get(`/api/v1/images/${imageId}/boards`);
      return response.data; // Прямой список, не обернутый в data
    } catch (error) {
      console.error('Failed to get image boards:', error);
      return [];
    }
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

  // Export products to various formats
  async exportProducts(products, format = 'csv', fields = []) {
    try {
      // Prepare data for export
      const exportData = products.map(product => {
        const row = {};

        fields.forEach(field => {
          switch (field) {
            case 'title':
              row['Название'] = product.title;
              break;
            case 'volume':
              row['Объем (м³)'] = product.volume;
              break;
            case 'price':
              row['Цена (₽)'] = product.price;
              break;
            case 'wood_type':
              row['Тип древесины'] = product.wood_type_name || 'Неизвестно';
              break;
            case 'delivery_possible':
              row['Доставка'] = product.delivery_possible ? 'Да' : 'Нет';
              break;
            case 'created_at':
              row['Дата создания'] = new Date(product.created_at).toLocaleDateString('ru-RU');
              break;
            case 'description':
              row['Описание'] = product.descrioption || product.description || '';
              break;
            case 'pickup_location':
              row['Адрес самовывоза'] = product.pickup_location || '';
              break;
            default:
              row[field] = product[field] || '';
          }
        });

        return row;
      });

      // Generate file based on format
      let blob, filename;

      switch (format) {
        case 'csv':
          const csvContent = this.convertToCSV(exportData);
          blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          filename = `products_${new Date().toISOString().split('T')[0]}.csv`;
          break;

        case 'json':
          const jsonContent = JSON.stringify(exportData, null, 2);
          blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
          filename = `products_${new Date().toISOString().split('T')[0]}.json`;
          break;

        case 'xlsx':
          // For XLSX, we'll use a simple CSV format for now
          // In a real app, you'd use a library like xlsx or exceljs
          const xlsxContent = this.convertToCSV(exportData);
          blob = new Blob([xlsxContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
          filename = `products_${new Date().toISOString().split('T')[0]}.xlsx`;
          break;

        default:
          throw new Error(`Unsupported export format: ${format}`);
      }

      // Download file
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return { success: true, filename };
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  },

  // Convert data to CSV format
  convertToCSV(data) {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');

    const csvRows = data.map(row =>
      headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma or quote
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    );

    return [csvHeaders, ...csvRows].join('\n');
  },
};

export default api;