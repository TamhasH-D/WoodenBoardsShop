import React, { useState, useRef } from 'react';

/**
 * Компонент загрузки изображения для анализа досок
 * Адаптирован из backend/prosto_board_volume-main/frontend
 */
const ImageUpload = ({ onAnalyze }) => {
  const [heightMm, setHeightMm] = useState('50'); // 50mm по умолчанию
  const [lengthMm, setLengthMm] = useState('1000'); // 1000mm по умолчанию
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (file.size > 10 * 1024 * 1024) {
      setError('Размер файла должен быть менее 10MB');
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setError(null);

    // Track image upload event
    if (window.umami) {
      window.umami.track('Board Analyzer - Image Uploaded', {
        fileSize: Math.round(file.size / 1024), // KB
        fileType: file.type
      });
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleInputChange = (value, setter) => {
    // Разрешаем пустую строку для лучшего UX при вводе
    if (value === '') {
      setter('');
      return;
    }

    // Заменяем запятую на точку и удаляем все нечисловые символы кроме точки
    const sanitizedValue = value.replace(',', '.').replace(/[^\d.]/g, '');

    // Обеспечиваем только одну десятичную точку
    const parts = sanitizedValue.split('.');
    if (parts.length > 2) {
      return;
    }

    setter(sanitizedValue);
  };

  const handleAnalyze = () => {
    if (!selectedFile) {
      setError('Пожалуйста, сначала выберите изображение');
      return;
    }

    const height = parseFloat(heightMm);
    const length = parseFloat(lengthMm);

    if (isNaN(height) || height <= 0) {
      setError('Пожалуйста, введите корректную высоту');
      return;
    }

    if (isNaN(length) || length <= 0) {
      setError('Пожалуйста, введите корректную длину');
      return;
    }

    // Track analysis start event
    if (window.umami) {
      window.umami.track('Board Analyzer - Analysis Started', {
        height: height,
        length: length,
        fileSize: Math.round(selectedFile.size / 1024) // KB
      });
    }

    // Конвертируем мм в метры перед отправкой
    onAnalyze(selectedFile, height / 1000, length / 1000);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="card" style={{ maxWidth: '48rem', margin: '0 auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ 
          display: 'grid', 
          gap: '1.5rem',
          gridTemplateColumns: window.innerWidth >= 640 ? '1fr 1fr' : '1fr'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label className="form-label" style={{ marginBottom: '0.25rem' }}>
              Шаг 1: Введите высоту доски (мм)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={heightMm}
              onChange={(e) => handleInputChange(e.target.value, setHeightMm)}
              className="form-input"
              placeholder="например, 50"
              style={{
                borderRadius: '0.5rem',
                border: '1px solid #d1d5db',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                padding: '0.75rem 1rem',
                fontSize: '1rem'
              }}
            />
            <div style={{
              marginTop: '0.5rem',
              backgroundColor: '#dbeafe',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              borderLeft: '4px solid var(--color-primary)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <p style={{ fontSize: '0.875rem', color: '#1e40af', margin: 0 }}>
                Введите среднюю высоту досок в миллиметрах. Это поможет точно рассчитать объем.
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label className="form-label" style={{ marginBottom: '0.25rem' }}>
              Шаг 2: Введите длину доски (мм)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={lengthMm}
              onChange={(e) => handleInputChange(e.target.value, setLengthMm)}
              className="form-input"
              placeholder="например, 1000"
              style={{
                borderRadius: '0.5rem',
                border: '1px solid #d1d5db',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                padding: '0.75rem 1rem',
                fontSize: '1rem'
              }}
            />
            <div style={{
              marginTop: '0.5rem',
              backgroundColor: '#dbeafe',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              borderLeft: '4px solid var(--color-primary)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <p style={{ fontSize: '0.875rem', color: '#1e40af', margin: 0 }}>
                Введите среднюю длину досок в миллиметрах. Это обеспечивает точные расчеты.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label className="form-label" style={{ marginBottom: '0.5rem' }}>
            Шаг 3: Загрузите изображение досок
          </label>
          <div
            style={{
              position: 'relative',
              border: `2px dashed ${error ? '#ef4444' : selectedFile ? 'var(--color-primary)' : '#d1d5db'}`,
              borderRadius: '0.5rem',
              padding: '1.5rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backgroundColor: selectedFile ? '#dbeafe20' : 'transparent'
            }}
            onClick={() => fileInputRef.current?.click()}
            data-umami-event="Board Analyzer - Upload Area Click"
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              
              const file = e.dataTransfer.files?.[0];
              if (file && file.type.startsWith('image/')) {
                handleFile(file);
              } else {
                setError('Пожалуйста, перетащите файл изображения');
              }
            }}
          >
            {preview ? (
              <div style={{ position: 'relative' }}>
                <img 
                  src={preview} 
                  alt="Предварительный просмотр" 
                  style={{ 
                    maxHeight: '12rem', 
                    margin: '0 auto', 
                    borderRadius: '0.5rem', 
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    display: 'block'
                  }}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFile();
                  }}
                  data-umami-event="Board Analyzer - Image Removed"
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    padding: '0.375rem',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    borderRadius: '50%',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    fontSize: '1rem',
                    width: '2rem',
                    height: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  aria-label="Удалить изображение"
                >
                  ×
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <div style={{ fontSize: '3rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                  📤
                </div>
                <p style={{ margin: '0.5rem 0', fontWeight: '500', color: '#374151' }}>
                  Нажмите для загрузки или перетащите файл
                </p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
                  PNG, JPG до 10MB
                </p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleFileChange}
          />
          
          <div style={{
            marginTop: '0.5rem',
            backgroundColor: '#dbeafe',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            borderLeft: '4px solid var(--color-primary)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <p style={{ fontSize: '0.875rem', color: '#1e40af', margin: 0 }}>
              Загрузите четкое изображение досок. Убедитесь, что все края видны для точного анализа.
            </p>
          </div>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#dc2626',
            backgroundColor: '#fef2f2',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            borderLeft: '4px solid #ef4444',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <span style={{ fontSize: '1.25rem' }}>⚠️</span>
            <p style={{ fontSize: '0.875rem', fontWeight: '500', margin: 0 }}>{error}</p>
          </div>
        )}

        <button
          onClick={handleAnalyze}
          className={`btn ${selectedFile ? 'btn-primary' : ''}`}
          disabled={!selectedFile}
          data-umami-event="Board Analyzer - Analyze Button Click"
          data-umami-event-enabled={selectedFile ? 'true' : 'false'}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            backgroundColor: selectedFile ? 'var(--color-primary)' : '#9ca3af',
            color: 'white',
            border: 'none',
            cursor: selectedFile ? 'pointer' : 'not-allowed',
            boxShadow: selectedFile ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none',
            transform: selectedFile ? 'none' : 'none'
          }}
          onMouseEnter={(e) => {
            if (selectedFile) {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedFile) {
              e.target.style.transform = 'none';
              e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            }
          }}
        >
          Начать анализ
        </button>
      </div>
    </div>
  );
};

export default ImageUpload;
