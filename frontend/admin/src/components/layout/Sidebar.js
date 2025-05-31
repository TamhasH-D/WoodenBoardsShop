import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { ENTITY_TYPES } from '../../utils/constants';
import './Sidebar.css';

/**
 * Modern sidebar navigation component with collapsible design
 */
const Sidebar = () => {
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar } = useApp();

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

  const renderNavigationItem = (item, level = 0) => {
    const isActive = isActiveRoute(item.path, item.exact);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = hasChildren && isActiveRoute(item.path);

    return (
      <li key={item.path} className="sidebar__nav-item">
        <Link
          to={item.path}
          className={`sidebar__nav-link sidebar__nav-link--level-${level} ${
            isActive ? 'sidebar__nav-link--active' : ''
          }`}
          title={sidebarCollapsed ? item.label : undefined}
        >
          <span className="sidebar__nav-icon" aria-hidden="true">
            {item.icon}
          </span>
          {!sidebarCollapsed && (
            <>
              <span className="sidebar__nav-text">{item.label}</span>
              {hasChildren && (
                <span className={`sidebar__nav-arrow ${isExpanded ? 'sidebar__nav-arrow--expanded' : ''}`}>
                  ▶
                </span>
              )}
            </>
          )}
        </Link>
        
        {hasChildren && !sidebarCollapsed && isExpanded && (
          <ul className="sidebar__nav-submenu">
            {item.children.map(child => renderNavigationItem(child, level + 1))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <aside className={`sidebar ${sidebarCollapsed ? 'sidebar--collapsed' : ''}`}>
      {/* Sidebar Header */}
      <div className="sidebar__header">
        <div className="sidebar__logo">
          <span className="sidebar__logo-icon" aria-hidden="true">🏗️</span>
          {!sidebarCollapsed && (
            <span className="sidebar__logo-text">Admin Panel</span>
          )}
        </div>
        
        <button
          className="sidebar__toggle"
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? '▶' : '◀'}
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav" role="navigation" aria-label="Main navigation">
        <ul className="sidebar__nav-list">
          {navigationItems.map(item => renderNavigationItem(item))}
        </ul>
      </nav>

      {/* Sidebar Footer */}
      {!sidebarCollapsed && (
        <div className="sidebar__footer">
          <div className="sidebar__version">
            <span className="sidebar__version-label">Version</span>
            <span className="sidebar__version-number">2.0.0</span>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
