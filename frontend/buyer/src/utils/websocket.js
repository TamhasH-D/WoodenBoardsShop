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
  const wsBaseUrl = apiBaseUrl.replace(/^https?/, 'ws');
  return `${wsBaseUrl}/ws/chat/${threadId}?user_id=${userId}&user_type=${userType}`;
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
