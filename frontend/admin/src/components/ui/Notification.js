import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useNotifications } from '../../contexts/NotificationContext';
import { NOTIFICATION_TYPES } from '../../utils/constants';
import Button from './Button';
import './Notification.css';

/**
 * Individual notification component with animations and actions
 */
const Notification = ({ notification }) => {
  const { removeNotification } = useNotifications();
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      removeNotification(notification.id);
    }, 300); // Match CSS animation duration
  };

  const handleAction = (action) => {
    if (action.onClick) {
      action.onClick(notification);
    }
    if (action.closeOnClick !== false) {
      handleClose();
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return '✅';
      case NOTIFICATION_TYPES.ERROR:
        return '❌';
      case NOTIFICATION_TYPES.WARNING:
        return '⚠️';
      case NOTIFICATION_TYPES.INFO:
      default:
        return 'ℹ️';
    }
  };

  const notificationClasses = [
    'notification',
    `notification--${notification.type}`,
    isVisible && 'notification--visible',
    isExiting && 'notification--exiting'
  ].filter(Boolean).join(' ');

  return (
    <div className={notificationClasses} role="alert" aria-live="polite">
      <div className="notification__icon" aria-hidden="true">
        {getIcon()}
      </div>
      
      <div className="notification__content">
        {notification.title && (
          <div className="notification__title">
            {notification.title}
          </div>
        )}
        
        {notification.message && (
          <div className="notification__message">
            {notification.message}
          </div>
        )}
        
        {notification.actions && notification.actions.length > 0 && (
          <div className="notification__actions">
            {notification.actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'ghost'}
                size="small"
                onClick={() => handleAction(action)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
      
      {!notification.persistent && (
        <button
          className="notification__close"
          onClick={handleClose}
          aria-label="Close notification"
          type="button"
        >
          ✕
        </button>
      )}
    </div>
  );
};

Notification.propTypes = {
  notification: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.oneOf(Object.values(NOTIFICATION_TYPES)).isRequired,
    title: PropTypes.string,
    message: PropTypes.string.isRequired,
    persistent: PropTypes.bool,
    actions: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        onClick: PropTypes.func,
        variant: PropTypes.string,
        closeOnClick: PropTypes.bool
      })
    )
  }).isRequired
};

export default Notification;
