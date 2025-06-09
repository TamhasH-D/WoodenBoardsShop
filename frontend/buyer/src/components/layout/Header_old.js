import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useCart } from '../../contexts/CartContext';
import { BUYER_TEXTS } from '../../utils/localization';
import SearchBar from '../ui/SearchBar';
import CartButton from '../ui/CartButton';
import UserMenu from '../ui/UserMenu';
import ThemeToggle from '../ui/ThemeToggle';

/**
 * Премиум Header с glassmorphism эффектами
 * Включает поиск, корзину, меню пользователя
 */
const Header = () => {
  const { toggleSidebar, pageTitle, backendStatus } = useApp();
  const { totalItems } = useCart();
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="header-premium">
      {/* Фоновые эффекты */}
      <div className="header-bg">
        <div className="header-gradient" />
        <div className="header-pattern" />
      </div>
      
      {/* Основной контент заголовка */}
      <div className="header-content">
        <div className="container">
          <div className="header-inner">
            
            {/* Левая секция - Логотип и меню */}
            <div className="header-left">
              {/* Кнопка меню для мобильных */}
              <button
                className="menu-toggle"
                onClick={toggleSidebar}
                aria-label="Открыть меню"
              >
                <span className="menu-icon">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </button>
              
              {/* Логотип */}
              <div className="logo">
                <div className="logo-icon">🌲</div>
                <div className="logo-text">
                  <h1 className="logo-title">WoodMarket</h1>
                  <span className="logo-subtitle">{BUYER_TEXTS.MARKETPLACE}</span>
                </div>
              </div>
            </div>
            
            {/* Центральная секция - Поиск */}
            <div className={`header-center ${searchFocused ? 'search-focused' : ''}`}>
              <SearchBar 
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </div>
            
            {/* Правая секция - Действия */}
            <div className="header-right">
              {/* Статус подключения */}
              <div className="connection-status">
                <div className={`status-indicator ${backendStatus?.online ? 'online' : 'offline'}`}>
                  <span className="status-dot"></span>
                  <span className="status-text">
                    {backendStatus?.online ? BUYER_TEXTS.ONLINE : BUYER_TEXTS.OFFLINE}
                  </span>
                </div>
              </div>
              
              {/* Переключатель темы */}
              <ThemeToggle />
              
              {/* Корзина */}
              <CartButton itemCount={totalItems} />
              
              {/* Меню пользователя */}
              <UserMenu />
            </div>
          </div>
        </div>
      </div>
      
      {/* Индикатор страницы */}
      <div className="page-indicator">
        <div className="container">
          <div className="page-breadcrumb">
            <span className="page-title">{pageTitle}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
