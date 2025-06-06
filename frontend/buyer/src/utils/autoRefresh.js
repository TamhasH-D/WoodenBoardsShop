/**
 * Auto-refresh utility for buyer frontend
 * Maintains buyer online status and refreshes data every 5 minutes
 */

class BuyerAutoRefreshManager {
  constructor(buyerId, options = {}) {
    this.buyerId = buyerId;
    this.config = {
      keepAliveInterval: 5 * 60 * 1000, // 5 minutes
      apiBaseUrl: process.env.REACT_APP_API_URL || 'http://localhost:8000',
      debug: process.env.NODE_ENV === 'development',
      onRefresh: options.onRefresh || (() => {}),
      onError: options.onError || console.error,
      onStatusChange: options.onStatusChange || (() => {}),
      ...options
    };

    this.isActive = false;
    this.intervalId = null;
    this.isPageVisible = true;
    this.lastKeepAliveTime = null;
    this.consecutiveErrors = 0;
    this.maxConsecutiveErrors = 3;

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Page Visibility API
    document.addEventListener('visibilitychange', () => {
      this.isPageVisible = !document.hidden;
      
      if (this.config.debug) {
        console.log(`[BuyerAutoRefresh] Page visibility: ${this.isPageVisible ? 'visible' : 'hidden'}`);
      }

      if (this.isPageVisible && this.isActive) {
        this.startInterval();
        // Immediate keep-alive if it's been a while
        const timeSinceLastKeepAlive = Date.now() - (this.lastKeepAliveTime || 0);
        if (timeSinceLastKeepAlive > this.config.keepAliveInterval) {
          this.performKeepAlive();
        }
      } else {
        this.stopInterval();
      }
    });

    // Handle page unload
    window.addEventListener('beforeunload', () => {
      this.stop();
    });
  }

  start() {
    if (this.isActive) return;

    if (!this.buyerId) {
      console.error('[BuyerAutoRefresh] Cannot start: buyerId is required');
      return;
    }

    this.isActive = true;
    this.consecutiveErrors = 0;

    if (this.config.debug) {
      console.log(`[BuyerAutoRefresh] Starting for buyer ${this.buyerId}`);
    }

    // Initial keep-alive
    this.performKeepAlive();

    // Start interval if page is visible
    if (this.isPageVisible) {
      this.startInterval();
    }
  }

  stop() {
    this.isActive = false;
    this.stopInterval();

    if (this.config.debug) {
      console.log('[BuyerAutoRefresh] Stopped');
    }
  }

  startInterval() {
    this.stopInterval();
    
    if (this.isActive && this.isPageVisible) {
      this.intervalId = setInterval(() => this.performKeepAlive(), this.config.keepAliveInterval);
      
      if (this.config.debug) {
        console.log(`[BuyerAutoRefresh] Interval started (${this.config.keepAliveInterval / 1000}s)`);
      }
    }
  }

  stopInterval() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async performKeepAlive() {
    if (!this.isActive || !this.isPageVisible) return;

    try {
      if (this.config.debug) {
        console.log('[BuyerAutoRefresh] Performing keep-alive...');
      }

      const response = await fetch(`${this.config.apiBaseUrl}/api/v1/keep-alive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Type': 'buyer',
          'X-User-ID': this.buyerId
        }
      });

      if (!response.ok) {
        throw new Error(`Keep-alive failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.lastKeepAliveTime = Date.now();
      this.consecutiveErrors = 0;

      if (this.config.debug) {
        console.log('[BuyerAutoRefresh] Keep-alive successful:', data);
      }

      // Refresh page data
      try {
        await this.config.onRefresh();
      } catch (refreshError) {
        console.warn('[BuyerAutoRefresh] Refresh callback failed:', refreshError);
      }

      // Notify status change
      this.config.onStatusChange({
        isOnline: true,
        lastActivity: data.timestamp,
        error: null
      });

    } catch (error) {
      this.consecutiveErrors++;
      
      if (this.config.debug) {
        console.error(`[BuyerAutoRefresh] Keep-alive failed (${this.consecutiveErrors}/${this.maxConsecutiveErrors}):`, error);
      }

      if (this.consecutiveErrors >= this.maxConsecutiveErrors) {
        if (this.config.debug) {
          console.warn('[BuyerAutoRefresh] Too many consecutive errors, stopping');
        }
        this.stop();
      }

      this.config.onStatusChange({
        isOnline: false,
        lastActivity: null,
        error: error.message
      });

      this.config.onError(error);
    }
  }

  destroy() {
    this.stop();
  }
}

export default BuyerAutoRefreshManager;

// React hook for buyer auto-refresh
export const useBuyerAutoRefresh = (buyerId, onRefresh, dependencies = []) => {
  const [autoRefresh, setAutoRefresh] = React.useState(null);
  const [status, setStatus] = React.useState({
    isOnline: false,
    lastActivity: null,
    error: null
  });

  React.useEffect(() => {
    if (!buyerId) return;

    const manager = new BuyerAutoRefreshManager(buyerId, {
      onRefresh,
      onStatusChange: setStatus,
      onError: (error) => {
        console.error('[BuyerAutoRefresh] Error:', error);
        setStatus(prev => ({ ...prev, error: error.message }));
      }
    });

    manager.start();
    setAutoRefresh(manager);

    return () => {
      manager.destroy();
    };
  }, [buyerId, ...dependencies]);

  return { autoRefresh, status };
};
