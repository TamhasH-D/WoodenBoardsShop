import { useMemo, useCallback, useRef, useEffect, useState } from 'react';

/**
 * Hook for debouncing values
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook for throttling function calls
 */
export const useThrottle = (callback, delay) => {
  const lastRun = useRef(Date.now());

  return useCallback((...args) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = Date.now();
    }
  }, [callback, delay]);
};

/**
 * Hook for memoizing expensive computations
 */
export const useMemoizedMessages = (messages, sellerId) => {
  return useMemo(() => {
    if (!messages || !Array.isArray(messages)) return [];

    return messages.map(message => ({
      ...message,
      isOwnMessage: message.seller_id === sellerId,
      formattedTime: new Date(message.created_at).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      messageStatus: getMessageStatus(message, sellerId)
    }));
  }, [messages, sellerId]);
};

/**
 * Get message status based on message data
 */
const getMessageStatus = (message, sellerId) => {
  if (message.seller_id !== sellerId) return null; // Not our message
  
  if (message.is_read_by_buyer) return 'read';
  if (message.delivered_at) return 'delivered';
  if (message.sent_at) return 'sent';
  return 'sending';
};

/**
 * Hook for memoizing thread list
 */
export const useMemoizedThreads = (threads, searchQuery) => {
  return useMemo(() => {
    if (!threads || !Array.isArray(threads)) return [];

    let filteredThreads = threads;

    // Apply search filter
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredThreads = threads.filter(thread => 
        thread.buyer_id?.toLowerCase().includes(query) ||
        thread.last_message?.toLowerCase().includes(query) ||
        thread.id.toLowerCase().includes(query)
      );
    }

    // Sort by last activity
    return filteredThreads.sort((a, b) => {
      const aTime = new Date(a.updated_at || a.created_at);
      const bTime = new Date(b.updated_at || b.created_at);
      return bTime - aTime;
    });
  }, [threads, searchQuery]);
};

/**
 * Hook for optimized event handlers
 */
export const useOptimizedHandlers = () => {
  const handlersRef = useRef({});

  const createHandler = useCallback((key, handler) => {
    if (!handlersRef.current[key]) {
      handlersRef.current[key] = (...args) => handler(...args);
    }
    return handlersRef.current[key];
  }, []);

  const clearHandlers = useCallback(() => {
    handlersRef.current = {};
  }, []);

  return { createHandler, clearHandlers };
};

/**
 * Hook for intersection observer optimization
 */
export const useIntersectionObserver = (options = {}) => {
  const targetRef = useRef(null);
  const observerRef = useRef(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    observerRef.current.observe(target);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [options]);

  return { targetRef, isIntersecting };
};

/**
 * Hook for lazy loading images
 */
export const useLazyImage = (src, placeholder = '') => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const { targetRef, isIntersecting } = useIntersectionObserver();

  useEffect(() => {
    if (isIntersecting && src && !isLoaded && !isError) {
      const img = new Image();
      
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
      };
      
      img.onerror = () => {
        setIsError(true);
      };
      
      img.src = src;
    }
  }, [isIntersecting, src, isLoaded, isError]);

  return { targetRef, imageSrc, isLoaded, isError };
};

/**
 * Hook for performance monitoring
 */
export const usePerformanceMonitor = (componentName) => {
  const renderCountRef = useRef(0);
  const lastRenderTime = useRef(Date.now());

  useEffect(() => {
    renderCountRef.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${componentName}] Render #${renderCountRef.current}, Time since last: ${timeSinceLastRender}ms`);
    }
    
    lastRenderTime.current = now;
  });

  const logPerformance = useCallback((operation, duration) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${componentName}] ${operation}: ${duration}ms`);
    }
  }, [componentName]);

  return { renderCount: renderCountRef.current, logPerformance };
};

/**
 * Hook for batch updates
 */
export const useBatchUpdates = () => {
  const updatesRef = useRef([]);
  const timeoutRef = useRef(null);

  const batchUpdate = useCallback((updateFn) => {
    updatesRef.current.push(updateFn);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const updates = updatesRef.current;
      updatesRef.current = [];
      
      // Apply all updates in a single batch
      updates.forEach(update => update());
    }, 16); // ~60fps
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return batchUpdate;
};

/**
 * Hook for memory usage optimization
 */
export const useMemoryOptimization = (maxCacheSize = 100) => {
  const cacheRef = useRef(new Map());

  const addToCache = useCallback((key, value) => {
    const cache = cacheRef.current;
    
    // Remove oldest entries if cache is full
    if (cache.size >= maxCacheSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    cache.set(key, value);
  }, [maxCacheSize]);

  const getFromCache = useCallback((key) => {
    return cacheRef.current.get(key);
  }, []);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  const getCacheSize = useCallback(() => {
    return cacheRef.current.size;
  }, []);

  return {
    addToCache,
    getFromCache,
    clearCache,
    getCacheSize
  };
};
