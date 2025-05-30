import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './components/Home';
import Products from './components/Products';
import Sellers from './components/Sellers';
import BoardAnalyzer from './components/BoardAnalyzer';
import Profile from './components/Profile';
import HealthCheck from './components/HealthCheck';

function Navigation() {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;
  
  return (
    <nav className="nav">
      <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
        Home
      </Link>
      <Link to="/products" className={`nav-link ${isActive('/products') ? 'active' : ''}`}>
        Browse Products
      </Link>
      <Link to="/sellers" className={`nav-link ${isActive('/sellers') ? 'active' : ''}`}>
        Find Sellers
      </Link>
      <Link to="/analyzer" className={`nav-link ${isActive('/analyzer') ? 'active' : ''}`}>
        Board Analyzer
      </Link>
      <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`}>
        My Profile
      </Link>
      <Link to="/health" className={`nav-link ${isActive('/health') ? 'active' : ''}`}>
        System Status
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
            <h1>Wood Products Marketplace</h1>
            <p>Find quality wood products from trusted sellers</p>
          </div>
        </header>
        
        <div className="container">
          <Navigation />
          
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/sellers" element={<Sellers />} />
              <Route path="/analyzer" element={<BoardAnalyzer />} />
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
