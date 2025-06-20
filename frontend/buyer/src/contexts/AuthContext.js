import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// Remove direct Keycloak import: import Keycloak from 'keycloak-js';
import keycloakInstance from '../keycloak'; // Import the centralized Keycloak instance
import { updateApiToken, getMyBuyerProfile } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // The 'keycloak' state now refers to the imported instance.
  // We don't use setKeycloak to change the instance itself, but can use it
  // to trigger re-renders if needed, though direct use of keycloakInstance should be fine.
  // For simplicity, we can remove the keycloak state if we always use keycloakInstance directly.
  // Let's keep it for now to minimize structural changes to login/logout functions that check `if (keycloak)`
  const [keycloak, setKeycloakState] = useState(keycloakInstance); // Store the imported instance in state
  const [keycloakAuthenticated, setKeycloakAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  const [buyerProfile, setBuyerProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);

  const syncBuyerProfile = useCallback(async (currentKcInstance) => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      console.log("[AuthContext] Attempting to sync buyer profile...");
      const keycloak_id = currentKcInstance?.tokenParsed?.sub;
      if (!keycloak_id) {
        throw new Error("Keycloak ID not found in token.");
      }
      // Assuming getMyBuyerProfile returns an object like { data: { actual_profile_fields } }
      const response = await getMyBuyerProfile(keycloak_id);
      const profileData = response.data; // Extract the actual profile data

      setBuyerProfile(profileData); // Store the actual profile data object

      if (currentKcInstance?.tokenParsed) {
        setUserInfo({
          name: profileData.name || currentKcInstance.tokenParsed.name || currentKcInstance.tokenParsed.preferred_username,
          email: profileData.email || currentKcInstance.tokenParsed.email,
          username: currentKcInstance.tokenParsed.preferred_username,
        });
      } else {
         setUserInfo({
           name: profileData.name,
           email: profileData.email,
           username: profileData.name // Or profileData.username if available
         });
      }
      console.log("[AuthContext] Buyer profile synced successfully (actual data):", profileData);
    } catch (error) {
      console.error("[AuthContext] Error syncing buyer profile:", error);
      setProfileError(error);
      setBuyerProfile(null); // Add this line
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    // keycloakInstance is the imported singleton

    keycloakInstance.onTokenExpired = () => {
      console.log('[AuthContext] Keycloak token expired. Attempting to refresh...');
      keycloakInstance.updateToken(30)
        .then(refreshed => {
          if (refreshed) {
            console.log('[AuthContext] Keycloak token refreshed successfully.');
            updateApiToken(keycloakInstance.token);
          } else {
            console.warn('[AuthContext] Keycloak token not refreshed, valid for %s seconds', Math.round(keycloakInstance.tokenParsed.exp + keycloakInstance.timeSkew - new Date().getTime() / 1000));
          }
        })
        .catch(() => {
          console.error('[AuthContext] Failed to refresh Keycloak token. Logging out.');
          keycloakInstance.logout();
        });
    };

    keycloakInstance.init({ onLoad: 'check-sso', promiseType: 'native' })
      .then(authSuccess => {
        // setKeycloakState(keycloakInstance); // Already set via useState initial value
        setKeycloakAuthenticated(authSuccess);
        if (authSuccess) {
          console.log("[AuthContext] Keycloak authenticated successfully.");
          updateApiToken(keycloakInstance.token);
          const tokenParsed = keycloakInstance.tokenParsed;
          setUserInfo({
            name: tokenParsed.name || tokenParsed.preferred_username,
            email: tokenParsed.email,
            username: tokenParsed.preferred_username,
          });
          syncBuyerProfile(keycloakInstance);
        } else {
          console.log("[AuthContext] Keycloak authentication check complete, user not authenticated.");
          updateApiToken(null);
          setBuyerProfile(null);
          setUserInfo(null);
          setProfileLoading(false);
        }
      })
      .catch(error => {
        console.error("[AuthContext] Keycloak init error:", error);
        updateApiToken(null);
        setProfileError(error);
        setBuyerProfile(null);
        setUserInfo(null);
        setProfileLoading(false);
      });

    // The imported keycloakInstance persists throughout app lifecycle,
    // so no specific cleanup in this useEffect is strictly needed for the instance itself.
    // Event handlers like onTokenExpired are set on the singleton and will remain.
  }, [syncBuyerProfile]); // syncBuyerProfile is stable due to useCallback

  const login = useCallback(() => {
    // Use the imported keycloakInstance directly
    if (keycloakInstance) {
      keycloakInstance.login();
    }
  }, []);

  const logout = useCallback(() => {
    // Use the imported keycloakInstance directly
    if (keycloakInstance) {
      keycloakInstance.logout();
      updateApiToken(null);
      // These state updates might not be fully processed if logout redirects immediately
      setKeycloakAuthenticated(false);
      setUserInfo(null);
      setBuyerProfile(null);
      setProfileError(null);
      setProfileLoading(false);
    }
  }, []);

  const profileAndKeycloakAuthenticated = keycloakAuthenticated && !!buyerProfile && !profileError && !profileLoading;

  return (
    <AuthContext.Provider value={{
      keycloak: keycloakInstance, // Provide the imported instance
      keycloakAuthenticated,
      login,
      logout,
      userInfo,
      buyerProfile,
      profileLoading,
      profileError,
      isAuthenticated: profileAndKeycloakAuthenticated
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
