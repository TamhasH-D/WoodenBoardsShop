import React, { useCallback } from 'react';
import { useApi } from '../hooks/useApi';
import { apiService } from '../services/api';
import { ADMIN_TEXTS } from '../utils/localization';
import ProgressiveStats from './ProgressiveStats';

const Dashboard = React.memo(() => {
  // Create stable function references to prevent infinite loops
  const fetchSystemStats = useCallback(async () => {
    // Fetch system stats directly
    const result = await apiService.getSystemStats();
    return result;
  }, []);

  const fetchHealthCheck = useCallback(() => apiService.healthCheck(), []);

  // Use regular API hook instead of progressive data to prevent excessive requests
  const { data: stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useApi(
    fetchSystemStats,
    []
  );

  const { data: health, loading: healthLoading, error: healthError } = useApi(
    fetchHealthCheck,
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

      {/* Loading Indicator */}
      {statsLoading && (
        <div className="card mb-6">
          <div className="card-header">
            <h3 className="card-title">{ADMIN_TEXTS.LOADING} статистики системы...</h3>
          </div>
          <div style={{ padding: '1rem' }}>
            <div className="loading">{ADMIN_TEXTS.LOADING} данных...</div>
          </div>
        </div>
      )}

      {/* Quick Stats - Enterprise Style */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 'var(--space-6)',
        marginBottom: 'var(--space-10)'
      }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">{ADMIN_TEXTS.TOTAL_USERS}</h3>
          </div>
          <div className="card-content">
            {statsLoading ? (
              <div style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--space-4)' }}>
                Загрузка данных...
              </div>
            ) : statsError ? (
              <div className="alert-error">Ошибка загрузки данных</div>
            ) : (
              <div>
                <div style={{
                  fontSize: 'var(--font-size-3xl)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-2)'
                }}>
                  {((stats?.buyers?.total || 0) + (stats?.sellers?.total || 0))}
                </div>
                <div style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-muted)',
                  lineHeight: '1.4'
                }}>
                  {stats?.buyers?.total || 0} покупателей, {stats?.sellers?.total || 0} продавцов
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">{ADMIN_TEXTS.TOTAL_PRODUCTS}</h3>
          </div>
          <div className="card-content">
            {statsLoading ? (
              <div style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--space-4)' }}>
                Загрузка...
              </div>
            ) : statsError ? (
              <div className="alert-error">Ошибка загрузки</div>
            ) : (
              <div>
                <div style={{
                  fontSize: 'var(--font-size-3xl)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-2)'
                }}>
                  {stats?.products?.total || 0}
                </div>
                <div style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-muted)'
                }}>
                  Общий объем: {stats?.products?.totalVolume?.toFixed(2) || 0} м³
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">{ADMIN_TEXTS.WOOD_TYPES}</h3>
          </div>
          <div className="card-content">
            {statsLoading ? (
              <div style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--space-4)' }}>
                Загрузка...
              </div>
            ) : statsError ? (
              <div className="alert-error">Ошибка загрузки</div>
            ) : (
              <div>
                <div style={{
                  fontSize: 'var(--font-size-3xl)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-2)'
                }}>
                  {stats?.woodTypes?.total || 0}
                </div>
                <div style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-muted)'
                }}>
                  {stats?.prices?.total || 0} ценовых записей
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">{ADMIN_TEXTS.CHAT_THREADS}</h3>
          </div>
          <div className="card-content">
            {statsLoading ? (
              <div style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--space-4)' }}>
                Загрузка...
              </div>
            ) : statsError ? (
              <div className="alert-error">Ошибка загрузки</div>
            ) : (
              <div>
                <div style={{
                  fontSize: 'var(--font-size-3xl)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-2)'
                }}>
                  {stats?.communication?.threads || 0}
                </div>
                <div style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-muted)'
                }}>
                  {stats?.communication?.messages || 0} всего сообщений
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions - Enterprise Style */}
      <div className="card" style={{ marginBottom: 'var(--space-10)' }}>
        <div className="card-header">
          <h2 className="card-title">Быстрые действия</h2>
          <p className="card-description">Основные операции управления системой</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-4)'
        }}>
          <button
            onClick={refetchStats}
            className="btn btn-primary"
            disabled={statsLoading}
          >
            {statsLoading ? 'Обновление...' : 'Обновить статистику'}
          </button>
          <a href="/users" className="btn btn-secondary">
            Управление продавцами и покупателями
          </a>
          <a href="/products" className="btn btn-secondary">
            Управление товарами
          </a>
          <a href="/wood-types" className="btn btn-secondary">
            Типы древесины
          </a>
        </div>
      </div>

      {/* Progressive Statistics - Real-time data with animations */}
      <ProgressiveStats />
    </div>
  );
});

export default Dashboard;
