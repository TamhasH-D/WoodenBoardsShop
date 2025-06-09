import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import SellersPage from './pages/SellersPage';
import BoardAnalyzerPage from './pages/BoardAnalyzerPage';
import ChatsPage from './pages/ChatsPage';
import ProfilePage from './pages/ProfilePage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import HealthPage from './pages/HealthPage';
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
        <Link to="/products" className={`nav-link ${isActive('/products') ? 'active' : ''}`}>
          📦 Каталог
        </Link>
      </li>
      <li>
        <Link to="/sellers" className={`nav-link ${isActive('/sellers') ? 'active' : ''}`}>
          🏪 Продавцы
        </Link>
      </li>
      <li>
        <Link to="/analyzer" className={`nav-link ${isActive('/analyzer') ? 'active' : ''}`}>
          📐 Анализатор досок
        </Link>
      </li>
      <li>
        <Link to="/chats" className={`nav-link ${isActive('/chats') ? 'active' : ''}`}>
          💬 Сообщения
        </Link>
      </li>
      <li>
        <Link to="/cart" className={`nav-link ${isActive('/cart') ? 'active' : ''}`}>
          🛒 Корзина
        </Link>
      </li>
      <li>
        <Link to="/orders" className={`nav-link ${isActive('/orders') ? 'active' : ''}`}>
          📋 Заказы
        </Link>
      </li>
      <li>
        <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`}>
          👤 Профиль
        </Link>
      </li>
      <li>
        <Link to="/health" className={`nav-link ${isActive('/health') ? 'active' : ''}`}>
          🏥 Здоровье системы
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
                  🌲 WoodMarket - Покупатель
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
              <Route path="/" element={<HomePage />} />
              <Route path="/products/*" element={<ProductsPage />} />
              <Route path="/sellers/*" element={<SellersPage />} />
              <Route path="/analyzer" element={<BoardAnalyzerPage />} />
              <Route path="/chats/*" element={<ChatsPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/orders/*" element={<OrdersPage />} />
              <Route path="/profile/*" element={<ProfilePage />} />
              <Route path="/health" element={<HealthPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
