import React from 'react';
import { useApi } from '../hooks/useApi';
import { apiService } from '../services/api';

// Mock seller ID - in real app this would come from authentication
const MOCK_SELLER_ID = '123e4567-e89b-12d3-a456-426614174000';

function Dashboard() {
  const { data: healthData, loading: healthLoading, error: healthError } = useApi(() => apiService.healthCheck());
  const { data: statsData, loading: statsLoading } = useApi(() => apiService.getSellerStats(MOCK_SELLER_ID));

  return (
    <div>
      <div className="card">
        <h2>Business Overview</h2>
        
        <div className="grid grid-2">
          <div>
            <h3>System Status</h3>
            {healthLoading && <p>Checking...</p>}
            {healthError && <p style={{ color: '#e53e3e' }}>❌ Backend Offline</p>}
            {healthData && <p style={{ color: '#38a169' }}>✅ System Online</p>}
          </div>
          
          <div>
            <h3>Quick Actions</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <a href="/products" className="btn btn-primary">Add Product</a>
              <a href="/chats" className="btn btn-secondary">View Messages</a>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="stats-card">
          <div className="stats-number">
            {statsLoading ? '...' : statsData?.totalProducts || 0}
          </div>
          <div className="stats-label">Total Products</div>
        </div>

        <div className="stats-card">
          <div className="stats-number">
            {statsLoading ? '...' : statsData?.totalChats || 0}
          </div>
          <div className="stats-label">Active Chats</div>
        </div>

        <div className="stats-card">
          <div className="stats-number">
            {statsLoading ? '...' : (statsData?.totalVolume || 0).toFixed(1)}
          </div>
          <div className="stats-label">Total Volume (m³)</div>
        </div>

        <div className="stats-card">
          <div className="stats-number">
            ${statsLoading ? '...' : (statsData?.totalValue || 0).toFixed(0)}
          </div>
          <div className="stats-label">Total Value</div>
        </div>
      </div>

      <div className="card">
        <h3>Getting Started</h3>
        <p>Welcome to your seller dashboard! Here you can:</p>
        <ul style={{ marginLeft: '2rem', marginTop: '1rem' }}>
          <li>Manage your wood product inventory</li>
          <li>Communicate with potential buyers</li>
          <li>Track your sales and business metrics</li>
          <li>Update your seller profile information</li>
        </ul>
        
        {statsData?.totalProducts === 0 && (
          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#e6fffa', borderRadius: '0.375rem' }}>
            <strong>Get started:</strong> Add your first product to begin selling!
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
