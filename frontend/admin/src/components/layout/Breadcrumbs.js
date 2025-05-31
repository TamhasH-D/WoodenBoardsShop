import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { camelToTitle } from '../../utils/helpers';
import './Breadcrumbs.css';

/**
 * Breadcrumbs navigation component
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
    <nav className="breadcrumbs" aria-label="Breadcrumb navigation">
      <ol className="breadcrumbs__list">
        {crumbs.map((crumb, index) => (
          <li key={crumb.path} className="breadcrumbs__item">
            {crumb.isLast || index === crumbs.length - 1 ? (
              <span className="breadcrumbs__current" aria-current="page">
                {crumb.label}
              </span>
            ) : (
              <>
                <Link 
                  to={crumb.path} 
                  className="breadcrumbs__link"
                  title={`Go to ${crumb.label}`}
                >
                  {crumb.label}
                </Link>
                <span className="breadcrumbs__separator" aria-hidden="true">
                  /
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
