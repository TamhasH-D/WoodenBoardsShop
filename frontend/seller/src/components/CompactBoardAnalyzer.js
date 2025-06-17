import React, { useState, useRef, useEffect } from 'react';

/**
 * Компактный инструмент подсчета досок для формы создания товара
 * Горизонтальное расположение: поля ввода слева, изображение справа
 * Улучшенная версия с фиксированными размерами и плавными переходами
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
  const [loadingProgress, setLoadingProgress] = useState(0);

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
      setLoadingProgress(0);

      if (onImageSelect) {
        onImageSelect(file);
      }
    }
  };

  // Обработка очистки
  const handleClear = () => {
    setSelectedFile(null);
    setImageUrl(null);
    setResult(null);
    setError(null);
    setLoadingProgress(0);
    setAnalyzing(false);

    // Очищаем input file для возможности повторного выбора того же файла
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Симуляция плавной загрузки
  const simulateLoadingProgress = () => {
    setLoadingProgress(0);
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90; // Останавливаемся на 90%, завершение при получении результата
        }
        return prev + Math.random() * 15;
      });
    }, 200);
    return interval;
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
    setResult(null);

    // Запускаем симуляцию прогресса
    const progressInterval = simulateLoadingProgress();

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      // Используем правильный базовый URL для API
      const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const apiUrl = `${apiBaseUrl}/api/v1/wooden-boards/calculate-volume?board_height=${height}&board_length=${length}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Ошибка подсчета: ${response.status}`);
      }

      const data = await response.json();

      // Завершаем прогресс
      clearInterval(progressInterval);
      setLoadingProgress(100);

      // Небольшая задержка для плавности
      setTimeout(() => {
        setResult(data);
        setLoadingProgress(0);
      }, 300);

      if (onAnalysisComplete) {
        onAnalysisComplete({
          ...data,
          image: selectedFile,
          boardHeight: height,
          boardLength: length
        });
      }

    } catch (err) {
      clearInterval(progressInterval);
      console.error('Ошибка подсчета:', err);
      setError(err.message || 'Произошла ошибка при подсчете');
      setLoadingProgress(0);
    } finally {
      setAnalyzing(false);
    }
  };

  // Отрисовка изображения с фиксированными размерами
  useEffect(() => {
    if (!canvasRef.current || !imageUrl) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Фиксированные размеры canvas для предотвращения прыжков
      const containerWidth = 280;
      const containerHeight = 180;

      // Вычисляем масштаб для сохранения пропорций
      const scaleX = containerWidth / img.width;
      const scaleY = containerHeight / img.height;
      const scale = Math.min(scaleX, scaleY);

      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;

      // Центрируем изображение
      const offsetX = (containerWidth - scaledWidth) / 2;
      const offsetY = (containerHeight - scaledHeight) / 2;

      // Устанавливаем фиксированные размеры canvas
      canvas.width = containerWidth;
      canvas.height = containerHeight;

      // Очищаем canvas
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, containerWidth, containerHeight);

      // Отрисовка изображения по центру
      ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);

      // Отрисовка досок полупрозрачными линиями
      if (result?.wooden_boards) {
        drawBoardOutlines(ctx, result.wooden_boards, scaledWidth, scaledHeight, img.width, img.height, offsetX, offsetY);
      }
    };

    img.src = imageUrl;
  }, [imageUrl, result]);

  // Отрисовка контуров досок с учетом смещения
  const drawBoardOutlines = (ctx, boards, scaledWidth, scaledHeight, originalWidth, originalHeight, offsetX, offsetY) => {
    const scaleX = scaledWidth / originalWidth;
    const scaleY = scaledHeight / originalHeight;

    boards.forEach((board, index) => {
      if (board.detection?.points && board.detection.points.length > 0) {
        // Полупрозрачные линии с улучшенным стилем
        ctx.strokeStyle = 'rgba(37, 99, 235, 0.8)';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]); // Более заметная пунктирная линия

        ctx.beginPath();
        const firstPoint = board.detection.points[0];
        ctx.moveTo(
          firstPoint.x * scaleX + offsetX,
          firstPoint.y * scaleY + offsetY
        );

        board.detection.points.forEach((point, i) => {
          if (i > 0) {
            ctx.lineTo(
              point.x * scaleX + offsetX,
              point.y * scaleY + offsetY
            );
          }
        });

        ctx.closePath();
        ctx.stroke();
        ctx.setLineDash([]); // Сброс пунктира

        // Добавляем номер доски
        if (board.detection.points.length > 0) {
          const centerX = board.detection.points.reduce((sum, p) => sum + p.x, 0) / board.detection.points.length;
          const centerY = board.detection.points.reduce((sum, p) => sum + p.y, 0) / board.detection.points.length;

          ctx.fillStyle = 'rgba(37, 99, 235, 0.9)';
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(
            (index + 1).toString(),
            centerX * scaleX + offsetX,
            centerY * scaleY + offsetY
          );
        }
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
                  onClick={handleClear}
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

            {error && (
              <div className="error-message fade-in">
                ⚠️ {error}
              </div>
            )}
          </div>

          {/* Правая часть - изображение с фиксированными размерами */}
          <div className="image-section-fixed">
            {imageUrl && (
              <div className="image-container-fixed">
                <canvas
                  ref={canvasRef}
                  className="analysis-canvas-fixed"
                />
              </div>
            )}

            {!imageUrl && (
              <div className="image-placeholder-fixed">
                <div className="placeholder-icon-large">🖼️</div>
                <p className="placeholder-text">Изображение появится здесь</p>
                <p className="placeholder-hint">Загрузите фото досок для подсчета</p>
              </div>
            )}
          </div>

          {/* Полоса загрузки и результаты под изображением */}
          <div className="analysis-status-bar">
            {analyzing && (
              <div className="loading-bar-container fade-in">
                <div className="loading-bar-text">
                  🔢 Подсчитываем доски...
                </div>
                <div className="progress-bar-horizontal">
                  <div
                    className="progress-fill-horizontal"
                    style={{ width: `${loadingProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {result && !analyzing && (
              <div className="results-bar-container fade-in">
                <div className="results-text">
                  ✅ Обнаружено досок: <strong>{result.wooden_boards?.length || 0}</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompactBoardAnalyzer;
