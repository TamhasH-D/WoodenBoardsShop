/**
 * WebSocket менеджер (Seller Frontend)
 * Поддерживает соединения для чатов и глобальных уведомлений продавца.
 */

// WebSocket состояния
export const WS_STATES = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
};

// Типы сообщений (могут быть расширены для глобальных уведомлений)
export const WS_MESSAGE_TYPES = {
  // Chat specific
  MESSAGE: 'message',
  TYPING: 'typing',
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',
  // Global/Shared
  PING: 'ping',
  PONG: 'pong',
  ERROR: 'error',
  // Seller global notifications (примеры)
  NEW_CHAT_THREAD: 'new_chat_thread',
  NEW_CHAT_MESSAGE: 'new_chat_message', // Уведомление о новом сообщении в существующем треде
  NEW_ORDER: 'new_order',
  // другие типы глобальных уведомлений...
};

const getWsBaseUrl = () => {
  const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  if (apiBaseUrl.startsWith('https://')) {
    return apiBaseUrl.replace('https://', 'wss://');
  }
  if (apiBaseUrl.startsWith('http://')) {
    return apiBaseUrl.replace('http://', 'ws://');
  }
  return `ws://${apiBaseUrl}`; // Fallback
};

/**
 * Получить WebSocket URL для чата
 */
export const getChatWebSocketUrl = (threadId, userId, userType) => {
  const wsBaseUrl = getWsBaseUrl();
  return `${wsBaseUrl}/ws/chat/${threadId}?user_id=${userId}&user_type=${userType}`;
};

/**
 * Получить WebSocket URL для глобальных уведомлений продавца
 */
export const getSellerNotificationsWebSocketUrl = (sellerId) => {
  const wsBaseUrl = getWsBaseUrl();
  return `${wsBaseUrl}/ws/seller/${sellerId}/notifications`;
};

/**
 * Информация о соединении
 */
class ConnectionInfo {
  constructor(ws, connectionKey, wsUrl, onStatusChange, connectionType = 'chat') {
    this.ws = ws;
    this.connectionKey = connectionKey; // Может быть threadId или sellerId
    this.wsUrl = wsUrl; // Сохраняем URL для переподключения
    this.onStatusChange = onStatusChange;
    this.connectionType = connectionType; // 'chat' or 'seller_global'
    this.reconnectAttempts = 0;
    this.lastPingTime = Date.now(); // Инициализируем при создании
    this.pingIntervalId = null; // ID для setInterval
    this.reconnectTimeoutId = null; // ID для setTimeout
  }
}

/**
 * Централизованный WebSocket менеджер
 */
class WebSocketManager {
  constructor() {
    this.connections = new Map(); // connectionKey -> ConnectionInfo
    this.messageHandlers = new Map(); // connectionKey -> Set of handlers
    this.globalHandlers = new Set(); // Глобальные обработчики для ВСЕХ сообщений со всех каналов
    this.maxReconnectAttempts = 5;
    this.baseReconnectDelay = 1000;
    this.maxReconnectDelay = 30000;
    this.pingFrequency = 30000; // Частота отправки ping
    // Таймаут для pong не нужен здесь, т.к. сервер должен отключить если не получает ping
  }

  _connect(connectionKey, wsUrl, onStatusChange, connectionType) {
    console.log(`[WebSocketManager] Connecting to ${connectionKey} (${connectionType}) at ${wsUrl}`);

    if (this.connections.has(connectionKey)) {
      console.warn(`[WebSocketManager] Connection for ${connectionKey} already exists. Disconnecting old one.`);
      this.disconnect(connectionKey, true); // true to prevent immediate reconnect
    }

    try {
      const ws = new WebSocket(wsUrl);
      const connectionInfo = new ConnectionInfo(ws, connectionKey, wsUrl, onStatusChange, connectionType);
      this.connections.set(connectionKey, connectionInfo);
      this.setupWebSocketHandlers(connectionInfo);
      return true;
    } catch (error) {
      console.error(`[WebSocketManager] Failed to create WebSocket for ${connectionKey}:`, error);
      onStatusChange && onStatusChange(WS_STATES.CLOSED, connectionKey); // Уведомляем о неудаче
      return false;
    }
  }

