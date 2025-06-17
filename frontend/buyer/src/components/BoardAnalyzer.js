import React, { useState, useRef, useEffect } from 'react';
import ImageUpload from './ui/ImageUpload';
import ResultDisplay from './ui/ResultDisplay';
import ErrorToast from './ui/ErrorToast';
import { apiService } from '../services/api';

/**
 * Анализатор досок для buyer frontend
 * Использует тот же красивый UI что и seller, но с API запросами для buyer
 */
const BoardAnalyzer = () => {
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

      // Используем apiService который правильно настроен с REACT_APP_API_URL
      const data = await apiService.analyzeWoodenBoard(file, height, length);
      setResult(data);

    } catch (err) {
      console.error('Ошибка подсчета досок:', err);
      setError(err instanceof Error ? err.message : 'Произошла ошибка при подсчете');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #f9fafb, #f3f4f6)',
      padding: '2rem 1rem',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: '112rem', margin: '0 auto' }}>
        {/* Заголовок */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, var(--color-primary), #1e40af)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            🪵 Анализатор досок
          </h1>
          <p style={{
            fontSize: '1.125rem',
            color: '#6b7280',
            maxWidth: '48rem',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Загрузите изображение досок и получите точный расчет объема с помощью искусственного интеллекта
          </p>
        </div>

        {/* Инструкции */}
        <div className="card" style={{ marginBottom: '2rem', maxWidth: '48rem', margin: '0 auto 2rem auto' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>
            📋 Инструкции по использованию
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <span style={{
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                borderRadius: '50%',
                width: '1.5rem',
                height: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: '600',
                flexShrink: 0
              }}>1</span>
              <p style={{ margin: 0, color: '#4b5563' }}>Введите размеры досок (высота и длина в миллиметрах)</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <span style={{
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                borderRadius: '50%',
                width: '1.5rem',
                height: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: '600',
                flexShrink: 0
              }}>2</span>
              <p style={{ margin: 0, color: '#4b5563' }}>Загрузите четкое изображение досок (PNG, JPG до 10MB)</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <span style={{
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                borderRadius: '50%',
                width: '1.5rem',
                height: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: '600',
                flexShrink: 0
              }}>3</span>
              <p style={{ margin: 0, color: '#4b5563' }}>Нажмите "Начать анализ" и получите результаты с интерактивной визуализацией</p>
            </div>
          </div>
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

export default BoardAnalyzer;
