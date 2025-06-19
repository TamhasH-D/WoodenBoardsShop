import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext'; // Import AuthProvider
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import WoodTypesManager from './components/WoodTypesManager';
import Chats from './components/Chats';
import BoardAnalyzerNew from './components/BoardAnalyzerNew';
import Profile from './components/Profile';
import ErrorBoundary from './components/ErrorBoundary';
import Sidebar from './components/layout/Sidebar';
// import { SELLER_TEXTS } from './utils/localization'; // Removed - not used in new layout
import './index.css';

function App() {

  return (
    <Router>
      <AuthProvider> {/* Wrap with AuthProvider */}
        <div className="flex h-screen bg-gray-50">
          {/* Sidebar */}
          <Sidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/products" element={<Products />} />
                <Route path="/wood-types" element={<WoodTypesManager />} />
                <Route path="/board-analyzer" element={<BoardAnalyzerNew />} />
                <Route path="/chats" element={<Chats />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </ErrorBoundary>
          </div>

        </main>
      </div>
      </AuthProvider> {/* Close AuthProvider */}
    </Router>
  );
}

export default App;
