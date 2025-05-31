import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import Sidebar from './Sidebar';
import Header from './Header';
import Breadcrumbs from './Breadcrumbs';
import './Layout.css';

/**
 * Main layout component that provides the overall structure
 */
const Layout = ({ children }) => {
  const location = useLocation();
  const { sidebarCollapsed, mobileMenuOpen } = useApp();

  // Close mobile menu when route changes
  useEffect(() => {
    if (mobileMenuOpen) {
      // Close mobile menu logic would go here
    }
  }, [location.pathname, mobileMenuOpen]);

  const layoutClasses = [
    'layout',
    sidebarCollapsed && 'layout--sidebar-collapsed',
    mobileMenuOpen && 'layout--mobile-menu-open'
  ].filter(Boolean).join(' ');

  return (
    <div className={layoutClasses}>
      <Sidebar />
      
      <div className="layout__main">
        <Header />
        
        <div className="layout__content">
          <Breadcrumbs />
          
          <main className="layout__page" role="main">
            {children}
          </main>
        </div>
      </div>
      
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div 
          className="layout__overlay"
          onClick={() => {/* Close mobile menu */}}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default Layout;
