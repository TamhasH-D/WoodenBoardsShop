import Keycloak from 'keycloak-js';

// Read Keycloak configuration from environment variables
const keycloakConfig = {
  url: process.env.REACT_APP_KEYCLOAK_URL || 'http://localhost:8080/auth', // Default for local development
  realm: process.env.REACT_APP_KEYCLOAK_REALM || 'myrealm',
  clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID || 'myclient',
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;
