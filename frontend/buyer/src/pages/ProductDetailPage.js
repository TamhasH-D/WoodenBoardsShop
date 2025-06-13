import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useCart } from '../contexts/CartContext';
import { useNotifications } from '../contexts/NotificationContext';
import { formatCurrencyRu } from '../utils/localization';
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
  }, [productId]); // eslint-disable-line react-hooks/exhaustive-deps

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
      padding: window.innerWidth >= 768 ? '24px 0' : '16px 0'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: window.innerWidth >= 768 ? '0 24px' : '0 16px'
      }}>
        {/* Хлебные крошки */}
        <nav style={{
          marginBottom: '24px',
          fontSize: '14px',
          color: '#64748b',
          padding: '16px 20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => navigate('/products')}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563eb',
                cursor: 'pointer',
                textDecoration: 'none',
                fontWeight: '500',
                padding: '4px 8px',
                borderRadius: '6px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#eff6ff';
                e.target.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.textDecoration = 'none';
              }}
            >
              🏠 Каталог товаров
            </button>
            <span style={{ color: '#cbd5e1', fontSize: '16px' }}>→</span>
            <span style={{
              color: '#1f2937',
              fontWeight: '600',
              maxWidth: '300px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {product.title || product.neme || 'Товар'}
            </span>
          </div>
        </nav>

        {/* Основная информация о товаре */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth >= 1024 ? '1.2fr 1fr' : window.innerWidth >= 768 ? '1fr 1fr' : '1fr',
          gap: '30px',
          marginBottom: '40px'
        }}>
          {/* Левая колонка - Изображение */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid rgba(0,0,0,0.05)'
          }}>
            <ProductImageWithBoards
              product={product}
              style={{ width: '100%', borderRadius: '12px' }}
            />
          </div>

          {/* Правая колонка - Информация */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid rgba(0,0,0,0.05)',
            height: 'fit-content'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: '24px'
            }}>
              <h1 style={{
                margin: 0,
                fontSize: window.innerWidth >= 768 ? '32px' : '28px',
                fontWeight: '700',
                color: '#1f2937',
                lineHeight: '1.2',
                flex: 1
              }}>
                {product.title || product.neme || 'Товар'}
              </h1>
              {product.delivery_possible && (
                <div style={{
                  backgroundColor: '#dcfce7',
                  color: '#166534',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginLeft: '16px',
                  whiteSpace: 'nowrap'
                }}>
                  🚚 Доставка
                </div>
              )}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '16px',
              marginBottom: '24px',
              padding: '20px',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              border: '2px solid #e2e8f0'
            }}>
              <span style={{
                fontSize: '36px',
                fontWeight: '800',
                color: '#2563eb'
              }}>
                {formatCurrencyRu(product.price || 0)}
              </span>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <span style={{
                  fontSize: '16px',
                  color: '#64748b',
                  fontWeight: '500'
                }}>
                  {pricePerCubicMeter} ₽/м³
                </span>
                <span style={{
                  fontSize: '14px',
                  color: '#94a3b8'
                }}>
                  за кубический метр
                </span>
              </div>
            </div>

            {product.descrioption && (
              <div style={{ marginBottom: '28px' }}>
                <h3 style={{
                  margin: '0 0 16px 0',
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1f2937',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  📝 Описание
                </h3>
                <div style={{
                  padding: '20px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}>
                  <p style={{
                    margin: 0,
                    color: '#475569',
                    lineHeight: '1.7',
                    fontSize: '16px'
                  }}>
                    {product.descrioption}
                  </p>
                </div>
              </div>
            )}

            {/* Характеристики */}
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{
                margin: '0 0 20px 0',
                fontSize: '20px',
                fontWeight: '600',
                color: '#1f2937',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                📊 Характеристики
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: window.innerWidth >= 640 ? 'repeat(2, 1fr)' : '1fr',
                gap: '16px'
              }}>
                <div style={{
                  padding: '20px',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '14px',
                    color: '#64748b',
                    fontWeight: '500',
                    marginBottom: '8px'
                  }}>
                    📦 Объем
                  </div>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#1e293b'
                  }}>
                    {product.volume?.toFixed(4) || '0'} м³
                  </div>
                </div>
                <div style={{
                  padding: '20px',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '14px',
                    color: '#64748b',
                    fontWeight: '500',
                    marginBottom: '8px'
                  }}>
                    🪵 Количество досок
                  </div>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#1e293b'
                  }}>
                    {product.wooden_boards?.length || product.board_count || 'Не указано'}
                  </div>
                </div>
                {woodType && (
                  <div style={{
                    padding: '20px',
                    backgroundColor: '#f0fdf4',
                    borderRadius: '12px',
                    border: '1px solid #bbf7d0',
                    gridColumn: window.innerWidth >= 640 ? '1 / -1' : 'auto',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      color: '#15803d',
                      fontWeight: '500',
                      marginBottom: '8px'
                    }}>
                      🌳 Тип древесины
                    </div>
                    <div style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      color: '#14532d'
                    }}>
                      {woodType.neme || woodType.name || 'Не указан'}
                    </div>
                  </div>
                )}
                {product.pickup_location && (
                  <div style={{
                    padding: '20px',
                    backgroundColor: '#fef3c7',
                    borderRadius: '12px',
                    border: '1px solid #fcd34d',
                    gridColumn: window.innerWidth >= 640 ? '1 / -1' : 'auto',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      color: '#92400e',
                      fontWeight: '500',
                      marginBottom: '8px'
                    }}>
                      📍 Адрес самовывоза
                    </div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#78350f'
                    }}>
                      {product.pickup_location}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Действия */}
            <div style={{
              display: 'flex',
              flexDirection: window.innerWidth >= 640 ? 'row' : 'column',
              gap: '16px'
            }}>
              <button
                onClick={handleAddToCart}
                disabled={isInCart(product.id)}
                style={{
                  flex: 1,
                  padding: '18px 24px',
                  backgroundColor: isInCart(product.id) ? '#059669' : '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: isInCart(product.id) ? 'default' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: isInCart(product.id) ? '0 4px 16px rgba(5, 150, 105, 0.3)' : '0 4px 16px rgba(37, 99, 235, 0.3)',
                  transform: 'translateY(0)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (!isInCart(product.id)) {
                    e.target.style.backgroundColor = '#1d4ed8';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 24px rgba(37, 99, 235, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isInCart(product.id)) {
                    e.target.style.backgroundColor = '#2563eb';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 16px rgba(37, 99, 235, 0.3)';
                  }
                }}
              >
                {isInCart(product.id) ? (
                  <>
                    <span>✓</span>
                    <span>В корзине</span>
                  </>
                ) : (
                  <>
                    <span>🛒</span>
                    <span>Добавить в корзину</span>
                  </>
                )}
              </button>

              <button
                onClick={scrollToChat}
                style={{
                  flex: 1,
                  padding: '18px 24px',
                  backgroundColor: 'transparent',
                  color: '#2563eb',
                  border: '2px solid #2563eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  transform: 'translateY(0)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#2563eb';
                  e.target.style.color = 'white';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 24px rgba(37, 99, 235, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#2563eb';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <span>💬</span>
                <span>Написать продавцу</span>
              </button>
            </div>
          </div>
        </div>

        {/* Информация о продавце */}
        {seller && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            marginBottom: '40px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid rgba(0,0,0,0.05)'
          }}>
            <h2 style={{
              margin: '0 0 24px 0',
              fontSize: '26px',
              fontWeight: '700',
              color: '#1f2937',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              🏪 О продавце
            </h2>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '20px',
              marginBottom: '24px'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: seller.is_online ? '#10b981' : '#6b7280',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                position: 'relative'
              }}>
                🏪
                {/* Индикатор онлайн статуса */}
                <div style={{
                  position: 'absolute',
                  bottom: '4px',
                  right: '4px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: seller.is_online ? '#10b981' : '#6b7280',
                  border: '3px solid white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '8px'
                }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: '22px',
                    fontWeight: '700',
                    color: '#1f2937'
                  }}>
                    {seller.neme || seller.name || 'Продавец'}
                  </h3>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    backgroundColor: seller.is_online ? '#dcfce7' : '#f3f4f6',
                    color: seller.is_online ? '#166534' : '#6b7280'
                  }}>
                    {seller.is_online ? '🟢 Онлайн' : '⚫ Офлайн'}
                  </span>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: window.innerWidth >= 640 ? 'repeat(2, 1fr)' : '1fr',
                  gap: '12px',
                  marginTop: '16px'
                }}>
                  <div style={{
                    padding: '12px 16px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                      ID продавца
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', fontFamily: 'monospace' }}>
                      {seller.id?.substring(0, 8)}...
                    </div>
                  </div>
                  <div style={{
                    padding: '12px 16px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                      Участник с
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                      {new Date(seller.created_at).toLocaleDateString('ru-RU', {
                        year: 'numeric',
                        month: 'long'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Дополнительная информация */}
            <div style={{
              padding: '16px',
              backgroundColor: '#f0f9ff',
              borderRadius: '12px',
              border: '1px solid #0ea5e9'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <span style={{ fontSize: '16px' }}>💡</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#0c4a6e' }}>
                  Совет
                </span>
              </div>
              <p style={{
                margin: 0,
                fontSize: '14px',
                color: '#0369a1',
                lineHeight: '1.5'
              }}>
                Свяжитесь с продавцом через чат ниже, чтобы уточнить детали товара,
                условия доставки или договориться о цене.
              </p>
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
