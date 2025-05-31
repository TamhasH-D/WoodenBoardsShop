import React, { useEffect, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useNotifications } from '../contexts/NotificationContext';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import './Dashboard.css';

/**
 * Modern dashboard page with analytics and quick actions
 */
const Dashboard = () => {
  const { setPageTitle, setBackendStatus } = useApp();
  const { showError, showSuccess } = useNotifications();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPageTitle('Dashboard');
    loadDashboardData();
  }, [setPageTitle]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Test backend connectivity
      try {
        await apiService.healthCheck();
        setBackendStatus({ online: true });
      } catch (error) {
        setBackendStatus({ online: false });
      }

      // Load system statistics
      const systemStats = await apiService.getSystemStats();
      setStats(systemStats);
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      showError('Failed to load dashboard data. Please check your connection.');
      
      // Set default stats for offline mode
      setStats({
        buyers: { total: 0, online: 0 },
        sellers: { total: 0, online: 0 },
        products: { total: 0, totalVolume: 0, totalValue: 0 },
        woodTypes: { total: 0 },
        prices: { total: 0, avgPrice: 0 },
        boards: { total: 0 },
        images: { total: 0 },
        communication: { threads: 0, messages: 0 }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    showSuccess('Refreshing dashboard data...');
    loadDashboardData();
  };

  if (loading) {
    return (
      <div className="dashboard">
        <LoadingSpinner size="large" message="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Dashboard Header */}
      <div className="dashboard__header">
        <div className="dashboard__header-content">
          <h2 className="dashboard__title">Welcome to Admin Dashboard</h2>
          <p className="dashboard__subtitle">
            Monitor and manage your wood trading platform
          </p>
        </div>
        
        <div className="dashboard__actions">
          <Button
            variant="secondary"
            onClick={handleRefresh}
            icon="🔄"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="dashboard__stats">
        {/* Users Stats */}
        <div className="dashboard__stat-card">
          <div className="dashboard__stat-header">
            <h3 className="dashboard__stat-title">Users</h3>
            <span className="dashboard__stat-icon">👥</span>
          </div>
          <div className="dashboard__stat-content">
            <div className="dashboard__stat-number">
              {stats.buyers.total + stats.sellers.total}
            </div>
            <div className="dashboard__stat-details">
              <span>{stats.buyers.total} Buyers</span>
              <span>{stats.sellers.total} Sellers</span>
            </div>
          </div>
        </div>

        {/* Products Stats */}
        <div className="dashboard__stat-card">
          <div className="dashboard__stat-header">
            <h3 className="dashboard__stat-title">Products</h3>
            <span className="dashboard__stat-icon">📦</span>
          </div>
          <div className="dashboard__stat-content">
            <div className="dashboard__stat-number">
              {stats.products.total}
            </div>
            <div className="dashboard__stat-details">
              <span>{stats.products.totalVolume.toFixed(2)} m³ Total</span>
              <span>${stats.products.totalValue.toFixed(2)} Value</span>
            </div>
          </div>
        </div>

        {/* Wood Types Stats */}
        <div className="dashboard__stat-card">
          <div className="dashboard__stat-header">
            <h3 className="dashboard__stat-title">Wood Types</h3>
            <span className="dashboard__stat-icon">🌳</span>
          </div>
          <div className="dashboard__stat-content">
            <div className="dashboard__stat-number">
              {stats.woodTypes.total}
            </div>
            <div className="dashboard__stat-details">
              <span>{stats.prices.total} Price Points</span>
              <span>${stats.prices.avgPrice.toFixed(2)} Avg/m³</span>
            </div>
          </div>
        </div>

        {/* Communication Stats */}
        <div className="dashboard__stat-card">
          <div className="dashboard__stat-header">
            <h3 className="dashboard__stat-title">Communication</h3>
            <span className="dashboard__stat-icon">💬</span>
          </div>
          <div className="dashboard__stat-content">
            <div className="dashboard__stat-number">
              {stats.communication.threads}
            </div>
            <div className="dashboard__stat-details">
              <span>{stats.communication.messages} Messages</span>
              <span>Active Threads</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard__section">
        <h3 className="dashboard__section-title">Quick Actions</h3>
        
        <div className="dashboard__quick-actions">
          <Button
            variant="primary"
            size="large"
            onClick={() => window.location.href = '/users/buyers'}
            icon="🛒"
          >
            Manage Buyers
          </Button>
          
          <Button
            variant="primary"
            size="large"
            onClick={() => window.location.href = '/users/sellers'}
            icon="🏪"
          >
            Manage Sellers
          </Button>
          
          <Button
            variant="primary"
            size="large"
            onClick={() => window.location.href = '/products/wood-types'}
            icon="🌳"
          >
            Wood Types
          </Button>
          
          <Button
            variant="secondary"
            size="large"
            onClick={() => window.location.href = '/tools/export'}
            icon="📤"
          >
            Export Data
          </Button>
          
          <Button
            variant="secondary"
            size="large"
            onClick={() => window.location.href = '/tools/api-test'}
            icon="🧪"
          >
            API Tester
          </Button>
          
          <Button
            variant="secondary"
            size="large"
            onClick={() => window.location.href = '/system/health'}
            icon="🔧"
          >
            System Health
          </Button>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="dashboard__section">
        <h3 className="dashboard__section-title">Recent Activity</h3>
        
        <div className="dashboard__activity">
          <div className="dashboard__activity-item">
            <span className="dashboard__activity-icon">👤</span>
            <div className="dashboard__activity-content">
              <span className="dashboard__activity-text">
                System initialized successfully
              </span>
              <span className="dashboard__activity-time">
                {new Date().toLocaleString()}
              </span>
            </div>
          </div>
          
          <div className="dashboard__activity-item">
            <span className="dashboard__activity-icon">📊</span>
            <div className="dashboard__activity-content">
              <span className="dashboard__activity-text">
                Dashboard loaded with {stats.buyers.total + stats.sellers.total} users
              </span>
              <span className="dashboard__activity-time">
                {new Date().toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
