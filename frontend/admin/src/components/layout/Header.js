import React from 'react';
import { useApp } from '../../contexts/AppContext';
import Button from '../ui/Button';
import './Header.css';

/**
 * Header component with navigation controls and user info
 */
const Header = () => {
  const { 
    pageTitle, 
    toggleSidebar, 
    toggleMobileMenu, 
    sidebarCollapsed,
    backendStatus,
    theme,
    setTheme
  } = useApp();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="header">
      <div className="header__left">
        {/* Mobile menu toggle */}
        <Button
          variant="ghost"
          size="medium"
          onClick={toggleMobileMenu}
          className="header__mobile-toggle"
          icon="☰"
          ariaLabel="Toggle mobile menu"
        />
        
        {/* Desktop sidebar toggle */}
        <Button
          variant="ghost"
          size="medium"
          onClick={toggleSidebar}
          className="header__sidebar-toggle"
          icon={sidebarCollapsed ? '▶' : '◀'}
          ariaLabel={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        />
        
        <h1 className="header__title">{pageTitle}</h1>
      </div>
      
      <div className="header__right">
        {/* Backend status indicator */}
        <div className={`header__status ${backendStatus.online ? 'header__status--online' : 'header__status--offline'}`}>
          <span className="header__status-indicator" aria-hidden="true">
            {backendStatus.online ? '🟢' : '🔴'}
          </span>
          <span className="header__status-text">
            {backendStatus.online ? 'Online' : 'Offline'}
          </span>
        </div>
        
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="medium"
          onClick={toggleTheme}
          icon={theme === 'light' ? '🌙' : '☀️'}
          ariaLabel={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        />
        
        {/* User menu placeholder */}
        <div className="header__user">
          <div className="header__user-avatar" aria-hidden="true">
            👤
          </div>
          <div className="header__user-info">
            <span className="header__user-name">Admin User</span>
            <span className="header__user-role">Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
