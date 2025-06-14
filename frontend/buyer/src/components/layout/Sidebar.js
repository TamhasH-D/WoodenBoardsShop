import React from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Чистая боковая панель навигации
 * Профессиональный дизайн
 */
const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const navigationItems = [
    { path: '/', label: 'Главная', icon: '🏠' },
    { path: '/products', label: 'Каталог', icon: '📦' },
    { path: '/sellers', label: 'Продавцы', icon: '🏪' },
    { path: '/analyzer', label: 'Анализатор досок', icon: '📐' },
    { path: '/chats', label: 'Сообщения', icon: '💬' },
    { path: '/orders', label: 'Заказы', icon: '📋' },
    { path: '/profile', label: 'Профиль', icon: '👤' }
  ];

  return (
    <aside style={{
      width: '250px',
      backgroundColor: 'white',
      borderRight: '1px solid #e5e7eb',
      padding: '1rem',
      height: 'calc(100vh - 80px)',
      position: 'sticky',
      top: '80px'
    }}>
      <nav>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {navigationItems.map((item) => (
            <li key={item.path} style={{ marginBottom: '0.5rem' }}>
              <Link
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  textDecoration: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: isActive(item.path) ? 'var(--color-primary)' : '#374151',
                  backgroundColor: isActive(item.path) ? '#dbeafe' : 'transparent',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!isActive(item.path)) {
                    e.target.style.backgroundColor = '#f3f4f6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(item.path)) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge > 0 && (
                  <span style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    fontSize: '0.75rem',
                    borderRadius: '9999px',
                    padding: '0.25rem 0.5rem',
                    minWidth: '20px',
                    textAlign: 'center'
                  }}>
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
