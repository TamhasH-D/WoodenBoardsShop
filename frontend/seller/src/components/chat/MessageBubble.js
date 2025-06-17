import React, { memo } from 'react';
import { formatTime } from '../../utils/dateUtils';
import { MessageStatus } from './StatusIndicators';

const MessageBubble = memo(({
  message,
  isOwnMessage,
  showAvatar = true,
  showTimestamp = true,
  messageStatus = 'delivered' // 'sending', 'sent', 'delivered', 'read', 'failed'
}) => {
  const bubbleStyle = {
    display: 'flex',
    justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
    marginBottom: '12px',
    alignItems: 'flex-end',
    gap: '8px'
  };

  const messageContainerStyle = {
    maxWidth: '70%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: isOwnMessage ? 'flex-end' : 'flex-start'
  };

  const messageBubbleStyle = {
    padding: '12px 16px',
    borderRadius: isOwnMessage ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
    backgroundColor: isOwnMessage ? '#2563eb' : '#ffffff',
    color: isOwnMessage ? '#ffffff' : '#374151',
    fontSize: '14px',
    lineHeight: '1.5',
    wordWrap: 'break-word',
    boxShadow: isOwnMessage 
      ? '0 2px 8px rgba(37, 99, 235, 0.2)' 
      : '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: isOwnMessage ? 'none' : '1px solid #e5e7eb',
    position: 'relative',
    animation: 'messageSlideIn 0.3s ease-out'
  };

  const avatarStyle = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: isOwnMessage ? '#8B4513' : '#10b981',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    color: 'white',
    fontWeight: '600',
    flexShrink: 0
  };

  const timestampStyle = {
    fontSize: '11px',
    color: '#9ca3af',
    marginTop: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  };

  const statusIconStyle = {
    fontSize: '10px',
    opacity: 0.7
  };



  return (
    <>
      <div style={bubbleStyle}>
        {!isOwnMessage && showAvatar && (
          <div style={avatarStyle}>
            👤
          </div>
        )}
        
        <div style={messageContainerStyle}>
          <div style={messageBubbleStyle}>
            {message.message}
          </div>
          
          {showTimestamp && (
            <div style={timestampStyle}>
              <span>{formatTime(message.created_at)}</span>
              {isOwnMessage && (
                <MessageStatus
                  status={messageStatus}
                  timestamp={message.created_at}
                />
              )}
            </div>
          )}
        </div>

        {isOwnMessage && showAvatar && (
          <div style={avatarStyle}>
            🏪
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes messageSlideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
});

MessageBubble.displayName = 'MessageBubble';

export default MessageBubble;
