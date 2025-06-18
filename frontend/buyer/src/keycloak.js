import Keycloak from 'keycloak-js';

// Attempt to load config from a global object if defined by a config script,
// otherwise use environment variables with defaults.
// This allows for runtime configuration via a config.js file in public folder,
// overriding build-time environment variables.
const runtimeConfig = window.runtimeConfig || {};

const keycloakConfig = {
  url: runtimeConfig.REACT_APP_KEYCLOAK_URL || process.env.REACT_APP_KEYCLOAK_URL || 'http://localhost:8080',
  realm: runtimeConfig.REACT_APP_KEYCLOAK_REALM || process.env.REACT_APP_KEYCLOAK_REALM || 'BuyerRealm',
  clientId: runtimeConfig.REACT_APP_KEYCLOAK_CLIENT_ID || process.env.REACT_APP_KEYCLOAK_CLIENT_ID || 'buyer-frontend',
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;
