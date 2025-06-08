/**
 * UUID Generation Utility
 * Универсальная утилита для генерации UUID во всех фронтендах
 */

/**
 * Генерирует UUID v4
 * @returns {string} UUID в формате xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : ((r & 0x3) | 0x8);
    return v.toString(16);
  });
};

/**
 * Проверяет, является ли строка валидным UUID
 * @param {string} uuid - строка для проверки
 * @returns {boolean} true если строка является валидным UUID
 */
export const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Генерирует UUID для создания объекта с логированием
 * @param {string} entityType - тип создаваемой сущности (для логирования)
 * @returns {string} UUID
 */
export const generateEntityUUID = (entityType = 'entity') => {
  const uuid = generateUUID();
  if (process.env.NODE_ENV === 'development') {
    console.log(`🆔 Generated UUID for ${entityType}: ${uuid}`);
  }
  return uuid;
};

/**
 * Создает объект с UUID для API запроса
 * @param {Object} data - данные объекта
 * @param {string} entityType - тип сущности
 * @returns {Object} объект с добавленным UUID
 */
export const withUUID = (data, entityType = 'entity') => {
  return {
    id: generateEntityUUID(entityType),
    ...data
  };
};

/**
 * Константы для типов сущностей
 */
export const ENTITY_TYPES = {
  BUYER: 'buyer',
  SELLER: 'seller',
  PRODUCT: 'product',
  WOOD_TYPE: 'wood_type',
  WOODEN_BOARD: 'wooden_board',
  IMAGE: 'image',
  CHAT_THREAD: 'chat_thread',
  CHAT_MESSAGE: 'chat_message',
  WOOD_TYPE_PRICE: 'wood_type_price'
};

export default {
  generateUUID,
  generateEntityUUID,
  withUUID,
  isValidUUID,
  ENTITY_TYPES
};
