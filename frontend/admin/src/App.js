import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';
import ProductManagement from './components/ProductManagement';
import WoodTypesManagement from './components/WoodTypesManagement';
import ChatModeration from './components/ChatModeration';
import SystemSettings from './components/SystemSettings';
import Analytics from './components/Analytics';
import HealthMonitoring from './components/HealthMonitoring';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

function Navigation() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <ul className="nav-links">
      <li>
        <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
          Dashboard
        </Link>
      </li>
      <li>
        <Link to="/users" className={`nav-link ${isActive('/users') ? 'active' : ''}`}>
          Users
        </Link>
      </li>
      <li>
        <Link to="/products" className={`nav-link ${isActive('/products') ? 'active' : ''}`}>
          Products
        </Link>
      </li>
      <li>
        <Link to="/wood-types" className={`nav-link ${isActive('/wood-types') ? 'active' : ''}`}>
          Wood Types
        </Link>
      </li>
      <li>
        <Link to="/chats" className={`nav-link ${isActive('/chats') ? 'active' : ''}`}>
          Chats
        </Link>
      </li>
      <li>
        <Link to="/analytics" className={`nav-link ${isActive('/analytics') ? 'active' : ''}`}>
          Analytics
        </Link>
      </li>
      <li>
        <Link to="/settings" className={`nav-link ${isActive('/settings') ? 'active' : ''}`}>
          Settings
        </Link>
      </li>
      <li>
        <Link to="/health" className={`nav-link ${isActive('/health') ? 'active' : ''}`}>
          Health
        </Link>
      </li>
    </ul>
  );
}

function App() {
  return (
    <Router>
      <div className="app">
        <header className="header">
          <div className="container">
            <nav className="nav">
              <div className="nav-brand">
                Admin Dashboard
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
                <Route path="/users" element={<UserManagement />} />
                <Route path="/products" element={<ProductManagement />} />
                <Route path="/wood-types" element={<WoodTypesManagement />} />
                <Route path="/chats" element={<ChatModeration />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<SystemSettings />} />
                <Route path="/health" element={<HealthMonitoring />} />
              </Routes>
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
