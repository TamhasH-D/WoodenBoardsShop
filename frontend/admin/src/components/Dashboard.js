import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { apiService } from '../services/api';

function Dashboard() {
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const { data: healthData, loading: healthLoading, error: healthError, refetch: refetchHealth } = useApi(() => apiService.healthCheck());
  const { data: statsData, loading: statsLoading, error: statsError, refetch: refetchStats } = useApi(() => apiService.getSystemStats());
  const { data: buyersData, loading: buyersLoading, refetch: refetchBuyers } = useApi(() => apiService.getBuyers(0, 5));
  const { data: sellersData, loading: sellersLoading, refetch: refetchSellers } = useApi(() => apiService.getSellers(0, 5));
  const { data: productsData, loading: productsLoading, refetch: refetchProducts } = useApi(() => apiService.getProducts(0, 5));

  // Auto-refresh functionality
  useEffect(() => {
    if (refreshInterval) {
      const interval = setInterval(() => {
        refetchHealth();
        refetchStats();
        refetchBuyers();
        refetchSellers();
        refetchProducts();
        setLastRefresh(new Date());
      }, refreshInterval * 1000);

      return () => clearInterval(interval);
    }
  }, [refreshInterval, refetchHealth, refetchStats, refetchBuyers, refetchSellers, refetchProducts]);

  const handleRefreshAll = () => {
    refetchHealth();
    refetchStats();
    refetchBuyers();
    refetchSellers();
    refetchProducts();
    setLastRefresh(new Date());
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div>
      {/* Header with controls */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Admin Dashboard</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <select
              value={refreshInterval || ''}
              onChange={(e) => setRefreshInterval(e.target.value ? parseInt(e.target.value) : null)}
              className="form-input"
              style={{ width: 'auto' }}
            >
              <option value="">No auto-refresh</option>
              <option value="30">30 seconds</option>
              <option value="60">1 minute</option>
              <option value="300">5 minutes</option>
            </select>
            <button onClick={handleRefreshAll} className="btn btn-secondary">
              🔄 Refresh All
            </button>
            <small style={{ color: '#666' }}>
              Last updated: {lastRefresh.toLocaleTimeString()}
            </small>
          </div>
        </div>

        {/* System Status */}
        <div className="grid grid-3">
          <div>
            <h3>🖥️ System Status</h3>
            {healthLoading && <p>🔄 Checking...</p>}
            {healthError && <p style={{ color: '#e53e3e' }}>❌ Backend Offline</p>}
            {healthData && <p style={{ color: '#38a169' }}>✅ All Systems Operational</p>}
          </div>

          <div>
            <h3>📊 Data Overview</h3>
            {statsLoading ? (
              <p>Loading statistics...</p>
            ) : statsError ? (
              <p style={{ color: '#e53e3e' }}>Failed to load stats</p>
            ) : statsData ? (
              <div>
                <p><strong>Total Entities:</strong> {formatNumber(
                  statsData.buyers.total + statsData.sellers.total +
                  statsData.products.total + statsData.woodTypes.total
                )}</p>
                <p><strong>Active Users:</strong> {formatNumber(
                  statsData.buyers.online + statsData.sellers.online
                )}</p>
                <p><strong>Total Value:</strong> {formatCurrency(statsData.products.totalValue)}</p>
              </div>
            ) : null}
          </div>

          <div>
            <h3>💬 Communication</h3>
            {statsData && (
              <div>
                <p><strong>Chat Threads:</strong> {formatNumber(statsData.communication.threads)}</p>
                <p><strong>Messages:</strong> {formatNumber(statsData.communication.messages)}</p>
                <p><strong>Avg. Messages/Thread:</strong> {
                  statsData.communication.threads > 0
                    ? Math.round(statsData.communication.messages / statsData.communication.threads)
                    : 0
                }</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Statistics Cards */}
      <div className="grid grid-4">
        <div className="card">
          <h3>👥 Users</h3>
          {statsData ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Buyers:</span>
                <strong>{formatNumber(statsData.buyers.total)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Sellers:</span>
                <strong>{formatNumber(statsData.sellers.total)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Online:</span>
                <strong style={{ color: '#38a169' }}>
                  {formatNumber(statsData.buyers.online + statsData.sellers.online)}
                </strong>
              </div>
              <div style={{ fontSize: '0.8em', color: '#666', marginTop: '0.5rem' }}>
                {statsData.buyers.total + statsData.sellers.total > 0 ?
                  `${Math.round(((statsData.buyers.online + statsData.sellers.online) /
                    (statsData.buyers.total + statsData.sellers.total)) * 100)}% online` :
                  'No users'
                }
              </div>
            </div>
          ) : (
            <div className="loading">Loading...</div>
          )}
        </div>

        <div className="card">
          <h3>📦 Products</h3>
          {statsData ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Total:</span>
                <strong>{formatNumber(statsData.products.total)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Volume:</span>
                <strong>{formatNumber(statsData.products.totalVolume)} m³</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Value:</span>
                <strong>{formatCurrency(statsData.products.totalValue)}</strong>
              </div>
              <div style={{ fontSize: '0.8em', color: '#666', marginTop: '0.5rem' }}>
                {statsData.products.total > 0 ?
                  `Avg: ${formatCurrency(statsData.products.totalValue / statsData.products.total)}` :
                  'No products'
                }
              </div>
            </div>
          ) : (
            <div className="loading">Loading...</div>
          )}
        </div>

        <div className="card">
          <h3>🌳 Wood Types</h3>
          {statsData ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Types:</span>
                <strong>{formatNumber(statsData.woodTypes.total)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Prices:</span>
                <strong>{formatNumber(statsData.prices.total)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Avg Price:</span>
                <strong>{formatCurrency(statsData.prices.avgPrice)}/m³</strong>
              </div>
              <div style={{ fontSize: '0.8em', color: '#666', marginTop: '0.5rem' }}>
                {statsData.prices.total > 0 ?
                  `${Math.round((statsData.prices.total / statsData.woodTypes.total) * 100)}% priced` :
                  'No pricing data'
                }
              </div>
            </div>
          ) : (
            <div className="loading">Loading...</div>
          )}
        </div>

        <div className="card">
          <h3>🗂️ Content</h3>
          {statsData ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Images:</span>
                <strong>{formatNumber(statsData.images.total)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Boards:</span>
                <strong>{formatNumber(statsData.boards.total)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Chats:</span>
                <strong>{formatNumber(statsData.communication.threads)}</strong>
              </div>
              <div style={{ fontSize: '0.8em', color: '#666', marginTop: '0.5rem' }}>
                Total database entities
              </div>
            </div>
          ) : (
            <div className="loading">Loading...</div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-3">
        <div className="card">
          <h3>👥 Recent Buyers</h3>
          {buyersLoading && <div className="loading">Loading buyers...</div>}
          {buyersData?.data?.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {buyersData.data.slice(0, 3).map((buyer) => (
                <li key={buyer.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>ID: {buyer.id.substring(0, 8)}...</strong>
                      <br />
                      <small style={{ color: buyer.is_online ? '#38a169' : '#666' }}>
                        {buyer.is_online ? '🟢 Online' : '⚫ Offline'}
                      </small>
                    </div>
                    <div style={{ fontSize: '0.8em', color: '#666' }}>
                      {new Date(buyer.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ textAlign: 'center', color: '#666' }}>No buyers found</p>
          )}
        </div>

        <div className="card">
          <h3>🏪 Recent Sellers</h3>
          {sellersLoading && <div className="loading">Loading sellers...</div>}
          {sellersData?.data?.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {sellersData.data.slice(0, 3).map((seller) => (
                <li key={seller.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>ID: {seller.id.substring(0, 8)}...</strong>
                      <br />
                      <small style={{ color: seller.is_online ? '#38a169' : '#666' }}>
                        {seller.is_online ? '🟢 Online' : '⚫ Offline'}
                      </small>
                    </div>
                    <div style={{ fontSize: '0.8em', color: '#666' }}>
                      {new Date(seller.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ textAlign: 'center', color: '#666' }}>No sellers found</p>
          )}
        </div>

        <div className="card">
          <h3>📦 Recent Products</h3>
          {productsLoading && <div className="loading">Loading products...</div>}
          {productsData?.data?.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {productsData.data.slice(0, 3).map((product) => (
                <li key={product.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>ID: {product.id.substring(0, 8)}...</strong>
                      <br />
                      <small style={{ color: '#666' }}>
                        {product.volume}m³ • {formatCurrency(product.price)}
                      </small>
                    </div>
                    <div style={{ fontSize: '0.8em', color: '#666' }}>
                      {new Date(product.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ textAlign: 'center', color: '#666' }}>No products found</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3>⚡ Quick Actions</h3>
        <div className="grid grid-4">
          <button
            className="btn btn-primary"
            onClick={() => window.location.href = '/buyers'}
            style={{ padding: '1rem', textAlign: 'center' }}
          >
            👥 Manage Users
          </button>
          <button
            className="btn btn-primary"
            onClick={() => window.location.href = '/products'}
            style={{ padding: '1rem', textAlign: 'center' }}
          >
            📦 Manage Products
          </button>
          <button
            className="btn btn-primary"
            onClick={() => window.location.href = '/chats'}
            style={{ padding: '1rem', textAlign: 'center' }}
          >
            💬 Monitor Chats
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => window.location.href = '/health'}
            style={{ padding: '1rem', textAlign: 'center' }}
          >
            🔧 System Health
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
