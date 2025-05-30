import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Buyers from './components/Buyers';
import Sellers from './components/Sellers';
import Products from './components/Products';
import ChatThreads from './components/ChatThreads';
import HealthCheck from './components/HealthCheck';

function Navigation() {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;
  
  return (
    <nav className="nav">
      <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
        Dashboard
      </Link>
      <Link to="/buyers" className={`nav-link ${isActive('/buyers') ? 'active' : ''}`}>
        Buyers
      </Link>
      <Link to="/sellers" className={`nav-link ${isActive('/sellers') ? 'active' : ''}`}>
        Sellers
      </Link>
      <Link to="/products" className={`nav-link ${isActive('/products') ? 'active' : ''}`}>
        Products
      </Link>
      <Link to="/chats" className={`nav-link ${isActive('/chats') ? 'active' : ''}`}>
        Chat Threads
      </Link>
      <Link to="/health" className={`nav-link ${isActive('/health') ? 'active' : ''}`}>
        Health Check
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
            <h1>Admin Dashboard</h1>
            <p>Diplom Project Administration</p>
          </div>
        </header>
        
        <div className="container">
          <Navigation />
          
          <main>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/buyers" element={<Buyers />} />
              <Route path="/sellers" element={<Sellers />} />
              <Route path="/products" element={<Products />} />
              <Route path="/chats" element={<ChatThreads />} />
              <Route path="/health" element={<HealthCheck />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
