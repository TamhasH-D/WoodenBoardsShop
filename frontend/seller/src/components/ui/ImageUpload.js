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
    <div className="card max-w-3xl mx-auto"> {/* card class likely provides padding and border */}
      <div className="flex flex-col gap-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col">
            <label className="form-label mb-1"> {/* Replaced style with mb-1 (0.25rem) */}
              Шаг 1: Введите высоту доски (мм)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={heightMm}
              onChange={(e) => handleInputChange(e.target.value, setHeightMm)}
              className="form-input rounded-lg border border-slate-300 shadow-sm px-4 py-3 text-base"
              placeholder="например, 50"
              // style prop removed
            />
            <div className="mt-2 bg-blue-100 p-3 rounded-lg border-l-4 border-blue-600 shadow-sm">
              <p className="text-sm text-blue-700 m-0">
                Введите среднюю высоту досок в миллиметрах. Это поможет точно рассчитать объем.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col">
            <label className="form-label mb-1"> {/* Replaced style with mb-1 (0.25rem) */}
              Шаг 2: Введите длину доски (мм)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={lengthMm}
              onChange={(e) => handleInputChange(e.target.value, setLengthMm)}
              className="form-input rounded-lg border border-slate-300 shadow-sm px-4 py-3 text-base"
              placeholder="например, 1000"
              // style prop removed
            />
            <div className="mt-2 bg-blue-100 p-3 rounded-lg border-l-4 border-blue-600 shadow-sm">
              <p className="text-sm text-blue-700 m-0">
                Введите среднюю длину досок в миллиметрах. Это обеспечивает точные расчеты.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <label className="form-label mb-2">
            Шаг 3: Загрузите изображение досок
          </label>
          <div
            className={`relative rounded-lg p-6 cursor-pointer transition-all duration-300 ease-in-out border-2 border-dashed ${error ? 'border-red-500' : selectedFile ? 'border-blue-600' : 'border-slate-300'} ${selectedFile ? 'bg-blue-500/10' : 'bg-transparent'}`}
            onClick={() => fileInputRef.current?.click()}
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
              <div className="relative">
                <img 
                  src={preview} 
                  alt="Предварительный просмотр" 
                  className="max-h-48 mx-auto rounded-lg shadow-md block"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFile();
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full border-none cursor-pointer shadow-sm text-base w-8 h-8 flex items-center justify-center hover:bg-red-600"
                  aria-label="Удалить изображение"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="text-center p-4">
                <div className="text-5xl text-blue-600 mb-2">
                  📤
                </div>
                <p className="my-2 font-medium text-slate-700">
                  Нажмите для загрузки или перетащите файл
                </p>
                <p className="text-xs text-slate-500 m-0">
                  PNG, JPG до 10MB
                </p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          
          <div className="mt-2 bg-blue-100 p-3 rounded-lg border-l-4 border-blue-600 shadow-sm">
            <p className="text-sm text-blue-700 m-0">
              Загрузите четкое изображение досок. Убедитесь, что все края видны для точного анализа.
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg border-l-4 border-red-500 shadow-sm">
            <span className="text-xl">⚠️</span>
            <p className="text-sm font-medium m-0">{error}</p>
          </div>
        )}

        <button
          onClick={handleAnalyze}
          className={`btn ${selectedFile ? 'btn-primary' : ''} w-full rounded-lg font-medium transition-all duration-300 ease-in-out text-white border-none ${selectedFile ? 'shadow-md bg-blue-600 cursor-pointer hover:translate-y-[-1px] hover:shadow-lg' : 'bg-slate-400 cursor-not-allowed shadow-none'}`}
          disabled={!selectedFile}
          // style prop removed
          // onMouseEnter and onMouseLeave removed
        >
          Начать анализ
        </button>
      </div>
    </div>
  );
};

export default ImageUpload;
