import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { apiService } from '../services/api';
import { BUYER_TEXTS } from '../utils/localization';
import ErrorToast, { useErrorHandler } from './ui/ErrorToast';
import { MOCK_IDS } from '../utils/constants';
import ProductImage from './ui/ProductImage';

// Use shared mock buyer ID
const MOCK_BUYER_ID = MOCK_IDS.BUYER_ID;

function Products() {
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Error handling
  const { error: toastError, showError, clearError } = useErrorHandler();

  // Debounce search query to prevent excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when search changes to prevent stale data
  useEffect(() => {
    setPage(0);
  }, [debouncedSearchQuery, isSearching]);

  // Create a stable API function that doesn't change on every render
  const productsApiFunction = useMemo(() => {
    return () => {
      if (isSearching && debouncedSearchQuery.trim()) {
        return apiService.searchProducts(debouncedSearchQuery.trim(), page, 12);
      }
      return apiService.getProducts(page, 12);
    };
  }, [page, isSearching, debouncedSearchQuery]);

  const { data, loading, error, refetch } = useApi(productsApiFunction, [page, isSearching, debouncedSearchQuery]);

  // Separate API calls for reference data
  const woodTypesApiFunction = useMemo(() => () => apiService.getWoodTypes(), []);
  const { data: woodTypes } = useApi(woodTypesApiFunction, []);

  const woodTypePricesApiFunction = useMemo(() => () => apiService.getWoodTypePrices(), []);
  const { data: woodTypePrices } = useApi(woodTypePricesApiFunction, []);

  const { mutate, loading: contacting } = useApiMutation();

  // Helper functions to get additional product information
  const getWoodTypeName = useCallback((woodTypeId) => {
    if (!woodTypes?.data) return 'Не указан';
    const woodType = woodTypes.data.find(wt => wt.id === woodTypeId);
    return woodType ? woodType.neme : 'Не указан';
  }, [woodTypes]);

  const getWoodTypePrice = useCallback((woodTypeId) => {
    if (!woodTypePrices?.data) return null;
    return woodTypePrices.data.find(p => p.wood_type_id === woodTypeId);
  }, [woodTypePrices]);

  // Handle errors - только логируем в консоль, не показываем пользователю
  useEffect(() => {
    if (error) {
      console.error('Products API Error:', error);
    }
  }, [error]);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      setPage(0);
      // refetch will be triggered automatically by useApi dependencies
    }
  }, [searchQuery]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setIsSearching(false);
    setPage(0);
    // refetch will be triggered automatically by useApi dependencies
  }, []);

  const handleContactSeller = useCallback(async (sellerId) => {
    try {
      // Create a new chat thread
      const threadId = crypto.randomUUID();
      await mutate(apiService.createChatThread, {
        id: threadId,
        buyer_id: MOCK_BUYER_ID,
        seller_id: sellerId
      });

      // Redirect to chats page
      window.location.href = '/chats';
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to contact seller:', err);
      }
      alert(BUYER_TEXTS.FAILED_CONTACT_SELLER || 'Не удалось связаться с продавцом. Попробуйте снова.');
    }
  }, [mutate]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{BUYER_TEXTS.BROWSE_PRODUCTS}</h1>
        <p className="page-description">{BUYER_TEXTS.FIND_QUALITY_PRODUCTS}</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">{BUYER_TEXTS.SEARCH_PRODUCTS}</h2>
        </div>

        <form onSubmit={handleSearch} className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder={BUYER_TEXTS.SEARCH_PLACEHOLDER}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input flex-1"
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? BUYER_TEXTS.SEARCHING : BUYER_TEXTS.SEARCH}
          </button>
          {isSearching && (
            <button type="button" onClick={clearSearch} className="btn btn-secondary">
              {BUYER_TEXTS.CLEAR}
            </button>
          )}
          <button type="button" onClick={refetch} className="btn btn-secondary" disabled={loading}>
            {BUYER_TEXTS.REFRESH}
          </button>
        </form>

        {isSearching && (
          <div className="success mb-4">
            {BUYER_TEXTS.SEARCHING_FOR}: <strong>"{searchQuery}"</strong>
          </div>
        )}
      </div>



      {loading && (
        <div className="loading">
          {BUYER_TEXTS.LOADING_PRODUCTS}...
        </div>
      )}

      {data && (
        <>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>{BUYER_TEXTS.AVAILABLE_PRODUCTS}</h3>
              <span>{BUYER_TEXTS.TOTAL}: {data.total || data.data?.length || 0}</span>
            </div>

            {data.data && data.data.length > 0 ? (
              <div className="products-grid">
                {data.data.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    woodTypeName={getWoodTypeName(product.wood_type_id)}
                    woodTypePrice={getWoodTypePrice(product.wood_type_id)}
                    onContact={handleContactSeller}
                    contacting={contacting}
                  />
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <h3>{BUYER_TEXTS.NO_PRODUCTS_FOUND}</h3>
                {isSearching ? (
                  <p>{BUYER_TEXTS.TRY_ADJUSTING_SEARCH} <button onClick={clearSearch} className="btn btn-primary">{BUYER_TEXTS.BROWSE_ALL_PRODUCTS}</button></p>
                ) : (
                  <p>{BUYER_TEXTS.NO_PRODUCTS_AVAILABLE}</p>
                )}
              </div>
            )}

            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0 || loading}
                className="btn btn-secondary"
              >
                {BUYER_TEXTS.PREVIOUS}
              </button>
              <span>{BUYER_TEXTS.PAGE} {page + 1}</span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={!data?.data || data.data.length < 12 || loading}
                className="btn btn-secondary"
              >
                {BUYER_TEXTS.NEXT}
              </button>
            </div>
          </div>
        </>
      )}

      {woodTypes?.data && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">{BUYER_TEXTS.AVAILABLE_WOOD_TYPES}</h3>
          </div>
          <div className="grid grid-auto-sm">
            {woodTypes.data.slice(0, 6).map((type) => (
              <div key={type.id} className="card text-center">
                <div style={{ fontWeight: '600' }}>
                  {type.neme || type.name || `${BUYER_TEXTS.TYPE} ${type.id.substring(0, 8)}`}
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-light)' }}>
                  ID: {type.id.substring(0, 8)}...
                </div>
              </div>
            ))}
          </div>
          {woodTypes.data.length > 6 && (
            <div className="text-center mt-4" style={{ color: 'var(--color-text-light)' }}>
              {BUYER_TEXTS.AND} {woodTypes.data.length - 6} {BUYER_TEXTS.MORE_WOOD_TYPES_AVAILABLE}
            </div>
          )}
        </div>
      )}

      {/* Compact error notifications */}
      <ErrorToast error={toastError} onDismiss={clearError} />
    </div>
  );
}

