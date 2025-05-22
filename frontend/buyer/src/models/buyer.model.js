/**
 * Buyer model based on the API documentation
 */

/**
 * Transforms raw buyer data from the API to a format usable by the frontend
 * @param {Object} data - Raw buyer data from the API
 * @returns {Object} - Transformed buyer data
 */
export const transformBuyerData = (data) => {
  if (!data) return null;
  
  return {
    id: data.id,
    keycloakUuid: data.keycloak_uuid,
    isOnline: data.is_online,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

/**
 * Transforms frontend buyer data to the format expected by the API
 * @param {Object} buyer - Frontend buyer data
 * @returns {Object} - Buyer data formatted for the API
 */
export const transformBuyerForApi = (buyer) => {
  return {
    id: buyer.id,
    keycloak_uuid: buyer.keycloakUuid,
    is_online: buyer.isOnline,
  };
};

/**
 * Transforms a list of buyers from the API
 * @param {Array} buyers - List of buyers from the API
 * @returns {Array} - Transformed buyer list
 */
export const transformBuyerList = (buyers) => {
  if (!buyers || !Array.isArray(buyers)) return [];
  
  return buyers.map(buyer => transformBuyerData(buyer));
};

/**
 * Default empty buyer object
 */
export const emptyBuyer = {
  id: '',
  keycloakUuid: '',
  isOnline: false,
};
