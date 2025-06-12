import React from 'react';
import { useProgressiveStats } from '../hooks/useProgressiveData';
import { apiService } from '../services/api';

const ProgressiveStats = () => {
  const { stats, loading, error, progress, loadingEntity, refetch } = useProgressiveStats(apiService);

  const formatNumber = (num) => {
    if (typeof num !== 'number') return '0';
    return num.toLocaleString('ru-RU');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatVolume = (volume) => {
    return parseFloat(volume).toFixed(2);
  };

  return (
    <div className="progressive-stats">
      {/* Header with refresh button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2>📊 Статистика системы</h2>
          <p style={{ color: '#666', margin: '0.5rem 0 0 0' }}>
            Полная статистика всех сущностей с прогрессивной загрузкой
          </p>
        </div>
        <button
          onClick={refetch}
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Загрузка...' : '🔄 Обновить статистику'}
        </button>
      </div>

      {/* Progress indicator */}
      {loading && (
        <div className="card" style={{ backgroundColor: '#f0f9ff', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div className="loading-spinner"></div>
            <div>
              <h4 style={{ margin: 0 }}>Загрузка данных...</h4>
              <p style={{ margin: '0.25rem 0 0 0', color: '#666' }}>
                {loadingEntity && `Загружаем: ${loadingEntity}`}
              </p>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ 
                width: `${progress.percentage}%`,
                transition: 'width 0.3s ease'
              }}
            ></div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.9em', color: '#666' }}>
            <span>{progress.current} из {progress.total} разделов</span>
            <span>{Math.round(progress.percentage)}%</span>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="error" style={{ marginBottom: '2rem' }}>
          Ошибка загрузки статистики: {error}
        </div>
      )}

      {/* Stats grid */}
      {Object.keys(stats).length > 0 && (
        <div className="stats-grid">
          {/* Users */}
          <div className="stat-card stat-card-users">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>Продавцы и Покупатели</h3>
              <div className="stat-numbers">
                <div className="stat-primary">
                  {formatNumber(stats.buyers?.total || 0)} покупателей
                </div>
                <div className="stat-secondary">
                  {formatNumber(stats.sellers?.total || 0)} продавцов
                </div>
              </div>
              <div className="stat-meta">
                Онлайн: {formatNumber((stats.buyers?.online || 0) + (stats.sellers?.online || 0))}
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="stat-card stat-card-products">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <h3>Товары</h3>
              <div className="stat-numbers">
                <div className="stat-primary">
                  {formatNumber(stats.products?.total || 0)} товаров
                </div>
                <div className="stat-secondary">
                  {formatVolume(stats.products?.totalVolume || 0)} м³
                </div>
              </div>
              <div className="stat-meta">
                Общая стоимость: {formatCurrency(stats.products?.totalValue || 0)}
              </div>
            </div>
          </div>

          {/* Wood Types */}
          <div className="stat-card stat-card-wood">
            <div className="stat-icon">🌳</div>
            <div className="stat-content">
              <h3>Древесина</h3>
              <div className="stat-numbers">
                <div className="stat-primary">
                  {formatNumber(stats.woodTypes?.total || 0)} типов
                </div>
                <div className="stat-secondary">
                  {formatNumber(stats.prices?.total || 0)} цен
                </div>
              </div>
              <div className="stat-meta">
                Средняя цена: {formatCurrency(stats.prices?.avgPrice || 0)} за м³
              </div>
            </div>
          </div>

          {/* Boards */}
          <div className="stat-card stat-card-boards">
            <div className="stat-icon">📏</div>
            <div className="stat-content">
              <h3>Доски</h3>
              <div className="stat-numbers">
                <div className="stat-primary">
                  {formatNumber(stats.boards?.total || 0)} досок
                </div>
              </div>
              <div className="stat-meta">
                Проанализировано YOLO
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="stat-card stat-card-images">
            <div className="stat-icon">🖼️</div>
            <div className="stat-content">
              <h3>Изображения</h3>
              <div className="stat-numbers">
                <div className="stat-primary">
                  {formatNumber(stats.images?.total || 0)} изображений
                </div>
              </div>
              <div className="stat-meta">
                Фото товаров
              </div>
            </div>
          </div>

          {/* Communication */}
          <div className="stat-card stat-card-communication">
            <div className="stat-icon">💬</div>
            <div className="stat-content">
              <h3>Общение</h3>
              <div className="stat-numbers">
                <div className="stat-primary">
                  {formatNumber(stats.threads?.total || 0)} чатов
                </div>
                <div className="stat-secondary">
                  {formatNumber(stats.messages?.total || 0)} сообщений
                </div>
              </div>
              <div className="stat-meta">
                Активные диалоги
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading placeholder */}
      {!loading && Object.keys(stats).length === 0 && !error && (
        <div className="empty-state">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
          <h3>Статистика не загружена</h3>
          <p>Нажмите "Обновить статистику" для загрузки данных</p>
        </div>
      )}
    </div>
  );
};

export default ProgressiveStats;
