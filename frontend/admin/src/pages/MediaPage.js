import React from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import EntityManager from '../components/EntityManager';
import Card from '../components/ui/Card';
import { cn } from '../utils/helpers';
import {
  PhotoIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

/**
 * Corporate Media Page
 * Professional, minimal design suitable for enterprise admin panels
 */
const MediaPage = () => {
  const location = useLocation();

  const tabs = [
    { 
      key: 'images', 
      label: 'Изображения', 
      path: '/media/images',
      icon: PhotoIcon,
      description: 'Управление изображениями товаров и системными медиафайлами'
    },
    { 
      key: 'boards', 
      label: 'Доски', 
      path: '/media/boards',
      icon: WrenchScrewdriverIcon,
      description: 'Управление данными деревянных досок и их анализом'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Медиа и файлы</h1>
        <p className="mt-1 text-sm text-gray-600">
          Управление изображениями, файлами и связанными медиаданными
        </p>
      </div>

      {/* Navigation tabs */}
      <Card className="p-0">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.key}
                  to={tab.path}
                  className={cn(
                    'flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-150',
                    location.pathname === tab.path
                      ? 'border-accent-500 text-accent-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </Card>

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
        <Route path="/" element={<Navigate to="/media/images" replace />} />
        <Route path="/images" element={<EntityManager entityType="images" />} />
        <Route path="/boards" element={<EntityManager entityType="boards" />} />
      </Routes>
    </div>
  );
};

export default MediaPage;
