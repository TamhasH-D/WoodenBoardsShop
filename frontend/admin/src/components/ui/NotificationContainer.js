import React from 'react';
import { createPortal } from 'react-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import Notification from './Notification';
import './NotificationContainer.css';

/**
 * Container component that renders all notifications in a portal
 */
const NotificationContainer = () => {
  const { notifications } = useNotifications();

  if (notifications.length === 0) {
    return null;
  }

  return createPortal(
    <div className="notification-container">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
        />
      ))}
    </div>,
    document.body
  );
};

export default NotificationContainer;
