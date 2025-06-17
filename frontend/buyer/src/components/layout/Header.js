import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';

/**
 * Чистый Header для buyer frontend
 * Профессиональный дизайн
 * Мемоизирован для предотвращения избыточных re-renders
 */
const Header = React.memo(() => {
  const { backendStatus } = useApp();

  return (
    <header className="header" style={{ position: 'relative', zIndex: 100000 }}>
      <div className="container">
        <nav className="nav">
          {/* Левая часть */}
          <div className="flex items-center gap-4">
            <Link to="/" className="nav-brand">
              WoodMarket
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginLeft: '0.5rem' }}>
                Покупатель
              </span>
            </Link>
          </div>

          {/* Центральная часть - поиск */}
          <div style={{ flex: 1, maxWidth: '32rem', margin: '0 1rem' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Поиск товаров..."
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
              />
              <span style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af'
              }}>
                🔍
              </span>
            </div>
          </div>

          {/* Правая часть */}
          <div className="flex items-center gap-4">
            {/* Статус подключения */}
            <div className="flex items-center gap-2">
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: backendStatus?.online ? '#22c55e' : '#ef4444'
              }}></div>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                {backendStatus?.online ? 'Онлайн' : 'Офлайн'}
              </span>
            </div>

            {/* Чаты */}
            <Link
              to="/chats"
              style={{
                position: 'relative',
                padding: '0.5rem',
                color: '#6b7280',
                textDecoration: 'none'
              }}
            >
              💬
            </Link>

            {/* Меню пользователя */}
            <button style={{ padding: '0.5rem', color: '#6b7280' }}>
              👤
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;
