import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook for auto-scrolling to bottom of messages
 */
export const useAutoScroll = (messages, enabled = true) => {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);

  // Scroll to bottom smoothly
  const scrollToBottom = useCallback((smooth = true) => {
    if (!enabled || !messagesEndRef.current) return;

    try {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end',
        inline: 'nearest'
      });
    } catch (error) {
      // Fallback for older browsers
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    }
  }, [enabled]);

  // Check if user is near bottom
  const isNearBottom = useCallback(() => {
    if (!containerRef.current) return true;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const threshold = 100; // pixels from bottom
    
    return scrollHeight - scrollTop - clientHeight < threshold;
  }, []);

  // Handle scroll events to detect user scrolling
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Mark as user scrolling
    isUserScrollingRef.current = true;

    // Reset user scrolling flag after scroll stops
    scrollTimeoutRef.current = setTimeout(() => {
      isUserScrollingRef.current = false;
    }, 150);
  }, []);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (!enabled || messages.length === 0) return;

    // Don't auto-scroll if user is actively scrolling or not near bottom
    if (isUserScrollingRef.current && !isNearBottom()) return;

    // Small delay to ensure DOM is updated
    const timeoutId = setTimeout(() => {
      scrollToBottom(true);
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [messages, enabled, scrollToBottom, isNearBottom]);

  // Attach scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return {
    messagesEndRef,
    containerRef,
    scrollToBottom,
    isNearBottom
  };
};

/**
 * Hook for smooth scrolling with intersection observer
 */
export const useIntersectionScroll = (messages, threshold = 0.1) => {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const observerRef = useRef(null);
  const shouldAutoScrollRef = useRef(true);

  // Setup intersection observer
  useEffect(() => {
    if (!messagesEndRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        shouldAutoScrollRef.current = entry.isIntersecting;
      },
      {
        root: containerRef.current,
        threshold
      }
    );

    observerRef.current.observe(messagesEndRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold]);

  // Auto-scroll when messages change
  useEffect(() => {
    if (shouldAutoScrollRef.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, []);

  return {
    messagesEndRef,
    containerRef,
    scrollToBottom,
    shouldAutoScroll: shouldAutoScrollRef.current
  };
};

/**
 * Hook for keyboard shortcuts in chat
 */
export const useChatKeyboard = (onSendMessage, onFocusInput) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl/Cmd + Enter to send message
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        onSendMessage?.();
      }

      // Escape to focus input
      if (event.key === 'Escape') {
        event.preventDefault();
        onFocusInput?.();
      }

      // Ctrl/Cmd + / for shortcuts help (future feature)
      if ((event.ctrlKey || event.metaKey) && event.key === '/') {
        event.preventDefault();
        // Could show shortcuts modal
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onSendMessage, onFocusInput]);
};

/**
 * Hook for managing focus states
 */
export const useFocusManagement = () => {
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const focusInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const blurInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.blur();
    }
  }, []);

  // Focus input when container is clicked
  const handleContainerClick = useCallback((event) => {
    // Only focus if clicking on empty space, not on interactive elements
    if (event.target === containerRef.current) {
      focusInput();
    }
  }, [focusInput]);

  return {
    inputRef,
    containerRef,
    focusInput,
    blurInput,
    handleContainerClick
  };
};
