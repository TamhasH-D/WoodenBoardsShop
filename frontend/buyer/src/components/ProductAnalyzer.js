import React, { useState, useRef, useEffect } from 'react';
import { apiService } from '../services/api';

/**
 * Компонент для анализа товара прямо на странице товара
 * Использует тот же API что и BoardAnalyzer, но работает с изображением товара
 */
const ProductAnalyzer = ({ product, onAnalysisComplete }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const canvasRef = useRef(null);
  const [boardHeight, setBoardHeight] = useState('0.05'); // 5 см по умолчанию
  const [boardLength, setBoardLength] = useState('2.0'); // 2 м по умолчанию
  const [loadingDimensions, setLoadingDimensions] = useState(false);

  // Автоматически загружаем средние размеры досок при загрузке компонента
  useEffect(() => {
    if (product?.id) {
      loadAverageBoardDimensions();
    }
  }, [product?.id]);

  // Функция для загрузки средних размеров досок
  const loadAverageBoardDimensions = async () => {
    if (!product?.id) return;

    setLoadingDimensions(true);
    try {
      // Получаем все доски для данного товара с пагинацией
      let allBoards = [];
      let page = 0;
      const size = 20;
      let hasMore = true;

      while (hasMore) {
        try {
          const response = await apiService.getWoodenBoardsByProduct(product.id, page, size);
          const boards = response.data || [];

          if (boards.length === 0) {
            hasMore = false;
          } else {
            allBoards = [...allBoards, ...boards];
            page++;

            // Если получили меньше чем размер страницы, значит это последняя страница
            if (boards.length < size) {
              hasMore = false;
            }
          }
        } catch (err) {
          console.error(`Ошибка загрузки досок (страница ${page}):`, err);
          hasMore = false;
        }
      }

      if (allBoards.length > 0) {
        // Фильтруем доски с валидными размерами
        const validBoards = allBoards.filter(board =>
          board.height && board.height > 0 &&
          board.length && board.length > 0
        );

        if (validBoards.length > 0) {
          // Вычисляем средние значения
          const avgHeight = validBoards.reduce((sum, board) => sum + board.height, 0) / validBoards.length;
          const avgLength = validBoards.reduce((sum, board) => sum + board.length, 0) / validBoards.length;

          setBoardHeight(avgHeight.toFixed(3));
          setBoardLength(avgLength.toFixed(1));

          console.log(`Загружены средние размеры досок: высота ${avgHeight.toFixed(3)}м, длина ${avgLength.toFixed(1)}м (из ${validBoards.length} досок)`);
        }
      }
    } catch (err) {
      console.error('Ошибка загрузки средних размеров досок:', err);
      // Оставляем значения по умолчанию
    } finally {
      setLoadingDimensions(false);
    }
  };

  // Рисуем результаты анализа на canvas
  useEffect(() => {
    if (!analysisResult || !canvasRef.current || !product) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Устанавливаем размеры canvas
      canvas.width = img.width;
      canvas.height = img.height;

      // Рисуем изображение
      ctx.drawImage(img, 0, 0);

      // Рисуем контуры досок
      if (analysisResult.wooden_boards && analysisResult.wooden_boards.length > 0) {
        analysisResult.wooden_boards.forEach((board, index) => {
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
    };

    img.src = apiService.getProductImageUrl(product.id);
  }, [analysisResult, product]);

  const handleAnalyze = async () => {
    if (!product?.id) {
      setError('Товар не найден');
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
      // Получаем изображение товара как blob
      const imageUrl = apiService.getProductImageUrl(product.id);
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Создаем File объект из blob
      const file = new File([blob], `product-${product.id}.jpg`, { type: blob.type });

      // Подсчитываем доски на изображении
      const result = await apiService.analyzeWoodenBoard(file, height, length);
      setAnalysisResult(result);
      setShowAnalysis(true);

      // Уведомляем родительский компонент о завершении подсчета
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }

    } catch (err) {
      console.error('Ошибка анализа товара:', err);
      setError(err instanceof Error ? err.message : 'Произошла ошибка при анализе');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '32px',
      marginBottom: '40px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      border: '1px solid rgba(0,0,0,0.05)'
    }}>
      <h2 style={{
        margin: '0 0 24px 0',
        fontSize: '26px',
        fontWeight: '700',
        color: '#1f2937',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        🔍 Анализ досок
      </h2>

      {/* Информация о размерах */}
      <div style={{
        padding: '16px',
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        marginBottom: '24px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px'
        }}>
          <span style={{ fontSize: '16px' }}>📏</span>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
            Размеры досок для анализа
          </span>
          {loadingDimensions && (
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid #e5e7eb',
              borderTop: '2px solid #2563eb',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          )}
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth >= 640 ? 'repeat(2, 1fr)' : '1fr',
          gap: '16px'
        }}>
          <div style={{
            padding: '12px 16px',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #d1d5db'
          }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
              Высота доски
            </div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
              {loadingDimensions ? 'Загрузка...' : `${boardHeight} м`}
            </div>
          </div>
          <div style={{
            padding: '12px 16px',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #d1d5db'
          }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
              Длина доски
            </div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
              {loadingDimensions ? 'Загрузка...' : `${boardLength} м`}
            </div>
          </div>
        </div>
        <div style={{
          marginTop: '12px',
          fontSize: '12px',
          color: '#6b7280',
          textAlign: 'center'
        }}>
          💡 Размеры рассчитаны автоматически на основе средних значений досок данного товара
        </div>
      </div>

      {/* Кнопка анализа */}
      <button
        onClick={handleAnalyze}
        disabled={analyzing || loadingDimensions}
        style={{
          width: '100%',
          padding: '16px 24px',
          backgroundColor: (analyzing || loadingDimensions) ? '#9ca3af' : '#8B4513',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: '700',
          cursor: (analyzing || loadingDimensions) ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '24px',
          boxShadow: (analyzing || loadingDimensions) ? 'none' : '0 4px 16px rgba(139, 69, 19, 0.3)'
        }}
        onMouseEnter={(e) => {
          if (!analyzing && !loadingDimensions) {
            e.target.style.backgroundColor = '#A0522D';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 8px 24px rgba(139, 69, 19, 0.4)';
          }
        }}
        onMouseLeave={(e) => {
          if (!analyzing && !loadingDimensions) {
            e.target.style.backgroundColor = '#8B4513';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 16px rgba(139, 69, 19, 0.3)';
          }
        }}
      >
        {loadingDimensions ? (
          <>
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid transparent',
              borderTop: '2px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            Загружаем размеры...
          </>
        ) : analyzing ? (
          <>
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid transparent',
              borderTop: '2px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            Анализируем...
          </>
        ) : (
          <>
            🔍 Анализировать изображение
          </>
        )}
      </button>

      {/* Ошибка */}
      {error && (
        <div style={{
          padding: '16px',
          backgroundColor: '#fef2f2',
          borderRadius: '8px',
          border: '1px solid #fecaca',
          marginBottom: '24px'
        }}>
          <p style={{
            margin: 0,
            color: '#dc2626',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            ❌ {error}
          </p>
        </div>
      )}

      {/* Результаты анализа */}
      {showAnalysis && analysisResult && (
        <div style={{
          border: '2px solid #10b981',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          <div style={{
            backgroundColor: '#10b981',
            color: 'white',
            padding: '16px',
            fontSize: '18px',
            fontWeight: '700'
          }}>
            📊 Результаты анализа
          </div>
          
          <div style={{ padding: '24px' }}>
            {/* Canvas с результатами */}
            <canvas
              ref={canvasRef}
              style={{
                maxWidth: '100%',
                height: 'auto',
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                marginBottom: '24px'
              }}
            />

            {/* Статистика */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: window.innerWidth >= 640 ? 'repeat(2, 1fr)' : '1fr',
              gap: '16px'
            }}>
              <div style={{
                padding: '16px',
                backgroundColor: '#f0f9ff',
                borderRadius: '8px',
                border: '1px solid #0ea5e9'
              }}>
                <div style={{ fontSize: '14px', color: '#0369a1', fontWeight: '500' }}>
                  Общий объем
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#0c4a6e' }}>
                  {analysisResult.total_volume?.toFixed(4) || '0'} м³
                </div>
              </div>
              <div style={{
                padding: '16px',
                backgroundColor: '#f0f9ff',
                borderRadius: '8px',
                border: '1px solid #0ea5e9'
              }}>
                <div style={{ fontSize: '14px', color: '#0369a1', fontWeight: '500' }}>
                  Количество досок
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#0c4a6e' }}>
                  {analysisResult.wooden_boards?.length || 0}
                </div>
              </div>
            </div>

            <div style={{
              marginTop: '16px',
              fontSize: '12px',
              color: '#0369a1',
              textAlign: 'center'
            }}>
              💡 Зеленые контуры показывают обнаруженные доски
            </div>
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

export default ProductAnalyzer;
