import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { useCart } from '../../contexts/CartContext';
import { BUYER_TEXTS } from '../../utils/localization';

/**
 * Премиум боковая панель навигации
 * Glassmorphism дизайн с анимированными ссылками
 */
const Sidebar = () => {
  const { sidebarOpen, toggleSidebar } = useApp();
  const { totalItems } = useCart();
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const navigationItems = [
    { path: '/', label: BUYER_TEXTS.HOME, icon: '🏠' },
    { path: '/products', label: BUYER_TEXTS.PRODUCTS, icon: '🌲' },
    { path: '/sellers', label: BUYER_TEXTS.SELLERS, icon: '🏪' },
    { path: '/analyzer', label: BUYER_TEXTS.BOARD_ANALYZER, icon: '📐' },
    { path: '/chats', label: BUYER_TEXTS.CHATS, icon: '💬' },
    { path: '/cart', label: BUYER_TEXTS.CART, icon: '🛒', badge: totalItems },
    { path: '/orders', label: BUYER_TEXTS.ORDERS, icon: '📦' },
    { path: '/profile', label: BUYER_TEXTS.PROFILE, icon: '👤' }
  ];

  return (
    <>
      {/* Боковая панель */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <nav className="sidebar-nav">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => window.innerWidth <= 768 && toggleSidebar()}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
              {item.badge > 0 && (
                <span className="sidebar-badge">{item.badge}</span>
              )}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
