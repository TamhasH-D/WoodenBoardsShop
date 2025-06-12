import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';

/**
 * Компонент для отображения изображения товара
 * Использует новый API endpoint /api/v1/images/{id}/file
 */
const ProductImage = ({ 
  productId, 
  alt = 'Изображение товара',
  className = '',
  placeholder = '🌲',
  showPlaceholder = true,
  onImageLoad,
  onImageError
}) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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

          // Получаем URL для файла изображения через apiService
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

  if (loading) {
    return (
      <div className={`product-image-container ${className}`}>
        <div className="product-image-loading">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error || !imageUrl) {
    return showPlaceholder ? (
      <div className={`product-image-container ${className}`}>
        <div className="product-image-placeholder">
          {placeholder}
        </div>
      </div>
    ) : null;
  }

  return (
    <div className={`product-image-container ${className}`}>
      <img
        src={imageUrl}
        alt={alt}
        className="product-image"
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
      />
    </div>
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
          
          // Получаем URLs для файлов изображений через apiService
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

  if (error || images.length === 0) {
    return (
      <div className={`product-gallery-container ${className}`}>
        <div className="product-gallery-placeholder">
          🌲 Нет изображений
        </div>
      </div>
    );
  }

  return (
    <div className={`product-gallery-container ${className}`}>
      <div className="product-gallery">
        {images.map((image, index) => (
          <div 
            key={image.id} 
            className="product-gallery-item"
            onClick={() => onImageClick && onImageClick(image, index)}
          >
            <img
              src={image.url}
              alt={`${alt} ${index + 1}`}
              className="product-gallery-image"
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
