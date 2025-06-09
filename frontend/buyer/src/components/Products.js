import { useState, useCallback, useMemo, useEffect } from 'react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { apiService } from '../services/api';
import { BUYER_TEXTS } from '../utils/localization';
import ErrorToast, { useErrorHandler } from './ui/ErrorToast';

// Mock buyer ID - in real app this would come from authentication
const MOCK_BUYER_ID = '81f81c96-c56e-4b36-aec3-656f3576d09f';

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

  // Separate API call for wood types (stable function, no dependencies)
  const woodTypesApiFunction = useMemo(() => () => apiService.getWoodTypes(), []);
  const { data: woodTypes } = useApi(woodTypesApiFunction, []);

  const { mutate, loading: contacting } = useApiMutation();

  // Handle errors with toast notifications
  useEffect(() => {
    if (error) {
      showError(error);
    }
  }, [error, showError]);

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
              <div className="grid grid-auto">
                {data.data.map((product) => (
                  <div key={product.id} className="product-card">
                    <h4 className="product-title">
                      {product.title || BUYER_TEXTS.UNTITLED_PRODUCT}
                    </h4>

                    {product.descrioption && (
                      <p className="product-description">
                        {product.descrioption}
                      </p>
                    )}

                    <div className="flex justify-between items-center mb-4">
                      <div className="product-price">{product.price} {BUYER_TEXTS.RUBLES}</div>
                      <div style={{ color: 'var(--color-text-light)' }}>{product.volume} {BUYER_TEXTS.CUBIC_METERS}</div>
                    </div>

                    <div className="text-center mb-4" style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-sm)' }}>
                      {(product.price / product.volume).toFixed(2)} ₽ за м³
                    </div>

                    <div className="mb-4">
                      <div className={`status ${product.delivery_possible ? 'status-success' : 'status-error'} mb-4`}>
                        {product.delivery_possible ? BUYER_TEXTS.DELIVERY_AVAILABLE : BUYER_TEXTS.PICKUP_ONLY}
                      </div>
                      {product.pickup_location && (
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-light)' }}>
                          {BUYER_TEXTS.LOCATION}: {product.pickup_location}
                        </div>
                      )}
                    </div>

                    <div className="mb-4" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-light)' }}>
                      <div>{BUYER_TEXTS.WOOD_TYPE}: {product.wood_type_id?.substring(0, 8)}...</div>
                      <div>{BUYER_TEXTS.SELLER}: {product.seller_id?.substring(0, 8)}...</div>
                      <div>{BUYER_TEXTS.LISTED}: {new Date(product.created_at).toLocaleDateString('ru-RU')}</div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                        onClick={() => handleContactSeller(product.seller_id)}
                        disabled={contacting}
                      >
                        {contacting ? BUYER_TEXTS.CONTACTING : BUYER_TEXTS.CONTACT_SELLER}
                      </button>
                      <button className="btn btn-secondary">
                        {BUYER_TEXTS.DETAILS}
                      </button>
                    </div>
                  </div>
                ))}
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

export default Products;
