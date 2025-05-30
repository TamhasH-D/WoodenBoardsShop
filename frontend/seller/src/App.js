import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';

// Context
import { AuthProvider } from './context/AuthContext';

// Layout and Pages
import SellerLayout from './components/SellerLayout';
import SellerDashboard from './components/SellerDashboard';
import SellerProducts from './components/SellerProducts';
import SellerOrders from './components/SellerOrders';
import SellerSettings from './components/SellerSettings';
import SellerChat from './components/SellerChat';
import ProductForm from './components/ProductForm';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-gray-100">
            <Routes>
              <Route path="/" element={<SellerLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<SellerDashboard />} />
                <Route path="products" element={<SellerProducts />} />
                <Route path="products/new" element={<ProductForm />} />
                <Route path="products/edit/:id" element={<ProductForm />} />
                <Route path="orders" element={<SellerOrders />} />
                <Route path="chat" element={<SellerChat />} />
                <Route path="chat/:threadId" element={<SellerChat />} />
                <Route path="settings" element={<SellerSettings />} />
              </Route>
            </Routes>
            <ToastContainer position="top-right" autoClose={3000} />
          </div>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;