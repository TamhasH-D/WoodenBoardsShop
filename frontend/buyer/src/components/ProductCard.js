import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

/**
 * Универсальная карточка товара для использования на главной странице и в каталоге
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

  // Получаем URL изображения товара напрямую
  const getProductImageUrl = () => {
    return apiService.getProductImageUrl(product.id);
  };

  // Вычисляем цену за кубический метр
  const pricePerCubicMeter = product.volume > 0 ? (product.price / product.volume).toFixed(2) : '0.00';

  // Определяем информацию о доставке
  const deliveryInfo = product.delivery_possible
    ? 'Доставка доступна'
    : product.pickup_location
      ? `Самовывоз: ${product.pickup_location}`
      : 'Уточните у продавца';

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

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: variant === 'home' ? '12px' : '16px',
      overflow: 'hidden',
      boxShadow: variant === 'home' ? '0 2px 4px rgba(0,0,0,0.05)' : '0 4px 20px rgba(0,0,0,0.08)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer',
      height: 'fit-content',
      border: variant === 'home' ? '1px solid #e2e8f0' : 'none'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = variant === 'home' 
        ? '0 8px 25px rgba(0,0,0,0.1)' 
        : '0 8px 32px rgba(0,0,0,0.12)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = variant === 'home' 
        ? '0 2px 4px rgba(0,0,0,0.05)' 
        : '0 4px 20px rgba(0,0,0,0.08)';
    }}
    onClick={handleClick}
    >
      {/* Изображение товара */}
      <div style={{
        width: '100%',
        height: variant === 'home' ? '200px' : '220px',
        position: 'relative',
        backgroundColor: '#F7FAFC',
        borderBottom: variant === 'home' ? '1px solid #e2e8f0' : 'none'
      }}>
        <img
          src={imageUrl}
          alt={product.title || 'Товар'}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: imageLoading ? 'none' : 'block'
          }}
          onLoad={() => setImageLoading(false)}
          onError={() => {
            setImageError(true);
            setImageLoading(false);
          }}
        />

        {(imageLoading || imageError) && (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem',
            color: '#A0AEC0',
            position: imageLoading ? 'absolute' : 'static',
            top: 0,
            left: 0
          }}>
            {imageLoading ? '⏳' : '🌲'}
          </div>
        )}
      </div>

      {/* Информация о товаре */}
      <div style={{ padding: variant === 'home' ? '1.5rem' : '20px' }}>
        <h3 style={{
          fontSize: variant === 'home' ? '1.125rem' : '1.25rem',
          fontWeight: '600',
          color: variant === 'home' ? '#1f2937' : '#2D3748',
          marginBottom: variant === 'home' ? '0.75rem' : '8px',
          lineHeight: '1.3',
          minHeight: variant === 'home' ? 'auto' : '2.6rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {product.title || 'Товар без названия'}
        </h3>

        {product.descrioption && (
          <p style={{
            fontSize: variant === 'home' ? '0.875rem' : '0.9rem',
            color: variant === 'home' ? '#6b7280' : '#718096',
            marginBottom: variant === 'home' ? '1rem' : '16px',
            lineHeight: '1.4',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {product.descrioption}
          </p>
        )}

        {/* Детали товара - показываем по-разному в зависимости от варианта */}
        {variant === 'catalog' ? (
          <div style={{ marginBottom: '16px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '6px',
              fontSize: '0.9rem'
            }}>
              <span style={{ color: '#4A5568', fontWeight: '500' }}>Объем:</span>
              <span style={{ color: '#2D3748', fontWeight: '600' }}>{product.volume || 0} м³</span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '6px',
              fontSize: '0.9rem'
            }}>
              <span style={{ color: '#4A5568', fontWeight: '500' }}>Древесина:</span>
              <span style={{ color: '#2D3748', fontWeight: '600' }}>{woodTypeName}</span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '6px',
              fontSize: '0.9rem'
            }}>
              <span style={{ color: '#4A5568', fontWeight: '500' }}>Продавец:</span>
              <span style={{ color: '#2D3748', fontWeight: '600' }}>{sellerName}</span>
            </div>

            <div style={{
              fontSize: '0.85rem',
              color: '#718096',
              marginTop: '8px'
            }}>
              {deliveryInfo}
            </div>
          </div>
        ) : (
          // Вариант для главной страницы
          <>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem'
            }}>
              <div style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#059669'
              }}>
                {formatCurrencyRu(product.price || 0)}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: '#6b7280'
              }}>
                {product.volume} м³
              </div>
            </div>

            <div style={{
              textAlign: 'center',
              marginBottom: '1rem',
              color: '#6b7280',
              fontSize: '0.875rem'
            }}>
              {pricePerCubicMeter} ₽ за м³
            </div>

            <div style={{
              marginBottom: '1rem'
            }}>
              <div style={{
                display: 'inline-block',
                padding: '0.25rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: '500',
                backgroundColor: product.delivery_possible ? '#dcfce7' : '#fee2e2',
                color: product.delivery_possible ? '#166534' : '#dc2626'
              }}>
                {product.delivery_possible ? 'Доставка возможна' : 'Только самовывоз'}
              </div>
              {product.pickup_location && (
                <div style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  marginTop: '0.5rem'
                }}>
                  Адрес: {product.pickup_location}
                </div>
              )}
            </div>

            <div style={{
              marginBottom: '1rem',
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>
              <div>Тип древесины: {woodTypeName || 'Не указан'}</div>
              <div>Размещено: {new Date(product.created_at).toLocaleDateString('ru-RU')}</div>
            </div>
          </>
        )}

        {/* Цена и действия */}
        <div style={{
          borderTop: variant === 'catalog' ? '1px solid #E2E8F0' : 'none',
          paddingTop: variant === 'catalog' ? '16px' : '0',
          display: 'flex',
          justifyContent: variant === 'catalog' ? 'space-between' : 'center',
          alignItems: 'center'
        }}>
          {variant === 'catalog' && (
            <div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#2D3748',
                lineHeight: '1'
              }}>
                {formatCurrencyRu(product.price || 0)}
              </div>
              <div style={{
                fontSize: '0.85rem',
                color: '#718096',
                marginTop: '2px'
              }}>
                {pricePerCubicMeter} ₽/м³
              </div>
            </div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            style={{
              width: variant === 'home' ? '100%' : 'auto',
              padding: variant === 'home' ? '0.75rem' : '10px 16px',
              backgroundColor: variant === 'home' ? '#2563eb' : '#3182CE',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: variant === 'home' ? '0.875rem' : '0.9rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = variant === 'home' ? '#1d4ed8' : '#2C5282'}
            onMouseLeave={(e) => e.target.style.backgroundColor = variant === 'home' ? '#2563eb' : '#3182CE'}
          >
            Подробнее
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
