import React, { Suspense } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { ToastContainer } from 'react-toastify';
import { ErrorBoundary } from 'react-error-boundary';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { AuthProvider } from './contexts/AuthContext';

// Layout
import AdminLayout from './components/layout/AdminLayout';

// Components
import LoadingSpinner from './components/ui/LoadingSpinner';

// Pages
import AdminDashboard from './components/pages/Dashboard';

// User Management
import BuyersList from './components/pages/buyers/BuyersList';
import BuyerDetails from './components/pages/buyers/BuyerDetails';
import BuyerForm from './components/pages/buyers/BuyerForm';

import SellersList from './components/pages/sellers/SellersList';
import SellerDetails from './components/pages/sellers/SellerDetails';
import SellerForm from './components/pages/sellers/SellerForm';

// Product Management
import ProductsList from './components/pages/products/ProductsList';
import ProductDetails from './components/pages/products/ProductDetails';
import ProductForm from './components/pages/products/ProductForm';

// Wood Types Management
import WoodTypesList from './components/pages/woodTypes/WoodTypesList';
import WoodTypeDetails from './components/pages/woodTypes/WoodTypeDetails';
import WoodTypeForm from './components/pages/woodTypes/WoodTypeForm';

// Wood Type Prices Management
import WoodTypePricesList from './components/pages/woodTypePrices/WoodTypePricesList';
import WoodTypePriceDetails from './components/pages/woodTypePrices/WoodTypePriceDetails';
import WoodTypePriceForm from './components/pages/woodTypePrices/WoodTypePriceForm';

// Wooden Boards Management
import WoodenBoardsList from './components/pages/woodenBoards/WoodenBoardsList';
import WoodenBoardDetails from './components/pages/woodenBoards/WoodenBoardDetails';
import WoodenBoardForm from './components/pages/woodenBoards/WoodenBoardForm';

// Images Management
import ImagesList from './components/pages/images/ImagesList';
import ImageDetails from './components/pages/images/ImageDetails';
import ImageForm from './components/pages/images/ImageForm';

// Chat Management
import ChatThreadsList from './components/pages/chat/ChatThreadsList';
import ChatThreadDetails from './components/pages/chat/ChatThreadDetails';
import ChatMessagesList from './components/pages/chat/ChatMessagesList';

// Settings
import AdminSettings from './components/pages/settings/Settings';
import SystemHealth from './components/pages/settings/SystemHealth';

// Create a client with enhanced configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

// Error Fallback Component
const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <div className="text-6xl mb-4">💥</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Что-то пошло не так</h2>
        <p className="text-gray-600 mb-6">
          Произошла неожиданная ошибка. Попробуйте обновить страницу.
        </p>
        <div className="space-x-4">
          <button
            onClick={resetErrorBoundary}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Попробовать снова
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Обновить страницу
          </button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500">
              Детали ошибки (только в режиме разработки)
            </summary>
            <pre className="mt-2 text-xs text-red-600 bg-red-50 p-4 rounded overflow-auto">
              {error.message}
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

// Loading Fallback Component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <LoadingSpinner size="xl" text="Загрузка..." />
  </div>
);

function App() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Application Error:', error, errorInfo);
        // Here you could send error to monitoring service
      }}
    >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="dashboard" element={<AdminDashboard />} />

                  {/* Buyers Routes */}
                  <Route path="buyers">
                    <Route index element={<BuyersList />} />
                    <Route path=":id" element={<BuyerDetails />} />
                    <Route path="new" element={<BuyerForm />} />
                    <Route path="edit/:id" element={<BuyerForm />} />
                  </Route>

                  {/* Sellers Routes */}
                  <Route path="sellers">
                    <Route index element={<SellersList />} />
                    <Route path=":id" element={<SellerDetails />} />
                    <Route path="new" element={<SellerForm />} />
                    <Route path="edit/:id" element={<SellerForm />} />
                  </Route>

                  {/* Products Routes */}
                  <Route path="products">
                    <Route index element={<ProductsList />} />
                    <Route path=":id" element={<ProductDetails />} />
                    <Route path="new" element={<ProductForm />} />
                    <Route path="edit/:id" element={<ProductForm />} />
                  </Route>

                  {/* Wood Types Routes */}
                  <Route path="wood-types">
                    <Route index element={<WoodTypesList />} />
                    <Route path=":id" element={<WoodTypeDetails />} />
                    <Route path="new" element={<WoodTypeForm />} />
                    <Route path="edit/:id" element={<WoodTypeForm />} />
                  </Route>

                  {/* Wood Type Prices Routes */}
                  <Route path="wood-type-prices">
                    <Route index element={<WoodTypePricesList />} />
                    <Route path=":id" element={<WoodTypePriceDetails />} />
                    <Route path="new" element={<WoodTypePriceForm />} />
                    <Route path="edit/:id" element={<WoodTypePriceForm />} />
                  </Route>

                  {/* Wooden Boards Routes */}
                  <Route path="wooden-boards">
                    <Route index element={<WoodenBoardsList />} />
                    <Route path=":id" element={<WoodenBoardDetails />} />
                    <Route path="new" element={<WoodenBoardForm />} />
                    <Route path="edit/:id" element={<WoodenBoardForm />} />
                  </Route>

                  {/* Images Routes */}
                  <Route path="images">
                    <Route index element={<ImagesList />} />
                    <Route path=":id" element={<ImageDetails />} />
                    <Route path="new" element={<ImageForm />} />
                    <Route path="edit/:id" element={<ImageForm />} />
                  </Route>

                  {/* Chat Routes */}
                  <Route path="chat">
                    <Route index element={<ChatThreadsList />} />
                    <Route path="threads/:id" element={<ChatThreadDetails />} />
                    <Route path="messages" element={<ChatMessagesList />} />
                  </Route>

                  {/* Settings Routes */}
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="system-health" element={<SystemHealth />} />
                </Route>
              </Routes>
            </Suspense>

            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
              toastClassName="toast-custom"
              bodyClassName="toast-body"
              progressClassName="toast-progress"
            />
          </AuthProvider>
        </BrowserRouter>
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;