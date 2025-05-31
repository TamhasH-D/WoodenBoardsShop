import React from 'react';
import { useApp } from '../../contexts/AppContext';
import Button from '../ui/Button';
import { cn } from '../../utils/helpers';

/**
 * Premium header with glassmorphism and smooth animations
 */
const Header = () => {
  const {
    pageTitle,
    toggleSidebar,
    toggleMobileMenu,
    sidebarCollapsed,
    backendStatus,
    theme,
    setTheme
  } = useApp();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <header className={cn(
      'sticky top-0 z-40 transition-all duration-300',
      'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl',
      'border-b border-slate-200/50 dark:border-slate-700/50',
      'shadow-soft',
      {
        'ml-64': !sidebarCollapsed,
        'ml-16': sidebarCollapsed,
      }
    )}>
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile menu toggle - hidden on desktop */}
          <Button
            variant="ghost"
            size="medium"
            onClick={toggleMobileMenu}
            className="lg:hidden"
            icon="☰"
            ariaLabel="Toggle mobile menu"
          />

          {/* Desktop sidebar toggle - hidden on mobile */}
          <Button
            variant="ghost"
            size="medium"
            onClick={toggleSidebar}
            className="hidden lg:flex"
            icon={sidebarCollapsed ? '▶' : '◀'}
            ariaLabel={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          />

          {/* Page Title with Gradient */}
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-gradient-primary">
              {pageTitle || 'Dashboard'}
            </h1>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span>Enterprise Admin Panel</span>
              <div className="w-1 h-1 bg-slate-400 rounded-full" />
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Backend Status with Premium Styling */}
          <div className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
            'backdrop-blur-sm border shadow-soft hover:shadow-medium',
            {
              'bg-success-50/80 dark:bg-success-900/20 border-success-200 dark:border-success-800 text-success-700 dark:text-success-300': backendStatus?.online,
              'bg-error-50/80 dark:bg-error-900/20 border-error-200 dark:border-error-800 text-error-700 dark:text-error-300': !backendStatus?.online,
            }
          )}>
            <div className={cn(
              'w-2 h-2 rounded-full animate-pulse',
              {
                'bg-success-500': backendStatus?.online,
                'bg-error-500': !backendStatus?.online,
              }
            )} />
            <span className="hidden sm:inline">
              {backendStatus?.online ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* Theme Toggle with Animation */}
          <Button
            variant="ghost"
            size="medium"
            onClick={toggleTheme}
            className="relative overflow-hidden"
            icon={
              <span className="relative z-10 transition-transform duration-300 hover:scale-110">
                {theme === 'light' ? '🌙' : '☀️'}
              </span>
            }
            ariaLabel={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          />

          {/* Premium User Menu */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-soft hover:shadow-medium transition-all duration-200 cursor-pointer group">
            {/* Avatar with Glow Effect */}
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-soft group-hover:shadow-glow transition-all duration-200">
                A
              </div>
              <div className="absolute inset-0 bg-brand-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>

            {/* User Info - Hidden on Mobile */}
            <div className="hidden sm:flex flex-col min-w-0">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                Admin User
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Administrator
              </span>
            </div>

            {/* Dropdown Arrow */}
            <span className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors duration-200 text-xs">
              ▼
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
