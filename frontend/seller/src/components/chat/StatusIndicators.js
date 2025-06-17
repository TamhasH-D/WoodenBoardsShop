import React, { memo } from 'react';

/**
 * Connection status indicator
 */
export const ConnectionStatus = memo(({ isConnected, isReconnecting = false }) => {
  const getStatusInfo = () => {
    if (isReconnecting) {
      return {
        icon: '🔄',
        text: 'Переподключение...',
        color: '#f59e0b',
        bgColor: '#fef3c7'
      };
    }
    
    if (isConnected) {
      return {
        icon: '🟢',
        text: 'Подключено',
        color: '#059669',
        bgColor: '#d1fae5'
      };
    }
    
    return {
      icon: '🔴',
      text: 'Отключено',
      color: '#dc2626',
      bgColor: '#fee2e2'
    };
  };

  const status = getStatusInfo();

  const containerStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 12px',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: '500',
    color: status.color,
    backgroundColor: status.bgColor,
    border: `1px solid ${status.color}20`,
    transition: 'all 0.2s ease'
  };

  return (
    <div style={containerStyle}>
      <span style={{ fontSize: '10px' }}>{status.icon}</span>
      {status.text}
    </div>
  );
});

/**
 * Typing indicator
 */
export const TypingIndicator = memo(({ isTyping, userName = 'Пользователь' }) => {
  if (!isTyping) return null;

  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#f3f4f6',
    borderRadius: '16px',
    fontSize: '13px',
    color: '#6b7280',
    fontStyle: 'italic',
    animation: 'fadeIn 0.3s ease-in'
  };

  const dotsStyle = {
    display: 'flex',
    gap: '2px'
  };

  const dotStyle = {
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    backgroundColor: '#9ca3af',
    animation: 'typingDot 1.4s infinite ease-in-out'
  };

  return (
    <>
      <div style={containerStyle}>
        <span>{userName} печатает</span>
        <div style={dotsStyle}>
          <div style={{...dotStyle, animationDelay: '0s'}} />
          <div style={{...dotStyle, animationDelay: '0.2s'}} />
          <div style={{...dotStyle, animationDelay: '0.4s'}} />
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes typingDot {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-8px);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
});

/**
 * Online status indicator
 */
export const OnlineStatus = memo(({ isOnline, lastSeen }) => {
  const getStatusInfo = () => {
    if (isOnline) {
      return {
        icon: '🟢',
        text: 'В сети',
        color: '#059669'
      };
    }
    
    if (lastSeen) {
      const now = new Date();
      const lastSeenDate = new Date(lastSeen);
      const diffInMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));
      
      if (diffInMinutes < 5) {
        return {
          icon: '🟡',
          text: 'Недавно был в сети',
          color: '#d97706'
        };
      } else if (diffInMinutes < 60) {
        return {
          icon: '⚪',
          text: `Был в сети ${diffInMinutes} мин назад`,
          color: '#6b7280'
        };
      } else {
        const diffInHours = Math.floor(diffInMinutes / 60);
        return {
          icon: '⚪',
          text: `Был в сети ${diffInHours} ч назад`,
          color: '#6b7280'
        };
      }
    }
    
    return {
      icon: '⚪',
      text: 'Не в сети',
      color: '#6b7280'
    };
  };

  const status = getStatusInfo();

  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    color: status.color
  };

  return (
    <div style={containerStyle}>
      <span style={{ fontSize: '8px' }}>{status.icon}</span>
      {status.text}
    </div>
  );
});

/**
 * Message delivery status
 */
export const MessageStatus = memo(({ status, timestamp }) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'sending':
        return {
          icon: '⏳',
          color: '#f59e0b',
          title: 'Отправляется...'
        };
      case 'sent':
        return {
          icon: '✓',
          color: '#6b7280',
          title: 'Отправлено'
        };
      case 'delivered':
        return {
          icon: '✓✓',
          color: '#6b7280',
          title: 'Доставлено'
        };
      case 'read':
        return {
          icon: '✓✓',
          color: '#059669',
          title: 'Прочитано'
        };
      case 'failed':
        return {
          icon: '❌',
          color: '#dc2626',
          title: 'Ошибка отправки'
        };
      default:
        return null;
    }
  };

  const statusInfo = getStatusInfo();
  if (!statusInfo) return null;

  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '10px',
    color: statusInfo.color,
    opacity: 0.8
  };

  const timeStyle = {
    fontSize: '10px',
    color: '#9ca3af'
  };

  return (
    <div style={containerStyle} title={statusInfo.title}>
      <span>{statusInfo.icon}</span>
      {timestamp && (
        <span style={timeStyle}>
          {new Date(timestamp).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      )}
    </div>
  );
});

/**
 * Unread messages badge
 */
export const UnreadBadge = memo(({ count, size = 'medium' }) => {
  if (!count || count === 0) return null;

  const sizeStyles = {
    small: {
      fontSize: '10px',
      padding: '2px 6px',
      minWidth: '16px',
      height: '16px'
    },
    medium: {
      fontSize: '11px',
      padding: '3px 8px',
      minWidth: '20px',
      height: '20px'
    },
    large: {
      fontSize: '12px',
      padding: '4px 10px',
      minWidth: '24px',
      height: '24px'
    }
  };

  const containerStyle = {
    ...sizeStyles[size],
    backgroundColor: '#ef4444',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 1,
    animation: count > 0 ? 'pulse 2s infinite' : 'none'
  };

  const displayCount = count > 99 ? '99+' : count.toString();

  return (
    <>
      <div style={containerStyle}>
        {displayCount}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}</style>
    </>
  );
});

// Set display names for debugging
ConnectionStatus.displayName = 'ConnectionStatus';
TypingIndicator.displayName = 'TypingIndicator';
OnlineStatus.displayName = 'OnlineStatus';
MessageStatus.displayName = 'MessageStatus';
UnreadBadge.displayName = 'UnreadBadge';
