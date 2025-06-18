import Keycloak from 'keycloak-js';

// Initialize Keycloak instance with placeholder values
// These values will need to be configured in your Keycloak server
// and updated here or through environment variables.
const keycloak = new Keycloak({
  url: 'YOUR_KEYCLOAK_SERVER_URL', // e.g., 'http://localhost:8080/auth' or 'https://your-domain.com/auth'
  realm: 'YOUR_KEYCLOAK_REALM',    // The name of your Keycloak realm
  clientId: 'YOUR_KEYCLOAK_CLIENT_ID', // The client ID for your frontend application
});

export default keycloak;
