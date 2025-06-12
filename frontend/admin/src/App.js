import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/UsersPage';
import ProductsPage from './pages/ProductsPage';
import CommunicationPage from './pages/CommunicationPage';
import AnalyticsPage from './pages/AnalyticsPage';
import MediaPage from './pages/MediaPage';
import ToolsPage from './pages/ToolsPage';
import SystemPage from './pages/SystemPage';
import ApiTestPage from './pages/ApiTestPage';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AppProvider>
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
              <Route path="/tools/*" element={<ToolsPage />} />
              <Route path="/system/*" element={<SystemPage />} />
              <Route path="/api-test" element={<ApiTestPage />} />
            </Routes>
          </AdminLayout>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#374151',
                color: '#fff',
              },
            }}
          />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
