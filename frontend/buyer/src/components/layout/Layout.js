import React from 'react';
import { useApp } from '../../contexts/AppContext';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import LoadingOverlay from '../ui/LoadingOverlay';

/**
 * Премиум Layout компонент для buyer frontend
 * Glassmorphism дизайн с адаптивной структурой
 */
const Layout = ({ children }) => {
  const { sidebarOpen, loading } = useApp();

  return (
    <div className="layout">
      {/* Глобальный лоадер */}
      {loading && <LoadingOverlay />}
      
      {/* Основная структура */}
      <div className="layout-container">
        {/* Заголовок */}
        <Header />
        
        {/* Основной контент */}
        <div className="layout-main">
          {/* Боковая панель */}
          <Sidebar />
          
          {/* Контентная область */}
          <main className={`layout-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
            <div className="content-wrapper">
              {children}
            </div>
          </main>
        </div>
        
        {/* Подвал */}
        <Footer />
      </div>
      
      {/* Оверлей для мобильной боковой панели */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => {}}
        />
      )}
    </div>
  );
};

export default Layout;
