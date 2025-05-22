import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProductGrid from '../components/product/ProductGrid';
import FilterSidebar from '../components/filter/FilterSidebar';
import { useApi } from '../context/ApiContext';

const ProductsPage = () => {
  const { apiService } = useApi();
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [woodTypes, setWoodTypes] = useState([]);
  const [loading, setLoading] = useState({
    products: true,
    woodTypes: true
  });
  const [error, setError] = useState(null);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [filters, setFilters] = useState({
    woodTypes: [],
    priceRange: [0, 100000],
    deliveryOnly: false
  });
  const [sortOption, setSortOption] = useState('default');
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 20,
    total: 0
  });

  // Load wood types
  useEffect(() => {
    const loadWoodTypes = async () => {
      try {
        setLoading(prev => ({ ...prev, woodTypes: true }));
        const response = await apiService.getWoodTypes();

        // Transform the wood types data
        const transformedWoodTypes = response.data.map(type => ({
          id: type.id,
          name: type.neme // API has a typo in the field name
        }));

        setWoodTypes(transformedWoodTypes);

        // Check if there's a wood type filter in the URL
        const woodTypeParam = searchParams.get('woodType');
        if (woodTypeParam) {
          setFilters(prev => ({
            ...prev,
            woodTypes: [woodTypeParam]
          }));
        }
      } catch (error) {
        console.error('Error loading wood types:', error);
        setError('Не удалось загрузить типы древесины. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(prev => ({ ...prev, woodTypes: false }));
      }
    };

    loadWoodTypes();
  }, [apiService, searchParams]);

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(prev => ({ ...prev, products: true }));

        // Get products from API
        const response = await apiService.getProducts(pagination.offset, pagination.limit);

        // Update pagination info
        setPagination(prev => ({
          ...prev,
          total: response.pagination?.total || 0
        }));

        // Transform products and add wood type names
        const enhancedProducts = await Promise.all(response.data.map(async (product) => {
          try {
            // Get wood type for each product
            const woodTypeResponse = await apiService.getWoodType(product.wood_type_id);
            const woodType = woodTypeResponse.data;

            // Calculate min and max prices for the filter
            if (product.price < priceRange.min) {
              setPriceRange(prev => ({ ...prev, min: product.price }));
            }
            if (product.price > priceRange.max) {
              setPriceRange(prev => ({ ...prev, max: product.price }));
            }

            return {
              id: product.id,
              title: product.title,
              description: product.descrioption, // API has a typo in the field name
              price: product.price,
              volume: product.volume,
              woodType: woodType.neme || 'Неизвестный тип', // API has a typo in the field name
              woodTypeId: product.wood_type_id,
              imageSrc: `https://via.placeholder.com/300x200?text=${encodeURIComponent(product.title)}`,
              deliveryPossible: product.delivery_possible,
              pickupLocation: product.pickup_location,
              createdAt: product.created_at,
              updatedAt: product.updated_at,
              sellerId: product.seller_id
            };
          } catch (error) {
            console.error(`Error fetching wood type for product ${product.id}:`, error);
            return {
              id: product.id,
              title: product.title,
              description: product.descrioption, // API has a typo in the field name
              price: product.price,
              volume: product.volume,
              woodType: 'Неизвестный тип',
              woodTypeId: product.wood_type_id,
              imageSrc: `https://via.placeholder.com/300x200?text=${encodeURIComponent(product.title)}`,
              deliveryPossible: product.delivery_possible,
              pickupLocation: product.pickup_location,
              createdAt: product.created_at,
              updatedAt: product.updated_at,
              sellerId: product.seller_id
            };
          }
        }));

        setProducts(enhancedProducts);
      } catch (error) {
        console.error('Error loading products:', error);
        setError('Не удалось загрузить товары. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(prev => ({ ...prev, products: false }));
      }
    };

    loadProducts();
  }, [apiService, pagination.offset, pagination.limit]);

  // Apply filters and sorting
  const filteredProducts = products.filter(product => {
    // Filter by wood type
    if (filters.woodTypes.length > 0) {
      // Direct comparison with woodTypeId since we now have it in the product
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

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
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
              woodTypes={woodTypes}
              priceRange={priceRange}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Main Content */}
          <div className="flex-grow">
            {/* Sort Controls */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-wood-text">
                Найдено товаров: <span className="font-semibold">{sortedProducts.length}</span>
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
              loading={loading.products || loading.woodTypes}
              error={error}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductsPage;
