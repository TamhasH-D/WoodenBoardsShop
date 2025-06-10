import React, { useState, useEffect, useMemo } from 'react';
import { useApi } from '../hooks/useApi';
import { apiService } from '../services/api';
import { MOCK_IDS } from '../utils/constants';

const MOCK_SELLER_ID = MOCK_IDS.SELLER_ID;

/**
 * Пошаговая форма создания товара с прогрессивным раскрытием полей
 */
const StepByStepProductForm = ({ onSuccess, onCancel, mutating, mutate }) => {
  // Основные поля формы
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    wood_type_id: '',
    volume: '',
    price: '',
    delivery_possible: false,
    pickup_location: '',
    seller_id: MOCK_SELLER_ID
  });

  // Состояние анализатора досок
  const [imageFile, setImageFile] = useState(null);
  const [boardHeight, setBoardHeight] = useState('50'); // мм
  const [boardLength, setBoardLength] = useState('1000'); // мм
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);

  // Загрузка типов досок и цен
  const woodTypesApiFunction = useMemo(() => () => apiService.getAllWoodTypes(), []);
  const woodTypePricesApiFunction = useMemo(() => () => apiService.getAllWoodTypePrices(), []);
  
  const { data: woodTypes, loading: woodTypesLoading } = useApi(woodTypesApiFunction, []);
  const { data: woodTypePrices } = useApi(woodTypePricesApiFunction, []);

  // Определяем какие шаги показывать
  const showWoodTypeStep = formData.title.trim().length > 0;
  const showAnalyzerStep = formData.wood_type_id.length > 0;
  const showVolumeAndPriceStep = showAnalyzerStep;
  const showOptionalFieldsStep = formData.volume && formData.price;
  const canSubmit = formData.title && formData.wood_type_id && formData.volume && formData.price;

  // Автоматический расчет цены при изменении объема или типа досок
  useEffect(() => {
    if (formData.volume && formData.wood_type_id && woodTypePrices?.data) {
      const volume = parseFloat(formData.volume);
      const woodTypePrice = woodTypePrices.data.find(p => p.wood_type_id === formData.wood_type_id);
      
      if (woodTypePrice && volume > 0) {
        const calculatedPrice = (volume * woodTypePrice.price_per_m3).toFixed(2);
        setFormData(prev => ({ ...prev, price: calculatedPrice }));
      }
    }
  }, [formData.volume, formData.wood_type_id, woodTypePrices]);

  // Обновление объема после анализа
  useEffect(() => {
    if (analysisResult?.total_volume) {
      setFormData(prev => ({ ...prev, volume: analysisResult.total_volume.toFixed(4) }));
    }
  }, [analysisResult]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageAnalysis = async () => {
    if (!imageFile || !boardHeight || !boardLength) {
      setAnalysisError('Выберите изображение и укажите размеры досок');
      return;
    }

    setAnalyzing(true);
    setAnalysisError(null);

    try {
      const height = parseFloat(boardHeight) / 1000; // конвертируем мм в метры
      const length = parseFloat(boardLength) / 1000;
      
      const result = await apiService.analyzeWoodenBoard(imageFile, height, length);
      setAnalysisResult(result);
    } catch (error) {
      setAnalysisError(error.message || 'Ошибка анализа изображения');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!canSubmit) return;

    try {
      if (imageFile && analysisResult) {
        // Создание товара с анализом изображения
        const boardHeightMeters = parseFloat(boardHeight) / 1000;
        const boardLengthMeters = parseFloat(boardLength) / 1000;
        
        await mutate(() => apiService.createProductWithImage({
          title: formData.title.trim(),
          description: formData.description?.trim() || null,
          price: parseFloat(formData.price),
          delivery_possible: formData.delivery_possible,
          pickup_location: formData.pickup_location?.trim() || null,
          seller_id: MOCK_SELLER_ID,
          wood_type_id: formData.wood_type_id
        }, imageFile, boardHeightMeters, boardLengthMeters));
      } else {
        // Обычное создание товара
        await mutate(() => apiService.createProduct({
          title: formData.title.trim(),
          description: formData.description?.trim() || null,
          volume: parseFloat(formData.volume),
          price: parseFloat(formData.price),
          delivery_possible: formData.delivery_possible,
          pickup_location: formData.pickup_location?.trim() || null,
          seller_id: MOCK_SELLER_ID,
          wood_type_id: formData.wood_type_id
        }));
      }
      
      onSuccess();
    } catch (error) {
      console.error('Ошибка создания товара:', error);
    }
  };

  const getWoodTypeName = (woodTypeId) => {
    if (!woodTypes?.data) return woodTypeId;
    const woodType = woodTypes.data.find(wt => wt.id === woodTypeId);
    return woodType ? woodType.neme : woodTypeId;
  };

  const getWoodTypePrice = (woodTypeId) => {
    if (!woodTypePrices?.data) return null;
    return woodTypePrices.data.find(p => p.wood_type_id === woodTypeId);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Создание нового товара</h2>
        <p style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-2)' }}>
          Заполните поля пошагово для создания товара
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Шаг 1: Название и описание */}
        <div className="form-group">
          <label className="form-label">Название товара *</label>
          <input
            type="text"
            className="form-input"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Например: Доски дубовые премиум"
            required
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Описание</label>
          <textarea
            className="form-input"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Подробное описание товара..."
            rows={3}
            maxLength={500}
          />
        </div>

        {/* Шаг 2: Выбор типа досок */}
        {showWoodTypeStep && (
          <div className="form-group" style={{ 
            opacity: showWoodTypeStep ? 1 : 0.5,
            transition: 'opacity 0.3s ease',
            marginTop: '2rem',
            paddingTop: '2rem',
            borderTop: '1px solid var(--color-border-light)'
          }}>
            <label className="form-label">Тип древесины *</label>
            {woodTypesLoading ? (
              <div className="loading">Загрузка типов древесины...</div>
            ) : (
              <select
                className="form-input"
                value={formData.wood_type_id}
                onChange={(e) => handleInputChange('wood_type_id', e.target.value)}
                required
              >
                <option value="">Выберите тип древесины</option>
                {woodTypes?.data?.map((woodType) => {
                  const price = getWoodTypePrice(woodType.id);
                  return (
                    <option key={woodType.id} value={woodType.id}>
                      {woodType.neme} {price ? `(${price.price_per_m3} ₽/м³)` : ''}
                    </option>
                  );
                })}
              </select>
            )}
          </div>
        )}

        {/* Шаг 3: Анализатор досок */}
        {showAnalyzerStep && (
          <div style={{ 
            opacity: showAnalyzerStep ? 1 : 0.5,
            transition: 'opacity 0.3s ease',
            marginTop: '2rem',
            paddingTop: '2rem',
            borderTop: '1px solid var(--color-border-light)'
          }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--color-text)' }}>
              Анализ досок по фотографии
            </h3>
            
            <div className="form-grid form-grid-2" style={{ marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Высота доски (мм)</label>
                <input
                  type="number"
                  className="form-input"
                  value={boardHeight}
                  onChange={(e) => setBoardHeight(e.target.value)}
                  placeholder="50"
                  min="1"
                  max="1000"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Длина доски (мм)</label>
                <input
                  type="number"
                  className="form-input"
                  value={boardLength}
                  onChange={(e) => setBoardLength(e.target.value)}
                  placeholder="1000"
                  min="1"
                  max="10000"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Фотография досок</label>
              <input
                type="file"
                className="form-input"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
              />
              {imageFile && (
                <div style={{ marginTop: '1rem' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleImageAnalysis}
                    disabled={analyzing}
                  >
                    {analyzing ? 'Анализируем...' : 'Анализировать изображение'}
                  </button>
                </div>
              )}
            </div>

            {analysisError && (
              <div style={{ 
                color: 'var(--color-error)', 
                fontSize: 'var(--font-size-sm)',
                marginTop: '0.5rem'
              }}>
                {analysisError}
              </div>
            )}

            {analysisResult && (
              <div style={{
                background: 'var(--color-success-light)',
                border: '1px solid var(--color-success)',
                borderRadius: 'var(--border-radius)',
                padding: '1rem',
                marginTop: '1rem'
              }}>
                <h4 style={{ color: 'var(--color-success-dark)', marginBottom: '0.5rem' }}>
                  ✅ Анализ завершен
                </h4>
                <p>Обнаружено досок: {analysisResult.total_count}</p>
                <p>Общий объем: {analysisResult.total_volume?.toFixed(4)} м³</p>
              </div>
            )}
          </div>
        )}

        {/* Шаг 4: Объем и цена */}
        {showVolumeAndPriceStep && (
          <div style={{
            opacity: showVolumeAndPriceStep ? 1 : 0.5,
            transition: 'opacity 0.3s ease',
            marginTop: '2rem',
            paddingTop: '2rem',
            borderTop: '1px solid var(--color-border-light)'
          }}>
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Объем (м³) *</label>
                <input
                  type="number"
                  step="0.0001"
                  min="0.0001"
                  max="1000"
                  className="form-input"
                  value={formData.volume}
                  onChange={(e) => handleInputChange('volume', e.target.value)}
                  placeholder="0.0000"
                  required
                  disabled={analysisResult}
                  style={{
                    backgroundColor: analysisResult ? 'var(--color-bg-light)' : 'var(--color-bg)',
                    borderColor: analysisResult ? 'var(--color-success)' : 'var(--color-border)'
                  }}
                />
                <small style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-xs)' }}>
                  {analysisResult ? '✅ Рассчитано автоматически' : 'Общий объем в кубических метрах'}
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">Цена (₽) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="999999"
                  className="form-input"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="0.00"
                  required
                />
                <small style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-xs)' }}>
                  {formData.wood_type_id && woodTypePrices?.data && (() => {
                    const price = getWoodTypePrice(formData.wood_type_id);
                    return price ? `Рекомендуемая цена: ${price.price_per_m3} ₽/м³` : 'Общая стоимость товара';
                  })()}
                </small>
              </div>
            </div>
          </div>
        )}

        {/* Шаг 5: Дополнительные поля */}
        {showOptionalFieldsStep && (
          <div style={{
            opacity: showOptionalFieldsStep ? 1 : 0.5,
            transition: 'opacity 0.3s ease',
            marginTop: '2rem',
            paddingTop: '2rem',
            borderTop: '1px solid var(--color-border-light)'
          }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--color-text)' }}>
              Дополнительные параметры
            </h3>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={formData.delivery_possible}
                  onChange={(e) => handleInputChange('delivery_possible', e.target.checked)}
                />
                Доставка возможна
              </label>
            </div>

            <div className="form-group">
              <label className="form-label">Место самовывоза</label>
              <input
                type="text"
                className="form-input"
                value={formData.pickup_location}
                onChange={(e) => handleInputChange('pickup_location', e.target.value)}
                placeholder="Адрес или описание места самовывоза"
                maxLength={200}
              />
            </div>
          </div>
        )}

        {/* Кнопки управления */}
        <div className="flex gap-4" style={{ marginTop: 'var(--space-6)' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!canSubmit || mutating}
          >
            {mutating ? 'Создаем товар...' : 'Создать товар'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={mutating}
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
};

export default StepByStepProductForm;
