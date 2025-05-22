import React from 'react';
import { useQuery } from 'react-query';
import { toast } from 'react-toastify';
import {
  ServerIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import apiService from '../../../apiService';

const SystemHealth = () => {
  // Fetch health status
  const { data, isLoading, isError, error, refetch } = useQuery(
    'health',
    () => apiService.checkHealth(),
    {
      onError: (error) => {
        toast.error(`Ошибка при проверке состояния системы: ${error.message}`);
      },
      // Refresh every 30 seconds
      refetchInterval: 30000,
    }
  );

  const handleRefresh = () => {
    refetch();
    toast.info('Обновление статуса системы...');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Состояние системы</h1>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" aria-hidden="true" />
          Обновить
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 flex items-center">
          <ServerIcon className="h-6 w-6 text-gray-500 mr-2" />
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Общее состояние системы
          </h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500 mr-3"></div>
              <p className="text-sm text-gray-500">Проверка состояния системы...</p>
            </div>
          ) : isError ? (
            <div className="flex items-center text-red-600">
              <ExclamationCircleIcon className="h-5 w-5 mr-2" />
              <span>Ошибка: {error?.message || 'Не удалось проверить состояние системы'}</span>
            </div>
          ) : (
            <div className="flex items-center text-green-600">
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              <span>Система работает нормально</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Компоненты системы
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">API Сервер</dt>
              <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500 mr-2"></div>
                    <span className="text-gray-500">Проверка...</span>
                  </div>
                ) : isError ? (
                  <div className="flex items-center text-red-600">
                    <ExclamationCircleIcon className="h-4 w-4 mr-2" />
                    <span>Недоступен</span>
                  </div>
                ) : (
                  <div className="flex items-center text-green-600">
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    <span>Работает</span>
                  </div>
                )}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">База данных</dt>
              <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500 mr-2"></div>
                    <span className="text-gray-500">Проверка...</span>
                  </div>
                ) : isError ? (
                  <div className="flex items-center text-red-600">
                    <ExclamationCircleIcon className="h-4 w-4 mr-2" />
                    <span>Недоступна</span>
                  </div>
                ) : (
                  <div className="flex items-center text-green-600">
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    <span>Работает</span>
                  </div>
                )}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Redis</dt>
              <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500 mr-2"></div>
                    <span className="text-gray-500">Проверка...</span>
                  </div>
                ) : isError ? (
                  <div className="flex items-center text-red-600">
                    <ExclamationCircleIcon className="h-4 w-4 mr-2" />
                    <span>Недоступен</span>
                  </div>
                ) : (
                  <div className="flex items-center text-green-600">
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    <span>Работает</span>
                  </div>
                )}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Keycloak</dt>
              <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500 mr-2"></div>
                    <span className="text-gray-500">Проверка...</span>
                  </div>
                ) : isError ? (
                  <div className="flex items-center text-red-600">
                    <ExclamationCircleIcon className="h-4 w-4 mr-2" />
                    <span>Недоступен</span>
                  </div>
                ) : (
                  <div className="flex items-center text-green-600">
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    <span>Работает</span>
                  </div>
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-500">
        <p>Последнее обновление: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
};

export default SystemHealth;
