import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { CartProvider } from './contexts/CartContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/ErrorBoundary';

// Страницы
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import SellersPage from './pages/SellersPage';
import BoardAnalyzerPage from './pages/BoardAnalyzerPage';
import ChatsPage from './pages/ChatsPage';
import ProfilePage from './pages/ProfilePage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import HealthPage from './pages/HealthPage';

// UI компоненты
import NotificationContainer from './components/ui/NotificationContainer';

import './index.css';

/**
 * Главное приложение buyer frontend
 * Премиум маркетплейс древесины с современной архитектурой
 */
function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <CartProvider>
          <NotificationProvider>
            <Router>
              <Layout>
                <Routes>
                  {/* Главная страница */}
                  <Route path="/" element={<HomePage />} />

                  {/* Каталог товаров */}
                  <Route path="/products/*" element={<ProductsPage />} />

                  {/* Продавцы */}
                  <Route path="/sellers/*" element={<SellersPage />} />

                  {/* Анализатор досок */}
                  <Route path="/analyzer" element={<BoardAnalyzerPage />} />

                  {/* Чаты */}
                  <Route path="/chats/*" element={<ChatsPage />} />

                  {/* Корзина */}
                  <Route path="/cart" element={<CartPage />} />

                  {/* Заказы */}
                  <Route path="/orders/*" element={<OrdersPage />} />

                  {/* Профиль */}
                  <Route path="/profile/*" element={<ProfilePage />} />

                  {/* Проверка здоровья системы */}
                  <Route path="/health" element={<HealthPage />} />
                </Routes>
              </Layout>

              {/* Контейнер уведомлений */}
              <NotificationContainer />
            </Router>
          </NotificationProvider>
        </CartProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
