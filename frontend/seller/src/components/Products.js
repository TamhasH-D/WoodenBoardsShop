import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { useFormValidation } from '../hooks/useFormValidation';
import { apiService } from '../services/api';
import { SELLER_TEXTS, formatDateRu } from '../utils/localization';
import { MOCK_IDS } from '../utils/constants';
import ProductImage from './ui/ProductImage';
import CompactBoardAnalyzer from './CompactBoardAnalyzer';
import StepByStepProductForm from './StepByStepProductForm';
import ErrorToast, { useErrorHandler } from './ui/ErrorToast';

// TODO: Replace with real authentication
const getCurrentSellerKeycloakId = () => {
  // Временно используем mock ID для разработки
  // В продакшене это должно быть заменено на реальную аутентификацию через Keycloak
  console.warn('Using mock seller keycloak ID for development - implement real authentication');
  return MOCK_IDS.SELLER_ID;
};

// Helper function to get seller_id from keycloak_id
const getCurrentSellerId = async () => {
  try {
    const keycloakId = getCurrentSellerKeycloakId();
    const sellerResponse = await apiService.getSellerProfileByKeycloakId(keycloakId);
    return sellerResponse.data.id;
  } catch (error) {
    console.error('Failed to get seller_id:', error);
    throw error;
  }
};

