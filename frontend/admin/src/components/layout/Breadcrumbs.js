import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { camelToTitle, cn } from '../../utils/helpers';

/**
 * Premium breadcrumbs with smooth animations and hover effects
 */
const Breadcrumbs = () => {
  const location = useLocation();
  const { breadcrumbs } = useApp();

  // Generate breadcrumbs from URL if not provided by context
  const generateBreadcrumbs = () => {
    if (breadcrumbs && breadcrumbs.length > 0) {
      return breadcrumbs;
    }

    const pathSegments = location.pathname.split('/').filter(Boolean);
    const crumbs = [{ label: 'Dashboard', path: '/' }];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Convert segment to readable label
      let label = segment;
      if (segment === 'users') label = 'Users';
      else if (segment === 'products') label = 'Products';
      else if (segment === 'media') label = 'Media';
      else if (segment === 'communication') label = 'Communication';
      else if (segment === 'analytics') label = 'Analytics';
      else if (segment === 'tools') label = 'Tools';
      else if (segment === 'system') label = 'System';
      else if (segment === 'buyers') label = 'Buyers';
      else if (segment === 'sellers') label = 'Sellers';
      else if (segment === 'wood-types') label = 'Wood Types';
      else if (segment === 'prices') label = 'Pricing';
      else if (segment === 'boards') label = 'Wooden Boards';
      else if (segment === 'images') label = 'Images';
      else if (segment === 'threads') label = 'Chat Threads';
      else if (segment === 'messages') label = 'Messages';
      else if (segment === 'export') label = 'Data Export';
      else if (segment === 'import') label = 'Data Import';
      else if (segment === 'api-test') label = 'API Tester';
      else if (segment === 'health') label = 'Health Check';
      else if (segment === 'logs') label = 'System Logs';
      else if (segment === 'settings') label = 'Settings';
      else label = camelToTitle(segment);

      crumbs.push({
        label,
        path: currentPath,
        isLast: index === pathSegments.length - 1
      });
    });

    return crumbs;
  };

  const crumbs = generateBreadcrumbs();

  if (crumbs.length <= 1) {
    return null;
  }

  return (
    <nav
      className="px-6 py-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50"
      aria-label="Breadcrumb navigation"
    >
      <ol className="flex items-center space-x-2 text-sm">
        {crumbs.map((crumb, index) => (
          <li key={crumb.path} className="flex items-center">
            {crumb.isLast || index === crumbs.length - 1 ? (
              <span className="font-medium text-slate-900 dark:text-slate-100 px-2 py-1 rounded-md bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300">
                {crumb.label}
              </span>
            ) : (
              <>
                <Link
                  to={crumb.path}
                  className={cn(
                    'px-2 py-1 rounded-md transition-all duration-200',
                    'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100',
                    'hover:bg-slate-100 dark:hover:bg-slate-800',
                    'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2'
                  )}
                  title={`Go to ${crumb.label}`}
                >
                  {crumb.label}
                </Link>
                <span className="mx-2 text-slate-400 dark:text-slate-600" aria-hidden="true">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
