import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BUYER_TEXTS, formatCurrencyRu } from '../utils/localization';
import { apiService } from '../services/api';
import ProductCard from '../components/ProductCard';

/**
 * Каталог товаров для покупателей
 * Поиск, фильтрация, пагинация через backend API
 */
const ProductsPage = () => {
  const navigate = useNavigate();

  // Состояние данных
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  
  // Справочные данные
  const [woodTypes, setWoodTypes] = useState([]);
  const [woodTypePrices, setWoodTypePrices] = useState([]);
  const [sellers, setSellers] = useState([]);

  // Фильтры и поиск
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [filters, setFilters] = useState({
    price_min: '',
    price_max: '',
    volume_min: '',
    volume_max: '',
    wood_type_ids: [],
    seller_ids: [],
    delivery_possible: null,
    has_pickup_location: null,
    sort_by: 'created_at',
    sort_order: 'desc'
  });

  const pageSize = 20;

  // Загрузка справочных данных
  useEffect(() => {
    loadReferenceData();
  }, []);

  // Загрузка товаров при изменении параметров (с debouncing для поиска)
  useEffect(() => {
    // Очищаем предыдущий таймер
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Если изменились только фильтры или страница - загружаем сразу
    // Если изменился поиск - ждем 500ms
    const isSearchChange = searchQuery !== '';

    if (isSearchChange) {
      const timeout = setTimeout(() => {
        loadProducts();
      }, 500);
      setSearchTimeout(timeout);
    } else {
      loadProducts();
    }

    // Cleanup function
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [currentPage, searchQuery, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadReferenceData = async () => {
    try {
      const [woodTypesRes, woodTypePricesRes, sellersRes] = await Promise.all([
        apiService.getWoodTypes(0, 100),
        apiService.getWoodTypePrices(0, 100),
        apiService.getSellers(0, 100)
      ]);

      setWoodTypes(woodTypesRes.data || []);
      setWoodTypePrices(woodTypePricesRes.data || []);
      setSellers(sellersRes.data || []);
    } catch (error) {
      console.error('Ошибка загрузки справочных данных:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);

      let result;

      // Если есть поиск или фильтры, используем search API
      if (searchQuery.trim() || hasActiveFilters()) {
        const searchFilters = buildSearchFilters();
        result = await apiService.searchProducts(searchFilters, currentPage, pageSize);
      } else {
        // Иначе используем обычный getProducts
        result = await apiService.getProducts(currentPage, pageSize);
      }

      setProducts(result.data || []);
      setTotalProducts(result.total || 0);
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
      setProducts([]);
      setTotalProducts(0);
    } finally {
      setLoading(false);
    }
  };

  // Проверяем, есть ли активные фильтры
  const hasActiveFilters = () => {
    return filters.price_min || filters.price_max || 
           filters.volume_min || filters.volume_max ||
           filters.wood_type_ids.length > 0 ||
           filters.seller_ids.length > 0 ||
           filters.delivery_possible !== null ||
           filters.has_pickup_location !== null;
  };

  // Строим объект фильтров для API
  const buildSearchFilters = () => {
    const searchFilters = { ...filters };
    
    if (searchQuery.trim()) {
      searchFilters.search_query = searchQuery.trim();
    }

    // Конвертируем пустые строки в undefined
    if (!searchFilters.price_min) searchFilters.price_min = undefined;
    if (!searchFilters.price_max) searchFilters.price_max = undefined;
    if (!searchFilters.volume_min) searchFilters.volume_min = undefined;
    if (!searchFilters.volume_max) searchFilters.volume_max = undefined;

    return searchFilters;
  };

  // Получаем название типа древесины
  const getWoodTypeName = (woodTypeId) => {
    const woodType = woodTypes.find(wt => wt.id === woodTypeId);
    return woodType?.neme || woodType?.name || 'Не указан';
  };

  // Получаем цену типа древесины
  const getWoodTypePrice = (woodTypeId) => {
    const price = woodTypePrices.find(wtp => wtp.wood_type_id === woodTypeId);
    return price?.price_per_cubic_meter || 0;
  };

  // Получаем название продавца
  const getSellerName = (sellerId) => {
    const seller = sellers.find(s => s.id === sellerId);
    return seller?.neme || seller?.name || 'Неизвестный продавец';
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(0);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(0);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetFilters = () => {
    setFilters({
      price_min: '',
      price_max: '',
      volume_min: '',
      volume_max: '',
      wood_type_ids: [],
      seller_ids: [],
      delivery_possible: null,
      has_pickup_location: null,
      sort_by: 'created_at',
      sort_order: 'desc'
    });
    setSearchQuery('');
    setCurrentPage(0);
  };

  const totalPages = Math.ceil(totalProducts / pageSize);

  return (
    <div className="products-page" style={{ 
      backgroundColor: '#FAF7F0', 
      minHeight: '100vh',
      padding: '0 5%' // Большие отступы от краев
    }}>
      {/* Заголовок страницы */}
      <div className="page-header" style={{ 
        textAlign: 'center', 
        padding: '40px 0',
        backgroundColor: 'white',
        borderRadius: '16px',
        margin: '20px 0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          color: '#2D3748',
          marginBottom: '16px',
          fontWeight: '700'
        }}>
          {BUYER_TEXTS.PRODUCTS || 'Каталог товаров'}
        </h1>
        <p style={{ 
          fontSize: '1.1rem', 
          color: '#718096',
          marginBottom: '20px'
        }}>
          Каталог древесины от проверенных поставщиков
        </p>
        {totalProducts > 0 && (
          <div style={{ 
            fontSize: '1rem', 
            color: '#4A5568',
            fontWeight: '500'
          }}>
            Найдено {totalProducts} товаров
          </div>
        )}
      </div>

      {/* Фильтры и поиск */}
      <div className="filters-section" style={{ marginBottom: '30px' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '30px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          marginBottom: '20px'
        }}>
          {/* Поиск */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              fontWeight: '600',
              color: '#2D3748'
            }}>
              Поиск товаров
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Введите название товара или описание..."
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '1rem',
                transition: 'border-color 0.2s',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3182CE'}
              onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
            />
          </div>

          {/* Фильтры в сетке */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '25px'
          }}>
            {/* Фильтр по типу древесины */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#2D3748'
              }}>
                Тип древесины
              </label>
              <select
                value={filters.wood_type_ids[0] || ''}
                onChange={(e) => handleFilterChange({
                  wood_type_ids: e.target.value ? [e.target.value] : []
                })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #E2E8F0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  backgroundColor: 'white'
                }}
              >
                <option value="">Все типы</option>
                {woodTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.neme || type.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Фильтр по продавцу */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#2D3748'
              }}>
                Продавец
              </label>
              <select
                value={filters.seller_ids[0] || ''}
                onChange={(e) => handleFilterChange({
                  seller_ids: e.target.value ? [e.target.value] : []
                })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #E2E8F0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  backgroundColor: 'white'
                }}
              >
                <option value="">Все продавцы</option>
                {sellers.map(seller => (
                  <option key={seller.id} value={seller.id}>
                    {seller.neme || seller.name || 'Продавец'}
                  </option>
                ))}
              </select>
            </div>

            {/* Сортировка */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#2D3748'
              }}>
                Сортировка
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  value={filters.sort_by}
                  onChange={(e) => handleFilterChange({ sort_by: e.target.value })}
                  style={{
                    flex: 2,
                    padding: '12px 16px',
                    border: '2px solid #E2E8F0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="created_at">По дате</option>
                  <option value="price">По цене</option>
                  <option value="volume">По объему</option>
                  <option value="title">По названию</option>
                </select>
                <select
                  value={filters.sort_order}
                  onChange={(e) => handleFilterChange({ sort_order: e.target.value })}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: '2px solid #E2E8F0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="desc">↓</option>
                  <option value="asc">↑</option>
                </select>
              </div>
            </div>
          </div>

          {/* Дополнительные фильтры */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '25px'
          }}>
            {/* Фильтр по цене */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#2D3748'
              }}>
                Цена, ₽
              </label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="number"
                  placeholder="От"
                  value={filters.price_min}
                  onChange={(e) => handleFilterChange({ price_min: e.target.value })}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: '2px solid #E2E8F0',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
                <span style={{ color: '#718096', fontWeight: '500' }}>—</span>
                <input
                  type="number"
                  placeholder="До"
                  value={filters.price_max}
                  onChange={(e) => handleFilterChange({ price_max: e.target.value })}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: '2px solid #E2E8F0',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>

            {/* Фильтр по объему */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#2D3748'
              }}>
                Объем, м³
              </label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="number"
                  placeholder="От"
                  value={filters.volume_min}
                  onChange={(e) => handleFilterChange({ volume_min: e.target.value })}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: '2px solid #E2E8F0',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
                <span style={{ color: '#718096', fontWeight: '500' }}>—</span>
                <input
                  type="number"
                  placeholder="До"
                  value={filters.volume_max}
                  onChange={(e) => handleFilterChange({ volume_max: e.target.value })}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: '2px solid #E2E8F0',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>

            {/* Фильтры по доставке */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#2D3748'
              }}>
                Доставка
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.9rem',
                  color: '#4A5568',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={filters.delivery_possible === true}
                    onChange={(e) => handleFilterChange({
                      delivery_possible: e.target.checked ? true : null
                    })}
                    style={{ transform: 'scale(1.2)' }}
                  />
                  Доставка возможна
                </label>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.9rem',
                  color: '#4A5568',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={filters.has_pickup_location === true}
                    onChange={(e) => handleFilterChange({
                      has_pickup_location: e.target.checked ? true : null
                    })}
                    style={{ transform: 'scale(1.2)' }}
                  />
                  Есть самовывоз
                </label>
              </div>
            </div>
          </div>

          {/* Кнопка сброса фильтров */}
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={resetFilters}
              style={{
                padding: '10px 20px',
                backgroundColor: '#E2E8F0',
                color: '#4A5568',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.9rem',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#CBD5E0'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#E2E8F0'}
            >
              Сбросить фильтры
            </button>
          </div>
        </div>
      </div>

      {/* Список товаров */}
      <div className="products-section">
        {loading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '25px',
            marginBottom: '40px'
          }}>
            {Array.from({ length: pageSize }).map((_, index) => (
              <div key={index} style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                height: '400px'
              }}>
                <div style={{
                  width: '100%',
                  height: '200px',
                  backgroundColor: '#E2E8F0',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  animation: 'pulse 1.5s ease-in-out infinite'
                }}></div>
                <div style={{
                  height: '20px',
                  backgroundColor: '#E2E8F0',
                  borderRadius: '4px',
                  marginBottom: '12px',
                  animation: 'pulse 1.5s ease-in-out infinite'
                }}></div>
                <div style={{
                  height: '16px',
                  backgroundColor: '#E2E8F0',
                  borderRadius: '4px',
                  marginBottom: '16px',
                  width: '70%',
                  animation: 'pulse 1.5s ease-in-out infinite'
                }}></div>
                <div style={{
                  height: '40px',
                  backgroundColor: '#E2E8F0',
                  borderRadius: '8px',
                  animation: 'pulse 1.5s ease-in-out infinite'
                }}></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '25px',
              marginBottom: '40px'
            }}>
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  woodTypeName={getWoodTypeName(product.wood_type_id)}
                  woodTypePrice={getWoodTypePrice(product.wood_type_id)}
                  sellerName={getSellerName(product.seller_id)}
                  navigate={navigate}
                  variant="catalog"
                />
              ))}
            </div>

            {/* Пагинация */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '20px',
                padding: '30px 0',
                backgroundColor: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: currentPage === 0 ? '#E2E8F0' : '#3182CE',
                    color: currentPage === 0 ? '#A0AEC0' : 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    transition: 'background-color 0.2s'
                  }}
                >
                  ← Предыдущая
                </button>

                <div style={{
                  fontSize: '1rem',
                  color: '#4A5568',
                  fontWeight: '500'
                }}>
                  Страница {currentPage + 1} из {totalPages}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: currentPage >= totalPages - 1 ? '#E2E8F0' : '#3182CE',
                    color: currentPage >= totalPages - 1 ? '#A0AEC0' : 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    transition: 'background-color 0.2s'
                  }}
                >
                  Следующая →
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔍</div>
            <h3 style={{
              fontSize: '1.5rem',
              color: '#2D3748',
              marginBottom: '12px',
              fontWeight: '600'
            }}>
              Товары не найдены
            </h3>
            <p style={{
              fontSize: '1rem',
              color: '#718096',
              marginBottom: '25px'
            }}>
              Попробуйте изменить параметры поиска или фильтры
            </p>
            <button
              onClick={resetFilters}
              style={{
                padding: '12px 24px',
                backgroundColor: '#3182CE',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#2C5282'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#3182CE'}
            >
              Сбросить фильтры
            </button>
          </div>
        )}
      </div>
    </div>
  );
};



export default ProductsPage;