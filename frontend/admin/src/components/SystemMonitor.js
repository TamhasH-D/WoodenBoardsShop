import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { apiService } from '../services/api';

function SystemMonitor() {
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [lastUpdate, setLastUpdate] = useState(null);

  const { data: healthData, loading, error, refetch } = useApi(
    () => apiService.getDetailedHealthCheck(),
    []
  );

  // Auto-refresh functionality
  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        refetch();
        setLastUpdate(new Date());
      }, refreshInterval * 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh, refreshInterval, refetch]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
      case 'operational':
      case 'connected':
        return '#10b981'; // green
      case 'unhealthy':
      case 'error':
        return '#ef4444'; // red
      case 'warning':
        return '#f59e0b'; // yellow
      default:
        return '#6b7280'; // gray
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
      case 'operational':
      case 'connected':
        return '✅';
      case 'unhealthy':
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return '❓';
    }
  };



  const formatNumber = (num) => {
    if (typeof num !== 'number') return num;
    return num.toLocaleString();
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3>🖥️ Мониторинг системы</h3>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9em' }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Автообновление
          </label>
          {autoRefresh && (
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
              className="form-input"
              style={{ width: 'auto', fontSize: '0.9em' }}
            >
              <option value={10}>10 сек</option>
              <option value={30}>30 сек</option>
              <option value={60}>1 мин</option>
              <option value={300}>5 мин</option>
            </select>
          )}
          <button onClick={refetch} className="btn btn-secondary" disabled={loading}>
            {loading ? 'Обновление...' : '🔄 Обновить'}
          </button>
        </div>
      </div>

      {/* Last Update Info */}
      {(lastUpdate || healthData?.timestamp) && (
        <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '1rem' }}>
          Последнее обновление: {(lastUpdate || new Date(healthData.timestamp)).toLocaleString()}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="error" style={{ marginBottom: '1rem' }}>
          Ошибка получения данных мониторинга: {error}
        </div>
      )}

      {/* Loading State */}
      {loading && !healthData && (
        <div className="loading">Загрузка данных мониторинга...</div>
      )}

      {/* Health Data Display */}
      {healthData && (
        <>
          {/* Overall Status */}
          <div className="card" style={{ 
            backgroundColor: healthData.status === 'healthy' ? '#f0fdf4' : '#fef2f2',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '2rem' }}>
                {getStatusIcon(healthData.status)}
              </div>
              <div>
                <h4 style={{ margin: 0, color: getStatusColor(healthData.status) }}>
                  Система {healthData.status === 'healthy' ? 'работает нормально' : 'имеет проблемы'}
                </h4>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9em', color: '#666' }}>
                  Статус на {new Date(healthData.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Services Status */}
          <div className="grid grid-3" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
            {Object.entries(healthData.services || {}).map(([service, status]) => (
              <div key={service} className="card" style={{ 
                backgroundColor: status === 'connected' || status === 'operational' ? '#f0fdf4' : '#fef2f2',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                  {getStatusIcon(status)}
                </div>
                <h5 style={{ margin: '0 0 0.25rem 0', textTransform: 'capitalize' }}>
                  {service === 'database' ? 'База данных' : 
                   service === 'redis' ? 'Redis' : 
                   service === 'api' ? 'API' : service}
                </h5>
                <p style={{ 
                  margin: 0, 
                  fontSize: '0.9em', 
                  color: getStatusColor(status),
                  fontWeight: 'bold'
                }}>
                  {status === 'connected' ? 'Подключено' :
                   status === 'operational' ? 'Работает' :
                   status === 'error' ? 'Ошибка' : status}
                </p>
              </div>
            ))}
          </div>

          {/* System Statistics */}
          {healthData.system && (
            <div className="card" style={{ backgroundColor: '#f8fafc', marginBottom: '1.5rem' }}>
              <h4>📊 Статистика системы</h4>
              <div className="grid grid-4" style={{ gap: '1rem' }}>
                {/* Users */}
                <div className="card" style={{ backgroundColor: 'white', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', color: '#3b82f6' }}>👥</div>
                  <h5 style={{ margin: '0.5rem 0 0.25rem 0' }}>Пользователи</h5>
                  <p style={{ margin: 0, fontSize: '1.1em', fontWeight: 'bold' }}>
                    {formatNumber(healthData.system.buyers?.total || 0)} покупателей
                  </p>
                  <p style={{ margin: 0, fontSize: '1.1em', fontWeight: 'bold' }}>
                    {formatNumber(healthData.system.sellers?.total || 0)} продавцов
                  </p>
                  <small style={{ color: '#666' }}>
                    Онлайн: {formatNumber((healthData.system.buyers?.online || 0) + (healthData.system.sellers?.online || 0))}
                  </small>
                </div>

                {/* Products */}
                <div className="card" style={{ backgroundColor: 'white', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', color: '#10b981' }}>📦</div>
                  <h5 style={{ margin: '0.5rem 0 0.25rem 0' }}>Товары</h5>
                  <p style={{ margin: 0, fontSize: '1.1em', fontWeight: 'bold' }}>
                    {formatNumber(healthData.system.products?.total || 0)}
                  </p>
                  <small style={{ color: '#666' }}>
                    Объем: {(healthData.system.products?.totalVolume || 0).toFixed(2)} м³
                  </small>
                </div>

                {/* Wood Types */}
                <div className="card" style={{ backgroundColor: 'white', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', color: '#8b5cf6' }}>🌳</div>
                  <h5 style={{ margin: '0.5rem 0 0.25rem 0' }}>Типы древесины</h5>
                  <p style={{ margin: 0, fontSize: '1.1em', fontWeight: 'bold' }}>
                    {formatNumber(healthData.system.woodTypes?.total || 0)}
                  </p>
                  <small style={{ color: '#666' }}>
                    Цены: {formatNumber(healthData.system.prices?.total || 0)}
                  </small>
                </div>

                {/* Communication */}
                <div className="card" style={{ backgroundColor: 'white', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', color: '#f59e0b' }}>💬</div>
                  <h5 style={{ margin: '0.5rem 0 0.25rem 0' }}>Общение</h5>
                  <p style={{ margin: 0, fontSize: '1.1em', fontWeight: 'bold' }}>
                    {formatNumber(healthData.system.communication?.threads || 0)} чатов
                  </p>
                  <small style={{ color: '#666' }}>
                    Сообщений: {formatNumber(healthData.system.communication?.messages || 0)}
                  </small>
                </div>
              </div>
            </div>
          )}

          {/* Error Details */}
          {healthData.error && (
            <div className="card" style={{ backgroundColor: '#fef2f2', marginBottom: '1rem' }}>
              <h4 style={{ color: '#dc2626' }}>❌ Детали ошибки</h4>
              <pre style={{ 
                backgroundColor: 'white', 
                padding: '1rem', 
                borderRadius: '4px',
                fontSize: '0.9em',
                overflow: 'auto'
              }}>
                {healthData.error}
              </pre>
            </div>
          )}
        </>
      )}

      {/* System Actions */}
      <div className="card" style={{ backgroundColor: '#f1f5f9' }}>
        <h4>⚡ Системные действия</h4>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => window.open('/api/v1/docs', '_blank')}
            className="btn btn-secondary"
            style={{ fontSize: '0.9em' }}
          >
            📚 API Документация
          </button>
          <button
            onClick={() => window.open('/api/v1/health', '_blank')}
            className="btn btn-secondary"
            style={{ fontSize: '0.9em' }}
          >
            🔍 Health Check
          </button>
          <button
            onClick={refetch}
            className="btn btn-secondary"
            disabled={loading}
            style={{ fontSize: '0.9em' }}
          >
            🔄 Принудительное обновление
          </button>
        </div>
      </div>
    </div>
  );
}

export default SystemMonitor;
