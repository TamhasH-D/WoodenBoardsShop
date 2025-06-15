import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { ToastProvider, useToastContext } from './hooks/useToast';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/UsersPage';
import ProductsPage from './pages/ProductsPage';
import CommunicationPage from './pages/CommunicationPage';
import AnalyticsPage from './pages/AnalyticsPage';
import MediaPage from './pages/MediaPage';

import SystemPage from './pages/SystemPage';
import ApiTestPage from './pages/ApiTestPage';
import ToastContainer from './components/ui/ToastContainer';

// Toast-aware App component
function AppWithToast() {
  const { toasts, removeToast } = useToastContext();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <AdminLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users/*" element={<UsersPage />} />
            <Route path="/products/*" element={<ProductsPage />} />
            <Route path="/communication/*" element={<CommunicationPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/media/*" element={<MediaPage />} />

            <Route path="/system/*" element={<SystemPage />} />
            <Route path="/api-test" element={<ApiTestPage />} />
          </Routes>
        </AdminLayout>

        {/* Professional Toast System */}
        <ToastContainer
          toasts={toasts}
          onRemoveToast={removeToast}
          position="top-right"
        />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <AppWithToast />
      </ToastProvider>
    </AppProvider>
  );
}

export default App;
