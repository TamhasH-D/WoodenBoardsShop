# Keycloak Integration for Admin Frontend

This document outlines the Keycloak configuration required for the Admin Frontend application.

## Environment Variables

The Admin Frontend expects the following environment variables to be set to connect to Keycloak:

-   `REACT_APP_KEYCLOAK_URL`: The full URL to your Keycloak authentication server.
    -   Example: `http://localhost:8080/auth` or `https://your-keycloak-domain.com/auth`
-   `REACT_APP_KEYCLOAK_REALM`: The name of the Keycloak realm to use for authentication.
    -   Example: `myrealm`
-   `REACT_APP_KEYCLOAK_CLIENT_ID`: The Client ID of the Keycloak client configured for the Admin Frontend.
    -   Example: `admin-frontend-client`

These variables are typically set in a `.env` file in the `frontend/admin` directory for local development, or configured through your deployment platform for staging/production environments. Refer to `frontend/admin/.env.example` for a template.

## Keycloak Client Configuration

You need to configure a client in your Keycloak realm specifically for the Admin Frontend. Here are the essential settings:

-   **Client ID**: This must match the `REACT_APP_KEYCLOAK_CLIENT_ID` environment variable.
-   **Client Protocol**: `openid-connect`
-   **Access Type**: `public` (as the Admin Frontend is a client-side application)
-   **Standard Flow Enabled**: `ON` (This enables the authorization code flow)
-   **Implicit Flow Enabled**: `OFF` (Not recommended for new applications)
-   **Direct Access Grants Enabled**: `OFF` (Unless specifically needed for other purposes, not for the primary login)
-   **Valid Redirect URIs**: This is crucial. Add the URL(s) where your Admin Frontend application is running. Keycloak will only redirect users back to these URLs after login or logout.
    -   For local development, this might be `http://localhost:3000/*` (assuming the React app runs on port 3000).
    -   For production, this would be `https://your-admin-app-domain.com/*`.
    -   Add all variations (e.g., with and without trailing slashes if necessary, though `/*` usually covers it).
-   **Web Origins**: Add the base URLs of your Admin Frontend to allow CORS requests from the frontend to Keycloak.
    -   Example: `http://localhost:3000`, `https://your-admin-app-domain.com`.
    -   `+` can be used to allow all valid redirect URIs as web origins automatically.

### Example Client Setup (Conceptual)

1.  Log in to your Keycloak Admin Console.
2.  Select your Realm (or create one if it doesn't exist, e.g., `myrealm`).
3.  Go to "Clients" and click "Create".
    *   **Client ID**: `admin-frontend-client` (or your chosen ID)
    *   **Client Protocol**: `openid-connect`
    *   **Root URL**: (Can be left blank or set to your app's main URL)
4.  Click "Save". The client will be created, and you'll be taken to its settings page.
5.  Configure the following settings:
    *   **Access Type**: `public`
    *   **Standard Flow Enabled**: `ON`
    *   **Valid Redirect URIs**: Add your application's URI(s) (e.g., `http://localhost:3000/*`)
    *   **Web Origins**: Add your application's base URI(s) (e.g., `http://localhost:3000`) or use `+`.
6.  Save the changes.

## Role-Based Access Control (RBAC)

The Admin Frontend might use Keycloak roles to manage user permissions. Ensure that appropriate roles are defined in Keycloak and assigned to users. The application might check for roles using `keycloak.hasRealmRole('role-name')` or by inspecting roles present in `keycloak.tokenParsed.realm_access.roles`.

Refer to the application's specific permission logic (if any) for details on which roles are expected.

## Notes

-   Ensure your Keycloak instance is accessible from where the Admin Frontend is hosted.
-   For production, always use HTTPS for both your application and Keycloak.
-   The `keycloak-js` adapter handles token refreshing automatically as long as the user's session is active in Keycloak.
