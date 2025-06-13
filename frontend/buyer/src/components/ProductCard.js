import React, { useState } from 'react';
import { apiService } from '../services/api';

/**
 * Красивая и интерактивная карточка товара
 * Используется на главной странице и в каталоге
 */
const ProductCard = ({
  product,
  woodTypeName,
  woodTypePrice,
  sellerName,
  navigate,
  variant = 'catalog' // 'catalog' или 'home'
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Получаем URL изображения товара напрямую
  const getProductImageUrl = () => {
    return apiService.getProductImageUrl(product.id);
  };

  // Вычисляем цену за кубический метр
  const pricePerCubicMeter = product.volume > 0 ? (product.price / product.volume).toFixed(2) : '0.00';

  // Получаем URL изображения товара
  const imageUrl = getProductImageUrl();

  // Функция форматирования валюты
  const formatCurrencyRu = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleClick = () => {
    if (navigate) {
      navigate(`/product/${product.id}`);
    } else {
      window.location.href = `/product/${product.id}`;
    }
  };

  // Определяем размеры в зависимости от варианта
  const cardHeight = variant === 'home' ? '520px' : '550px';
  const imageHeight = variant === 'home' ? '180px' : '200px';
  const padding = variant === 'home' ? '14px' : '16px';

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: isHovered
          ? '0 8px 24px rgba(0,0,0,0.12)'
          : '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        height: cardHeight,
        border: '1px solid #e2e8f0',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        position: 'relative',
        backgroundColor: '#ffffff'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Изображение товара */}
      <div style={{
        width: '100%',
        height: imageHeight,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#f8fafc',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <img
          src={imageUrl}
          alt={product.title || 'Товар'}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: imageLoading ? 'none' : 'block',
            transition: 'transform 0.3s ease',
            transform: isHovered ? 'scale(1.05)' : 'scale(1)'
          }}
          onLoad={() => setImageLoading(false)}
          onError={() => {
            setImageError(true);
            setImageLoading(false);
          }}
        />

        {/* Индикатор загрузки или ошибки */}
        {(imageLoading || imageError) && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            color: '#9ca3af',
            backgroundColor: '#f8fafc'
          }}>
            {imageLoading ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  border: '3px solid #e5e7eb',
                  borderTopColor: '#6b7280',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <span style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280' }}>Загрузка</span>
              </div>
            ) : '🌲'}
          </div>
        )}

        {/* Бейдж с типом древесины */}
        {woodTypeName && woodTypeName !== 'Не указан' && (
          <div style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            background: 'rgba(255,255,255,0.95)',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: '500',
            color: '#374151',
            border: '1px solid rgba(0,0,0,0.1)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            {woodTypeName}
          </div>
        )}

        {/* Статус доставки */}
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'rgba(255,255,255,0.95)',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: '500',
          color: product.delivery_possible ? '#059669' : '#dc2626',
          border: `1px solid ${product.delivery_possible ? '#d1fae5' : '#fecaca'}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          {product.delivery_possible ? 'Доставка' : 'Самовывоз'}
        </div>
      </div>

      {/* Информация о товаре */}
      <div style={{
        padding: padding,
        display: 'flex',
        flexDirection: 'column',
        height: `calc(${cardHeight} - ${imageHeight})`,
        justifyContent: 'space-between'
      }}>
        {/* Заголовок и описание */}
        <div>
          <h3 style={{
            fontSize: '0.95rem',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '4px',
            lineHeight: '1.2',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            height: '2.3rem'
          }}>
            {product.title || 'Товар без названия'}
          </h3>

          {product.descrioption && (
            <p style={{
              fontSize: '0.75rem',
              color: '#6b7280',
              marginBottom: '8px',
              lineHeight: '1.2',
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              height: '0.9rem'
            }}>
              {product.descrioption}
            </p>
          )}

          {/* Характеристики товара */}
          <div style={{
            marginBottom: '10px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '4px',
              borderBottom: '1px solid #f3f4f6',
              marginBottom: '4px'
            }}>
              <span style={{
                fontSize: '0.75rem',
                color: '#6b7280',
                fontWeight: '500'
              }}>
                Объем:
              </span>
              <span style={{
                fontSize: '0.8rem',
                color: '#1f2937',
                fontWeight: '600'
              }}>
                {product.volume || 0} м³
              </span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '4px',
              borderBottom: '1px solid #f3f4f6',
              marginBottom: '4px'
            }}>
              <span style={{
                fontSize: '0.75rem',
                color: '#6b7280',
                fontWeight: '500'
              }}>
                Цена за м³:
              </span>
              <span style={{
                fontSize: '0.8rem',
                color: '#1f2937',
                fontWeight: '600'
              }}>
                {pricePerCubicMeter} ₽
              </span>
            </div>

            {sellerName && sellerName !== 'Неизвестный продавец' && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '4px'
              }}>
                <span style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  fontWeight: '500'
                }}>
                  Продавец:
                </span>
                <span style={{
                  fontSize: '0.75rem',
                  color: '#1f2937',
                  fontWeight: '500',
                  maxWidth: '120px',
                  textAlign: 'right',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {sellerName}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Секция с ценой и кнопкой */}
        <div>
          {/* Цена */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
            paddingBottom: '8px',
            borderBottom: '2px solid #f3f4f6'
          }}>
            <div>
              <div style={{
                fontSize: '0.65rem',
                color: '#6b7280',
                fontWeight: '500',
                marginBottom: '1px'
              }}>
                Общая стоимость
              </div>
              <div style={{
                fontSize: '1.2rem',
                fontWeight: '700',
                color: '#1f2937',
                lineHeight: '1'
              }}>
                {formatCurrencyRu(product.price || 0)}
              </div>
            </div>
            <div style={{
              textAlign: 'right'
            }}>
              <div style={{
                fontSize: '0.65rem',
                color: '#6b7280',
                fontWeight: '500',
                marginBottom: '1px'
              }}>
                Объем
              </div>
              <div style={{
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#1f2937'
              }}>
                {product.volume} м³
              </div>
            </div>
          </div>

          {/* Кнопка */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            style={{
              width: '100%',
              padding: '8px 16px',
              backgroundColor: isHovered ? '#1f2937' : '#374151',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span>Подробнее</span>
            <span style={{
              fontSize: '0.8rem',
              transition: 'transform 0.2s ease',
              transform: isHovered ? 'translateX(2px)' : 'translateX(0)'
            }}>
              →
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProductCard;
