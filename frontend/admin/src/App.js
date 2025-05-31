import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/UsersPage';
import ProductsPage from './pages/ProductsPage';
import MediaPage from './pages/MediaPage';
import CommunicationPage from './pages/CommunicationPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ToolsPage from './pages/ToolsPage';
import SystemPage from './pages/SystemPage';
import NotificationContainer from './components/ui/NotificationContainer';

/**
 * Main application component with modern architecture
 */

function App() {
  return (
    <AppProvider>
      <NotificationProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Dashboard */}
              <Route path="/" element={<Dashboard />} />

              {/* User Management */}
              <Route path="/users/*" element={<UsersPage />} />

              {/* Product Management */}
              <Route path="/products/*" element={<ProductsPage />} />

              {/* Media Management */}
              <Route path="/media/*" element={<MediaPage />} />

              {/* Communication Management */}
              <Route path="/communication/*" element={<CommunicationPage />} />

              {/* Analytics */}
              <Route path="/analytics/*" element={<AnalyticsPage />} />

              {/* Tools */}
              <Route path="/tools/*" element={<ToolsPage />} />

              {/* System */}
              <Route path="/system/*" element={<SystemPage />} />
            </Routes>
          </Layout>
          <NotificationContainer />
        </Router>
      </NotificationProvider>
    </AppProvider>
  );
}

export default App;
