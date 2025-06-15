import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useNotifications } from '../contexts/NotificationContext';
import { formatCurrencyRu } from '../utils/localization';
import { apiService } from '../services/api';
import ProductImageWithBoards from '../components/ProductImageWithBoards';
import ProductChat from '../components/ProductChat';
import { getCurrentBuyerKeycloakId } from '../utils/auth';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { setPageTitle } = useApp();
  const { showSuccess, showError } = useNotifications();

  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [woodType, setWoodType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const chatRef = useRef(null);

  // buyerId теперь получается внутри ProductChat компонента

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
      // No longer set page title immediately here, do it after image potentially added

      setProduct(productData);
      setPageTitle(productData.title || productData.neme || 'Товар'); // Set page title now

      // Загружаем данные продавца (can proceed even if image fetch fails)
      if (productData.seller_id) {
        try {
          const sellerResponse = await apiService.getSeller(productData.seller_id);
          setSeller(sellerResponse.data);
        } catch (err) {
          console.error('Ошибка загрузки продавца:', err);
        }
      }

      // Загружаем тип древесины (can proceed even if image fetch fails)
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
      setProduct(null); // Ensure product is null on error
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = () => {
    if (product && seller) {
      // Прокручиваем к чату на этой же странице
      scrollToChat();
      showSuccess('Прокручиваем к чату с продавцом');
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
          gap: '24px',
          marginBottom: '32px'
        }}>
          {/* Левая колонка - Изображение */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb'
          }}>
            <ProductImageWithBoards
              product={product}
              style={{ width: '100%', borderRadius: '6px' }}
            />
          </div>

          {/* Правая колонка - Информация */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            padding: '32px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb',
            height: 'fit-content'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: '32px',
              paddingBottom: '24px',
              borderBottom: '1px solid #f3f4f6'
            }}>
              <h1 style={{
                margin: 0,
                fontSize: window.innerWidth >= 768 ? '28px' : '24px',
                fontWeight: '600',
                color: '#111827',
                lineHeight: '1.3',
                flex: 1,
                letterSpacing: '-0.025em'
              }}>
                {product.title || product.neme || 'Товар'}
              </h1>
              {product.delivery_possible && (
                <div style={{
                  backgroundColor: '#f0fdf4',
                  color: '#15803d',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '500',
                  marginLeft: '16px',
                  whiteSpace: 'nowrap',
                  border: '1px solid #bbf7d0'
                }}>
                  Доставка возможна
                </div>
              )}
            </div>

            {/* Цена */}
            <div style={{
              marginBottom: '32px',
              padding: '24px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '12px',
                marginBottom: '12px'
              }}>
                <span style={{
                  fontSize: window.innerWidth >= 768 ? '32px' : '28px',
                  fontWeight: '700',
                  color: '#047857'
                }}>
                  {formatCurrencyRu(product.price || 0)}
                </span>
                <span style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  fontWeight: '500'
                }}>
                  за м³
                </span>
              </div>
              {product.volume && (
                <div style={{
                  fontSize: '16px',
                  color: '#374151',
                  fontWeight: '500'
                }}>
                  Общая стоимость: <span style={{ fontWeight: '600', color: '#047857' }}>
                    {formatCurrencyRu(product.price * product.volume)}
                  </span>
                </div>
              )}
            </div>

            {product.descrioption && (
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{
                  margin: '0 0 16px 0',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827',
                  letterSpacing: '-0.025em'
                }}>
                  Описание
                </h3>
                <div style={{
                  padding: '20px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <p style={{
                    margin: 0,
                    color: '#374151',
                    lineHeight: '1.6',
                    fontSize: '15px'
                  }}>
                    {product.descrioption}
                  </p>
                </div>
              </div>
            )}

            {/* Характеристики */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                margin: '0 0 20px 0',
                fontSize: '18px',
                fontWeight: '600',
                color: '#111827',
                letterSpacing: '-0.025em'
              }}>
                Характеристики товара
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: window.innerWidth >= 640 ? 'repeat(2, 1fr)' : '1fr',
                gap: '16px'
              }}>
                <div style={{
                  padding: '20px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  textAlign: 'left'
                }}>
                  <div style={{
                    fontSize: '13px',
                    color: '#6b7280',
                    fontWeight: '500',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Объем
                  </div>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#111827'
                  }}>
                    {product.volume?.toFixed(4) || '0'} м³
                  </div>
                </div>
                <div style={{
                  padding: '20px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  textAlign: 'left'
                }}>
                  <div style={{
                    fontSize: '13px',
                    color: '#6b7280',
                    fontWeight: '500',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Количество досок
                  </div>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#111827'
                  }}>
                    {product.wooden_boards?.length || product.board_count || 'Не указано'}
                  </div>
                </div>
                {woodType && (
                  <div style={{
                    padding: '20px',
                    backgroundColor: '#f0fdf4',
                    borderRadius: '8px',
                    border: '1px solid #bbf7d0',
                    gridColumn: window.innerWidth >= 640 ? '1 / -1' : 'auto',
                    textAlign: 'left'
                  }}>
                    <div style={{
                      fontSize: '13px',
                      color: '#15803d',
                      fontWeight: '500',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Тип древесины
                    </div>
                    <div style={{
                      fontSize: '20px',
                      fontWeight: '600',
                      color: '#14532d'
                    }}>
                      {woodType.neme || woodType.name || 'Не указан'}
                    </div>
                  </div>
                )}
                {product.pickup_location && (
                  <div style={{
                    padding: '20px',
                    backgroundColor: '#fffbeb',
                    borderRadius: '8px',
                    border: '1px solid #fcd34d',
                    gridColumn: window.innerWidth >= 640 ? '1 / -1' : 'auto',
                    textAlign: 'left'
                  }}>
                    <div style={{
                      fontSize: '13px',
                      color: '#92400e',
                      fontWeight: '500',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Адрес самовывоза
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
              gap: '12px'
            }}>
              <button
                onClick={handleStartChat}
                style={{
                  flex: 1,
                  padding: '16px 24px',
                  backgroundColor: '#047857',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transform: 'translateY(0)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  letterSpacing: '0.025em'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#065f46';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#047857';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
              >
                <span>Связаться с продавцом</span>
              </button>

              <button
                onClick={() => navigate('/chats')}
                style={{
                  flex: 1,
                  padding: '16px 24px',
                  backgroundColor: 'transparent',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  transform: 'translateY(0)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  letterSpacing: '0.025em'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f9fafb';
                  e.target.style.borderColor = '#9ca3af';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <span>Все чаты</span>
              </button>
            </div>
          </div>
        </div>

        {/* Информация о продавце */}
        {seller && (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            padding: '32px',
            marginBottom: '32px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb'
          }}>
            <h2 style={{
              margin: '0 0 24px 0',
              fontSize: '20px',
              fontWeight: '600',
              color: '#111827',
              letterSpacing: '-0.025em',
              paddingBottom: '16px',
              borderBottom: '1px solid #f3f4f6'
            }}>
              Информация о продавце
            </h2>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '20px',
              marginBottom: '24px'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '8px',
                backgroundColor: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                border: '1px solid #e5e7eb',
                position: 'relative'
              }}>
                <span style={{ color: '#6b7280' }}>👤</span>
                {/* Индикатор онлайн статуса */}
                <div style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: seller.is_online ? '#10b981' : '#6b7280',
                  border: '2px solid white',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
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
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#111827'
                  }}>
                    {seller.neme || seller.name || 'Продавец'}
                  </h3>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '500',
                    backgroundColor: seller.is_online ? '#dcfce7' : '#f3f4f6',
                    color: seller.is_online ? '#166534' : '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {seller.is_online ? 'Онлайн' : 'Офлайн'}
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
                    backgroundColor: '#f9fafb',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      ID продавца
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#374151', fontFamily: 'monospace' }}>
                      {seller.id?.substring(0, 8)}...
                    </div>
                  </div>
                  <div style={{
                    padding: '12px 16px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Участник с
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }}>
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
              borderRadius: '6px',
              border: '1px solid #bae6fd'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#0c4a6e' }}>
                  Рекомендация
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
