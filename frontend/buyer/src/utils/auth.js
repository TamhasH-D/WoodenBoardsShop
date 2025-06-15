import { apiService } from '../services/api';

/**
 * Утилиты для работы с аутентификацией покупателя
 */

// Тестовый keycloak_id для разработки
const TEST_KEYCLOAK_ID = 'b8c8e1e0-1234-5678-9abc-def012345678';

/**
 * Получить keycloak_id текущего покупателя
 */
export const getCurrentBuyerKeycloakId = () => {
  // В продакшене здесь будет реальная логика получения из Keycloak
  return localStorage.getItem('buyer_keycloak_id') || TEST_KEYCLOAK_ID;
};

/**
 * Получить настоящий buyer_id из базы данных по keycloak_id
 */
export const getCurrentBuyerId = async () => {
  try {
    const keycloakId = getCurrentBuyerKeycloakId();
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
 */
export const getCurrentBuyerProfile = async () => {
  try {
    const keycloakId = getCurrentBuyerKeycloakId();
    const response = await apiService.getBuyerProfileByKeycloakId(keycloakId);
    return response.data;
  } catch (error) {
    console.error('Ошибка получения профиля покупателя:', error);
    throw error;
  }
};

/**
 * Установить keycloak_id в localStorage (для тестирования)
 */
export const setCurrentBuyerKeycloakId = (keycloakId) => {
  localStorage.setItem('buyer_keycloak_id', keycloakId);
};

/**
 * Очистить данные аутентификации
 */
export const clearBuyerAuth = () => {
  localStorage.removeItem('buyer_keycloak_id');
  localStorage.removeItem('buyer_id'); // Удаляем старый способ хранения
};
