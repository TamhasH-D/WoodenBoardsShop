import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import WoodTypesManager from './components/WoodTypesManager';
import Chats from './components/Chats';
import Profile from './components/Profile';
import HealthCheck from './components/HealthCheck';
import ErrorBoundary from './components/ErrorBoundary';
import RequestMonitor from './components/RequestMonitor';
import { SELLER_TEXTS } from './utils/localization';
import { MOCK_SELLER_ID } from './utils/constants';
import SellerAutoRefreshManager from './utils/autoRefresh';
import './index.css';

function Navigation() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <ul className="nav-links">
      <li>
        <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
          {SELLER_TEXTS.DASHBOARD}
        </Link>
      </li>
      <li>
        <Link to="/products" className={`nav-link ${isActive('/products') ? 'active' : ''}`}>
          {SELLER_TEXTS.PRODUCTS}
        </Link>
      </li>
      <li>
        <Link to="/wood-types" className={`nav-link ${isActive('/wood-types') ? 'active' : ''}`}>
          {SELLER_TEXTS.WOOD_TYPES}
        </Link>
      </li>
      <li>
        <Link to="/chats" className={`nav-link ${isActive('/chats') ? 'active' : ''}`}>
          {SELLER_TEXTS.CHATS}
        </Link>
      </li>
      <li>
        <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`}>
          {SELLER_TEXTS.PROFILE}
        </Link>
      </li>
      <li>
        <Link to="/health" className={`nav-link ${isActive('/health') ? 'active' : ''}`}>
          {SELLER_TEXTS.HEALTH_CHECK}
        </Link>
      </li>
    </ul>
  );
}

function App() {
  const [onlineStatus, setOnlineStatus] = useState({
    isOnline: false,
    lastActivity: null,
    error: null
  });
  const [, setAutoRefreshManager] = useState(null);

  // Initialize auto-refresh system
  useEffect(() => {
    const manager = new SellerAutoRefreshManager(MOCK_SELLER_ID, {
      onRefresh: async () => {
        // This will be called every 5 minutes to refresh data
        // Individual components can listen to this via custom events
        window.dispatchEvent(new CustomEvent('seller-auto-refresh'));
      },
      onStatusChange: setOnlineStatus,
      onError: (error) => {
        // Log error for debugging in development
        if (process.env.NODE_ENV === 'development') {
          console.error('[App] Auto-refresh error:', error);
        }
      }
    });

    manager.start();
    setAutoRefreshManager(manager);

    return () => {
      manager.destroy();
    };
  }, []);

  return (
    <Router>
      <div className="app">
        <header className="header">
          <div className="container">
            <nav className="nav">
              <div className="nav-brand">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {SELLER_TEXTS.SELLER_DASHBOARD}
                  {process.env.NODE_ENV === 'development' && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        backgroundColor: onlineStatus.isOnline ? '#10b981' : '#ef4444',
                        color: 'white',
                        fontWeight: '600'
                      }}
                      title={onlineStatus.error || `Last activity: ${onlineStatus.lastActivity || 'Never'}`}
                    >
                      {onlineStatus.isOnline ? `🟢 ${SELLER_TEXTS.ONLINE}` : `🔴 ${SELLER_TEXTS.OFFLINE}`}
                    </span>
                  )}
                </div>
              </div>
              <Navigation />
            </nav>
          </div>
        </header>

        <main className="main">
          <div className="container">
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/products" element={<Products />} />
                <Route path="/wood-types" element={<WoodTypesManager />} />
                <Route path="/chats" element={<Chats />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/health" element={<HealthCheck />} />
              </Routes>
            </ErrorBoundary>
          </div>
          {process.env.NODE_ENV === 'development' && <RequestMonitor />}
        </main>
      </div>
    </Router>
  );
}

export default App;
