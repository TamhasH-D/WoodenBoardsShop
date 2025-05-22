import api from './api';

/**
 * Service for handling seller-related API calls
 */
const sellerService = {
  /**
   * Get seller by ID
   * @param {string} sellerId - The seller's ID
   * @returns {Promise} - The API response
   */
  getSellerById: async (sellerId) => {
    try {
      const response = await api.get(`/sellers/${sellerId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update seller information
   * @param {string} sellerId - The seller's ID
   * @param {object} data - The data to update
   * @returns {Promise} - The API response
   */
  updateSeller: async (sellerId, data) => {
    try {
      const response = await api.patch(`/sellers/${sellerId}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Toggle seller online status
   * @param {string} sellerId - The seller's ID
   * @param {boolean} isOnline - The new online status
   * @returns {Promise} - The API response
   */
  toggleOnlineStatus: async (sellerId, isOnline) => {
    try {
      const response = await api.patch(`/sellers/${sellerId}`, { is_online: isOnline });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all sellers with pagination
   * @param {number} offset - Pagination offset
   * @param {number} limit - Pagination limit
   * @returns {Promise} - The API response
   */
  getAllSellers: async (offset = 0, limit = 20) => {
    try {
      const response = await api.get(`/sellers/?offset=${offset}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default sellerService;
