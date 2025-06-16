import { apiService } from '../services/api';

/**
 * Утилиты для работы с аутентификацией покупателя
 * Обновлено для интеграции с Keycloak через react-oidc-context
 */

// Тестовый keycloak_id для разработки (fallback)
const TEST_KEYCLOAK_ID = 'b8c8e1e0-1234-5678-9abc-def012345678';

/**
 * Получить keycloak_id текущего покупателя
 * Теперь использует реальную аутентификацию через react-oidc-context
 */
export const getCurrentBuyerKeycloakId = () => {
  // Пытаемся получить из глобального контекста (установленного в App.js)
  try {
    if (typeof window !== 'undefined' && window.__BUYER_AUTH_CONTEXT__) {
      const auth = window.__BUYER_AUTH_CONTEXT__;
      if (auth.isAuthenticated && auth.getKeycloakId) {
        return auth.getKeycloakId();
      }
    }
  } catch (error) {
    console.warn('[auth] Could not get keycloak_id from auth context:', error);
  }

  // Fallback: проверяем localStorage (для совместимости)
  const storedId = localStorage.getItem('buyer_keycloak_id');
  if (storedId && storedId !== TEST_KEYCLOAK_ID) {
    return storedId;
  }

  // В режиме разработки возвращаем тестовый ID
  if (process.env.NODE_ENV === 'development') {
    console.warn('[auth] Using TEST keycloak_id for development. In production, user must be authenticated through Keycloak.');
    return TEST_KEYCLOAK_ID;
  }

  // В продакшене без аутентификации возвращаем null
  console.error('[auth] No authenticated user found. User must login through Keycloak.');
  return null;
};

/**
 * Получить настоящий buyer_id из базы данных по keycloak_id
 * Обновлено для работы с новой системой аутентификации
 */
export const getCurrentBuyerId = async () => {
  try {
    const keycloakId = getCurrentBuyerKeycloakId();

    if (!keycloakId) {
      throw new Error('No authenticated user found. Please login first.');
    }

    console.log('[auth] getCurrentBuyerId: Using keycloak_id:', keycloakId);

    const response = await apiService.getBuyerProfileByKeycloakId(keycloakId);
    console.log('[auth] getCurrentBuyerId: API response:', response);

    const buyerId = response.data.id;
    console.log('[auth] getCurrentBuyerId: Extracted buyer_id:', buyerId);

    return buyerId;
  } catch (error) {
    console.error('[auth] getCurrentBuyerId: Error:', error);
    throw error;
  }
};

/**
 * Получить полный профиль покупателя
 * Обновлено для работы с новой системой аутентификации
 */
export const getCurrentBuyerProfile = async () => {
  try {
    const keycloakId = getCurrentBuyerKeycloakId();

    if (!keycloakId) {
      throw new Error('No authenticated user found. Please login first.');
    }

    const response = await apiService.getBuyerProfileByKeycloakId(keycloakId);
    return response.data;
  } catch (error) {
    console.error('Ошибка получения профиля покупателя:', error);
    throw error;
  }
};

/**
 * Установить keycloak_id в localStorage (для тестирования)
 * @deprecated Используйте AuthContext вместо прямого управления localStorage
 */
export const setCurrentBuyerKeycloakId = (keycloakId) => {
  console.warn('[auth] setCurrentBuyerKeycloakId is deprecated. Use AuthContext instead.');
  localStorage.setItem('buyer_keycloak_id', keycloakId);
};

/**
 * Очистить данные аутентификации
 * @deprecated Используйте logout из AuthContext вместо прямой очистки
 */
export const clearBuyerAuth = () => {
  console.warn('[auth] clearBuyerAuth is deprecated. Use logout from AuthContext instead.');
  localStorage.removeItem('buyer_keycloak_id');
  localStorage.removeItem('buyer_id'); // Удаляем старый способ хранения
};

/**
 * Проверить, аутентифицирован ли пользователь
 */
export const isAuthenticated = () => {
  try {
    if (typeof window !== 'undefined' && window.__BUYER_AUTH_CONTEXT__) {
      const auth = window.__BUYER_AUTH_CONTEXT__;
      return auth.isAuthenticated;
    }
  } catch (error) {
    console.warn('[auth] Could not get auth status from context:', error);
  }

  // Fallback для случаев, когда контекст недоступен
  const keycloakId = getCurrentBuyerKeycloakId();
  return !!keycloakId && keycloakId !== TEST_KEYCLOAK_ID;
};

/**
 * Получить токен доступа для API запросов
 */
export const getAccessToken = () => {
  try {
    if (typeof window !== 'undefined' && window.__BUYER_AUTH_CONTEXT__) {
      const auth = window.__BUYER_AUTH_CONTEXT__;
      return auth.user?.access_token;
    }
  } catch (error) {
    console.warn('[auth] Could not get access token from auth context:', error);
  }
  return null;
};
