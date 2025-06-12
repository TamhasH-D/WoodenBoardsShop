import React from 'react';
import { useApi } from '../hooks/useApi';
import { apiService } from '../services/api';
import Card from './ui/Card';
import Button from './ui/Button';
import LoadingSpinner from './ui/LoadingSpinner';
import {
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

/**
 * Corporate Health Check Component
 * Professional, minimal design suitable for enterprise admin panels
 */
function HealthCheck() {
  const { data, loading, error, refetch } = useApi(() => apiService.healthCheck());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Проверка состояния системы</h2>
          <p className="mt-1 text-sm text-gray-600">
            Мониторинг подключения к backend API и состояния сервисов
          </p>
        </div>
        <Button
          onClick={refetch}
          disabled={loading}
          loading={loading}
        >
          {loading ? 'Проверка...' : 'Проверить'}
        </Button>
      </div>

      {/* Status Card */}
      <Card className="p-6">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
            <span className="ml-3 text-gray-600">Проверка состояния backend...</span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-md">
            <XCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Ошибка подключения к backend</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <p className="mt-2 text-xs text-red-600">
                Убедитесь, что backend запущен на правильном порту и CORS настроен корректно.
              </p>
            </div>
          </div>
        )}

        {data !== null && !error && (
          <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-md">
            <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-green-800">Backend работает корректно</h3>
              <p className="mt-1 text-sm text-green-700">API отвечает правильно</p>
              <details className="mt-2">
                <summary className="text-xs text-green-600 cursor-pointer">Показать ответ</summary>
                <pre className="mt-1 text-xs text-green-600 bg-green-100 p-2 rounded overflow-auto">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        )}
      </Card>

      {/* Connection Details */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <InformationCircleIcon className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Детали подключения</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-600">API URL:</span>
            <span className="text-sm text-gray-900 font-mono">
              {process.env.REACT_APP_API_URL || 'http://localhost:8000'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-600">Окружение:</span>
            <span className="text-sm text-gray-900">{process.env.NODE_ENV}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-600">Прокси:</span>
            <span className="text-sm text-gray-900">
              {process.env.REACT_APP_API_URL ? 'Отключен' : 'Включен (через package.json)'}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default HealthCheck;
