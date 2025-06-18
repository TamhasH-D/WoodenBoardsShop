import Keycloak from 'keycloak-js';

// Initialize Keycloak instance with placeholder values
// These values will need to be configured in your Keycloak server
// and updated here or through environment variables.
const keycloak = new Keycloak({
  url: 'https://keycloak.taruman.ru', // e.g., 'http://localhost:8080/auth' or 'https://your-domain.com/auth'
  realm: 'SellerRealm',    // The name of your Keycloak realm
  clientId: 'SellerRealm', // The client ID for your frontend application
});

export default keycloak;
