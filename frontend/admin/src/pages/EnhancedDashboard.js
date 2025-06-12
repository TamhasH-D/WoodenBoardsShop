import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ProgressiveStats from '../components/ProgressiveStats';
import toast from 'react-hot-toast';
import {
  UsersIcon,
  CubeIcon,
  ChartBarIcon,
  CogIcon,
  ChatBubbleLeftRightIcon,
  PhotoIcon,
  WrenchScrewdriverIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

/**
 * Enhanced Corporate Dashboard
 * Professional, minimal design suitable for enterprise admin panels
 */
export default function EnhancedDashboard() {
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSystemHealth();
  }, []);

  const loadSystemHealth = async () => {
    try {
      setLoading(true);
      const health = await apiService.healthCheck();
      setSystemHealth(health);
    } catch (error) {
      console.error('Ошибка загрузки состояния системы:', error);
      toast.error('Ошибка подключения к системе');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Управление пользователями',
      description: 'Покупатели и продавцы',
      href: '/users',
      icon: UsersIcon,
      color: 'accent'
    },
    {
      title: 'Управление товарами',
      description: 'Товары и типы древесины',
      href: '/products',
      icon: CubeIcon,
      color: 'warning'
    },
    {
      title: 'Коммуникации',
      description: 'Чаты и сообщения',
      href: '/communication',
      icon: ChatBubbleLeftRightIcon,
      color: 'blue'
    },
    {
      title: 'Медиа и файлы',
      description: 'Изображения и доски',
      href: '/media',
      icon: PhotoIcon,
      color: 'purple'
    },
    {
      title: 'Инструменты',
      description: 'Экспорт и анализ',
      href: '/tools',
      icon: WrenchScrewdriverIcon,
      color: 'green'
    },
    {
      title: 'Расширенная аналитика',
      description: 'Детальная статистика',
      href: '/analytics',
      icon: ChartBarIcon,
      color: 'indigo'
    },
    {
      title: 'Настройки системы',
      description: 'Конфигурация и логи',
      href: '/system',
      icon: CogIcon,
      color: 'gray'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      accent: 'text-accent-600 group-hover:text-accent-700',
      warning: 'text-warning-500 group-hover:text-warning-600',
      blue: 'text-blue-600 group-hover:text-blue-700',
      purple: 'text-purple-600 group-hover:text-purple-700',
      green: 'text-green-600 group-hover:text-green-700',
      indigo: 'text-indigo-600 group-hover:text-indigo-700',
      gray: 'text-gray-600 group-hover:text-gray-700'
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Панель управления</h1>
          <p className="mt-1 text-sm text-gray-600">
            Добро пожаловать в административную панель WoodenBoardsShop
          </p>
        </div>
        <div className="flex items-center gap-3">
          {loading ? (
            <LoadingSpinner />
          ) : systemHealth ? (
            <div className="flex items-center gap-2 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">Система работает</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600">
              <ExclamationTriangleIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Проблемы с подключением</span>
            </div>
          )}
        </div>
      </div>

      {/* Progressive Statistics */}
      <ProgressiveStats />

      {/* System Status */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Активность сегодня</p>
              <p className="text-2xl font-semibold text-gray-900">+24%</p>
              <p className="text-xs text-green-600">↑ по сравнению с вчера</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <ClockIcon className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Среднее время ответа</p>
              <p className="text-2xl font-semibold text-gray-900">145ms</p>
              <p className="text-xs text-blue-600">Отличная производительность</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <ChatBubbleLeftRightIcon className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Активные диалоги</p>
              <p className="text-2xl font-semibold text-gray-900">23</p>
              <p className="text-xs text-purple-600">Требуют внимания: 3</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Быстрые действия</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                to={action.href}
                className="group"
              >
                <Card className="p-6 hover:shadow-md transition-all duration-150 cursor-pointer border-l-4 border-l-transparent hover:border-l-accent-500">
                  <div className="flex items-start gap-4">
                    <Icon className={`h-8 w-8 flex-shrink-0 transition-colors duration-150 ${getColorClasses(action.color)}`} />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-medium text-gray-900 group-hover:text-accent-700 transition-colors duration-150">
                        {action.title}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Последняя активность</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Новый пользователь зарегистрировался</span>
            <span className="text-gray-400 ml-auto">2 минуты назад</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">Добавлен новый товар</span>
            <span className="text-gray-400 ml-auto">15 минут назад</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-gray-600">Новое сообщение в чате</span>
            <span className="text-gray-400 ml-auto">1 час назад</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