  connectChatChannel(threadId, userId, userType, onStatusChange) {
    const wsUrl = getChatWebSocketUrl(threadId, userId, userType);
    // Для чатов connectionKey - это threadId
    return this._connect(threadId, wsUrl, onStatusChange, 'chat');
  }

  connectGlobalSellerChannel(sellerId, onStatusChange) {
    const wsUrl = getSellerNotificationsWebSocketUrl(sellerId);
    // Для глобального канала продавца connectionKey - это sellerId
    return this._connect(sellerId, wsUrl, onStatusChange, 'seller_global');
  }

  disconnect(connectionKey, isInternalDisconnect = false) {
    const connectionInfo = this.connections.get(connectionKey);
    if (!connectionInfo) return;

    console.log(`[WebSocketManager] Disconnecting from ${connectionKey}`);
    this.stopPing(connectionInfo);

    if (connectionInfo.reconnectTimeoutId) {
      clearTimeout(connectionInfo.reconnectTimeoutId);
      connectionInfo.reconnectTimeoutId = null;
    }

    if (connectionInfo.ws && connectionInfo.ws.readyState !== WS_STATES.CLOSED) {
      // Убираем обработчик onclose перед закрытием, чтобы избежать логики переподключения
      if (isInternalDisconnect) {
        connectionInfo.ws.onclose = null;
      }
      connectionInfo.ws.close(1000); // Нормальное закрытие
    }

    // onStatusChange может быть вызван из ws.onclose, если не isInternalDisconnect
    if (isInternalDisconnect && connectionInfo.onStatusChange) {
        connectionInfo.onStatusChange(WS_STATES.CLOSED, connectionKey);
    }

    this.connections.delete(connectionKey);
    // Не удаляем обработчики сообщений, они могут быть нужны при переподключении
  }

  sendMessage(connectionKey, message) {
    const connectionInfo = this.connections.get(connectionKey);
    if (!connectionInfo || connectionInfo.ws.readyState !== WS_STATES.OPEN) {
      console.warn(`[WebSocketManager] Cannot send message to ${connectionKey}: not connected or not open.`);
      return false;
    }

    try {
      const messageData = typeof message === 'string' ? { message } : message;
      connectionInfo.ws.send(JSON.stringify(messageData));
      // console.log(`[WebSocketManager] Message sent to ${connectionKey}:`, messageData);
      return true;
    } catch (error) {
      console.error(`[WebSocketManager] Failed to send message to ${connectionKey}:`, error);
      return false;
    }
  }

  addMessageHandler(connectionKey, handler) {
    if (!this.messageHandlers.has(connectionKey)) {
      this.messageHandlers.set(connectionKey, new Set());
    }
    this.messageHandlers.get(connectionKey).add(handler);
    console.log(`[WebSocketManager] Message handler added for ${connectionKey}`);
  }

