import React, { useState, useEffect } from 'react';
import KeycloakService from './services/keycloak';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProfessionalHeader from './components/layout/ProfessionalHeader';
import PrivateRoute from './components/common/PrivateRoute';
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

function App() {
  const [keycloakInitialized, setKeycloakInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    KeycloakService.initKeycloak()
      .then((authStatus) => {
        setIsAuthenticated(authStatus);
        setKeycloakInitialized(true);
      })
      .catch((error) => {
        console.error("App: Keycloak initialization error", error);
        setIsAuthenticated(false); // Assume not authenticated on error
        setKeycloakInitialized(true); // Mark as initialized to not block app
      });
  }, []); // Empty dependency array ensures this runs only once on mount

  if (!keycloakInitialized) {
    return <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2em' }}>Loading Authentication...</div>;
  }

  return (
    <ErrorBoundary>
      <AppProvider>
        <NotificationProvider>
          <Router>
            <div className="app">
              <ProfessionalHeader isAuthenticated={isAuthenticated} />

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
                  <Route path="/chats/*" element={<PrivateRoute><ChatsPage /></PrivateRoute>} />
                  <Route path="/orders/*" element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
                  <Route path="/profile/*" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
                  <Route path="/health" element={<HealthPage />} />
                </Routes>
              </main>
            </div>
            <NotificationContainer />
          </Router>
        </NotificationProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
