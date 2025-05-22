import config from './config.js';
import ApiService from './apiService.js';

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Покупатели загружены');

  // Initialize API service with base URL from config
  const apiService = new ApiService(config.api.baseURL);

  try {
    // Example: Fetch all buyers
    const buyers = await apiService.getAllBuyers();
    console.log('Buyers:', buyers);

    // You can now use the buyers data to populate your UI
  } catch (error) {
    console.error('Error fetching buyers:', error);
  }
});
