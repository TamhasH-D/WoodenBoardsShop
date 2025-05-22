import config from './config.js';
import ApiService from './apiService.js';

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Админ-панель загружена');

  // Initialize API service with base URL from config
  const apiService = new ApiService(config.api.baseURL);

  try {
    // Example: Fetch all admins
    const admins = await apiService.getAllAdmins();
    console.log('Admins:', admins);

    // You can now use the admins data to populate your UI
  } catch (error) {
    console.error('Error fetching admins:', error);
  }
});
