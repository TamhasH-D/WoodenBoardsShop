import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Buyers from './components/Buyers';
import Sellers from './components/Sellers';
import Products from './components/Products';
import ChatThreads from './components/ChatThreads';
import EntityManager from './components/EntityManager';
import DataExport from './components/DataExport';
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

      {/* Database Management Dropdown */}
      <div className="nav-dropdown">
        <span className="nav-link dropdown-toggle">
          🗄️ Database
        </span>
        <div className="dropdown-content">
          <Link to="/manage/woodTypes" className="dropdown-link">🌳 Wood Types</Link>
          <Link to="/manage/prices" className="dropdown-link">💰 Prices</Link>
          <Link to="/manage/boards" className="dropdown-link">🪵 Boards</Link>
          <Link to="/manage/images" className="dropdown-link">🖼️ Images</Link>
          <Link to="/manage/threads" className="dropdown-link">💬 Threads</Link>
          <Link to="/manage/messages" className="dropdown-link">💭 Messages</Link>
        </div>
      </div>

      <Link to="/export" className={`nav-link ${isActive('/export') ? 'active' : ''}`}>
        📊 Export
      </Link>
      <Link to="/health" className={`nav-link ${isActive('/health') ? 'active' : ''}`}>
        🔧 Health
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

              {/* Entity Management Routes */}
              <Route path="/manage/woodTypes" element={<EntityManager entityType="woodTypes" />} />
              <Route path="/manage/prices" element={<EntityManager entityType="prices" />} />
              <Route path="/manage/boards" element={<EntityManager entityType="boards" />} />
              <Route path="/manage/images" element={<EntityManager entityType="images" />} />
              <Route path="/manage/threads" element={<EntityManager entityType="threads" />} />
              <Route path="/manage/messages" element={<EntityManager entityType="messages" />} />

              <Route path="/export" element={<DataExport />} />
              <Route path="/health" element={<HealthCheck />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
