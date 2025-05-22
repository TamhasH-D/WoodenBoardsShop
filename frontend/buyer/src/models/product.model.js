/**
 * Product model based on the API documentation
 */

/**
 * Transforms raw product data from the API to a format usable by the frontend
 * @param {Object} data - Raw product data from the API
 * @returns {Object} - Transformed product data
 */
export const transformProductData = (data) => {
  if (!data) return null;
  
  return {
    id: data.id,
    title: data.title,
    description: data.descrioption, // Note: API has a typo in the field name
    price: data.price,
    volume: data.volume,
    deliveryPossible: data.delivery_possible,
    pickupLocation: data.pickup_location,
    sellerId: data.seller_id,
    woodTypeId: data.wood_type_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    // Add a placeholder image if none is provided
    imageSrc: `https://via.placeholder.com/300x200?text=${encodeURIComponent(data.title || 'Product')}`,
  };
};

/**
 * Transforms frontend product data to the format expected by the API
 * @param {Object} product - Frontend product data
 * @returns {Object} - Product data formatted for the API
 */
export const transformProductForApi = (product) => {
  return {
    id: product.id,
    title: product.title,
    descrioption: product.description, // Note: API has a typo in the field name
    price: product.price,
    volume: product.volume,
    delivery_possible: product.deliveryPossible,
    pickup_location: product.pickupLocation,
    seller_id: product.sellerId,
    wood_type_id: product.woodTypeId,
  };
};

/**
 * Transforms a list of products from the API
 * @param {Array} products - List of products from the API
 * @returns {Array} - Transformed product list
 */
export const transformProductList = (products) => {
  if (!products || !Array.isArray(products)) return [];
  
  return products.map(product => transformProductData(product));
};

/**
 * Default empty product object
 */
export const emptyProduct = {
  id: '',
  title: '',
  description: '',
  price: 0,
  volume: 0,
  deliveryPossible: false,
  pickupLocation: '',
  sellerId: '',
  woodTypeId: '',
  imageSrc: 'https://via.placeholder.com/300x200?text=New+Product',
};
