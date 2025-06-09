import React from 'react';
import { useNotifications } from '../../contexts/NotificationContext';

/**
 * Контейнер уведомлений с премиум анимациями
 * Показывает toast уведомления в правом верхнем углу
 */
const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  );
};

/**
 * Отдельный компонент уведомления
 */
const NotificationItem = ({ notification, onRemove }) => {
  const { id, type, title, message, icon } = notification;

  const handleClose = () => {
    onRemove(id);
  };

  const getIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={`notification notification-${type}`}>
      {/* Иконка */}
      <div className="notification-icon">
        {getIcon()}
      </div>

      {/* Контент */}
      <div className="notification-content">
        {title && (
          <div className="notification-title">
            {title}
          </div>
        )}
        <div className="notification-message">
          {message}
        </div>
      </div>

      {/* Кнопка закрытия */}
      <button
        onClick={handleClose}
        className="notification-close"
        aria-label="Закрыть уведомление"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M18 6L6 18M6 6L18 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Прогресс-бар */}
      <div className="notification-progress">
        <div className="notification-progress-bar"></div>
      </div>
    </div>
  );
};

export default NotificationContainer;
