import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import Sidebar from './Sidebar';
import Header from './Header';
import Breadcrumbs from './Breadcrumbs';
import { cn } from '../../utils/helpers';

/**
 * Premium layout with smooth transitions and responsive design
 */
const Layout = ({ children }) => {
  const location = useLocation();
  const { sidebarCollapsed, mobileMenuOpen, closeMobileMenu } = useApp();

  // Close mobile menu when route changes
  useEffect(() => {
    if (mobileMenuOpen && closeMobileMenu) {
      closeMobileMenu();
    }
  }, [location.pathname, mobileMenuOpen, closeMobileMenu]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className={cn(
        'min-h-screen transition-all duration-300 ease-out',
        {
          'lg:ml-64': !sidebarCollapsed,
          'lg:ml-16': sidebarCollapsed,
        }
      )}>
        {/* Header */}
        <Header />

        {/* Content Container */}
        <div className="relative">
          {/* Breadcrumbs */}
          <Breadcrumbs />

          {/* Main Content with Premium Styling */}
          <main
            className="relative px-6 py-8 min-h-[calc(100vh-8rem)] animate-fade-in-up"
            role="main"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] [background-size:20px_20px] pointer-events-none" />

            {/* Content */}
            <div className="relative z-10">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default Layout;
