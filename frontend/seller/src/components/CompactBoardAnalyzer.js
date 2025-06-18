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
      // Get actual dimensions of the canvas parent for responsiveness
      const parentElement = canvas.parentElement;
      if (!parentElement) return;

      const containerWidth = parentElement.clientWidth;
      const containerHeight = parentElement.clientHeight;

      canvas.width = containerWidth;
      canvas.height = containerHeight;

      // Вычисляем масштаб для сохранения пропорций
      const scaleX = containerWidth / img.width;
      const scaleY = containerHeight / img.height;
      const scale = Math.min(scaleX, scaleY);

      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;

      // Центрируем изображение
      const offsetX = (containerWidth - scaledWidth) / 2;
      const offsetY = (containerHeight - scaledHeight) / 2;

      // Очищаем canvas
      ctx.fillStyle = '#f8fafc'; // or use a Tailwind bg color if applied to parent
      ctx.fillRect(0, 0, containerWidth, containerHeight);

      // Отрисовка изображения по центру
      ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);

      // Отрисовка досок полупрозрачными линиями
      if (result?.wooden_boards) {
        drawBoardOutlines(ctx, result.wooden_boards, scaledWidth, scaledHeight, img.width, img.height, offsetX, offsetY);
      }
    };

    img.src = imageUrl;
  }, [imageUrl, result]); // Removed drawBoardOutlines from dependency array as it's defined in component scope

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
    <div className="bg-white border border-slate-200 rounded-lg p-5 mb-6"> {/* Replaced compact-board-analyzer */}
      {/* Заголовок */}
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-200"> {/* Replaced analyzer-header */}
        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg flex items-center justify-center text-xl flex-shrink-0 text-white">📸</div> {/* Replaced analyzer-icon */}
        <div> {/* Replaced analyzer-title */}
          <h4 className="text-lg font-semibold text-slate-800 m-0 mb-1">Анализ досок</h4>
          <p className="text-sm text-slate-500 m-0">Автоматический расчет объема по фотографии</p>
        </div>
      </div>

      {/* Основной контент */}
      <div className={`${disabled ? 'opacity-60 pointer-events-none' : ''}`}> {/* Replaced analyzer-content and disabled class effect */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6 items-start">
          {/* Левая часть - поля ввода и кнопки */}
          <div className="flex flex-col gap-4"> {/* Replaced controls-section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> {/* Replaced dimensions-row */}
              <div className="flex flex-col gap-1"> {/* Replaced dimension-input */}
                <label className="text-sm font-medium text-slate-700">Высота (мм)</label>
                <input
                  type="number"
                  value={boardHeight}
                  onChange={(e) => setBoardHeight(e.target.value)}
                  placeholder="50"
                  min="1"
                  max="1000"
                  disabled={analyzing}
                  className="form-input py-2 px-3 border-slate-300 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col gap-1"> {/* Replaced dimension-input */}
                <label className="text-sm font-medium text-slate-700">Длина (мм)</label>
                <input
                  type="number"
                  value={boardLength}
                  onChange={(e) => setBoardLength(e.target.value)}
                  placeholder="1000"
                  min="1"
                  max="10000"
                  disabled={analyzing}
                  className="form-input py-2 px-3 border-slate-300 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2"> {/* Replaced action-buttons */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden" // Replaced style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-secondary btn-sm" // Assuming btn-sm provides adequate padding/text size
                disabled={analyzing}
              >
                📁 Загрузить
              </button>
              {selectedFile && (
                <button
                  type="button"
                  onClick={handleAnalyze}
                  className="btn btn-primary btn-sm" // Assuming btn-sm provides adequate padding/text size
                  disabled={analyzing || !boardHeight || !boardLength}
                >
                  {analyzing ? '⏳ Анализ...' : '🔍 Анализировать'}
                </button>
              )}
              {selectedFile && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="btn btn-ghost btn-sm" // Assuming btn-sm provides adequate padding/text size
                  disabled={analyzing}
                >
                  🗑️ Очистить
                </button>
              )}
            </div>

            {selectedFile && (
              <div className="text-xs text-slate-500 p-2 bg-slate-100 rounded-md border-l-4 border-blue-500 mt-2"> {/* Replaced file-info */}
                📎 {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-100 border border-red-200 text-red-700 text-sm rounded-md mt-2 fade-in"> {/* Replaced error-message */}
                ⚠️ {error}
              </div>
            )}
          </div>

          {/* Правая часть - изображение с фиксированными размерами */}
          <div className="relative w-full md:w-[300px] h-[200px] bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg overflow-hidden transition-all duration-300 ease-in-out">
            {imageUrl && (
              <div className="h-full w-full flex items-center justify-center"> {/* Replaced image-container-fixed basic behavior */}
                <canvas
                  ref={canvasRef}
                  className="block max-w-full max-h-full" // Replaced analysis-canvas-fixed basic behavior
                />
              </div>
            )}

            {!imageUrl && (
              <div className="flex flex-col items-center justify-center gap-1 text-slate-500 text-center h-full p-4"> {/* Replaced image-placeholder-fixed */}
                <div className="text-4xl text-slate-400 opacity-60 mb-1">🖼️</div> {/* Replaced placeholder-icon-large */}
                <p className="text-sm font-medium">Изображение появится здесь</p> {/* Replaced placeholder-text */}
                <p className="text-xs opacity-80">Загрузите фото досок для подсчета</p> {/* Replaced placeholder-hint */}
              </div>
            )}
          </div>

          {/* Полоса загрузки и результаты под изображением */}
          {/* Added md:col-start-2 to align with the image column on medium+ screens and w-full for small screens */}
          <div className="mt-3 min-h-[50px] flex items-center w-full md:col-start-2"> {/* Replaced analysis-status-bar */}
            {analyzing && (
              <div className="w-full p-3 bg-slate-100 rounded-lg border border-slate-200 text-center fade-in"> {/* Replaced loading-bar-container */}
                <div className="text-sm text-slate-700 font-medium mb-2"> {/* Replaced loading-bar-text */}
                  🔢 Подсчитываем доски...
                </div>
                <div className="w-full h-2 bg-slate-300 rounded-full overflow-hidden"> {/* Replaced progress-bar-horizontal */}
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 ease-in-out shadow-sm" // Replaced progress-fill-horizontal
                    style={{ width: `${loadingProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {result && !analyzing && (
              <div className="w-full p-3 bg-green-50 rounded-lg border border-green-200 text-center fade-in"> {/* Replaced results-bar-container */}
                <div className="text-sm text-green-700 font-medium"> {/* Replaced results-text */}
                  ✅ Обнаружено досок: <span className="font-bold">{result.wooden_boards?.length || 0}</span>
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
