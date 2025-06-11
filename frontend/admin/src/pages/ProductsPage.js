import React, { useEffect } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import EntityManager from '../components/EntityManager';
import { ADMIN_TEXTS } from '../utils/localization';
import Card from '../components/ui/Card';
import { cn } from '../utils/helpers';

/**
 * Corporate Products Page
 * Professional, minimal design suitable for enterprise admin panels
 */
const ProductsPage = () => {
  const { setPageTitle } = useApp();
  const location = useLocation();

  useEffect(() => {
    setPageTitle(ADMIN_TEXTS.PRODUCT_MANAGEMENT);
  }, [setPageTitle]);

  const tabs = [
    { key: 'list', label: 'Товары', path: '/products/list' },
    { key: 'wood-types', label: 'Типы древесины', path: '/products/wood-types' },
    { key: 'prices', label: 'Цены', path: '/products/prices' },
    { key: 'boards', label: 'Доски', path: '/products/boards' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Управление товарами</h1>
        <p className="mt-1 text-sm text-gray-600">
          Управление товарами, типами древесины, ценами и связанными данными
        </p>
      </div>

      {/* Navigation tabs */}
      <Card className="p-0">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <Link
                key={tab.key}
                to={tab.path}
                className={cn(
                  'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-150',
                  location.pathname === tab.path
                    ? 'border-accent-500 text-accent-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      </Card>

      {/* Content */}
      <Routes>
        <Route path="/" element={<Navigate to="/products/list" replace />} />
        <Route path="/list" element={<EntityManager entityType="products" />} />
        <Route path="/wood-types" element={<EntityManager entityType="woodTypes" />} />
        <Route path="/prices" element={<EntityManager entityType="prices" />} />
        <Route path="/boards" element={<EntityManager entityType="boards" />} />
      </Routes>
    </div>
  );
};

export default ProductsPage;
