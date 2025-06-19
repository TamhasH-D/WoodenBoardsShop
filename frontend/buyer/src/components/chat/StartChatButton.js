import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth
import { apiService } from '../../services/api';
// Removed: import { getCurrentBuyerId } from '../../utils/auth';
import { BUYER_TEXTS } from '../../utils/localization';

const StartChatButton = ({ sellerId, sellerName, className = '', size = 'medium' }) => {
  const navigate = useNavigate();
  const { showError, showSuccess, showInfo } = useNotifications();
  const {
    buyerProfile,
    isAuthenticated, // Comprehensive flag
    profileLoading,
    profileError,
    login
  } = useAuth();

  const [isStarting, setIsStarting] = useState(false);

  const handleStartChat = async () => {
    if (!sellerId) {
      showError('Ошибка: ID продавца не найден.');
      return;
    }

    // Check authentication and profile status first
    if (profileLoading) {
      showInfo('Профиль пользователя загружается, пожалуйста, подождите.');
      return;
    }

    if (profileError) {
      showError(`Ошибка профиля: ${profileError.message || "Не удалось загрузить профиль."} Чат недоступен.`);
      return;
    }

    if (!isAuthenticated) {
      showInfo('Пожалуйста, войдите в систему, чтобы начать чат.');
      login(); // Attempt to log in
      return;
    }

    const buyerId = buyerProfile?.id;
    if (!buyerId) { // Should be covered by isAuthenticated, but as a safeguard
        showError('Не удалось определить ID пользователя. Попробуйте войти снова.');
        return;
    }

    setIsStarting(true);
    try {
      // TODO: Ideally, apiService.getBuyerChats would not require buyerId if it can be inferred from token.
      const existingChats = await apiService.getBuyerChats(buyerId, 0, 100); // Fetch more to ensure we find existing
      const existingThread = existingChats.data?.find(t => t.seller_id === sellerId && t.buyer_id === buyerId);

      if (existingThread) {
        showInfo(`Переход к существующему чату с ${sellerName || 'продавцом'}.`);
        navigate(`/chats/${existingThread.id}`);
      } else {
        // TODO: Ideally, apiService.startChatWithSeller would not require buyerId if inferred from token.
        const result = await apiService.startChatWithSeller(buyerId, sellerId);
        const threadId = result.data.id; // Assuming result.data is the thread object
        showSuccess(`Чат с ${sellerName || 'продавцом'} успешно создан.`);
        navigate(`/chats/${threadId}`);
      }
    } catch (error) {
      console.error('Ошибка при попытке начать чат:', error);
      showError(error.message || 'Не удалось начать или найти существующий чат.');
    } finally {
      setIsStarting(false);
    }
  };

  const buttonSizes = {
    small: { padding: '8px 12px', fontSize: '14px', minWidth: '120px' },
    medium: { padding: '12px 20px', fontSize: '16px', minWidth: '160px' },
    large: { padding: '16px 24px', fontSize: '18px', minWidth: '200px' }
  };

  const currentSizeStyle = buttonSizes[size] || buttonSizes.medium;
  let buttonText = BUYER_TEXTS.START_CHAT || 'Написать продавцу';
  let effectiveDisabled = isStarting || profileLoading;
  let hoverBgColor = '#1d4ed8'; // Darker blue
  let initialBgColor = '#2563eb'; // Standard blue

  if (profileLoading) {
    buttonText = 'Загрузка профиля...';
  } else if (!isAuthenticated && !profileError) {
    buttonText = 'Войти, чтобы написать';
    // For login, we don't disable, handleStartChat will trigger login()
    effectiveDisabled = isStarting; // Only disable if chat start process is ongoing
  } else if (profileError) {
    buttonText = 'Ошибка профиля';
    effectiveDisabled = true; // Disable if profile error
  } else if (isStarting) {
    buttonText = 'Создание чата...';
  }


  const buttonStyle = {
    ...currentSizeStyle,
    backgroundColor: initialBgColor,
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: effectiveDisabled ? 'not-allowed' : 'pointer',
    opacity: effectiveDisabled ? 0.7 : 1,
    transition: 'all 0.3s ease',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    textDecoration: 'none',
    boxShadow: '0 4px 16px rgba(37, 99, 235, 0.2)' // Adjusted shadow color for blue
  };

  // Override for login button style to make it distinct if needed
  if (!profileLoading && !isAuthenticated && !profileError) {
      buttonStyle.backgroundColor = '#4CAF50'; // Green for login prompt
      hoverBgColor = '#388E3C'; // Darker green
  }


  return (
    <button
      onClick={handleStartChat}
      disabled={effectiveDisabled}
      className={className}
      style={buttonStyle}
      onMouseEnter={(e) => {
        if (!effectiveDisabled) {
          e.currentTarget.style.backgroundColor = hoverBgColor;
          e.currentTarget.style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!effectiveDisabled) {
          e.currentTarget.style.backgroundColor = buttonStyle.backgroundColor; // Use the dynamically set initial color
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      {(isStarting || (profileLoading && isAuthenticated)) ? ( // Show spinner if starting OR if profile is loading post-keycloak auth
        <div style={{ width: '16px', height: '16px', border: '2px solid transparent', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      ) : '💬'}
      {buttonText}
      
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
