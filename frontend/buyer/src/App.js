import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider, useBuyerAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProfessionalHeader from './components/layout/ProfessionalHeader';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import SellersPage from './pages/SellersPage';
import BoardAnalyzerPage from './pages/BoardAnalyzerPage';
import ChatsPage from './pages/ChatsPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import HealthPage from './pages/HealthPage';
import NotificationContainer from './components/ui/NotificationContainer';
import APITestPanel from './components/debug/APITestPanel';
import { AuthCallback } from './components/auth';
import './index.css';



function AppContent() {
  const auth = useBuyerAuth();

  // Экспортируем контекст аутентификации в глобальную область для API сервиса
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__BUYER_AUTH_CONTEXT__ = auth;
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete window.__BUYER_AUTH_CONTEXT__;
      }
    };
  }, [auth]);

  return (
    <div className="app">
      <ProfessionalHeader />

      <main style={{
        minHeight: 'calc(100vh - 64px)',
        backgroundColor: '#f8fafc'
      }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:productId" element={<ProductDetailPage />} />
          <Route path="/sellers/*" element={<SellersPage />} />
          <Route path="/analyzer" element={<BoardAnalyzerPage />} />
          <Route path="/chats/*" element={<ChatsPage />} />
          <Route path="/orders/*" element={<OrdersPage />} />
          <Route path="/profile/*" element={<ProfilePage />} />
          <Route path="/health" element={<HealthPage />} />

          {/* Маршрут для обработки callback'а от Keycloak */}
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <NotificationProvider>
            <Router>
              <AppContent />
              <NotificationContainer />
              <APITestPanel />
            </Router>
          </NotificationProvider>
        </AppProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
