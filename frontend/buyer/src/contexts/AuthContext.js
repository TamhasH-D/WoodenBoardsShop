import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Keycloak from 'keycloak-js';
import { updateApiToken, getMyBuyerProfile } from '../services/api'; // Import API functions

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [keycloak, setKeycloak] = useState(null);
  const [keycloakAuthenticated, setKeycloakAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null); // Basic info from token (e.g. username, email from token)

  const [buyerProfile, setBuyerProfile] = useState(null); // Detailed profile from backend
  const [profileLoading, setProfileLoading] = useState(true); // Start true until first auth check
  const [profileError, setProfileError] = useState(null);

  // This function replaces the old mocked fetchOrCreateBuyerProfile
  const syncBuyerProfile = useCallback(async (kcInstance) => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      console.log("[AuthContext] Attempting to sync buyer profile...");
      const profile = await getMyBuyerProfile(); // Uses token set by updateApiToken
      setBuyerProfile(profile);
      // Update basic userInfo from the definitive profile data
      setUserInfo({
        name: profile.name || kcInstance.tokenParsed?.name || kcInstance.tokenParsed?.preferred_username,
        email: profile.email || kcInstance.tokenParsed?.email,
        username: kcInstance.tokenParsed?.preferred_username, // Keep preferred_username from token
        // any other essential fields for quick access, if different from profile
      });
      console.log("[AuthContext] Buyer profile synced successfully:", profile);
    } catch (error) {
      console.error("[AuthContext] Error syncing buyer profile:", error);
      setProfileError(error);
      // Optional: Consider logging out if profile sync is critical and fails
      // if (kcInstance) kcInstance.logout();
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    const keycloakInstance = new Keycloak('/keycloak.json');

    keycloakInstance.onTokenExpired = () => {
      console.log('[AuthContext] Keycloak token expired. Attempting to refresh...');
      keycloakInstance.updateToken(30) // 30 seconds minimum validity
        .then(refreshed => {
          if (refreshed) {
            console.log('[AuthContext] Keycloak token refreshed successfully.');
            updateApiToken(keycloakInstance.token);
            // Optionally re-sync profile if it might change or if this is a critical path
            // syncBuyerProfile(keycloakInstance);
          } else {
            console.warn('[AuthContext] Keycloak token not refreshed, valid for %s seconds', Math.round(keycloakInstance.tokenParsed.exp + keycloakInstance.timeSkew - new Date().getTime() / 1000));
          }
        })
        .catch(() => {
          console.error('[AuthContext] Failed to refresh Keycloak token. Logging out.');
          keycloakInstance.logout(); // Or clear session and prompt login
        });
    };

    keycloakInstance.init({ onLoad: 'check-sso', promiseType: 'native' })
      .then(authSuccess => {
        setKeycloak(keycloakInstance);
        setKeycloakAuthenticated(authSuccess);
        if (authSuccess) {
          console.log("[AuthContext] Keycloak authenticated successfully.");
          updateApiToken(keycloakInstance.token); // Set token for API calls
          const tokenParsed = keycloakInstance.tokenParsed;
          setUserInfo({ // Set initial userInfo from token
            name: tokenParsed.name || tokenParsed.preferred_username,
            email: tokenParsed.email,
            username: tokenParsed.preferred_username,
          });
          syncBuyerProfile(keycloakInstance); // Fetch/create buyer profile
        } else {
          console.log("[AuthContext] Keycloak authentication check complete, user not authenticated.");
          updateApiToken(null); // Clear token
          setBuyerProfile(null);
          setUserInfo(null);
          setProfileLoading(false);
        }
      })
      .catch(error => {
        console.error("[AuthContext] Keycloak init error:", error);
        updateApiToken(null); // Clear token
        setProfileError(error);
        setBuyerProfile(null);
        setUserInfo(null);
        setProfileLoading(false);
      });

    // Cleanup Keycloak instance on unmount (optional, Keycloak handles much of this)
    return () => {
        // keycloakInstance.onTokenExpired = null; // Clear handlers if set directly
        // if (keycloakInstance) {
        //     console.log("[AuthContext] Clearing Keycloak instance (on unmount - though usually not needed)");
        // }
    };
  }, [syncBuyerProfile]);

  const login = useCallback(() => {
    if (keycloak) {
      keycloak.login();
    }
  }, [keycloak]);

  const logout = useCallback(() => {
    if (keycloak) {
      keycloak.logout(); // This will redirect, so state updates below might not be "seen" but are good practice
      updateApiToken(null);
      setKeycloakAuthenticated(false);
      setUserInfo(null);
      setBuyerProfile(null);
      setProfileError(null);
      setProfileLoading(false); // Reset loading state
    }
  }, [keycloak]);

  // Derived state: profile is successfully loaded AND keycloak is authenticated
  const profileAndKeycloakAuthenticated = keycloakAuthenticated && !!buyerProfile && !profileError && !profileLoading;

  return (
    <AuthContext.Provider value={{
      keycloak,
      keycloakAuthenticated,
      login,
      logout,
      userInfo,
      buyerProfile,
      profileLoading,
      profileError,
      isAuthenticated: profileAndKeycloakAuthenticated // Main flag for "fully" authenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
