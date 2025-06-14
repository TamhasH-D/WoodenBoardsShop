import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../services/api';
import ProductFilters from './ProductFilters';
import ProductCard from '../common/ProductCard';

/**
 * Профессиональный каталог товаров для покупателей
 * Современный UI/UX с фильтрацией, сортировкой и пагинацией
 */
const ProductCatalog = () => {
  // Состояние данных
  const [products, setProducts] = useState([]);
  const [woodTypes, setWoodTypes] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Состояние фильтров и пагинации
  const [filters, setFilters] = useState({
    search_query: '',
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

  const [pagination, setPagination] = useState({
    page: 0,
    size: 12,
    total: 0
  });

  // Состояние UI
  const [viewMode, setViewMode] = useState('catalog'); // 'catalog', 'grid', 'list'
  const [showLoadingDelay, setShowLoadingDelay] = useState(false);

  // Загрузка справочных данных
  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        const [woodTypesData, sellersData] = await Promise.all([
          apiService.getAllWoodTypes(),
          apiService.getAllSellers()
        ]);
        
        setWoodTypes(woodTypesData.data || []);
        setSellers(sellersData.data || []);
      } catch (error) {
        console.error('Ошибка загрузки справочных данных:', error);
      }
    };

    loadReferenceData();
  }, []);

  // Загрузка товаров с дебаунсом
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Показываем спиннер только если загрузка длится больше 300мс
    const loadingTimer = setTimeout(() => setShowLoadingDelay(true), 300);

    try {
      const result = await apiService.searchProducts(filters, pagination.page, pagination.size);
      
      setProducts(result.data || []);
      setPagination(prev => ({
        ...prev,
        total: result.total || 0
      }));
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
      setError('Не удалось загрузить товары. Попробуйте обновить страницу.');
      setProducts([]);
    } finally {
      clearTimeout(loadingTimer);
      setLoading(false);
      setShowLoadingDelay(false);
    }
  }, [filters, pagination.page, pagination.size]);

  // Загружаем товары при изменении фильтров или пагинации
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Обработчики событий
  const handleFiltersChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 0 })); // Сбрасываем на первую страницу
    apiService.clearSearchCache(); // Очищаем кеш для немедленного обновления
  };

  const handleResetFilters = () => {
    setFilters({
      search_query: '',
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
    setPagination(prev => ({ ...prev, page: 0 }));
    apiService.clearSearchCache();
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Вспомогательные функции
  const getWoodTypeName = (woodTypeId) => {
    const woodType = woodTypes.find(wt => wt.id === woodTypeId);
    return woodType?.neme || woodType?.name || 'Не указан';
  };

  const getSellerName = (sellerId) => {
    const seller = sellers.find(s => s.id === sellerId);
    return seller?.neme || seller?.name || 'Неизвестный продавец';
  };

  const totalPages = Math.ceil(pagination.total / pagination.size);
  const startItem = pagination.page * pagination.size + 1;
  const endItem = Math.min((pagination.page + 1) * pagination.size, pagination.total);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Заголовок */}
        <div style={{
          marginBottom: '32px',
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: '24px'
        }}>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '8px',
            margin: 0
          }}>
            Каталог пиломатериалов
          </h1>
          <p style={{
            fontSize: '1rem',
            color: '#6b7280',
            fontWeight: '400',
            margin: 0
          }}>
            Качественная древесина от проверенных поставщиков
          </p>
        </div>

        {/* Фильтры */}
        <ProductFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          woodTypes={woodTypes}
          sellers={sellers}
          onReset={handleResetFilters}
          totalProducts={pagination.total}
          loading={loading}
        />

        {/* Панель управления */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '16px 24px',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          border: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Информация о результатах */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              fontSize: '0.9rem',
              color: '#64748b',
              fontWeight: '500'
            }}>
              {pagination.total > 0 ? (
                <>
                  Показано <strong>{startItem}-{endItem}</strong> из <strong>{pagination.total}</strong> товаров
                </>
              ) : (
                'Товары не найдены'
              )}
            </div>
          </div>

          {/* Переключатель вида */}
          <div style={{
            display: 'flex',
            gap: '2px',
            backgroundColor: '#f9fafb',
            padding: '2px',
            borderRadius: '4px',
            border: '1px solid #e5e7eb'
          }}>
            {[
              { id: 'catalog', label: 'Каталог' },
              { id: 'grid', label: 'Сетка' },
              { id: 'list', label: 'Список' }
            ].map(mode => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: viewMode === mode.id ? 'white' : 'transparent',
                  border: viewMode === mode.id ? '1px solid #d1d5db' : '1px solid transparent',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: '500',
                  color: viewMode === mode.id ? '#374151' : '#6b7280',
                  transition: 'all 0.2s ease',
                  boxShadow: viewMode === mode.id ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Контент */}
        {error ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '48px 24px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            border: '1px solid #fecaca'
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '16px'
            }}>
              😞
            </div>
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              color: '#dc2626',
              marginBottom: '8px'
            }}>
              Ошибка загрузки
            </h3>
            <p style={{
              color: '#64748b',
              marginBottom: '24px'
            }}>
              {error}
            </p>
            <button
              onClick={loadProducts}
              style={{
                padding: '12px 24px',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#5a67d8'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#667eea'}
            >
              🔄 Попробовать снова
            </button>
          </div>
        ) : loading && showLoadingDelay ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '48px 24px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '4px solid #e5e7eb',
              borderTopColor: '#667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }} />
            <p style={{
              color: '#64748b',
              fontSize: '1rem',
              fontWeight: '500'
            }}>
              Загружаем товары...
            </p>
          </div>
        ) : products.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '48px 24px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '16px'
            }}>
              🔍
            </div>
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Товары не найдены
            </h3>
            <p style={{
              color: '#64748b',
              marginBottom: '24px'
            }}>
              Попробуйте изменить параметры поиска или сбросить фильтры
            </p>
            <button
              onClick={handleResetFilters}
              style={{
                padding: '12px 24px',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#5a67d8'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#667eea'}
            >
              🗑️ Сбросить фильтры
            </button>
          </div>
        ) : (
          <>
            {/* Сетка товаров */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: viewMode === 'list'
                ? '1fr'
                : viewMode === 'grid'
                ? 'repeat(auto-fit, minmax(280px, 1fr))'
                : 'repeat(auto-fit, minmax(380px, 1fr))',
              gap: viewMode === 'list' ? '16px' : (viewMode === 'grid' ? '20px' : '24px'),
              marginBottom: '32px',
              justifyContent: 'center'
            }}>
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  woodTypeName={getWoodTypeName(product.wood_type_id)}
                  sellerName={getSellerName(product.seller_id)}
                  sellerId={product.seller_id}
                  variant={viewMode}
                  showDescription={viewMode === 'catalog'}
                  showSeller={false}
                />
              ))}
            </div>

            {/* Пагинация */}
            {totalPages > 1 && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '16px 24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                {/* Информация о страницах */}
                <div style={{
                  fontSize: '0.875rem',
                  color: '#6b7280'
                }}>
                  Страница {pagination.page + 1} из {totalPages}
                </div>

                {/* Навигация */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {/* Первая страница */}
                  <button
                    onClick={() => handlePageChange(0)}
                    disabled={pagination.page === 0}
                    style={{
                      padding: '6px 10px',
                      backgroundColor: 'white',
                      color: pagination.page === 0 ? '#9ca3af' : '#374151',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      cursor: pagination.page === 0 ? 'not-allowed' : 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: '500',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (pagination.page !== 0) {
                        e.target.style.backgroundColor = '#f3f4f6';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (pagination.page !== 0) {
                        e.target.style.backgroundColor = 'white';
                      }
                    }}
                  >
                    Первая
                  </button>

                  {/* Предыдущая */}
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 0}
                    style={{
                      padding: '6px 10px',
                      backgroundColor: 'white',
                      color: pagination.page === 0 ? '#9ca3af' : '#374151',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      cursor: pagination.page === 0 ? 'not-allowed' : 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: '500',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (pagination.page !== 0) {
                        e.target.style.backgroundColor = '#f3f4f6';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (pagination.page !== 0) {
                        e.target.style.backgroundColor = 'white';
                      }
                    }}
                  >
                    ← Назад
                  </button>

                  {/* Номера страниц */}
                  <div style={{
                    display: 'flex',
                    gap: '2px',
                    margin: '0 8px'
                  }}>
                    {(() => {
                      const pages = [];
                      const current = pagination.page;
                      const total = totalPages;

                      // Показываем первую страницу если не в начале
                      if (current > 2) {
                        pages.push(
                          <button
                            key={0}
                            onClick={() => handlePageChange(0)}
                            style={{
                              padding: '6px 10px',
                              backgroundColor: 'white',
                              color: '#374151',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              fontWeight: '500',
                              minWidth: '36px'
                            }}
                          >
                            1
                          </button>
                        );

                        if (current > 3) {
                          pages.push(
                            <span key="dots1" style={{
                              padding: '6px 4px',
                              color: '#9ca3af',
                              fontSize: '0.8rem'
                            }}>
                              ...
                            </span>
                          );
                        }
                      }

                      // Показываем текущую страницу и соседние
                      const start = Math.max(0, current - 1);
                      const end = Math.min(total - 1, current + 1);

                      for (let i = start; i <= end; i++) {
                        pages.push(
                          <button
                            key={i}
                            onClick={() => handlePageChange(i)}
                            style={{
                              padding: '6px 10px',
                              backgroundColor: pagination.page === i ? '#3b82f6' : 'white',
                              color: pagination.page === i ? 'white' : '#374151',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              fontWeight: pagination.page === i ? '600' : '500',
                              minWidth: '36px',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              if (pagination.page !== i) {
                                e.target.style.backgroundColor = '#f3f4f6';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (pagination.page !== i) {
                                e.target.style.backgroundColor = 'white';
                              }
                            }}
                          >
                            {i + 1}
                          </button>
                        );
                      }

                      // Показываем последнюю страницу если не в конце
                      if (current < total - 3) {
                        pages.push(
                          <span key="dots2" style={{
                            padding: '6px 4px',
                            color: '#9ca3af',
                            fontSize: '0.8rem'
                          }}>
                            ...
                          </span>
                        );
                      }

                      if (current < total - 2) {
                        pages.push(
                          <button
                            key={total - 1}
                            onClick={() => handlePageChange(total - 1)}
                            style={{
                              padding: '6px 10px',
                              backgroundColor: 'white',
                              color: '#374151',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              fontWeight: '500',
                              minWidth: '36px'
                            }}
                          >
                            {total}
                          </button>
                        );
                      }

                      return pages;
                    })()}
                  </div>

                  {/* Следующая */}
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= totalPages - 1}
                    style={{
                      padding: '6px 10px',
                      backgroundColor: 'white',
                      color: pagination.page >= totalPages - 1 ? '#9ca3af' : '#374151',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      cursor: pagination.page >= totalPages - 1 ? 'not-allowed' : 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: '500',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (pagination.page < totalPages - 1) {
                        e.target.style.backgroundColor = '#f3f4f6';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (pagination.page < totalPages - 1) {
                        e.target.style.backgroundColor = 'white';
                      }
                    }}
                  >
                    Вперед →
                  </button>

                  {/* Последняя страница */}
                  <button
                    onClick={() => handlePageChange(totalPages - 1)}
                    disabled={pagination.page >= totalPages - 1}
                    style={{
                      padding: '6px 10px',
                      backgroundColor: 'white',
                      color: pagination.page >= totalPages - 1 ? '#9ca3af' : '#374151',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      cursor: pagination.page >= totalPages - 1 ? 'not-allowed' : 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: '500',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (pagination.page < totalPages - 1) {
                        e.target.style.backgroundColor = '#f3f4f6';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (pagination.page < totalPages - 1) {
                        e.target.style.backgroundColor = 'white';
                      }
                    }}
                  >
                    Последняя
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ProductCatalog;
