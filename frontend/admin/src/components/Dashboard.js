import React from 'react';
import { useApi } from '../hooks/useApi';
import { apiService } from '../services/api';

const Dashboard = React.memo(() => {
  const { data: stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useApi(
    () => apiService.getSystemStats(),
    []
  );

  const { data: health, loading: healthLoading, error: healthError } = useApi(
    () => apiService.healthCheck(),
    []
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-description">Overview of the wood trading platform</p>
      </div>

      {/* System Status */}
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="card-title">System Status</h2>
        </div>

        {healthLoading && <div className="loading">Checking system health...</div>}

        {healthError && (
          <div className="error">
            <strong>System Health Check Failed:</strong> {healthError}
          </div>
        )}

        {health && !healthError && (
          <div className="success">
            <strong>System is operational</strong> - All services are running normally
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-4 mb-6">
        <div className="card">
          <h3>Total Users</h3>
          {statsLoading ? (
            <div className="loading">Loading...</div>
          ) : statsError ? (
            <div className="error">Failed to load</div>
          ) : (
            <div>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                {(stats?.buyers?.total || 0) + (stats?.sellers?.total || 0)}
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-600)' }}>
                {stats?.buyers?.total || 0} buyers, {stats?.sellers?.total || 0} sellers
              </p>
            </div>
          )}
        </div>

        <div className="card">
          <h3>Total Products</h3>
          {statsLoading ? (
            <div className="loading">Loading...</div>
          ) : statsError ? (
            <div className="error">Failed to load</div>
          ) : (
            <div>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                {stats?.products?.total || 0}
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-600)' }}>
                Total volume: {stats?.products?.totalVolume?.toFixed(2) || 0} m³
              </p>
            </div>
          )}
        </div>

        <div className="card">
          <h3>Wood Types</h3>
          {statsLoading ? (
            <div className="loading">Loading...</div>
          ) : statsError ? (
            <div className="error">Failed to load</div>
          ) : (
            <div>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                {stats?.woodTypes?.total || 0}
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-600)' }}>
                {stats?.prices?.total || 0} price entries
              </p>
            </div>
          )}
        </div>

        <div className="card">
          <h3>Chat Threads</h3>
          {statsLoading ? (
            <div className="loading">Loading...</div>
          ) : statsError ? (
            <div className="error">Failed to load</div>
          ) : (
            <div>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                {stats?.chatThreads?.total || 0}
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-600)' }}>
                {stats?.chatMessages?.total || 0} total messages
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="card-title">Quick Actions</h2>
        </div>

        <div className="flex gap-4">
          <button
            onClick={refetchStats}
            className="btn btn-primary"
            disabled={statsLoading}
          >
            {statsLoading ? 'Refreshing...' : 'Refresh Stats'}
          </button>
          <a href="/users" className="btn btn-secondary">
            Manage Users
          </a>
          <a href="/products" className="btn btn-secondary">
            Manage Products
          </a>
          <a href="/wood-types" className="btn btn-secondary">
            Manage Wood Types
          </a>
        </div>
      </div>

      {/* Platform Overview */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Platform Overview</h2>
        </div>

        <div className="grid grid-2">
          <div>
            <h3>User Activity</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <strong>Online Buyers:</strong> {stats?.buyers?.online || 0}
              </li>
              <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <strong>Online Sellers:</strong> {stats?.sellers?.online || 0}
              </li>
              <li style={{ padding: '0.5rem 0' }}>
                <strong>Total Active Users:</strong> {(stats?.buyers?.online || 0) + (stats?.sellers?.online || 0)}
              </li>
            </ul>
          </div>

          <div>
            <h3>Platform Metrics</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <strong>Average Price:</strong> €{stats?.prices?.avgPrice?.toFixed(2) || 0}/m³
              </li>
              <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <strong>Total Value:</strong> €{stats?.products?.totalValue?.toFixed(2) || 0}
              </li>
              <li style={{ padding: '0.5rem 0' }}>
                <strong>Wooden Boards:</strong> {stats?.boards?.total || 0}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Dashboard;
