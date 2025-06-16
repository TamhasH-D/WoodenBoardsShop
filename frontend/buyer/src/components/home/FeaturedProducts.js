import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import ProductCard from '../common/ProductCard';

/**
 * Компонент рекомендуемых товаров для главной страницы
 */
const FeaturedProducts = ({ 
  title = "Рекомендуемые товары",
  subtitle = "Качественная древесина от проверенных поставщиков",
  limit = 6,
  variant = "hero" // hero, grid, catalog
}) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [woodTypes, setWoodTypes] = useState({});
  const [sellers, setSellers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFeaturedProducts();
  }, [limit]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Загружаем товары
      const response = await apiService.searchProducts({
        limit,
        offset: 0,
        sort_by: 'created_at',
        sort_order: 'desc'
      });

      if (response.products && response.products.length > 0) {
        setProducts(response.products);

        // Загружаем типы древесины
        const woodTypesResponse = await apiService.getWoodTypes();
        const woodTypesMap = {};
        woodTypesResponse.forEach(type => {
          woodTypesMap[type.id] = type;
        });
        setWoodTypes(woodTypesMap);

        // Загружаем информацию о продавцах
        const sellerIds = [...new Set(response.products.map(p => p.seller_id))];
        const sellersMap = {};
        
        await Promise.all(sellerIds.map(async (sellerId) => {
          try {
            const seller = await apiService.getSellerById(sellerId);
            sellersMap[sellerId] = seller;
          } catch (error) {
            console.warn(`Failed to load seller ${sellerId}:`, error);
            sellersMap[sellerId] = { name: 'Неизвестный продавец' };
          }
        }));
        
        setSellers(sellersMap);
      }
    } catch (error) {
      console.error('Failed to load featured products:', error);
      setError('Не удалось загрузить товары');
    } finally {
      setLoading(false);
    }
  };

  const handleViewAll = () => {
    navigate('/products');
  };

  const handleChatStart = (product, sellerId) => {
    // Кастомная логика для главной страницы
    console.log('Starting chat for product:', product.id, 'with seller:', sellerId);
    navigate(`/products/${product.id}`);
  };

  if (loading) {
    return (
      <section style={{
        padding: '60px 0',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '48px'
          }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '8px'
            }}>
              {title}
            </h2>
            <p style={{
              fontSize: '1.125rem',
              color: '#6b7280'
            }}>
              {subtitle}
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fit, minmax(${variant === 'hero' ? '380px' : '320px'}, 1fr))`,
            gap: '24px',
            justifyContent: 'center'
          }}>
            {Array.from({ length: limit }).map((_, index) => (
              <div
                key={index}
                style={{
                  height: variant === 'hero' ? '480px' : '380px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#9ca3af',
                  fontSize: '0.875rem'
                }}
              >
                Загрузка...
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section style={{
        padding: '60px 0',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          textAlign: 'center'
        }}>
          <div style={{
            color: '#ef4444',
            fontSize: '1rem',
            marginBottom: '16px'
          }}>
            {error}
          </div>
          <button
            onClick={loadFeaturedProducts}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Попробовать снова
          </button>
        </div>
      </section>
    );
  }

  if (!products.length) {
    return (
      <section style={{
        padding: '60px 0',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            {title}
          </h2>
          <p style={{
            fontSize: '1.125rem',
            color: '#6b7280',
            marginBottom: '24px'
          }}>
            Товары пока не добавлены
          </p>
          <button
            onClick={handleViewAll}
            style={{
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Перейти в каталог
          </button>
        </div>
      </section>
    );
  }

  return (
    <section style={{
      padding: '60px 0',
      backgroundColor: '#f8fafc'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px'
      }}>
        {/* Заголовок */}
        <div style={{
          textAlign: 'center',
          marginBottom: '48px'
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            {title}
          </h2>
          <p style={{
            fontSize: '1.125rem',
            color: '#6b7280'
          }}>
            {subtitle}
          </p>
        </div>
        
        {/* Сетка товаров */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fit, minmax(${variant === 'hero' ? '380px' : '320px'}, 1fr))`,
          gap: '24px',
          marginBottom: '48px',
          justifyContent: 'center'
        }}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              woodTypeName={woodTypes[product.wood_type_id]?.name}
              sellerName={sellers[product.seller_id]?.name}
              sellerId={product.seller_id}
              variant={variant}
              showDescription={variant === 'hero'}
              showSeller={false}
              onChatStart={handleChatStart}
            />
          ))}
        </div>
        
        {/* Кнопка "Смотреть все" */}
        <div style={{
          textAlign: 'center'
        }}>
          <button
            onClick={handleViewAll}
            style={{
              padding: '12px 32px',
              backgroundColor: 'transparent',
              color: '#3b82f6',
              border: '2px solid #3b82f6',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#3b82f6';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#3b82f6';
            }}
          >
            Смотреть все товары
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
