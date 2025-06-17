/**
 * Типы для инструмента подсчета досок
 * Адаптированы из TypeScript версии backend/prosto_board_volume-main/frontend
 */

/**
 * @typedef {Object} Point
 * @property {number} x - X координата
 * @property {number} y - Y координата
 */

/**
 * @typedef {Object} Detection
 * @property {number} confidence - Уверенность детекции (0-1)
 * @property {string} class_name - Название класса объекта
 * @property {Point[]} points - Массив точек контура
 */

/**
 * @typedef {Object} WoodenBoard
 * @property {number} volume - Объем доски в м³
 * @property {number} height - Высота доски в метрах
 * @property {number} width - Ширина доски в метрах
 * @property {number} length - Длина доски в метрах
 * @property {Detection} detection - Данные детекции
 */

/**
 * @typedef {Object} CountingResponse
 * @property {number} total_volume - Общий объем всех досок в м³
 * @property {number} total_count - Общее количество досок
 * @property {WoodenBoard[]} wooden_boards - Массив обнаруженных досок
 */

// Экспортируем для JSDoc
export const BoardCounterTypes = {
  Point: {},
  Detection: {},
  WoodenBoard: {},
  CountingResponse: {}
};
