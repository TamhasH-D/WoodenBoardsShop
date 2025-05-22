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

  // Admin-related API calls
  async getAdmin(id) {
    return this.request(`/admin/${id}`);
  }

  async getAllAdmins() {
    return this.request('/admin');
  }

  async createAdmin(data) {
    return this.request('/admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  async updateAdmin(id, data) {
    return this.request(`/admin/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  async deleteAdmin(id) {
    return this.request(`/admin/${id}`, {
      method: 'DELETE',
    });
  }

  // Add more API methods as needed
}

export default ApiService;