import React from 'react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { apiService } from '../services/api';

// Mock buyer ID - in real app this would come from authentication
const MOCK_BUYER_ID = '123e4567-e89b-12d3-a456-426614174001';

function Home() {
  const { data: healthData, loading: healthLoading, error: healthError } = useApi(() => apiService.healthCheck());
  const { data: productsData, loading: productsLoading } = useApi(() => apiService.getProducts(0, 6));
  const { mutate, loading: contacting } = useApiMutation();

  const handleContactSeller = async (sellerId) => {
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
  };
  const { data: woodTypesData } = useApi(() => apiService.getWoodTypes());

  return (
    <div>
      {/* Hero Section */}
      <div className="hero">
        <div className="container">
          <h1 className="animate-fade-in-up">Welcome to Wood Products Marketplace</h1>
          <p className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Discover quality wood products from verified sellers
          </p>
          <div className="animate-fade-in-up" style={{ marginTop: '2rem', animationDelay: '0.4s' }}>
            <a href="/products" className="btn btn-primary" style={{ marginRight: '1rem' }}>
              🌲 Browse Products
            </a>
            <a href="/analyzer" className="btn btn-secondary">
              🔍 Analyze Wood Board
            </a>
          </div>
        </div>
      </div>

      <div className="container">
        {/* System Status */}
        <div className="card animate-fade-in-scale" style={{ animationDelay: '0.6s' }}>
          <h2>📊 System Status</h2>
          <div className="grid grid-3">
            <div style={{
              padding: '1.5rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
              border: '1px solid #bbf7d0',
              textAlign: 'center'
            }}>
              <h3 style={{ marginBottom: '1rem', color: '#166534' }}>🔗 Backend Connection</h3>
              {healthLoading && <p className="skeleton" style={{ height: '20px', width: '80px', margin: '0 auto' }}></p>}
              {healthError && <p style={{ color: '#dc2626', fontWeight: '600' }}>❌ Offline</p>}
              {healthData && <p style={{ color: '#16a34a', fontWeight: '600' }}>✅ Online</p>}
            </div>

            <div style={{
              padding: '1.5rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              border: '1px solid #93c5fd',
              textAlign: 'center'
            }}>
              <h3 style={{ marginBottom: '1rem', color: '#1d4ed8' }}>📦 Available Products</h3>
              <p style={{ fontSize: '2rem', fontWeight: '800', color: '#1e40af' }}>
                {productsLoading ? (
                  <span className="skeleton" style={{ height: '32px', width: '60px', display: 'inline-block' }}></span>
                ) : (
                  productsData?.total || productsData?.data?.length || 0
                )}
              </p>
            </div>

            <div style={{
              padding: '1.5rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)',
              border: '1px solid #fcd34d',
              textAlign: 'center'
            }}>
              <h3 style={{ marginBottom: '1rem', color: '#92400e' }}>🌳 Wood Types</h3>
              <p style={{ fontSize: '2rem', fontWeight: '800', color: '#b45309' }}>
                {woodTypesData?.total || woodTypesData?.data?.length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Featured Products */}
        <div className="card animate-fade-in-scale" style={{ animationDelay: '0.8s' }}>
          <h2>⭐ Featured Products</h2>
          {productsLoading && (
            <div className="loading">
              <div className="grid grid-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="skeleton" style={{ height: '200px', borderRadius: '12px' }}></div>
                ))}
              </div>
            </div>
          )}
          
          {productsData?.data && productsData.data.length > 0 ? (
            <div className="grid grid-3">
              {productsData.data.slice(0, 6).map((product) => (
                <div key={product.id} className="product-card">
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 'bold' }}>
                    {product.title || 'Untitled Product'}
                  </h4>
                  {product.descrioption && (
                    <p style={{
                      margin: '0 0 0.75rem 0',
                      fontSize: '0.8rem',
                      color: '#4a5568',
                      lineHeight: '1.3',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {product.descrioption}
                    </p>
                  )}
                  <div className="product-price">${product.price}</div>
                  <div className="product-volume">{product.volume} m³</div>
                  <div style={{
                    marginTop: '0.5rem',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.7rem',
                    backgroundColor: product.delivery_possible ? '#c6f6d5' : '#fed7d7',
                    color: product.delivery_possible ? '#2f855a' : '#c53030',
                    display: 'inline-block'
                  }}>
                    {product.delivery_possible ? '🚚 Delivery' : '📍 Pickup'}
                  </div>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#718096' }}>
                    Wood Type: {product.wood_type_id?.substring(0, 8)}...
                  </div>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#718096' }}>
                    Seller: {product.seller_id?.substring(0, 8)}...
                  </div>
                  <div style={{ marginTop: '1rem' }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleContactSeller(product.seller_id)}
                      disabled={contacting}
                    >
                      {contacting ? 'Contacting...' : 'Contact Seller'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No products available at the moment.</p>
          )}
          
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <a href="/products" className="btn btn-primary">View All Products</a>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-3">
          <div className="card animate-fade-in-up" style={{ animationDelay: '1.0s' }}>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '1rem',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '50%',
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto'
              }}>
                🌲
              </div>
              <h3 style={{ color: '#1f2937', fontWeight: '700' }}>Quality Wood Products</h3>
            </div>
            <p style={{ textAlign: 'center', color: '#6b7280', lineHeight: '1.6' }}>
              Browse through a wide selection of quality wood products from verified sellers.
            </p>
          </div>

          <div className="card animate-fade-in-up" style={{ animationDelay: '1.2s' }}>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '1rem',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                borderRadius: '50%',
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto'
              }}>
                🔍
              </div>
              <h3 style={{ color: '#1f2937', fontWeight: '700' }}>AI Board Analysis</h3>
            </div>
            <p style={{ textAlign: 'center', color: '#6b7280', lineHeight: '1.6' }}>
              Use our AI-powered board analyzer to estimate wood volume and quality.
            </p>
          </div>

          <div className="card animate-fade-in-up" style={{ animationDelay: '1.4s' }}>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '1rem',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderRadius: '50%',
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto'
              }}>
                💬
              </div>
              <h3 style={{ color: '#1f2937', fontWeight: '700' }}>Direct Communication</h3>
            </div>
            <p style={{ textAlign: 'center', color: '#6b7280', lineHeight: '1.6' }}>
              Chat directly with sellers to negotiate prices and discuss requirements.
            </p>
          </div>
        </div>

        {/* Getting Started */}
        <div className="card">
          <h2>Getting Started</h2>
          <div className="grid grid-2">
            <div>
              <h3>For Buyers</h3>
              <ol style={{ marginLeft: '1.5rem', marginTop: '1rem' }}>
                <li>Browse available wood products</li>
                <li>Use the board analyzer for volume estimation</li>
                <li>Contact sellers directly through chat</li>
                <li>Negotiate prices and arrange delivery</li>
              </ol>
            </div>
            
            <div>
              <h3>Features Available</h3>
              <ul style={{ marginLeft: '1.5rem', marginTop: '1rem' }}>
                <li>Product search and filtering</li>
                <li>Seller profiles and ratings</li>
                <li>AI-powered board analysis</li>
                <li>Real-time chat system</li>
                <li>Price comparison tools</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
