import React, { memo, useMemo, useCallback, useRef, useEffect, useState } from 'react';
import MessageBubble from './MessageBubble';

/**
 * Virtualized message list for performance optimization
 */
const VirtualizedMessageList = memo(({ 
  messages, 
  sellerId, 
  containerHeight = 400,
  itemHeight = 80, // Estimated height per message
  overscan = 5 // Number of items to render outside visible area
}) => {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerSize, setContainerSize] = useState({ width: 0, height: containerHeight });

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      messages.length - 1,
      Math.ceil((scrollTop + containerSize.height) / itemHeight) + overscan
    );
    
    return { startIndex, endIndex };
  }, [scrollTop, containerSize.height, itemHeight, overscan, messages.length]);

  // Get visible messages
  const visibleMessages = useMemo(() => {
    return messages.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [messages, visibleRange]);

  // Handle scroll
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // Calculate total height
  const totalHeight = messages.length * itemHeight;

  // Calculate offset for visible items
  const offsetY = visibleRange.startIndex * itemHeight;

  const containerStyle = {
    height: containerHeight,
    overflowY: 'auto',
    position: 'relative'
  };

  const innerStyle = {
    height: totalHeight,
    position: 'relative'
  };

  const contentStyle = {
    transform: `translateY(${offsetY}px)`,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0
  };

  return (
    <div
      ref={containerRef}
      style={containerStyle}
      onScroll={handleScroll}
    >
      <div style={innerStyle}>
        <div style={contentStyle}>
          {visibleMessages.map((message, index) => {
            const actualIndex = visibleRange.startIndex + index;
            return (
              <div
                key={message.id}
                style={{
                  height: itemHeight,
                  display: 'flex',
                  alignItems: 'flex-start',
                  padding: '8px 16px'
                }}
              >
                <MessageBubble
                  message={message}
                  isOwnMessage={message.seller_id === sellerId}
                  showAvatar={true}
                  showTimestamp={true}
                  messageStatus="delivered"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

/**
 * Simple virtualized list for thread sidebar
 */
export const VirtualizedThreadList = memo(({ 
  threads, 
  selectedThread, 
  onThreadSelect,
  containerHeight = 500,
  itemHeight = 100,
  overscan = 3
}) => {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      threads.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    
    return { startIndex, endIndex };
  }, [scrollTop, containerHeight, itemHeight, overscan, threads.length]);

  // Get visible threads
  const visibleThreads = useMemo(() => {
    return threads.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [threads, visibleRange]);

  // Handle scroll
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  // Calculate total height
  const totalHeight = threads.length * itemHeight;

  // Calculate offset for visible items
  const offsetY = visibleRange.startIndex * itemHeight;

  const containerStyle = {
    height: containerHeight,
    overflowY: 'auto',
    position: 'relative'
  };

  const innerStyle = {
    height: totalHeight,
    position: 'relative'
  };

  const contentStyle = {
    transform: `translateY(${offsetY}px)`,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0
  };

  return (
    <div
      ref={containerRef}
      style={containerStyle}
      onScroll={handleScroll}
    >
      <div style={innerStyle}>
        <div style={contentStyle}>
          {visibleThreads.map((thread, index) => {
            const actualIndex = visibleRange.startIndex + index;
            const isSelected = selectedThread?.id === thread.id;
            
            return (
              <div
                key={thread.id}
                onClick={() => onThreadSelect(thread)}
                style={{
                  height: itemHeight,
                  padding: '16px',
                  backgroundColor: isSelected ? '#f0f9ff' : '#ffffff',
                  border: isSelected ? '2px solid #2563eb' : '1px solid #e5e7eb',
                  borderRadius: '12px',
                  margin: '4px 8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected 
                    ? '0 4px 12px rgba(37, 99, 235, 0.15)' 
                    : '0 1px 3px rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <div style={{
                  fontWeight: '600',
                  color: '#374151',
                  fontSize: '14px',
                  marginBottom: '4px'
                }}>
                  Чат #{thread.id.substring(0, 8)}...
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {thread.last_message || 'Сообщений пока нет'}
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '4px'
                }}>
                  <span style={{
                    fontSize: '10px',
                    color: '#9ca3af'
                  }}>
                    {new Date(thread.created_at).toLocaleDateString('ru-RU')}
                  </span>
                  {thread.unread_count > 0 && (
                    <span style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      fontSize: '10px',
                      fontWeight: '600'
                    }}>
                      {thread.unread_count}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

VirtualizedMessageList.displayName = 'VirtualizedMessageList';
VirtualizedThreadList.displayName = 'VirtualizedThreadList';

export default VirtualizedMessageList;
