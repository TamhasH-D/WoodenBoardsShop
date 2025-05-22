/**
 * Wooden Board model based on the API documentation
 */

/**
 * Transforms raw wooden board data from the API to a format usable by the frontend
 * @param {Object} data - Raw wooden board data from the API
 * @returns {Object} - Transformed wooden board data
 */
export const transformWoodenBoardData = (data) => {
  if (!data) return null;
  
  return {
    id: data.id,
    length: data.length,
    width: data.width,
    height: data.height,
    volume: data.volume,
    woodTypeId: data.wood_type_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

/**
 * Transforms frontend wooden board data to the format expected by the API
 * @param {Object} board - Frontend wooden board data
 * @returns {Object} - Wooden board data formatted for the API
 */
export const transformWoodenBoardForApi = (board) => {
  return {
    id: board.id,
    length: board.length,
    width: board.width,
    height: board.height,
    volume: board.volume,
    wood_type_id: board.woodTypeId,
  };
};

/**
 * Transforms a list of wooden boards from the API
 * @param {Array} boards - List of wooden boards from the API
 * @returns {Array} - Transformed wooden board list
 */
export const transformWoodenBoardList = (boards) => {
  if (!boards || !Array.isArray(boards)) return [];
  
  return boards.map(board => transformWoodenBoardData(board));
};

/**
 * Default empty wooden board object
 */
export const emptyWoodenBoard = {
  id: '',
  length: 0,
  width: 0,
  height: 0,
  volume: 0,
  woodTypeId: '',
};
