import api from './api';

/**
 * Service for handling product-related API calls
 */
const productService = {
  /**
   * Create a new product
   * @param {object} productData - The product data
   * @returns {Promise} - The API response
   */
  createProduct: async (productData) => {
    try {
      const response = await api.post('/products/', productData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get product by ID
   * @param {string} productId - The product's ID
   * @returns {Promise} - The API response
   */
  getProductById: async (productId) => {
    try {
      const response = await api.get(`/products/${productId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update product information
   * @param {string} productId - The product's ID
   * @param {object} data - The data to update
   * @returns {Promise} - The API response
   */
  updateProduct: async (productId, data) => {
    try {
      const response = await api.patch(`/products/${productId}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete a product
   * @param {string} productId - The product's ID
   * @returns {Promise} - The API response
   */
  deleteProduct: async (productId) => {
    try {
      const response = await api.delete(`/products/${productId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all products with pagination
   * @param {number} offset - Pagination offset
   * @param {number} limit - Pagination limit
   * @returns {Promise} - The API response
   */
  getAllProducts: async (offset = 0, limit = 20) => {
    try {
      const response = await api.get(`/products/?offset=${offset}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get products by seller ID with pagination
   * @param {string} sellerId - The seller's ID
   * @param {number} offset - Pagination offset
   * @param {number} limit - Pagination limit
   * @returns {Promise} - The API response
   */
  getProductsBySellerId: async (sellerId, offset = 0, limit = 20) => {
    try {
      // This is a hypothetical endpoint, adjust according to your actual API
      const response = await api.get(`/products/?seller_id=${sellerId}&offset=${offset}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default productService;
