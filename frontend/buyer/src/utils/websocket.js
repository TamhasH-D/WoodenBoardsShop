/**
 * WebSocket utilities for chat functionality
 */

/**
 * Get WebSocket URL for chat
 * @param {string} threadId - Chat thread ID
 * @param {string} userId - User ID
 * @param {string} userType - User type ('buyer' or 'seller')
 * @returns {string} WebSocket URL
 */
export const getChatWebSocketUrl = (threadId, userId, userType) => {
  const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  // Правильное преобразование HTTP/HTTPS в WS/WSS
  let wsBaseUrl;
  if (apiBaseUrl.startsWith('https://')) {
    wsBaseUrl = apiBaseUrl.replace('https://', 'wss://');
  } else if (apiBaseUrl.startsWith('http://')) {
    wsBaseUrl = apiBaseUrl.replace('http://', 'ws://');
  } else {
    // Fallback для случаев без протокола
    wsBaseUrl = `ws://${apiBaseUrl}`;
  }

  const wsUrl = `${wsBaseUrl}/ws/chat/${threadId}?user_id=${userId}&user_type=${userType}`;
  console.log('[WebSocket] Generated URL:', wsUrl);
  return wsUrl;
};

/**
 * WebSocket connection states
 */
export const WS_STATES = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
};

/**
 * WebSocket message types
 */
export const WS_MESSAGE_TYPES = {
  MESSAGE: 'message',
  TYPING: 'typing',
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left'
};
