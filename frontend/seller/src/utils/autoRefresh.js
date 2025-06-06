/**
 * Auto-refresh utility for seller frontend
 * Maintains seller online status and refreshes data every 5 minutes
 */

import React from 'react';

class SellerAutoRefreshManager {
  constructor(sellerId, options = {}) {
    this.sellerId = sellerId;
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
        console.log(`[SellerAutoRefresh] Page visibility: ${this.isPageVisible ? 'visible' : 'hidden'}`);
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

    if (!this.sellerId) {
      console.error('[SellerAutoRefresh] Cannot start: sellerId is required');
      return;
    }

    this.isActive = true;
    this.consecutiveErrors = 0;

    if (this.config.debug) {
      console.log(`[SellerAutoRefresh] Starting for seller ${this.sellerId}`);
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
      console.log('[SellerAutoRefresh] Stopped');
    }
  }

  startInterval() {
    this.stopInterval();
    
    if (this.isActive && this.isPageVisible) {
      this.intervalId = setInterval(() => this.performKeepAlive(), this.config.keepAliveInterval);
      
      if (this.config.debug) {
        console.log(`[SellerAutoRefresh] Interval started (${this.config.keepAliveInterval / 1000}s)`);
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
        console.log('[SellerAutoRefresh] Performing keep-alive...');
      }

      const response = await fetch(`${this.config.apiBaseUrl}/api/v1/keep-alive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Type': 'seller',
          'X-User-ID': this.sellerId
        }
      });

      if (!response.ok) {
        throw new Error(`Keep-alive failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.lastKeepAliveTime = Date.now();
      this.consecutiveErrors = 0;

      if (this.config.debug) {
        console.log('[SellerAutoRefresh] Keep-alive successful:', data);
      }

      // Refresh page data
      try {
        await this.config.onRefresh();
      } catch (refreshError) {
        console.warn('[SellerAutoRefresh] Refresh callback failed:', refreshError);
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
        console.error(`[SellerAutoRefresh] Keep-alive failed (${this.consecutiveErrors}/${this.maxConsecutiveErrors}):`, error);
      }

      if (this.consecutiveErrors >= this.maxConsecutiveErrors) {
        if (this.config.debug) {
          console.warn('[SellerAutoRefresh] Too many consecutive errors, stopping');
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

export default SellerAutoRefreshManager;

// React hook for seller auto-refresh
export const useSellerAutoRefresh = (sellerId, onRefresh, dependencies = []) => {
  const [autoRefresh, setAutoRefresh] = React.useState(null);
  const [status, setStatus] = React.useState({
    isOnline: false,
    lastActivity: null,
    error: null
  });

  React.useEffect(() => {
    if (!sellerId) return;

    const manager = new SellerAutoRefreshManager(sellerId, {
      onRefresh,
      onStatusChange: setStatus,
      onError: (error) => {
        console.error('[SellerAutoRefresh] Error:', error);
        setStatus(prev => ({ ...prev, error: error.message }));
      }
    });

    manager.start();
    setAutoRefresh(manager);

    return () => {
      manager.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellerId, onRefresh, ...dependencies]);

  return { autoRefresh, status };
};
