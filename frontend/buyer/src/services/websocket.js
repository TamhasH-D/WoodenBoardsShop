/**
 * Enhanced WebSocket service for real-time chat functionality
 */

class ChatWebSocketService {
  constructor() {
    this.ws = null;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
    this.maxReconnectDelay = 30000; // Max 30 seconds
    this.heartbeatInterval = null;
    this.heartbeatTimeout = null;
    this.listeners = new Map();
    this.threadId = null;
    this.userId = null;
    this.userType = null;
  }

  /**
   * Connect to WebSocket
   */
  connect(threadId, userId, userType) {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return Promise.resolve();
    }

    this.threadId = threadId;
    this.userId = userId;
    this.userType = userType;

    return new Promise((resolve, reject) => {
      try {
        this.isConnecting = true;
        const wsUrl = this.getWebSocketUrl(threadId, userId, userType);
        
        console.log('[WebSocket] Connecting to:', wsUrl);
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('[WebSocket] Connected successfully');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.reconnectDelay = 1000;
          this.startHeartbeat();
          this.emit('connected');
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.ws.onclose = (event) => {
          console.log('[WebSocket] Connection closed:', event.code, event.reason);
          this.isConnecting = false;
          this.stopHeartbeat();
          this.emit('disconnected', { code: event.code, reason: event.reason });
          
          // Auto-reconnect if not a clean close
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('[WebSocket] Error:', error);
          this.isConnecting = false;
          this.emit('error', error);
          reject(error);
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.stopHeartbeat();
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  /**
   * Send message through WebSocket
   */
  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
      return true;
    }
    console.warn('[WebSocket] Cannot send message - not connected');
    return false;
  }

  /**
   * Send chat message
   */
  sendMessage(message, messageId) {
    return this.send({
      type: 'message',
      message,
      message_id: messageId,
      sender_id: this.userId,
      sender_type: this.userType,
      thread_id: this.threadId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send typing indicator
   */
  sendTyping() {
    return this.send({
      type: 'typing',
      sender_id: this.userId,
      sender_type: this.userType,
      thread_id: this.threadId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send user joined notification
   */
  sendUserJoined() {
    return this.send({
      type: 'user_joined',
      sender_id: this.userId,
      sender_type: this.userType,
      thread_id: this.threadId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Add event listener
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to listeners
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('[WebSocket] Error in event listener:', error);
        }
      });
    }
  }

  /**
   * Handle incoming WebSocket message
   */
  handleMessage(event) {
    try {
      const data = JSON.parse(event.data);
      console.log('[WebSocket] Message received:', data);

      switch (data.type) {
        case 'message':
          this.emit('message', data);
          break;
        case 'typing':
          this.emit('typing', data);
          break;
        case 'user_joined':
          this.emit('user_joined', data);
          break;
        case 'user_left':
          this.emit('user_left', data);
          break;
        case 'pong':
          this.handlePong();
          break;
        default:
          console.log('[WebSocket] Unknown message type:', data.type);
          this.emit('unknown', data);
          break;
      }
    } catch (error) {
      console.error('[WebSocket] Error parsing message:', error);
    }
  }

  /**
   * Get WebSocket URL
   */
  getWebSocketUrl(threadId, userId, userType) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.REACT_APP_WS_URL || 'localhost:8000';
    return `${protocol}//${host}/api/v1/chat/ws/${threadId}?user_id=${userId}&user_type=${userType}`;
  }

  /**
   * Schedule reconnection
   */
  scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), this.maxReconnectDelay);
    
    console.log(`[WebSocket] Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      if (this.threadId && this.userId && this.userType) {
        this.connect(this.threadId, this.userId, this.userType);
      }
    }, delay);
  }

  /**
   * Start heartbeat to keep connection alive
   */
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping', timestamp: new Date().toISOString() });
        
        // Set timeout for pong response
        this.heartbeatTimeout = setTimeout(() => {
          console.warn('[WebSocket] Heartbeat timeout - closing connection');
          this.ws.close();
        }, 5000);
      }
    }, 30000); // Send ping every 30 seconds
  }

  /**
   * Stop heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  /**
   * Handle pong response
   */
  handlePong() {
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  /**
   * Get connection status
   */
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Get connection state
   */
  getState() {
    if (!this.ws) return 'CLOSED';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'CONNECTING';
      case WebSocket.OPEN: return 'OPEN';
      case WebSocket.CLOSING: return 'CLOSING';
      case WebSocket.CLOSED: return 'CLOSED';
      default: return 'UNKNOWN';
    }
  }
}

// Export singleton instance
export const chatWebSocket = new ChatWebSocketService();
export default ChatWebSocketService;
