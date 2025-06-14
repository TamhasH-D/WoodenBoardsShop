import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { useFormValidation } from '../hooks/useFormValidation';
import { apiService } from '../services/api';
import { SELLER_TEXTS, formatDateRu } from '../utils/localization';
import { getCurrentSellerKeycloakId } from '../utils/auth';
import ProductImage from './ui/ProductImage';
import UnifiedProductForm from './UnifiedProductForm';
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
  const [selectedWoodType, setSelectedWoodType] = useState('');
  const [deliveryFilter, setDeliveryFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);


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
                        key={`product-list-${product.id}-${imageRefreshKey}`}
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
