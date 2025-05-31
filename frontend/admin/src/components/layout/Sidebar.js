import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { cn } from '../../utils/helpers';

/**
 * Premium sidebar navigation with glassmorphism and smooth animations
 */
const Sidebar = () => {
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar } = useApp();
  const [expandedItems, setExpandedItems] = useState(new Set());

  const navigationItems = [
    {
      path: '/',
      label: 'Dashboard',
      icon: '📊',
      exact: true
    },
    {
      path: '/users',
      label: 'Users',
      icon: '👥',
      children: [
        { path: '/users/buyers', label: 'Buyers', icon: '🛒' },
        { path: '/users/sellers', label: 'Sellers', icon: '🏪' }
      ]
    },
    {
      path: '/products',
      label: 'Products',
      icon: '📦',
      children: [
        { path: '/products/list', label: 'All Products', icon: '📋' },
        { path: '/products/wood-types', label: 'Wood Types', icon: '🌳' },
        { path: '/products/prices', label: 'Pricing', icon: '💰' },
        { path: '/products/boards', label: 'Wooden Boards', icon: '🪵' }
      ]
    },
    {
      path: '/media',
      label: 'Media',
      icon: '🖼️',
      children: [
        { path: '/media/images', label: 'Images', icon: '📸' }
      ]
    },
    {
      path: '/communication',
      label: 'Communication',
      icon: '💬',
      children: [
        { path: '/communication/threads', label: 'Chat Threads', icon: '🧵' },
        { path: '/communication/messages', label: 'Messages', icon: '💌' }
      ]
    },
    {
      path: '/analytics',
      label: 'Analytics',
      icon: '📈'
    },
    {
      path: '/tools',
      label: 'Tools',
      icon: '🛠️',
      children: [
        { path: '/tools/export', label: 'Data Export', icon: '📤' },
        { path: '/tools/import', label: 'Data Import', icon: '📥' },
        { path: '/tools/api-test', label: 'API Tester', icon: '🧪' }
      ]
    },
    {
      path: '/system',
      label: 'System',
      icon: '⚙️',
      children: [
        { path: '/system/health', label: 'Health Check', icon: '🔧' },
        { path: '/system/logs', label: 'System Logs', icon: '📝' },
        { path: '/system/settings', label: 'Settings', icon: '⚙️' }
      ]
    }
  ];

  const isActiveRoute = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const toggleExpanded = (path) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedItems(newExpanded);
  };

  const renderNavigationItem = (item, level = 0) => {
    const isActive = isActiveRoute(item.path, item.exact);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.path) || isActiveRoute(item.path);

    return (
      <li key={item.path} className="group">
        <div className="relative">
          <Link
            to={hasChildren ? '#' : item.path}
            onClick={(e) => {
              if (hasChildren) {
                e.preventDefault();
                toggleExpanded(item.path);
              }
            }}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden',
              'hover:bg-white/10 hover:backdrop-blur-sm hover:shadow-soft',
              'focus:outline-none focus:ring-2 focus:ring-white/20',
              {
                'bg-gradient-to-r from-brand-500/20 to-brand-600/20 text-white shadow-soft backdrop-blur-sm border border-white/10': isActive,
                'text-slate-300 hover:text-white': !isActive,
                'ml-4': level > 0,
              }
            )}
            title={sidebarCollapsed ? item.label : undefined}
          >
            {/* Glow effect for active items */}
            {isActive && (
              <div className="absolute inset-0 bg-gradient-to-r from-brand-500/30 to-brand-600/30 rounded-xl blur-sm" />
            )}

            {/* Icon with animation */}
            <span className={cn(
              'relative flex-shrink-0 text-lg transition-transform duration-200',
              'group-hover:scale-110',
              {
                'text-brand-300': isActive,
                'text-slate-400 group-hover:text-white': !isActive,
              }
            )}>
              {item.icon}
            </span>

            {/* Label and arrow */}
            {!sidebarCollapsed && (
              <>
                <span className="relative flex-1 truncate">{item.label}</span>
                {hasChildren && (
                  <span className={cn(
                    'relative text-xs transition-transform duration-200',
                    isExpanded ? 'rotate-90' : 'rotate-0'
                  )}>
                    ▶
                  </span>
                )}
              </>
            )}
          </Link>
        </div>

        {/* Submenu with smooth animation */}
        {hasChildren && !sidebarCollapsed && (
          <div className={cn(
            'overflow-hidden transition-all duration-300 ease-out',
            isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          )}>
            <ul className="mt-1 space-y-1 pl-4">
              {item.children.map(child => renderNavigationItem(child, level + 1))}
            </ul>
          </div>
        )}
      </li>
    );
  };

  return (
    <aside className={cn(
      'fixed left-0 top-0 z-50 h-screen transition-all duration-300 ease-out',
      'glass-sidebar border-r border-slate-700/50 backdrop-blur-xl',
      'flex flex-col',
      {
        'w-64': !sidebarCollapsed,
        'w-16': sidebarCollapsed,
      }
    )}>
      {/* Premium Header with Glassmorphism */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 min-w-0">
          {/* Animated Logo */}
          <div className="relative">
            <span className="text-2xl animate-float" aria-hidden="true">🏗️</span>
            <div className="absolute inset-0 bg-brand-500/20 rounded-full blur-lg animate-pulse-soft" />
          </div>

          {/* Logo Text with Gradient */}
          {!sidebarCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-lg font-bold text-gradient-primary truncate">
                Admin Panel
              </span>
              <span className="text-xs text-slate-400 truncate">
                Enterprise Dashboard
              </span>
            </div>
          )}
        </div>

        {/* Premium Toggle Button */}
        <button
          onClick={toggleSidebar}
          className={cn(
            'flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200',
            'bg-white/10 hover:bg-white/20 backdrop-blur-sm',
            'text-slate-300 hover:text-white',
            'focus:outline-none focus:ring-2 focus:ring-white/20',
            'transform hover:scale-110 active:scale-95'
          )}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className={cn(
            'text-sm transition-transform duration-200',
            sidebarCollapsed ? 'rotate-0' : 'rotate-180'
          )}>
            ▶
          </span>
        </button>
      </div>

      {/* Premium Navigation with Scrollbar */}
      <nav
        className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-2"
        role="navigation"
        aria-label="Main navigation"
      >
        <ul className="space-y-1">
          {navigationItems.map(item => renderNavigationItem(item))}
        </ul>
      </nav>

      {/* Premium Footer with Glassmorphism */}
      {!sidebarCollapsed && (
        <div className="p-4 border-t border-slate-700/50 bg-gradient-to-r from-slate-800/30 to-slate-900/30 backdrop-blur-sm">
          <div className="flex flex-col items-center space-y-2">
            {/* Version Badge */}
            <div className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-slate-300">
                  v2.0.0
                </span>
              </div>
            </div>

            {/* Status Text */}
            <span className="text-2xs text-slate-400 text-center">
              Enterprise Dashboard
            </span>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
