import React from 'react';
import ProgressiveStats from '../components/ProgressiveStats';
import Card from '../components/ui/Card';
import {
  ChartBarIcon,
  UsersIcon,
  CubeIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
  PhotoIcon,
  TrendingUpIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

/**
 * Enhanced Analytics Page with Progressive Stats
 * Professional, minimal design suitable for enterprise admin panels
 */
const EnhancedAnalyticsPage = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Расширенная аналитика</h1>
        <p className="mt-1 text-sm text-gray-600">
          Детальная статистика системы с прогрессивной загрузкой данных
        </p>
      </div>

      {/* Progressive Statistics */}
      <ProgressiveStats />

      {/* Additional Analytics Sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUpIcon className="h-6 w-6 text-accent-600" />
            <h3 className="text-lg font-semibold text-gray-900">Тренды активности</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Новые пользователи</span>
              <span className="text-sm font-medium text-green-600">+12% за неделю</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Активность чатов</span>
              <span className="text-sm font-medium text-blue-600">+8% за неделю</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Новые товары</span>
              <span className="text-sm font-medium text-purple-600">+15% за неделю</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <ClockIcon className="h-6 w-6 text-warning-500" />
            <h3 className="text-lg font-semibold text-gray-900">Активность по времени</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Пиковые часы</span>
              <span className="text-sm font-medium text-gray-900">14:00 - 18:00</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Средняя сессия</span>
              <span className="text-sm font-medium text-gray-900">12 минут</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Активных сейчас</span>
              <span className="text-sm font-medium text-green-600">23 пользователя</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Коммуникации</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Среднее время ответа</span>
              <span className="text-sm font-medium text-gray-900">2.5 часа</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Активные диалоги</span>
              <span className="text-sm font-medium text-blue-600">67%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Удовлетворенность</span>
              <span className="text-sm font-medium text-green-600">4.2/5</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <CubeIcon className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Товары и продажи</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Средняя цена</span>
              <span className="text-sm font-medium text-gray-900">15,750 ₽</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Популярная древесина</span>
              <span className="text-sm font-medium text-gray-900">Сосна</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Конверсия</span>
              <span className="text-sm font-medium text-green-600">12.3%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <ChartBarIcon className="h-6 w-6 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Производительность системы</h3>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">99.9%</div>
            <div className="text-sm text-gray-600">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">145ms</div>
            <div className="text-sm text-gray-600">Среднее время ответа</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">2.1GB</div>
            <div className="text-sm text-gray-600">Использование памяти</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">15%</div>
            <div className="text-sm text-gray-600">Загрузка CPU</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EnhancedAnalyticsPage;
