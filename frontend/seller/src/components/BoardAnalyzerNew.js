import React, { useState, useRef, useEffect } from 'react';
import ImageUpload from './ui/ImageUpload';
import ResultDisplay from './ui/ResultDisplay';
import ErrorToast from './ui/ErrorToast';
import { apiService } from '../services/api';

/**
 * Анализатор досок для seller frontend
 * Использует тот же красивый UI что и buyer, но с API запросами для seller
 */
const BoardAnalyzerNew = () => {
  const [imageUrl, setImageUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const resultRef = useRef(null);

  // Загрузка истории анализов при монтировании
  useEffect(() => {
    const savedHistory = localStorage.getItem('sellerBoardAnalysisHistory');
    if (savedHistory) {
      try {
        setAnalysisHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Ошибка загрузки истории анализов:', e);
      }
    }
  }, []);

  // Автоскролл к результатам после анализа
  useEffect(() => {
    if (result && !loading && resultRef.current) {
      const yOffset = -window.innerHeight * 0.35; // 35% высоты viewport как отступ
      const element = resultRef.current;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, [result, loading]);

  // Сохранение в историю
  const saveToHistory = (result) => {
    const historyItem = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      result,
      imageUrl
    };
    
    const newHistory = [historyItem, ...analysisHistory].slice(0, 10); // Храним последние 10
    setAnalysisHistory(newHistory);
    localStorage.setItem('sellerBoardAnalysisHistory', JSON.stringify(newHistory));
  };

  const handleAnalyze = async (file, height, length) => {
    try {
      setLoading(true);
      setError(null);

      // Создаем object URL для предварительного просмотра
      const objectUrl = URL.createObjectURL(file);
      setImageUrl(objectUrl);

      // Используем apiService для анализа (тот же что и в buyer)
      const data = await apiService.analyzeWoodenBoard(file, height, length);
      setResult(data);
      saveToHistory(data);

    } catch (err) {
      console.error('Ошибка анализа изображения:', err);
      setError(err instanceof Error ? err.message : 'Произошла ошибка при анализе');
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setAnalysisHistory([]);
    localStorage.removeItem('sellerBoardAnalysisHistory');
  };

  const loadFromHistory = (historyItem) => {
    setImageUrl(historyItem.imageUrl);
    setResult(historyItem.result);
    setError(null);
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem 0'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: '700', 
            color: 'white', 
            marginBottom: '1rem',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            🔍 Анализатор досок
          </h1>
          <p style={{ 
            fontSize: '1.125rem', 
            color: 'rgba(255,255,255,0.9)', 
            maxWidth: '600px', 
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Загрузите изображение досок и получите точный анализ объема и количества с помощью искусственного интеллекта
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <ImageUpload onAnalyze={handleAnalyze} />

          {loading && (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{
                display: 'inline-block',
                width: '2.5rem',
                height: '2.5rem',
                border: '4px solid var(--color-primary)',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ marginTop: '1rem', color: '#374151', fontWeight: '500', margin: '1rem 0 0 0' }}>
                Анализируем изображение...
              </p>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem', margin: '0.5rem 0 0 0' }}>
                Это может занять несколько секунд
              </p>
            </div>
          )}

          <ErrorToast error={error} onDismiss={() => setError(null)} />

          {imageUrl && result && (
            <div ref={resultRef}>
              <ResultDisplay imageUrl={imageUrl} result={result} />
            </div>
          )}

          {/* История анализов */}
          {analysisHistory.length > 0 && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151', margin: 0 }}>
                  История анализов
                </h3>
                <button
                  onClick={clearHistory}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}
                >
                  Очистить историю
                </button>
              </div>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '1rem'
              }}>
                {analysisHistory.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => loadFromHistory(item)}
                    style={{
                      padding: '1rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      backgroundColor: '#f9fafb'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = '#f3f4f6';
                      e.target.style.borderColor = '#d1d5db';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = '#f9fafb';
                      e.target.style.borderColor = '#e5e7eb';
                    }}
                  >
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                      {new Date(item.timestamp).toLocaleString('ru-RU')}
                    </div>
                    <div style={{ fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                      Объем: {item.result.total_volume?.toFixed(4)} м³
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      Досок: {item.result.total_count || 0}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default BoardAnalyzerNew;
