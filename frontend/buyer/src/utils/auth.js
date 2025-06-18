import { apiService } from '../services/api';
import KeycloakService from '../services/keycloak';

/**
 * Get current buyer's Keycloak ID (subject)
 */
export const getCurrentBuyerKeycloakId = () => {
  if (KeycloakService.isLoggedIn()) {
    const keycloakId = KeycloakService.getKeycloakId(); // getKeycloakId() returns subject (user id)
    if (keycloakId) {
      return keycloakId;
    } else {
      // This case implies an issue if isLoggedIn is true but no ID.
      console.warn('User is logged in according to KeycloakService, but no Keycloak user ID (subject) was found.');
      return null;
    }
  } else {
    // User is not logged in, or Keycloak might not be fully initialized yet for calls from some contexts.
    // console.log('getCurrentBuyerKeycloakId: User not logged in or Keycloak not ready.'); // Optional: too noisy?
    return null;
  }
};

/**
 * Helper function to get the database buyer_id from the Keycloak user ID (subject).
 * This function now handles the case where keycloakId might be null.
 */
export const getCurrentBuyerId = async () => {
  try {
    const keycloakId = getCurrentBuyerKeycloakId();
    if (!keycloakId) {
      // This console.warn might be too noisy if the app often calls this for non-logged-in users.
      // Consider if this warning is valuable or if returning null silently is preferred.
      console.warn('getCurrentBuyerId: Could not retrieve Keycloak ID. User might not be logged in or Keycloak not fully initialized.');
      return null;
    }

    // The apiService.getBuyerProfileByKeycloakId function is expected to handle
    // the creation of a buyer profile if one doesn't exist for the given keycloakId.
    const buyerProfile = await apiService.getBuyerProfileByKeycloakId(keycloakId);

    // The structure of buyerProfile might vary:
    // - If fetched from API: response.data (which is buyerProfile here)
    // - If created locally by apiService (e.g., after a 404): could be the direct object.
    // Assuming apiService.getBuyerProfileByKeycloakId consistently returns the buyer object itself.
    if (buyerProfile && buyerProfile.id) {
      return buyerProfile.id;
    } else {
      console.error('getCurrentBuyerId: Buyer profile retrieved or created, but it does not contain an ID. Profile:', buyerProfile);
      return null;
    }
  } catch (error) {
    // Log the error but return null to allow parts of the app to function
    // without a buyer_id if that's acceptable (e.g., public browsing).
    console.error('getCurrentBuyerId: Error fetching or creating buyer profile by Keycloak ID:', error);
    return null;
  }
};
