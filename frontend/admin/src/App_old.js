import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/UsersPage';
import ProductsPage from './pages/ProductsPage';
import CommunicationPage from './pages/CommunicationPage';
import MediaPage from './pages/MediaPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ToolsPage from './pages/ToolsPage';
import SystemPage from './pages/SystemPage';
import NotificationContainer from './components/ui/NotificationContainer';
import './index.css';

/**
 * Главное приложение административной панели
 * Корпоративная панель управления для системы деревянных досок
 */
function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <NotificationProvider>
          <Router>
            <Layout>
              <Routes>
                {/* Главная панель управления */}
                <Route path="/" element={<Dashboard />} />

                {/* Управление пользователями */}
                <Route path="/users/*" element={<UsersPage />} />

                {/* Управление товарами */}
                <Route path="/products/*" element={<ProductsPage />} />

                {/* Коммуникации */}
                <Route path="/communication/*" element={<CommunicationPage />} />

                {/* Медиа */}
                <Route path="/media/*" element={<MediaPage />} />

                {/* Аналитика */}
                <Route path="/analytics" element={<AnalyticsPage />} />

                {/* Инструменты */}
                <Route path="/tools/*" element={<ToolsPage />} />

                {/* Система */}
                <Route path="/system/*" element={<SystemPage />} />
              </Routes>
            </Layout>

            {/* Контейнер уведомлений */}
            <NotificationContainer />
          </Router>
        </NotificationProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