function Products() {
  // Хук для валидации форм
  const { getFieldClassName, handleFieldBlur, handleFieldChange, resetTouchedFields } = useFormValidation();

  const [page, setPage] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [selectedWoodType, setSelectedWoodType] = useState('');
  const [deliveryFilter, setDeliveryFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    volume: '',
    price: '',
    delivery_possible: false,
    pickup_location: '',
    wood_type_id: '',
    seller_id: getCurrentSellerKeycloakId()
  });
  const [editProduct, setEditProduct] = useState({
    title: '',
    description: '',
    volume: '',
    price: '',
    delivery_possible: false,
    pickup_location: '',
    wood_type_id: ''
  });

  // Image processing state (simplified for BoardImageAnalyzer component)
  const [selectedImage, setSelectedImage] = useState(null);
  const [boardHeight, setBoardHeight] = useState('50'); // mm
  const [boardLength, setBoardLength] = useState('1000'); // mm
  const [volumeCalculationResult, setVolumeCalculationResult] = useState(null);

  // Edit image state
  const [editSelectedImage, setEditSelectedImage] = useState(null);
  const [editBoardHeight, setEditBoardHeight] = useState('50');
  const [editBoardLength, setEditBoardLength] = useState('1000');
  const [editVolumeCalculationResult, setEditVolumeCalculationResult] = useState(null);

  // Error handling
  const { error: toastError, showError, clearError } = useErrorHandler();

  // Create stable API functions to prevent infinite loops
  const keycloakId = getCurrentSellerKeycloakId();

  // Build filters object
  const filters = useMemo(() => {
    const filterObj = {};
    if (searchQuery.trim()) filterObj.search_query = searchQuery.trim();
    if (priceMin) filterObj.price_min = parseFloat(priceMin);
    if (priceMax) filterObj.price_max = parseFloat(priceMax);
    if (selectedWoodType) filterObj.wood_type_ids = [selectedWoodType];
    if (deliveryFilter === 'true') filterObj.delivery_possible = true;
    if (deliveryFilter === 'false') filterObj.delivery_possible = false;
    return filterObj;
  }, [searchQuery, priceMin, priceMax, selectedWoodType, deliveryFilter]);

  // Check if we have any active filters
  const hasActiveFilters = Object.keys(filters).length > 0;

  const productsApiFunction = useMemo(() => {
    if (!keycloakId) return null;

    if (hasActiveFilters) {
      // Use search endpoint with filters - this will internally convert keycloak_id to seller_id
      return () => apiService.searchSellerProductsByKeycloakId(keycloakId, filters, page, 10, sortBy, sortOrder);
    } else {
      // Use basic endpoint without filters - this will internally convert keycloak_id to seller_id
      return () => apiService.getSellerProductsByKeycloakId(keycloakId, page, 10, sortBy, sortOrder);
    }
  }, [keycloakId, page, filters, hasActiveFilters, sortBy, sortOrder]);
  const woodTypesApiFunction = useMemo(() => () => apiService.getAllWoodTypes(), []);
  const woodTypePricesApiFunction = useMemo(() => () => apiService.getAllWoodTypePrices(), []);

  const { data, loading, error, refetch } = useApi(productsApiFunction, [page]);
  const { data: woodTypes, loading: woodTypesLoading, error: woodTypesError } = useApi(woodTypesApiFunction, []);
  const { data: woodTypePrices, refetch: refetchWoodTypePrices } = useApi(woodTypePricesApiFunction, []);
  const { mutate, loading: mutating, error: mutationError, success } = useApiMutation();

  // Listen for auto-refresh events
  useEffect(() => {
    const handleAutoRefresh = async () => {
      // Принудительно очищаем кэш при автообновлении
      await apiService.clearCache();
      refetch();
    };

    window.addEventListener('seller-auto-refresh', handleAutoRefresh);

    return () => {
      window.removeEventListener('seller-auto-refresh', handleAutoRefresh);
    };
  }, [refetch]);

  // Handle errors with toast notifications
  useEffect(() => {
    if (error || mutationError || woodTypesError) {
      const errorMessage = error || mutationError || woodTypesError;
      showError(errorMessage);
    }
  }, [error, mutationError, woodTypesError, showError]);

  // Helper function to get wood type name by ID
  const getWoodTypeName = (woodTypeId) => {
    const woodType = woodTypes?.data?.find(type => type.id === woodTypeId);
    return woodType ? (woodType.neme || `Type ${woodType.id?.substring(0, 8)}`) : `Wood Type ${woodTypeId?.substring(0, 8)}...`;
  };

  // Helper function to get current price for a wood type (most recent by created_at)
  const getCurrentPrice = (woodTypeId) => {
    if (!woodTypePrices?.data || !woodTypeId) return null;

    const typePrices = woodTypePrices.data
      .filter(price => price.wood_type_id === woodTypeId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return typePrices[0] || null;
  };

  // Helper function to format price display
  const formatPrice = (price) => {
    if (!price) return SELLER_TEXTS.PRICE_NOT_SET || 'Цена не установлена';
    return `${price.price_per_m3} ₽/м³`;
  };

  // Helper function to clear image data
  const clearImageData = useCallback(() => {
    setSelectedImage(null);
    setVolumeCalculationResult(null);
  }, []);

  // Helper function to clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setPriceMin('');
    setPriceMax('');
    setSelectedWoodType('');
    setDeliveryFilter('');
    setPage(0); // Reset to first page
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [searchQuery, priceMin, priceMax, selectedWoodType, deliveryFilter, sortBy, sortOrder]);

  const handleAddProduct = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!newProduct.title.trim()) {
      alert(SELLER_TEXTS.PRODUCT_TITLE_REQUIRED);
      return;
    }

    if (!newProduct.wood_type_id) {
      alert(SELLER_TEXTS.SELECT_WOOD_TYPE_REQUIRED);
      return;
    }

    const price = parseFloat(newProduct.price);

    if (isNaN(price) || price <= 0) {
      alert(SELLER_TEXTS.ENTER_VALID_PRICE);
      return;
    }

    // Require image analysis for volume calculation
    if (!selectedImage || !volumeCalculationResult) {
      alert('Пожалуйста, загрузите изображение для автоматического расчета объема товара');
      return;
    }

    try {
      const boardHeightMeters = parseFloat(boardHeight) / 1000; // Convert mm to meters
      const boardLengthMeters = parseFloat(boardLength) / 1000; // Convert mm to meters

      if (process.env.NODE_ENV === 'development') {
        console.log('Creating product with image analysis...');
      }

      const sellerId = await getCurrentSellerId();
      const result = await mutate(() => apiService.createProductWithImage({
        title: newProduct.title.trim(),
        description: newProduct.description?.trim() || null,
        price: price,
        delivery_possible: newProduct.delivery_possible,
        pickup_location: newProduct.pickup_location?.trim() || null,
        seller_id: sellerId,
        wood_type_id: newProduct.wood_type_id
      }, selectedImage, boardHeightMeters, boardLengthMeters));

      if (process.env.NODE_ENV === 'development') {
        console.log('Product created with image analysis:', result);
      }

      // Reset form
      setNewProduct({
        title: '',
        description: '',
        volume: '',
        price: '',
        delivery_possible: false,
        pickup_location: '',
        wood_type_id: '',
        seller_id: sellerId
      });
      clearImageData();
      setBoardHeight('50');
      setBoardLength('1000');
      setShowAddForm(false);

      // Принудительно очищаем кэш и обновляем данные
      await apiService.clearCache();
      refetch();

      // Также обновляем цены на древесину для следующего создания товара
      refetchWoodTypePrices();
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to add product:', err);
      }
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm(SELLER_TEXTS.CONFIRM_DELETE_PRODUCT)) {
      try {
        await mutate(() => apiService.deleteProduct(productId));

        // Принудительно очищаем кэш и обновляем данные
        await apiService.clearCache();
        refetch();
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to delete product:', err);
        }
      }
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product.id);

    // Get suggested price for the wood type
    const currentPrice = getCurrentPrice(product.wood_type_id);
    const suggestedPrice = currentPrice ? (currentPrice.price_per_m3 * product.volume).toFixed(2) : product.price?.toString() || '';

    setEditProduct({
      title: product.title || '',
      description: product.descrioption || product.description || '',
      volume: product.volume?.toString() || '',
      price: suggestedPrice,
      delivery_possible: product.delivery_possible || false,
      pickup_location: product.pickup_location || '',
      wood_type_id: product.wood_type_id || ''
    });

    // Clear edit image state
    setEditSelectedImage(null);
    setEditVolumeCalculationResult(null);
    setEditBoardHeight('50');
    setEditBoardLength('1000');

    setShowAddForm(false); // Close add form if open
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setEditProduct({
      title: '',
      description: '',
      volume: '',
      price: '',
      delivery_possible: false,
      pickup_location: '',
      wood_type_id: ''
    });

    // Clear edit image state
    setEditSelectedImage(null);
    setEditVolumeCalculationResult(null);
    setEditBoardHeight('50');
    setEditBoardLength('1000');

    // Сбрасываем состояние валидации
    resetTouchedFields();
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!editProduct.title.trim()) {
      alert(SELLER_TEXTS.PRODUCT_TITLE_REQUIRED);
      return;
    }

    if (!editProduct.wood_type_id) {
      alert(SELLER_TEXTS.SELECT_WOOD_TYPE_REQUIRED);
      return;
    }

    const price = parseFloat(editProduct.price);

    if (isNaN(price) || price <= 0) {
      alert(SELLER_TEXTS.ENTER_VALID_PRICE);
      return;
    }

    try {
      // Check if we have new image for volume recalculation
      if (editSelectedImage && editVolumeCalculationResult) {
        // Update product with new image analysis
        const boardHeightMeters = parseFloat(editBoardHeight) / 1000;
        const boardLengthMeters = parseFloat(editBoardLength) / 1000;

        await mutate(() => apiService.updateProductWithImage(editingProduct, {
          title: editProduct.title.trim(),
          description: editProduct.description?.trim() || null,
          price: price,
          delivery_possible: editProduct.delivery_possible,
          pickup_location: editProduct.pickup_location?.trim() || null,
          wood_type_id: editProduct.wood_type_id
        }, editSelectedImage, boardHeightMeters, boardLengthMeters));
      } else {
        // Update product without changing image/volume
        const volume = parseFloat(editProduct.volume);

        if (isNaN(volume) || volume <= 0) {
          alert('Объем товара должен быть больше 0');
          return;
        }

        await mutate(() => apiService.updateProduct(editingProduct, {
          title: editProduct.title.trim(),
          description: editProduct.description?.trim() || null,
          volume: volume,
          price: price,
          delivery_possible: editProduct.delivery_possible,
          pickup_location: editProduct.pickup_location?.trim() || null,
          wood_type_id: editProduct.wood_type_id
        }));
      }

      handleCancelEdit();

      // Принудительно очищаем кэш и обновляем данные
      await apiService.clearCache();
      refetch();
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to update product:', err);
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{SELLER_TEXTS.PRODUCTS}</h1>
        <p className="page-description">{SELLER_TEXTS.MANAGE_INVENTORY_DESC}</p>
      </div>

      {/* Search and Filter Section */}
      <div className="card mb-6">
        <div className="card-header">
          <div className="flex justify-between items-center">
            <h2 className="card-title">🔍 Поиск и фильтрация товаров</h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-secondary btn-sm"
            >
              {showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
            </button>
          </div>
        </div>

        {/* Basic Search */}
        <div className="form-group">
          <label className="form-label">Поиск по названию и описанию</label>
          <input
            type="text"
            className="form-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Введите название товара или ключевые слова..."
          />
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="form-grid form-grid-3">
            <div className="form-group">
              <label className="form-label">Мин. цена (₽)</label>
              <input
                type="number"
                className="form-input"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Макс. цена (₽)</label>
              <input
                type="number"
                className="form-input"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                placeholder="999999"
                min="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Тип древесины</label>
              <select
                className="form-input"
                value={selectedWoodType}
                onChange={(e) => setSelectedWoodType(e.target.value)}
              >
                <option value="">Все типы</option>
                {woodTypes?.data?.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.neme || `Type ${type.id?.substring(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Доставка</label>
              <select
                className="form-input"
                value={deliveryFilter}
                onChange={(e) => setDeliveryFilter(e.target.value)}
              >
                <option value="">Все товары</option>
                <option value="true">С доставкой</option>
                <option value="false">Только самовывоз</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Сортировка</label>
              <select
                className="form-input"
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
              >
                <option value="created_at-desc">Новые сначала</option>
                <option value="created_at-asc">Старые сначала</option>
                <option value="price-asc">Цена: по возрастанию</option>
                <option value="price-desc">Цена: по убыванию</option>
                <option value="title-asc">Название: А-Я</option>
                <option value="title-desc">Название: Я-А</option>
                <option value="volume-asc">Объем: по возрастанию</option>
                <option value="volume-desc">Объем: по убыванию</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">&nbsp;</label>
              <button
                onClick={clearFilters}
                className="btn btn-secondary w-full"
                disabled={!hasActiveFilters}
              >
                Очистить фильтры
              </button>
            </div>
          </div>
        )}

        {/* Filter Status */}
        {hasActiveFilters && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-700">
              🔍 Активные фильтры: {Object.keys(filters).length} |
              Найдено товаров: {data?.total || 0}
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <p>{SELLER_TEXTS.TOTAL_PRODUCTS}: {data?.total || data?.data?.length || 0}</p>
          {hasActiveFilters && (
            <p className="text-sm text-gray-600">
              (показаны результаты поиска)
            </p>
          )}
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => {
              if (!showAddForm) {
                // При открытии формы обновляем цены на древесину
                refetchWoodTypePrices();
              }
              setShowAddForm(!showAddForm);
            }}
            className={`btn ${showAddForm ? 'btn-secondary' : 'btn-primary'}`}
          >
            {showAddForm ? SELLER_TEXTS.CANCEL : SELLER_TEXTS.ADD_PRODUCT}
          </button>
          <button
            onClick={async () => {
              // Принудительно очищаем кэш перед обновлением
              await apiService.clearCache();
              refetch();
            }}
            className="btn btn-secondary"
            disabled={loading}
          >
            {loading ? SELLER_TEXTS.LOADING : SELLER_TEXTS.REFRESH}
          </button>
        </div>
      </div>

      {success && (
        <div className="success mb-4">
          <strong>Success:</strong> Operation completed successfully!
        </div>
      )}

      {showAddForm && (
        <div style={{ marginBottom: '2rem' }}>
          <StepByStepProductForm
            onSuccess={async () => {
              setShowAddForm(false);
              // Принудительно очищаем кэш и обновляем данные
              await apiService.clearCache();
              refetch();
            }}
            onCancel={() => setShowAddForm(false)}
            mutating={mutating}
            mutate={mutate}
          />
        </div>
      )}

      {/* Старая форма (скрыта, но оставлена для справки) */}
      {false && showAddForm && (
        <div className="card mb-6">
          <div className="card-header">
            <h2 className="card-title">Add New Product</h2>
            <p style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-2)' }}>
              Fill in the details below to add a new wood product to your inventory
            </p>
          </div>



          <form onSubmit={handleAddProduct}>
            <div className="form-group">
              <label className="form-label">Product Title *</label>
              <input
                type="text"
                className="form-input"
                value={newProduct.title}
                onChange={(e) => setNewProduct({...newProduct, title: e.target.value})}
                placeholder="e.g., Premium Oak Boards, Pine Lumber Set"
                required
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description (Optional)</label>
              <textarea
                className="form-input"
                value={newProduct.description}
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                placeholder="Describe the wood quality, dimensions, condition, and any special features..."
                rows="4"
                maxLength={500}
              />
              <small style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-xs)' }}>
                {newProduct.description.length}/500 characters (optional field)
              </small>
            </div>

            {/* Compact Board Analyzer Component */}
            <CompactBoardAnalyzer
              onAnalysisComplete={(result) => {
                setVolumeCalculationResult(result);
                setSelectedImage(result.image);
                setBoardHeight(result.boardHeight.toString());
                setBoardLength(result.boardLength.toString());
                setNewProduct(prev => ({
                  ...prev,
                  volume: result.total_volume.toFixed(4)
                }));
              }}
              onImageSelect={(file) => {
                setSelectedImage(file);
                // Очищаем предыдущие результаты при выборе нового изображения
                setVolumeCalculationResult(null);
              }}
              disabled={mutating}
              initialHeight={boardHeight}
              initialLength={boardLength}
            />

            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Объем (м³)</label>
                <input
                  type="text"
                  className="form-input"
                  value={volumeCalculationResult
                    ? `${volumeCalculationResult.total_volume.toFixed(4)} м³ (автоматически)`
                    : 'Загрузите изображение для расчета объема'
                  }
                  disabled
                  style={{
                    backgroundColor: 'var(--color-bg-light)',
                    color: volumeCalculationResult ? 'var(--color-success)' : 'var(--color-text-light)',
                    cursor: 'not-allowed'
                  }}
                />
                <small style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-xs)' }}>
                  {volumeCalculationResult
                    ? '✅ Объем рассчитан автоматически на основе анализа изображения'
                    : 'Объем будет рассчитан автоматически после загрузки и анализа изображения'}
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
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  placeholder="0.00"
                  required
                />
                <small style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-xs)' }}>
                  Price per cubic meter
                </small>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Wood Type *</label>
              {woodTypesLoading ? (
                <div className="form-input" style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'var(--color-text-light)',
                  cursor: 'not-allowed',
                  backgroundColor: 'var(--color-bg-light)'
                }}>
                  <span style={{ marginRight: '0.5rem' }}>🔄</span>
                  Loading wood types... (Fetching all available types)
                </div>
              ) : (
                <select
                  className="form-input"
                  value={newProduct.wood_type_id}
                  onChange={(e) => setNewProduct({...newProduct, wood_type_id: e.target.value})}
                  required
                  disabled={woodTypesError || !woodTypes?.data}
                >
                  <option value="">
                    {woodTypes?.data?.length > 0 ? 'Select wood type...' : 'No wood types available'}
                  </option>
                  {woodTypes?.data?.map((type) => {
                    const currentPrice = getCurrentPrice(type.id);
                    const typeName = type.neme || `Wood Type ${type.id?.substring(0, 8)}`;
                    const priceDisplay = currentPrice ? ` - ${formatPrice(currentPrice)}` : ' - Цена не установлена';
                    return (
                      <option key={type.id} value={type.id}>
                        {typeName}{priceDisplay}
                      </option>
                    );
                  })}
                </select>
              )}
              {woodTypes?.data?.length === 0 && !woodTypesLoading && !woodTypesError && (
                <small style={{ color: 'var(--color-warning)', fontSize: 'var(--font-size-xs)' }}>
                  No wood types found. Contact administrator to add wood types.
                </small>
              )}
              {woodTypes?.data?.length > 0 && !woodTypesLoading && !woodTypesError && (
                <small style={{ color: 'var(--color-success)', fontSize: 'var(--font-size-xs)' }}>
                  ✅ {woodTypes.data.length} wood types loaded successfully
                </small>
              )}
              {newProduct.wood_type_id && (
                <div style={{
                  marginTop: 'var(--space-2)',
                  padding: 'var(--space-2)',
                  backgroundColor: 'var(--color-bg-light)',
                  borderRadius: 'var(--border-radius)',
                  border: '1px solid var(--color-border)'
                }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', marginBottom: 'var(--space-1)' }}>
                    💰 Текущая цена для выбранного типа древесины:
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)' }}>
                    {formatPrice(getCurrentPrice(newProduct.wood_type_id))}
                  </div>
                  {getCurrentPrice(newProduct.wood_type_id) && (
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-light)', marginTop: 'var(--space-1)' }}>
                      Обновлено: {new Date(getCurrentPrice(newProduct.wood_type_id).created_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Pickup Location</label>
              <input
                type="text"
                className="form-input"
                value={newProduct.pickup_location}
                onChange={(e) => setNewProduct({...newProduct, pickup_location: e.target.value})}
                placeholder="e.g., 123 Main St, City, State or Warehouse A, Section 5"
                maxLength={200}
              />
              <small style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-xs)' }}>
                Where buyers can pick up this product (optional)
              </small>
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
                  checked={newProduct.delivery_possible}
                  onChange={(e) => setNewProduct({...newProduct, delivery_possible: e.target.checked})}
                />
                <span>Delivery Available</span>
              </label>
              <small style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-xs)', marginLeft: '1.5rem' }}>
                Check if you can deliver this product to buyers
              </small>
            </div>

            <div className="flex gap-4" style={{ marginTop: 'var(--space-6)' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={mutating || woodTypesLoading || !woodTypes?.data?.length}
              >
                {mutating ? 'Adding Product...' : 'Add Product'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  clearImageData();
                  setBoardHeight('50');
                  setBoardLength('1000');
                  setShowAddForm(false);
                }}
                disabled={mutating}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Product Form */}
      {editingProduct && (
        <div className="card mb-6">
          <div className="card-header">
            <h2 className="card-title">{SELLER_TEXTS.EDIT_PRODUCT}</h2>
            <p style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-2)' }}>
              {SELLER_TEXTS.UPDATE_PRODUCT_DETAILS}
            </p>
          </div>

          <form onSubmit={handleUpdateProduct}>
            <div className="form-group">
              <label className="form-label">{SELLER_TEXTS.PRODUCT_TITLE} *</label>
              <input
                type="text"
                className={getFieldClassName('edit-title')}
                value={editProduct.title}
                onChange={handleFieldChange('edit-title', (e) => setEditProduct({...editProduct, title: e.target.value}))}
                onBlur={() => handleFieldBlur('edit-title')}
                placeholder="e.g., Premium Oak Boards, Pine Lumber Set"
                required
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{SELLER_TEXTS.DESCRIPTION} ({SELLER_TEXTS.OPTIONAL})</label>
              <textarea
                className="form-input"
                value={editProduct.description}
                onChange={(e) => setEditProduct({...editProduct, description: e.target.value})}
                placeholder={SELLER_TEXTS.DESCRIPTION_PLACEHOLDER}
                rows="4"
                maxLength={500}
              />
              <small style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-xs)' }}>
                {editProduct.description.length}/500 {SELLER_TEXTS.CHARACTERS} ({SELLER_TEXTS.OPTIONAL_FIELD})
              </small>
            </div>

            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">{SELLER_TEXTS.VOLUME} (м³)</label>
                <input
                  type="text"
                  className="form-input"
                  value={`${parseFloat(editProduct.volume || 0).toFixed(4)} м³`}
                  disabled
                  style={{
                    backgroundColor: 'var(--color-bg-light)',
                    color: 'var(--color-text-light)',
                    cursor: 'not-allowed'
                  }}
                />
                <small style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-xs)' }}>
                  Объем рассчитывается автоматически на основе анализа изображения
                </small>
              </div>
              <div className="form-group">
                <label className="form-label">{SELLER_TEXTS.PRICE} (₽) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="999999"
                  className={getFieldClassName('edit-price')}
                  value={editProduct.price}
                  onChange={handleFieldChange('edit-price', (e) => setEditProduct({...editProduct, price: e.target.value}))}
                  onBlur={() => handleFieldBlur('edit-price')}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{SELLER_TEXTS.WOOD_TYPE} *</label>
              {woodTypesLoading ? (
                <div className="form-input" style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'var(--color-text-light)',
                  cursor: 'not-allowed',
                  backgroundColor: 'var(--color-bg-light)'
                }}>
                  <span style={{ marginRight: '0.5rem' }}>🔄</span>
                  {SELLER_TEXTS.LOADING_WOOD_TYPES}
                </div>
              ) : (
                <select
                  className={getFieldClassName('edit-wood-type')}
                  value={editProduct.wood_type_id}
                  onChange={handleFieldChange('edit-wood-type', (e) => {
                    const newWoodTypeId = e.target.value;
                    const currentPrice = getCurrentPrice(newWoodTypeId);
                    const suggestedPrice = currentPrice && editProduct.volume
                      ? (currentPrice.price_per_m3 * parseFloat(editProduct.volume)).toFixed(2)
                      : editProduct.price;

                    setEditProduct({
                      ...editProduct,
                      wood_type_id: newWoodTypeId,
                      price: suggestedPrice
                    });
                  })}
                  onBlur={() => handleFieldBlur('edit-wood-type')}
                  required
                  disabled={woodTypesError || !woodTypes?.data}
                >
                  <option value="">
                    {woodTypes?.data?.length > 0 ? SELLER_TEXTS.SELECT_WOOD_TYPE : SELLER_TEXTS.NO_WOOD_TYPES_AVAILABLE}
                  </option>
                  {woodTypes?.data?.map((type) => {
                    const currentPrice = getCurrentPrice(type.id);
                    const typeName = type.neme || `Wood Type ${type.id?.substring(0, 8)}`;
                    const priceDisplay = currentPrice ? ` - ${formatPrice(currentPrice)}` : ' - Цена не установлена';
                    return (
                      <option key={type.id} value={type.id}>
                        {typeName}{priceDisplay}
                      </option>
                    );
                  })}
                </select>
              )}
              {editProduct.wood_type_id && (
                <div style={{
                  marginTop: 'var(--space-2)',
                  padding: 'var(--space-2)',
                  backgroundColor: 'var(--color-bg-light)',
                  borderRadius: 'var(--border-radius)',
                  border: '1px solid var(--color-border)'
                }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', marginBottom: 'var(--space-1)' }}>
                    💰 Текущая цена для выбранного типа древесины:
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)' }}>
                    {formatPrice(getCurrentPrice(editProduct.wood_type_id))}
                  </div>
                  {getCurrentPrice(editProduct.wood_type_id) && (
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-light)', marginTop: 'var(--space-1)' }}>
                      Обновлено: {new Date(getCurrentPrice(editProduct.wood_type_id).created_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Image Update Section */}
            <div className="form-group">
              <label className="form-label">Обновить изображение товара (опционально)</label>
              <CompactBoardAnalyzer
                onAnalysisComplete={(result) => {
                  setEditVolumeCalculationResult(result);
                  setEditSelectedImage(result.image);
                  setEditBoardHeight(result.boardHeight.toString());
                  setEditBoardLength(result.boardLength.toString());
                  setEditProduct(prev => ({
                    ...prev,
                    volume: result.total_volume.toFixed(4)
                  }));
                }}
                onImageSelect={(file) => {
                  setEditSelectedImage(file);
                  // Очищаем предыдущие результаты при выборе нового изображения
                  setEditVolumeCalculationResult(null);
                }}
                disabled={mutating}
                initialHeight={editBoardHeight}
                initialLength={editBoardLength}
              />
              <small style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-xs)' }}>
                {editVolumeCalculationResult
                  ? '✅ Новое изображение загружено. Объем будет пересчитан при сохранении.'
                  : 'Загрузите новое изображение, если хотите пересчитать объем товара'
                }
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">{SELLER_TEXTS.PICKUP_LOCATION}</label>
              <input
                type="text"
                className="form-input"
                value={editProduct.pickup_location}
                onChange={(e) => setEditProduct({...editProduct, pickup_location: e.target.value})}
                placeholder={SELLER_TEXTS.PICKUP_LOCATION_PLACEHOLDER}
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
                  checked={editProduct.delivery_possible}
                  onChange={(e) => setEditProduct({...editProduct, delivery_possible: e.target.checked})}
                />
                <span>{SELLER_TEXTS.DELIVERY_AVAILABLE}</span>
              </label>
            </div>

            <div className="flex gap-4" style={{ marginTop: 'var(--space-6)' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={mutating || woodTypesLoading || !woodTypes?.data?.length}
              >
                {mutating ? SELLER_TEXTS.UPDATING_PRODUCT : SELLER_TEXTS.UPDATE_PRODUCT}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancelEdit}
                disabled={mutating}
              >
                {SELLER_TEXTS.CANCEL}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && (
        <div className="loading">{SELLER_TEXTS.LOADING_PRODUCTS}</div>
      )}

      {data && (
        <>
          {data.data && data.data.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Изображение</th>
                  <th>Название</th>
                  <th>Объем (м³)</th>
                  <th>Цена (₽)</th>
                  <th>Тип древесины</th>
                  <th>Доставка</th>
                  <th>Создано</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <ProductImage
                        productId={product.id}
                        alt={product.title}
                        size="medium"
                      />
                    </td>
                    <td>
                      <div>
                        <strong>{product.title}</strong>
                        {(product.descrioption || product.description) && (
                          <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                            {((product.descrioption || product.description).length > 50)
                              ? `${(product.descrioption || product.description).substring(0, 50)}...`
                              : (product.descrioption || product.description)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{product.volume}</td>
                    <td>{product.price} ₽</td>
                    <td>{getWoodTypeName(product.wood_type_id)}</td>
                    <td>
                      <span className={`status ${product.delivery_possible ? 'status-success' : 'status-warning'}`}>
                        {product.delivery_possible ? SELLER_TEXTS.DELIVERY_AVAILABLE : SELLER_TEXTS.PICKUP_ONLY}
                      </span>
                    </td>
                    <td>{formatDateRu(product.created_at, 'SHORT')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="btn btn-primary"
                          disabled={mutating || editingProduct === product.id}
                          style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}
                        >
                          {SELLER_TEXTS.EDIT}
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="btn btn-secondary"
                          disabled={mutating}
                          style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}
                        >
                          {mutating ? SELLER_TEXTS.DELETING : SELLER_TEXTS.DELETE}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center">
              <p>{SELLER_TEXTS.NO_PRODUCTS_FOUND}</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="btn btn-primary mt-4"
              >
                {SELLER_TEXTS.ADD_FIRST_PRODUCT}
              </button>
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0 || loading}
              className="btn btn-secondary"
            >
              {SELLER_TEXTS.PREVIOUS}
            </button>
            <span>{SELLER_TEXTS.PAGE} {page + 1}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!data?.data || data.data.length < 10 || loading}
              className="btn btn-secondary"
            >
              {SELLER_TEXTS.NEXT}
            </button>
          </div>
        </>
      )}

      {/* Compact error notifications */}
      <ErrorToast error={toastError} onDismiss={clearError} />
    </div>
  );
}

export default Products;
