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
            Административная панель
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Мониторинг и управление платформой торговли древесиной с корпоративными инструментами
          </p>
          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-500">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
              Система онлайн
            </span>
            <span>|</span>
            <span>Последнее обновление: {formatDateRu(new Date(), 'TIME')}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={handleRefresh}
            className="hover-lift"
          >
            {ADMIN_TEXTS.REFRESH} данные
          </Button>
          <Button
            variant="primary"
            onClick={() => window.location.href = '/tools/export'}
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
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
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

          {/* Статус пользователей */}
          <div className="relative flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span>Активных пользователей: {stats.buyers.online + stats.sellers.online}</span>
          </div>
        </div>

        {/* Карточка статистики товаров */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-6 shadow-soft hover:shadow-large transition-all duration-300 hover:-translate-y-1 border border-slate-200/50 dark:border-slate-700/50">
          <div className="absolute inset-0 bg-gradient-to-br from-success-500/5 to-transparent" />

          <div className="relative flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-success-500 to-success-600 rounded-xl flex items-center justify-center text-white text-xl shadow-soft group-hover:shadow-glow transition-all duration-300">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V7l-7-5z" clipRule="evenodd" />
                </svg>
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

          <div className="relative flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span>Общая стоимость: {formatCurrencyRu(stats.products.totalValue)}</span>
          </div>
        </div>

        {/* Карточка статистики типов древесины */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-6 shadow-soft hover:shadow-large transition-all duration-300 hover:-translate-y-1 border border-slate-200/50 dark:border-slate-700/50">
          <div className="absolute inset-0 bg-gradient-to-br from-warning-500/5 to-transparent" />

          <div className="relative flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-warning-500 to-warning-600 rounded-xl flex items-center justify-center text-white text-xl shadow-soft group-hover:shadow-glow transition-all duration-300">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                </svg>
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

          <div className="relative flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span>Средняя цена: {formatCurrencyRu(stats.prices.avgPrice)}/м³</span>
          </div>
        </div>

        {/* Карточка статистики коммуникаций */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-6 shadow-soft hover:shadow-large transition-all duration-300 hover:-translate-y-1 border border-slate-200/50 dark:border-slate-700/50">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent" />

          <div className="relative flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl shadow-soft group-hover:shadow-glow transition-all duration-300">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
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

          <div className="relative flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span>Всего потоков: {stats.communication.threads}</span>
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
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
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
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
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
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                </svg>
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
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
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
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
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
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
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
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
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
                    Административная панель готова к работе
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors duration-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center text-white shadow-soft">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
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
                    Статистика загружена из базы данных
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors duration-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-soft">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
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
                    Данные обновляются при обновлении страницы
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
