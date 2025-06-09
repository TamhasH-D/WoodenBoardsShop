import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/UsersPage';
import ProductsPage from './pages/ProductsPage';
import CommunicationPage from './pages/CommunicationPage';
import MediaPage from './pages/MediaPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ToolsPage from './pages/ToolsPage';
import SystemPage from './pages/SystemPage';
import './index.css';

function Navigation() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <ul className="nav-links">
      <li>
        <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
          🏠 Главная
        </Link>
      </li>
      <li>
        <Link to="/users" className={`nav-link ${isActive('/users') ? 'active' : ''}`}>
          👥 Пользователи
        </Link>
      </li>
      <li>
        <Link to="/products" className={`nav-link ${isActive('/products') ? 'active' : ''}`}>
          📦 Товары
        </Link>
      </li>
      <li>
        <Link to="/communication" className={`nav-link ${isActive('/communication') ? 'active' : ''}`}>
          💬 Коммуникации
        </Link>
      </li>
      <li>
        <Link to="/media" className={`nav-link ${isActive('/media') ? 'active' : ''}`}>
          🖼️ Медиа
        </Link>
      </li>
      <li>
        <Link to="/analytics" className={`nav-link ${isActive('/analytics') ? 'active' : ''}`}>
          📊 Аналитика
        </Link>
      </li>
      <li>
        <Link to="/tools" className={`nav-link ${isActive('/tools') ? 'active' : ''}`}>
          🔧 Инструменты
        </Link>
      </li>
      <li>
        <Link to="/system" className={`nav-link ${isActive('/system') ? 'active' : ''}`}>
          ⚙️ Система
        </Link>
      </li>
    </ul>
  );
}

function App() {
  const [onlineStatus] = useState({
    isOnline: true,
    lastActivity: new Date().toLocaleTimeString(),
    error: null
  });

  return (
    <Router>
      <div className="app">
        <header className="header">
          <div className="container">
            <nav className="nav">
              <div className="nav-brand">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🛡️ Админ-панель WoodMarket
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
                    {onlineStatus.isOnline ? '🟢 Онлайн' : '🔴 Офлайн'}
                  </span>
                </div>
              </div>
              <Navigation />
            </nav>
          </div>
        </header>

        <main className="main">
          <div className="container">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/users/*" element={<UsersPage />} />
              <Route path="/products/*" element={<ProductsPage />} />
              <Route path="/communication/*" element={<CommunicationPage />} />
              <Route path="/media/*" element={<MediaPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/tools/*" element={<ToolsPage />} />
              <Route path="/system/*" element={<SystemPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
