/**
 * Wood Type model based on the API documentation
 */

/**
 * Transforms raw wood type data from the API to a format usable by the frontend
 * @param {Object} data - Raw wood type data from the API
 * @returns {Object} - Transformed wood type data
 */
export const transformWoodTypeData = (data) => {
  if (!data) return null;
  
  return {
    id: data.id,
    name: data.neme, // Note: API has a typo in the field name
    description: data.description,
    // Add a placeholder image if none is provided
    imageSrc: `https://via.placeholder.com/300x200?text=${encodeURIComponent(data.neme || 'Wood Type')}`,
  };
};

/**
 * Transforms frontend wood type data to the format expected by the API
 * @param {Object} woodType - Frontend wood type data
 * @returns {Object} - Wood type data formatted for the API
 */
export const transformWoodTypeForApi = (woodType) => {
  return {
    id: woodType.id,
    neme: woodType.name, // Note: API has a typo in the field name
    description: woodType.description,
  };
};

/**
 * Transforms a list of wood types from the API
 * @param {Array} woodTypes - List of wood types from the API
 * @returns {Array} - Transformed wood type list
 */
export const transformWoodTypeList = (woodTypes) => {
  if (!woodTypes || !Array.isArray(woodTypes)) return [];
  
  return woodTypes.map(woodType => transformWoodTypeData(woodType));
};

/**
 * Default empty wood type object
 */
export const emptyWoodType = {
  id: '',
  name: '',
  description: '',
  imageSrc: 'https://via.placeholder.com/300x200?text=New+Wood+Type',
};
