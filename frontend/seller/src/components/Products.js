import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { useFormValidation } from '../hooks/useFormValidation';
import { apiService } from '../services/api';
import { SELLER_TEXTS, formatDateRu } from '../utils/localization';
import { getCurrentSellerKeycloakId } from '../utils/auth';
import ProductImage from './ui/ProductImage';
import UnifiedProductForm from './UnifiedProductForm';
// eslint-disable-next-line no-unused-vars
import ProductFilters from './ProductFilters';
import ProductExport from './ProductExport';
import ErrorToast, { useErrorHandler } from './ui/ErrorToast';

function Products() {
  // Хук для валидации форм
  const { resetTouchedFields } = useFormValidation();

  const [page, setPage] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageRefreshKey, setImageRefreshKey] = useState(0);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [volumeMin, setVolumeMin] = useState('');
  const [volumeMax, setVolumeMax] = useState('');
  const [selectedWoodType, setSelectedWoodType] = useState('');
  const [deliveryFilter, setDeliveryFilter] = useState('');
  const [pickupLocationFilter, setPickupLocationFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [activeFilterTab, setActiveFilterTab] = useState('basic');
  const [showExport, setShowExport] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);


  // Error handling
  const { error: toastError, showError, clearError } = useErrorHandler();

  // Create stable API functions to prevent infinite loops
  const keycloakId = getCurrentSellerKeycloakId();

  // Build filters object
  const filters = useMemo(() => {
    const filterObj = {};

    // Text search
    if (searchQuery.trim()) filterObj.search_query = searchQuery.trim();

    // Price range
    if (priceMin) filterObj.price_min = parseFloat(priceMin);
    if (priceMax) filterObj.price_max = parseFloat(priceMax);

    // Volume range
    if (volumeMin) filterObj.volume_min = parseFloat(volumeMin);
    if (volumeMax) filterObj.volume_max = parseFloat(volumeMax);

    // Wood type
    if (selectedWoodType) filterObj.wood_type_ids = [selectedWoodType];

    // Delivery options
    if (deliveryFilter === 'true') filterObj.delivery_possible = true;
    if (deliveryFilter === 'false') filterObj.delivery_possible = false;

    // Pickup location
    if (pickupLocationFilter === 'true') filterObj.has_pickup_location = true;
    if (pickupLocationFilter === 'false') filterObj.has_pickup_location = false;

    // Date range
    if (dateFrom) filterObj.created_after = new Date(dateFrom).toISOString();
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999); // End of day
      filterObj.created_before = endDate.toISOString();
    }

    return filterObj;
  }, [searchQuery, priceMin, priceMax, volumeMin, volumeMax, selectedWoodType, deliveryFilter, pickupLocationFilter, dateFrom, dateTo]);

  // Check if we have any active filters
  const hasActiveFilters = Object.keys(filters).length > 0;

  const productsApiFunction = useMemo(() => {
    if (!keycloakId) {
      return null;
    }

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

  const { data, loading, error, refetch } = useApi(productsApiFunction, [productsApiFunction, page, JSON.stringify(filters), hasActiveFilters, sortBy, sortOrder]);
  const { data: woodTypes, error: woodTypesError } = useApi(woodTypesApiFunction, []);
  const { refetch: refetchWoodTypePrices } = useApi(woodTypePricesApiFunction, []);
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



  // Helper function for sortable table headers
  const getSortIcon = (field) => {
    if (sortBy !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const handleSort = (field) => {
    // Clear cache to force fresh data
    apiService.clearCache();

    if (sortBy === field) {
      // Same field - toggle sort order
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // New field - set to ascending
      setSortBy(field);
      setSortOrder('asc');
    }
  };





  // Helper function to clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setPriceMin('');
    setPriceMax('');
    setVolumeMin('');
    setVolumeMax('');
    setSelectedWoodType('');
    setDeliveryFilter('');
    setPickupLocationFilter('');
    setDateFrom('');
    setDateTo('');
    setPage(0); // Reset to first page
  }, []);

  // Quick filter presets
  // eslint-disable-next-line no-unused-vars
  const applyQuickFilter = useCallback((preset) => {
    clearFilters();
    switch (preset) {
      case 'recent':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        setDateFrom(weekAgo.toISOString().split('T')[0]);
        setSortBy('created_at');
        setSortOrder('desc');
        break;
      case 'expensive':
        setPriceMin('10000');
        setSortBy('price');
        setSortOrder('desc');
        break;
      case 'large_volume':
        setVolumeMin('0.1');
        setSortBy('volume');
        setSortOrder('desc');
        break;
      case 'with_delivery':
        setDeliveryFilter('true');
        break;
      default:
        break;
    }
  }, [clearFilters]);

  // Reset page when filters change
  useEffect(() => {
    console.log('Filters changed, resetting page to 0');
    setPage(0);
  }, [searchQuery, priceMin, priceMax, volumeMin, volumeMax, selectedWoodType, deliveryFilter, pickupLocationFilter, dateFrom, dateTo, sortBy, sortOrder]);



  // Manage spinner visibility with delay
  useEffect(() => {
    let timeoutId;

    if (loading) {
      // Show spinner only after 300ms delay
      timeoutId = setTimeout(() => {
        setShowSpinner(true);
      }, 300);
    } else {
      // Hide spinner immediately when loading stops
      setShowSpinner(false);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [loading]);



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
    console.log('handleEditProduct - product data:', product); // Временный лог для отладки
    setEditingProduct(product);
    setShowAddForm(false); // Close add form if open
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    // Сбрасываем состояние валидации
    resetTouchedFields();
  };

  // Handle export
  const handleExport = async (format, fields) => {
    try {
      // Use current data for export (already filtered and sorted)
      const productsWithWoodTypes = data?.data?.map(product => ({
        ...product,
        wood_type_name: getWoodTypeName(product.wood_type_id)
      })) || [];

      await apiService.exportProducts(productsWithWoodTypes, format, fields);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Ошибка при экспорте данных. Попробуйте еще раз.');
    }
  };



  return (
    <div>
      <div className="page-header mb-6">
        <h1 className="page-title text-2xl md:text-3xl font-bold">{SELLER_TEXTS.PRODUCTS}</h1>
        <p className="page-description">{SELLER_TEXTS.MANAGE_INVENTORY_DESC}</p>
      </div>

      {/* Search and Filter Section */}
      <div className="card mb-6">
        <div className="card-header">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
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
            onChange={(e) => {
              console.log('Search query changed:', e.target.value);
              setSearchQuery(e.target.value);
            }}
            placeholder="Введите название товара или ключевые слова..."
          />
        </div>

        {/* Simple filters for testing */}
        {showFilters && (
          <div className="form-grid form-grid-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="form-group">
              <label className="form-label">Мин. цена (₽)</label>
              <input
                type="number"
                className="form-input"
                value={priceMin}
                onChange={(e) => {
                  console.log('Price min changed:', e.target.value);
                  setPriceMin(e.target.value);
                }}
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
                onChange={(e) => {
                  console.log('Price max changed:', e.target.value);
                  setPriceMax(e.target.value);
                }}
                placeholder="999999"
                min="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Действия</label>
              <button
                onClick={() => {
                  console.log('Clear filters clicked');
                  clearFilters();
                }}
                className="btn btn-secondary w-full"
                disabled={!hasActiveFilters}
              >
                🗑️ Очистить фильтры
              </button>
            </div>
          </div>
        )}

        {/* Filter and Sort Status */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p className="text-sm text-blue-700">
              🔍 {hasActiveFilters ? `Активные фильтры: ${Object.keys(filters).length}` : 'Фильтры не применены'} |
              Найдено товаров: {data?.total || 0}
            </p>
            <p className="text-sm text-blue-700">
              📊 Сортировка: {sortBy} ({sortOrder === 'asc' ? 'по возрастанию' : 'по убыванию'})
            </p>
          </div>
          {hasActiveFilters && (
            <div style={{ marginTop: 'var(--space-2)', fontSize: '0.875rem' }}>
              {Object.entries(filters).map(([key, value]) => (
                <span key={key} style={{
                  display: 'inline-block',
                  margin: '2px',
                  padding: '2px 6px',
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '0.75rem'
                }}>
                  {key}: {typeof value === 'boolean' ? (value ? 'да' : 'нет') : value}
                </span>
              ))}
            </div>
          )}
        </div>
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
        <div className="flex flex-wrap gap-2 md:gap-4">
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
          <button
            onClick={() => setShowExport(!showExport)}
            className="btn btn-secondary"
            disabled={!data?.data || data.data.length === 0}
          >
            📊 Экспорт
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="btn btn-secondary"
              title="Очистить все фильтры"
            >
              🗑️ Очистить фильтры
            </button>
          )}

        </div>
      </div>

      {success && (
        <div className="success mb-4">
          <strong>Success:</strong> Operation completed successfully!
        </div>
      )}

      {showAddForm && (
        <UnifiedProductForm
          mode="create"
          onSuccess={async () => {
            setShowAddForm(false);
            // Принудительно очищаем кэш и обновляем данные
            await apiService.clearCache();
            setImageRefreshKey(prev => prev + 1); // Обновляем ключ для перезагрузки изображений
            refetch();
          }}
          onCancel={() => setShowAddForm(false)}
          mutating={mutating}
          mutate={mutate}
        />
      )}

      {/* Export Component */}
      {showExport && data?.data && data.data.length > 0 && (
        <ProductExport
          products={data.data}
          filters={filters}
          onExport={handleExport}
        />
      )}

      {/* Edit Product Form */}
      {editingProduct && (
        <>
          {console.log('Rendering UnifiedProductForm with editingProduct:', editingProduct)}
          <UnifiedProductForm
            mode="edit"
            initialData={editingProduct}
            onSuccess={async () => {
              setEditingProduct(null);
              // Принудительно очищаем кэш и обновляем данные
              await apiService.clearCache();
              setImageRefreshKey(prev => prev + 1); // Обновляем ключ для перезагрузки изображений
              refetch();
            }}
            onCancel={handleCancelEdit}
            mutating={mutating}
            mutate={mutate}
          />
        </>
      )}




      {data && (
        <>
          {data.data && data.data.length > 0 ? (
            <div style={{ position: 'relative' }}>
              {showSpinner && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  borderRadius: 'var(--border-radius)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    padding: 'var(--space-3)',
                    backgroundColor: 'white',
                    borderRadius: 'var(--border-radius)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid var(--color-primary)',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>
                      Обновление данных...
                    </span>
                  </div>
                </div>
              )}
              <div className="overflow-x-auto shadow-md sm:rounded-lg">
                <table className="table w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th scope="col" className="p-2 md:p-4">Изображение</th>
                  <th
                    onClick={() => handleSort('title')}
                    style={{
                      cursor: 'pointer',
                      userSelect: 'none',
                      backgroundColor: sortBy === 'title' ? 'var(--color-primary-light)' : 'transparent',
                      color: sortBy === 'title' ? 'var(--color-primary)' : 'inherit'
                    }}
                    title="Нажмите для сортировки"
                  >
                    Название {getSortIcon('title')}
                  </th>
                  <th
                    onClick={() => handleSort('volume')}
                    style={{
                      cursor: 'pointer',
                      userSelect: 'none',
                      backgroundColor: sortBy === 'volume' ? 'var(--color-primary-light)' : 'transparent',
                      color: sortBy === 'volume' ? 'var(--color-primary)' : 'inherit'
                    }}
                    title="Нажмите для сортировки"
                  >
                    Объем (м³) {getSortIcon('volume')}
                  </th>
                  <th
                    onClick={() => handleSort('price')}
                    style={{
                      cursor: 'pointer',
                      userSelect: 'none',
                      backgroundColor: sortBy === 'price' ? 'var(--color-primary-light)' : 'transparent',
                      color: sortBy === 'price' ? 'var(--color-primary)' : 'inherit'
                    }}
                    title="Нажмите для сортировки"
                  >
                    Цена (₽) {getSortIcon('price')}
                  </th>
                  <th>Тип древесины</th>
                  <th>Доставка</th>
                  <th
                    onClick={() => handleSort('created_at')}
                    style={{
                      cursor: 'pointer',
                      userSelect: 'none',
                      backgroundColor: sortBy === 'created_at' ? 'var(--color-primary-light)' : 'transparent',
                      color: sortBy === 'created_at' ? 'var(--color-primary)' : 'inherit'
                    }}
                    title="Нажмите для сортировки"
                  >
                    Создано {getSortIcon('created_at')}
                  </th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <ProductImage
                        key={`product-list-${product.id}-${imageRefreshKey}`}
                        productId={product.id}
                        alt={product.title || 'Товар без названия'}
                        size="medium"
                      />
                    </td>
                    <td>
                      <div>
                        <strong>{product.title || 'Товар без названия'}</strong>
                        {(product.descrioption || product.description) && (
                          <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                            {((product.descrioption || product.description).length > 50)
                              ? `${(product.descrioption || product.description).substring(0, 50)}...`
                              : (product.descrioption || product.description)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{product.volume} {/* DEBUG: volume = {JSON.stringify(product.volume)} */}</td>
                    <td>{product.price} ₽ {/* DEBUG: price = {JSON.stringify(product.price)} */}</td>
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
                          onClick={() => {
                            console.log('EDIT BUTTON CLICKED for product:', product.id);
                            handleEditProduct(product);
                          }}
                          className="btn btn-primary"
                          disabled={mutating || editingProduct?.id === product.id}
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
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-lg text-gray-600">{SELLER_TEXTS.NO_PRODUCTS_FOUND}</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="btn btn-primary mt-4"
              >
                {SELLER_TEXTS.ADD_FIRST_PRODUCT}
              </button>
            </div>
          )}

          {/* Enhanced Pagination */}
          <div className="flex justify-between items-center mt-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0 || loading}
                className="btn btn-secondary"
              >
                ← {SELLER_TEXTS.PREVIOUS}
              </button>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-light)' }}>
                Страница {page + 1} |
                Показано: {data?.data?.length || 0} из {data?.total || 0}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={!data?.data || data.data.length < 10 || loading}
                className="btn btn-secondary"
              >
                {SELLER_TEXTS.NEXT} →
              </button>
            </div>

            {/* Quick page navigation */}
            {data?.total > 10 && (
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-light)' }}>
                Всего страниц: {Math.ceil((data?.total || 0) / 10)}
              </div>
            )}
          </div>
        </>
      )}

      {/* Compact error notifications */}
      <ErrorToast error={toastError} onDismiss={clearError} />
    </div>
  );
}

export default Products;
