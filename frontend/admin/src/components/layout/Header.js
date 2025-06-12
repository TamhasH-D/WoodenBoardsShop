import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

/**
 * Enterprise Header для admin frontend
 * Строгий корпоративный дизайн без лишних элементов
 */
const Header = React.memo(() => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="container">
        <nav className="nav">
          <Link to="/" className="nav-brand">
            Административная панель
          </Link>
          
          <button 
            className="mobile-menu-toggle"
            onClick={toggleMenu}
            aria-label="Переключить меню"
            style={{
              display: 'none',
              flexDirection: 'column',
              gap: '3px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 'var(--space-2)'
            }}
          >
            <span style={{
              width: '20px',
              height: '2px',
              backgroundColor: 'var(--color-text-primary)',
              transition: 'all var(--transition-fast)'
            }}></span>
            <span style={{
              width: '20px',
              height: '2px',
              backgroundColor: 'var(--color-text-primary)',
              transition: 'all var(--transition-fast)'
            }}></span>
            <span style={{
              width: '20px',
              height: '2px',
              backgroundColor: 'var(--color-text-primary)',
              transition: 'all var(--transition-fast)'
            }}></span>
          </button>

          <ul className={`nav-links ${isMenuOpen ? 'nav-links-open' : ''}`}>
            <li>
              <NavLink 
                to="/" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                end
              >
                Главная
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/users" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                Пользователи
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/products" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                Товары
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/orders" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                Заказы
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/sellers" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                Продавцы
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/chats" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                Чаты
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/analytics" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                Аналитика
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/settings" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                Настройки
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;
