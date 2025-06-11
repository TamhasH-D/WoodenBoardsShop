import React, { useState, useRef, useEffect } from 'react';

/**
 * Компактный анализатор досок для формы создания товара
 * Горизонтальное расположение: поля ввода слева, изображение справа
 */
const CompactBoardAnalyzer = ({
  onAnalysisComplete,
  onImageSelect,
  disabled = false,
  initialHeight = '50',
  initialLength = '1000'
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [boardHeight, setBoardHeight] = useState(initialHeight);
  const [boardLength, setBoardLength] = useState(initialLength);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // Обработка выбора файла
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setResult(null);
      setError(null);
      
      if (onImageSelect) {
        onImageSelect(file);
      }
    }
  };

  // Анализ изображения
  const handleAnalyze = async () => {
    if (!selectedFile || !boardHeight || !boardLength) {
      setError('Выберите изображение и укажите размеры досок');
      return;
    }

    const height = parseFloat(boardHeight);
    const length = parseFloat(boardLength);

    if (height <= 0 || length <= 0) {
      setError('Размеры должны быть положительными числами');
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch(
        `/api/v1/wooden-boards/calculate-volume?board_height=${height}&board_length=${length}`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Ошибка анализа: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);

      if (onAnalysisComplete) {
        onAnalysisComplete({
          ...data,
          image: selectedFile,
          boardHeight: height,
          boardLength: length
        });
      }

    } catch (err) {
      console.error('Ошибка анализа:', err);
      setError(err.message || 'Произошла ошибка при анализе');
    } finally {
      setAnalyzing(false);
    }
  };

  // Отрисовка изображения с полупрозрачными линиями
  useEffect(() => {
    if (!canvasRef.current || !imageUrl) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Размеры canvas
      const maxWidth = 300;
      const maxHeight = 200;
      let { width, height } = img;

      // Масштабирование
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;

      // Отрисовка изображения
      ctx.drawImage(img, 0, 0, width, height);

      // Отрисовка досок полупрозрачными линиями (без подсчета)
      if (result?.wooden_boards) {
        drawBoardOutlines(ctx, result.wooden_boards, width, height, img.width, img.height);
      }
    };

    img.src = imageUrl;
  }, [imageUrl, result]);

  // Отрисовка контуров досок полупрозрачными линиями
  const drawBoardOutlines = (ctx, boards, canvasWidth, canvasHeight, originalWidth, originalHeight) => {
    const scaleX = canvasWidth / originalWidth;
    const scaleY = canvasHeight / originalHeight;

    boards.forEach((board) => {
      if (board.detection?.points && board.detection.points.length > 0) {
        // Полупрозрачные линии без заливки
        ctx.strokeStyle = 'rgba(37, 99, 235, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 3]); // Пунктирная линия

        ctx.beginPath();
        const firstPoint = board.detection.points[0];
        ctx.moveTo(firstPoint.x * scaleX, firstPoint.y * scaleY);

        board.detection.points.forEach((point, i) => {
          if (i > 0) {
            ctx.lineTo(point.x * scaleX, point.y * scaleY);
          }
        });

        ctx.closePath();
        ctx.stroke();
        ctx.setLineDash([]); // Сброс пунктира
      }
    });
  };

  return (
    <div className="compact-board-analyzer">
      {/* Заголовок */}
      <div className="analyzer-header">
        <div className="analyzer-icon">📸</div>
        <div className="analyzer-title">
          <h4>Анализ досок</h4>
          <p>Автоматический расчет объема по фотографии</p>
        </div>
      </div>

      {/* Основной контент */}
      <div className={`analyzer-content ${disabled ? 'disabled' : ''}`}>
        <div className="analyzer-layout">
          {/* Левая часть - поля ввода и кнопки */}
          <div className="controls-section">
            <div className="dimensions-row">
              <div className="dimension-input">
                <label>Высота (мм)</label>
                <input
                  type="number"
                  value={boardHeight}
                  onChange={(e) => setBoardHeight(e.target.value)}
                  placeholder="50"
                  min="1"
                  max="1000"
                  disabled={analyzing}
                />
              </div>
              <div className="dimension-input">
                <label>Длина (мм)</label>
                <input
                  type="number"
                  value={boardLength}
                  onChange={(e) => setBoardLength(e.target.value)}
                  placeholder="1000"
                  min="1"
                  max="10000"
                  disabled={analyzing}
                />
              </div>
            </div>

            <div className="action-buttons">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-secondary btn-sm"
                disabled={analyzing}
              >
                📁 Загрузить
              </button>
              {selectedFile && (
                <button
                  type="button"
                  onClick={handleAnalyze}
                  className="btn btn-primary btn-sm"
                  disabled={analyzing || !boardHeight || !boardLength}
                >
                  {analyzing ? '⏳ Анализ...' : '🔍 Анализировать'}
                </button>
              )}
              {selectedFile && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setImageUrl(null);
                    setResult(null);
                    setError(null);
                  }}
                  className="btn btn-ghost btn-sm"
                  disabled={analyzing}
                >
                  🗑️ Очистить
                </button>
              )}
            </div>

            {selectedFile && (
              <div className="file-info">
                📎 {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}

            {result && (
              <div className="quick-results">
                <div className="result-item">
                  <span className="result-label">Досок:</span>
                  <span className="result-value">{result.wooden_boards?.length || 0}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">Объем:</span>
                  <span className="result-value">{result.total_volume?.toFixed(4)} м³</span>
                </div>
              </div>
            )}

            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}
          </div>

          {/* Правая часть - изображение */}
          <div className="image-section">
            {analyzing && (
              <div className="loading-overlay">
                <div className="spinner"></div>
                <p>Анализируем...</p>
              </div>
            )}
            
            {imageUrl && (
              <div className="image-container">
                <canvas
                  ref={canvasRef}
                  className="analysis-canvas"
                />
              </div>
            )}

            {!imageUrl && !analyzing && (
              <div className="image-placeholder">
                <div className="placeholder-icon">🖼️</div>
                <p>Изображение появится здесь</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompactBoardAnalyzer;
