import { MOCK_IDS } from './constants';
import { apiService } from '../services/api';

// Singleton warning to prevent spam across all components
let mockAuthWarningShown = false;

/**
 * Get current seller's Keycloak ID
 * TODO: Replace with real authentication
 */
export const getCurrentSellerKeycloakId = () => {
  // Временно используем mock ID для разработки
  // В продакшене это должно быть заменено на реальную аутентификацию через Keycloak
  if (!mockAuthWarningShown && process.env.NODE_ENV === 'development') {
    console.warn('Using mock seller keycloak ID for development - implement real authentication');
    mockAuthWarningShown = true;
  }
  return MOCK_IDS.SELLER_ID;
};

/**
 * Helper function to get seller_id from keycloak_id
 */
export const getCurrentSellerId = async () => {
  try {
    const keycloakId = getCurrentSellerKeycloakId();
    const sellerResponse = await apiService.getSellerProfileByKeycloakId(keycloakId);
    return sellerResponse.data.id;
  } catch (error) {
    console.error('Failed to get seller_id:', error);
    throw error;
  }
};

/**
 * Reset the warning flag (useful for testing)
 */
export const resetMockAuthWarning = () => {
  mockAuthWarningShown = false;
};
