import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiService } from '../../services/api';
import { getCurrentBuyerId } from '../../utils/auth';
import { BUYER_TEXTS } from '../../utils/localization';

const StartChatButton = ({ sellerId, sellerName, className = '', size = 'medium' }) => {
  const navigate = useNavigate();
  const { showError, showSuccess } = useNotifications();
  const [isStarting, setIsStarting] = useState(false);

  const handleStartChat = async () => {
    if (!sellerId) {
      showError('Ошибка: ID продавца не найден');
      return;
    }

    setIsStarting(true);

    try {
      // Получаем buyer_id
      const buyerId = await getCurrentBuyerId();

      // Проверяем, есть ли уже чат с этим продавцом
      const existingChats = await apiService.getBuyerChats(buyerId);
      const existingThread = existingChats.data?.find(t => t.seller_id === sellerId);

      if (existingThread) {
        // Если чат уже существует, переходим к нему
        showSuccess(`Переход к существующему чату с ${sellerName || 'продавцом'}`);
        navigate(`/chats/${existingThread.id}`);
      } else {
        // Создаем новый чат
        const result = await apiService.startChatWithSeller(buyerId, sellerId);
        const threadId = result.data.id;

        showSuccess(`Чат с ${sellerName || 'продавцом'} создан`);
        navigate(`/chats/${threadId}`);
      }

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
    backgroundColor: '#8B4513',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: isStarting ? 'not-allowed' : 'pointer',
    opacity: isStarting ? 0.7 : 1,
    transition: 'all 0.3s ease',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    textDecoration: 'none',
    boxShadow: '0 4px 16px rgba(139, 69, 19, 0.3)'
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
