// This file contains utility functions related to authentication.
// Primary authentication logic, including Keycloak instance management and user profile,
// is handled within AuthContext.js.
// API service token management is handled by updateApiToken in services/api.js.

/**
 * Creates Authorization headers if a Keycloak instance with a valid token is provided.
 * @param {object} keycloak - An active Keycloak instance.
 * @returns {object} Headers object with an Authorization token, or an empty object if not available.
 */
export const getAuthHeaders = (keycloak) => {
  if (keycloak && keycloak.authenticated && keycloak.token) {
    return { 'Authorization': `Bearer ${keycloak.token}` };
  }
  return {};
};

// Note: The main mechanism for adding auth tokens to API requests is now handled by
// `updateApiToken` in `services/api.js`, which is called from `AuthContext`
// when the Keycloak token is available or refreshed. The `apiService` instance
// then uses this token by default for its requests.
//
// The `getAuthHeaders` function above can still be useful if there's a need to
// manually construct headers with a Keycloak token outside of the default `apiService` flow.
