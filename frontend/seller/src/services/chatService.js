import api from './api';

/**
 * Service for handling chat-related API calls
 */
const chatService = {
  /**
   * Get all chat threads for a seller with pagination
   * @param {string} sellerId - The seller's ID
   * @param {number} offset - Pagination offset
   * @param {number} limit - Pagination limit
   * @returns {Promise} - The API response
   */
  getSellerChatThreads: async (sellerId, offset = 0, limit = 20) => {
    try {
      // This is a hypothetical endpoint, adjust according to your actual API
      const response = await api.get(`/chat-threads/?seller_id=${sellerId}&offset=${offset}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get chat thread by ID
   * @param {string} threadId - The thread's ID
   * @returns {Promise} - The API response
   */
  getChatThreadById: async (threadId) => {
    try {
      const response = await api.get(`/chat-threads/${threadId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create a new chat thread
   * @param {object} threadData - The thread data
   * @returns {Promise} - The API response
   */
  createChatThread: async (threadData) => {
    try {
      const response = await api.post('/chat-threads/', threadData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get messages for a chat thread with pagination
   * @param {string} threadId - The thread's ID
   * @param {number} offset - Pagination offset
   * @param {number} limit - Pagination limit
   * @returns {Promise} - The API response
   */
  getChatMessages: async (threadId, offset = 0, limit = 20) => {
    try {
      // This is a hypothetical endpoint, adjust according to your actual API
      const response = await api.get(`/chat-messages/?thread_id=${threadId}&offset=${offset}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Send a message in a chat thread
   * @param {object} messageData - The message data
   * @returns {Promise} - The API response
   */
  sendMessage: async (messageData) => {
    try {
      const response = await api.post('/chat-messages/', messageData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Mark messages as read by seller
   * @param {string} messageId - The message's ID
   * @returns {Promise} - The API response
   */
  markMessageAsReadBySeller: async (messageId) => {
    try {
      const response = await api.patch(`/chat-messages/${messageId}`, {
        is_read_by_seller: true
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default chatService;
