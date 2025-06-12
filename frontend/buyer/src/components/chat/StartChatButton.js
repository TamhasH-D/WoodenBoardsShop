import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import { BUYER_TEXTS } from '../../utils/localization';

const StartChatButton = ({ sellerId, sellerName, className = '', size = 'medium' }) => {
  const navigate = useNavigate();
  const { showError, showSuccess } = useNotifications();
  const [isStarting, setIsStarting] = useState(false);
  
  // Получаем buyer_id из localStorage или контекста
  const buyerId = localStorage.getItem('buyer_id') || 'b8c8e1e0-1234-5678-9abc-def012345678';

  const handleStartChat = async () => {
    if (!sellerId) {
      showError('Ошибка: ID продавца не найден');
      return;
    }

    setIsStarting(true);
    
    try {
      const response = await fetch('/api/v1/chat-threads/start-with-seller', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buyer_id: buyerId,
          seller_id: sellerId
        })
      });

      if (!response.ok) {
        throw new Error('Не удалось создать чат');
      }

      const result = await response.json();
      const threadId = result.data.id;
      
      showSuccess(`Чат с ${sellerName || 'продавцом'} создан`);
      navigate(`/chats/${threadId}`);
      
    } catch (error) {
      console.error('Ошибка создания чата:', error);
      showError('Не удалось создать чат');
    } finally {
      setIsStarting(false);
    }
  };

  const buttonSizes = {
    small: {
      padding: '8px 12px',
      fontSize: '14px',
      minWidth: '120px'
    },
    medium: {
      padding: '12px 20px',
      fontSize: '16px',
      minWidth: '160px'
    },
    large: {
      padding: '16px 24px',
      fontSize: '18px',
      minWidth: '200px'
    }
  };

  const buttonStyle = {
    ...buttonSizes[size],
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: isStarting ? 'not-allowed' : 'pointer',
    opacity: isStarting ? 0.7 : 1,
    transition: 'all 0.2s ease',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    textDecoration: 'none'
  };

  return (
    <button
      onClick={handleStartChat}
      disabled={isStarting}
      className={className}
      style={buttonStyle}
      onMouseEnter={(e) => {
        if (!isStarting) {
          e.target.style.backgroundColor = '#1d4ed8';
          e.target.style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isStarting) {
          e.target.style.backgroundColor = '#2563eb';
          e.target.style.transform = 'translateY(0)';
        }
      }}
    >
      {isStarting ? (
        <>
          <div style={{
            width: '16px',
            height: '16px',
            border: '2px solid transparent',
            borderTop: '2px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          Создание чата...
        </>
      ) : (
        <>
          💬
          {BUYER_TEXTS.START_CHAT || 'Написать продавцу'}
        </>
      )}
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
};

export default StartChatButton;
