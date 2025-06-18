import keycloak from './keycloak'; // Adjust path if necessary
import { apiService } from '../services/api';

/**
 * Get current seller's Keycloak ID (subject)
 */
export const getCurrentSellerKeycloakId = () => {
  if (keycloak && keycloak.authenticated && keycloak.subject) {
    return keycloak.subject;
  }
  // This case should ideally not be reached if 'login-required' is effective
  console.warn('Attempted to get Keycloak ID, but user is not authenticated or Keycloak not initialized.');
  return null;
};

/**
 * Helper function to get seller_id from keycloak_id
 */
export const getCurrentSellerId = async () => {
  try {
    const keycloakId = getCurrentSellerKeycloakId();
    if (!keycloakId) {
      throw new Error("Keycloak user ID not available.");
    }
    const sellerResponse = await apiService.getSellerProfileByKeycloakId(keycloakId);
    return sellerResponse.data.id;
  } catch (error) {
    console.error('Failed to get internal seller_id:', error);
    // Potentially, you might want to handle this by logging the user out
    // or showing a specific error message to the user.
    // For now, re-throwing the error.
    throw error;
  }
};

// Removed resetMockAuthWarning as mock logic is gone.
// Removed MOCK_IDS import as it's no longer used.
