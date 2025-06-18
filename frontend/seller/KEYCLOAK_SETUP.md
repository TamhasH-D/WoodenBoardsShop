# Keycloak Configuration for Seller Frontend

For the Keycloak integration in the Seller Frontend to work correctly, you need to configure your Keycloak instance with the following details. These values are used in `frontend/seller/src/keycloak.js`.

## Keycloak Instance Details

The frontend application expects Keycloak to be running and accessible. The initialization code in `frontend/seller/src/keycloak.js` needs to be updated with your specific Keycloak server details.

Currently, the placeholders are:
- **URL**: `YOUR_KEYCLOAK_SERVER_URL`
- **Realm**: `YOUR_KEYCLOAK_REALM`
- **Client ID**: `YOUR_KEYCLOAK_CLIENT_ID`

### 1. Keycloak Server URL

Update `url` in `frontend/seller/src/keycloak.js` to point to your Keycloak server's authentication base URL.
   - **Example**: `http://localhost:8080` (for Keycloak 17+), or `http://localhost:8080/auth` (for older versions). Ensure this is the correct base path.

### 2. Realm Name

Update `realm` in `frontend/seller/src/keycloak.js` with the name of the Keycloak realm you are using for this application.
   - **Example**: `seller-realm`

### 3. Client ID

Update `clientId` in `frontend/seller/src/keycloak.js` with the Client ID configured in your Keycloak realm for this Seller Frontend application.
   - **Example**: `seller-frontend-client`

## Client Configuration in Keycloak

When setting up the client in your Keycloak realm (e.g., `seller-frontend-client`), ensure the following settings are correctly configured:

- **Client Protocol**: `openid-connect`
- **Access Type**: `public` (as this is a frontend application)
- **Valid Redirect URIs**: This is crucial. Add the URL(s) where your Seller Frontend application will be running.
    - For local development, this might be `http://localhost:3000/*` (or whatever port you use).
    - For production, this will be your production domain(s), e.g., `https://your-seller-frontend.com/*`.
    - Ensure to include the wildcard `/*` at the end if your application has multiple routes, to allow redirection back to any page after login.
- **Web Origins**: Set this to the base URL(s) of your application (e.g., `http://localhost:3000` or `https://your-seller-frontend.com`). This is important for CORS. Click '+' to add more if needed.

## Example `keycloak.js` after configuration:

```javascript
// frontend/seller/src/keycloak.js
import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8080', // Or your production Keycloak URL
  realm: 'seller-realm',        // Your realm name
  clientId: 'seller-frontend-client' // Your client ID
});

export default keycloak;
```

**Note:** For production environments, it is highly recommended to use environment variables to supply these values rather than hardcoding them directly into `keycloak.js`. The current implementation uses hardcoded values for simplicity during initial setup.
