import React, { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import { apiService } from '../../services/api';
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

        // Получаем изображения для товара
        const images = await apiService.getProductImages(productId);

        if (images && images.length > 0) {
          // Берем первое изображение
          const mainImage = images[0];

          // Получаем URL для файла изображения
          const imageFileUrl = apiService.getImageFileUrl(mainImage.id);
          setImageUrl(imageFileUrl);
        } else {
          // Нет изображений для товара
          setError(true);
        }
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
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { width: '40px', height: '40px' };
      case 'medium':
        return { width: '60px', height: '60px' };
      case 'large':
        return { width: '120px', height: '120px' };
      case 'full':
        return { width: '100%', height: '200px' };
      default:
        return { width: '60px', height: '60px' };
    }
  };

  const sizeStyles = getSizeStyles();

  if (loading) {
    return (
      <div 
        className={`product-image-container ${className}`}
        style={{
          ...sizeStyles,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8f9fa',
          border: '1px solid #e9ecef',
          borderRadius: '4px'
        }}
      >
        <div 
          style={{
            width: '20px',
            height: '20px',
            border: '2px solid #e9ecef',
            borderTop: '2px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}
        />
      </div>
    );
  }

  if (error || !imageUrl) {
    return showPlaceholder ? (
      <div 
        className={`product-image-container ${className}`}
        style={{
          ...sizeStyles,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8f9fa',
          border: '1px solid #e9ecef',
          borderRadius: '4px',
          color: '#6c757d'
        }}
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
        className={`product-image-container ${className}`}
        style={{
          cursor: 'pointer'
        }}
        onClick={handleClick}
        title="Нажмите для просмотра с анализом досок"
      >
      <img
        src={imageUrl}
        alt={alt}
        style={{
          ...sizeStyles,
          objectFit: 'cover',
          borderRadius: '4px',
          border: '1px solid #e9ecef',
          transition: 'transform 0.2s ease'
        }}
        onMouseEnter={(e) => {
          if (onClick) {
            e.target.style.transform = 'scale(1.05)';
          }
        }}
        onMouseLeave={(e) => {
          if (onClick) {
            e.target.style.transform = 'scale(1)';
          }
        }}
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

        // Получаем все изображения для товара
        const productImages = await apiService.getProductImages(productId);

        if (productImages && productImages.length > 0) {
          // Ограничиваем количество изображений
          const limitedImages = productImages.slice(0, maxImages);

          // Получаем URLs для файлов изображений
          const imageUrls = limitedImages.map(img => ({
            id: img.id,
            url: apiService.getImageFileUrl(img.id),
            path: img.image_path
          }));

          setImages(imageUrls);
        } else {
          setError(true);
        }
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
      <div className="product-gallery" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: '8px',
        padding: '8px'
      }}>
        {images.map((image, index) => (
          <div
            key={image.id}
            className="product-gallery-item"
            onClick={() => onImageClick && onImageClick(image, index)}
            style={{
              cursor: onImageClick ? 'pointer' : 'default',
              borderRadius: '4px',
              overflow: 'hidden',
              border: '1px solid #e9ecef'
            }}
          >
            <img
              src={image.url}
              alt={`${alt} ${index + 1}`}
              style={{
                width: '100%',
                height: '120px',
                objectFit: 'cover',
                display: 'block'
              }}
              loading="lazy"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductImage;
