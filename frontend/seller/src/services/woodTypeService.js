import api from './api';

/**
 * Service for handling wood type-related API calls
 */
const woodTypeService = {
  /**
   * Get all wood types with pagination
   * @param {number} offset - Pagination offset
   * @param {number} limit - Pagination limit
   * @returns {Promise} - The API response
   */
  getAllWoodTypes: async (offset = 0, limit = 20) => {
    try {
      const response = await api.get(`/wood_types/?offset=${offset}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get wood type by ID
   * @param {string} woodTypeId - The wood type's ID
   * @returns {Promise} - The API response
   */
  getWoodTypeById: async (woodTypeId) => {
    try {
      const response = await api.get(`/wood_types/${woodTypeId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create a new wood type
   * @param {object} woodTypeData - The wood type data
   * @returns {Promise} - The API response
   */
  createWoodType: async (woodTypeData) => {
    try {
      const response = await api.post('/wood_types/', woodTypeData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update wood type information
   * @param {string} woodTypeId - The wood type's ID
   * @param {object} data - The data to update
   * @returns {Promise} - The API response
   */
  updateWoodType: async (woodTypeId, data) => {
    try {
      const response = await api.patch(`/wood_types/${woodTypeId}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete a wood type
   * @param {string} woodTypeId - The wood type's ID
   * @returns {Promise} - The API response
   */
  deleteWoodType: async (woodTypeId) => {
    try {
      const response = await api.delete(`/wood_types/${woodTypeId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default woodTypeService;
