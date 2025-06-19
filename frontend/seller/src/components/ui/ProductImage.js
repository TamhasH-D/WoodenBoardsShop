import React, { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import ImageViewerModal from './ImageViewerModal';

/**
 * Компонент для отображения изображения товара
 * Автоматически загружает изображение по ID товара
 */
const ProductImage = ({
  productId,
  alt = 'Изображение товара',
  className = '',
  size = 'medium',
  showPlaceholder = true,
  onImageLoad,
  onImageError,
  onClick
}) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      setError(true);
      return;
    }

    const loadProductImage = async () => {
      try {
        setLoading(true);
        setError(false);

        // Используем прямой эндпоинт для получения изображения товара
        const baseUrl = (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/\/+$/, '');
        // Добавляем timestamp для принудительного обновления изображения
        const timestamp = new Date().getTime();
        const imageUrl = `${baseUrl}/api/v1/products/${productId}/image?t=${timestamp}`;

        // Устанавливаем URL напрямую, обработка ошибок будет в onError
        setImageUrl(imageUrl);
      } catch (err) {
        console.error('Ошибка загрузки изображения товара:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadProductImage();
  }, [productId]);

  const handleImageLoad = () => {
    setError(false);
    if (onImageLoad) {
      onImageLoad();
    }
  };

  const handleImageError = () => {
    setError(true);
    if (onImageError) {
      onImageError();
    }
  };

  // Определяем размеры в зависимости от size
  // const getSizeStyles = () => { // Removed
  //   switch (size) {
  //     case 'small':
  //       return { width: '40px', height: '40px' };
  //     case 'medium':
  //       return { width: '60px', height: '60px' };
  //     case 'large':
  //       return { width: '120px', height: '120px' };
  //     case 'full':
  //       return { width: '100%', height: '200px' };
  //     default:
  //       return { width: '60px', height: '60px' };
  //   }
  // };
  // const sizeStyles = getSizeStyles(); // Removed

  const getSizeClasses = (sizeProp) => {
    switch (sizeProp) {
      case 'small':
        return 'w-10 h-10'; // 40px
      case 'medium':
        return 'w-16 h-16'; // 64px
      case 'large':
        return 'w-24 h-24 md:w-32 md:h-32'; // 96px / 128px
      case 'full':
        return 'w-full h-48 md:h-56'; // 12rem / 14rem
      default:
        return 'w-16 h-16'; // Default to medium
    }
  };

  const sizeClasses = getSizeClasses(size);

  if (loading) {
    return (
      <div 
        className={`product-image-container ${className} ${sizeClasses} flex items-center justify-center bg-slate-100 border border-slate-200 rounded`}
        // style prop removed
      >
        <div 
          className="w-5 h-5 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin"
          // style prop removed
        />
      </div>
    );
  }

  if (error || !imageUrl) {
    return showPlaceholder ? (
      <div 
        className={`product-image-container ${className} ${sizeClasses} flex items-center justify-center bg-slate-100 border border-slate-200 rounded text-slate-500`}
        // style prop removed
      >
        <Package size={size === 'small' ? 16 : size === 'large' ? 32 : 24} />
      </div>
    ) : null;
  }

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <div
        className={`product-image-container ${className} ${onClick ? 'cursor-pointer' : ''}`}
        // style prop removed
        onClick={handleClick}
        title="Нажмите для просмотра с анализом досок"
      >
      <img
        src={imageUrl}
        alt={alt}
        className={`${sizeClasses} object-cover rounded border border-slate-200 transition-transform duration-200 ease-in-out ${onClick ? 'hover:scale-105' : ''}`}
        // style prop removed
        // onMouseEnter and onMouseLeave removed, hover effect via Tailwind if onClick is present
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
      />
    </div>

    {/* Модальное окно для просмотра изображения */}
    {showModal && imageUrl && (
      <ImageViewerModal
        imageUrl={imageUrl}
        alt={alt}
        onClose={() => setShowModal(false)}
      />
    )}
  </>
  );
};

/**
 * Компонент для отображения галереи изображений товара
 */
export const ProductImageGallery = ({
  productId,
  alt = 'Изображение товара',
  className = '',
  maxImages = 5,
  onImageClick
}) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      setError(true);
      return;
    }

    const loadProductImages = async () => {
      try {
        setLoading(true);
        setError(false);

        // Для галереи пока используем только основное изображение товара
        const baseUrl = (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/\/+$/, '');
        // Добавляем timestamp для принудительного обновления изображения
        const timestamp = new Date().getTime();
        const imageUrl = `${baseUrl}/api/v1/products/${productId}/image?t=${timestamp}`;

        // Устанавливаем изображение напрямую
        setImages([{
          id: `product-${productId}`,
          url: imageUrl,
          path: imageUrl
        }]);
      } catch (err) {
        console.error('Ошибка загрузки изображений товара:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadProductImages();
  }, [productId, maxImages]);

  if (loading) {
    return (
      <div className={`product-gallery-container ${className}`}>
        <div className="product-gallery-loading">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error || !images.length) {
    return (
      <div className={`product-gallery-container ${className}`}>
        <div className="product-gallery-placeholder">
          <Package size={32} />
          <span>Нет изображений</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`product-gallery-container ${className}`}>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2 p-2">
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`product-gallery-item rounded overflow-hidden border border-slate-200 ${onImageClick ? 'cursor-pointer' : 'cursor-default'}`}
            onClick={() => onImageClick && onImageClick(image, index)}
            // style prop removed
          >
            <img
              src={image.url}
              alt={`${alt} ${index + 1}`}
              className="w-full h-24 sm:h-32 object-cover block"
              // style prop removed
              loading="lazy"
              onError={(e) => {
                e.target.style.display = 'none'; // This can remain as a small JS fallback for broken images
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductImage;
