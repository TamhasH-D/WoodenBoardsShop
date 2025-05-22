import React from 'react';
import ProductCard from './ProductCard';

const ProductGrid = ({ products, loading = false, error = null, count = 8 }) => {
  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-card p-8 text-center">
        <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h3 className="text-xl font-semibold text-wood-text mb-2">Ошибка загрузки</h3>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  // Placeholder for loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(count)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-card overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-300"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
              <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
              <div className="flex justify-between items-center">
                <div className="h-6 bg-gray-300 rounded w-1/4"></div>
                <div className="h-8 bg-gray-300 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // No products found
  if (!products || products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-card p-8 text-center">
        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h3 className="text-xl font-semibold text-wood-text mb-2">Товары не найдены</h3>
        <p className="text-gray-500">Попробуйте изменить параметры поиска или фильтры</p>
      </div>
    );
  }

  // Display products
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          title={product.title}
          price={product.price}
          volume={product.volume}
          woodType={product.woodType}
          imageSrc={product.imageSrc}
          deliveryPossible={product.deliveryPossible}
          pickupLocation={product.pickupLocation}
          description={product.description}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
