import React, { createContext, useContext, useReducer, useCallback } from 'react';

/**
 * Контекст уведомлений для buyer frontend
 * Управляет toast уведомлениями, алертами и сообщениями
 */

// Начальное состояние
const initialState = {
  notifications: []
};

// Типы действий
const actionTypes = {
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  CLEAR_ALL: 'CLEAR_ALL'
};

// Типы уведомлений
export const notificationTypes = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Генератор ID
let notificationId = 0;
const generateId = () => ++notificationId;

// Редьюсер уведомлений
function notificationReducer(state, action) {
  switch (action.type) {
    case actionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };
      
    case actionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification.id !== action.payload
        )
      };
      
    case actionTypes.CLEAR_ALL:
      return {
        ...state,
        notifications: []
      };
      
    default:
      return state;
  }
}

// Создание контекста
const NotificationContext = createContext();

// Провайдер контекста
export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // Добавление уведомления
  const addNotification = useCallback((notification) => {
    const id = generateId();
    const newNotification = {
      id,
      type: notificationTypes.INFO,
      duration: 5000,
      ...notification,
      timestamp: Date.now()
    };

    dispatch({
      type: actionTypes.ADD_NOTIFICATION,
      payload: newNotification
    });

    // Автоматическое удаление через заданное время
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  // Удаление уведомления
  const removeNotification = useCallback((id) => {
    dispatch({
      type: actionTypes.REMOVE_NOTIFICATION,
      payload: id
    });
  }, []);

  // Очистка всех уведомлений
  const clearAll = useCallback(() => {
    dispatch({ type: actionTypes.CLEAR_ALL });
  }, []);

  // Вспомогательные методы для разных типов уведомлений
  const showSuccess = useCallback((message, options = {}) => {
    return addNotification({
      type: notificationTypes.SUCCESS,
      title: 'Успешно',
      message,
      ...options
    });
  }, [addNotification]);

  const showError = useCallback((message, options = {}) => {
    return addNotification({
      type: notificationTypes.ERROR,
      title: 'Ошибка',
      message,
      duration: 7000, // Ошибки показываем дольше
      ...options
    });
  }, [addNotification]);

  const showWarning = useCallback((message, options = {}) => {
    return addNotification({
      type: notificationTypes.WARNING,
      title: 'Внимание',
      message,
      ...options
    });
  }, [addNotification]);

  const showInfo = useCallback((message, options = {}) => {
    return addNotification({
      type: notificationTypes.INFO,
      title: 'Информация',
      message,
      ...options
    });
  }, [addNotification]);

  // Специальные уведомления для покупателей
  const showCartSuccess = useCallback((productName) => {
    return showSuccess(`Товар "${productName}" добавлен в корзину`, {
      icon: '🛒'
    });
  }, [showSuccess]);

  const showOrderSuccess = useCallback((orderId) => {
    return showSuccess(`Заказ #${orderId} успешно оформлен`, {
      icon: '📦',
      duration: 8000
    });
  }, [showSuccess]);

  const showPaymentSuccess = useCallback(() => {
    return showSuccess('Оплата прошла успешно', {
      icon: '💳',
      duration: 6000
    });
  }, [showSuccess]);

  const showConnectionError = useCallback(() => {
    return showError('Проблемы с подключением к серверу', {
      icon: '🌐',
      duration: 10000
    });
  }, [showError]);

  // Значение контекста
  const value = {
    notifications: state.notifications,
    addNotification,
    removeNotification,
    clearAll,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showCartSuccess,
    showOrderSuccess,
    showPaymentSuccess,
    showConnectionError
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Хук для использования контекста
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
