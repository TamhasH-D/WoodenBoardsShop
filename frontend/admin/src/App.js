import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import keycloak from './keycloak';
import { useAuthStore } from './stores/authStore'; // Import authStore
import ProtectedRoute from './components/auth/ProtectedRoute'; // Import ProtectedRoute
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
      <ProtectedRoute> {/* Protects all routes within AdminLayout */}
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
      </ProtectedRoute>
    </Router>
  );
}

function App() {
  const syncKeycloakState = useAuthStore((state) => state.syncKeycloakState);

  const handleKeycloakEvent = (event, error) => {
    console.log('Keycloak event:', event, error);
    // Potentially sync state on specific events, e.g., onAuthSuccess, onAuthLogout, onTokenExpired
    // The ProtectedRoute's useEffect also handles sync on state changes like authenticated, token.
    if (event === 'onAuthSuccess' || event === 'onAuthLogout' || event === 'onTokenExpired' || event === 'onAuthRefreshSuccess' || event === 'onAuthRefreshError') {
      syncKeycloakState(keycloak);
    }
  };

  const handleKeycloakTokens = (tokens) => {
    // This is called when tokens are refreshed.
    // The keycloak object passed to ReactKeycloakProvider is automatically updated.
    console.log('Keycloak tokens refreshed:', tokens);
    syncKeycloakState(keycloak); // keycloak instance is updated by the provider
  };

  return (
    <ReactKeycloakProvider
      authClient={keycloak}
      initOptions={{ onLoad: 'login-required' }} // Automatically redirect to login if not authenticated
      onEvent={handleKeycloakEvent}
      onTokens={handleKeycloakTokens} // Sync store when tokens are updated
      LoadingComponent={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading Keycloak authentication...</div>}
    >
      <AppProvider>
        <ToastProvider>
          <AppWithToast /> {/* AppWithToast now contains ProtectedRoute */}
        </ToastProvider>
      </AppProvider>
    </ReactKeycloakProvider>
  );
}

export default App;
