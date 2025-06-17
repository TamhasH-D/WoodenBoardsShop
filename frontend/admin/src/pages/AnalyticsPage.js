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

        <Card className="p-0 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ChartBarIcon className="h-5 w-5 text-gray-600" />
                <h3 className="text-sm font-medium text-gray-900">
                  Аналитика buyer.taruman.ru
                </h3>
              </div>
              <a
                href="https://umami.taruman.ru/share/EXW7Hzbt1vQxAoLu/buyer.taruman.ru"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Открыть в новой вкладке
              </a>
            </div>
          </div>

          <div className="relative">
            <iframe
              src="https://umami.taruman.ru/share/EXW7Hzbt1vQxAoLu/buyer.taruman.ru"
              width="100%"
              height="600"
              frameBorder="0"
              title="Umami Analytics - buyer.taruman.ru"
              className="w-full"
              style={{ minHeight: '600px' }}
            />

            {/* Loading overlay */}
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center pointer-events-none opacity-0 transition-opacity duration-300">
              <div className="text-center">
                <LoadingSpinner />
                <p className="mt-2 text-sm text-gray-600">Загрузка аналитики...</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

    </div>
  );
};

export default AnalyticsPage;
