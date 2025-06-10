import React, { useState, useRef, useEffect } from 'react';
import ImageUpload from './ui/ImageUpload';
import ResultDisplay from './ui/ResultDisplay';
import ErrorToast from './ui/ErrorToast';
import { apiService } from '../services/api';

/**
 * Анализатор досок для seller frontend
 * Использует тот же красивый UI что и buyer, но с API запросами для seller
 */
const BoardAnalyzer = () => {
  const [imageUrl, setImageUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const resultRef = useRef(null);

  // Загрузка истории анализов из localStorage при монтировании
  useEffect(() => {
    const savedHistory = localStorage.getItem('boardAnalysisHistory');
    if (savedHistory) {
      try {
        setAnalysisHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Error loading analysis history:', e);
      }
    }
  }, []);

  // Сохранение истории в localStorage
  const saveToHistory = (result) => {
    const historyItem = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      fileName: selectedFile?.name || 'Unknown',
      boardHeight: parseFloat(boardHeight),
      boardLength: parseFloat(boardLength),
      totalVolume: result.total_volume,
      boardCount: result.wooden_boards?.length || 0,
      result: result
    };

    const newHistory = [historyItem, ...analysisHistory.slice(0, 9)]; // Храним последние 10 анализов
    setAnalysisHistory(newHistory);
    localStorage.setItem('boardAnalysisHistory', JSON.stringify(newHistory));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setAnalysisResult(null);
      setError(null);
      setShowDetails(false);

      // Создаем превью изображения
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !boardHeight || !boardLength) {
      setError('Пожалуйста, выберите изображение и укажите размеры досок');
      return;
    }

    const height = parseFloat(boardHeight);
    const length = parseFloat(boardLength);

    if (height <= 0 || length <= 0) {
      setError('Размеры досок должны быть положительными числами');
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const response = await apiService.analyzeBoardImage(selectedFile, height / 1000, length / 1000);
      const result = response.data;
      
      setAnalysisResult(result);
      setShowDetails(true);
      saveToHistory(result);

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

  const loadFromHistory = (historyItem) => {
    setBoardHeight(historyItem.boardHeight.toString());
    setBoardLength(historyItem.boardLength.toString());
    setAnalysisResult(historyItem.result);
    setShowDetails(true);
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearHistory = () => {
    setAnalysisHistory([]);
    localStorage.removeItem('boardAnalysisHistory');
  };

  // Отрисовка результатов на canvas
  useEffect(() => {
    if (analysisResult && preview && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // Рисуем контуры досок
        if (analysisResult.wooden_boards) {
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
        }
      };
      
      img.src = preview;
    }
  }, [analysisResult, preview]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🔍 {SELLER_TEXTS.AI_BOARD_ANALYZER}</h1>
        <p className="page-description">
          Анализируйте изображения досок с помощью искусственного интеллекта для точного расчета объема древесины
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Левая колонка - Форма анализа */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">📸 Загрузка и анализ изображения</h2>
          </div>

          <div className="form-group">
            <label className="form-label">
              Изображение досок для анализа *
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="form-input"
            />
            {selectedFile && (
              <div className="file-info">
                Выбран файл: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">
                Высота досок (мм) *
              </label>
              <input
                type="number"
                value={boardHeight}
                onChange={(e) => setBoardHeight(e.target.value)}
                placeholder="50"
                min="1"
                step="0.1"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Длина досок (мм) *
              </label>
              <input
                type="number"
                value={boardLength}
                onChange={(e) => setBoardLength(e.target.value)}
                placeholder="3000"
                min="1"
                step="0.1"
                className="form-input"
              />
            </div>
          </div>

          <div className="analyzer-actions">
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={!selectedFile || !boardHeight || !boardLength || analyzing}
              className="btn btn-primary"
            >
              {analyzing ? '🔄 Анализируем...' : '🔍 Анализировать изображение'}
            </button>
            
            {(selectedFile || analysisResult) && (
              <button
                type="button"
                onClick={clearAnalysis}
                disabled={analyzing}
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
        </div>

        {/* Правая колонка - Превью и результаты */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">📊 Результаты анализа</h2>
          </div>

          {preview && (
            <div className="image-preview">
              <h4>Изображение с обнаруженными досками:</h4>
              <canvas
                ref={canvasRef}
                style={{ maxWidth: '100%', height: 'auto', border: '1px solid #ddd' }}
              />
            </div>
          )}

          {analysisResult && showDetails && (
            <div className="analysis-results">
              <div className="results-summary">
                <h4>📈 Сводка анализа:</h4>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Обнаружено досок:</span>
                    <span className="stat-value">{analysisResult.wooden_boards?.length || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Общий объем:</span>
                    <span className="stat-value">{analysisResult.total_volume?.toFixed(4)} м³</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Размеры досок:</span>
                    <span className="stat-value">{boardHeight} × {boardLength} мм</span>
                  </div>
                </div>
              </div>

              {analysisResult.wooden_boards && analysisResult.wooden_boards.length > 0 && (
                <div className="boards-details">
                  <h5>Детали по доскам:</h5>
                  <div className="boards-list">
                    {analysisResult.wooden_boards.map((board, index) => (
                      <div key={index} className="board-item">
                        <span className="board-number">#{index + 1}</span>
                        <span className="board-volume">{board.volume?.toFixed(4)} м³</span>
                        <span className="board-dimensions">
                          {board.width?.toFixed(1)} × {board.height?.toFixed(1)} × {board.length?.toFixed(1)} мм
                        </span>
                        <span className="board-confidence">
                          {(board.detection?.confidence * 100)?.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* История анализов */}
      {analysisHistory.length > 0 && (
        <div className="card mt-6">
          <div className="card-header">
            <h2 className="card-title">📋 История анализов</h2>
            <button
              onClick={clearHistory}
              className="btn btn-secondary btn-sm"
            >
              🗑️ Очистить историю
            </button>
          </div>

          <div className="history-list">
            {analysisHistory.map((item) => (
              <div key={item.id} className="history-item">
                <div className="history-info">
                  <div className="history-filename">{item.fileName}</div>
                  <div className="history-details">
                    {new Date(item.timestamp).toLocaleString('ru-RU')} • 
                    {item.boardCount} досок • 
                    {item.totalVolume?.toFixed(4)} м³ • 
                    {item.boardHeight}×{item.boardLength} мм
                  </div>
                </div>
                <button
                  onClick={() => loadFromHistory(item)}
                  className="btn btn-secondary btn-sm"
                >
                  📂 Загрузить
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardAnalyzer;
