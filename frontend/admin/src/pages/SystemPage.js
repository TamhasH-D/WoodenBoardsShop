import React from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import HealthCheck from '../components/HealthCheck';
import DatabaseManager from '../components/DatabaseManager';
import Card from '../components/ui/Card';
import { cn } from '../utils/helpers';
import {
  HeartIcon,
  DocumentTextIcon,
  CogIcon,
  CircleStackIcon,
} from '@heroicons/react/24/outline';

/**
 * Corporate System Page
 * Professional, minimal design suitable for enterprise admin panels
 */
const SystemPage = () => {
  const location = useLocation();

  const SystemLogsPlaceholder = () => (
    <Card className="p-8 text-center">
      <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Системные логи</h3>
      <p className="text-gray-600 mb-4">
        Просмотр и анализ системных логов, отчетов об ошибках и аудиторских следов.
      </p>
      <p className="text-sm text-gray-500">
        Функция будет доступна в следующих версиях
      </p>
    </Card>
  );

  const SystemSettingsPlaceholder = () => (
    <Card className="p-8 text-center">
      <CogIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Настройки системы</h3>
      <p className="text-gray-600 mb-4">
        Настройка общесистемных параметров и политик безопасности.
      </p>
      <p className="text-sm text-gray-500">
        Функция будет доступна в следующих версиях
      </p>
    </Card>
  );

  const tabs = [
    { key: 'health', label: 'Состояние системы', path: '/system/health', icon: HeartIcon },
    { key: 'database', label: 'База данных', path: '/system/database', icon: CircleStackIcon },
    { key: 'logs', label: 'Логи', path: '/system/logs', icon: DocumentTextIcon },
    { key: 'settings', label: 'Настройки', path: '/system/settings', icon: CogIcon },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Система</h1>
        <p className="mt-1 text-sm text-gray-600">
          Мониторинг состояния системы, управление базой данных, логи и настройки
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

      {/* Content */}
      <Routes>
        <Route path="/" element={<Navigate to="/system/health" replace />} />
        <Route path="/health" element={<HealthCheck />} />
        <Route path="/database" element={<DatabaseManager />} />
        <Route path="/logs" element={<SystemLogsPlaceholder />} />
        <Route path="/settings" element={<SystemSettingsPlaceholder />} />
      </Routes>
    </div>
  );
};

export default SystemPage;
