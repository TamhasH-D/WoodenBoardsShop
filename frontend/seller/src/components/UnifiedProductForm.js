import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useFormValidation } from '../hooks/useFormValidation';
import { useApi } from '../hooks/useApi';
import { getCurrentSellerId } from '../utils/auth';
import { apiService } from '../services/api';
import CompactBoardAnalyzer from './CompactBoardAnalyzer';
import ProductImage from './ui/ProductImage';

/**
 * Универсальная форма для создания и редактирования товаров
 * @param {Object} props
 * @param {string} props.mode - 'create' или 'edit'
 * @param {Object} props.initialData - Начальные данные для редактирования
 * @param {Function} props.onSuccess - Callback при успешном сохранении
 * @param {Function} props.onCancel - Callback при отмене
 * @param {boolean} props.mutating - Состояние загрузки
 * @param {Function} props.mutate - Функция для выполнения мутации
 */
const UnifiedProductForm = ({ 
  mode = 'create', 
  initialData = null, 
  onSuccess, 
  onCancel, 
  mutating, 
  mutate 
}) => {
  const isEditMode = mode === 'edit';
  
  // Хуки для валидации и данных
  const { getFieldClassName, handleFieldBlur, handleFieldChange, resetTouchedFields } = useFormValidation();

  // API функции для получения данных
  const woodTypesApiFunction = useMemo(() => () => apiService.getAllWoodTypes(), []);
  const woodTypePricesApiFunction = useMemo(() => () => apiService.getAllWoodTypePrices(), []);

  const { data: woodTypes, loading: woodTypesLoading } = useApi(woodTypesApiFunction, []);
  const { data: woodTypePrices, refetch: refetchWoodTypePrices } = useApi(woodTypePricesApiFunction, []);

  // Функция для создания начальных данных формы
  const createInitialFormData = (data) => {
    console.log('UnifiedProductForm - createInitialFormData, data:', data); // Временный лог для отладки

    // Правильная обработка объема в м³
    let volumeString = '';
    if (data?.volume !== undefined && data?.volume !== null) {
      const volume = parseFloat(data.volume);
      if (volume > 0) {
        // Округляем до 4 знаков после запятой для отображения в м³
        volumeString = (Math.round(volume * 10000) / 10000).toString();
      } else {
        volumeString = '0';
      }
    }

    return {
      title: data?.title || '',
      description: data?.description || data?.descrioption || '',
      wood_type_id: data?.wood_type_id || '',
      volume: volumeString,
      price: data?.price !== undefined && data?.price !== null
        ? (Math.round(data.price * 100) / 100).toString()
        : '',
      delivery_possible: data?.delivery_possible || false,
      pickup_location: data?.pickup_location || ''
    };
  };

  // Основные поля формы
  const [formData, setFormData] = useState(() => createInitialFormData(initialData));

  // Состояние для анализа изображений
  const [imageFile, setImageFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [boardHeight, setBoardHeight] = useState('50');
  const [boardLength, setBoardLength] = useState('1000');
  const [analysisError, setAnalysisError] = useState(null);

  // Получение цены для типа древесины
  const getWoodTypePrice = useCallback((woodTypeId) => {
    if (!woodTypePrices?.data || !woodTypeId) return null;

    const typePrices = woodTypePrices.data
      .filter(price => price.wood_type_id === woodTypeId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return typePrices[0] || null;
  }, [woodTypePrices?.data]);

  // Обновляем данные формы при изменении initialData
  useEffect(() => {
    console.log('UnifiedProductForm - useEffect triggered, initialData:', initialData, 'isEditMode:', isEditMode); // Временный лог для отладки

    if (initialData) {
      const newFormData = createInitialFormData(initialData);
      console.log('UnifiedProductForm - setting new form data:', newFormData); // Временный лог для отладки
      setFormData(newFormData);
    }
  }, [initialData, isEditMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Обновляем рекомендуемую цену при изменении типа древесины
  useEffect(() => {
    if (formData.wood_type_id && woodTypePrices?.data && formData.volume) {
      const price = getWoodTypePrice(formData.wood_type_id);
      if (price) {
        // Предлагаем цену как при создании, так и при редактировании
        const suggestedPrice = (price.price_per_m3 * parseFloat(formData.volume)).toFixed(2);
        setFormData(prev => ({ ...prev, price: suggestedPrice }));
      }
    }
  }, [formData.wood_type_id, formData.volume, woodTypePrices, getWoodTypePrice]);



  // Обработка изменений полей
  const handleInputChange = (field, value) => {
    // Округляем цену для лучшего UX
    if (field === 'price' && value) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        // Округляем цену до 2 знаков после запятой
        value = (Math.round(numValue * 100) / 100).toString();
      }
    }

    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Обработка результатов анализа изображения
  const handleAnalysisComplete = (result) => {
    setAnalysisResult(result);
    setImageFile(result.image);
    setBoardHeight(result.boardHeight.toString());
    setBoardLength(result.boardLength.toString());
    // Округляем объем до 4 знаков после запятой для удобства
    const roundedVolume = Math.round(result.total_volume * 10000) / 10000;
    setFormData(prev => ({
      ...prev,
      volume: roundedVolume.toString()
    }));
    setAnalysisError(null);
  };

  // Обработка выбора изображения
  const handleImageSelect = (file) => {
    setImageFile(file);
    // Очищаем предыдущие результаты при выборе нового изображения
    setAnalysisResult(null);
    setAnalysisError(null);
  };

  // Определяем какие шаги показывать
  const showWoodTypeStep = formData.title.trim().length > 0;
  const showAnalyzerStep = formData.wood_type_id.length > 0;
  const showVolumeAndPriceStep = isEditMode || (showAnalyzerStep && analysisResult && formData.volume);
  const showOptionalFieldsStep = isEditMode || (formData.volume && formData.price);
  
  // Условия для отправки формы
  const canSubmit = isEditMode
    ? formData.title && formData.wood_type_id && formData.volume && formData.price &&
      // Если загружено новое изображение, то должен быть выполнен анализ
      (!imageFile || analysisResult)
    : formData.title && formData.wood_type_id && formData.volume && formData.price && imageFile && analysisResult;

  // Обработка отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canSubmit) return;

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      alert('Цена должна быть больше 0');
      return;
    }

    const volume = parseFloat(formData.volume);
    if (isNaN(volume) || volume <= 0) {
      alert('Объем не определен. Пожалуйста, выполните анализ изображения.');
      return;
    }

    // Дополнительная проверка для режима редактирования
    if (isEditMode && imageFile && !analysisResult) {
      alert('Вы загрузили новое изображение. Пожалуйста, выполните анализ изображения для пересчета объема.');
      return;
    }

    try {
      if (isEditMode) {
        // Режим редактирования
        if (imageFile && analysisResult) {
          // Обновление с новым изображением
          // Конвертируем размеры из миллиметров в метры для API
          const boardHeightMeters = parseFloat(boardHeight) / 1000;
          const boardLengthMeters = parseFloat(boardLength) / 1000;

          await mutate(() => apiService.updateProductWithImage(initialData.id, {
            title: formData.title.trim(),
            description: formData.description?.trim() || null,
            price: price,
            delivery_possible: formData.delivery_possible,
            pickup_location: formData.pickup_location?.trim() || null,
            wood_type_id: formData.wood_type_id
          }, imageFile, boardHeightMeters, boardLengthMeters));
        } else {
          // Обновление без изменения изображения
          await mutate(() => apiService.updateProduct(initialData.id, {
            title: formData.title.trim(),
            description: formData.description?.trim() || null,
            volume: volume,
            price: price,
            delivery_possible: formData.delivery_possible,
            pickup_location: formData.pickup_location?.trim() || null,
            wood_type_id: formData.wood_type_id
          }));
        }
      } else {
        // Режим создания
        const sellerId = await getCurrentSellerId();
        
        const productData = {
          seller_id: sellerId,
          title: formData.title.trim(),
          description: formData.description?.trim() || '',
          wood_type_id: formData.wood_type_id,
          board_height: parseFloat(boardHeight), // В миллиметрах
          board_length: parseFloat(boardLength), // В миллиметрах
          volume: volume,
          price: price,
          delivery_possible: formData.delivery_possible,
          pickup_location: formData.pickup_location?.trim() || ''
        };

        // Конвертируем в метры для передачи в createProductWithImage
        const boardHeightMeters = parseFloat(boardHeight) / 1000;
        const boardLengthMeters = parseFloat(boardLength) / 1000;

        await mutate(() => apiService.createProductWithImage(productData, imageFile, boardHeightMeters, boardLengthMeters));
        refetchWoodTypePrices();
      }

      // Принудительно очищаем кэш для обновления списка товаров
      await apiService.clearCache();

      // Сбрасываем состояние валидации
      resetTouchedFields();

      onSuccess();
    } catch (error) {
      console.error(`Ошибка ${isEditMode ? 'обновления' : 'создания'} товара:`, error);
      setAnalysisError(error.message || `Ошибка ${isEditMode ? 'обновления' : 'создания'} товара`);
    }
  };

  return (
    <div className="card mb-6">
      <div className="card-header">
        <h2 className="card-title">
          {isEditMode ? 'Редактировать товар' : 'Добавить новый товар'}
        </h2>
        <p style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-2)' }}>
          {isEditMode 
            ? 'Обновите информацию о товаре. Поля отмеченные * обязательны для заполнения.'
            : 'Заполните информацию о новом товаре. Все поля отмеченные * обязательны для заполнения.'
          }
        </p>
      </div>

      {analysisError && (
        <div className="error" style={{ margin: 'var(--space-4)' }}>
          {analysisError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Шаг 1: Название и описание */}
        <div className="form-group">
          <label className="form-label">Название товара *</label>
          <input
            type="text"
            className={getFieldClassName('title')}
            value={formData.title}
            onChange={handleFieldChange('title', (e) => handleInputChange('title', e.target.value))}
            onBlur={() => handleFieldBlur('title')}
            placeholder="Например: Доски дубовые премиум"
            required
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Описание {isEditMode ? '' : '(опционально)'}</label>
          <textarea
            className="form-input"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Подробное описание товара..."
            rows={3}
            maxLength={500}
          />
        </div>

        {/* Шаг 2: Тип древесины */}
        {showWoodTypeStep && (
          <div className="form-group">
            <label className="form-label">Тип древесины *</label>
            <select
              className={getFieldClassName('wood_type_id')}
              value={formData.wood_type_id}
              onChange={handleFieldChange('wood_type_id', (e) => handleInputChange('wood_type_id', e.target.value))}
              onBlur={() => handleFieldBlur('wood_type_id')}
              required
              disabled={woodTypesLoading}
            >
              <option value="">Выберите тип древесины</option>
              {woodTypes?.data?.map((woodType) => {
                const priceInfo = getWoodTypePrice(woodType.id);
                const priceText = priceInfo ? ` (${priceInfo.price_per_m3} ₽/м³)` : '';
                return (
                  <option key={woodType.id} value={woodType.id}>
                    {woodType.neme || woodType.name || `Type ${woodType.id?.substring(0, 8)}`}{priceText}
                  </option>
                );
              })}
            </select>
            {woodTypesLoading && (
              <small style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-xs)' }}>
                Загружаем типы древесины...
              </small>
            )}
          </div>
        )}

        {/* Шаг 3: Анализ изображения или показ текущего изображения */}
        {showAnalyzerStep && (
          <div className="form-group">
            <label className="form-label">
              {isEditMode ? 'Изображение товара' : 'Анализ досок по фотографии *'}
            </label>

            {isEditMode && initialData?.id && (
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: 'var(--space-3)'
                }}>
                  <ProductImage
                    key={`product-image-${initialData.id}`}
                    productId={initialData.id}
                    alt="Текущее изображение"
                    size="large"
                  />
                  <div style={{
                    fontSize: '0.875rem',
                    color: 'var(--color-text-light)'
                  }}>
                    <div>Текущее изображение товара</div>
                    <div style={{ marginTop: '4px', fontStyle: 'italic' }}>
                      💡 Нажмите на изображение, чтобы открыть его в полном размере
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: 'var(--space-3)',
                  backgroundColor: 'var(--color-bg-light)',
                  borderRadius: 'var(--border-radius)',
                  border: 'var(--border-width) solid var(--color-border)',
                  marginBottom: 'var(--space-3)'
                }}>
                  <strong>Обновить изображение для пересчета объема:</strong>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-light)', marginTop: 'var(--space-1)' }}>
                    📊 Объем товара рассчитывается автоматически на основе анализа изображения
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-light)', marginTop: 'var(--space-1)' }}>
                    🔄 Загрузите новое изображение, чтобы пересчитать объем товара
                  </div>
                </div>
              </div>
            )}

            <CompactBoardAnalyzer
              onAnalysisComplete={handleAnalysisComplete}
              onImageSelect={handleImageSelect}
              disabled={mutating}
              initialHeight={boardHeight}
              initialLength={boardLength}
            />

            {!isEditMode && (
              <small style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-xs)' }}>
                Загрузите фотографию досок для автоматического расчета объема
              </small>
            )}

            {isEditMode && (
              <small style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-xs)' }}>
                {imageFile && analysisResult
                  ? '✅ Новое изображение проанализировано. Объем будет пересчитан при сохранении.'
                  : imageFile && !analysisResult
                    ? '⚠️ Новое изображение загружено. Необходимо выполнить анализ для пересчета объема.'
                    : 'Загрузите новое изображение, если хотите пересчитать объем товара'
                }
              </small>
            )}
          </div>
        )}

        {/* Шаг 4: Объем и цена */}
        {showVolumeAndPriceStep && (
          <div style={{
            padding: 'var(--space-4)',
            backgroundColor: 'var(--color-bg-light)',
            borderRadius: 'var(--border-radius)',
            border: 'var(--border-width) solid var(--color-border)',
            marginBottom: 'var(--space-4)'
          }}>
            <h4 style={{
              fontSize: 'var(--font-size-lg)',
              fontWeight: '600',
              marginBottom: 'var(--space-3)',
              color: 'var(--color-text)'
            }}>
              Объем и цена
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Объем (м³) *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.volume ? `${formData.volume} м³` : 'Будет рассчитан автоматически'}
                  readOnly
                  // Временный лог для отладки
                  ref={(input) => {
                    if (input && isEditMode) {
                      console.log('Volume field value:', formData.volume, 'Display value:', input.value);
                    }
                  }}
                  style={{
                    backgroundColor: 'var(--color-bg-light)',
                    color: formData.volume ? 'var(--color-text)' : 'var(--color-text-light)',
                    cursor: 'not-allowed',
                    fontWeight: formData.volume ? '600' : 'normal'
                  }}
                />
                <small style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-xs)' }}>
                  {formData.volume
                    ? '✅ Объем рассчитан автоматически на основе анализа изображения'
                    : isEditMode
                      ? '📷 Загрузите новое изображение для пересчета объема'
                      : '📷 Объем будет рассчитан автоматически после анализа изображения'
                  }
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">Цена (₽) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="999999"
                  className={getFieldClassName('price')}
                  value={formData.price}
                  onChange={handleFieldChange('price', (e) => handleInputChange('price', e.target.value))}
                  onBlur={(e) => {
                    handleFieldBlur('price');
                    // Дополнительное округление при потере фокуса
                    const value = e.target.value;
                    if (value) {
                      const numValue = parseFloat(value);
                      if (!isNaN(numValue)) {
                        const rounded = (Math.round(numValue * 100) / 100).toString();
                        if (rounded !== value) {
                          handleInputChange('price', rounded);
                        }
                      }
                    }
                  }}
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
            padding: 'var(--space-4)',
            backgroundColor: 'var(--color-bg-light)',
            borderRadius: 'var(--border-radius)',
            border: 'var(--border-width) solid var(--color-border)',
            marginBottom: 'var(--space-4)'
          }}>
            <h4 style={{
              fontSize: 'var(--font-size-lg)',
              fontWeight: '600',
              marginBottom: 'var(--space-3)',
              color: 'var(--color-text)'
            }}>
              Дополнительная информация {isEditMode ? '' : '(опционально)'}
            </h4>

            <div className="form-group">
              <label className="form-label">Место самовывоза {isEditMode ? '' : '(опционально)'}</label>
              <input
                type="text"
                className="form-input"
                value={formData.pickup_location}
                onChange={(e) => handleInputChange('pickup_location', e.target.value)}
                placeholder="Например: г. Москва, ул. Лесная, 15"
                maxLength={200}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={formData.delivery_possible}
                  onChange={(e) => handleInputChange('delivery_possible', e.target.checked)}
                />
                <span>Доставка возможна</span>
              </label>
            </div>
          </div>
        )}

        {/* Индикатор прогресса и кнопки */}
        <div style={{ marginTop: 'var(--space-6)' }}>
          {/* Индикатор прогресса заполнения */}
          {!canSubmit && (
            <div style={{
              marginBottom: '1rem',
              padding: '0.75rem',
              backgroundColor: 'var(--color-bg-light)',
              borderRadius: 'var(--border-radius)',
              border: '1px solid var(--color-border)'
            }}>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)', marginBottom: '0.5rem' }}>
                <strong>{isEditMode ? 'Для обновления товара необходимо:' : 'Для создания товара необходимо:'}</strong>
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-light)' }}>
                {!formData.title && '• Указать название товара'}
                {!formData.wood_type_id && '• Выбрать тип древесины'}
                {!isEditMode && !imageFile && '• Загрузить фотографию досок'}
                {!isEditMode && !analysisResult && imageFile && '• Выполнить анализ изображения для расчета объема'}
                {!isEditMode && !formData.volume && '• Объем будет рассчитан автоматически после анализа'}
                {isEditMode && imageFile && !analysisResult && '• Выполнить анализ нового изображения для пересчета объема'}
                {!formData.price && '• Указать цену товара'}
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!canSubmit || mutating}
              style={{
                opacity: canSubmit ? 1 : 0.6,
                cursor: canSubmit ? 'pointer' : 'not-allowed'
              }}
            >
              {mutating ? (
                <>
                  <span style={{ marginRight: '0.5rem' }}>⏳</span>
                  {isEditMode ? 'Обновляем товар...' : 'Создаем товар...'}
                </>
              ) : canSubmit ? (
                <>
                  <span style={{ marginRight: '0.5rem' }}>✅</span>
                  {isEditMode ? 'Обновить товар' : 'Создать товар'}
                </>
              ) : (
                <>
                  <span style={{ marginRight: '0.5rem' }}>⏸️</span>
                  Заполните все поля
                </>
              )}
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
        </div>
      </form>
    </div>
  );
};

export default UnifiedProductForm;
