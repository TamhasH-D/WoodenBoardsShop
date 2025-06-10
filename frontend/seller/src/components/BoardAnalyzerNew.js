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
  const resultRef = useRef(null);

  // Автоскролл к результатам после анализа
  useEffect(() => {
    if (result && !loading && resultRef.current) {
      const yOffset = -window.innerHeight * 0.35; // 35% высоты viewport как отступ
      const element = resultRef.current;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, [result, loading]);

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

    } catch (err) {
      console.error('Ошибка анализа изображения:', err);
      setError(err instanceof Error ? err.message : 'Произошла ошибка при анализе');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Анализатор досок</h1>
        <p className="page-description">
          Загрузите изображение досок и получите точный анализ объема и количества с помощью искусственного интеллекта
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <ImageUpload onAnalyze={handleAnalyze} />

        {loading && (
          <div className="card">
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="loading-spinner"></div>
              <p style={{ marginTop: '1rem', color: 'var(--color-text)', fontWeight: '500' }}>
                Анализируем изображение...
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-light)', marginTop: '0.5rem' }}>
                Это может занять несколько секунд
              </p>
            </div>
          </div>
        )}

        <ErrorToast error={error} onDismiss={() => setError(null)} />

        {imageUrl && result && (
          <div ref={resultRef}>
            <ResultDisplay imageUrl={imageUrl} result={result} />
          </div>
        )}
      </div>

      <style jsx>{`
        .loading-spinner {
          display: inline-block;
          width: 2.5rem;
          height: 2.5rem;
          border: 4px solid var(--color-border-light);
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

export default BoardAnalyzerNew;
