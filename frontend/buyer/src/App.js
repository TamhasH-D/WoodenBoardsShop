import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { NotificationProvider } from './contexts/NotificationContext';
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
import './index.css';

// Main App component
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider> {/* AuthProvider is the outermost context provider */}
        <ProfileErrorDisplay /> {/* This component now correctly uses useAuth from the AuthProvider above */}
        <AppProvider>
          <NotificationProvider>
            <Router>
              <div className="app">
                <ProfessionalHeader />
                <main style={{
                  minHeight: 'calc(100vh - 64px)', // Consider adjusting if ProfileErrorDisplay affects layout due to its height
                  backgroundColor: '#f8fafc',
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
                  </Routes>
                </main>
              </div>
              <NotificationContainer />
            </Router>
          </NotificationProvider>
        </AppProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
