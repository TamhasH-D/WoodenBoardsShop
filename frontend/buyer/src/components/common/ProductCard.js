import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';

/**
 * Универсальная карточка товара для всех страниц
 * @param {Object} product - Данные товара
 * @param {string} woodTypeName - Название типа древесины
 * @param {string} sellerName - Имя продавца
 * @param {string} sellerId - ID продавца
 * @param {string} variant - Вариант отображения: 'catalog', 'grid', 'list', 'hero'
 * @param {boolean} showDescription - Показывать ли описание
 * @param {boolean} showSeller - Показывать ли информацию о продавце
 * @param {Function} onChatStart - Кастомный обработчик начала чата
 */
const ProductCard = ({
  product,
  woodTypeName,
  sellerName,
  sellerId,
  variant = 'catalog', // 'catalog', 'grid', 'list', 'hero'
  showDescription = true,
  showSeller = false,
  onChatStart
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

  const roundedVolume = product.volume ? Math.round(product.volume * 100) / 100 : 0;

  const getProductImageUrl = () => {
    return apiService.getProductImageUrl(product.id);
  };

  // Обработчики
  const handleClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleStartChat = async (e) => {
    e.stopPropagation();
    
    if (onChatStart) {
      onChatStart(product, sellerId);
      return;
    }
    
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

  // Профессиональная конфигурация для разных вариантов
  const getVariantConfig = () => {
    switch (variant) {
      case 'hero':
        return {
          height: '520px',
          maxWidth: '420px',
          imageHeight: '260px',
          padding: '24px',
          titleSize: '1.375rem',
          titleLines: 2,
          showPrice: true,
          showButtons: true,
          buttonLayout: 'column',
          showBadges: true,
          borderRadius: '12px',
          shadowLevel: 'high'
        };
      case 'grid':
        return {
          height: '420px',
          maxWidth: '340px',
          imageHeight: '180px',
          padding: '16px',
          titleSize: '0.95rem',
          titleLines: 2,
          showPrice: true,
          showButtons: true,
          buttonLayout: 'column',
          showBadges: true,
          borderRadius: '10px',
          shadowLevel: 'medium'
        };
      case 'list':
        return {
          height: '160px',
          maxWidth: 'none',
          imageHeight: '100%',
          imageWidth: '200px',
          padding: '20px',
          titleSize: '1.1rem',
          titleLines: 1,
          showPrice: true,
          showButtons: true,
          buttonLayout: 'single',
          showBadges: true,
          layout: 'horizontal',
          borderRadius: '8px',
          shadowLevel: 'low'
        };
      default: // catalog
        return {
          height: '580px',
          maxWidth: '440px',
          imageHeight: '240px',
          padding: '20px',
          titleSize: '1.2rem',
          titleLines: 2,
          showPrice: true,
          showButtons: true,
          buttonLayout: 'column',
          showBadges: true,
          borderRadius: '12px',
          shadowLevel: 'medium'
        };
    }
  };

  const config = getVariantConfig();

  // Профессиональные стили теней
  const getShadowStyle = (level, hovered = false) => {
    const shadows = {
      low: hovered ? '0 4px 12px rgba(47, 27, 20, 0.08)' : '0 1px 3px rgba(47, 27, 20, 0.04)',
      medium: hovered ? '0 8px 24px rgba(47, 27, 20, 0.12)' : '0 2px 8px rgba(47, 27, 20, 0.06)',
      high: hovered ? '0 12px 32px rgba(47, 27, 20, 0.16)' : '0 4px 16px rgba(47, 27, 20, 0.08)'
    };
    return shadows[level] || shadows.medium;
  };

  // Горизонтальная карточка (список) - Профессиональный дизайн
  if (config.layout === 'horizontal') {
    return (
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: config.borderRadius,
          boxShadow: getShadowStyle(config.shadowLevel, isHovered),
          border: isHovered ? '1px solid #d2b48c' : '1px solid #e8e2d5',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          height: config.height,
          overflow: 'hidden',
          width: '100%',
          transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
          position: 'relative'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        {/* Профессиональная полоска сверху */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #8B4513, #CD853F)',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }} />

        {/* Изображение с профессиональным оформлением */}
        <div style={{
          width: config.imageWidth,
          height: '100%',
          backgroundImage: `url(${getProductImageUrl()})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#f5f2e8',
          flexShrink: 0,
          position: 'relative',
          borderRight: '1px solid #e8e2d5'
        }}>
          {/* Бейдж доставки для списка */}
          {config.showBadges && (
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              backgroundColor: product.delivery_possible ? '#689F38' : '#F57C00',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: '600',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              backdropFilter: 'blur(10px)'
            }}>
              {product.delivery_possible ? 'Доставка' : 'Самовывоз'}
            </div>
          )}
        </div>

        {/* Контент с профессиональной структурой */}
        <div style={{
          flex: 1,
          padding: config.padding,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff'
        }}>
          {/* Верхняя секция */}
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontSize: config.titleSize,
              fontWeight: '700',
              color: '#2F1B14',
              margin: '0 0 8px 0',
              lineHeight: '1.3',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontFamily: 'Playfair Display, Georgia, serif',
              letterSpacing: '-0.01em'
            }}>
              {product.title || 'Товар без названия'}
            </h3>

            {/* Информационная строка */}
            <div style={{
              fontSize: '0.875rem',
              color: '#8D6E63',
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              marginBottom: '8px',
              flexWrap: 'wrap'
            }}>
              <span style={{
                fontWeight: '600',
                color: '#5D4037'
              }}>{roundedVolume} м³</span>
              <span style={{ color: '#BCAAA4' }}>•</span>
              <span style={{ fontWeight: '500' }}>{pricePerCubicMeter} ₽/м³</span>
              {woodTypeName && woodTypeName !== 'Не указан' && (
                <>
                  <span style={{ color: '#BCAAA4' }}>•</span>
                  <span style={{ fontWeight: '500' }}>{woodTypeName}</span>
                </>
              )}
            </div>

            {showSeller && sellerName && sellerName !== 'Неизвестный продавец' && (
              <div style={{
                fontSize: '0.8rem',
                color: '#A1887F',
                fontStyle: 'italic'
              }}>
                Продавец: {sellerName}
              </div>
            )}
          </div>

          {/* Нижняя секция - цена и кнопка */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '12px',
            borderTop: '1px solid #E8E2D5'
          }}>
            <div style={{
              fontSize: '1.375rem',
              fontWeight: '800',
              color: '#2F1B14',
              fontFamily: 'Playfair Display, Georgia, serif'
            }}>
              {formatCurrency(product.price)}
            </div>

            <button
              onClick={handleStartChat}
              disabled={isStartingChat}
              style={{
                padding: '10px 20px',
                backgroundColor: isStartingChat ? '#F57C00' : '#689F38',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: isStartingChat ? 'wait' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transform: isHovered && !isStartingChat ? 'scale(1.02)' : 'scale(1)'
              }}
              onMouseEnter={(e) => {
                if (!isStartingChat) {
                  e.target.style.backgroundColor = '#5a8a32';
                }
              }}
              onMouseLeave={(e) => {
                if (!isStartingChat) {
                  e.target.style.backgroundColor = '#689F38';
                }
              }}
            >
              {isStartingChat ? 'Подключение...' : 'Написать продавцу'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Профессиональная вертикальная карточка (catalog, grid, hero)
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: config.borderRadius,
        boxShadow: getShadowStyle(config.shadowLevel, isHovered),
        border: isHovered ? '1px solid #d2b48c' : '1px solid #e8e2d5',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
        height: config.height,
        width: '100%',
        maxWidth: config.maxWidth,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Профессиональная полоска сверху */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #8B4513, #CD853F)',
        opacity: isHovered ? 1 : 0,
        transition: 'opacity 0.3s ease',
        zIndex: 10
      }} />

      {/* Профессиональное изображение */}
      <div style={{
        height: config.imageHeight,
        backgroundImage: `url(${getProductImageUrl()})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#f5f2e8',
        position: 'relative',
        flexShrink: 0,
        borderBottom: '1px solid #e8e2d5'
      }}>
        {/* Профессиональные бейджи */}
        {config.showBadges && (
          <>
            {/* Элегантный бейдж доставки */}
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              backgroundColor: product.delivery_possible ? '#689F38' : '#F57C00',
              color: 'white',
              padding: variant === 'hero' ? '8px 14px' : (variant === 'grid' ? '6px 10px' : '7px 12px'),
              borderRadius: '8px',
              fontSize: variant === 'hero' ? '0.875rem' : (variant === 'grid' ? '0.75rem' : '0.8rem'),
              fontWeight: '600',
              boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              letterSpacing: '0.02em'
            }}>
              {product.delivery_possible ? 'Доставка' : 'Самовывоз'}
            </div>

            {/* Элегантная цена за м³ */}
            <div style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              backgroundColor: 'rgba(47, 27, 20, 0.9)',
              color: 'white',
              padding: variant === 'hero' ? '8px 14px' : '6px 12px',
              borderRadius: '8px',
              fontSize: variant === 'hero' ? '0.875rem' : '0.75rem',
              fontWeight: '700',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255,255,255,0.1)',
              letterSpacing: '0.02em',
              fontFamily: 'Inter, sans-serif'
            }}>
              {pricePerCubicMeter} ₽/м³
            </div>
          </>
        )}

        {/* Градиентный оверлей для лучшей читаемости */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '60px',
          background: 'linear-gradient(to top, rgba(47, 27, 20, 0.3), transparent)',
          pointerEvents: 'none'
        }} />
      </div>

      {/* Профессиональный контент */}
      <div style={{
        padding: config.padding,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff'
      }}>
        {/* Верхняя секция контента */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Профессиональный заголовок */}
          <h3 style={{
            fontSize: config.titleSize,
            fontWeight: '700',
            color: '#2F1B14',
            margin: '0 0 12px 0',
            lineHeight: '1.3',
            height: `${1.3 * config.titleLines}rem`,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: config.titleLines,
            WebkitBoxOrient: 'vertical',
            wordBreak: 'break-word',
            fontFamily: 'Playfair Display, Georgia, serif',
            letterSpacing: '-0.01em'
          }}>
            {product.title || 'Товар без названия'}
          </h3>

          {/* Описание для hero варианта */}
          {showDescription && product.descrioption && variant === 'hero' && (
            <p style={{
              fontSize: '0.9rem',
              color: '#8D6E63',
              margin: '0 0 16px 0',
              lineHeight: '1.4',
              height: '2.8rem',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              wordBreak: 'break-word',
              fontFamily: 'Inter, sans-serif'
            }}>
              {product.descrioption}
            </p>
          )}

          {/* Профессиональная информационная секция */}
          <div style={{
            backgroundColor: '#f9f7f4',
            padding: variant === 'grid' ? '8px 12px' : '12px 16px',
            borderRadius: '8px',
            border: '1px solid #e8e2d5',
            marginBottom: '12px'
          }}>
            <div style={{
              fontSize: variant === 'grid' ? '0.8rem' : '0.875rem',
              color: '#5D4037',
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              flexWrap: 'wrap',
              justifyContent: variant === 'grid' ? 'center' : 'flex-start'
            }}>
              <span style={{
                fontWeight: '700',
                color: '#2F1B14',
                fontSize: variant === 'grid' ? '0.85rem' : '0.9rem'
              }}>{roundedVolume} м³</span>
              <span style={{ color: '#BCAAA4', fontSize: '0.7rem' }}>•</span>
              <span style={{ fontWeight: '600' }}>{pricePerCubicMeter} ₽/м³</span>
              {woodTypeName && woodTypeName !== 'Не указан' && (
                <>
                  <span style={{ color: '#BCAAA4', fontSize: '0.7rem' }}>•</span>
                  <span style={{
                    fontWeight: '600',
                    color: '#8B4513',
                    fontSize: variant === 'grid' ? '0.75rem' : '0.8rem'
                  }}>{woodTypeName}</span>
                </>
              )}
            </div>
          </div>

          {/* Информация о продавце */}
          {showSeller && sellerName && sellerName !== 'Неизвестный продавец' && (
            <div style={{
              fontSize: '0.8rem',
              color: '#A1887F',
              fontStyle: 'italic',
              textAlign: variant === 'grid' ? 'center' : 'left',
              marginBottom: '8px'
            }}>
              Продавец: {sellerName}
            </div>
          )}
        </div>

        {/* Профессиональная нижняя секция */}
        <div style={{
          borderTop: '1px solid #e8e2d5',
          paddingTop: '16px'
        }}>
          {/* Элегантная цена */}
          {config.showPrice && (
            <div style={{
              fontSize: variant === 'grid' ? '1.1rem' : (variant === 'hero' ? '1.5rem' : '1.3rem'),
              fontWeight: '800',
              color: '#2F1B14',
              marginBottom: '16px',
              textAlign: variant === 'hero' ? 'center' : 'left',
              fontFamily: 'Playfair Display, Georgia, serif',
              letterSpacing: '-0.02em'
            }}>
              {formatCurrency(product.price)}
            </div>
          )}

          {/* Профессиональные кнопки */}
          {config.showButtons && (
            <div style={{
              display: 'flex',
              flexDirection: config.buttonLayout === 'column' ? 'column' : 'row',
              gap: config.buttonLayout === 'column' ? '10px' : '8px'
            }}>
              {/* Кнопка "Подробнее" */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
                style={{
                  flex: config.buttonLayout === 'single' ? 0 : 1,
                  padding: variant === 'grid' ? '8px 12px' : '10px 16px',
                  backgroundColor: 'transparent',
                  color: '#8B4513',
                  border: '2px solid #8B4513',
                  borderRadius: '8px',
                  fontSize: variant === 'grid' ? '0.8rem' : '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontFamily: 'Inter, sans-serif',
                  letterSpacing: '0.02em',
                  minWidth: config.buttonLayout === 'single' ? '120px' : 'auto'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#8B4513';
                  e.target.style.color = 'white';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 8px rgba(139, 69, 19, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#8B4513';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                Подробнее
              </button>

              {/* Кнопка "Написать" */}
              {config.buttonLayout !== 'single' && (
                <button
                  onClick={handleStartChat}
                  disabled={isStartingChat}
                  style={{
                    flex: 1,
                    padding: variant === 'grid' ? '8px 12px' : '10px 16px',
                    backgroundColor: isStartingChat ? '#F57C00' : '#689F38',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: variant === 'grid' ? '0.8rem' : '0.875rem',
                    fontWeight: '600',
                    cursor: isStartingChat ? 'wait' : 'pointer',
                    transition: 'all 0.3s ease',
                    fontFamily: 'Inter, sans-serif',
                    letterSpacing: '0.02em',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isStartingChat) {
                      e.target.style.backgroundColor = '#5a8a32';
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 4px 8px rgba(104, 159, 56, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isStartingChat) {
                      e.target.style.backgroundColor = '#689F38';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                    }
                  }}
                >
                  {isStartingChat ? (variant === 'grid' ? 'Ждите...' : 'Подключение...') : 'Написать'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
