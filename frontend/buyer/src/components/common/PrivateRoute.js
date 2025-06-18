import React from 'react';
import KeycloakService from '../../services/keycloak'; // Adjust path if necessary
// It's generally better not to import Navigate from react-router-dom if KeycloakService.login() handles the redirect.
// However, if a fallback or different redirect logic was needed, Navigate would be used.

const PrivateRoute = ({ children }) => {
    const isLoggedIn = KeycloakService.isLoggedIn();
    const keycloakInitialized = KeycloakService.keycloak && KeycloakService.keycloak.authenticated !== undefined; // A way to check if init has run

    if (!keycloakInitialized) {
        // This case should ideally be handled by App.js's loading state before routes are even rendered.
        // If PrivateRoute is rendered before Keycloak is initialized, show loading or null.
        return <div>Authenticating...</div>;
    }

    if (!isLoggedIn) {
        // If Keycloak is initialized but user is not logged in, redirect to login.
        // KeycloakService.login() will typically redirect the entire page.
        KeycloakService.login();
        // Render a placeholder while the redirect to Keycloak happens.
        return <div>Redirecting to login...</div>;
    }

    // If logged in, render the child components.
    return children;
};

export default PrivateRoute;
