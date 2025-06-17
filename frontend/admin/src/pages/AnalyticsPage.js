import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import {
  ChartBarIcon,
  UsersIcon,
  CubeIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

/**
 * Corporate Analytics Page
 * Professional, minimal design suitable for enterprise admin panels
 */
const AnalyticsPage = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Load basic statistics with proper error handling
      const [
        buyersResponse,
        sellersResponse,
        productsResponse,
        woodTypesResponse,
        pricesResponse,
        boardsResponse,
        imagesResponse,
      ] = await Promise.allSettled([
        apiService.getBuyers(0, 1),
        apiService.getSellers(0, 1),
        apiService.getProducts(0, 1),
        apiService.getWoodTypes(0, 1),
        apiService.getWoodTypePrices(0, 1),
        apiService.getWoodenBoards(0, 1),
        apiService.getImages(0, 1),
      ]);

      const newStats = {
        totalBuyers: buyersResponse.status === 'fulfilled' ? buyersResponse.value.total : 0,
        totalSellers: sellersResponse.status === 'fulfilled' ? sellersResponse.value.total : 0,
        totalProducts: productsResponse.status === 'fulfilled' ? productsResponse.value.total : 0,
        totalWoodTypes: woodTypesResponse.status === 'fulfilled' ? woodTypesResponse.value.total : 0,
        totalPrices: pricesResponse.status === 'fulfilled' ? pricesResponse.value.total : 0,
        totalBoards: boardsResponse.status === 'fulfilled' ? boardsResponse.value.total : 0,
        totalImages: imagesResponse.status === 'fulfilled' ? imagesResponse.value.total : 0,
      };

      setStats(newStats);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Ошибка загрузки аналитики:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Аналитика</h1>
          <p className="mt-1 text-sm text-gray-600">
            Обзор ключевых метрик и статистики системы
          </p>
          {lastUpdated && (
            <p className="mt-1 text-xs text-gray-500">
              Последнее обновление: {lastUpdated.toLocaleString('ru-RU')}
            </p>
          )}
        </div>
        <Button
          onClick={loadAnalytics}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <ArrowPathIcon className="h-4 w-4" />
          {loading ? 'Обновление...' : 'Обновить'}
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-8 w-8 text-accent-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Покупатели</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalBuyers || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-8 w-8 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Продавцы</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalSellers || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CubeIcon className="h-8 w-8 text-warning-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Товары</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalProducts || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Типы древесины</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalWoodTypes || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Цены на древесину</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalPrices || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CubeIcon className="h-8 w-8 text-amber-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Деревянные доски</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalBoards || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Изображения</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalImages || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Web Analytics */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Веб-аналитика</h2>
          <p className="mt-1 text-sm text-gray-600">
            Статистика посещений и активности пользователей на сайте
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Buyer Analytics */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Аналитика buyer.taruman.ru
                </h3>
                <p className="text-sm text-gray-600">
                  Статистика посещений покупательского сайта
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <a
                href="https://umami.taruman.ru/share/EXW7Hzbt1vQxAoLu/buyer.taruman.ru"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-4 py-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors duration-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-blue-900">
                      📊 Публичная аналитика
                    </div>
                    <div className="text-xs text-blue-700">
                      Основные метрики и статистика посещений
                    </div>
                  </div>
                  <div className="text-blue-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </div>
              </a>
            </div>
          </Card>

          {/* Full Umami Analytics */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <ChartBarIcon className="h-8 w-8 text-purple-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Полная аналитика Umami
                </h3>
                <p className="text-sm text-gray-600">
                  Расширенная статистика и детальные отчеты
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <a
                href="https://umami.taruman.ru"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-4 py-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors duration-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-purple-900">
                      🔐 Административная панель
                    </div>
                    <div className="text-xs text-purple-700">
                      Полный доступ ко всем метрикам и настройкам
                    </div>
                  </div>
                  <div className="text-purple-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </div>
              </a>

              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <strong>Примечание:</strong> Для доступа к полной аналитике требуется авторизация администратора в системе Umami.
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

    </div>
  );
};

export default AnalyticsPage;
