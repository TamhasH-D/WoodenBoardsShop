/**
 * Централизованный менеджер WebSocket соединений для чата
 * Обеспечивает стабильную работу WebSocket с автоматическим переподключением
 */

class WebSocketManager {
  constructor() {
    this.connections = new Map(); // threadId -> connection info
    this.messageHandlers = new Map(); // threadId -> Set of handlers
    this.reconnectTimeouts = new Map(); // threadId -> timeout id
    this.statusTimeouts = new Map(); // threadId -> status change timeout
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.statusDebounceDelay = 500; // Задержка для стабилизации статуса
    this.heartbeatInterval = 30000; // Интервал heartbeat (30 секунд)
    this.heartbeatTimeouts = new Map(); // threadId -> heartbeat timeout
  }

  /**
   * Запускает heartbeat для поддержания соединения
   */
  startHeartbeat(threadId, ws) {
    const heartbeatTimeout = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }));
      } else {
        clearInterval(heartbeatTimeout);
        this.heartbeatTimeouts.delete(threadId);
      }
    }, this.heartbeatInterval);

    this.heartbeatTimeouts.set(threadId, heartbeatTimeout);
  }

  /**
   * Останавливает heartbeat
   */
  stopHeartbeat(threadId) {
    const heartbeatTimeout = this.heartbeatTimeouts.get(threadId);
    if (heartbeatTimeout) {
      clearInterval(heartbeatTimeout);
      this.heartbeatTimeouts.delete(threadId);
    }
  }

  /**
   * Устанавливает статус подключения немедленно (убираем дебаунсинг)
   */
  setConnectionStatus(threadId, status, onStatusChange) {
    if (onStatusChange) {
      onStatusChange(status);
    }
  }

  /**
   * Создает или возвращает существующее WebSocket соединение
   */
  connect(threadId, userId, userType, onStatusChange) {
    console.log('[WebSocketManager] Connecting:', { threadId, userId, userType });

    // Если соединение уже существует и активно, просто обновляем callback
    const existing = this.connections.get(threadId);
    if (existing && (existing.ws.readyState === WebSocket.OPEN || existing.ws.readyState === WebSocket.CONNECTING)) {
      console.log('[WebSocketManager] Using existing connection for thread:', threadId);
      existing.onStatusChange = onStatusChange; // Обновляем callback
      if (existing.ws.readyState === WebSocket.OPEN && onStatusChange) {
        onStatusChange(true);
      }
      return existing.ws;
    }

    // Закрываем старое соединение если оно есть и не активно
    if (existing && existing.ws.readyState === WebSocket.CLOSED) {
      this.disconnect(threadId);
    }

    const wsUrl = this.getWebSocketUrl(threadId, userId, userType);
    console.log('[WebSocketManager] Creating new WebSocket:', wsUrl);

    const ws = new WebSocket(wsUrl);
    const connectionInfo = {
      ws,
      threadId,
      userId,
      userType,
      onStatusChange,
      reconnectAttempts: 0,
      isConnecting: false
    };

    this.connections.set(threadId, connectionInfo);

    ws.onopen = () => {
      console.log('[WebSocketManager] ✅ Connected to thread:', threadId);
      connectionInfo.reconnectAttempts = 0;
      connectionInfo.isConnecting = false;
      this.setConnectionStatus(threadId, true, onStatusChange);
      this.startHeartbeat(threadId, ws);
    };

    ws.onmessage = (event) => {
      // Уменьшаем логирование - только для отладки
      // console.log('[WebSocketManager] Message received for thread:', threadId);
      this.handleMessage(threadId, event);
    };

    ws.onclose = (event) => {
      console.log('[WebSocketManager] ❌ Connection closed for thread:', threadId, 'Code:', event.code);
      connectionInfo.isConnecting = false;
      this.setConnectionStatus(threadId, false, onStatusChange);
      this.stopHeartbeat(threadId);

      // Автоматическое переподключение только если это не намеренное закрытие
      if (event.code !== 1000 && event.code !== 1001) {
        this.scheduleReconnect(threadId);
      }
    };

    ws.onerror = (error) => {
      console.error('[WebSocketManager] ⚠️ Error for thread:', threadId, error);
      connectionInfo.isConnecting = false;
      this.setConnectionStatus(threadId, false, onStatusChange);
    };

    return ws;
  }

  /**
   * Отключает WebSocket соединение
   */
  disconnect(threadId) {
    console.log('[WebSocketManager] Disconnecting thread:', threadId);
    
    const connection = this.connections.get(threadId);
    if (connection) {
      if (connection.ws.readyState === WebSocket.OPEN) {
        connection.ws.close(1000, 'Manual disconnect');
      }
      this.connections.delete(threadId);
    }

    // Очищаем таймер переподключения
    const timeout = this.reconnectTimeouts.get(threadId);
    if (timeout) {
      clearTimeout(timeout);
      this.reconnectTimeouts.delete(threadId);
    }

    // Очищаем таймер статуса
    const statusTimeout = this.statusTimeouts.get(threadId);
    if (statusTimeout) {
      clearTimeout(statusTimeout);
      this.statusTimeouts.delete(threadId);
    }

    // Очищаем heartbeat
    this.stopHeartbeat(threadId);

    // Очищаем обработчики сообщений
    this.messageHandlers.delete(threadId);
  }

  /**
   * Отправляет сообщение через WebSocket
   */
  sendMessage(threadId, message) {
    const connection = this.connections.get(threadId);
    if (!connection || connection.ws.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocketManager] Cannot send message - no active connection for thread:', threadId);
      return false;
    }

    try {
      connection.ws.send(JSON.stringify(message));
      console.log('[WebSocketManager] Message sent for thread:', threadId, message);
      return true;
    } catch (error) {
      console.error('[WebSocketManager] Error sending message for thread:', threadId, error);
      return false;
    }
  }

  /**
   * Добавляет обработчик сообщений для треда
   */
  addMessageHandler(threadId, handler) {
    if (!this.messageHandlers.has(threadId)) {
      this.messageHandlers.set(threadId, new Set());
    }
    this.messageHandlers.get(threadId).add(handler);
  }

  /**
   * Удаляет обработчик сообщений
   */
  removeMessageHandler(threadId, handler) {
    const handlers = this.messageHandlers.get(threadId);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.messageHandlers.delete(threadId);
      }
    }
  }

  /**
   * Проверяет статус соединения
   */
  isConnected(threadId) {
    const connection = this.connections.get(threadId);
    return connection && connection.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Планирует переподключение
   */
  scheduleReconnect(threadId) {
    const connection = this.connections.get(threadId);
    if (!connection || connection.isConnecting) return;

    if (connection.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[WebSocketManager] Max reconnect attempts reached for thread:', threadId);
      return;
    }

    connection.reconnectAttempts++;
    connection.isConnecting = true;

    const delay = this.reconnectDelay * Math.pow(2, connection.reconnectAttempts - 1); // Exponential backoff
    console.log('[WebSocketManager] Scheduling reconnect for thread:', threadId, 'in', delay, 'ms');

    const timeout = setTimeout(() => {
      this.reconnectTimeouts.delete(threadId);
      if (this.connections.has(threadId)) {
        console.log('[WebSocketManager] Attempting reconnect for thread:', threadId);
        this.connect(
          connection.threadId,
          connection.userId,
          connection.userType,
          connection.onStatusChange
        );
      }
    }, delay);

    this.reconnectTimeouts.set(threadId, timeout);
  }

  /**
   * Обрабатывает входящие сообщения
   */
  handleMessage(threadId, event) {
    const handlers = this.messageHandlers.get(threadId);
    if (!handlers || handlers.size === 0) {
      console.warn('[WebSocketManager] No handlers for thread:', threadId);
      return;
    }

    try {
      const data = JSON.parse(event.data);
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error('[WebSocketManager] Error in message handler:', error);
        }
      });
    } catch (error) {
      console.error('[WebSocketManager] Error parsing message:', error);
    }
  }

  /**
   * Генерирует URL для WebSocket соединения
   */
  getWebSocketUrl(threadId, userId, userType) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/api/v1/chat/ws/${threadId}?user_id=${userId}&user_type=${userType}`;
  }

  /**
   * Очищает все соединения
   */
  cleanup() {
    console.log('[WebSocketManager] Cleaning up all connections');

    this.connections.forEach((connection, threadId) => {
      this.disconnect(threadId);
    });

    this.connections.clear();
    this.messageHandlers.clear();
    this.reconnectTimeouts.clear();
  }

  /**
   * Принудительно отключает WebSocket для треда (например, при выходе из чата)
   */
  forceDisconnect(threadId) {
    console.log('[WebSocketManager] Force disconnecting thread:', threadId);
    this.disconnect(threadId);
  }
}

// Создаем единственный экземпляр менеджера
const websocketManager = new WebSocketManager();

// Отключаем все WebSocket соединения при закрытии вкладки
window.addEventListener('beforeunload', () => {
  websocketManager.cleanup();
});

// Отключаем соединения при потере фокуса страницы (опционально)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    console.log('[WebSocketManager] Page hidden, keeping connections alive');
    // Не отключаем соединения при скрытии страницы - пусть остаются активными
  }
});

export default websocketManager;
