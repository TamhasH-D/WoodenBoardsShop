import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useCart } from '../contexts/CartContext';
import { useNotifications } from '../contexts/NotificationContext';
import { BUYER_TEXTS, formatCurrencyRu } from '../utils/localization';
import { apiService } from '../services/api';
import ProductImageWithBoards from '../components/ProductImageWithBoards';
import ProductChat from '../components/ProductChat';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { setPageTitle } = useApp();
  const { addToCart, isInCart } = useCart();
  const { showCartSuccess, showError } = useNotifications();

  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [woodType, setWoodType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const chatRef = useRef(null);

  const buyerId = localStorage.getItem('buyer_id') || 'b8c8e1e0-1234-5678-9abc-def012345678';

  useEffect(() => {
    loadProductData();
  }, [productId]);

  const loadProductData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Загружаем данные товара
      const productResponse = await apiService.getProduct(productId);
      const productData = productResponse.data;
      setProduct(productData);
      setPageTitle(productData.title || productData.neme || 'Товар');

      // Загружаем данные продавца
      if (productData.seller_id) {
        try {
          const sellerResponse = await apiService.getSeller(productData.seller_id);
          setSeller(sellerResponse.data);
        } catch (err) {
          console.error('Ошибка загрузки продавца:', err);
        }
      }

      // Загружаем тип древесины
      if (productData.wood_type_id) {
        try {
          const woodTypeResponse = await apiService.getWoodType(productData.wood_type_id);
          setWoodType(woodTypeResponse.data);
        } catch (err) {
          console.error('Ошибка загрузки типа древесины:', err);
        }
      }

    } catch (err) {
      console.error('Ошибка загрузки товара:', err);
      setError('Товар не найден');
      showError('Не удалось загрузить товар');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      showCartSuccess(`${product.title || product.neme} добавлен в корзину`);
    }
  };

  const scrollToChat = () => {
    if (chatRef.current) {
      chatRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        backgroundColor: '#FAF7F0'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ color: '#6b7280', fontSize: '18px' }}>Загрузка товара...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        backgroundColor: '#FAF7F0',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>😞</div>
          <h2 style={{ margin: '0 0 16px 0', color: '#374151' }}>Товар не найден</h2>
          <p style={{ margin: '0 0 24px 0', color: '#6b7280' }}>
            Возможно, товар был удален или ссылка неверна
          </p>
          <button
            onClick={() => navigate('/products')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
          >
            Вернуться к каталогу
          </button>
        </div>
      </div>
    );
  }

  const pricePerCubicMeter = product.volume > 0 ? (product.price / product.volume).toFixed(0) : 0;

  return (
    <div style={{
      backgroundColor: '#FAF7F0',
      minHeight: '100vh',
      padding: '20px 0'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        {/* Хлебные крошки */}
        <nav style={{
          marginBottom: '20px',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          <button
            onClick={() => navigate('/products')}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563eb',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Каталог товаров
          </button>
          <span style={{ margin: '0 8px' }}>→</span>
          <span>{product.title || product.neme || 'Товар'}</span>
        </nav>

        {/* Основная информация о товаре */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth >= 768 ? '1fr 1fr' : '1fr',
          gap: '30px',
          marginBottom: '40px'
        }}>
          {/* Левая колонка - Изображение */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
          }}>
            <ProductImageWithBoards
              product={product}
              style={{ width: '100%', borderRadius: '8px' }}
            />
          </div>

          {/* Правая колонка - Информация */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            height: 'fit-content'
          }}>
            <h1 style={{
              margin: '0 0 20px 0',
              fontSize: '28px',
              fontWeight: '700',
              color: '#374151',
              lineHeight: '1.2'
            }}>
              {product.title || product.neme || 'Товар'}
            </h1>

            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <span style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#2563eb'
              }}>
                {formatCurrencyRu(product.price || 0)}
              </span>
              <span style={{
                fontSize: '16px',
                color: '#6b7280'
              }}>
                ({pricePerCubicMeter} ₽/м³)
              </span>
            </div>

            {product.descrioption && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{
                  margin: '0 0 12px 0',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Описание
                </h3>
                <p style={{
                  margin: 0,
                  color: '#6b7280',
                  lineHeight: '1.6'
                }}>
                  {product.descrioption}
                </p>
              </div>
            )}

            {/* Характеристики */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                margin: '0 0 16px 0',
                fontSize: '18px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Характеристики
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px'
              }}>
                <div style={{
                  padding: '12px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>Объем</div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#374151' }}>
                    {product.volume?.toFixed(4) || '0'} м³
                  </div>
                </div>
                <div style={{
                  padding: '12px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>Количество досок</div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#374151' }}>
                    {product.board_count || 'Не указано'}
                  </div>
                </div>
                {woodType && (
                  <div style={{
                    padding: '12px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    gridColumn: '1 / -1'
                  }}>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>Тип древесины</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#374151' }}>
                      {woodType.neme || woodType.name || 'Не указан'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Действия */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <button
                onClick={handleAddToCart}
                disabled={isInCart(product.id)}
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: isInCart(product.id) ? '#10b981' : '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: isInCart(product.id) ? 'default' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isInCart(product.id)) {
                    e.target.style.backgroundColor = '#1d4ed8';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isInCart(product.id)) {
                    e.target.style.backgroundColor = '#2563eb';
                  }
                }}
              >
                {isInCart(product.id) ? '✓ В корзине' : '🛒 Добавить в корзину'}
              </button>

              <button
                onClick={scrollToChat}
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: 'transparent',
                  color: '#2563eb',
                  border: '2px solid #2563eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#2563eb';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#2563eb';
                }}
              >
                💬 Написать продавцу
              </button>
            </div>
          </div>
        </div>

        {/* Информация о продавце */}
        {seller && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            marginBottom: '40px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{
              margin: '0 0 20px 0',
              fontSize: '24px',
              fontWeight: '700',
              color: '#374151'
            }}>
              О продавце
            </h2>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                🏪
              </div>
              <div>
                <h3 style={{
                  margin: '0 0 4px 0',
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  {seller.neme || seller.name || 'Продавец'}
                </h3>
                <p style={{
                  margin: 0,
                  color: '#6b7280',
                  fontSize: '14px'
                }}>
                  ID: {seller.id?.substring(0, 8)}...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Чат с продавцом */}
        <div ref={chatRef}>
          <ProductChat
            productId={productId}
            product={product}
            sellerId={product.seller_id}
            buyerId={buyerId}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ProductDetailPage;
