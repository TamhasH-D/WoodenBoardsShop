import React, { useEffect, useState, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import { useNotifications } from '../contexts/NotificationContext';
import { apiService } from '../services/api';
import { ADMIN_TEXTS, formatCurrencyRu, formatDateRu } from '../utils/localization';

const ProfessionalDashboard = () => {
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
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '60vh',
        flexDirection: 'column',
        gap: 'var(--space-4)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid var(--color-border)',
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: 'var(--color-text-muted)' }}>Загрузка данных...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header Actions */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 'var(--space-8)'
      }}>
        <div>
          <p style={{ 
            color: 'var(--color-text-muted)', 
            fontSize: 'var(--font-size-sm)',
            margin: 0
          }}>
            Последнее обновление: {formatDateRu(new Date(), 'TIME')}
          </p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={handleRefresh}
        >
          Обновить данные
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-4" style={{ marginBottom: 'var(--space-8)' }}>
        {/* Users Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Пользователи</h3>
            <p className="card-description">Активные участники платформы</p>
          </div>
          <div style={{ 
            fontSize: 'var(--font-size-3xl)', 
            fontWeight: '700',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-4)'
          }}>
            {stats.buyers.total + stats.sellers.total}
          </div>
          <div style={{ 
            display: 'flex', 
            gap: 'var(--space-4)', 
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-muted)'
          }}>
            <span>{stats.buyers.total} покупателей</span>
            <span>{stats.sellers.total} продавцов</span>
          </div>
          <div style={{ 
            marginTop: 'var(--space-3)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-muted)'
          }}>
            Онлайн: {stats.buyers.online + stats.sellers.online}
          </div>
        </div>

        {/* Products Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Товары</h3>
            <p className="card-description">Доступные запасы</p>
          </div>
          <div style={{ 
            fontSize: 'var(--font-size-3xl)', 
            fontWeight: '700',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-4)'
          }}>
            {stats.products.total}
          </div>
          <div style={{ 
            display: 'flex', 
            gap: 'var(--space-4)', 
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-muted)'
          }}>
            <span>{stats.products.totalVolume.toFixed(2)} м³</span>
            <span>{formatCurrencyRu(stats.products.totalValue)}</span>
          </div>
        </div>

        {/* Wood Types Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Типы древесины</h3>
            <p className="card-description">Доступные сорта</p>
          </div>
          <div style={{ 
            fontSize: 'var(--font-size-3xl)', 
            fontWeight: '700',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-4)'
          }}>
            {stats.woodTypes.total}
          </div>
          <div style={{ 
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-muted)'
          }}>
            Средняя цена: {formatCurrencyRu(stats.prices.avgPrice)}/м³
          </div>
        </div>

        {/* Communication Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Коммуникации</h3>
            <p className="card-description">Активные беседы</p>
          </div>
          <div style={{ 
            fontSize: 'var(--font-size-3xl)', 
            fontWeight: '700',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-4)'
          }}>
            {stats.communication.threads}
          </div>
          <div style={{ 
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-muted)'
          }}>
            {stats.communication.messages} сообщений
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Быстрые действия</h3>
          <p className="card-description">Часто используемые инструменты</p>
        </div>
        
        <div className="grid grid-3">
          <button 
            className="btn btn-secondary"
            onClick={() => window.location.href = '/users'}
            style={{ 
              height: 'auto',
              padding: 'var(--space-4)',
              textAlign: 'left',
              flexDirection: 'column',
              alignItems: 'flex-start'
            }}
          >
            <strong>Управление пользователями</strong>
            <span style={{ 
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-muted)',
              marginTop: 'var(--space-2)'
            }}>
              Просмотр и редактирование аккаунтов
            </span>
          </button>

          <button 
            className="btn btn-secondary"
            onClick={() => window.location.href = '/products'}
            style={{ 
              height: 'auto',
              padding: 'var(--space-4)',
              textAlign: 'left',
              flexDirection: 'column',
              alignItems: 'flex-start'
            }}
          >
            <strong>Управление товарами</strong>
            <span style={{ 
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-muted)',
              marginTop: 'var(--space-2)'
            }}>
              Товары и типы древесины
            </span>
          </button>

          <button 
            className="btn btn-secondary"
            onClick={() => window.location.href = '/analytics'}
            style={{ 
              height: 'auto',
              padding: 'var(--space-4)',
              textAlign: 'left',
              flexDirection: 'column',
              alignItems: 'flex-start'
            }}
          >
            <strong>Аналитика</strong>
            <span style={{ 
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-muted)',
              marginTop: 'var(--space-2)'
            }}>
              Отчеты и статистика
            </span>
          </button>
        </div>
      </div>

      {/* System Status */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Состояние системы</h3>
          <p className="card-description">Текущий статус компонентов</p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'var(--space-3)',
            background: 'var(--color-bg-secondary)',
            borderRadius: 'var(--border-radius)',
            fontSize: 'var(--font-size-sm)'
          }}>
            <span>Административная панель</span>
            <span style={{ 
              color: 'var(--color-success)',
              fontWeight: '500'
            }}>
              Готова к работе
            </span>
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'var(--space-3)',
            background: 'var(--color-bg-secondary)',
            borderRadius: 'var(--border-radius)',
            fontSize: 'var(--font-size-sm)'
          }}>
            <span>База данных</span>
            <span style={{ 
              color: 'var(--color-success)',
              fontWeight: '500'
            }}>
              Подключена
            </span>
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'var(--space-3)',
            background: 'var(--color-bg-secondary)',
            borderRadius: 'var(--border-radius)',
            fontSize: 'var(--font-size-sm)'
          }}>
            <span>Обновление данных</span>
            <span style={{ 
              color: 'var(--color-text-muted)',
              fontWeight: '500'
            }}>
              При обновлении страницы
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ProfessionalDashboard;
