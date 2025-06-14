import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';

const EnhancedProductCard = ({
  product,
  woodTypeName,
  sellerName,
  sellerId,
  variant = 'catalog' // 'catalog', 'grid', 'list'
}) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);

  // Утилиты
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const pricePerCubicMeter = product.volume > 0
    ? Math.round(product.price / product.volume)
    : 0;

  // Округляем объем до 2 знаков после запятой
  const roundedVolume = product.volume ? Math.round(product.volume * 100) / 100 : 0;

  const getProductImageUrl = () => {
    return apiService.getProductImageUrl(product.id);
  };

  // Обработчики
  const handleClick = () => {
    navigate(`/products/${product.id}`);
  };

  const handleStartChat = async (e) => {
    e.stopPropagation();
    setIsStartingChat(true);

    try {
      const buyerId = localStorage.getItem('buyerId') || 'test-buyer-id';
      const chatThread = await apiService.startChatWithSeller(buyerId, sellerId);
      navigate(`/chat/${chatThread.id}`);
    } catch (error) {
      console.error('Failed to start chat:', error);
      navigate('/chat');
    } finally {
      setIsStartingChat(false);
    }
  };

  // СПИСОК - горизонтальная карточка
  if (variant === 'list') {
    return (
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: isHovered ? '0 2px 8px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.05)',
          border: '1px solid #e5e7eb',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          height: '140px',
          overflow: 'hidden'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        {/* Изображение */}
        <div style={{
          width: '180px',
          height: '100%',
          backgroundImage: `url(${getProductImageUrl()})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#f3f4f6'
        }} />

        {/* Контент */}
        <div style={{
          flex: 1,
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 8px 0',
              lineHeight: '1.3'
            }}>
              {product.title || 'Товар без названия'}
            </h3>

            <div style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              display: 'flex',
              gap: '16px'
            }}>
              <span>{roundedVolume} м³</span>
              <span>{pricePerCubicMeter} ₽/м³</span>
              {woodTypeName && <span>{woodTypeName}</span>}
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#1f2937'
            }}>
              {formatCurrency(product.price)}
            </div>

            <button
              onClick={handleStartChat}
              disabled={isStartingChat}
              style={{
                padding: '8px 16px',
                backgroundColor: isStartingChat ? '#d97706' : '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: isStartingChat ? 'wait' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {isStartingChat ? 'Подключение...' : 'Написать продавцу'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // СЕТКА - компактная карточка
  if (variant === 'grid') {
    return (
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: isHovered ? '0 4px 12px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.05)',
          border: '1px solid #e5e7eb',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
          height: '380px',
          width: '100%',
          maxWidth: '320px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        {/* Изображение */}
        <div style={{
          height: '160px',
          backgroundImage: `url(${getProductImageUrl()})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#f3f4f6',
          position: 'relative'
        }}>
          {/* Бейдж доставки */}
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            backgroundColor: product.delivery_possible ? '#059669' : '#d97706',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: '600'
          }}>
            {product.delivery_possible ? 'Доставка' : 'Самовывоз'}
          </div>
        </div>

        {/* Контент */}
        <div style={{
          padding: '12px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3
              className="multiline-ellipsis"
              style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0 0 8px 0',
                lineHeight: '1.2',
                height: '2.4rem',
                WebkitLineClamp: 2
              }}
            >
              {product.title || 'Товар без названия'}
            </h3>

            <div style={{
              fontSize: '0.75rem',
              color: '#6b7280',
              marginBottom: '8px'
            }}>
              {roundedVolume} м³ • {pricePerCubicMeter} ₽/м³
            </div>

            <div style={{
              fontSize: '1rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '12px'
            }}>
              {formatCurrency(product.price)}
            </div>
          </div>

          {/* Кнопки */}
          <div style={{
            display: 'flex',
            gap: '6px'
          }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
              style={{
                flex: 1,
                padding: '6px 8px',
                backgroundColor: 'transparent',
                color: '#3b82f6',
                border: '1px solid #3b82f6',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Подробнее
            </button>

            <button
              onClick={handleStartChat}
              disabled={isStartingChat}
              style={{
                flex: 1,
                padding: '6px 8px',
                backgroundColor: isStartingChat ? '#d97706' : '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: '600',
                cursor: isStartingChat ? 'wait' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {isStartingChat ? '...' : 'Чат'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // КАТАЛОГ - подробная карточка (по умолчанию)
  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: isHovered ? '0 8px 24px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.06)',
        border: '1px solid #e5e7eb',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        height: '540px',
        width: '100%',
        maxWidth: '420px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Изображение */}
      <div style={{
        height: '220px',
        backgroundImage: `url(${getProductImageUrl()})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#f3f4f6',
        position: 'relative'
      }}>
        {/* Бейдж доставки */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          backgroundColor: product.delivery_possible ? '#059669' : '#d97706',
          color: 'white',
          padding: '6px 12px',
          borderRadius: '6px',
          fontSize: '0.875rem',
          fontWeight: '600',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {product.delivery_possible ? 'Доставка возможна' : 'Только самовывоз'}
        </div>

        {/* Цена за м³ */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          backgroundColor: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '0.875rem',
          fontWeight: '600',
          backdropFilter: 'blur(10px)'
        }}>
          {pricePerCubicMeter} ₽/м³
        </div>
      </div>

      {/* Контент */}
      <div style={{
        padding: '16px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div>
          <h3
            className="multiline-ellipsis"
            style={{
              fontSize: '1.125rem',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0 0 12px 0',
              lineHeight: '1.2',
              height: '3.6rem',
              WebkitLineClamp: 3
            }}
          >
            {product.title || 'Товар без названия'}
          </h3>

          {product.descrioption && (
            <p
              className="multiline-ellipsis"
              style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                margin: '0 0 16px 0',
                lineHeight: '1.3',
                height: '2.6rem',
                WebkitLineClamp: 2
              }}
            >
              {product.descrioption}
            </p>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <div style={{
              padding: '8px',
              backgroundColor: '#f8fafc',
              borderRadius: '6px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '0.75rem',
                color: '#6b7280',
                marginBottom: '2px'
              }}>
                Объем
              </div>
              <div style={{
                fontSize: '1rem',
                fontWeight: '700',
                color: '#1f2937'
              }}>
                {roundedVolume} м³
              </div>
            </div>

            {woodTypeName && woodTypeName !== 'Не указан' && (
              <div style={{
                padding: '8px',
                backgroundColor: '#f8fafc',
                borderRadius: '6px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  marginBottom: '2px'
                }}>
                  Древесина
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#1f2937'
                }}>
                  {woodTypeName}
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: '800',
            color: '#1f2937',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            {formatCurrency(product.price)}
          </div>

          {/* Кнопки */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
              style={{
                padding: '12px 20px',
                backgroundColor: 'transparent',
                color: '#3b82f6',
                border: '2px solid #3b82f6',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Подробная информация
            </button>

            <button
              onClick={handleStartChat}
              disabled={isStartingChat}
              style={{
                padding: '12px 20px',
                backgroundColor: isStartingChat ? '#d97706' : '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: isStartingChat ? 'wait' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {isStartingChat ? 'Подключение...' : 'Связаться с продавцом'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Добавляем глобальные стили для правильного отображения многострочного текста
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .multiline-ellipsis {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      overflow: hidden;
      word-break: break-word;
      hyphens: auto;
    }
  `;
  if (!document.head.querySelector('style[data-multiline-ellipsis]')) {
    style.setAttribute('data-multiline-ellipsis', 'true');
    document.head.appendChild(style);
  }
}

export default EnhancedProductCard;
