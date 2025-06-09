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
  const { sidebarOpen, loading, toggleSidebar } = useApp();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Лоадер */}
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      )}

      {/* Заголовок */}
      <Header />

      {/* Основной контент */}
      <div className="flex">
        <Sidebar />

        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
          <div className="container mx-auto px-4 py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Подвал */}
      <Footer />

      {/* Мобильный оверлей */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

export default Layout;
