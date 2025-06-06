import React from 'react';
import { useApi } from '../hooks/useApi';
import { apiService } from '../services/api';
import { useProgressiveData } from '../hooks/usePaginatedData';
import { ADMIN_TEXTS } from '../utils/localization';

const Dashboard = React.memo(() => {
  const { data: stats, loading: statsLoading, error: statsError, refetch: refetchStats, progress } = useProgressiveData(
    async (_offset, _limit) => {
      // Use progressive loading for system stats
      const result = await apiService.getSystemStats();
      return {
        data: [result], // Wrap single result in array for progressive loader
        total: 1,
        pagination: { total: 1 }
      };
    },
    []
  );

  const { data: health, loading: healthLoading, error: healthError } = useApi(
    () => apiService.healthCheck(),
    []
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{ADMIN_TEXTS.DASHBOARD}</h1>
        <p className="page-description">{ADMIN_TEXTS.OVERVIEW} платформы торговли древесиной</p>
      </div>

      {/* System Status */}
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="card-title">{ADMIN_TEXTS.BACKEND_STATUS}</h2>
        </div>

        {healthLoading && <div className="loading">{ADMIN_TEXTS.HEALTH_CHECK}...</div>}

        {healthError && (
          <div className="error">
            <strong>{ADMIN_TEXTS.SYSTEM_ERROR}:</strong> {healthError}
          </div>
        )}

        {health && !healthError && (
          <div className="success">
            <strong>{ADMIN_TEXTS.SYSTEM_HEALTHY}</strong> - Все сервисы работают нормально
          </div>
        )}
      </div>

      {/* Loading Progress */}
      {statsLoading && progress && progress.total > 0 && (
        <div className="card mb-6">
          <div className="card-header">
            <h3 className="card-title">{ADMIN_TEXTS.LOADING} полного набора данных...</h3>
          </div>
          <div style={{ padding: '1rem' }}>
            <div style={{
              width: '100%',
              backgroundColor: 'var(--color-bg-light)',
              borderRadius: '0.5rem',
              overflow: 'hidden',
              marginBottom: '0.5rem'
            }}>
              <div style={{
                width: `${(progress.loaded / progress.total) * 100}%`,
                height: '0.5rem',
                backgroundColor: 'var(--color-primary)',
                transition: 'width 0.3s ease'
              }} />
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-light)', margin: 0 }}>
              {ADMIN_TEXTS.LOADING} {progress.loaded} из {progress.total} страниц данных для точной статистики...
            </p>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-4 mb-6">
        <div className="card">
          <h3>{ADMIN_TEXTS.TOTAL_USERS}</h3>
          {statsLoading ? (
            <div className="loading">{ADMIN_TEXTS.LOADING} полного набора данных...</div>
          ) : statsError ? (
            <div className="error">{ADMIN_TEXTS.OPERATION_FAILED}</div>
          ) : (
            <div>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                {((stats?.[0]?.buyers?.total || 0) + (stats?.[0]?.sellers?.total || 0))}
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-600)' }}>
                {stats?.[0]?.buyers?.total || 0} {ADMIN_TEXTS.BUYERS.toLowerCase()}, {stats?.[0]?.sellers?.total || 0} {ADMIN_TEXTS.SELLERS.toLowerCase()}
              </p>
            </div>
          )}
        </div>

        <div className="card">
          <h3>{ADMIN_TEXTS.TOTAL_PRODUCTS}</h3>
          {statsLoading ? (
            <div className="loading">{ADMIN_TEXTS.LOADING}...</div>
          ) : statsError ? (
            <div className="error">{ADMIN_TEXTS.OPERATION_FAILED}</div>
          ) : (
            <div>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                {stats?.[0]?.products?.total || 0}
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-600)' }}>
                Общий объем: {stats?.[0]?.products?.totalVolume?.toFixed(2) || 0} м³
              </p>
            </div>
          )}
        </div>

        <div className="card">
          <h3>{ADMIN_TEXTS.WOOD_TYPES}</h3>
          {statsLoading ? (
            <div className="loading">{ADMIN_TEXTS.LOADING}...</div>
          ) : statsError ? (
            <div className="error">{ADMIN_TEXTS.OPERATION_FAILED}</div>
          ) : (
            <div>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                {stats?.[0]?.woodTypes?.total || 0}
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-600)' }}>
                {stats?.[0]?.prices?.total || 0} ценовых записей
              </p>
            </div>
          )}
        </div>

        <div className="card">
          <h3>{ADMIN_TEXTS.CHAT_THREADS}</h3>
          {statsLoading ? (
            <div className="loading">{ADMIN_TEXTS.LOADING}...</div>
          ) : statsError ? (
            <div className="error">{ADMIN_TEXTS.OPERATION_FAILED}</div>
          ) : (
            <div>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                {stats?.[0]?.communication?.threads || 0}
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-600)' }}>
                {stats?.[0]?.communication?.messages || 0} всего сообщений
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="card-title">Быстрые действия</h2>
        </div>

        <div className="flex gap-4">
          <button
            onClick={refetchStats}
            className="btn btn-primary"
            disabled={statsLoading}
          >
            {statsLoading ? 'Обновление...' : `${ADMIN_TEXTS.REFRESH} ${ADMIN_TEXTS.STATISTICS}`}
          </button>
          <a href="/users" className="btn btn-secondary">
            {ADMIN_TEXTS.USER_MANAGEMENT}
          </a>
          <a href="/products" className="btn btn-secondary">
            {ADMIN_TEXTS.PRODUCT_MANAGEMENT}
          </a>
          <a href="/wood-types" className="btn btn-secondary">
            {ADMIN_TEXTS.WOOD_TYPE_MANAGEMENT}
          </a>
        </div>
      </div>

      {/* Platform Overview */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">{ADMIN_TEXTS.OVERVIEW} платформы</h2>
        </div>

        <div className="grid grid-2">
          <div>
            <h3>Активность пользователей</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <strong>{ADMIN_TEXTS.BUYERS} онлайн:</strong> {stats?.[0]?.buyers?.online || 0}
              </li>
              <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <strong>{ADMIN_TEXTS.SELLERS} онлайн:</strong> {stats?.[0]?.sellers?.online || 0}
              </li>
              <li style={{ padding: '0.5rem 0' }}>
                <strong>Всего активных пользователей:</strong> {(stats?.[0]?.buyers?.online || 0) + (stats?.[0]?.sellers?.online || 0)}
              </li>
            </ul>
          </div>

          <div>
            <h3>Метрики платформы</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <strong>Средняя цена:</strong> {stats?.[0]?.prices?.avgPrice?.toFixed(2) || 0} ₽/м³
              </li>
              <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <strong>Общая стоимость:</strong> {stats?.[0]?.products?.totalValue?.toFixed(2) || 0} ₽
              </li>
              <li style={{ padding: '0.5rem 0' }}>
                <strong>{ADMIN_TEXTS.WOODEN_BOARDS}:</strong> {stats?.[0]?.boards?.total || 0}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Dashboard;
