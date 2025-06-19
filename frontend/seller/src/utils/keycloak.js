// Create frontend/seller/src/utils/keycloak.js
import Keycloak from 'keycloak-js';

// Configuration for the Seller realm
const keycloakConfig = {
  realm: 'SellerRealm', // Ensure this matches your Keycloak Seller realm name
  url: process.env.REACT_APP_KEYCLOAK_URL || 'http://localhost:8080/auth', // Keycloak server URL
  clientId: process.env.REACT_APP_KEYCLOAK_SELLER_CLIENT_ID || 'seller-app-client', // Keycloak client ID for seller app
};

const keycloakInstance = new Keycloak(keycloakConfig);

export default keycloakInstance;
