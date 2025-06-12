import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import '../../styles/professional.css';

const ProfessionalLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const getPageTitle = () => {
    const path = location.pathname;
    const titles = {
      '/': 'Панель управления',
      '/users': 'Управление пользователями',
      '/products': 'Управление товарами',
      '/orders': 'Управление заказами',
      '/sellers': 'Управление продавцами',
      '/chats': 'Управление чатами',
      '/analytics': 'Аналитика',
      '/settings': 'Настройки системы'
    };
    return titles[path] || 'Административная панель';
  };

  // Professional SVG Icons
  const icons = {
    dashboard: (
      <svg className="nav-icon" fill="currentColor" viewBox="0 0 20 20">
        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
      </svg>
    ),
    users: (
      <svg className="nav-icon" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
      </svg>
    ),
    products: (
      <svg className="nav-icon" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V7l-7-5z" clipRule="evenodd" />
      </svg>
    ),
    orders: (
      <svg className="nav-icon" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 12a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    ),
    sellers: (
      <svg className="nav-icon" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
      </svg>
    ),
    chats: (
      <svg className="nav-icon" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
      </svg>
    ),
    analytics: (
      <svg className="nav-icon" fill="currentColor" viewBox="0 0 20 20">
        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
      </svg>
    ),
    settings: (
      <svg className="nav-icon" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
      </svg>
    ),
    menu: (
      <svg className="header-icon" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    )
  };

  const navigationItems = [
    { path: '/', label: 'Панель управления', icon: 'dashboard' },
    { path: '/users', label: 'Пользователи', icon: 'users' },
    { path: '/products', label: 'Товары', icon: 'products' },
    { path: '/orders', label: 'Заказы', icon: 'orders' },
    { path: '/sellers', label: 'Продавцы', icon: 'sellers' },
    { path: '/chats', label: 'Чаты', icon: 'chats' },
    { path: '/analytics', label: 'Аналитика', icon: 'analytics' },
    { path: '/settings', label: 'Настройки', icon: 'settings' }
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          WoodMarket Admin
        </div>
        
        <nav>
          <ul className="nav-menu">
            {navigationItems.map((item) => (
              <li key={item.path} className="nav-item">
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  end={item.path === '/'}
                  onClick={() => setSidebarOpen(false)}
                >
                  {icons[item.icon]}
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`main-content ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <button
              className="mobile-menu-toggle"
              onClick={toggleSidebar}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
            <h1 className="header-title">{getPageTitle()}</h1>
          </div>
          
          <div className="header-actions">
            <span className="text-sm text-muted">
              {new Date().toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ padding: 'var(--space-6)' }}>
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 5,
            display: window.innerWidth <= 768 ? 'block' : 'none'
          }}
        />
      )}
    </div>
  );
};

export default ProfessionalLayout;
