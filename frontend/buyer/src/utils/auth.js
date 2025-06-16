import { MOCK_IDS } from './constants';
import { apiService } from '../services/api';

// Singleton warning to prevent spam across all components
let mockAuthWarningShown = false;

/**
 * Get current buyer's Keycloak ID
 * TODO: Replace with real authentication
 */
export const getCurrentBuyerKeycloakId = () => {
  // Временно используем mock ID для разработки
  // В продакшене это должно быть заменено на реальную аутентификацию через Keycloak
  if (!mockAuthWarningShown && process.env.NODE_ENV === 'development') {
    console.warn('Using mock buyer keycloak ID for development - implement real authentication');
    mockAuthWarningShown = true;
  }
  return MOCK_IDS.BUYER_ID;
};

/**
 * Helper function to get buyer_id from keycloak_id
 */
export const getCurrentBuyerId = async () => {
  try {
    const keycloakId = getCurrentBuyerKeycloakId();
    const buyerResponse = await apiService.getBuyerProfileByKeycloakId(keycloakId);
    return buyerResponse.data.id;
  } catch (error) {
    console.error('Failed to get buyer_id:', error);
    throw error;
  }
};

/**
 * Reset the warning flag (useful for testing)
 */
export const resetMockAuthWarning = () => {
  mockAuthWarningShown = false;
};
