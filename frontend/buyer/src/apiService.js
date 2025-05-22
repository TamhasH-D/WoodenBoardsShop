import config from './config';

class ApiService {
  constructor() {
    this.baseURL = config.api.baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `API request failed with status ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error(`API Error: ${error.message}`);
      throw error;
    }
  }

  // Helper method for common request options
  getRequestOptions(method, data = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    return options;
  }

  // Pagination helper
  getPaginationParams(offset = 0, limit = 20) {
    return `?offset=${offset}&limit=${limit}`;
  }

  // ==================== PRODUCTS API ====================
  async getProducts(offset = 0, limit = 20) {
    return this.request(`/products/${this.getPaginationParams(offset, limit)}`);
  }

  async getProduct(id) {
    return this.request(`/products/${id}`);
  }

  async createProduct(data) {
    return this.request('/products/', this.getRequestOptions('POST', data));
  }

  async updateProduct(id, data) {
    return this.request(`/products/${id}`, this.getRequestOptions('PATCH', data));
  }

  async deleteProduct(id) {
    return this.request(`/products/${id}`, this.getRequestOptions('DELETE'));
  }

  // ==================== WOOD TYPES API ====================
  async getWoodTypes(offset = 0, limit = 20) {
    return this.request(`/wood_types/${this.getPaginationParams(offset, limit)}`);
  }

  async getWoodType(id) {
    return this.request(`/wood_types/${id}`);
  }

  async createWoodType(data) {
    return this.request('/wood_types/', this.getRequestOptions('POST', data));
  }

  async updateWoodType(id, data) {
    return this.request(`/wood_types/${id}`, this.getRequestOptions('PATCH', data));
  }

  async deleteWoodType(id) {
    return this.request(`/wood_types/${id}`, this.getRequestOptions('DELETE'));
  }

  // ==================== WOOD TYPE PRICES API ====================
  async getWoodTypePrices(offset = 0, limit = 20) {
    return this.request(`/wood_type_price/${this.getPaginationParams(offset, limit)}`);
  }

  async getWoodTypePrice(id) {
    return this.request(`/wood_type_price/${id}`);
  }

  // ==================== BUYERS API ====================
  async getBuyers(offset = 0, limit = 20) {
    return this.request(`/buyers/${this.getPaginationParams(offset, limit)}`);
  }

  async getBuyer(id) {
    return this.request(`/buyers/${id}`);
  }

  async createBuyer(data) {
    return this.request('/buyers/', this.getRequestOptions('POST', data));
  }

  async updateBuyer(id, data) {
    return this.request(`/buyers/${id}`, this.getRequestOptions('PATCH', data));
  }

  async deleteBuyer(id) {
    return this.request(`/buyers/${id}`, this.getRequestOptions('DELETE'));
  }

  // ==================== CHAT THREADS API ====================
  async getChatThreads(offset = 0, limit = 20) {
    return this.request(`/chat_threads/${this.getPaginationParams(offset, limit)}`);
  }

  async getChatThread(id) {
    return this.request(`/chat_threads/${id}`);
  }

  async createChatThread(data) {
    return this.request('/chat_threads/', this.getRequestOptions('POST', data));
  }

  // ==================== CHAT MESSAGES API ====================
  async getChatMessages(threadId, offset = 0, limit = 20) {
    return this.request(`/chat_messages/thread/${threadId}${this.getPaginationParams(offset, limit)}`);
  }

  async createChatMessage(data) {
    return this.request('/chat_messages/', this.getRequestOptions('POST', data));
  }

  // ==================== WOODEN BOARD API ====================
  async getWoodenBoards(offset = 0, limit = 20) {
    return this.request(`/wooden_board/${this.getPaginationParams(offset, limit)}`);
  }

  async getWoodenBoard(id) {
    return this.request(`/wooden_board/${id}`);
  }

  // ==================== IMAGES API ====================
  async uploadImage(formData) {
    return this.request('/image/', {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header for multipart/form-data
    });
  }

  async getImage(id) {
    return this.request(`/image/${id}`);
  }

  // ==================== HEALTH API ====================
  async checkHealth() {
    return this.request('/health/');
  }
}

export default ApiService;
