import { getChatWebSocketUrl, WS_STATES, WS_MESSAGE_TYPES } from '../utils/websocket';

/**
 * Centralized WebSocket manager for chat functionality
 */
class WebSocketManager {
  constructor() {
    this.connections = new Map(); // threadId -> connection info
    this.messageHandlers = new Map(); // threadId -> Set of handlers
    this.globalHandlers = new Set(); // Global message handlers
    this.reconnectAttempts = new Map(); // threadId -> attempt count
    this.reconnectTimeouts = new Map(); // threadId -> timeout id
    this.maxReconnectAttempts = 5;
    this.baseReconnectDelay = 1000; // 1 second
    this.maxReconnectDelay = 30000; // 30 seconds
  }

  /**
   * Connect to a chat thread
   */
  connect(threadId, userId, userType, onConnectionChange) {
    if (!threadId || !userId || !userType) {
      console.error('[WebSocketManager] Missing required parameters');
      return false;
    }

    // Close existing connection if any
    this.disconnect(threadId);

    const wsUrl = getChatWebSocketUrl(threadId, userId, userType);
    console.log(`[WebSocketManager] Connecting to ${threadId}:`, wsUrl);

    try {
      const ws = new WebSocket(wsUrl);
      const connectionInfo = {
        ws,
        threadId,
        userId,
        userType,
        onConnectionChange,
        isConnecting: true,
        lastPingTime: Date.now(),
        pingInterval: null
      };

      this.connections.set(threadId, connectionInfo);
      this.setupWebSocketHandlers(connectionInfo);
      
      return true;
    } catch (error) {
      console.error(`[WebSocketManager] Failed to create WebSocket for ${threadId}:`, error);
      onConnectionChange && onConnectionChange(false);
      return false;
    }
  }

  /**
   * Disconnect from a chat thread
   */
  disconnect(threadId) {
    const connectionInfo = this.connections.get(threadId);
    if (!connectionInfo) return;

    console.log(`[WebSocketManager] Disconnecting from ${threadId}`);

    // Clear reconnect timeout
    const timeoutId = this.reconnectTimeouts.get(threadId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.reconnectTimeouts.delete(threadId);
    }

    // Clear ping interval
    if (connectionInfo.pingInterval) {
      clearInterval(connectionInfo.pingInterval);
    }

    // Close WebSocket
    if (connectionInfo.ws && connectionInfo.ws.readyState !== WS_STATES.CLOSED) {
      connectionInfo.ws.close(1000, 'Manual disconnect');
    }

    // Clean up
    this.connections.delete(threadId);
    this.reconnectAttempts.delete(threadId);
  }

  /**
   * Send message to a specific thread
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
   * Add message handler for a specific thread
   */
  addMessageHandler(threadId, handler) {
    if (!this.messageHandlers.has(threadId)) {
      this.messageHandlers.set(threadId, new Set());
    }
    this.messageHandlers.get(threadId).add(handler);
  }

  /**
   * Remove message handler for a specific thread
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
   * Add global message handler
   */
  addGlobalHandler(handler) {
    this.globalHandlers.add(handler);
  }

  /**
   * Remove global message handler
   */
  removeGlobalHandler(handler) {
    this.globalHandlers.delete(handler);
  }

  /**
   * Get connection status for a thread
   */
  getConnectionStatus(threadId) {
    const connectionInfo = this.connections.get(threadId);
    if (!connectionInfo) return 'disconnected';
    
    switch (connectionInfo.ws.readyState) {
      case WS_STATES.CONNECTING:
        return 'connecting';
      case WS_STATES.OPEN:
        return 'connected';
      case WS_STATES.CLOSING:
        return 'disconnecting';
      case WS_STATES.CLOSED:
        return 'disconnected';
      default:
        return 'unknown';
    }
  }

  /**
   * Check if connected to a thread
   */
  isConnected(threadId) {
    return this.getConnectionStatus(threadId) === 'connected';
  }

  /**
   * Get all active connections
   */
  getActiveConnections() {
    const active = [];
    for (const [threadId, connectionInfo] of this.connections) {
      if (connectionInfo.ws.readyState === WS_STATES.OPEN) {
        active.push({
          threadId,
          userId: connectionInfo.userId,
          userType: connectionInfo.userType,
          connectedAt: connectionInfo.connectedAt
        });
      }
    }
    return active;
  }

