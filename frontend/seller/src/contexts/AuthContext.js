import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import keycloakInstance from '../utils/keycloak'; // Import the centralized Keycloak instance for seller
import { updateApiToken, getMySellerProfile } from '../services/api'; // Assuming getMySellerProfile will be created

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [keycloak, setKeycloakState] = useState(keycloakInstance);
  const [keycloakAuthenticated, setKeycloakAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  const [sellerProfile, setSellerProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);

  const syncSellerProfile = useCallback(async (currentKcInstance) => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      console.log("[AuthContext] Attempting to sync seller profile...");
      const keycloak_id = currentKcInstance?.tokenParsed?.sub;
      if (!keycloak_id) {
        throw new Error("Keycloak ID not found in token.");
      }
      // TODO: Make sure getMySellerProfile is implemented in services/api.js
      const profile = await getMySellerProfile(keycloak_id);
      setSellerProfile(profile);
      if (currentKcInstance?.tokenParsed) {
        setUserInfo({
          name: profile.name || currentKcInstance.tokenParsed.name || currentKcInstance.tokenParsed.preferred_username,
          email: profile.email || currentKcInstance.tokenParsed.email,
          username: currentKcInstance.tokenParsed.preferred_username,
        });
      } else {
         setUserInfo({ name: profile.name, email: profile.email, username: profile.name });
      }
      console.log("[AuthContext] Seller profile synced successfully:", profile);
    } catch (error) {
      console.error("[AuthContext] Error syncing seller profile:", error);
      setProfileError(error);
      // Attempt to set user info from token even if profile sync fails
      if (currentKcInstance?.tokenParsed) {
        setUserInfo({
          name: currentKcInstance.tokenParsed.name || currentKcInstance.tokenParsed.preferred_username,
          email: currentKcInstance.tokenParsed.email,
          username: currentKcInstance.tokenParsed.preferred_username,
        });
         console.log("[AuthContext] Set userInfo from token as fallback:", userInfo);
      }
    } finally {
      setProfileLoading(false);
    }
  }, [userInfo]); // Added userInfo to dependencies as it's used in a fallback

  useEffect(() => {
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
        setKeycloakAuthenticated(authSuccess);
        if (authSuccess) {
          console.log("[AuthContext] Keycloak authenticated successfully for seller.");
          updateApiToken(keycloakInstance.token);
          // Initial user info from token
          const tokenParsed = keycloakInstance.tokenParsed;
          setUserInfo({
            name: tokenParsed.name || tokenParsed.preferred_username,
            email: tokenParsed.email,
            username: tokenParsed.preferred_username,
          });
          syncSellerProfile(keycloakInstance);
        } else {
          console.log("[AuthContext] Keycloak authentication check complete, seller not authenticated.");
          updateApiToken(null);
          setSellerProfile(null);
          setUserInfo(null);
          setProfileLoading(false);
        }
      })
      .catch(error => {
        console.error("[AuthContext] Keycloak init error for seller:", error);
        updateApiToken(null);
        setProfileError(error);
        setSellerProfile(null);
        setUserInfo(null);
        setProfileLoading(false);
      });
  }, [syncSellerProfile]);

  const login = useCallback(() => {
    if (keycloakInstance) {
      keycloakInstance.login();
    }
  }, []);

  const logout = useCallback(() => {
    if (keycloakInstance) {
      keycloakInstance.logout();
      updateApiToken(null);
      setKeycloakAuthenticated(false);
      setUserInfo(null);
      setSellerProfile(null);
      setProfileError(null);
      setProfileLoading(false);
    }
  }, []);

  // isAuthenticated is true if Keycloak is authenticated AND seller profile is loaded successfully
  const isAuthenticated = keycloakAuthenticated && !!sellerProfile && !profileError && !profileLoading;

  return (
    <AuthContext.Provider value={{
      keycloak: keycloakInstance,
      keycloakAuthenticated,
      login,
      logout,
      userInfo, // This will contain email
      sellerProfile,
      profileLoading,
      profileError,
      isAuthenticated, // Use this comprehensive flag
      syncSellerProfile // Expose syncSellerProfile
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
