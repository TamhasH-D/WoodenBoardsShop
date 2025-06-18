import React, { useEffect } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { useAuthStore } from '../../stores/authStore'; // Adjust path as needed

const ProtectedRoute = ({ children }) => {
  const { keycloak, initialized } = useKeycloak();
  const syncKeycloakState = useAuthStore(state => state.syncKeycloakState);

  useEffect(() => {
    // This effect syncs the Zustand store with the Keycloak state
    // It runs when Keycloak is initialized or when critical pieces of Keycloak state change.
    if (initialized) {
      syncKeycloakState(keycloak);
    }
  }, [initialized, keycloak, syncKeycloakState, keycloak.authenticated, keycloak.token, keycloak.tokenParsed]); // Added tokenParsed for completeness

  if (!initialized) {
    // This state is usually handled by ReactKeycloakProvider's LoadingComponent prop
    return <div>Loading Keycloak initialization...</div>;
  }

  // If Keycloak is initialized but not authenticated,
  // ReactKeycloakProvider with initOptions={{ onLoad: 'login-required' }}
  // should have already initiated a redirect to Keycloak's login page.
  // So, we might show a message or a spinner here,
  // as the redirect is in progress or if something prevented it.
  if (!keycloak.authenticated) {
    // keycloak.login() could be called here if onLoad='login-required' is not used,
    // but it's generally better to rely on the provider's configuration.
    return <div>Authenticating... Please wait or you will be redirected to login.</div>;
  }

  // If initialized and authenticated, render the protected content.
  return <>{children}</>;
};

export default ProtectedRoute;
