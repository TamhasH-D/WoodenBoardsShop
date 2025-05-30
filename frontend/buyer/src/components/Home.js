import React from 'react';
import { useApi } from '../hooks/useApi';
import { apiService } from '../services/api';

function Home() {
  const { data: healthData, loading: healthLoading, error: healthError } = useApi(() => apiService.healthCheck());
  const { data: productsData, loading: productsLoading } = useApi(() => apiService.getProducts(0, 6));
  const { data: woodTypesData } = useApi(() => apiService.getWoodTypes());

  return (
    <div>
      {/* Hero Section */}
      <div className="hero">
        <div className="container">
          <h1>Welcome to Wood Products Marketplace</h1>
          <p>Discover quality wood products from verified sellers</p>
          <div style={{ marginTop: '2rem' }}>
            <a href="/products" className="btn btn-primary" style={{ marginRight: '1rem' }}>
              Browse Products
            </a>
            <a href="/analyzer" className="btn btn-secondary">
              Analyze Wood Board
            </a>
          </div>
        </div>
      </div>

      <div className="container">
        {/* System Status */}
        <div className="card">
          <h2>System Status</h2>
          <div className="grid grid-3">
            <div>
              <h3>Backend Connection</h3>
              {healthLoading && <p>Checking...</p>}
              {healthError && <p style={{ color: '#e53e3e' }}>❌ Offline</p>}
              {healthData && <p style={{ color: '#38a169' }}>✅ Online</p>}
            </div>
            
            <div>
              <h3>Available Products</h3>
              <p>{productsLoading ? 'Loading...' : productsData?.total || productsData?.data?.length || 0}</p>
            </div>
            
            <div>
              <h3>Wood Types</h3>
              <p>{woodTypesData?.total || woodTypesData?.data?.length || 0}</p>
            </div>
          </div>
        </div>

        {/* Featured Products */}
        <div className="card">
          <h2>Featured Products</h2>
          {productsLoading && <div className="loading">Loading featured products...</div>}
          
          {productsData?.data && productsData.data.length > 0 ? (
            <div className="grid grid-3">
              {productsData.data.slice(0, 6).map((product) => (
                <div key={product.id} className="product-card">
                  <div className="product-price">${product.price}</div>
                  <div className="product-volume">{product.volume} m³</div>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#718096' }}>
                    Wood Type: {product.wood_type_id?.substring(0, 8)}...
                  </div>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#718096' }}>
                    Seller: {product.seller_id?.substring(0, 8)}...
                  </div>
                  <div style={{ marginTop: '1rem' }}>
                    <button className="btn btn-primary">Contact Seller</button>
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
          <div className="card">
            <h3>🌲 Quality Wood Products</h3>
            <p>Browse through a wide selection of quality wood products from verified sellers.</p>
          </div>
          
          <div className="card">
            <h3>🔍 Board Analysis</h3>
            <p>Use our AI-powered board analyzer to estimate wood volume and quality.</p>
          </div>
          
          <div className="card">
            <h3>💬 Direct Communication</h3>
            <p>Chat directly with sellers to negotiate prices and discuss requirements.</p>
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
