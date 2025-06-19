# Keycloak Frontend Configuration

The buyer frontend application integrates with Keycloak for authentication. This document outlines how the frontend is configured and what is expected on the Keycloak server.

## Frontend Keycloak Configuration (`frontend/buyer/src/keycloak.js`)

Keycloak connection parameters are no longer defined in `public/keycloak.json`. Instead, they are centralized in `frontend/buyer/src/keycloak.js`. This file an initializes a Keycloak instance with the following configuration precedence:

1.  **Runtime Configuration (`public/config.js`):**
    *   If a `config.js` file is present in the `public` directory at runtime, it can define a `window.runtimeConfig` object.
    *   Properties in `window.runtimeConfig` (e.g., `REACT_APP_KEYCLOAK_URL`) will override other settings.
    *   This allows for deploying the same build to different environments with unique Keycloak settings by providing a specific `config.js`.
    *   (See `public/config.sample.js` for an example).

2.  **Build-Time Environment Variables:**
    *   Standard Create React App environment variables (prefixed with `REACT_APP_`) are the primary way to set configuration for different build environments (development, staging, production).
    *   These are baked into the application at build time if not overridden by `window.runtimeConfig`.
    *   The key variables are:
        *   `REACT_APP_KEYCLOAK_URL`: Base URL of the Keycloak server (e.g., `http://localhost:8080` or `https://keycloak.example.com`).
        *   `REACT_APP_KEYCLOAK_REALM`: The Keycloak realm name (e.g., `BuyerRealm`).
        *   `REACT_APP_KEYCLOAK_CLIENT_ID`: The Client ID for the buyer frontend application (e.g., `buyer-frontend`).

3.  **Hardcoded Defaults (in `src/keycloak.js`):**
    *   If neither runtime configuration nor environment variables are set, the application falls back to default values defined directly in `src/keycloak.js`.
    *   Defaults:
        *   URL: `http://localhost:8080`
        *   Realm: `BuyerRealm`
        *   Client ID: `buyer-frontend`

**It is strongly recommended to use environment variables for configuring Keycloak parameters for your deployments.**

## Keycloak Server Setup Checklist:

To ensure the frontend works, please verify the following on your Keycloak server. These server-side settings must align with the configuration provided to the frontend (via environment variables or `config.js`):

1.  **Realm Exists:** A realm corresponding to `REACT_APP_KEYCLOAK_REALM` is created (e.g., `BuyerRealm`).
2.  **Client Exists:**
    *   A client with Client ID corresponding to `REACT_APP_KEYCLOAK_CLIENT_ID` (e.g., `buyer-frontend`) is created within the specified realm.
    *   **Access Type:** The client should be configured as `public`.
    *   **Valid Redirect URIs:** Ensure that the redirect URIs for the client in Keycloak include all URLs where your buyer frontend application will be running and expect callbacks. For example:
        *   `http://localhost:3000/*` (for local development if Create React App runs on port 3000)
        *   `https://your-buyer-frontend-domain.com/*` (for production)
    *   **Web Origins:** Configure appropriate web origins to allow CORS requests if needed (e.g., `+` for wildcard during development, or specific domains like `http://localhost:3000`, `https://your-buyer-frontend-domain.com` for production).
3.  **Users:** Users are created within the realm that are permitted to log in via this client.

## User Profile Synchronization and Auto-Registration

After a successful authentication via Keycloak, the buyer frontend application performs an additional step to synchronize the user's application-specific profile.

1.  **Profile Endpoint:** The frontend makes a `GET` request to `/api/v1/buyers/me/profile`. This request is authenticated using the Keycloak JWT obtained upon login.
2.  **Backend Logic:**
    *   The backend service at this endpoint is responsible for identifying the user based on their Keycloak ID (typically the `sub` claim from the JWT).
    *   If a corresponding buyer profile exists in the application's database, it is returned.
    *   **Auto-Registration:** If no such profile exists, the backend is expected to automatically create a new buyer profile, associate it with the user's Keycloak ID, and populate initial details (e.g., from token claims like `preferred_username`, `email`, `name`). The newly created profile is then returned.
3.  **Frontend State:** The fetched or newly created profile data (including the internal application `buyer_id` or `id` for the buyer entity) is then stored in the frontend's `AuthContext` and used throughout the application.

This process ensures a seamless experience for new users by automatically creating an application profile upon their first login via Keycloak. It also keeps user data synchronized between Keycloak and the application on subsequent logins or token refreshes if the profile endpoint is designed to update existing profiles.

**If you modify the Keycloak server URL, realm name, or client ID, ensure these changes are reflected in the frontend's environment variables or runtime configuration.**
