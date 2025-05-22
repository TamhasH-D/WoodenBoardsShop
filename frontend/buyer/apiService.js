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

  // Buyer-related API calls
  async getBuyer(id) {
    return this.request(`/buyer/${id}`);
  }

  async getAllBuyers() {
    return this.request('/buyer');
  }

  async createBuyer(data) {
    return this.request('/buyer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  async updateBuyer(id, data) {
    return this.request(`/buyer/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  async deleteBuyer(id) {
    return this.request(`/buyer/${id}`, {
      method: 'DELETE',
    });
  }

  // Add more API methods as needed
}

export default ApiService;