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
  const cardHeight = variant === 'home' ? '420px' : '480px';
  const imageHeight = variant === 'home' ? '200px' : '240px';
  const padding = variant === 'home' ? '20px' : '24px';

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: isHovered
          ? '0 20px 40px rgba(0,0,0,0.15)'
          : '0 8px 25px rgba(0,0,0,0.08)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        height: cardHeight,
        border: '1px solid rgba(0,0,0,0.05)',
        transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
        position: 'relative',
        background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Изображение товара с градиентным оверлеем */}
      <div style={{
        width: '100%',
        height: imageHeight,
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
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
            transform: isHovered ? 'scale(1.1)' : 'scale(1)'
          }}
          onLoad={() => setImageLoading(false)}
          onError={() => {
            setImageError(true);
            setImageLoading(false);
          }}
        />

        {/* Градиентный оверлей */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.1) 100%)',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }} />

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
            fontSize: '3rem',
            color: 'white',
            background: imageLoading
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : 'linear-gradient(135deg, #fc7a57 0%, #f093fb 100%)'
          }}>
            {imageLoading ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '4px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <span style={{ fontSize: '14px', fontWeight: '500' }}>Загрузка...</span>
              </div>
            ) : '🌲'}
          </div>
        )}

        {/* Бейдж с типом древесины */}
        {woodTypeName && woodTypeName !== 'Не указан' && (
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            color: '#2D3748',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            {woodTypeName}
          </div>
        )}

        {/* Бейдж доставки */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: product.delivery_possible
            ? 'rgba(16, 185, 129, 0.9)'
            : 'rgba(245, 101, 101, 0.9)',
          backdropFilter: 'blur(10px)',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
          color: 'white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          {product.delivery_possible ? '🚚 Доставка' : '📍 Самовывоз'}
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
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#1a202c',
            marginBottom: '8px',
            lineHeight: '1.3',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '2.6rem'
          }}>
            {product.title || 'Товар без названия'}
          </h3>

          {product.descrioption && (
            <p style={{
              fontSize: '0.9rem',
              color: '#718096',
              marginBottom: '16px',
              lineHeight: '1.5',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {product.descrioption}
            </p>
          )}

          {/* Характеристики товара */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
              padding: '12px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#2d3748',
                marginBottom: '4px'
              }}>
                {product.volume || 0}
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: '#718096',
                fontWeight: '500'
              }}>
                м³
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%)',
              padding: '12px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '1.2rem',
                fontWeight: '700',
                color: '#22543d',
                marginBottom: '4px'
              }}>
                {pricePerCubicMeter}
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: '#38a169',
                fontWeight: '500'
              }}>
                ₽/м³
              </div>
            </div>
          </div>

          {/* Информация о продавце */}
          {sellerName && sellerName !== 'Неизвестный продавец' && (
            <div style={{
              background: 'rgba(99, 102, 241, 0.1)',
              padding: '10px 12px',
              borderRadius: '10px',
              marginBottom: '16px',
              border: '1px solid rgba(99, 102, 241, 0.2)'
            }}>
              <div style={{
                fontSize: '0.8rem',
                color: '#6366f1',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span>👤</span>
                {sellerName}
              </div>
            </div>
          )}
        </div>

        {/* Секция с ценой и кнопкой */}
        <div>
          {/* Цена */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            padding: '16px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '16px',
            color: 'white'
          }}>
            <div>
              <div style={{
                fontSize: '1.8rem',
                fontWeight: '800',
                lineHeight: '1'
              }}>
                {formatCurrencyRu(product.price || 0)}
              </div>
              <div style={{
                fontSize: '0.9rem',
                opacity: 0.9,
                marginTop: '4px'
              }}>
                Общая стоимость
              </div>
            </div>
            <div style={{
              textAlign: 'right'
            }}>
              <div style={{
                fontSize: '1.2rem',
                fontWeight: '600'
              }}>
                {product.volume} м³
              </div>
              <div style={{
                fontSize: '0.8rem',
                opacity: 0.9
              }}>
                объем
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
              padding: '14px',
              background: isHovered
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'linear-gradient(135deg, #4c51bf 0%, #553c9a 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: isHovered
                ? '0 8px 25px rgba(102, 126, 234, 0.4)'
                : '0 4px 15px rgba(76, 81, 191, 0.3)',
              transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <span>Подробнее</span>
            <span style={{
              fontSize: '1.2rem',
              transition: 'transform 0.3s ease',
              transform: isHovered ? 'translateX(4px)' : 'translateX(0)'
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
