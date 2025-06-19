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
  // const sidebarStyle = { // Removed
  //   width: '100%',
  //   height: '100%',
  //   backgroundColor: '#ffffff',
  //   borderRight: '1px solid #e5e7eb',
  //   display: 'flex',
  //   flexDirection: 'column'
  // };

  // const headerStyle = { // Removed
  //   padding: '20px',
  //   borderBottom: '1px solid #e5e7eb',
  //   backgroundColor: '#f9fafb'
  // };

  // const titleStyle = { // Removed
  //   margin: '0 0 12px 0',
  //   fontSize: '20px',
  //   fontWeight: '600',
  //   color: '#374151',
  //   display: 'flex',
  //   alignItems: 'center',
  //   gap: '8px'
  // };

  // const searchContainerStyle = { // Removed
  //   position: 'relative',
  //   marginBottom: '12px'
  // };

  // const searchInputStyle = { // Removed
  //   width: '100%',
  //   padding: '10px 16px 10px 40px',
  //   border: '1px solid #d1d5db',
  //   borderRadius: '20px',
  //   fontSize: '14px',
  //   outline: 'none',
  //   backgroundColor: '#ffffff',
  //   transition: 'all 0.2s ease'
  // };

  // const searchIconStyle = { // Removed
  //   position: 'absolute',
  //   left: '14px',
  //   top: '50%',
  //   transform: 'translateY(-50%)',
  //   color: '#9ca3af',
  //   fontSize: '14px'
  // };

  // const refreshButtonStyle = { // Removed
  //   padding: '8px 16px',
  //   backgroundColor: '#8B4513',
  //   color: 'white',
  //   border: 'none',
  //   borderRadius: '8px',
  //   fontSize: '12px',
  //   cursor: 'pointer',
  //   transition: 'all 0.2s ease',
  //   display: 'flex',
  //   alignItems: 'center',
  //   gap: '6px'
  // };

  // const threadsContainerStyle = { // Removed
  //   flex: 1,
  //   overflowY: 'auto',
  //   padding: '8px'
  // };

  // const threadItemStyle = (thread) => ({ // Replaced by getThreadItemClasses
  //   padding: '16px',
  //   margin: '4px 0',
  //   borderRadius: '12px',
  //   cursor: 'pointer',
  //   transition: 'all 0.2s ease',
  //   backgroundColor: selectedThread?.id === thread.id ? '#f0f9ff' : '#ffffff',
  //   border: selectedThread?.id === thread.id ? '2px solid #2563eb' : '1px solid #e5e7eb',
  //   boxShadow: selectedThread?.id === thread.id
  //     ? '0 4px 12px rgba(37, 99, 235, 0.15)'
  //     : '0 1px 3px rgba(0, 0, 0, 0.05)'
  // });

  // const avatarStyle = { // Removed
  //   width: '40px',
  //   height: '40px',
  //   borderRadius: '50%',
  //   backgroundColor: '#10b981',
  //   display: 'flex',
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   fontSize: '16px',
  //   color: 'white',
  //   flexShrink: 0
  // };

  // const threadInfoStyle = { // Removed
  //   flex: 1,
  //   minWidth: 0
  // };

  // const threadHeaderStyle = { // Removed
  //   display: 'flex',
  //   justifyContent: 'space-between',
  //   alignItems: 'flex-start',
  //   marginBottom: '8px'
  // };

  // const threadTitleStyle = { // Removed
  //   fontSize: '14px',
  //   fontWeight: '600',
  //   color: '#374151',
  //   margin: 0
  // };

  // const threadTimeStyle = { // Removed
  //   fontSize: '11px',
  //   color: '#9ca3af',
  //   flexShrink: 0,
  //   marginLeft: '8px'
  // };

  // const lastMessageStyle = { // Removed
  //   fontSize: '13px',
  //   color: '#6b7280',
  //   margin: '0 0 8px 0',
  //   overflow: 'hidden',
  //   textOverflow: 'ellipsis',
  //   whiteSpace: 'nowrap'
  // };

  // const threadFooterStyle = { // Removed
  //   display: 'flex',
  //   justifyContent: 'space-between',
  //   alignItems: 'center'
  // };

  // const buyerIdStyle = { // Removed
  //   fontSize: '11px',
  //   color: '#9ca3af',
  //   fontFamily: 'monospace'
  // };

  const unreadBadgeStyle = { // This one is not used in this file directly, part of UnreadBadge component
    backgroundColor: '#ef4444',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: '600',
    minWidth: '18px',
    textAlign: 'center'
  };

  // const emptyStateStyle = { // Removed
  //   textAlign: 'center',
  //   padding: '40px 20px',
  //   color: '#9ca3af'
  // };

  // const loadingStyle = { // Removed
  //   textAlign: 'center',
  //   padding: '40px 20px',
  //   color: '#6b7280'
  // };

  // Use memoized and filtered threads
  const filteredThreads = useMemoizedThreads(threads, searchQuery);

  return (
    <div className="w-full h-full bg-white border-r border-slate-200 flex flex-col">
      <div className="p-5 border-b border-slate-200 bg-slate-50">
        <h3 className="mb-3 text-xl font-semibold text-slate-700 flex items-center gap-2">
          💬 Чаты
          <span className="text-xs font-normal text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
            {threads.length}
          </span>
        </h3>
        
        <div className="relative mb-3">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</div>
          <input
            type="text"
            placeholder="Поиск чатов..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full py-2.5 pr-4 pl-10 border border-slate-300 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200 ease-in-out"
            // onFocus and onBlur removed as focus: variants handle this
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-4 py-2 bg-[#8B4513] text-white border-none rounded-lg text-xs cursor-pointer transition-all duration-200 ease-in-out flex items-center gap-1.5 hover:bg-[#7A3D11] hover:-translate-y-0.5"
            // onMouseEnter and onMouseLeave removed
          >
            {loading ? '🔄' : '↻'} Обновить
          </button>

          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="px-3 py-2 bg-slate-500 text-white border-none rounded-lg text-xs cursor-pointer transition-all duration-200 ease-in-out flex items-center gap-1.5 hover:bg-slate-600 hover:-translate-y-0.5"
              // onMouseEnter and onMouseLeave removed
              title="Настройки чата"
            >
              ⚙️
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="text-center p-10 text-slate-500">
            <div style={{ fontSize: '24px', marginBottom: '12px' }}>⏳</div> {/* Emoji/icon style can be kept or replaced with SVG and Tailwind size */}
            Загрузка чатов...
          </div>
        ) : filteredThreads.length === 0 ? (
          <div className="text-center p-10 text-slate-400">
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div> {/* Emoji/icon style can be kept or replaced with SVG and Tailwind size */}
            <p className="m-0"> {/* Changed from style={{margin:0}} */}
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
          filteredThreads.map((thread) => {
            const getThreadItemClasses = (currentThread) => {
              const base = "p-4 my-1 rounded-xl cursor-pointer transition-all duration-200 border hover:bg-slate-50 hover:-translate-y-px";
              if (selectedThread?.id === currentThread.id) {
                return `${base} bg-blue-50 border-2 border-blue-600 shadow-lg`;
              }
              return `${base} bg-white border-slate-200 shadow-sm`;
            };

            return (
              <div
                key={thread.id}
                className={getThreadItemClasses(thread)}
                onClick={() => onThreadSelect(thread)}
                // onMouseEnter and onMouseLeave removed
              >
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-base text-white flex-shrink-0">
                    👤
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-sm font-semibold text-slate-700 m-0">
                        Чат #{thread.id.substring(0, 8)}
                      </h4>
                      <span className="text-xs text-slate-400 flex-shrink-0 ml-2">
                        {formatChatDate(thread.updated_at || thread.created_at)}
                      </span>
                    </div>

                    <p className="text-sm text-slate-500 m-0 mb-2 overflow-hidden text-ellipsis whitespace-nowrap">
                      {thread.last_message || 'Сообщений пока нет'}
                    </p>

                    <div className="flex justify-between items-center">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-slate-400 font-mono">
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
            );
          })
        )}
      </div>
    </div>
  );
});

ChatSidebar.displayName = 'ChatSidebar';

export default ChatSidebar;
