import React from 'react';
import { useApi } from '../hooks/useApi';
import { apiService } from '../services/api';

const Analytics = React.memo(() => {
  const { data: stats, loading, error, refetch } = useApi(
    () => apiService.getSystemStats(),
    []
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-description">Базовая отчетность по продавцам, покупателям, товарам и активности платформы</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <p>Platform analytics and metrics</p>
        </div>
        <button 
          onClick={refetch}
          className="btn btn-secondary" 
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh Data'}
        </button>
      </div>

      {loading && <div className="loading">Loading analytics...</div>}
      
      {error && (
        <div className="error mb-4">
          <strong>Failed to load analytics:</strong> {error}
        </div>
      )}

      {stats && (
        <div>
          {/* User Analytics */}
          <div className="card mb-6">
            <div className="card-header">
              <h2 className="card-title">Аналитика продавцов и покупателей</h2>
            </div>
            
            <div className="grid grid-3">
              <div>
                <h3>Всего пользователей</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                  {(stats.buyers?.total || 0) + (stats.sellers?.total || 0)}
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-600)' }}>
                  {stats.buyers?.total || 0} покупателей, {stats.sellers?.total || 0} продавцов
                </p>
              </div>
              
              <div>
                <h3>Активные пользователи</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-success)' }}>
                  {(stats.buyers?.online || 0) + (stats.sellers?.online || 0)}
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-600)' }}>
                  {stats.buyers?.online || 0} покупателей, {stats.sellers?.online || 0} продавцов онлайн
                </p>
              </div>
              
              <div>
                <h3>Activity Rate</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-warning)' }}>
                  {((stats.buyers?.total || 0) + (stats.sellers?.total || 0)) > 0 
                    ? Math.round((((stats.buyers?.online || 0) + (stats.sellers?.online || 0)) / 
                        ((stats.buyers?.total || 0) + (stats.sellers?.total || 0))) * 100)
                    : 0}%
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-600)' }}>
                  Пользователей сейчас онлайн
                </p>
              </div>
            </div>
          </div>

          {/* Product Analytics */}
          <div className="card mb-6">
            <div className="card-header">
              <h2 className="card-title">Product Analytics</h2>
            </div>
            
            <div className="grid grid-3">
              <div>
                <h3>Total Products</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                  {stats.products?.total || 0}
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-600)' }}>
                  Listed on platform
                </p>
              </div>
              
              <div>
                <h3>Total Volume</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-success)' }}>
                  {stats.products?.totalVolume?.toFixed(1) || 0}
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-600)' }}>
                  Cubic meters (m³)
                </p>
              </div>
              
              <div>
                <h3>Total Value</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-warning)' }}>
                  €{stats.products?.totalValue?.toFixed(0) || 0}
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-600)' }}>
                  Market value
                </p>
              </div>
            </div>
          </div>

          {/* Platform Analytics */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Platform Analytics</h2>
            </div>
            
            <div className="grid grid-2">
              <div>
                <h3>Wood Types & Pricing</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                    <strong>Wood Types:</strong> {stats.woodTypes?.total || 0}
                  </li>
                  <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                    <strong>Price Entries:</strong> {stats.prices?.total || 0}
                  </li>
                  <li style={{ padding: '0.5rem 0' }}>
                    <strong>Average Price:</strong> {stats.prices?.avgPrice?.toFixed(2) || 0} ₽/м³
                  </li>
                </ul>
              </div>
              
              <div>
                <h3>Communication</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                    <strong>Chat Threads:</strong> {stats.chatThreads?.total || 0}
                  </li>
                  <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                    <strong>Total Messages:</strong> {stats.chatMessages?.total || 0}
                  </li>
                  <li style={{ padding: '0.5rem 0' }}>
                    <strong>Avg Messages/Thread:</strong> {
                      (stats.chatThreads?.total || 0) > 0 
                        ? Math.round((stats.chatMessages?.total || 0) / (stats.chatThreads?.total || 1))
                        : 0
                    }
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default Analytics;
