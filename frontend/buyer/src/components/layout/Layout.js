import React from 'react';
import { useApp } from '../../contexts/AppContext';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

/**
 * Основной Layout компонент для buyer frontend
 * Чистый и функциональный дизайн
 */
const Layout = ({ children }) => {
  const { loading } = useApp();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Лоадер */}
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="loading">Загрузка...</div>
        </div>
      )}

      {/* Заголовок */}
      <Header />

      {/* Основной контент с боковой панелью */}
      <div style={{ display: 'flex' }}>
        <Sidebar />

        <main className="main" style={{ flex: 1 }}>
          <div className="container">
            {children}
          </div>
        </main>
      </div>

      {/* Подвал */}
      <Footer />
    </div>
  );
};

export default Layout;
