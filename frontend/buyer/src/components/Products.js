import { useState, useCallback, useMemo, useEffect } from 'react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { apiService } from '../services/api';
import { BUYER_TEXTS } from '../utils/localization';

// Mock buyer ID - in real app this would come from authentication
const MOCK_BUYER_ID = '81f81c96-c56e-4b36-aec3-656f3576d09f';

function Products() {
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

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
        <h1 className="page-title">Browse Wood Products</h1>
        <p className="page-description">Find quality wood products from trusted sellers</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Search Products</h2>
        </div>

        <form onSubmit={handleSearch} className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Search products by name, type, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input flex-1"
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
          {isSearching && (
            <button type="button" onClick={clearSearch} className="btn btn-secondary">
              Clear
            </button>
          )}
          <button type="button" onClick={refetch} className="btn btn-secondary" disabled={loading}>
            Refresh
          </button>
        </form>

        {isSearching && (
          <div className="success mb-4">
            Searching for: <strong>"{searchQuery}"</strong>
          </div>
        )}
      </div>

      {error && (
        <div className="error">
          Failed to load products: {error}
        </div>
      )}

      {loading && (
        <div className="loading">
          Loading products...
        </div>
      )}

      {data && (
        <>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>Available Products</h3>
              <span>Total: {data.total || data.data?.length || 0}</span>
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
                          Location: {product.pickup_location}
                        </div>
                      )}
                    </div>

                    <div className="mb-4" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-light)' }}>
                      <div>Wood Type: {product.wood_type_id?.substring(0, 8)}...</div>
                      <div>Seller: {product.seller_id?.substring(0, 8)}...</div>
                      <div>Listed: {new Date(product.created_at).toLocaleDateString()}</div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                        onClick={() => handleContactSeller(product.seller_id)}
                        disabled={contacting}
                      >
                        {contacting ? 'Contacting...' : 'Contact Seller'}
                      </button>
                      <button className="btn btn-secondary">
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <h3>No products found</h3>
                {isSearching ? (
                  <p>Try adjusting your search terms or <button onClick={clearSearch} className="btn btn-primary">browse all products</button></p>
                ) : (
                  <p>No products are currently available. Check back later!</p>
                )}
              </div>
            )}

            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0 || loading}
                className="btn btn-secondary"
              >
                Previous
              </button>
              <span>Page {page + 1}</span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={!data?.data || data.data.length < 12 || loading}
                className="btn btn-secondary"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {woodTypes?.data && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Available Wood Types</h3>
          </div>
          <div className="grid grid-auto-sm">
            {woodTypes.data.slice(0, 6).map((type) => (
              <div key={type.id} className="card text-center">
                <div style={{ fontWeight: '600' }}>
                  {type.name || `Type ${type.id.substring(0, 8)}`}
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-light)' }}>
                  ID: {type.id.substring(0, 8)}...
                </div>
              </div>
            ))}
          </div>
          {woodTypes.data.length > 6 && (
            <div className="text-center mt-4" style={{ color: 'var(--color-text-light)' }}>
              And {woodTypes.data.length - 6} more wood types available
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Products;
