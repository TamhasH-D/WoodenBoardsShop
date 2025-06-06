/**
 * Auto-refresh utility for maintaining user online status and refreshing data
 * 
 * This utility provides:
 * 1. Automatic keep-alive requests every 5 minutes
 * 2. Page visibility detection to pause when tab is inactive
 * 3. Network error handling
 * 4. Configurable refresh intervals
 * 5. User activity tracking
 */

class AutoRefreshManager {
  constructor(config = {}) {
    this.config = {
      keepAliveInterval: 5 * 60 * 1000, // 5 minutes in milliseconds
      apiBaseUrl: config.apiBaseUrl || 'http://localhost:8000',
      userType: config.userType, // 'seller', 'buyer', or 'admin'
      userId: config.userId,
      onRefresh: config.onRefresh || (() => {}), // Callback for data refresh
      onError: config.onError || console.error,
      onStatusChange: config.onStatusChange || (() => {}), // Callback for online/offline status changes
      debug: config.debug || false,
      ...config
    };

    this.isActive = false;
    this.intervalId = null;
    this.isPageVisible = true;
    this.lastKeepAliveTime = null;
    this.consecutiveErrors = 0;
    this.maxConsecutiveErrors = 3;

    // Bind methods
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
    this.performKeepAlive = this.performKeepAlive.bind(this);

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Page Visibility API to pause when tab is inactive
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    
    // Handle page unload to mark user as potentially offline
    window.addEventListener('beforeunload', this.handleBeforeUnload);
    
    // Handle focus/blur events as fallback for older browsers
    window.addEventListener('focus', () => {
      if (!this.isPageVisible) {
        this.isPageVisible = true;
        this.handleVisibilityChange();
      }
    });
    
    window.addEventListener('blur', () => {
      if (this.isPageVisible) {
        this.isPageVisible = false;
        this.handleVisibilityChange();
      }
    });
  }

  handleVisibilityChange() {
    this.isPageVisible = !document.hidden;
    
    if (this.config.debug) {
      console.log(`[AutoRefresh] Page visibility changed: ${this.isPageVisible ? 'visible' : 'hidden'}`);
    }

    if (this.isPageVisible && this.isActive) {
      // Page became visible, resume auto-refresh
      this.startInterval();
      // Perform immediate keep-alive if it's been a while
      const timeSinceLastKeepAlive = Date.now() - (this.lastKeepAliveTime || 0);
      if (timeSinceLastKeepAlive > this.config.keepAliveInterval) {
        this.performKeepAlive();
      }
    } else {
      // Page became hidden, pause auto-refresh
      this.stopInterval();
    }
  }

  handleBeforeUnload() {
    // Mark user as potentially going offline
    if (this.config.debug) {
      console.log('[AutoRefresh] Page unloading, stopping auto-refresh');
    }
    this.stop();
  }

  start() {
    if (this.isActive) {
      if (this.config.debug) {
        console.log('[AutoRefresh] Already active');
      }
      return;
    }

    if (!this.config.userType || !this.config.userId) {
      console.error('[AutoRefresh] Cannot start: userType and userId are required');
      return;
    }

    this.isActive = true;
    this.consecutiveErrors = 0;

    if (this.config.debug) {
      console.log(`[AutoRefresh] Starting for ${this.config.userType} ${this.config.userId}`);
    }

    // Perform initial keep-alive
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
      console.log('[AutoRefresh] Stopped');
    }
  }

  startInterval() {
    this.stopInterval(); // Clear any existing interval
    
    if (this.isActive && this.isPageVisible) {
      this.intervalId = setInterval(this.performKeepAlive, this.config.keepAliveInterval);
      
      if (this.config.debug) {
        console.log(`[AutoRefresh] Interval started (${this.config.keepAliveInterval / 1000}s)`);
      }
    }
  }

  stopInterval() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      
      if (this.config.debug) {
        console.log('[AutoRefresh] Interval stopped');
      }
    }
  }

  async performKeepAlive() {
    if (!this.isActive || !this.isPageVisible) {
      return;
    }

    try {
      if (this.config.debug) {
        console.log('[AutoRefresh] Performing keep-alive...');
      }

      const response = await fetch(`${this.config.apiBaseUrl}/api/v1/keep-alive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Type': this.config.userType,
          'X-User-ID': this.config.userId
        }
      });

      if (!response.ok) {
        throw new Error(`Keep-alive failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.lastKeepAliveTime = Date.now();
      this.consecutiveErrors = 0;

      if (this.config.debug) {
        console.log('[AutoRefresh] Keep-alive successful:', data);
      }

      // Call the refresh callback to update page data
      try {
        await this.config.onRefresh();
      } catch (refreshError) {
        console.warn('[AutoRefresh] Refresh callback failed:', refreshError);
      }

      // Notify about successful status update
      this.config.onStatusChange({
        isOnline: true,
        lastActivity: data.timestamp,
        error: null
      });

    } catch (error) {
      this.consecutiveErrors++;
      
      if (this.config.debug) {
        console.error(`[AutoRefresh] Keep-alive failed (${this.consecutiveErrors}/${this.maxConsecutiveErrors}):`, error);
      }

      // Handle consecutive errors
      if (this.consecutiveErrors >= this.maxConsecutiveErrors) {
        if (this.config.debug) {
          console.warn('[AutoRefresh] Too many consecutive errors, stopping auto-refresh');
        }
        this.stop();
      }

      // Notify about error
      this.config.onStatusChange({
        isOnline: false,
        lastActivity: null,
        error: error.message
      });

      this.config.onError(error);
    }
  }

  updateConfig(newConfig) {
    const wasActive = this.isActive;
    
    if (wasActive) {
      this.stop();
    }

    this.config = { ...this.config, ...newConfig };

    if (wasActive) {
      this.start();
    }
  }

  getStatus() {
    return {
      isActive: this.isActive,
      isPageVisible: this.isPageVisible,
      lastKeepAliveTime: this.lastKeepAliveTime,
      consecutiveErrors: this.consecutiveErrors,
      config: { ...this.config }
    };
  }

  destroy() {
    this.stop();
    
    // Remove event listeners
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    
    if (this.config.debug) {
      console.log('[AutoRefresh] Destroyed');
    }
  }
}

// Export for use in different frontend applications
export default AutoRefreshManager;

// Helper function to create and start auto-refresh for different user types
export const createAutoRefresh = (userType, userId, options = {}) => {
  const config = {
    userType,
    userId,
    debug: process.env.NODE_ENV === 'development',
    ...options
  };

  const autoRefresh = new AutoRefreshManager(config);
  autoRefresh.start();
  
  return autoRefresh;
};

// React hook for auto-refresh (can be used in React applications)
export const useAutoRefresh = (userType, userId, dependencies = [], options = {}) => {
  const [autoRefresh, setAutoRefresh] = React.useState(null);
  const [status, setStatus] = React.useState({
    isOnline: false,
    lastActivity: null,
    error: null
  });

  React.useEffect(() => {
    if (!userType || !userId) return;

    const config = {
      userType,
      userId,
      onStatusChange: setStatus,
      debug: process.env.NODE_ENV === 'development',
      ...options
    };

    const manager = new AutoRefreshManager(config);
    manager.start();
    setAutoRefresh(manager);

    return () => {
      manager.destroy();
    };
  }, [userType, userId, ...dependencies]);

  return { autoRefresh, status };
};
