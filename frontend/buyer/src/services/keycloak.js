import Keycloak from 'keycloak-js';

// Configuration for Keycloak (placeholders for environment variables)
// These should be configured via .env file and process.env in a real setup
const keycloakConfig = {
    url: process.env.REACT_APP_KEYCLOAK_URL || 'http://localhost:8030', // Auth server URL
    realm: process.env.REACT_APP_KEYCLOAK_REALM || 'BuyerRealm',       // Realm name
    clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID || 'buyer-frontend' // Client ID
};

const keycloak = new Keycloak(keycloakConfig);

/**
 * Initializes Keycloak instance.
 * @returns {Promise<boolean>} A promise that resolves with the authentication status.
 */
const initKeycloak = () => {
    return keycloak.init({
        onLoad: 'check-sso', // or 'login-required'
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
        pkceMethod: 'S256' // Recommended for public clients
    }).then(authenticated => {
        if (authenticated) {
            console.log("Keycloak: User is authenticated");
        } else {
            console.log("Keycloak: User is not authenticated");
        }
        return authenticated;
    }).catch(error => {
        console.error("Keycloak: init failed:", error);
        // Depending on how you want to handle errors, you might re-throw or return false
        return false;
    });
};

const login = () => {
    keycloak.login();
};

const logout = () => {
    keycloak.logout({ redirectUri: window.location.origin }); // Redirect to app home after logout
};

const getToken = () => keycloak.token;

const getTokenParsed = () => keycloak.tokenParsed;

const isLoggedIn = () => !!keycloak.token;

const updateToken = (minValidity = 5) => {
    return new Promise((resolve, reject) => {
        keycloak.updateToken(minValidity)
            .then((refreshed) => {
                if (refreshed) {
                    console.log('Token was successfully refreshed');
                } else {
                    console.log('Token is still valid');
                }
                resolve(refreshed);
            })
            .catch((error) => {
                console.error('Failed to refresh token:', error);
                reject(error);
            });
    });
};

const getUsername = () => keycloak.tokenParsed?.preferred_username;

const getKeycloakId = () => keycloak.subject; // User's Keycloak ID

const KeycloakService = {
    initKeycloak,
    login,
    logout,
    isLoggedIn,
    getToken,
    getTokenParsed,
    updateToken,
    getUsername,
    getKeycloakId,
    keycloak // Exporting the instance itself can be useful for advanced cases or event handling
};

export default KeycloakService;