  /**
   * Setup WebSocket event handlers
   */
  setupWebSocketHandlers(connectionInfo) {
    const { ws, threadId, onConnectionChange } = connectionInfo;

    ws.onopen = () => {
      console.log(`[WebSocketManager] Connected to ${threadId}`);
      connectionInfo.isConnecting = false;
      connectionInfo.connectedAt = new Date();
      connectionInfo.lastPingTime = Date.now();
      
      // Reset reconnect attempts
      this.reconnectAttempts.delete(threadId);
      
      // Start ping interval
      this.startPingInterval(connectionInfo);
      
      // Notify connection change
      onConnectionChange && onConnectionChange(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log(`[WebSocketManager] Message received from ${threadId}:`, data);
        
        // Update last ping time for pong messages
        if (data.type === 'pong') {
          connectionInfo.lastPingTime = Date.now();
          return;
        }
        
        // Call thread-specific handlers
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
        
        // Call global handlers
        this.globalHandlers.forEach(handler => {
          try {
            handler(data, threadId);
          } catch (error) {
            console.error(`[WebSocketManager] Global handler error:`, error);
          }
        });
      } catch (error) {
        console.error(`[WebSocketManager] Failed to parse message from ${threadId}:`, error);
      }
    };

    ws.onclose = (event) => {
      console.log(`[WebSocketManager] Disconnected from ${threadId}:`, event.code, event.reason);
      connectionInfo.isConnecting = false;
      
      // Clear ping interval
      if (connectionInfo.pingInterval) {
        clearInterval(connectionInfo.pingInterval);
        connectionInfo.pingInterval = null;
      }
      
      // Notify connection change
      onConnectionChange && onConnectionChange(false);
      
      // Attempt reconnection if not manually closed
      if (event.code !== 1000) {
        this.scheduleReconnect(connectionInfo);
      }
    };

    ws.onerror = (error) => {
      console.error(`[WebSocketManager] WebSocket error for ${threadId}:`, error);
      connectionInfo.isConnecting = false;
      onConnectionChange && onConnectionChange(false);
    };
  }

  /**
   * Start ping interval to keep connection alive
   */
  startPingInterval(connectionInfo) {
    connectionInfo.pingInterval = setInterval(() => {
      if (connectionInfo.ws.readyState === WS_STATES.OPEN) {
        const now = Date.now();
        
        // Check if we haven't received a pong in too long
        if (now - connectionInfo.lastPingTime > 60000) { // 60 seconds
          console.warn(`[WebSocketManager] Ping timeout for ${connectionInfo.threadId}, reconnecting`);
          connectionInfo.ws.close(1001, 'Ping timeout');
          return;
        }
        
        // Send ping
        try {
          connectionInfo.ws.send(JSON.stringify({ type: 'ping', timestamp: now }));
        } catch (error) {
          console.error(`[WebSocketManager] Failed to send ping to ${connectionInfo.threadId}:`, error);
        }
      }
    }, 30000); // Ping every 30 seconds
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  scheduleReconnect(connectionInfo) {
    const { threadId, userId, userType, onConnectionChange } = connectionInfo;
    
    const attempts = this.reconnectAttempts.get(threadId) || 0;
    if (attempts >= this.maxReconnectAttempts) {
      console.error(`[WebSocketManager] Max reconnect attempts reached for ${threadId}`);
      return;
    }

    const delay = Math.min(
      this.baseReconnectDelay * Math.pow(2, attempts),
      this.maxReconnectDelay
    );

    console.log(`[WebSocketManager] Scheduling reconnect for ${threadId} in ${delay}ms (attempt ${attempts + 1})`);
    
    const timeoutId = setTimeout(() => {
      this.reconnectAttempts.set(threadId, attempts + 1);
      this.connect(threadId, userId, userType, onConnectionChange);
    }, delay);
    
    this.reconnectTimeouts.set(threadId, timeoutId);
  }

  /**
   * Cleanup all connections
   */
  cleanup() {
    console.log('[WebSocketManager] Cleaning up all connections');
    
    // Disconnect all connections
    for (const threadId of this.connections.keys()) {
      this.disconnect(threadId);
    }
    
    // Clear all handlers
    this.messageHandlers.clear();
    this.globalHandlers.clear();
  }
}

// Create singleton instance
const websocketManager = new WebSocketManager();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    websocketManager.cleanup();
  });
}

export default websocketManager;
