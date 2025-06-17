/**
 * Utility functions for date and time formatting
 */

/**
 * Format time for chat messages
 * @param {string|Date} timestamp - The timestamp to format
 * @returns {string} Formatted time string
 */
export const formatTime = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMs = now - date;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  // Если сообщение отправлено менее минуты назад
  if (diffInMinutes < 1) {
    return 'только что';
  }

  // Если сообщение отправлено менее часа назад
  if (diffInMinutes < 60) {
    return `${diffInMinutes} мин назад`;
  }

  // Если сообщение отправлено сегодня
  if (diffInHours < 24 && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Если сообщение отправлено вчера
  if (diffInDays === 1) {
    return `вчера в ${date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    })}`;
  }

  // Если сообщение отправлено на этой неделе
  if (diffInDays < 7) {
    const weekdays = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
    return `${weekdays[date.getDay()]} в ${date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    })}`;
  }

  // Для более старых сообщений
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: diffInDays > 365 ? '2-digit' : undefined
  });
};

/**
 * Format date for chat thread list
 * @param {string|Date} timestamp - The timestamp to format
 * @returns {string} Formatted date string
 */
export const formatChatDate = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMs = now - date;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  // Если сегодня
  if (diffInDays === 0 && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Если вчера
  if (diffInDays === 1) {
    return 'вчера';
  }

  // Если на этой неделе
  if (diffInDays < 7) {
    const weekdays = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
    return weekdays[date.getDay()];
  }

  // Для более старых дат
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: diffInDays > 365 ? '2-digit' : undefined
  });
};

/**
 * Check if timestamp is today
 * @param {string|Date} timestamp - The timestamp to check
 * @returns {boolean} True if timestamp is today
 */
export const isToday = (timestamp) => {
  if (!timestamp) return false;
  
  const date = new Date(timestamp);
  const now = new Date();
  
  return date.getDate() === now.getDate() &&
         date.getMonth() === now.getMonth() &&
         date.getFullYear() === now.getFullYear();
};

/**
 * Check if timestamp is yesterday
 * @param {string|Date} timestamp - The timestamp to check
 * @returns {boolean} True if timestamp is yesterday
 */
export const isYesterday = (timestamp) => {
  if (!timestamp) return false;
  
  const date = new Date(timestamp);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  return date.getDate() === yesterday.getDate() &&
         date.getMonth() === yesterday.getMonth() &&
         date.getFullYear() === yesterday.getFullYear();
};
