import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
// import { toast } from 'react-hot-toast'; // Keep if toasts are still relevant for Keycloak events

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null, // Will be derived from keycloak.tokenParsed
      token: null, // Will be keycloak.token
      isAuthenticated: false, // Will be keycloak.authenticated
      keycloakInstance: null, // To store the Keycloak instance

      // Actions
      // This action would be called from a component that has access to the keycloak instance
      syncKeycloakState: (keycloak) => {
        if (keycloak) {
          set({
            user: keycloak.tokenParsed,
            token: keycloak.token,
            isAuthenticated: keycloak.authenticated,
            keycloakInstance: keycloak, // Optionally store the instance
          });
        } else {
          // Handle case where keycloak is not available (e.g., logged out)
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            keycloakInstance: null,
          });
        }
      },

      // keycloak.logout() would be called directly from UI.
      // This function is a placeholder if a store-initiated logout is ever needed.
      logout: () => {
        const keycloak = get().keycloakInstance;
        if (keycloak && keycloak.authenticated) {
          keycloak.logout();
          // Keycloak handles redirect; state will update via event listeners or route protection logic
          // After logout, syncKeycloakState(null) or syncKeycloakState(keycloak) should be called
          // by the component handling Keycloak events to update the store.
        }
      },

      // Utility functions (can be adapted or removed)
      getUser: () => get().user,
      getToken: () => get().token,
      getIsAuthenticated: () => get().isAuthenticated,

      // Permissions will be handled based on Keycloak roles
      // Example: hasRole: (role) => get().user?.realm_access?.roles.includes(role)
      // This can be added back/adjusted based on specific needs later.
      // hasPermission: (permission) => { ... }
      hasRole: (role) => {
        const user = get().user;
        if (user && user.realm_access && user.realm_access.roles) {
          return user.realm_access.roles.includes(role);
        }
        return false;
      }
    }),
    {
      name: 'auth-storage', // Keep persistence
      storage: createJSONStorage(() => localStorage),
      // Define what to persist. Keycloak manages its own token storage.
      // We might persist very little or rely on syncKeycloakState on load.
      partialize: (state) => ({
        // Persisting user and isAuthenticated can be useful for initial UI rendering
        // before Keycloak is fully initialized and syncKeycloakState is called.
        // However, this might lead to displaying stale data if Keycloak session ended.
        // For now, let's not persist them to rely on Keycloak as the source of truth.
        // user: state.user,
        // isAuthenticated: state.isAuthenticated,

        // keycloakInstance should not be persisted as it's a live object.
      }),
    }
  )
);
