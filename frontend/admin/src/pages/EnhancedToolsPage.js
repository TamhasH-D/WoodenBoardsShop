import React from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import DataExport from '../components/DataExport';
import ApiTester from '../components/ApiTester';
import RedisManager from '../components/RedisManager';
import BoardAnalyzer from '../components/BoardAnalyzer';
import SystemMonitor from '../components/SystemMonitor';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { cn } from '../utils/helpers';
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  WrenchScrewdriverIcon,
  MagnifyingGlassIcon,
  ServerIcon,
  ChartBarIcon,
  CubeTransparentIcon,
} from '@heroicons/react/24/outline';

/**
 * Enhanced Tools Page
 * Professional, minimal design suitable for enterprise admin panels
 */
const EnhancedToolsPage = () => {
  const location = useLocation();

  const DataImportComponent = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Импорт данных</h2>
        <p className="mt-1 text-sm text-gray-600">
          Импорт данных из файлов CSV, JSON или Excel с валидацией и отчетами об ошибках
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Поддерживаемые форматы</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-semibold text-xs">CSV</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">CSV файлы</p>
                <p className="text-xs text-gray-600">Comma-separated values</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-xs">JSON</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">JSON файлы</p>
                <p className="text-xs text-gray-600">JavaScript Object Notation</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 font-semibold text-xs">XLS</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Excel файлы</p>
                <p className="text-xs text-gray-600">Microsoft Excel format</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Импорт данных</h3>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Перетащите файлы сюда или нажмите для выбора
              </p>
            </div>
            <Button variant="primary" className="w-full" disabled>
              Скоро будет доступно
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );

  const tabs = [
    { 
      key: 'export', 
      label: 'Экспорт данных', 
      path: '/tools/export',
      icon: ArrowDownTrayIcon,
      description: 'Экспорт данных в различных форматах'
    },
    { 
      key: 'import', 
      label: 'Импорт данных', 
      path: '/tools/import',
      icon: ArrowUpTrayIcon,
      description: 'Импорт данных из файлов с валидацией'
    },
    { 
      key: 'api-test', 
      label: 'Тестер API', 
      path: '/tools/api-test',
      icon: WrenchScrewdriverIcon,
      description: 'Тестирование API endpoints'
    },
    { 
      key: 'board-analyzer', 
      label: 'Анализатор досок', 
      path: '/tools/board-analyzer',
      icon: MagnifyingGlassIcon,
      description: 'AI анализ изображений деревянных досок'
    },
    { 
      key: 'redis-manager', 
      label: 'Redis менеджер', 
      path: '/tools/redis-manager',
      icon: ServerIcon,
      description: 'Управление кэшем и Redis данными'
    },
    { 
      key: 'system-monitor', 
      label: 'Системный монитор', 
      path: '/tools/system-monitor',
      icon: ChartBarIcon,
      description: 'Мониторинг производительности системы'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Инструменты</h1>
        <p className="mt-1 text-sm text-gray-600">
          Набор административных инструментов для управления системой и данными
        </p>
      </div>

      {/* Navigation tabs */}
      <Card className="p-0">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6 overflow-x-auto" aria-label="Tabs">
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        <Route path="/" element={<Navigate to="/tools/export" replace />} />
        <Route path="/export" element={<DataExport />} />
        <Route path="/import" element={<DataImportComponent />} />
        <Route path="/api-test" element={<ApiTester />} />
        <Route path="/board-analyzer" element={<BoardAnalyzer />} />
        <Route path="/redis-manager" element={<RedisManager />} />
        <Route path="/system-monitor" element={<SystemMonitor />} />
      </Routes>
    </div>
  );
};

export default EnhancedToolsPage;
