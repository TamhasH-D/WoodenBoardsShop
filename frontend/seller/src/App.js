import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import WoodTypesManager from './components/WoodTypesManager';
import Chats from './components/Chats';
import BoardAnalyzerNew from './components/BoardAnalyzerNew';
import ErrorBoundary from './components/ErrorBoundary';
import RequestMonitor from './components/RequestMonitor';
import { SELLER_TEXTS } from './utils/localization';
import './index.css';

function Navigation() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Desktop Navigation */}
      <ul className="nav-links desktop-nav">
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
          <Link to="/board-analyzer" className={`nav-link ${isActive('/board-analyzer') ? 'active' : ''}`}>
            🔍 Анализатор досок
          </Link>
        </li>
        <li>
          <Link to="/chats" className={`nav-link ${isActive('/chats') ? 'active' : ''}`}>
            {SELLER_TEXTS.CHATS}
          </Link>
        </li>
      </ul>

      {/* Mobile Menu Button */}
      <button
        className="mobile-menu-button"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Открыть меню"
      >
        <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}></span>
      </button>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="mobile-nav-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <ul className="mobile-nav" onClick={(e) => e.stopPropagation()}>
            <li>
              <Link
                to="/"
                className={`nav-link ${isActive('/') ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {SELLER_TEXTS.DASHBOARD}
              </Link>
            </li>
            <li>
              <Link
                to="/products"
                className={`nav-link ${isActive('/products') ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {SELLER_TEXTS.PRODUCTS}
              </Link>
            </li>
            <li>
              <Link
                to="/wood-types"
                className={`nav-link ${isActive('/wood-types') ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {SELLER_TEXTS.WOOD_TYPES}
              </Link>
            </li>
            <li>
              <Link
                to="/board-analyzer"
                className={`nav-link ${isActive('/board-analyzer') ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                🔍 Анализатор досок
              </Link>
            </li>
            <li>
              <Link
                to="/chats"
                className={`nav-link ${isActive('/chats') ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {SELLER_TEXTS.CHATS}
              </Link>
            </li>
          </ul>
        </div>
      )}
    </>
  );
}

function App() {
  // Auto-refresh functionality removed as it was an unsuccessful experiment

  return (
    <Router>
      <div className="app">
        <header className="header">
          <div className="container">
            <nav className="nav">
              <div className="nav-brand">
                {SELLER_TEXTS.SELLER_DASHBOARD}
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
                <Route path="/board-analyzer" element={<BoardAnalyzerNew />} />
                <Route path="/chats" element={<Chats />} />
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
