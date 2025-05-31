import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import WoodTypesManager from './components/WoodTypesManager';
import Chats from './components/Chats';
import Profile from './components/Profile';
import HealthCheck from './components/HealthCheck';

function Navigation() {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;
  
  return (
    <nav className="nav">
      <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
        Dashboard
      </Link>
      <Link to="/products" className={`nav-link ${isActive('/products') ? 'active' : ''}`}>
        My Products
      </Link>
      <Link to="/wood-types" className={`nav-link ${isActive('/wood-types') ? 'active' : ''}`}>
        Wood Types & Prices
      </Link>
      <Link to="/chats" className={`nav-link ${isActive('/chats') ? 'active' : ''}`}>
        Customer Chats
      </Link>
      <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`}>
        Profile
      </Link>
      <Link to="/health" className={`nav-link ${isActive('/health') ? 'active' : ''}`}>
        System Health
      </Link>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <header className="header">
          <div className="container">
            <h1>Seller Dashboard</h1>
            <p>Manage your wood products and customer interactions</p>
          </div>
        </header>
        
        <div className="container">
          <Navigation />
          
          <main>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/wood-types" element={<WoodTypesManager />} />
              <Route path="/chats" element={<Chats />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/health" element={<HealthCheck />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
