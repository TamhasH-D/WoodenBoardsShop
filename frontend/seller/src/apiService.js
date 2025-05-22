import config from './config.js';

class ApiService {
  constructor() {
    this.baseURL = config.api.baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}/api/v1${endpoint}`;
    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  }

  // Seller-related API calls
  async getSeller(id) {
    return this.request(`/seller/${id}`);
  }

  async getAllSellers() {
    return this.request('/seller');
  }

  async createSeller(data) {
    return this.request('/seller', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  async updateSeller(id, data) {
    return this.request(`/seller/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  async deleteSeller(id) {
    return this.request(`/seller/${id}`, {
      method: 'DELETE',
    });
  }

  // Add more API methods as needed
}

export default ApiService;