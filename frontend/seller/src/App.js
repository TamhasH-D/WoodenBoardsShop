import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import WoodTypesManager from './components/WoodTypesManager';
import Chats from './components/Chats';
import Profile from './components/Profile';
import HealthCheck from './components/HealthCheck';
import ErrorBoundary from './components/ErrorBoundary';
import RequestMonitor from './components/RequestMonitor';
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
          Messages
        </Link>
      </li>
      <li>
        <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`}>
          Profile
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
                Seller Dashboard
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
