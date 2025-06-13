import React, { useRef, useEffect, useState } from 'react';

/**
 * Компонент для отображения изображения с разметкой досок
 */
const ImagePreviewWithBoards = ({
  imageFile,
  imageUrl,
  analysisResult,
  onImageSelect,
  loading = false,
  compact = false
}) => {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  // eslint-disable-next-line no-unused-vars
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  // Отрисовка изображения и досок на canvas
  useEffect(() => {
    if (!canvasRef.current || !imageUrl) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Устанавливаем размеры canvas в зависимости от режима
      const maxWidth = compact ? 280 : 400;
      const maxHeight = compact ? 200 : 300;
      let { width, height } = img;

      // Масштабируем изображение
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;
      setImageDimensions({ width, height });

      // Отрисовываем изображение
      ctx.drawImage(img, 0, 0, width, height);

      // Отрисовываем доски если есть результат анализа
      if (analysisResult?.wooden_boards) {
        drawBoardsOnCanvas(ctx, analysisResult.wooden_boards, width, height, img.width, img.height);
      }
    };

    img.src = imageUrl;
  }, [imageUrl, analysisResult, compact]);

  const drawBoardsOnCanvas = (ctx, boards, canvasWidth, canvasHeight, originalWidth, originalHeight) => {
    const scaleX = canvasWidth / originalWidth;
    const scaleY = canvasHeight / originalHeight;

    boards.forEach((board, index) => {
      if (board.detection?.points && board.detection.points.length > 0) {
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 2;
        ctx.fillStyle = 'rgba(37, 99, 235, 0.1)';

        ctx.beginPath();
        const firstPoint = board.detection.points[0];
        ctx.moveTo(firstPoint.x * scaleX, firstPoint.y * scaleY);

        board.detection.points.forEach((point, i) => {
          if (i > 0) {
            ctx.lineTo(point.x * scaleX, point.y * scaleY);
          }
        });

        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Добавляем номер доски
        const centerX = board.detection.points.reduce((sum, p) => sum + p.x, 0) / board.detection.points.length * scaleX;
        const centerY = board.detection.points.reduce((sum, p) => sum + p.y, 0) / board.detection.points.length * scaleY;

        ctx.fillStyle = '#2563eb';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${index + 1}`, centerX, centerY);
      }
    });
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file && onImageSelect) {
      onImageSelect(file);
    }
  };

  const handleCanvasClick = () => {
    if (!imageFile && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="form-group">
      {!compact && <label className="form-label">Фотография досок</label>}

      <div
        style={{
          border: '2px dashed var(--color-border)',
          borderRadius: 'var(--border-radius)',
          padding: compact ? '0.5rem' : '1rem',
          textAlign: 'center',
          cursor: imageFile ? 'default' : 'pointer',
          transition: 'all 0.2s ease',
          backgroundColor: imageFile ? 'var(--color-bg)' : 'var(--color-bg-light)',
          position: 'relative',
          minHeight: compact ? '220px' : '350px', // Увеличиваем минимальную высоту для размещения результатов
          display: 'flex',
          flexDirection: 'column',
          justifyContent: imageFile ? 'flex-start' : 'center'
        }}
        onClick={handleCanvasClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          style={{ display: 'none' }}
        />

        {!imageFile && !loading && (
          <div style={{ padding: compact ? '1rem' : '2rem' }}>
            <div style={{
              fontSize: compact ? '2rem' : '3rem',
              marginBottom: compact ? '0.5rem' : '1rem',
              color: 'var(--color-text-light)'
            }}>
              📷
            </div>
            <p style={{
              color: 'var(--color-text)',
              marginBottom: '0.5rem',
              fontSize: compact ? 'var(--font-size-sm)' : 'var(--font-size-base)'
            }}>
              {compact ? 'Выберите фото' : 'Нажмите для выбора изображения досок'}
            </p>
            {!compact && (
              <p style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-sm)' }}>
                Поддерживаются форматы: JPG, PNG, WebP (до 10MB)
              </p>
            )}
          </div>
        )}

        {loading && (
          <div style={{ padding: compact ? '1rem' : '2rem' }}>
            <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
            <p style={{
              color: 'var(--color-text)',
              fontSize: compact ? 'var(--font-size-sm)' : 'var(--font-size-base)'
            }}>
              {compact ? 'Анализируем...' : 'Анализируем изображение...'}
            </p>
          </div>
        )}

        {imageFile && imageUrl && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: 1,
            justifyContent: 'flex-start'
          }}>
            <div style={{ position: 'relative' }}>
              <canvas
                ref={canvasRef}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: 'var(--border-radius)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />

              {/* Результаты анализа как overlay поверх изображения */}
              {analysisResult && (
                <div style={{
                  position: 'absolute',
                  bottom: '8px',
                  left: '8px',
                  right: '8px',
                  padding: compact ? '0.25rem 0.5rem' : '0.5rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: 'var(--border-radius)',
                  border: '1px solid var(--color-success)',
                  backdropFilter: 'blur(4px)',
                  fontSize: compact ? 'var(--font-size-xs)' : 'var(--font-size-sm)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: 'var(--color-success-dark)'
                  }}>
                    <span style={{ fontWeight: 'bold' }}>
                      ✅ {compact ? 'Готово' : 'Анализ завершен'}
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem', fontSize: 'inherit' }}>
                      <span><strong>Досок:</strong> {analysisResult.board_count || analysisResult.wooden_boards?.length || 0}</span>
                      <span><strong>Объем:</strong> {analysisResult.total_volume?.toFixed(4)} м³</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {!compact && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (fileInputRef.current) {
                    fileInputRef.current.click();
                  }
                }}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  padding: '0.25rem 0.5rem',
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--border-radius)',
                  fontSize: 'var(--font-size-xs)',
                  cursor: 'pointer',
                  opacity: 0.8,
                  transition: 'opacity 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.opacity = '1'}
                onMouseLeave={(e) => e.target.style.opacity = '0.8'}
              >
                📷 Изменить
              </button>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .loading-spinner {
          display: inline-block;
          width: 2rem;
          height: 2rem;
          border: 3px solid var(--color-border-light);
          border-top-color: var(--color-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ImagePreviewWithBoards;
