/**
 * WebSocket менеджер для чата (Seller Frontend)
 */

// WebSocket состояния
export const WS_STATES = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
};

// Типы сообщений
export const WS_MESSAGE_TYPES = {
  MESSAGE: 'message',
  TYPING: 'typing',
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',
  PING: 'ping',
  PONG: 'pong',
  ERROR: 'error'
};

/**
 * Получить WebSocket URL для чата
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

  return `${wsBaseUrl}/ws/chat/${threadId}?user_id=${userId}&user_type=${userType}`;
};

/**
 * Информация о соединении
 */
class ConnectionInfo {
  constructor(ws, threadId, userId, userType, onStatusChange) {
    this.ws = ws;
    this.threadId = threadId;
    this.userId = userId;
    this.userType = userType;
    this.onStatusChange = onStatusChange;
    this.reconnectAttempts = 0;
    this.isConnecting = false;
    this.lastPingTime = Date.now();
    this.pingInterval = null;
    this.reconnectTimeout = null;
  }
}

/**
 * Централизованный WebSocket менеджер для чата
 */
class WebSocketManager {
  constructor() {
    this.connections = new Map(); // threadId -> ConnectionInfo
    this.messageHandlers = new Map(); // threadId -> Set of handlers
    this.globalHandlers = new Set(); // Global message handlers
    this.maxReconnectAttempts = 5;
    this.baseReconnectDelay = 1000; // 1 секунда
    this.maxReconnectDelay = 30000; // 30 секунд
    this.pingInterval = 30000; // 30 секунд
    this.pongTimeout = 10000; // 10 секунд
  }

  /**
   * Подключиться к WebSocket
   */
  connect(threadId, userId, userType, onStatusChange) {
    console.log(`[WebSocketManager] Connecting to ${threadId}:`, { userId, userType });

    // Закрываем существующее соединение если есть
    this.disconnect(threadId);

    const wsUrl = getChatWebSocketUrl(threadId, userId, userType);
    console.log(`[WebSocketManager] WebSocket URL:`, wsUrl);

    try {
      const ws = new WebSocket(wsUrl);
      const connectionInfo = new ConnectionInfo(ws, threadId, userId, userType, onStatusChange);

      this.connections.set(threadId, connectionInfo);
      this.setupWebSocketHandlers(connectionInfo);

      return true;
    } catch (error) {
      console.error(`[WebSocketManager] Failed to create WebSocket for ${threadId}:`, error);
      onStatusChange && onStatusChange(false);
      return false;
    }
  }

  /**
   * Отключиться от WebSocket
   */
  disconnect(threadId) {
    const connectionInfo = this.connections.get(threadId);
    if (!connectionInfo) return;

    console.log(`[WebSocketManager] Disconnecting from ${threadId}`);

    // Останавливаем ping
    this.stopPing(connectionInfo);

    // Останавливаем переподключение
    if (connectionInfo.reconnectTimeout) {
      clearTimeout(connectionInfo.reconnectTimeout);
      connectionInfo.reconnectTimeout = null;
    }

    // Закрываем WebSocket
    if (connectionInfo.ws && connectionInfo.ws.readyState !== WS_STATES.CLOSED) {
      connectionInfo.ws.close();
    }

    this.connections.delete(threadId);
  }

  /**
   * Отправить сообщение
   */
  sendMessage(threadId, message) {
    const connectionInfo = this.connections.get(threadId);
    if (!connectionInfo || connectionInfo.ws.readyState !== WS_STATES.OPEN) {
      console.warn(`[WebSocketManager] Cannot send message to ${threadId}: not connected`);
      return false;
    }

    try {
      const messageData = typeof message === 'string' ? { message } : message;
      connectionInfo.ws.send(JSON.stringify(messageData));
      console.log(`[WebSocketManager] Message sent to ${threadId}:`, messageData);
      return true;
    } catch (error) {
      console.error(`[WebSocketManager] Failed to send message to ${threadId}:`, error);
      return false;
    }
  }

  /**
   * Добавить обработчик сообщений для треда
   */
  addMessageHandler(threadId, handler) {
    if (!this.messageHandlers.has(threadId)) {
      this.messageHandlers.set(threadId, new Set());
    }
    this.messageHandlers.get(threadId).add(handler);
    console.log(`[WebSocketManager] Message handler added for ${threadId}`);
  }

