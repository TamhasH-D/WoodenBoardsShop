import React from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import HealthCheck from '../components/HealthCheck';
import SystemMonitor from '../components/SystemMonitor';
import Card from '../components/ui/Card';
import { cn } from '../utils/helpers';
import {
  HeartIcon,
  DocumentTextIcon,
  CogIcon,
  ChartBarIcon,
  ServerIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

/**
 * Enhanced System Page
 * Professional, minimal design suitable for enterprise admin panels
 */
const EnhancedSystemPage = () => {
  const location = useLocation();

  const SystemLogsComponent = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Системные логи</h2>
        <p className="mt-1 text-sm text-gray-600">
          Просмотр и анализ системных логов, отчетов об ошибках и аудиторских следов
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Логи приложения</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">INFO: Пользователь успешно авторизован</span>
              <span className="text-gray-400 ml-auto">12:34:56</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">DEBUG: API запрос выполнен за 145ms</span>
              <span className="text-gray-400 ml-auto">12:34:45</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-600">WARN: Медленный запрос к базе данных</span>
              <span className="text-gray-400 ml-auto">12:34:23</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Ошибки</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-gray-600">ERROR: Таймаут подключения к Redis</span>
              <span className="text-gray-400 ml-auto">11:45:12</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-gray-600">WARN: Высокое использование памяти</span>
              <span className="text-gray-400 ml-auto">11:23:45</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const SystemSettingsComponent = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Настройки системы</h2>
        <p className="mt-1 text-sm text-gray-600">
          Настройка общесистемных параметров и политик безопасности
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Общие настройки</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Режим отладки</span>
              <span className="text-sm font-medium text-green-600">Включен</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Кэширование</span>
              <span className="text-sm font-medium text-blue-600">Redis активен</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Максимум соединений</span>
              <span className="text-sm font-medium text-gray-900">100</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Безопасность</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">CORS настроен</span>
              <span className="text-sm font-medium text-green-600">Да</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Rate limiting</span>
              <span className="text-sm font-medium text-blue-600">100 req/min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">SSL сертификат</span>
              <span className="text-sm font-medium text-green-600">Действителен</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const tabs = [
    { 
      key: 'health', 
      label: 'Состояние системы', 
      path: '/system/health', 
      icon: HeartIcon,
      description: 'Мониторинг здоровья системы и API'
    },
    { 
      key: 'monitor', 
      label: 'Мониторинг', 
      path: '/system/monitor', 
      icon: ChartBarIcon,
      description: 'Производительность и метрики в реальном времени'
    },
    { 
      key: 'logs', 
      label: 'Логи', 
      path: '/system/logs', 
      icon: DocumentTextIcon,
      description: 'Системные логи и отчеты об ошибках'
    },
    { 
      key: 'settings', 
      label: 'Настройки', 
      path: '/system/settings', 
      icon: CogIcon,
      description: 'Конфигурация системы и параметры безопасности'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Система</h1>
        <p className="mt-1 text-sm text-gray-600">
          Мониторинг состояния системы, логи и настройки
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        <Route path="/" element={<Navigate to="/system/health" replace />} />
        <Route path="/health" element={<HealthCheck />} />
        <Route path="/monitor" element={<SystemMonitor />} />
        <Route path="/logs" element={<SystemLogsComponent />} />
        <Route path="/settings" element={<SystemSettingsComponent />} />
      </Routes>
    </div>
  );
};

export default EnhancedSystemPage;
