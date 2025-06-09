import React, { useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { BUYER_TEXTS } from '../utils/localization';

const HealthPage = () => {
  const { setPageTitle, backendStatus } = useApp();

  useEffect(() => {
    setPageTitle(BUYER_TEXTS.HEALTH_CHECK);
  }, [setPageTitle]);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">{BUYER_TEXTS.HEALTH_CHECK}</h1>
        <p className="page-description">
          Статус системы и подключения
        </p>
      </div>
      
      <div className="card">
        <div className="health-status">
          <h3>Статус подключения</h3>
          <div className={`status-indicator ${backendStatus?.online ? 'online' : 'offline'}`}>
            <span className="status-dot"></span>
            <span className="status-text">
              {backendStatus?.online ? 'Система онлайн' : 'Система офлайн'}
            </span>
          </div>
          {backendStatus?.lastCheck && (
            <p>Последняя проверка: {new Date(backendStatus.lastCheck).toLocaleString('ru-RU')}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthPage;
