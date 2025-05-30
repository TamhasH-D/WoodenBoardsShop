import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Layout from '../components/layout/Layout';
import ProductGrid from '../components/product/ProductGrid';
import FilterSidebar from '../components/filter/FilterSidebar';
import apiService from '../apiService';

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    woodTypes: [],
    priceRange: [0, 100000],
    deliveryOnly: false
  });
  const [sortOption, setSortOption] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  // Get search query from URL
  const searchQuery = searchParams.get('search') || '';
  const woodTypeParam = searchParams.get('woodType');

  // Fetch products with real API call
  const { data: productsData, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['products', currentPage, pageSize, searchQuery, filters],
    queryFn: () => apiService.getProducts({
      page: currentPage,
      limit: pageSize,
      search: searchQuery,
      sortBy: 'created_at',
      sortDirection: 'desc',
      filters: {
        ...(filters.woodTypes.length > 0 && { wood_type_id: filters.woodTypes }),
        ...(filters.deliveryOnly && { delivery_possible: true }),
      }
    }),
    keepPreviousData: true,
    staleTime: 30000, // 30 seconds
  });

  // Fetch wood types
  const { data: woodTypesData, isLoading: woodTypesLoading } = useQuery({
    queryKey: ['woodTypes'],
    queryFn: () => apiService.getWoodTypes({ limit: 100 }),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const products = productsData?.data || [];
  const woodTypes = woodTypesData?.data || [];
  const paginationInfo = productsData?.pagination || {};
  const isLoading = productsLoading || woodTypesLoading;

  // Transform wood types for the filter
  const transformedWoodTypes = useMemo(() => {
    return woodTypes.map(type => ({
      id: type.id,
      name: type.neme || 'Неизвестный тип' // API has a typo in the field name
    }));
  }, [woodTypes]);

  // Transform products for display
  const transformedProducts = useMemo(() => {
    return products.map(product => ({
      id: product.id,
      title: product.title,
      description: product.descrioption || '', // API has a typo in the field name
      price: product.price,
      volume: product.volume,
      woodType: woodTypes.find(wt => wt.id === product.wood_type_id)?.neme || 'Неизвестный тип',
      woodTypeId: product.wood_type_id,
      imageSrc: `https://via.placeholder.com/300x200?text=${encodeURIComponent(product.title)}`,
      deliveryPossible: product.delivery_possible,
      pickupLocation: product.pickup_location || '',
      createdAt: product.created_at,
      updatedAt: product.updated_at,
      sellerId: product.seller_id
    }));
  }, [products, woodTypes]);

  // Calculate price range from products
  const priceRange = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 100000 };

    const prices = products.map(p => p.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }, [products]);

  // Set initial filter from URL params
  useEffect(() => {
    if (woodTypeParam && transformedWoodTypes.length > 0) {
      const woodType = transformedWoodTypes.find(wt => wt.id === woodTypeParam);
      if (woodType) {
        setFilters(prev => ({
          ...prev,
          woodTypes: [woodTypeParam]
        }));
      }
    }
  }, [woodTypeParam, transformedWoodTypes]);

  // Handle errors
  useEffect(() => {
    if (productsError) {
      console.error('Error loading products:', productsError);
      setError('Не удалось загрузить товары. Пожалуйста, попробуйте позже.');
    }
  }, [productsError]);

  // Apply client-side filters and sorting to transformed products
  const filteredProducts = useMemo(() => {
    return transformedProducts.filter(product => {
      // Filter by wood type
      if (filters.woodTypes.length > 0) {
        if (!filters.woodTypes.includes(product.woodTypeId)) {
          return false;
        }
      }

      // Filter by price
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false;
      }

      // Filter by delivery
      if (filters.deliveryOnly && !product.deliveryPossible) {
        return false;
      }

      return true;
    });
  }, [transformedProducts, filters]);

  // Sort products
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      switch (sortOption) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name-asc':
          return a.title.localeCompare(b.title);
        case 'name-desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });
  }, [filteredProducts, sortOption]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  // Show error message if there's an error
  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Ошибка загрузки данных</h2>
          <p className="mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-wood-accent hover:bg-wood-accent-dark text-white font-bold py-2 px-4 rounded"
          >
            Попробовать снова
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-wood-text mb-8">Каталог товаров</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <FilterSidebar
              woodTypes={transformedWoodTypes}
              priceRange={priceRange}
              onFilterChange={handleFilterChange}
              loading={woodTypesLoading}
            />
          </div>

          {/* Main Content */}
          <div className="flex-grow">
            {/* Sort Controls */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-wood-text">
                Найдено товаров: <span className="font-semibold">{sortedProducts.length}</span>
                {paginationInfo.total && (
                  <span className="text-gray-500 ml-2">
                    (всего в каталоге: {paginationInfo.total})
                  </span>
                )}
              </p>
              <div className="flex items-center">
                <label htmlFor="sort" className="mr-2 text-wood-text">Сортировать:</label>
                <select
                  id="sort"
                  value={sortOption}
                  onChange={handleSortChange}
                  className="rounded-lg border-gray-300 focus:border-wood-accent focus:ring focus:ring-wood-accent focus:ring-opacity-50"
                >
                  <option value="default">По умолчанию</option>
                  <option value="price-asc">Цена (по возрастанию)</option>
                  <option value="price-desc">Цена (по убыванию)</option>
                  <option value="name-asc">Название (А-Я)</option>
                  <option value="name-desc">Название (Я-А)</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            <ProductGrid
              products={sortedProducts}
              loading={isLoading}
              error={error}
            />

            {/* Pagination */}
            {paginationInfo.total > pageSize && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Предыдущая
                  </button>

                  <span className="px-4 py-2 text-wood-text">
                    Страница {currentPage} из {Math.ceil(paginationInfo.total / pageSize)}
                  </span>

                  <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={currentPage >= Math.ceil(paginationInfo.total / pageSize)}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Следующая
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductsPage;