// Компонент карточки товара
const ProductCard = ({ product, woodTypeName, woodTypePrice, onContact, contacting }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatVolume = (volume) => {
    return parseFloat(volume).toFixed(4);
  };

  const pricePerCubicMeter = product.price / product.volume;

  return (
    <div className="product-card">
      {/* Изображение товара через новый API */}
      <div className="product-image">
        <ProductImage
          productId={product.id}
          alt={product.title || BUYER_TEXTS.UNTITLED_PRODUCT}
          className="product-image-full"
          placeholder="🌲"
          showPlaceholder={true}
        />
      </div>

      {/* Информация о товаре */}
      <div className="product-info">
        <h3 className="product-title">
          {product.title || BUYER_TEXTS.UNTITLED_PRODUCT}
        </h3>

        {product.descrioption && (
          <p className="product-description">
            {product.descrioption.length > 100
              ? `${product.descrioption.substring(0, 100)}...`
              : product.descrioption
            }
          </p>
        )}

        {/* Основная информация */}
        <div className="product-details">
          <div className="product-price-section">
            <div className="product-price">{formatPrice(product.price)}</div>
            <div className="product-volume">{formatVolume(product.volume)} м³</div>
          </div>

          <div className="price-per-cubic">
            {formatPrice(pricePerCubicMeter)} за м³
            {woodTypePrice && (
              <span className="price-comparison">
                (рын. цена: {formatPrice(woodTypePrice.price_per_m3)})
              </span>
            )}
          </div>
        </div>

        {/* Тип древесины */}
        <div className="wood-type-info">
          <span className="wood-type-label">Древесина:</span>
          <span className="wood-type-name">{woodTypeName}</span>
        </div>

        {/* Доставка */}
        <div className="delivery-info">
          {product.delivery_possible ? (
            <div className="delivery-available">
              ✅ Доставка возможна
            </div>
          ) : (
            <div className="pickup-only">
              📍 Только самовывоз
              {product.pickup_location && (
                <div className="pickup-location">
                  {product.pickup_location}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Кнопки действий */}
        <div className="product-actions">
          <button
            className="btn btn-primary"
            onClick={() => onContact(product.seller_id)}
            disabled={contacting}
          >
            {contacting ? 'Связываемся...' : 'Связаться с продавцом'}
          </button>
        </div>

        {/* Дата создания */}
        <div className="product-meta">
          Размещено: {new Date(product.created_at).toLocaleDateString('ru-RU')}
        </div>
      </div>
    </div>
  );
};

export default Products;
