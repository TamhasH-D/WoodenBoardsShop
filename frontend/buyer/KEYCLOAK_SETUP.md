# Keycloak Frontend Configuration

For the buyer frontend to integrate with Keycloak correctly, the Keycloak server must be configured with a specific realm and client. The frontend application expects to find a `keycloak.json` file in its `/public` directory with the following structure, or have these values configured at runtime if using a different initialization method.

## Expected `keycloak.json` in `frontend/buyer/public/`

The `frontend/buyer/public/keycloak.json` file should contain:

```json
{
  "realm": "BuyerRealm",
  "auth-server-url": "http://localhost:8080/",
  "ssl-required": "none",
  "resource": "buyer-frontend",
  "public-client": true,
  "confidential-port": 0
}
```

### Configuration Details:

*   **`realm`**: `BuyerRealm`
    *   This is the Keycloak realm dedicated to buyer users.
*   **`auth-server-url`**: `http://localhost:8080/`
    *   This is the base URL of your Keycloak authentication server.
    *   For production, this should be your actual Keycloak server's URL (e.g., `https://your-keycloak-domain.com/`).
*   **`ssl-required`**: `none`
    *   For local development, `none` is acceptable.
    *   For production, this should be `external` or `all` depending on your Keycloak setup and SSL termination.
*   **`resource`**: `buyer-frontend`
    *   This is the **Client ID** defined in Keycloak for the buyer frontend application.
*   **`public-client`**: `true`
    *   Indicates that the client is public and does not use a client secret, which is typical for frontend JavaScript applications.
*   **`confidential-port`**: `0`
    *   Typically set to `0` for public clients.

## Keycloak Server Setup Checklist:

To ensure the frontend works, please verify the following on your Keycloak server:

1.  **Realm Exists:** A realm named `BuyerRealm` is created.
2.  **Client Exists:**
    *   A client with Client ID `buyer-frontend` is created within the `BuyerRealm`.
    *   The client is configured as `public` (Access Type).
    *   **Valid Redirect URIs:** Ensure that the redirect URIs for the client in Keycloak include the URLs where your buyer frontend application will be running. For example:
        *   `http://localhost:3000/*` (for local development if CRA runs on port 3000)
        *   `https://your-buyer-frontend-domain.com/*` (for production)
    *   **Web Origins:** Configure appropriate web origins (e.g., `+` or specific domains like `http://localhost:3000`, `https://your-buyer-frontend-domain.com`).
3.  **Users:** Users are created within `BuyerRealm` that can log in via this client.

## User Profile Synchronization and Auto-Registration

After a successful authentication via Keycloak, the buyer frontend application performs an additional step to synchronize the user's application-specific profile.

1.  **Profile Endpoint:** The frontend makes a `GET` request to `/api/v1/buyers/me/profile`. This request is authenticated using the Keycloak JWT obtained upon login.
2.  **Backend Logic:**
    *   The backend service at this endpoint is responsible for identifying the user based on their Keycloak ID (typically the `sub` claim from the JWT).
    *   If a corresponding buyer profile exists in the application's database, it is returned.
    *   **Auto-Registration:** If no such profile exists, the backend is expected to automatically create a new buyer profile, associate it with the user's Keycloak ID, and populate initial details (e.g., from token claims like `preferred_username`, `email`, `name`). The newly created profile is then returned.
3.  **Frontend State:** The fetched or newly created profile data (including the internal application `buyer_id` or `id` for the buyer entity) is then stored in the frontend's `AuthContext` and used throughout the application.

This process ensures a seamless experience for new users by automatically creating an application profile upon their first login via Keycloak. It also keeps user data synchronized between Keycloak and the application on subsequent logins or token refreshes if the profile endpoint is designed to update existing profiles.

If you are using a different Keycloak URL, realm name, or client ID, you **must** update the `frontend/buyer/public/keycloak.json` file accordingly, or modify the Keycloak initialization parameters in `frontend/buyer/src/contexts/AuthContext.js` if you choose to configure it programmatically without `keycloak.json`.
