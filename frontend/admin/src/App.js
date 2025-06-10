import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProfessionalLayout from './components/layout/ProfessionalLayout';
import ProfessionalDashboard from './pages/ProfessionalDashboard';
import UsersPage from './pages/UsersPage';
import ProductsPage from './pages/ProductsPage';
import CommunicationPage from './pages/CommunicationPage';
import MediaPage from './pages/MediaPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ToolsPage from './pages/ToolsPage';
import SystemPage from './pages/SystemPage';
import NotificationContainer from './components/ui/NotificationContainer';
import './styles/professional.css';

function AppContent() {
  return (
    <ProfessionalLayout>
      <Routes>
        <Route path="/" element={<ProfessionalDashboard />} />
        <Route path="/users/*" element={<UsersPage />} />
        <Route path="/products/*" element={<ProductsPage />} />
        <Route path="/communication/*" element={<CommunicationPage />} />
        <Route path="/media/*" element={<MediaPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/tools/*" element={<ToolsPage />} />
        <Route path="/system/*" element={<SystemPage />} />
      </Routes>
    </ProfessionalLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <NotificationProvider>
          <Router>
            <AppContent />
            <NotificationContainer />
          </Router>
        </NotificationProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
