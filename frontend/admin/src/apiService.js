import config from './config.js';
import axios from 'axios';

class ApiService {
  constructor() {
    this.baseURL = config.api.baseURL;
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for authentication
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  // Generic API methods
  async get(endpoint, params = {}) {
    try {
      const response = await this.api.get(endpoint, { params });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async post(endpoint, data) {
    try {
      const response = await this.api.post(endpoint, data);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async patch(endpoint, data) {
    try {
      const response = await this.api.patch(endpoint, data);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async delete(endpoint) {
    try {
      const response = await this.api.delete(endpoint);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', error.response.data);
      throw new Error(error.response.data.message || 'API request failed');
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API Error Request:', error.request);
      throw new Error('No response from server');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Error:', error.message);
      throw new Error(error.message);
    }
  }

  // Wood Types API
  async getWoodTypes(params = {}) {
    return this.get('/wood_types/', params);
  }

  async getWoodType(id) {
    return this.get(`/wood_types/${id}`);
  }

  async createWoodType(data) {
    return this.post('/wood_types/', data);
  }

  async updateWoodType(id, data) {
    return this.patch(`/wood_types/${id}`, data);
  }

  async deleteWoodType(id) {
    return this.delete(`/wood_types/${id}`);
  }

  // Chat Messages API
  async getChatMessages(params = {}) {
    return this.get('/chat-messages/', params);
  }

  async getChatMessage(id) {
    return this.get(`/chat-messages/${id}`);
  }

  async createChatMessage(data) {
    return this.post('/chat-messages/', data);
  }

  async updateChatMessage(id, data) {
    return this.patch(`/chat-messages/${id}`, data);
  }

  async deleteChatMessage(id) {
    return this.delete(`/chat-messages/${id}`);
  }

  // Chat Threads API
  async getChatThreads(params = {}) {
    return this.get('/chat-threads/', params);
  }

  async getChatThread(id) {
    return this.get(`/chat-threads/${id}`);
  }

  async createChatThread(data) {
    return this.post('/chat-threads/', data);
  }

  async updateChatThread(id, data) {
    return this.patch(`/chat-threads/${id}`, data);
  }

  async deleteChatThread(id) {
    return this.delete(`/chat-threads/${id}`);
  }

  // Buyers API
  async getBuyers(params = {}) {
    return this.get('/buyers/', params);
  }

  async getBuyer(id) {
    return this.get(`/buyers/${id}`);
  }

  async createBuyer(data) {
    return this.post('/buyers/', data);
  }

  async updateBuyer(id, data) {
    return this.patch(`/buyers/${id}`, data);
  }

  async deleteBuyer(id) {
    return this.delete(`/buyers/${id}`);
  }

  // Products API
  async getProducts(params = {}) {
    return this.get('/products/', params);
  }

  async getProduct(id) {
    return this.get(`/products/${id}`);
  }

  async createProduct(data) {
    return this.post('/products/', data);
  }

  async updateProduct(id, data) {
    return this.patch(`/products/${id}`, data);
  }

  async deleteProduct(id) {
    return this.delete(`/products/${id}`);
  }

  // Sellers API
  async getSellers(params = {}) {
    return this.get('/sellers/', params);
  }

  async getSeller(id) {
    return this.get(`/sellers/${id}`);
  }

  async createSeller(data) {
    return this.post('/sellers/', data);
  }

  async updateSeller(id, data) {
    return this.patch(`/sellers/${id}`, data);
  }

  async deleteSeller(id) {
    return this.delete(`/sellers/${id}`);
  }

  // Wooden Boards API
  async getWoodenBoards(params = {}) {
    return this.get('/wooden-boards/', params);
  }

  async getWoodenBoard(id) {
    return this.get(`/wooden-boards/${id}`);
  }

  async createWoodenBoard(data) {
    return this.post('/wooden-boards/', data);
  }

  async updateWoodenBoard(id, data) {
    return this.patch(`/wooden-boards/${id}`, data);
  }

  async deleteWoodenBoard(id) {
    return this.delete(`/wooden-boards/${id}`);
  }

  // Wood Type Prices API
  async getWoodTypePrices(params = {}) {
    return this.get('/wood-type-prices/', params);
  }

  async getWoodTypePrice(id) {
    return this.get(`/wood-type-prices/${id}`);
  }

  async createWoodTypePrice(data) {
    return this.post('/wood-type-prices/', data);
  }

  async updateWoodTypePrice(id, data) {
    return this.patch(`/wood-type-prices/${id}`, data);
  }

  async deleteWoodTypePrice(id) {
    return this.delete(`/wood-type-prices/${id}`);
  }

  // Images API
  async getImages(params = {}) {
    return this.get('/images/', params);
  }

  async getImage(id) {
    return this.get(`/images/${id}`);
  }

  async createImage(data) {
    return this.post('/images/', data);
  }

  async updateImage(id, data) {
    return this.patch(`/images/${id}`, data);
  }

  async deleteImage(id) {
    return this.delete(`/images/${id}`);
  }

  // Health Check API
  async checkHealth() {
    return this.get('/health');
  }
}

export default new ApiService();