  /**
   * Удалить обработчик сообщений для треда
   */
  removeMessageHandler(threadId, handler) {
    const handlers = this.messageHandlers.get(threadId);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.messageHandlers.delete(threadId);
      }
      console.log(`[WebSocketManager] Message handler removed for ${threadId}`);
    }
  }

  /**
   * Добавить глобальный обработчик сообщений
   */
  addGlobalHandler(handler) {
    this.globalHandlers.add(handler);
  }

  /**
   * Удалить глобальный обработчик сообщений
   */
  removeGlobalHandler(handler) {
    this.globalHandlers.delete(handler);
  }

  /**
   * Получить статус соединения
   */
  isConnected(threadId) {
    const connectionInfo = this.connections.get(threadId);
    return connectionInfo && connectionInfo.ws.readyState === WS_STATES.OPEN;
  }

  /**
   * Получить все активные соединения
   */
  getActiveConnections() {
    const active = [];
    for (const [threadId, connectionInfo] of this.connections) {
      if (connectionInfo.ws.readyState === WS_STATES.OPEN) {
        active.push({
          threadId,
          userId: connectionInfo.userId,
          userType: connectionInfo.userType
        });
      }
    }
    return active;
  }

  /**
   * Очистить все соединения
   */
  cleanup() {
    console.log('[WebSocketManager] Cleaning up all connections');
    for (const threadId of this.connections.keys()) {
      this.disconnect(threadId);
    }
  }

  /**
   * Настроить обработчики WebSocket событий
   */
  setupWebSocketHandlers(connectionInfo) {
    const { ws, threadId, onStatusChange } = connectionInfo;

    ws.onopen = () => {
      console.log(`[WebSocketManager] ✅ Connected to ${threadId}`);
      connectionInfo.reconnectAttempts = 0;
      connectionInfo.isConnecting = false;
      connectionInfo.lastPingTime = Date.now();

      // Запускаем ping
      this.startPing(connectionInfo);

      // Уведомляем о подключении
      onStatusChange && onStatusChange(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log(`[WebSocketManager] Message received from ${threadId}:`, data);

        // Обрабатываем ping/pong
        if (data.type === WS_MESSAGE_TYPES.PING) {
          this.sendPong(threadId);
          return;
        }

        if (data.type === WS_MESSAGE_TYPES.PONG) {
          connectionInfo.lastPingTime = Date.now();
          return;
        }

        // Вызываем обработчики для треда
        const threadHandlers = this.messageHandlers.get(threadId);
        if (threadHandlers) {
          threadHandlers.forEach(handler => {
            try {
              handler(data, threadId);
            } catch (error) {
              console.error(`[WebSocketManager] Handler error for ${threadId}:`, error);
            }
          });
        }

        // Вызываем глобальные обработчики
        this.globalHandlers.forEach(handler => {
          try {
            handler(data, threadId);
          } catch (error) {
            console.error(`[WebSocketManager] Global handler error:`, error);
          }
        });

      } catch (error) {
        console.error(`[WebSocketManager] Error parsing message from ${threadId}:`, error);
      }
    };

    ws.onclose = (event) => {
      console.log(`[WebSocketManager] ❌ Disconnected from ${threadId}:`, event.code, event.reason);

      // Останавливаем ping
      this.stopPing(connectionInfo);

      // Уведомляем о отключении
      onStatusChange && onStatusChange(false);

      // Пытаемся переподключиться если это не намеренное закрытие
      if (event.code !== 1000 && connectionInfo.reconnectAttempts < this.maxReconnectAttempts) {
        this.scheduleReconnect(connectionInfo);
      }
    };

    ws.onerror = (error) => {
      console.error(`[WebSocketManager] WebSocket error for ${threadId}:`, error);
      onStatusChange && onStatusChange(false);
    };
  }

  /**
   * Запустить ping для поддержания соединения
   */
  startPing(connectionInfo) {
    this.stopPing(connectionInfo); // Останавливаем предыдущий ping если есть

    connectionInfo.pingInterval = setInterval(() => {
      if (connectionInfo.ws.readyState === WS_STATES.OPEN) {
        const pingMessage = {
          type: WS_MESSAGE_TYPES.PING,
          timestamp: new Date().toISOString()
        };

        try {
          connectionInfo.ws.send(JSON.stringify(pingMessage));
          console.log(`[WebSocketManager] Ping sent to ${connectionInfo.threadId}`);
        } catch (error) {
          console.error(`[WebSocketManager] Error sending ping to ${connectionInfo.threadId}:`, error);
          this.disconnect(connectionInfo.threadId);
        }
      }
    }, this.pingInterval);
  }

  /**
   * Остановить ping
   */
  stopPing(connectionInfo) {
    if (connectionInfo.pingInterval) {
      clearInterval(connectionInfo.pingInterval);
      connectionInfo.pingInterval = null;
    }
  }

  /**
   * Отправить pong ответ
   */
  sendPong(threadId) {
    const pongMessage = {
      type: WS_MESSAGE_TYPES.PONG,
      timestamp: new Date().toISOString()
    };
    this.sendMessage(threadId, pongMessage);
  }

  /**
   * Запланировать переподключение
   */
  scheduleReconnect(connectionInfo) {
    if (connectionInfo.reconnectTimeout) {
      clearTimeout(connectionInfo.reconnectTimeout);
    }

    connectionInfo.reconnectAttempts++;
    const delay = Math.min(
      this.baseReconnectDelay * Math.pow(2, connectionInfo.reconnectAttempts - 1),
      this.maxReconnectDelay
    );

    console.log(`[WebSocketManager] Scheduling reconnect for ${connectionInfo.threadId} in ${delay}ms (attempt ${connectionInfo.reconnectAttempts})`);

    connectionInfo.reconnectTimeout = setTimeout(() => {
      if (connectionInfo.reconnectAttempts <= this.maxReconnectAttempts) {
        console.log(`[WebSocketManager] Attempting to reconnect to ${connectionInfo.threadId}`);
        this.connect(
          connectionInfo.threadId,
          connectionInfo.userId,
          connectionInfo.userType,
          connectionInfo.onStatusChange
        );
      }
    }, delay);
  }

  /**
   * Отправить индикатор печатания
   */
  sendTypingIndicator(threadId, isTyping) {
    const typingMessage = {
      type: WS_MESSAGE_TYPES.TYPING,
      is_typing: isTyping,
      timestamp: new Date().toISOString()
    };
    return this.sendMessage(threadId, typingMessage);
  }
}

// Создаем единственный экземпляр менеджера
const websocketManager = new WebSocketManager();

// Отключаем все WebSocket соединения при закрытии вкладки
window.addEventListener('beforeunload', () => {
  websocketManager.cleanup();
});

// Обрабатываем потерю/восстановление соединения с интернетом
window.addEventListener('online', () => {
  console.log('[WebSocketManager] Network connection restored, checking connections');
  // Можно добавить логику для проверки и восстановления соединений
});

window.addEventListener('offline', () => {
  console.log('[WebSocketManager] Network connection lost');
});

export default websocketManager;


