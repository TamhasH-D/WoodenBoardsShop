import React, { useState, useEffect, useRef } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const ProductChat = ({ productId, product, sellerId }) => {
  console.log('[ProductChat] Props received - sellerId:', sellerId, 'product:', product, 'productId:', productId);
  const { isAuthenticated, buyerProfile, profileLoading, profileError, login, keycloakAuthenticated } = useAuth();
  const { showError, showSuccess } = useNotifications();

  const [newMessage, setNewMessage] = useState('');
  const [isSendingUi, setIsSendingUi] = useState(false); // UI state for send button
  const [defaultMessageSet, setDefaultMessageSet] = useState(false);
  const messagesEndRef = useRef(null);

  const hookOptions = {
    initialTargetSellerId: sellerId,
    productContext: { productId: product?.id, productTitle: product?.title || product?.name }
  };

  const {
    selectedThread, // Renamed from 'thread'
    messages,
    isConnected,
    loadingMessages, // More specific loading state
    loadingThreads,  // For initial thread list load
    isCreatingThread, // For new thread creation process
    error: chatHookError,
    buyerId: chatHookBuyerId, // Buyer's DB ID from useChat
    isChatServiceReady, // Import the new readiness state
    sendMessage,
    sendTypingIndicator,
    hasExistingChatWithSeller, // New function from hook
    // productContext from hook can be used if needed, e.g. for default message if not passed via props
  } = useChat(hookOptions);

  const currentProductTitle = product?.title || product?.name;
  const doesChatExistWithSeller = hasExistingChatWithSeller(sellerId);

  useEffect(() => {
    if (chatHookError) {
      showError(chatHookError);
    }
  }, [chatHookError, showError]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    // Guard with isChatServiceReady
    if (!isAuthenticated || !isChatServiceReady || !newMessage.trim() || isSendingUi) return;

    const messageText = newMessage.trim();
    setIsSendingUi(true);

    try {
      // Pass sellerId to sendMessage for the hook to use if creating a new chat
      await sendMessage(messageText, sellerId);
      setNewMessage('');
      // Check if a new chat was just initiated (selectedThread might be new)
      // The hook now handles thread creation and selection internally.
      // We can check if a selectedThread now exists and was previously not known.
      if (!doesChatExistWithSeller && selectedThread) {
        showSuccess(`Чат с продавцом по товару "${currentProductTitle}" начат!`);
      }
    } catch (error) {
      console.error('[ProductChat] Error sending message:', error);
      showError(error.message || 'Не удалось отправить сообщение');
      setNewMessage(messageText); // Restore text on error
    } finally {
      setIsSendingUi(false);
    }
  };

  const handleTyping = () => {
    // Send typing indicator only if a thread is selected and connected
    if (isAuthenticated && selectedThread && isConnected) {
      sendTypingIndicator(true); // Parameter `true` indicates typing has started
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const isLoading = loadingThreads || loadingMessages || profileLoading || isCreatingThread;
    if (isAuthenticated && !defaultMessageSet && !newMessage && currentProductTitle && !doesChatExistWithSeller && !isLoading) {
      setNewMessage(`Здравствуйте! Интересует товар "${currentProductTitle}".`);
      setDefaultMessageSet(true);
    }
  }, [isAuthenticated, currentProductTitle, doesChatExistWithSeller, newMessage, loadingThreads, loadingMessages, profileLoading, isCreatingThread, defaultMessageSet, isChatServiceReady]);

  // --- Start of Disabled States and Placeholder Logic ---
  const inputAreaDisabled =
    profileLoading ||
    !isAuthenticated ||
    !sellerId ||
    !isChatServiceReady ||
    isCreatingThread;

  const sendButtonDisabled =
    inputAreaDisabled ||
    !newMessage.trim() || // Cannot send empty message
    isSendingUi ||
    (selectedThread && !isConnected); // If a thread context exists but not connected

  const initialLoading = loadingThreads || (!selectedThread && loadingMessages && !doesChatExistWithSeller && !isChatServiceReady);

  let placeholderText = "Напишите сообщение...";
  if (profileLoading) {
    placeholderText = "Загрузка профиля...";
  } else if (!keycloakAuthenticated) {
    placeholderText = "Войдите, чтобы начать чат";
  } else if (!isAuthenticated && keycloakAuthenticated) {
    placeholderText = "Профиль не загружен.";
  } else if (!isChatServiceReady && isAuthenticated) {
    placeholderText = "Инициализация чата...";
  } else if (initialLoading && isChatServiceReady) {
    placeholderText = "Загрузка чата...";
  } else if (isCreatingThread) {
    placeholderText = "Создание чата...";
  } else if (chatHookError) {
    placeholderText = "Ошибка чата. Обновите страницу.";
  } else if (!doesChatExistWithSeller && currentProductTitle && !defaultMessageSet && !inputAreaDisabled) {
    // This ensures default message doesn't overwrite "Initializing chat..." etc.
    placeholderText = `Начните чат о "${currentProductTitle}"`;
  } else if (selectedThread && !isConnected && !inputAreaDisabled) {
     placeholderText = "Подключение к чату...";
  } else if (inputAreaDisabled) {
    // Catch-all for other disabled states if not specifically handled above
    if (profileLoading) placeholderText = "Загрузка профиля...";
    else if (!isAuthenticated) placeholderText = "Войдите, чтобы начать чат";
    else if (!isChatServiceReady) placeholderText = "Инициализация чата...";
    else if (isCreatingThread) placeholderText = "Создание чата...";
    else placeholderText = "Чат временно недоступен";
  }
  // --- End of Disabled States and Placeholder Logic ---


  const renderHeaderStatus = () => {
    if (profileLoading && !keycloakAuthenticated) { // Initial load, keycloak also not checked yet
        return <div style={statusBadgeStyle('loading')}>Проверка аутентификации...</div>;
    }
    if (profileLoading && keycloakAuthenticated) {
        return <div style={statusBadgeStyle('loading')}>Загрузка профиля...</div>;
    }
    if (!keycloakAuthenticated && !profileError) { // Not logged in, no specific error yet
        return <div style={statusBadgeStyle('loginPrompt')}>⚠️ Войдите, чтобы написать продавцу</div>;
    }
    if (profileError) {
        return <div style={statusBadgeStyle('error')}>⚠️ Ошибка профиля: {profileError.message || "Чат недоступен"}</div>;
    }
    if (!isAuthenticated && keycloakAuthenticated) { // Should be covered by profileError or implies profile not loaded yet
        return <div style={statusBadgeStyle('error')}>⚠️ Профиль не загружен. Чат недоступен.</div>;
    }
    if (chatHookError && isAuthenticated) { // Chat specific error after authentication
        return <div style={statusBadgeStyle('error')}>⚠️ Ошибка чата: {chatHookError}</div>;
    }
    // If authenticated and no errors, no specific status message needed in header here.
    return null;
  };

  const statusBadgeStyle = (type) => {
    const base = {
        display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px',
        padding: '8px 16px', borderRadius: '20px', fontWeight: '600', textAlign: 'center'
    };
    if (type === 'error') return {...base, color: '#ef4444', backgroundColor: 'rgba(255,255,255,0.2)'};
    if (type === 'loginPrompt') return {...base, color: 'white', backgroundColor: 'rgba(255, 165, 0, 0.3)'};
    if (type === 'loading') return {...base, color: 'white', backgroundColor: 'rgba(0, 0, 0, 0.2)'};
    return base;
  };


  // Content for message area based on auth/loading/error states
  const renderMessageAreaContent = () => {
    if (profileLoading && !keycloakAuthenticated) { // Still checking keycloak
        return <LoadingStateView message="Проверка аутентификации..." />;
    }
    if (profileLoading && keycloakAuthenticated ) { // Keycloak is fine, profile is loading
        return <LoadingStateView message="Загрузка вашего профиля..." />;
    }
    if (!keycloakAuthenticated && !profileError) { // Not logged in
        return <AuthRequiredView message="Пожалуйста, войдите в систему, чтобы использовать чат." showLoginButton={true} onLogin={login} />;
    }
    if (profileError) { // Profile error after trying to load
        return <AuthRequiredView message={`Ошибка загрузки профиля: ${profileError.message}. Чат недоступен.`} />;
    }
    if (!isAuthenticated && keycloakAuthenticated) { // Profile not loaded for some other reason, or still loading (covered by profileLoading)
        return <AuthRequiredView message="Профиль пользователя не загружен. Чат временно недоступен." />;
    }
    if (initialLoading) { // Replaced chatHookLoading with initialLoading
        return <LoadingStateView message="Загрузка истории сообщений..." />;
    }
    if (chatHookError) { // Chat hook specific error
        return <AuthRequiredView message={`Ошибка чата: ${chatHookError}. Попробуйте обновить страницу.`} />;
    }
    if (messages.length === 0) {
        return <EmptyChatView hasExistingChat={doesChatExistWithSeller} productTitle={currentProductTitle} />;
    }
    return (
      <>
        {messages.map((message) => {
          // Standardized isOwnMessage check
          const isOwnMessage = message.sender_id === chatHookBuyerId && message.sender_type === 'buyer';
          return (
            <div key={message.id || message.temp_id} style={{ display: 'flex', justifyContent: isOwnMessage ? 'flex-end' : 'flex-start', marginBottom: '12px' }}>
              <div style={{
                maxWidth: window.innerWidth >= 768 ? '75%' : '85%',
                padding: '12px 16px',
                borderRadius: isOwnMessage ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                backgroundColor: isOwnMessage ? '#3b82f6' : (message._optimistic || message.sending ? '#e0e0e0' : 'white'), // Check _optimistic flag
                color: isOwnMessage ? 'white' : '#1f2937',
                fontSize: '15px', lineHeight: '1.4',
                boxShadow: isOwnMessage ? '0 4px 12px rgba(59, 130, 246, 0.25)' : '0 2px 8px rgba(0, 0, 0, 0.08)',
                border: isOwnMessage ? 'none' : '1px solid #e5e7eb',
                position: 'relative', animation: 'messageSlideIn 0.2s ease-out',
                opacity: (message._optimistic || message.sending) ? 0.7 : 1, // Check _optimistic flag
              }}>
                <div style={{ marginBottom: '6px', wordBreak: 'break-word' }}>{message.content || message.message}</div>
                <div style={{ fontSize: '11px', opacity: isOwnMessage ? 0.8 : 0.6, textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                  <span>{new Date(message.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
                  {isOwnMessage && !(message._optimistic || message.sending) && <span style={{ fontSize: '10px' }}>✓</span>}
                  {(isOwnMessage && (message._optimistic || message.sending)) && <span style={{ fontSize: '10px' }}>◌</span>}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </>
    );
  };

  const LoadingStateView = ({ message }) => (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#64748b' }}>
      <div style={{ width: '24px', height: '24px', border: '2px solid #e2e8f0', borderTop: '2px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
      <span style={{ fontSize: '14px', fontWeight: '500' }}>{message || "Загрузка..."}</span>
    </div>
  );

  const AuthRequiredView = ({ message, showLoginButton, onLogin }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', padding: '20px', color: '#64748b' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px'}}>⛔</div>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#374151' }}>Доступ ограничен</h3>
      <p style={{ margin: '0 0 16px 0', fontSize: '13px', lineHeight: '1.4', maxWidth: '280px', color: '#64748b' }}>
        {message}
      </p>
      {showLoginButton && onLogin && (
        <button onClick={onLogin} style={{padding: '10px 20px', fontSize: '15px', color: 'white', backgroundColor: '#2563eb', border: 'none', borderRadius: '8px', cursor: 'pointer'}}>
          Войти
        </button>
      )}
    </div>
  );

  const EmptyChatView = ({ hasExistingChat, productTitle }) => (
     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', color: '#64748b' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, #e2e8f0, #cbd5e1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '16px' }}>
            💬
        </div>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#374151' }}>
            {hasExistingChat ? 'Сообщений пока нет' : `Начните диалог о "${productTitle}"`}
        </h3>
        <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.4', maxWidth: '240px', color: '#64748b' }}>
            {hasExistingChat ? 'Отправьте сообщение ниже.' : 'Задайте свой вопрос продавцу.'}
        </p>
    </div>
  );

  console.log('[ProductChat] Disabled States:', {
    inputAreaDisabled,
    sendButtonDisabled,
    profileLoading,
    isAuthenticated,
    sellerIdProvided: !!sellerId,
    isChatServiceReady,
    isCreatingThread,
    isSendingUi,
    isConnected,
    selectedThreadExists: !!selectedThread,
    selectedThreadId: selectedThread?.id,
    chatHookError
  });

  return (
    <div style={{
      backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      border: '1px solid #e2e8f0', overflow: 'hidden', background: 'white'
    }}>
      <div style={{
        padding: window.innerWidth >= 768 ? '24px 32px' : '20px 24px', borderBottom: '1px solid #f1f5f9',
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', color: 'white', position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: '0 0 6px 0', fontSize: window.innerWidth >= 768 ? '22px' : '20px', fontWeight: '600', color: 'white', display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '-0.025em' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>💬</div>
              Связь с продавцом
            </h2>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: '400' }}>
              {isAuthenticated && doesChatExistWithSeller ? 'Продолжите переписку' : isAuthenticated ? `Задайте вопрос о "${currentProductTitle}"` : 'Войдите, чтобы задать вопрос'}
            </p>
          </div>
          {renderHeaderStatus()}
        </div>
      </div>

      <div style={{
        height: doesChatExistWithSeller || isAuthenticated ? (window.innerWidth >= 768 ? '400px' : '320px') : (window.innerWidth >= 768 ? '280px' : '240px'), // Adjust height based on state
        overflowY: 'auto', padding: window.innerWidth >= 768 ? '24px' : '16px',
        backgroundColor: '#fafafa', backgroundImage: 'linear-gradient(135deg, #fafafa 0%, #f8fafc 100%)'
      }}>
        {renderMessageAreaContent()}
      </div>

      <div style={{
        padding: window.innerWidth >= 768 ? '20px 24px' : '16px 20px',
        borderTop: '1px solid #f1f5f9', background: 'white'
      }}>
        <form onSubmit={handleSendMessage}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <textarea
                value={newMessage}
                onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
                placeholder={placeholderText}
                rows={2}
                style={{
                  width: '100%', padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: '12px',
                  fontSize: '15px', outline: 'none', transition: 'all 0.2s ease', resize: 'none',
                  fontFamily: 'inherit',
                  backgroundColor: (inputAreaDisabled || isSendingUi) ? '#eef2f7' : '#fafafa', // Use new disabled state
                  opacity: (inputAreaDisabled || isSendingUi) ? 0.7 : 1
                }}
                onFocus={(e) => { if (!(inputAreaDisabled || isSendingUi)) { e.target.style.borderColor = '#3b82f6'; e.target.style.backgroundColor = 'white'; e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; }}}
                onBlur={(e) => { if (!(inputAreaDisabled || isSendingUi)) { e.target.style.borderColor = '#e5e7eb'; e.target.style.backgroundColor = '#fafafa'; e.target.style.boxShadow = 'none'; }}}
                disabled={inputAreaDisabled || isSendingUi} // Use new disabled state
              />
            </div>
            <button
              type="submit"
              disabled={sendButtonDisabled} // Use new disabled state
              style={{
                padding: '12px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none',
                borderRadius: '12px', fontSize: '14px', fontWeight: '600',
                cursor: sendButtonDisabled ? 'not-allowed' : 'pointer', // Use new disabled state
                opacity: sendButtonDisabled ? 0.5 : 1, // Use new disabled state
                transition: 'all 0.2s ease', whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(59, 130, 246, 0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', minWidth: '100px'
              }}
              onMouseEnter={(e) => { if (!sendButtonDisabled) { e.target.style.backgroundColor = '#2563eb'; e.target.style.transform = 'translateY(-1px)'; }}}
              onMouseLeave={(e) => { if (!sendButtonDisabled) { e.target.style.backgroundColor = '#3b82f6'; e.target.style.transform = 'translateY(0)'; }}}
            >
              {isSendingUi ? (
                <><div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /><span>Отправка</span></>
              ) : (
                <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22,2 15,22 11,13 2,9"></polygon></svg><span>Отправить</span></>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes messageSlideIn { 0% { opacity: 0; transform: translateY(20px) scale(0.95); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </div>
  );
};

export default ProductChat;
