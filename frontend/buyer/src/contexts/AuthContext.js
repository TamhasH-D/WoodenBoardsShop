import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AuthProvider as OidcAuthProvider, useAuth as useOidcAuth } from 'react-oidc-context';
import { oidcConfig, oidcUtils } from '../config/oidc';
import { apiService } from '../services/api';

/**
 * Контекст аутентификации для buyer frontend
 * Интегрирует react-oidc-context с нашей бизнес-логикой
 */

// Создаем дополнительный контекст для buyer-специфичной логики
const BuyerAuthContext = createContext();

/**
 * Провайдер для buyer-специфичной аутентификации
 */
export const BuyerAuthProvider = ({ children }) => {
  const oidcAuth = useOidcAuth();
  const [buyerProfile, setBuyerProfile] = useState(null);
  const [buyerId, setBuyerId] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState(null);

  /**
   * Загрузка профиля покупателя после успешной аутентификации
   */
  const loadBuyerProfile = useCallback(async (keycloakId) => {
    if (!keycloakId) return;

    setIsLoadingProfile(true);
    setProfileError(null);

    try {
      console.log('[AuthContext] Loading buyer profile for keycloak_id:', keycloakId);

      // Используем существующий API метод с автоматическим созданием пользователя
      const response = await apiService.getBuyerProfileByKeycloakId(keycloakId);

      console.log('[AuthContext] Buyer profile loaded:', response.data);
      setBuyerProfile(response.data);
      setBuyerId(response.data.id);

    } catch (error) {
      console.error('[AuthContext] Failed to load buyer profile:', error);
      setProfileError(error.message || 'Failed to load buyer profile');
    } finally {
      setIsLoadingProfile(false);
    }
  }, []);

  /**
   * Очистка данных профиля при логауте
   */
  const clearBuyerProfile = () => {
    setBuyerProfile(null);
    setBuyerId(null);
    setProfileError(null);
  };

  /**
   * Эффект для загрузки профиля при изменении состояния аутентификации
   */
  useEffect(() => {
    const userSub = oidcAuth.user?.sub;
    if (oidcAuth.isAuthenticated && userSub) {
      // Используем sub (subject) как keycloak_id
      loadBuyerProfile(userSub);
    } else {
      clearBuyerProfile();
    }
  }, [oidcAuth.isAuthenticated, oidcAuth.user?.sub, loadBuyerProfile]);

  /**
   * Логирование состояния аутентификации для отладки
   */
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[AuthContext] Auth state changed:', {
        isAuthenticated: oidcAuth.isAuthenticated,
        isLoading: oidcAuth.isLoading,
        hasError: !!oidcAuth.error,
        userSub: oidcAuth.user?.sub,
        buyerId,
        hasBuyerProfile: !!buyerProfile
      });
    }
  }, [oidcAuth.isAuthenticated, oidcAuth.isLoading, oidcAuth.error, buyerId, buyerProfile]);

  // Объединяем OIDC контекст с buyer-специфичными данными
  const contextValue = {
    // OIDC данные
    ...oidcAuth,
    
    // Buyer-специфичные данные
    buyerProfile,
    buyerId,
    isLoadingProfile,
    profileError,
    
    // Методы
    loadBuyerProfile,
    clearBuyerProfile,
    
    // Утилиты
    getKeycloakId: () => oidcAuth.user?.sub,
    isFullyAuthenticated: () => oidcAuth.isAuthenticated && !!buyerId,
  };

  return (
    <BuyerAuthContext.Provider value={contextValue}>
      {children}
    </BuyerAuthContext.Provider>
  );
};

/**
 * Хук для использования контекста аутентификации
 */
export const useBuyerAuth = () => {
  const context = useContext(BuyerAuthContext);
  if (!context) {
    throw new Error('useBuyerAuth must be used within a BuyerAuthProvider');
  }
  return context;
};

/**
 * Основной провайдер аутентификации
 * Объединяет OIDC провайдер с нашим buyer-специфичным провайдером
 */
export const AuthProvider = ({ children }) => {
  // Логируем конфигурацию при инициализации
  useEffect(() => {
    oidcUtils.logConfig();
  }, []);

  return (
    <OidcAuthProvider {...oidcConfig}>
      <BuyerAuthProvider>
        {children}
      </BuyerAuthProvider>
    </OidcAuthProvider>
  );
};

/**
 * Хук для быстрого доступа к основным функциям аутентификации
 */
export const useAuth = () => {
  const auth = useBuyerAuth();
  
  return {
    // Состояние
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading || auth.isLoadingProfile,
    user: auth.user,
    buyerProfile: auth.buyerProfile,
    buyerId: auth.buyerId,
    error: auth.error || auth.profileError,
    
    // Методы
    login: auth.signinRedirect,
    logout: auth.signoutRedirect,
    
    // Утилиты
    getKeycloakId: auth.getKeycloakId,
    isFullyAuthenticated: auth.isFullyAuthenticated,
  };
};

export default AuthProvider;
