import { useState } from 'react';

/**
 * Профессиональные фильтры для каталога товаров
 * Современный UI/UX с анимациями и интерактивностью
 */
const ProductFilters = ({
  filters,
  onFiltersChange,
  woodTypes = [],
  sellers = [],
  onReset,
  totalProducts = 0,
  loading = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Проверяем, есть ли активные фильтры
  const hasActiveFilters = () => {
    return (filters.search_query && filters.search_query.trim()) ||
           (filters.price_min && filters.price_min !== '') ||
           (filters.price_max && filters.price_max !== '') ||
           (filters.volume_min && filters.volume_min !== '') ||
           (filters.volume_max && filters.volume_max !== '') ||
           (filters.wood_type_ids && filters.wood_type_ids.length > 0) ||
           (filters.seller_ids && filters.seller_ids.length > 0) ||
           filters.delivery_possible !== null ||
           filters.has_pickup_location !== null;
  };

  const activeFiltersCount = () => {
    let count = 0;
    if (filters.search_query && filters.search_query.trim()) count++;
    if (filters.price_min && filters.price_min !== '') count++;
    if (filters.price_max && filters.price_max !== '') count++;
    if (filters.volume_min && filters.volume_min !== '') count++;
    if (filters.volume_max && filters.volume_max !== '') count++;
    if (filters.wood_type_ids && filters.wood_type_ids.length > 0) count++;
    if (filters.seller_ids && filters.seller_ids.length > 0) count++;
    if (filters.delivery_possible !== null) count++;
    if (filters.has_pickup_location !== null) count++;
    return count;
  };



  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      overflow: 'hidden',
      marginBottom: '24px',
      border: '1px solid #d1d5db'
    }}>
      {/* Заголовок фильтров */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid #e5e7eb',
        background: '#f8fafc'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{
              margin: 0,
              fontSize: '1rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '2px'
            }}>
              Поиск и фильтрация
            </h3>
            <p style={{
              margin: 0,
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>
              {hasActiveFilters()
                ? `Применено фильтров: ${activeFiltersCount()} | Результатов: ${totalProducts}`
                : `Всего товаров: ${totalProducts}`
              }
            </p>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              padding: '6px 12px',
              color: '#374151',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#f3f4f6';
              e.target.style.borderColor = '#9ca3af';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'white';
              e.target.style.borderColor = '#d1d5db';
            }}
          >
            {isExpanded ? 'Скрыть фильтры' : 'Показать фильтры'}
            <span style={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
              fontSize: '0.75rem'
            }}>
              ▼
            </span>
          </button>
        </div>
      </div>

      {/* Основной поиск - всегда видимый */}
      <div style={{ padding: '20px 24px' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={filters.search_query || ''}
            onChange={(e) => {
              const query = e.target.value;
              onFiltersChange({ search_query: query });

              // Track search query
              if (window.umami && query.length >= 3) {
                window.umami.track('Catalog - Search Query', {
                  query: query,
                  queryLength: query.length
                });
              }
            }}
            placeholder="Поиск по названию, описанию, типу древесины"
            data-umami-event="Catalog - Search Input Focus"
            style={{
              width: '100%',
              padding: '10px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '0.875rem',
              transition: 'all 0.2s ease',
              outline: 'none',
              backgroundColor: 'white'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#d1d5db';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>


      </div>

      {/* Расширенные фильтры */}
      {isExpanded && (
        <div style={{
          borderTop: '1px solid #e2e8f0',
          animation: 'slideDown 0.3s ease-out'
        }}>
          {/* Табы */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc'
          }}>
            {[
              // { id: 'basic', label: 'Основные' },
              { id: 'price', label: 'Цена и объем' },
              { id: 'delivery', label: 'Доставка' },
              { id: 'sort', label: 'Сортировка' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: 'none',
                  backgroundColor: activeTab === tab.id ? 'white' : 'transparent',
                  borderBottom: activeTab === tab.id ? '2px solid #667eea' : '2px solid transparent',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: activeTab === tab.id ? '600' : '500',
                  color: activeTab === tab.id ? '#667eea' : '#64748b',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Содержимое табов */}
          <div style={{ padding: '24px' }}>
            {/* {activeTab === 'basic' && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    color: '#374151',
                    fontSize: '0.875rem'
                  }}>
                    Тип древесины
                  </label>
                  <select
                    value={filters.wood_type_ids?.[0] || ''}
                    onChange={(e) => {
                      const woodTypeId = e.target.value;
                      onFiltersChange({
                        wood_type_ids: woodTypeId ? [woodTypeId] : []
                      });

                      // Track wood type filter
                      if (window.umami) {
                        const woodTypeName = woodTypes.find(wt => wt.id === woodTypeId)?.neme || 'All';
                        window.umami.track('Catalog - Wood Type Filter', {
                          woodTypeId: woodTypeId || 'all',
                          woodTypeName: woodTypeName
                        });
                      }
                    }}
                    data-umami-event="Catalog - Wood Type Dropdown"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      backgroundColor: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">Все типы древесины</option>
                    {woodTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.neme || type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    color: '#374151',
                    fontSize: '0.9rem'
                  }}>
                    👤 Продавец
                  </label>
                  <select
                    value={filters.seller_ids?.[0] || ''}
                    onChange={(e) => {
                      const sellerId = e.target.value;
                      onFiltersChange({
                        seller_ids: sellerId ? [sellerId] : []
                      });

                      // Track seller filter
                      if (window.umami) {
                        const sellerName = sellers.find(s => s.id === sellerId)?.neme || 'All';
                        window.umami.track('Catalog - Seller Filter', {
                          sellerId: sellerId || 'all',
                          sellerName: sellerName
                        });
                      }
                    }}
                    data-umami-event="Catalog - Seller Dropdown"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      backgroundColor: 'white',
                      cursor: 'pointer'
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
              </div>
            )} */}

            {activeTab === 'price' && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px'
              }}>
                {/* Цена */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    color: '#374151',
                    fontSize: '0.9rem'
                  }}>
                    💰 Цена, ₽
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="number"
                      placeholder="От"
                      value={filters.price_min || ''}
                      onChange={(e) => {
                        const priceMin = e.target.value;
                        onFiltersChange({ price_min: priceMin });

                        // Track price filter
                        if (window.umami && priceMin) {
                          window.umami.track('Catalog - Price Min Filter', {
                            priceMin: parseFloat(priceMin) || 0,
                            priceMax: parseFloat(filters.price_max) || null
                          });
                        }
                      }}
                      data-umami-event="Catalog - Price Min Input"
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '0.9rem'
                      }}
                    />
                    <span style={{ color: '#9ca3af', fontWeight: '500' }}>—</span>
                    <input
                      type="number"
                      placeholder="До"
                      value={filters.price_max || ''}
                      onChange={(e) => {
                        const priceMax = e.target.value;
                        onFiltersChange({ price_max: priceMax });

                        // Track price filter
                        if (window.umami && priceMax) {
                          window.umami.track('Catalog - Price Max Filter', {
                            priceMin: parseFloat(filters.price_min) || null,
                            priceMax: parseFloat(priceMax) || 0
                          });
                        }
                      }}
                      data-umami-event="Catalog - Price Max Input"
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                </div>

                {/* Объем */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    color: '#374151',
                    fontSize: '0.9rem'
                  }}>
                    📦 Объем, м³
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="От"
                      value={filters.volume_min || ''}
                      onChange={(e) => onFiltersChange({ volume_min: e.target.value })}
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '0.9rem'
                      }}
                    />
                    <span style={{ color: '#9ca3af', fontWeight: '500' }}>—</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="До"
                      value={filters.volume_max || ''}
                      onChange={(e) => onFiltersChange({ volume_max: e.target.value })}
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'delivery' && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '12px',
                    fontWeight: '600',
                    color: '#374151',
                    fontSize: '0.9rem'
                  }}>
                    🚚 Варианты получения
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '6px',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <input
                        type="checkbox"
                        checked={filters.delivery_possible === true}
                        onChange={(e) => onFiltersChange({
                          delivery_possible: e.target.checked ? true : null
                        })}
                        style={{ transform: 'scale(1.2)' }}
                      />
                      <span style={{ fontSize: '0.9rem', color: '#374151' }}>
                        Доставка возможна
                      </span>
                    </label>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '6px',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <input
                        type="checkbox"
                        checked={filters.has_pickup_location === true}
                        onChange={(e) => onFiltersChange({
                          has_pickup_location: e.target.checked ? true : null
                        })}
                        style={{ transform: 'scale(1.2)' }}
                      />
                      <span style={{ fontSize: '0.9rem', color: '#374151' }}>
                        Есть самовывоз
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sort' && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    color: '#374151',
                    fontSize: '0.9rem'
                  }}>
                    📊 Сортировать по
                  </label>
                  <select
                    value={filters.sort_by || 'created_at'}
                    onChange={(e) => {
                      const sortBy = e.target.value;
                      onFiltersChange({ sort_by: sortBy });

                      // Track sort filter
                      if (window.umami) {
                        window.umami.track('Catalog - Sort Filter', {
                          sortBy: sortBy,
                          sortOrder: filters.sort_order || 'desc'
                        });
                      }
                    }}
                    data-umami-event="Catalog - Sort By Dropdown"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      backgroundColor: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="created_at">Дате добавления</option>
                    <option value="price">Цене</option>
                    <option value="volume">Объему</option>
                    <option value="title">Названию</option>
                  </select>
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    color: '#374151',
                    fontSize: '0.9rem'
                  }}>
                    🔄 Порядок
                  </label>
                  <select
                    value={filters.sort_order || 'desc'}
                    onChange={(e) => {
                      const sortOrder = e.target.value;
                      onFiltersChange({ sort_order: sortOrder });

                      // Track sort order filter
                      if (window.umami) {
                        window.umami.track('Catalog - Sort Order Filter', {
                          sortBy: filters.sort_by || 'created_at',
                          sortOrder: sortOrder
                        });
                      }
                    }}
                    data-umami-event="Catalog - Sort Order Dropdown"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      backgroundColor: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="desc">По убыванию</option>
                    <option value="asc">По возрастанию</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Кнопки действий */}
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            display: 'flex',
            gap: '12px',
            justifyContent: 'center'
          }}>
            <button
              onClick={onReset}
              disabled={!hasActiveFilters() || loading}
              style={{
                padding: '10px 20px',
                backgroundColor: hasActiveFilters() ? '#ef4444' : '#e2e8f0',
                color: hasActiveFilters() ? 'white' : '#9ca3af',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.9rem',
                cursor: hasActiveFilters() ? 'pointer' : 'not-allowed',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseEnter={(e) => {
                if (hasActiveFilters()) {
                  e.target.style.backgroundColor = '#dc2626';
                  e.target.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (hasActiveFilters()) {
                  e.target.style.backgroundColor = '#ef4444';
                  e.target.style.transform = 'translateY(0)';
                }
              }}
            >
              🗑️ Сбросить фильтры
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ProductFilters;
