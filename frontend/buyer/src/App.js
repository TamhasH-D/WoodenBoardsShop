import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './components/Home';
import Products from './components/Products';
import Sellers from './components/Sellers';
import BoardAnalyzer from './components/BoardAnalyzer';
import Chats from './components/Chats';
import Profile from './components/Profile';
import HealthCheck from './components/HealthCheck';
import { BUYER_TEXTS } from './utils/localization';

function Navigation() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="nav">
      <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
        {BUYER_TEXTS.HOME}
      </Link>
      <Link to="/products" className={`nav-link ${isActive('/products') ? 'active' : ''}`}>
        {BUYER_TEXTS.PRODUCTS}
      </Link>
      <Link to="/sellers" className={`nav-link ${isActive('/sellers') ? 'active' : ''}`}>
        {BUYER_TEXTS.SELLERS}
      </Link>
      <Link to="/analyzer" className={`nav-link ${isActive('/analyzer') ? 'active' : ''}`}>
        {BUYER_TEXTS.BOARD_ANALYZER}
      </Link>
      <Link to="/chats" className={`nav-link ${isActive('/chats') ? 'active' : ''}`}>
        {BUYER_TEXTS.CHATS}
      </Link>
      <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`}>
        {BUYER_TEXTS.PROFILE}
      </Link>
      <Link to="/health" className={`nav-link ${isActive('/health') ? 'active' : ''}`}>
        {BUYER_TEXTS.HEALTH_CHECK}
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
            <h1>{BUYER_TEXTS.WELCOME_TITLE}</h1>
            <p>{BUYER_TEXTS.WELCOME_SUBTITLE}</p>
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