  removeMessageHandler(connectionKey, handler) {
    const handlers = this.messageHandlers.get(connectionKey);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.messageHandlers.delete(connectionKey);
      }
      console.log(`[WebSocketManager] Message handler removed for ${connectionKey}`);
    }
  }

  addGlobalHandler(handler) {
    this.globalHandlers.add(handler);
    console.log('[WebSocketManager] Global message handler added.');
  }

  removeGlobalHandler(handler) {
    this.globalHandlers.delete(handler);
    console.log('[WebSocketManager] Global message handler removed.');
  }

  getConnectionState(connectionKey) {
    const connectionInfo = this.connections.get(connectionKey);
    return connectionInfo ? connectionInfo.ws.readyState : WS_STATES.CLOSED;
  }

  getActiveConnectionsDetails() {
    const active = [];
    for (const [key, info] of this.connections) {
      if (info.ws.readyState === WS_STATES.OPEN) {
        active.push({
          connectionKey: key,
          type: info.connectionType,
          url: info.wsUrl,
        });
      }
    }
    return active;
  }

  cleanup() {
    console.log('[WebSocketManager] Cleaning up all connections');
    for (const connectionKey of this.connections.keys()) {
      this.disconnect(connectionKey, true); // true for internal disconnect
    }
    this.messageHandlers.clear();
    this.globalHandlers.clear();
  }

  setupWebSocketHandlers(connectionInfo) {
    const { ws, connectionKey, onStatusChange } = connectionInfo;

    ws.onopen = () => {
      console.log(`[WebSocketManager] ✅ Connected to ${connectionKey} (${connectionInfo.connectionType})`);
      connectionInfo.reconnectAttempts = 0;
      if (connectionInfo.reconnectTimeoutId) { // Очищаем таймаут переподключения если он был
          clearTimeout(connectionInfo.reconnectTimeoutId);
          connectionInfo.reconnectTimeoutId = null;
      }
      connectionInfo.lastPingTime = Date.now();
      this.startPing(connectionInfo);
      onStatusChange && onStatusChange(WS_STATES.OPEN, connectionKey);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // console.log(`[WebSocketManager] Message received from ${connectionKey}:`, data);

        if (data.type === WS_MESSAGE_TYPES.PING) {
          // console.log(`[WebSocketManager] Ping received on ${connectionKey}. Sending Pong.`);
          this.sendPong(connectionKey);
          return;
        }

        if (data.type === WS_MESSAGE_TYPES.PONG) {
          // console.log(`[WebSocketManager] Pong received on ${connectionKey}.`);
          connectionInfo.lastPingTime = Date.now();
          return;
        }

        // Вызываем обработчики для конкретного connectionKey
        const specificHandlers = this.messageHandlers.get(connectionKey);
        if (specificHandlers) {
          specificHandlers.forEach(handler => {
            try {
              handler(data, connectionKey, connectionInfo.connectionType);
            } catch (error) {
              console.error(`[WebSocketManager] Handler error for ${connectionKey}:`, error);
            }
          });
        }

        // Вызываем глобальные обработчики
        this.globalHandlers.forEach(handler => {
          try {
            // Передаем connectionKey и connectionType глобальным обработчикам
            handler(data, connectionKey, connectionInfo.connectionType);
          } catch (error) {
            console.error('[WebSocketManager] Global handler error:', error);
          }
        });

      } catch (error) {
        console.error(`[WebSocketManager] Error parsing message from ${connectionKey}:`, error, event.data);
      }
    };

    ws.onclose = (event) => {
      console.log(`[WebSocketManager] ❌ Disconnected from ${connectionKey} (${connectionInfo.connectionType}): Code ${event.code}, Reason: ${event.reason || 'N/A'}`);
      this.stopPing(connectionInfo);
      onStatusChange && onStatusChange(WS_STATES.CLOSED, connectionKey, event.code, event.reason);

      // Пытаемся переподключиться если это не намеренное закрытие (код 1000)
      // и не было превышено количество попыток
      if (event.code !== 1000 && connectionInfo.reconnectAttempts < this.maxReconnectAttempts) {
        this.scheduleReconnect(connectionInfo);
      } else if (event.code === 1000) {
        console.log(`[WebSocketManager] Normal closure for ${connectionKey}. No reconnect.`);
        this.connections.delete(connectionKey); // Удаляем из активных соединений
      } else {
         console.log(`[WebSocketManager] Max reconnect attempts reached or unrecoverable error for ${connectionKey}.`);
         this.connections.delete(connectionKey); // Удаляем из активных соединений
      }
    };

    ws.onerror = (error) => {
      console.error(`[WebSocketManager] WebSocket error for ${connectionKey} (${connectionInfo.connectionType}):`, error);
      // onStatusChange будет вызван через onclose, который обычно следует за onerror
      // Однако, если onclose не вызывается, можно добавить onStatusChange(WS_STATES.CLOSED, connectionKey, 'error');
    };
  }

  startPing(connectionInfo) {
    this.stopPing(connectionInfo); // Останавливаем предыдущий ping если есть
    // console.log(`[WebSocketManager] Starting ping for ${connectionInfo.connectionKey}`);
    connectionInfo.pingIntervalId = setInterval(() => {
      if (connectionInfo.ws.readyState === WS_STATES.OPEN) {
        // Проверяем время последнего pong'а (или последнего успешного ping'а, если сервер не шлет pong)
        // Это более сложная логика проверки живости, для простоты пока оставим только отправку ping
        // if (Date.now() - connectionInfo.lastPingTime > this.pingFrequency + this.pongTimeout) {
        //   console.warn(`[WebSocketManager] Pong timeout for ${connectionInfo.connectionKey}. Closing connection.`);
        //   connectionInfo.ws.close(); // Это вызовет onclose и логику реконнекта
        //   return;
        // }

        const pingMessage = { type: WS_MESSAGE_TYPES.PING, timestamp: new Date().toISOString() };
        try {
          connectionInfo.ws.send(JSON.stringify(pingMessage));
          // console.log(`[WebSocketManager] Ping sent to ${connectionInfo.connectionKey}`);
        } catch (error) {
          console.error(`[WebSocketManager] Error sending ping to ${connectionInfo.connectionKey}:`, error);
          // Ошибка отправки ping может означать проблемы с соединением, можно инициировать закрытие
          connectionInfo.ws.close();
        }
      }
    }, this.pingFrequency);
  }

  stopPing(connectionInfo) {
    if (connectionInfo.pingIntervalId) {
      clearInterval(connectionInfo.pingIntervalId);
      connectionInfo.pingIntervalId = null;
      // console.log(`[WebSocketManager] Stopped ping for ${connectionInfo.connectionKey}`);
    }
  }

  sendPong(connectionKey) {
    const pongMessage = { type: WS_MESSAGE_TYPES.PONG, timestamp: new Date().toISOString() };
    this.sendMessage(connectionKey, pongMessage);
    // console.log(`[WebSocketManager] Pong sent to ${connectionKey}`);
  }

  scheduleReconnect(connectionInfo) {
    if (connectionInfo.reconnectTimeoutId) { // Если уже запланировано, не дублируем
        return;
    }
    connectionInfo.reconnectAttempts++;
    const delay = Math.min(
      this.baseReconnectDelay * Math.pow(2, connectionInfo.reconnectAttempts -1), // Экспоненциальная задержка
      this.maxReconnectDelay
    );

    console.log(`[WebSocketManager] Scheduling reconnect for ${connectionInfo.connectionKey} (${connectionInfo.connectionType}) in ${delay}ms (attempt ${connectionInfo.reconnectAttempts})`);

    connectionInfo.reconnectTimeoutId = setTimeout(() => {
      connectionInfo.reconnectTimeoutId = null; // Очищаем ID перед попыткой
      // Проверяем, что соединение все еще требует переподключения и не было подключено иным способом
      if (this.connections.has(connectionInfo.connectionKey) &&
          this.connections.get(connectionInfo.connectionKey) === connectionInfo &&
          connectionInfo.ws.readyState !== WS_STATES.OPEN &&
          connectionInfo.ws.readyState !== WS_STATES.CONNECTING) {

        console.log(`[WebSocketManager] Attempting to reconnect to ${connectionInfo.connectionKey} using URL ${connectionInfo.wsUrl}`);
        // Используем сохраненный URL и тип для переподключения
        this._connect(connectionInfo.connectionKey, connectionInfo.wsUrl, connectionInfo.onStatusChange, connectionInfo.connectionType);
      } else {
        console.log(`[WebSocketManager] Skipping scheduled reconnect for ${connectionInfo.connectionKey}, state has changed or connection removed.`);
      }
    }, delay);
  }

  sendTypingIndicator(threadId, isTyping) { // threadId здесь используется как connectionKey для чата
    const typingMessage = {
      type: WS_MESSAGE_TYPES.TYPING,
      is_typing: isTyping,
      timestamp: new Date().toISOString()
    };
    return this.sendMessage(threadId, typingMessage);
  }
}

const websocketManager = new WebSocketManager();

window.addEventListener('beforeunload', () => {
  websocketManager.cleanup();
});

// Опционально: обработка online/offline для более быстрого восстановления
// window.addEventListener('online', () => {
//   console.log('[WebSocketManager] Network connection restored.');
//   for (const [key, info] of websocketManager.connections) {
//     if (info.ws.readyState === WS_STATES.CLOSED || info.ws.readyState === WS_STATES.CLOSING) {
//       console.log(`[WebSocketManager] Attempting to reconnect ${key} due to network restoration.`);
//       // Сбрасываем попытки переподключения, чтобы сразу попробовать
//       info.reconnectAttempts = 0;
//       if (info.reconnectTimeoutId) clearTimeout(info.reconnectTimeoutId);
//       info.reconnectTimeoutId = null;
//       websocketManager.scheduleReconnect(info);
//     }
//   }
// });

// window.addEventListener('offline', () => {
//   console.log('[WebSocketManager] Network connection lost. Connections will attempt to reconnect as per their schedule.');
// });

export default websocketManager;
