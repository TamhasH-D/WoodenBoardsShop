import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Pages
import MainPage from './pages/MainPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import WoodTypesPage from './pages/WoodTypesPage';
import CalculatorPage from './pages/CalculatorPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import CartPage from './pages/CartPage';
import ChatPage from './pages/ChatPage';
import NotFoundPage from './pages/NotFoundPage';

// Context Providers
import { ApiProvider } from './context/ApiContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <Router>
      <ApiProvider>
        <AuthProvider>
          <CartProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<MainPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/wood-types" element={<WoodTypesPage />} />
              <Route path="/calculator" element={<CalculatorPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/cart" element={<CartPage />} />

              {/* Protected Routes */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/chat" element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              } />
              <Route path="/chat/:sellerId" element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              } />

              {/* Fallback route for 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </ApiProvider>
    </Router>
  );
}

export default App;