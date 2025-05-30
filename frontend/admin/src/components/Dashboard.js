import React from 'react';
import { useApi } from '../hooks/useApi';
import { apiService } from '../services/api';

function Dashboard() {
  const { data: healthData, loading: healthLoading, error: healthError } = useApi(() => apiService.healthCheck());
  const { data: buyersData, loading: buyersLoading } = useApi(() => apiService.getBuyers(0, 5));
  const { data: sellersData, loading: sellersLoading } = useApi(() => apiService.getSellers(0, 5));
  const { data: productsData, loading: productsLoading } = useApi(() => apiService.getProducts(0, 5));

  return (
    <div>
      <div className="card">
        <h2>System Overview</h2>
        
        <div className="grid grid-2">
          <div>
            <h3>Backend Status</h3>
            {healthLoading && <p>Checking...</p>}
            {healthError && <p style={{ color: '#e53e3e' }}>❌ Backend Offline</p>}
            {healthData && <p style={{ color: '#38a169' }}>✅ Backend Online</p>}
          </div>
          
          <div>
            <h3>Quick Stats</h3>
            <p>Buyers: {buyersLoading ? 'Loading...' : buyersData?.data?.length || 0}</p>
            <p>Sellers: {sellersLoading ? 'Loading...' : sellersData?.data?.length || 0}</p>
            <p>Products: {productsLoading ? 'Loading...' : productsData?.data?.length || 0}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-3">
        <div className="card">
          <h3>Recent Buyers</h3>
          {buyersLoading && <div className="loading">Loading buyers...</div>}
          {buyersData?.data?.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {buyersData.data.slice(0, 3).map((buyer) => (
                <li key={buyer.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                  ID: {buyer.id.substring(0, 8)}...
                  <br />
                  <small>Status: {buyer.is_online ? 'Online' : 'Offline'}</small>
                </li>
              ))}
            </ul>
          ) : (
            <p>No buyers found</p>
          )}
        </div>

        <div className="card">
          <h3>Recent Sellers</h3>
          {sellersLoading && <div className="loading">Loading sellers...</div>}
          {sellersData?.data?.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {sellersData.data.slice(0, 3).map((seller) => (
                <li key={seller.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                  ID: {seller.id.substring(0, 8)}...
                  <br />
                  <small>Status: {seller.is_online ? 'Online' : 'Offline'}</small>
                </li>
              ))}
            </ul>
          ) : (
            <p>No sellers found</p>
          )}
        </div>

        <div className="card">
          <h3>Recent Products</h3>
          {productsLoading && <div className="loading">Loading products...</div>}
          {productsData?.data?.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {productsData.data.slice(0, 3).map((product) => (
                <li key={product.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                  ID: {product.id.substring(0, 8)}...
                  <br />
                  <small>Volume: {product.volume}</small>
                </li>
              ))}
            </ul>
          ) : (
            <p>No products found</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
