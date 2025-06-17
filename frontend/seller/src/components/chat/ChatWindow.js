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

  const windowStyle = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#ffffff'
  };

  const headerStyle = {
    padding: '20px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const headerInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  const avatarStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    color: 'white'
  };

  const headerTextStyle = {
    display: 'flex',
    flexDirection: 'column'
  };

  const threadTitleStyle = {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: '#374151'
  };

  const buyerInfoStyle = {
    margin: 0,
    fontSize: '12px',
    color: '#6b7280'
  };

  const statusIndicatorStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px'
  };

  const connectionStatusStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    borderRadius: '12px',
    backgroundColor: isConnected ? '#dcfce7' : '#fef2f2',
    color: isConnected ? '#166534' : '#dc2626'
  };

  const messagesContainerStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    backgroundColor: '#f9fafb',
    backgroundImage: `
      radial-gradient(circle at 20px 20px, rgba(37, 99, 235, 0.05) 1px, transparent 1px),
      radial-gradient(circle at 60px 60px, rgba(37, 99, 235, 0.05) 1px, transparent 1px)
    `,
    backgroundSize: '80px 80px'
  };

  const loadingStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    color: '#6b7280'
  };

  const emptyStateStyle = {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#9ca3af'
  };

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
      <div style={windowStyle}>
        <div style={{
          ...emptyStateStyle,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>💬</div>
          <h3 style={{ 
            margin: '0 0 12px 0', 
            color: '#374151',
            fontSize: '20px'
          }}>
            Выберите чат
          </h3>
          <p style={{ margin: 0, fontSize: '14px' }}>
            Выберите чат из списка для начала общения
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={windowStyle}>
        <div style={headerStyle}>
          <div style={headerInfoStyle}>
            <div style={avatarStyle}>
              👤
            </div>
            <div style={headerTextStyle}>
              <h3 style={threadTitleStyle}>
                Чат с покупателем
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <p style={buyerInfoStyle}>
                  ID: {thread.buyer_id?.substring(0, 8)}...
                </p>
                <OnlineStatus
                  isOnline={thread.buyer_online}
                  lastSeen={thread.buyer_last_seen}
                />
              </div>
            </div>
          </div>
          
          <div style={statusIndicatorStyle}>
            <ConnectionStatus isConnected={isConnected} />
          </div>
        </div>

        <div
          ref={messagesContainerRef}
          style={messagesContainerStyle}
          onClick={handleContainerClick}
        >
          {loading ? (
            <div style={loadingStyle}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px' 
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid #e5e7eb',
                  borderTop: '2px solid #2563eb',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Загрузка сообщений...
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div style={emptyStateStyle}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
              <h4 style={{ 
                margin: '0 0 8px 0', 
                color: '#374151',
                fontSize: '16px'
              }}>
                Начните разговор
              </h4>
              <p style={{ margin: 0, fontSize: '14px' }}>
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
