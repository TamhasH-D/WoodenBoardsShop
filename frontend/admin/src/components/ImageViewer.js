import React, { useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import LoadingSpinner from './ui/LoadingSpinner';
import {
  EyeIcon,
  XMarkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
} from '@heroicons/react/24/outline';

/**
 * Image Viewer Component for Admin Panel
 * Displays images with zoom and full-screen capabilities
 */
function ImageViewer({ imageId, imagePath, productTitle }) {
  const [showModal, setShowModal] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const imageUrl = imageId ? `${process.env.REACT_APP_API_URL || 'http://172.27.65.14:8000'}/api/v1/images/${imageId}/file` : null;

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  // Сокращаем путь к файлу для отображения
  const getShortPath = (path) => {
    if (!path) return '';
    const parts = path.split('/');
    const filename = parts[parts.length - 1];
    if (filename.length > 25) {
      return filename.substring(0, 22) + '...';
    }
    return filename;
  };

  return (
    <>
      {/* Thumbnail with view button */}
      <div className="flex items-center gap-2">
        <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
          {imageUrl ? (
            <>
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <LoadingSpinner size="sm" />
                </div>
              )}
              {imageError ? (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <span className="text-xs">❌</span>
                </div>
              ) : (
                <img
                  src={imageUrl}
                  alt="Thumbnail"
                  className="w-full h-full object-cover"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <span className="text-xs">🖼️</span>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {productTitle || 'Изображение'}
          </p>
          <p className="text-xs text-gray-500 truncate" title={imagePath}>
            {getShortPath(imagePath) || imageId}
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowModal(true)}
          className="p-1"
          disabled={!imageUrl}
        >
          <EyeIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Full-size image modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setIsZoomed(false);
        }}
        title="Просмотр изображения"
        size="xl"
      >
        <div className="space-y-4">
          {/* Image info */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {productTitle || 'Изображение товара'}
              </h3>
              <p className="text-sm text-gray-500">
                ID: {imageId}
              </p>
              <p className="text-xs text-gray-500">
                Путь: {imagePath}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleZoom}
                className="flex items-center gap-1"
              >
                {isZoomed ? (
                  <>
                    <ArrowsPointingInIcon className="h-4 w-4" />
                    Уменьшить
                  </>
                ) : (
                  <>
                    <ArrowsPointingOutIcon className="h-4 w-4" />
                    Увеличить
                  </>
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowModal(false)}
              >
                <XMarkIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Image display */}
          <div className={`relative bg-gray-50 rounded-lg overflow-hidden ${
            isZoomed ? 'h-96' : 'h-64'
          } transition-all duration-300`}>
            {imageUrl ? (
              <>
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <LoadingSpinner />
                  </div>
                )}
                {imageError ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                    <span className="text-4xl mb-2">❌</span>
                    <p className="text-sm">Ошибка загрузки изображения</p>
                    <p className="text-xs mt-1">Проверьте путь к файлу</p>
                  </div>
                ) : (
                  <img
                    src={imageUrl}
                    alt={productTitle || 'Product image'}
                    className={`w-full h-full transition-all duration-300 ${
                      isZoomed 
                        ? 'object-contain cursor-zoom-out' 
                        : 'object-cover cursor-zoom-in'
                    }`}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    onClick={toggleZoom}
                  />
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                <span className="text-4xl mb-2">🖼️</span>
                <p className="text-sm">Изображение недоступно</p>
              </div>
            )}
          </div>

          {/* Image actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Нажмите на изображение для изменения масштаба
            </div>
            
            <div className="flex items-center gap-2">
              {imageUrl && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => window.open(imageUrl, '_blank')}
                >
                  Открыть в новой вкладке
                </Button>
              )}
              
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowModal(false)}
              >
                Закрыть
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default ImageViewer;
