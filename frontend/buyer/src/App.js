import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { CartProvider } from './contexts/CartContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProfessionalHeader from './components/layout/ProfessionalHeader';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import SellersPage from './pages/SellersPage';
import BoardAnalyzerPage from './pages/BoardAnalyzerPage';
import ChatsPage from './pages/ChatsPage';
import ProfilePage from './pages/ProfilePage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import HealthPage from './pages/HealthPage';
import NotificationContainer from './components/ui/NotificationContainer';
import './index.css';



function AppContent() {
  return (
    <div className="app">
      <ProfessionalHeader />

      <main style={{
        minHeight: 'calc(100vh - 64px)',
        backgroundColor: '#f8fafc'
      }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products/*" element={<ProductsPage />} />
          <Route path="/sellers/*" element={<SellersPage />} />
          <Route path="/analyzer" element={<BoardAnalyzerPage />} />
          <Route path="/chats/*" element={<ChatsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders/*" element={<OrdersPage />} />
          <Route path="/profile/*" element={<ProfilePage />} />
          <Route path="/health" element={<HealthPage />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <CartProvider>
          <NotificationProvider>
            <Router>
              <AppContent />
              <NotificationContainer />
            </Router>
          </NotificationProvider>
        </CartProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
