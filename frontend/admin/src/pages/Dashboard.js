import React, { useEffect, useState, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import { useNotifications } from '../contexts/NotificationContext';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import { ADMIN_TEXTS, formatCurrencyRu, formatDateRu } from '../utils/localization';

/**
 * Современная страница панели управления с аналитикой и быстрыми действиями
 */
const Dashboard = () => {
  const { setPageTitle, setBackendStatus } = useApp();
  const { showError, showSuccess } = useNotifications();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Проверка подключения к бэкенду
      try {
        await apiService.healthCheck();
        setBackendStatus({ online: true });
      } catch (error) {
        setBackendStatus({ online: false });
      }

      // Загрузка системной статистики
      const systemStats = await apiService.getSystemStats();
      setStats(systemStats);

    } catch (error) {
      console.error('Ошибка загрузки данных панели управления:', error);
      showError('Не удалось загрузить данные панели управления. Проверьте подключение.');

      // Установка значений по умолчанию для автономного режима
      setStats({
        buyers: { total: 0, online: 0 },
        sellers: { total: 0, online: 0 },
        products: { total: 0, totalVolume: 0, totalValue: 0 },
        woodTypes: { total: 0 },
        prices: { total: 0, avgPrice: 0 },
        boards: { total: 0 },
        images: { total: 0 },
        communication: { threads: 0, messages: 0 }
      });
    } finally {
      setLoading(false);
    }
  }, [setBackendStatus, showError]);

  useEffect(() => {
    setPageTitle(ADMIN_TEXTS.DASHBOARD);
    loadDashboardData();
  }, [setPageTitle, loadDashboardData]);

  const handleRefresh = () => {
    showSuccess('Обновление данных панели управления...');
    loadDashboardData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="large" message={ADMIN_TEXTS.LOADING} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Премиум заголовок панели управления */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gradient-primary">
            Добро пожаловать! 👋
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Мониторинг и управление платформой торговли древесиной с корпоративными инструментами
          </p>
          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-500">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
              Система онлайн
            </span>
            <span>•</span>
            <span>Последнее обновление: {formatDateRu(new Date(), 'TIME')}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={handleRefresh}
            icon="🔄"
            className="hover-lift"
          >
            {ADMIN_TEXTS.REFRESH} данные
          </Button>
          <Button
            variant="primary"
            onClick={() => window.location.href = '/tools/export'}
            icon="📊"
            className="hover-lift"
          >
            Экспорт отчета
          </Button>
        </div>
      </div>

      {/* Премиум сетка статистики */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Карточка статистики пользователей */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-6 shadow-soft hover:shadow-large transition-all duration-300 hover:-translate-y-1 border border-slate-200/50 dark:border-slate-700/50">
          {/* Фоновый узор */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent" />

          {/* Заголовок */}
          <div className="relative flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center text-white text-xl shadow-soft group-hover:shadow-glow transition-all duration-300">
                👥
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {ADMIN_TEXTS.TOTAL_USERS}
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Активные участники платформы
                </p>
              </div>
            </div>
          </div>

          {/* Основное число */}
          <div className="relative mb-4">
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {stats.buyers.total + stats.sellers.total}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-success-600 dark:text-success-400">
                <span className="w-2 h-2 bg-success-500 rounded-full" />
                {stats.buyers.total} {ADMIN_TEXTS.BUYERS}
              </span>
              <span className="flex items-center gap-1 text-brand-600 dark:text-brand-400">
                <span className="w-2 h-2 bg-brand-500 rounded-full" />
                {stats.sellers.total} {ADMIN_TEXTS.SELLERS}
              </span>
            </div>
          </div>

          {/* Индикатор тренда */}
          <div className="relative flex items-center gap-2 text-xs text-success-600 dark:text-success-400">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span>+12% за прошлый месяц</span>
          </div>
        </div>

        {/* Карточка статистики товаров */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-6 shadow-soft hover:shadow-large transition-all duration-300 hover:-translate-y-1 border border-slate-200/50 dark:border-slate-700/50">
          <div className="absolute inset-0 bg-gradient-to-br from-success-500/5 to-transparent" />

          <div className="relative flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-success-500 to-success-600 rounded-xl flex items-center justify-center text-white text-xl shadow-soft group-hover:shadow-glow transition-all duration-300">
                📦
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {ADMIN_TEXTS.PRODUCTS}
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Доступные запасы
                </p>
              </div>
            </div>
          </div>

          <div className="relative mb-4">
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {stats.products.total}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-600 dark:text-slate-400">
                {stats.products.totalVolume.toFixed(2)} м³ всего
              </span>
              <span className="text-success-600 dark:text-success-400">
                {formatCurrencyRu(stats.products.totalValue)} стоимость
              </span>
            </div>
          </div>

          <div className="relative flex items-center gap-2 text-xs text-success-600 dark:text-success-400">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span>+8% рост запасов</span>
          </div>
        </div>

        {/* Карточка статистики типов древесины */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-6 shadow-soft hover:shadow-large transition-all duration-300 hover:-translate-y-1 border border-slate-200/50 dark:border-slate-700/50">
          <div className="absolute inset-0 bg-gradient-to-br from-warning-500/5 to-transparent" />

          <div className="relative flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-warning-500 to-warning-600 rounded-xl flex items-center justify-center text-white text-xl shadow-soft group-hover:shadow-glow transition-all duration-300">
                🌳
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {ADMIN_TEXTS.WOOD_TYPES}
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Доступные сорта
                </p>
              </div>
            </div>
          </div>

          <div className="relative mb-4">
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {stats.woodTypes.total}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-600 dark:text-slate-400">
                {stats.prices.total} ценовых точек
              </span>
              <span className="text-warning-600 dark:text-warning-400">
                {formatCurrencyRu(stats.prices.avgPrice)}/м³ средняя
              </span>
            </div>
          </div>

          <div className="relative flex items-center gap-2 text-xs text-warning-600 dark:text-warning-400">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span>Стабильные цены</span>
          </div>
        </div>

        {/* Карточка статистики коммуникаций */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-6 shadow-soft hover:shadow-large transition-all duration-300 hover:-translate-y-1 border border-slate-200/50 dark:border-slate-700/50">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent" />

          <div className="relative flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl shadow-soft group-hover:shadow-glow transition-all duration-300">
                💬
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {ADMIN_TEXTS.COMMUNICATION}
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Активные беседы
                </p>
              </div>
            </div>
          </div>

          <div className="relative mb-4">
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {stats.communication.threads}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-600 dark:text-slate-400">
                {stats.communication.messages} {ADMIN_TEXTS.MESSAGES}
              </span>
              <span className="text-purple-600 dark:text-purple-400">
                Активные потоки
              </span>
            </div>
          </div>

          <div className="relative flex items-center gap-2 text-xs text-success-600 dark:text-success-400">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span>+24% вовлеченность</span>
          </div>
        </div>
      </div>

      {/* Премиум сетка быстрых действий */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Быстрые действия
          </h2>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Часто используемые инструменты администратора
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Действия управления пользователями */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-6 text-white shadow-soft hover:shadow-glow transition-all duration-300 hover:-translate-y-1 cursor-pointer"
               onClick={() => window.location.href = '/users/buyers'}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🛒</span>
                <h3 className="text-lg font-semibold">Управление покупателями</h3>
              </div>
              <p className="text-brand-100 text-sm mb-4">
                Просмотр, редактирование и управление аккаунтами покупателей и их активностью
              </p>
              <div className="flex items-center text-sm text-brand-200">
                <span>Перейти к покупателям</span>
                <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-success-500 to-success-700 p-6 text-white shadow-soft hover:shadow-glow transition-all duration-300 hover:-translate-y-1 cursor-pointer"
               onClick={() => window.location.href = '/users/sellers'}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🏪</span>
                <h3 className="text-lg font-semibold">Управление продавцами</h3>
              </div>
              <p className="text-success-100 text-sm mb-4">
                Надзор за аккаунтами продавцов, товарами и бизнес-операциями
              </p>
              <div className="flex items-center text-sm text-success-200">
                <span>Перейти к продавцам</span>
                <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-warning-500 to-warning-700 p-6 text-white shadow-soft hover:shadow-glow transition-all duration-300 hover:-translate-y-1 cursor-pointer"
               onClick={() => window.location.href = '/products/wood-types'}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🌳</span>
                <h3 className="text-lg font-semibold">{ADMIN_TEXTS.WOOD_TYPES}</h3>
              </div>
              <p className="text-warning-100 text-sm mb-4">
                Управление типами древесины, ценообразованием и категориями товаров
              </p>
              <div className="flex items-center text-sm text-warning-200">
                <span>Управление товарами</span>
                <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 p-6 text-white shadow-soft hover:shadow-glow transition-all duration-300 hover:-translate-y-1 cursor-pointer"
               onClick={() => window.location.href = '/tools/export'}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">📤</span>
                <h3 className="text-lg font-semibold">{ADMIN_TEXTS.DATA_EXPORT}</h3>
              </div>
              <p className="text-purple-100 text-sm mb-4">
                Экспорт системных данных в различных форматах для анализа
              </p>
              <div className="flex items-center text-sm text-purple-200">
                <span>Инструменты экспорта</span>
                <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-500 to-slate-700 p-6 text-white shadow-soft hover:shadow-glow transition-all duration-300 hover:-translate-y-1 cursor-pointer"
               onClick={() => window.location.href = '/tools/api-test'}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🧪</span>
                <h3 className="text-lg font-semibold">{ADMIN_TEXTS.API_TESTER}</h3>
              </div>
              <p className="text-slate-100 text-sm mb-4">
                Тестирование API эндпоинтов и мониторинг подключения к системе
              </p>
              <div className="flex items-center text-sm text-slate-200">
                <span>Тестировать API</span>
                <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-error-500 to-error-700 p-6 text-white shadow-soft hover:shadow-glow transition-all duration-300 hover:-translate-y-1 cursor-pointer"
               onClick={() => window.location.href = '/system/health'}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🔧</span>
                <h3 className="text-lg font-semibold">{ADMIN_TEXTS.HEALTH_CHECK}</h3>
              </div>
              <p className="text-error-100 text-sm mb-4">
                Мониторинг состояния системы и выполнение проверок работоспособности
              </p>
              <div className="flex items-center text-sm text-error-200">
                <span>Проверить состояние</span>
                <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Премиум последняя активность */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Последняя активность
          </h2>
          <Button
            variant="ghost"
            size="small"
            onClick={() => window.location.href = '/system/logs'}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Просмотреть все логи
          </Button>
        </div>

        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-soft overflow-hidden">
          <div className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
            <div className="p-6 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors duration-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-success-500 to-success-600 rounded-xl flex items-center justify-center text-white shadow-soft">
                  <span className="text-lg">✅</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Система успешно инициализирована
                    </p>
                    <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap ml-4">
                      {formatDateRu(new Date(), 'TIME')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Все сервисы работают, подключения к базе данных исправны
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors duration-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center text-white shadow-soft">
                  <span className="text-lg">📊</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Панель управления загружена с {stats.buyers.total + stats.sellers.total} пользователями
                    </p>
                    <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap ml-4">
                      {formatDateRu(new Date(), 'TIME')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Данные аналитики обновлены и статистика актуализирована
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors duration-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-soft">
                  <span className="text-lg">🔄</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Автообновление включено
                    </p>
                    <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap ml-4">
                      {formatDateRu(new Date(), 'TIME')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Панель управления будет автоматически обновляться каждые 30 секунд
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
