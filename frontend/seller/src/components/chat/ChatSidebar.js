import React, { memo } from 'react';
import { formatChatDate } from '../../utils/dateUtils';
import { UnreadBadge, OnlineStatus } from './StatusIndicators';
import { VirtualizedThreadList } from './VirtualizedMessageList';
import { useMemoizedThreads } from '../../hooks/useOptimization';

const ChatSidebar = memo(({
  threads,
  selectedThread,
  onThreadSelect,
  loading,
  onRefresh,
  searchQuery,
  onSearchChange,
  onOpenSettings
}) => {
  const sidebarStyle = {
    width: '100%',
    height: '100%',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column'
  };

  const headerStyle = {
    padding: '20px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb'
  };

  const titleStyle = {
    margin: '0 0 12px 0',
    fontSize: '20px',
    fontWeight: '600',
    color: '#374151',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const searchContainerStyle = {
    position: 'relative',
    marginBottom: '12px'
  };

  const searchInputStyle = {
    width: '100%',
    padding: '10px 16px 10px 40px',
    border: '1px solid #d1d5db',
    borderRadius: '20px',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: '#ffffff',
    transition: 'all 0.2s ease'
  };

  const searchIconStyle = {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
    fontSize: '14px'
  };

  const refreshButtonStyle = {
    padding: '8px 16px',
    backgroundColor: '#8B4513',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  };

  const threadsContainerStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '8px'
  };

  const threadItemStyle = (thread) => ({
    padding: '16px',
    margin: '4px 0',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: selectedThread?.id === thread.id ? '#f0f9ff' : '#ffffff',
    border: selectedThread?.id === thread.id ? '2px solid #2563eb' : '1px solid #e5e7eb',
    boxShadow: selectedThread?.id === thread.id 
      ? '0 4px 12px rgba(37, 99, 235, 0.15)' 
      : '0 1px 3px rgba(0, 0, 0, 0.05)'
  });

  const avatarStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    color: 'white',
    flexShrink: 0
  };

  const threadInfoStyle = {
    flex: 1,
    minWidth: 0
  };

  const threadHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px'
  };

  const threadTitleStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    margin: 0
  };

  const threadTimeStyle = {
    fontSize: '11px',
    color: '#9ca3af',
    flexShrink: 0,
    marginLeft: '8px'
  };

  const lastMessageStyle = {
    fontSize: '13px',
    color: '#6b7280',
    margin: '0 0 8px 0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  };

  const threadFooterStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const buyerIdStyle = {
    fontSize: '11px',
    color: '#9ca3af',
    fontFamily: 'monospace'
  };

  const unreadBadgeStyle = {
    backgroundColor: '#ef4444',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: '600',
    minWidth: '18px',
    textAlign: 'center'
  };

  const emptyStateStyle = {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#9ca3af'
  };

  const loadingStyle = {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#6b7280'
  };

  // Use memoized and filtered threads
  const filteredThreads = useMemoizedThreads(threads, searchQuery);

  return (
    <div style={sidebarStyle}>
      <div style={headerStyle}>
        <h3 style={titleStyle}>
          💬 Чаты
          <span style={{ 
            fontSize: '12px', 
            fontWeight: 'normal', 
            color: '#6b7280',
            backgroundColor: '#e5e7eb',
            padding: '2px 8px',
            borderRadius: '10px'
          }}>
            {threads.length}
          </span>
        </h3>
        
        <div style={searchContainerStyle}>
          <div style={searchIconStyle}>🔍</div>
          <input
            type="text"
            placeholder="Поиск чатов..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={searchInputStyle}
            onFocus={(e) => e.target.style.borderColor = '#2563eb'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onRefresh}
            disabled={loading}
            style={refreshButtonStyle}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#7c3aed';
                e.target.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#8B4513';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            {loading ? '🔄' : '↻'} Обновить
          </button>

          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              style={{
                ...refreshButtonStyle,
                backgroundColor: '#6b7280',
                padding: '8px 12px'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#4b5563';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#6b7280';
                e.target.style.transform = 'translateY(0)';
              }}
              title="Настройки чата"
            >
              ⚙️
            </button>
          )}
        </div>
      </div>

      <div style={threadsContainerStyle}>
        {loading ? (
          <div style={loadingStyle}>
            <div style={{ fontSize: '24px', marginBottom: '12px' }}>⏳</div>
            Загрузка чатов...
          </div>
        ) : filteredThreads.length === 0 ? (
          <div style={emptyStateStyle}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
            <p style={{ margin: 0 }}>
              {searchQuery ? 'Чаты не найдены' : 'Чатов пока нет'}
            </p>
          </div>
        ) : filteredThreads.length > 20 ? (
          // Use virtualized list for large thread counts
          <VirtualizedThreadList
            threads={filteredThreads}
            selectedThread={selectedThread}
            onThreadSelect={onThreadSelect}
            containerHeight={500}
            itemHeight={100}
          />
        ) : (
          // Use regular list for small thread counts
          filteredThreads.map((thread) => (
            <div
              key={thread.id}
              style={threadItemStyle(thread)}
              onClick={() => onThreadSelect(thread)}
              onMouseEnter={(e) => {
                if (selectedThread?.id !== thread.id) {
                  e.target.style.backgroundColor = '#f9fafb';
                  e.target.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedThread?.id !== thread.id) {
                  e.target.style.backgroundColor = '#ffffff';
                  e.target.style.transform = 'translateY(0)';
                }
              }}
            >
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={avatarStyle}>
                  👤
                </div>
                
                <div style={threadInfoStyle}>
                  <div style={threadHeaderStyle}>
                    <h4 style={threadTitleStyle}>
                      Чат #{thread.id.substring(0, 8)}
                    </h4>
                    <span style={threadTimeStyle}>
                      {formatChatDate(thread.updated_at || thread.created_at)}
                    </span>
                  </div>
                  
                  <p style={lastMessageStyle}>
                    {thread.last_message || 'Сообщений пока нет'}
                  </p>
                  
                  <div style={threadFooterStyle}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={buyerIdStyle}>
                        {thread.buyer_id?.substring(0, 8)}...
                      </span>
                      <OnlineStatus
                        isOnline={thread.buyer_online}
                        lastSeen={thread.buyer_last_seen}
                      />
                    </div>

                    <UnreadBadge count={thread.unread_count} size="small" />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});

ChatSidebar.displayName = 'ChatSidebar';

export default ChatSidebar;
