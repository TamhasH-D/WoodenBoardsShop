import React, { useRef, useEffect, useState } from 'react';

const ProductImageWithBoards = ({ product, style = {} }) => {
  const canvasRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!product?.image_id || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Устанавливаем размеры canvas
      canvas.width = img.width;
      canvas.height = img.height;

      // Рисуем изображение
      ctx.drawImage(img, 0, 0);

      // Рисуем контуры досок, если есть данные
      if (product.wooden_boards && product.wooden_boards.length > 0) {
        product.wooden_boards.forEach((board, index) => {
          if (board.detection && board.detection.points) {
            const { points } = board.detection;
            
            // Настройки для контуров
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 3;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 2;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            
            // Рисуем контур доски
            ctx.beginPath();
            if (points && points.length > 0) {
              ctx.moveTo(points[0].x, points[0].y);
              points.forEach((point, i) => {
                if (i > 0) {
                  ctx.lineTo(point.x, point.y);
                }
              });
              ctx.closePath();
              ctx.stroke();
              
              // Добавляем полупрозрачную заливку
              ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
              ctx.fill();
              
              // Сбрасываем тень для текста
              ctx.shadowColor = 'transparent';
              ctx.shadowBlur = 0;
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 0;
              
              // Добавляем номер доски в центре
              const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
              const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
              
              // Фон для номера
              ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
              ctx.beginPath();
              ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
              ctx.fill();
              
              // Номер доски
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 16px Arial';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(`${index + 1}`, centerX, centerY);
            }
          }
        });
      }

      console.log(`Изображение товара ${product.id} загружено успешно`);
      setImageLoaded(true);
    };

    img.onerror = () => {
      console.error(`Ошибка загрузки изображения товара ${product.id}:`, img.src);
      setImageError(true);
    };

    // Загружаем изображение через правильный API endpoint
    const baseUrl = (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/\/+$/, '');
    const imageUrl = `${baseUrl}/api/v1/images/${product.image_id}/file`;
    console.log(`Загружаем изображение товара ${product.id}:`, imageUrl);
    img.src = imageUrl;
  }, [product]);

  if (imageError) {
    return (
      <div style={{
        ...style,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f3f4f6',
        border: '2px dashed #d1d5db',
        borderRadius: '8px',
        padding: '40px',
        minHeight: '300px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🖼️</div>
        <p style={{
          margin: 0,
          color: '#6b7280',
          fontSize: '16px',
          textAlign: 'center'
        }}>
          Изображение недоступно
        </p>
      </div>
    );
  }

  if (!product?.image_id) {
    return (
      <div style={{
        ...style,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f3f4f6',
        border: '2px dashed #d1d5db',
        borderRadius: '8px',
        padding: '40px',
        minHeight: '300px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📷</div>
        <p style={{
          margin: 0,
          color: '#6b7280',
          fontSize: '16px',
          textAlign: 'center'
        }}>
          Изображение не загружено
        </p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', ...style }}>
      {!imageLoaded && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
          minHeight: '300px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid #e5e7eb',
            borderTop: '3px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '16px'
          }} />
          <p style={{
            margin: 0,
            color: '#6b7280',
            fontSize: '14px'
          }}>
            Загрузка изображения...
          </p>
        </div>
      )}
      
      <canvas
        ref={canvasRef}
        style={{
          maxWidth: '100%',
          height: 'auto',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          display: imageLoaded ? 'block' : 'none'
        }}
      />
      
      {imageLoaded && product.wooden_boards && product.wooden_boards.length > 0 && (
        <div style={{
          marginTop: '16px',
          padding: '16px',
          backgroundColor: '#f0f9ff',
          borderRadius: '8px',
          border: '1px solid #0ea5e9'
        }}>
          <h4 style={{
            margin: '0 0 12px 0',
            fontSize: '16px',
            fontWeight: '600',
            color: '#0c4a6e'
          }}>
            📊 Анализ досок
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px'
          }}>
            <div style={{
              padding: '12px',
              backgroundColor: 'white',
              borderRadius: '6px',
              border: '1px solid #bae6fd'
            }}>
              <div style={{ fontSize: '14px', color: '#0369a1', fontWeight: '500' }}>
                Общий объем
              </div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#0c4a6e' }}>
                {product.volume?.toFixed(4) || '0'} м³
              </div>
            </div>
            <div style={{
              padding: '12px',
              backgroundColor: 'white',
              borderRadius: '6px',
              border: '1px solid #bae6fd'
            }}>
              <div style={{ fontSize: '14px', color: '#0369a1', fontWeight: '500' }}>
                Количество досок
              </div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#0c4a6e' }}>
                {product.wooden_boards.length}
              </div>
            </div>
          </div>
          
          <div style={{
            marginTop: '12px',
            fontSize: '12px',
            color: '#0369a1'
          }}>
            💡 Зеленые контуры показывают обнаруженные доски
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ProductImageWithBoards;
