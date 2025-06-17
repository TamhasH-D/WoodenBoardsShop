import { useState, useEffect, useCallback } from 'react';
import { playSound, SOUNDS } from '../utils/soundUtils';

/**
 * Hook for managing chat notifications
 */
export const useNotifications = () => {
  const [permission, setPermission] = useState(Notification.permission);
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && permission === 'default') {
      Notification.requestPermission().then(setPermission);
    }
  }, [permission]);

  // Load preferences from localStorage
  useEffect(() => {
    try {
      const soundsPref = localStorage.getItem('chat_sounds_enabled');
      if (soundsPref !== null) {
        setSoundsEnabled(soundsPref === 'true');
      }

      const notificationsPref = localStorage.getItem('chat_notifications_enabled');
      if (notificationsPref !== null) {
        setNotificationsEnabled(notificationsPref === 'true');
      }
    } catch (error) {
      console.warn('Failed to load notification preferences', error);
    }
  }, []);

  /**
   * Show browser notification
   */
  const showNotification = useCallback((title, options = {}) => {
    if (!notificationsEnabled || permission !== 'granted') return;

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'chat-notification',
        renotify: true,
        ...options
      });

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    } catch (error) {
      console.warn('Failed to show notification', error);
    }
  }, [notificationsEnabled, permission]);

  /**
   * Show notification for new message
   */
  const notifyNewMessage = useCallback((senderName, message, threadId) => {
    // Play sound
    if (soundsEnabled) {
      playSound(SOUNDS.NEW_MESSAGE);
    }

    // Show browser notification
    showNotification(`Новое сообщение от ${senderName}`, {
      body: message.length > 100 ? `${message.substring(0, 100)}...` : message,
      data: { threadId },
      actions: [
        { action: 'reply', title: 'Ответить' },
        { action: 'view', title: 'Просмотреть' }
      ]
    });
  }, [soundsEnabled, showNotification]);

  /**
   * Show notification for message sent
   */
  const notifyMessageSent = useCallback(() => {
    if (soundsEnabled) {
      playSound(SOUNDS.MESSAGE_SENT);
    }
  }, [soundsEnabled]);

  /**
   * Show notification for connection status
   */
  const notifyConnection = useCallback((connected) => {
    if (soundsEnabled) {
      playSound(connected ? SOUNDS.CONNECT : SOUNDS.DISCONNECT);
    }

    if (notificationsEnabled) {
      showNotification(
        connected ? 'Подключено к чату' : 'Отключено от чата',
        {
          body: connected 
            ? 'Соединение с чатом восстановлено' 
            : 'Попытка переподключения...',
          tag: 'connection-status'
        }
      );
    }
  }, [soundsEnabled, notificationsEnabled, showNotification]);

  /**
   * Show error notification
   */
  const notifyError = useCallback((message) => {
    if (soundsEnabled) {
      playSound(SOUNDS.ERROR);
    }

    if (notificationsEnabled) {
      showNotification('Ошибка чата', {
        body: message,
        tag: 'chat-error'
      });
    }
  }, [soundsEnabled, notificationsEnabled, showNotification]);

  /**
   * Toggle sounds
   */
  const toggleSounds = useCallback(() => {
    const newValue = !soundsEnabled;
    setSoundsEnabled(newValue);
    
    try {
      localStorage.setItem('chat_sounds_enabled', newValue.toString());
    } catch (error) {
      console.warn('Failed to save sounds preference', error);
    }
  }, [soundsEnabled]);

  /**
   * Toggle notifications
   */
  const toggleNotifications = useCallback(() => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    
    try {
      localStorage.setItem('chat_notifications_enabled', newValue.toString());
    } catch (error) {
      console.warn('Failed to save notifications preference', error);
    }
  }, [notificationsEnabled]);

  /**
   * Request notification permission
   */
  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    return 'denied';
  }, []);

  return {
    // State
    permission,
    soundsEnabled,
    notificationsEnabled,
    
    // Notification functions
    notifyNewMessage,
    notifyMessageSent,
    notifyConnection,
    notifyError,
    showNotification,
    
    // Settings
    toggleSounds,
    toggleNotifications,
    requestPermission,
    
    // Utilities
    canShowNotifications: permission === 'granted' && notificationsEnabled,
    canPlaySounds: soundsEnabled
  };
};
