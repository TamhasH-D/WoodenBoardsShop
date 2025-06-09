import { useCallback, useMemo } from 'react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { apiService } from '../services/api';
import { BUYER_TEXTS } from '../utils/localization';
import { MOCK_IDS } from '../utils/constants';

// Use shared mock buyer ID
const MOCK_BUYER_ID = MOCK_IDS.BUYER_ID;

function Home() {
  // Create stable API functions to prevent infinite loops
  const healthApiFunction = useMemo(() => () => apiService.healthCheck(), []);
  const productsApiFunction = useMemo(() => () => apiService.getProducts(0, 6), []);
  const woodTypesApiFunction = useMemo(() => () => apiService.getWoodTypes(), []);

  const { data: healthData, loading: healthLoading, error: healthError } = useApi(healthApiFunction, []);
  const { data: productsData, loading: productsLoading } = useApi(productsApiFunction, []);
  const { data: woodTypesData } = useApi(woodTypesApiFunction, []);
  const { mutate, loading: contacting } = useApiMutation();

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
      console.error('Failed to contact seller:', err);
      alert('Failed to contact seller. Please try again.');
    }
  }, [mutate]);

  return (
    <div>
      {/* Hero Section */}
      <div className="header">
        <div className="container">
          <h1>{BUYER_TEXTS.WELCOME_TITLE}</h1>
          <p>{BUYER_TEXTS.WELCOME_SUBTITLE}</p>
          <div className="flex gap-4 mt-6">
            <a href="/products" className="btn btn-primary">
              {BUYER_TEXTS.BROWSE_PRODUCTS}
            </a>
            <a href="/analyzer" className="btn btn-secondary">
              {BUYER_TEXTS.ANALYZE_WOOD_BOARD}
            </a>
          </div>
        </div>
      </div>

      <div className="container">
        {/* System Status */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">{BUYER_TEXTS.SYSTEM_STATUS}</h2>
          </div>
          <div className="grid grid-auto-sm">
            <div className="card text-center">
              <h3 style={{ marginBottom: '1rem' }}>{BUYER_TEXTS.BACKEND_STATUS}</h3>
              {healthLoading && <p className="loading">{BUYER_TEXTS.LOADING}</p>}
              {healthError && <p className="status status-error">{BUYER_TEXTS.OFFLINE}</p>}
              {healthData && <p className="status status-success">{BUYER_TEXTS.ONLINE}</p>}
            </div>

            <div className="card text-center">
              <h3 style={{ marginBottom: '1rem' }}>{BUYER_TEXTS.PRODUCTS}</h3>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-primary)' }}>
                {productsLoading ? (
                  <span className="loading">...</span>
                ) : (
                  productsData?.total || productsData?.data?.length || 0
                )}
              </p>
            </div>

            <div className="card text-center">
              <h3 style={{ marginBottom: '1rem' }}>{BUYER_TEXTS.WOOD_TYPES}</h3>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-primary)' }}>
                {woodTypesData?.total || woodTypesData?.data?.length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Featured Products */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">{BUYER_TEXTS.FEATURED_PRODUCTS}</h2>
          </div>

          {productsLoading && (
            <div className="loading">{BUYER_TEXTS.LOADING_PRODUCTS}...</div>
          )}

          {productsData?.data && productsData.data.length > 0 ? (
            <div className="grid grid-auto">
              {productsData.data.slice(0, 6).map((product) => (
                <div key={product.id} className="product-card">
                  <h4 className="product-title">
                    {product.title || BUYER_TEXTS.UNTITLED_PRODUCT}
                  </h4>
                  {product.descrioption && (
                    <p className="product-description">
                      {product.descrioption}
                    </p>
                  )}
                  <div className="product-price">{product.price} {BUYER_TEXTS.RUBLES}</div>
                  <div style={{ color: 'var(--color-text-light)', marginBottom: 'var(--space-2)' }}>
                    {product.volume} {BUYER_TEXTS.CUBIC_METERS}
                  </div>
                  <div className={`status ${product.delivery_possible ? 'status-success' : 'status-error'} mb-4`}>
                    {product.delivery_possible ? BUYER_TEXTS.DELIVERY_AVAILABLE : BUYER_TEXTS.PICKUP_ONLY}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-light)', marginBottom: 'var(--space-3)' }}>
                    <div>{BUYER_TEXTS.WOOD_TYPE}: {product.wood_type_id?.substring(0, 8)}...</div>
                    <div>{BUYER_TEXTS.SELLER}: {product.seller_id?.substring(0, 8)}...</div>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleContactSeller(product.seller_id)}
                    disabled={contacting}
                  >
                    {contacting ? BUYER_TEXTS.CONTACTING : BUYER_TEXTS.CONTACT_SELLER}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">{BUYER_TEXTS.NO_PRODUCTS_AVAILABLE_MOMENT}</div>
          )}

          <div className="text-center mt-6">
            <a href="/products" className="btn btn-primary">{BUYER_TEXTS.VIEW_ALL_PRODUCTS}</a>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-auto-sm">
          <div className="card text-center">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌲</div>
            <h3 style={{ marginBottom: '1rem' }}>{BUYER_TEXTS.QUALITY_WOOD_PRODUCTS}</h3>
            <p style={{ color: 'var(--color-text-light)' }}>
              {BUYER_TEXTS.BROWSE_WIDE_SELECTION}
            </p>
          </div>

          <div className="card text-center">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ marginBottom: '1rem' }}>{BUYER_TEXTS.AI_BOARD_ANALYSIS}</h3>
            <p style={{ color: 'var(--color-text-light)' }}>
              {BUYER_TEXTS.USE_AI_POWERED_ANALYZER}
            </p>
          </div>

          <div className="card text-center">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
            <h3 style={{ marginBottom: '1rem' }}>{BUYER_TEXTS.DIRECT_COMMUNICATION}</h3>
            <p style={{ color: 'var(--color-text-light)' }}>
              {BUYER_TEXTS.CHAT_DIRECTLY_WITH_SELLERS}
            </p>
          </div>
        </div>

        {/* Getting Started */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">{BUYER_TEXTS.GETTING_STARTED}</h2>
          </div>
          <div className="grid grid-auto">
            <div>
              <h3 style={{ marginBottom: '1rem' }}>{BUYER_TEXTS.FOR_BUYERS}</h3>
              <ol style={{ marginLeft: '1.5rem' }}>
                <li>{BUYER_TEXTS.BROWSE_AVAILABLE_PRODUCTS}</li>
                <li>{BUYER_TEXTS.USE_BOARD_ANALYZER}</li>
                <li>{BUYER_TEXTS.CONTACT_SELLERS_CHAT}</li>
                <li>{BUYER_TEXTS.NEGOTIATE_PRICES_DELIVERY}</li>
              </ol>
            </div>

            <div>
              <h3 style={{ marginBottom: '1rem' }}>{BUYER_TEXTS.FEATURES_AVAILABLE}</h3>
              <ul style={{ marginLeft: '1.5rem' }}>
                <li>{BUYER_TEXTS.PRODUCT_SEARCH_FILTERING}</li>
                <li>{BUYER_TEXTS.SELLER_PROFILES_RATINGS}</li>
                <li>{BUYER_TEXTS.AI_POWERED_BOARD_ANALYSIS}</li>
                <li>{BUYER_TEXTS.REAL_TIME_CHAT_SYSTEM}</li>
                <li>{BUYER_TEXTS.PRICE_COMPARISON_TOOLS}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
