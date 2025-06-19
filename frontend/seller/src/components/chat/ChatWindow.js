import React, { memo, useEffect, useRef, useCallback } from 'react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import VirtualizedMessageList from './VirtualizedMessageList';
import { ConnectionStatus, TypingIndicator, OnlineStatus } from './StatusIndicators';
import { useAutoScroll, useFocusManagement } from '../../hooks/useAutoScroll';
import { useMemoizedMessages } from '../../hooks/useOptimization';

const ChatWindow = memo(({ 
  thread, 
  messages, 
  onSendMessage, 
  onTyping,
  loading, 
  isConnected,
  isTyping = false,
  sellerId
}) => {
  // Auto-scroll and focus management
  const { messagesEndRef, containerRef: messagesContainerRef, scrollToBottom } = useAutoScroll(messages);
  const { inputRef, focusInput, handleContainerClick } = useFocusManagement();

  // Memoized messages for performance
  const memoizedMessages = useMemoizedMessages(messages, sellerId);

  // const windowStyle = { // Removed
  //   height: '100%',
  //   display: 'flex',
  //   flexDirection: 'column',
  //   backgroundColor: '#ffffff'
  // };

  // const headerStyle = { // Removed
  //   padding: '20px',
  //   borderBottom: '1px solid #e5e7eb',
  //   backgroundColor: '#f9fafb',
  //   display: 'flex',
  //   justifyContent: 'space-between',
  //   alignItems: 'center'
  // };

  // const headerInfoStyle = { // Removed
  //   display: 'flex',
  //   alignItems: 'center',
  //   gap: '12px'
  // };

  // const avatarStyle = { // Removed
  //   width: '40px',
  //   height: '40px',
  //   borderRadius: '50%',
  //   backgroundColor: '#10b981',
  //   display: 'flex',
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   fontSize: '16px',
  //   color: 'white'
  // };

  // const headerTextStyle = { // Removed
  //   display: 'flex',
  //   flexDirection: 'column'
  // };

  // const threadTitleStyle = { // Removed
  //   margin: 0,
  //   fontSize: '16px',
  //   fontWeight: '600',
  //   color: '#374151'
  // };

  // const buyerInfoStyle = { // Removed
  //   margin: 0,
  //   fontSize: '12px',
  //   color: '#6b7280'
  // };

  // const statusIndicatorStyle = { // Removed
  //   display: 'flex',
  //   alignItems: 'center',
  //   gap: '8px',
  //   fontSize: '12px'
  // };

  const connectionStatusStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    borderRadius: '12px',
    backgroundColor: isConnected ? '#dcfce7' : '#fef2f2',
    color: isConnected ? '#166534' : '#dc2626'
  };

  // const messagesContainerStyle = { // Removed
  //   flex: 1,
  //   overflowY: 'auto',
  //   padding: '20px',
  //   backgroundColor: '#f9fafb',
  //   backgroundImage: `
  //     radial-gradient(circle at 20px 20px, rgba(37, 99, 235, 0.05) 1px, transparent 1px),
  //     radial-gradient(circle at 60px 60px, rgba(37, 99, 235, 0.05) 1px, transparent 1px)
  //   `,
  //   backgroundSize: '80px 80px'
  // };

  // const loadingStyle = { // Removed
  //   display: 'flex',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   height: '200px',
  //   color: '#6b7280'
  // };

  // const emptyStateStyle = { // Removed
  //   textAlign: 'center',
  //   padding: '60px 20px',
  //   color: '#9ca3af'
  // };

  const typingIndicatorStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    fontSize: '13px',
    color: '#6b7280',
    fontStyle: 'italic'
  };

  const typingDotsStyle = {
    display: 'flex',
    gap: '2px'
  };

  const dotStyle = {
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    backgroundColor: '#6b7280',
    animation: 'typingDot 1.4s infinite ease-in-out'
  };

  if (!thread) {
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="h-full flex flex-col justify-center items-center text-center p-5 text-slate-400">
          <div className="text-6xl mb-5">💬</div>
          <h3 className="m-0 mb-3 text-slate-700 text-xl">
            Выберите чат
          </h3>
          <p className="m-0 text-sm">
            Выберите чат из списка для начала общения
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-full w-full flex flex-col bg-white">
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-base text-white">
              👤
            </div>
            <div className="flex flex-col">
              <h3 className="m-0 text-base font-semibold text-slate-700">
                Чат с покупателем
              </h3>
              <div className="flex items-center gap-2">
                <p className="m-0 text-xs text-slate-500">
                  ID: {thread.buyer_id?.substring(0, 8)}...
                </p>
                <OnlineStatus
                  isOnline={thread.buyer_online}
                  lastSeen={thread.buyer_last_seen}
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs">
            <ConnectionStatus isConnected={isConnected} />
          </div>
        </div>

        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-5 bg-slate-50"
          onClick={handleContainerClick}
        >
          {loading ? (
            <div className="flex justify-center items-center h-52 text-slate-500">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                <span className="ml-3">Загрузка сообщений...</span> {/* Added span with ml-3 for clarity if needed */}
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center p-10 text-slate-400">
              <div className="text-5xl mb-4">💬</div>
              <h4 className="m-0 mb-2 text-slate-700 text-base">
                Начните разговор
              </h4>
              <p className="m-0 text-sm">
                Отправьте первое сообщение покупателю
              </p>
            </div>
          ) : memoizedMessages.length > 50 ? (
            // Use virtualized list for large message counts
            <>
              <VirtualizedMessageList
                messages={memoizedMessages}
                sellerId={sellerId}
                containerHeight={350}
                itemHeight={80}
              />
              <TypingIndicator isTyping={isTyping} userName="Покупатель" />
              <div ref={messagesEndRef} />
            </>
          ) : (
            // Use regular list for small message counts
            <>
              {memoizedMessages.map((message, index) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwnMessage={message.isOwnMessage}
                  showAvatar={true}
                  showTimestamp={true}
                  messageStatus={message.messageStatus}
                />
              ))}

              <TypingIndicator isTyping={isTyping} userName="Покупатель" />

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <MessageInput
          ref={inputRef}
          onSendMessage={onSendMessage}
          onTyping={onTyping}
          disabled={!isConnected}
          placeholder={
            !isConnected
              ? "Подключение к чату..."
              : "Введите ваш ответ..."
          }
        />
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes typingDot {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
});

ChatWindow.displayName = 'ChatWindow';

export default ChatWindow;
