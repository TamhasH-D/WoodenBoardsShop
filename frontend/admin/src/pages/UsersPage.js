import React from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import EntityManager from '../components/EntityManager';
import Card from '../components/ui/Card';
import { cn } from '../utils/helpers';
import {
  UsersIcon,
  BuildingStorefrontIcon,
} from '@heroicons/react/24/outline';

/**
 * Страница управления продавцами и покупателями с подмаршрутами
 */
const UsersPage = () => {
  const location = useLocation();

  const tabs = [
    {
      key: 'buyers',
      label: 'Покупатели',
      path: '/users/buyers',
      icon: UsersIcon,
      description: 'Управление покупателями и их аккаунтами'
    },
    {
      key: 'sellers',
      label: 'Продавцы',
      path: '/users/sellers',
      icon: BuildingStorefrontIcon,
      description: 'Управление продавцами и их бизнес-аккаунтами'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Управление пользователями</h1>
        <p className="mt-1 text-sm text-gray-600">
          Управление покупателями и продавцами платформы
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path;
            return (
              <Link
                key={tab.key}
                to={tab.path}
                className={cn(
                  'flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-150',
                  isActive
                    ? 'border-accent-500 text-accent-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Tab descriptions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;
          return (
            <Card
              key={tab.key}
              className={cn(
                'p-4 transition-colors duration-150',
                isActive ? 'border-accent-200 bg-accent-50' : 'hover:border-gray-300'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn(
                  'h-6 w-6',
                  isActive ? 'text-accent-600' : 'text-gray-400'
                )} />
                <div>
                  <h3 className={cn(
                    'text-sm font-medium',
                    isActive ? 'text-accent-900' : 'text-gray-900'
                  )}>
                    {tab.label}
                  </h3>
                  <p className={cn(
                    'text-xs mt-1',
                    isActive ? 'text-accent-700' : 'text-gray-600'
                  )}>
                    {tab.description}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Content */}
      <Routes>
        <Route path="/" element={<Navigate to="/users/buyers" replace />} />
        <Route path="/buyers" element={<EntityManager entityType="buyers" />} />
        <Route path="/sellers" element={<EntityManager entityType="sellers" />} />
      </Routes>
    </div>
  );
};

export default UsersPage;
