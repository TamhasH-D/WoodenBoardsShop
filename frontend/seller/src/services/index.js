import apiService from '../apiService';

// Seller Service
export const sellerService = {
  // Get seller by ID
  async getSellerById(id) {
    try {
      const response = await apiService.getSeller(id);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error fetching seller:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Update seller
  async updateSeller(id, data) {
    try {
      const response = await apiService.updateSeller(id, data);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error updating seller:', error);
      throw error;
    }
  },

  // Toggle online status
  async toggleOnlineStatus(id, isOnline) {
    try {
      const response = await apiService.updateSeller(id, { is_online: isOnline });
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error toggling online status:', error);
      throw error;
    }
  },

  // Get seller products
  async getSellerProducts(sellerId, options = {}) {
    try {
      const filters = { seller_id: sellerId, ...options.filters };
      const response = await apiService.getProducts({ ...options, filters });
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error fetching seller products:', error);
      throw error;
    }
  },

  // Get seller dashboard stats
  async getDashboardStats(sellerId) {
    try {
      const response = await apiService.getSellerDashboardStats(sellerId);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        success: false,
        data: {
          products: 0,
          messages: 0,
          orders: 0,
          revenue: 0
        }
      };
    }
  }
};

// Product Service
export const productService = {
  // Get all products
  async getProducts(options = {}) {
    try {
      const response = await apiService.getProducts(options);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get product by ID
  async getProductById(id) {
    try {
      const response = await apiService.getProduct(id);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  // Create product
  async createProduct(data) {
    try {
      const response = await apiService.createProduct(data);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Update product
  async updateProduct(id, data) {
    try {
      const response = await apiService.updateProduct(id, data);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Delete product
  async deleteProduct(id) {
    try {
      const response = await apiService.deleteProduct(id);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
};

// Wood Types Service
export const woodTypeService = {
  // Get all wood types
  async getWoodTypes(options = {}) {
    try {
      const response = await apiService.getWoodTypes(options);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error fetching wood types:', error);
      throw error;
    }
  },

  // Get wood type by ID
  async getWoodTypeById(id) {
    try {
      const response = await apiService.getWoodType(id);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error fetching wood type:', error);
      throw error;
    }
  }
};

// Chat Service
export const chatService = {
  // Get chat threads
  async getChatThreads(options = {}) {
    try {
      const response = await apiService.getChatThreads(options);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error fetching chat threads:', error);
      throw error;
    }
  },

  // Get chat messages
  async getChatMessages(options = {}) {
    try {
      const response = await apiService.getChatMessages(options);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      throw error;
    }
  },

  // Create chat message
  async createChatMessage(data) {
    try {
      const response = await apiService.createChatMessage(data);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error creating chat message:', error);
      throw error;
    }
  }
};

// Export all services
export default {
  sellerService,
  productService,
  woodTypeService,
  chatService
};
