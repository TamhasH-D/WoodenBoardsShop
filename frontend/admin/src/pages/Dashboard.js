import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  UsersIcon,
  CubeIcon,
  ChartBarIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

/**
 * Corporate Dashboard
 * Professional, minimal design suitable for enterprise admin panels
 */
export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);

      // Загружаем статистику параллельно
      const [
        buyersResponse,
        sellersResponse,
        productsResponse,
        woodTypesResponse,
        imagesResponse,
      ] = await Promise.allSettled([
        apiService.getBuyers(0, 1),
        apiService.getSellers(0, 1),
        apiService.getProducts(0, 1),
        apiService.getWoodTypes(0, 1),
        apiService.getImages(0, 1),
      ]);

      const newStats = {
        buyers: buyersResponse.status === 'fulfilled' ? buyersResponse.value.total : 0,
        sellers: sellersResponse.status === 'fulfilled' ? sellersResponse.value.total : 0,
        products: productsResponse.status === 'fulfilled' ? productsResponse.value.total : 0,
        woodTypes: woodTypesResponse.status === 'fulfilled' ? woodTypesResponse.value.total : 0,
        images: imagesResponse.status === 'fulfilled' ? imagesResponse.value.total : 0,
      };

      setStats(newStats);
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
      toast.error('Ошибка загрузки статистики');
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
        <h1 className="text-2xl font-semibold text-gray-900">Панель управления</h1>
        <p className="mt-1 text-sm text-gray-600">
          Обзор системы и ключевые метрики
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-8 w-8 text-accent-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Покупатели</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.buyers || 0}</p>
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
              <p className="text-2xl font-semibold text-gray-900">{stats.sellers || 0}</p>
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
              <p className="text-2xl font-semibold text-gray-900">{stats.products || 0}</p>
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
              <p className="text-2xl font-semibold text-gray-900">{stats.woodTypes || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/users"
            className="group"
          >
            <Card className="p-6 hover:shadow-md transition-shadow duration-150 cursor-pointer">
              <div className="text-center">
                <UsersIcon className="mx-auto h-8 w-8 text-gray-400 group-hover:text-accent-600 transition-colors duration-150" />
                <span className="mt-2 block text-sm font-medium text-gray-900 group-hover:text-accent-700">
                  Управление продавцами и покупателями
                </span>
              </div>
            </Card>
          </Link>

          <Link
            to="/products"
            className="group"
          >
            <Card className="p-6 hover:shadow-md transition-shadow duration-150 cursor-pointer">
              <div className="text-center">
                <CubeIcon className="mx-auto h-8 w-8 text-gray-400 group-hover:text-accent-600 transition-colors duration-150" />
                <span className="mt-2 block text-sm font-medium text-gray-900 group-hover:text-accent-700">
                  Управление товарами
                </span>
              </div>
            </Card>
          </Link>

          <Link
            to="/analytics"
            className="group"
          >
            <Card className="p-6 hover:shadow-md transition-shadow duration-150 cursor-pointer">
              <div className="text-center">
                <ChartBarIcon className="mx-auto h-8 w-8 text-gray-400 group-hover:text-accent-600 transition-colors duration-150" />
                <span className="mt-2 block text-sm font-medium text-gray-900 group-hover:text-accent-700">
                  Просмотр аналитики
                </span>
              </div>
            </Card>
          </Link>

          <Link
            to="/system"
            className="group"
          >
            <Card className="p-6 hover:shadow-md transition-shadow duration-150 cursor-pointer">
              <div className="text-center">
                <CogIcon className="mx-auto h-8 w-8 text-gray-400 group-hover:text-accent-600 transition-colors duration-150" />
                <span className="mt-2 block text-sm font-medium text-gray-900 group-hover:text-accent-700">
                  Настройки системы
                </span>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
