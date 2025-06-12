import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import {
  ChartBarIcon,
  UsersIcon,
  CubeIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

/**
 * Corporate Analytics Page
 * Professional, minimal design suitable for enterprise admin panels
 */
const AnalyticsPage = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Load basic statistics
      const [
        buyersResponse,
        sellersResponse,
        productsResponse,
        woodTypesResponse,
      ] = await Promise.allSettled([
        apiService.getBuyers(0, 1),
        apiService.getSellers(0, 1),
        apiService.getProducts(0, 1),
        apiService.getWoodTypes(0, 1),
      ]);

      setStats({
        totalBuyers: buyersResponse.status === 'fulfilled' ? buyersResponse.value.total : 0,
        totalSellers: sellersResponse.status === 'fulfilled' ? sellersResponse.value.total : 0,
        totalProducts: productsResponse.status === 'fulfilled' ? productsResponse.value.total : 0,
        totalWoodTypes: woodTypesResponse.status === 'fulfilled' ? woodTypesResponse.value.total : 0,
      });
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
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Аналитика</h1>
        <p className="mt-1 text-sm text-gray-600">
          Обзор ключевых метрик и статистики системы
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-8 w-8 text-accent-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Всего покупателей</p>
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
              <p className="text-sm font-medium text-gray-600">Всего продавцов</p>
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
              <p className="text-sm font-medium text-gray-600">Всего товаров</p>
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

      {/* Additional Analytics Sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Активность пользователей</h3>
          <div className="text-center py-12">
            <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">
              Детальная аналитика активности пользователей будет доступна в следующих версиях
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Статистика продаж</h3>
          <div className="text-center py-12">
            <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">
              Аналитика продаж и доходов будет доступна в следующих версиях
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;
