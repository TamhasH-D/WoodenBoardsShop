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
    navigate(`/products/${product.id}`);
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

  // Конфигурация для разных вариантов
  const getVariantConfig = () => {
    switch (variant) {
      case 'hero':
        return {
          height: '480px',
          maxWidth: '400px',
          imageHeight: '240px',
          padding: '20px',
          titleSize: '1.25rem',
          titleLines: 2,
          showPrice: true,
          showButtons: true,
          buttonLayout: 'column',
          showBadges: true
        };
      case 'grid':
        return {
          height: '380px',
          maxWidth: '320px',
          imageHeight: '160px',
          padding: '12px',
          titleSize: '0.875rem',
          titleLines: 2,
          showPrice: true,
          showButtons: true,
          buttonLayout: 'row',
          showBadges: true
        };
      case 'list':
        return {
          height: '140px',
          maxWidth: 'none',
          imageHeight: '100%',
          imageWidth: '180px',
          padding: '16px',
          titleSize: '1rem',
          titleLines: 1,
          showPrice: true,
          showButtons: true,
          buttonLayout: 'single',
          showBadges: false,
          layout: 'horizontal'
        };
      default: // catalog
        return {
          height: '540px',
          maxWidth: '420px',
          imageHeight: '220px',
          padding: '16px',
          titleSize: '1.125rem',
          titleLines: 3,
          showPrice: true,
          showButtons: true,
          buttonLayout: 'column',
          showBadges: true
        };
    }
  };

  const config = getVariantConfig();

  // Горизонтальная карточка (список)
  if (config.layout === 'horizontal') {
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
          height: config.height,
          overflow: 'hidden',
          width: '100%'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        {/* Изображение */}
        <div style={{
          width: config.imageWidth,
          height: '100%',
          backgroundImage: `url(${getProductImageUrl()})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#f3f4f6',
          flexShrink: 0
        }} />
        
        {/* Контент */}
        <div style={{
          flex: 1,
          padding: config.padding,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{
              fontSize: config.titleSize,
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 8px 0',
              lineHeight: '1.3',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {product.title || 'Товар без названия'}
            </h3>
            
            <div style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              <span>{roundedVolume} м³</span>
              <span>{pricePerCubicMeter} ₽/м³</span>
              {woodTypeName && woodTypeName !== 'Не указан' && <span>{woodTypeName}</span>}
              {showSeller && sellerName && <span>• {sellerName}</span>}
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

  // Вертикальная карточка (все остальные варианты)
  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: isHovered 
          ? (variant === 'hero' ? '0 8px 24px rgba(0,0,0,0.12)' : '0 4px 12px rgba(0,0,0,0.1)')
          : '0 1px 3px rgba(0,0,0,0.05)',
        border: '1px solid #e5e7eb',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        height: config.height,
        width: '100%',
        maxWidth: config.maxWidth,
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
        height: config.imageHeight,
        backgroundImage: `url(${getProductImageUrl()})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#f3f4f6',
        position: 'relative',
        flexShrink: 0
      }}>
        {/* Бейджи */}
        {config.showBadges && (
          <>
            {/* Бейдж доставки */}
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              backgroundColor: product.delivery_possible ? '#059669' : '#d97706',
              color: 'white',
              padding: variant === 'hero' ? '6px 12px' : '4px 8px',
              borderRadius: '6px',
              fontSize: variant === 'hero' ? '0.875rem' : '0.75rem',
              fontWeight: '600',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              {product.delivery_possible ? 'Доставка' : 'Самовывоз'}
            </div>
            
            {/* Цена за м³ */}
            <div style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              backgroundColor: 'rgba(0,0,0,0.8)',
              color: 'white',
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: '600',
              backdropFilter: 'blur(10px)'
            }}>
              {pricePerCubicMeter} ₽/м³
            </div>
          </>
        )}
      </div>
      
      {/* Контент */}
      <div style={{
        padding: config.padding,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontSize: config.titleSize,
            fontWeight: '700',
            color: '#1f2937',
            margin: '0 0 8px 0',
            lineHeight: '1.2',
            height: `${1.2 * config.titleLines}rem`,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: config.titleLines,
            WebkitBoxOrient: 'vertical',
            wordBreak: 'break-word'
          }}>
            {product.title || 'Товар без названия'}
          </h3>
          
          {showDescription && product.descrioption && variant === 'hero' && (
            <p style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              margin: '0 0 12px 0',
              lineHeight: '1.3',
              height: '2.6rem',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              wordBreak: 'break-word'
            }}>
              {product.descrioption}
            </p>
          )}
          
          <div style={{
            fontSize: variant === 'grid' ? '0.75rem' : '0.875rem',
            color: '#6b7280',
            marginBottom: '8px',
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            <span>{roundedVolume} м³</span>
            <span>•</span>
            <span>{pricePerCubicMeter} ₽/м³</span>
            {woodTypeName && woodTypeName !== 'Не указан' && (
              <>
                <span>•</span>
                <span>{woodTypeName}</span>
              </>
            )}
          </div>
          
          {showSeller && sellerName && sellerName !== 'Неизвестный продавец' && (
            <div style={{
              fontSize: '0.75rem',
              color: '#6b7280',
              marginBottom: '8px'
            }}>
              Продавец: {sellerName}
            </div>
          )}
        </div>
        
        <div>
          {config.showPrice && (
            <div style={{
              fontSize: variant === 'grid' ? '1rem' : '1.25rem',
              fontWeight: '800',
              color: '#1f2937',
              marginBottom: '12px',
              textAlign: variant === 'hero' ? 'center' : 'left'
            }}>
              {formatCurrency(product.price)}
            </div>
          )}
          
          {config.showButtons && (
            <div style={{
              display: 'flex',
              flexDirection: config.buttonLayout === 'column' ? 'column' : 'row',
              gap: config.buttonLayout === 'column' ? '8px' : '6px'
            }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
                style={{
                  flex: 1,
                  padding: variant === 'grid' ? '6px 8px' : '8px 12px',
                  backgroundColor: 'transparent',
                  color: '#3b82f6',
                  border: '1px solid #3b82f6',
                  borderRadius: '6px',
                  fontSize: variant === 'grid' ? '0.75rem' : '0.875rem',
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
                  padding: variant === 'grid' ? '6px 8px' : '8px 12px',
                  backgroundColor: isStartingChat ? '#d97706' : '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: variant === 'grid' ? '0.75rem' : '0.875rem',
                  fontWeight: '600',
                  cursor: isStartingChat ? 'wait' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {isStartingChat ? (variant === 'grid' ? '...' : 'Подключение...') : 'Написать'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
