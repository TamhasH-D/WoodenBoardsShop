import React, { useState, useRef, useEffect } from 'react';

const BoardImageAnalyzer = ({ 
  onAnalysisComplete, 
  onImageSelect, 
  disabled = false,
  initialHeight = '',
  initialLength = ''
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [boardHeight, setBoardHeight] = useState(initialHeight);
  const [boardLength, setBoardLength] = useState(initialLength);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // Очистка preview при размонтировании
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Проверка типа файла
      if (!file.type.startsWith('image/')) {
        setError('Пожалуйста, выберите файл изображения');
        return;
      }

      // Проверка размера файла (максимум 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Размер файла не должен превышать 10MB');
        return;
      }

      setSelectedFile(file);
      setError(null);
      setAnalysisResult(null);

      // Создание preview
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      const newPreview = URL.createObjectURL(file);
      setPreview(newPreview);

      // Уведомляем родительский компонент о выборе изображения
      if (onImageSelect) {
        onImageSelect(file);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Пожалуйста, выберите изображение');
      return;
    }

    const height = parseFloat(boardHeight);
    const length = parseFloat(boardLength);

    if (isNaN(height) || height <= 0) {
      setError('Пожалуйста, введите корректную высоту доски');
      return;
    }

    if (isNaN(length) || length <= 0) {
      setError('Пожалуйста, введите корректную длину доски');
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      // Конвертируем мм в метры для API
      const heightInMeters = height / 1000;
      const lengthInMeters = length / 1000;

      const response = await fetch(
        `/api/v1/wooden_boards_volume_seg/?height=${heightInMeters}&length=${lengthInMeters}`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Ошибка анализа: ${response.status}`);
      }

      const result = await response.json();
      setAnalysisResult(result);
      setShowDetails(true);

      // Уведомляем родительский компонент о завершении анализа
      if (onAnalysisComplete) {
        onAnalysisComplete({
          ...result,
          image: selectedFile,
          boardHeight: height,
          boardLength: length
        });
      }

    } catch (err) {
      console.error('Ошибка анализа изображения:', err);
      setError(err.message || 'Произошла ошибка при анализе изображения');
    } finally {
      setAnalyzing(false);
    }
  };

  const clearAnalysis = () => {
    setSelectedFile(null);
    setPreview(null);
    setBoardHeight('');
    setBoardLength('');
    setAnalysisResult(null);
    setError(null);
    setShowDetails(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Отрисовка результатов на canvas
  useEffect(() => {
    if (analysisResult && preview && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Устанавливаем размер canvas равным размеру изображения
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Рисуем изображение
        ctx.drawImage(img, 0, 0);
        
        // Рисуем контуры досок
        analysisResult.wooden_boards.forEach((board, index) => {
          const { points } = board.detection;
          
          ctx.strokeStyle = '#00ff00';
          ctx.lineWidth = 3;
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
            
            // Добавляем номер доски
            const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
            const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
            
            ctx.fillStyle = '#00ff00';
            ctx.font = '20px Arial';
            ctx.fillText(`${index + 1}`, centerX - 10, centerY + 5);
          }
        });
      };
      
      img.src = preview;
    }
  }, [analysisResult, preview]);

  return (
    <div className="board-analyzer">
      <div className="form-group">
        <label className="form-label">
          📸 Изображение досок для анализа
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={disabled}
          className="form-input"
        />
        {selectedFile && (
          <div className="file-info">
            Выбран файл: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </div>
        )}
      </div>

      <div className="dimensions-input">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Высота доски (мм) *</label>
            <input
              type="number"
              value={boardHeight}
              onChange={(e) => setBoardHeight(e.target.value)}
              placeholder="Например: 50"
              disabled={disabled}
              className="form-input"
              min="1"
              step="0.1"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Длина доски (мм) *</label>
            <input
              type="number"
              value={boardLength}
              onChange={(e) => setBoardLength(e.target.value)}
              placeholder="Например: 6000"
              disabled={disabled}
              className="form-input"
              min="1"
              step="0.1"
            />
          </div>
        </div>
      </div>

      <div className="analyzer-actions">
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={!selectedFile || !boardHeight || !boardLength || analyzing || disabled}
          className="btn btn-primary"
        >
          {analyzing ? '🔄 Анализируем...' : '🔍 Анализировать изображение'}
        </button>
        
        {(selectedFile || analysisResult) && (
          <button
            type="button"
            onClick={clearAnalysis}
            disabled={analyzing || disabled}
            className="btn btn-secondary"
          >
            🗑️ Очистить
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {preview && (
        <div className="image-preview">
          <h4>Предварительный просмотр:</h4>
          {!analysisResult ? (
            <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '400px' }} />
          ) : (
            <canvas
              ref={canvasRef}
              style={{ maxWidth: '100%', maxHeight: '400px', border: '1px solid #ddd' }}
            />
          )}
        </div>
      )}

      {analysisResult && showDetails && (
        <div className="analysis-results">
          <h4>📊 Результаты анализа:</h4>
          <div className="results-summary">
            <div className="result-card">
              <div className="result-value">{analysisResult.total_volume.toFixed(4)} м³</div>
              <div className="result-label">Общий объем</div>
            </div>
            <div className="result-card">
              <div className="result-value">{analysisResult.total_count}</div>
              <div className="result-label">Количество досок</div>
            </div>
          </div>

          {analysisResult.wooden_boards && analysisResult.wooden_boards.length > 0 && (
            <div className="boards-details">
              <h5>Детали по доскам:</h5>
              <div className="boards-list">
                {analysisResult.wooden_boards.map((board, index) => (
                  <div key={index} className="board-item">
                    <span className="board-number">#{index + 1}</span>
                    <span className="board-volume">{board.volume.toFixed(4)} м³</span>
                    <span className="board-dimensions">
                      {board.width.toFixed(1)} × {board.height.toFixed(1)} × {board.length.toFixed(1)} мм
                    </span>
                    <span className="board-confidence">
                      {(board.detection.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BoardImageAnalyzer;
