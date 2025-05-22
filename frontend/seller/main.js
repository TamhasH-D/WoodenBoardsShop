import config from './config.js';
import ApiService from './apiService.js';

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Продавцы загружены');

  // Initialize API service with base URL from config
  const apiService = new ApiService(config.api.baseURL);

  try {
    // Example: Fetch all sellers
    const sellers = await apiService.getAllSellers();
    console.log('Sellers:', sellers);

    // You can now use the sellers data to populate your UI
  } catch (error) {
    console.error('Error fetching sellers:', error);
  }
});
