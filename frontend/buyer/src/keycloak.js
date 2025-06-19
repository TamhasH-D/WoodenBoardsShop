import Keycloak from 'keycloak-js';

// Attempt to load config from a global object if defined by a config script,
// otherwise use environment variables with defaults.
// This allows for runtime configuration via a config.js file in public folder,
// overriding build-time environment variables.
const runtimeConfig = window.runtimeConfig || {};

const keycloakConfig = {
  url: "https://keycloak.taruman.ru",
  realm: 'BuyerRealm',
  clientId: 'BuyerRealm',
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;
