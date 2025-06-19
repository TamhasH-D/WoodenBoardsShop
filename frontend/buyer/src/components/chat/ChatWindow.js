import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { useChat } from '../../hooks/useChat'; // Import the useChat hook

const formatTime = (createdAt) => {
  if (!createdAt || typeof createdAt !== 'string') {
    return 'Time N/A';
  }
  try {
    const dateObj = new Date(createdAt);
    if (isNaN(dateObj.getTime())) {
      return 'Invalid time';
    }
    return dateObj.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return 'Time Error';
  }
};

const ChatWindow = () => {
  const { threadId: routeThreadId } = useParams(); // Renamed to avoid conflict if threadId comes from useChat
  const navigate = useNavigate();
  const { showError, showInfo } = useNotifications(); // showInfo might be used by useChat or for other user notifications
  const {
    buyerProfile,
    isAuthenticated,
    profileLoading,
    profileError,
    login,
  } = useAuth();

  const buyerId = buyerProfile?.id;

  // State for fetching threadInfo (seller details, etc.)
  const [threadInfo, setThreadInfo] = useState(null);
  const [threadInfoLoading, setThreadInfoLoading] = useState(true);
  const [threadInfoError, setThreadInfoError] = useState(null);

  const [newMessage, setNewMessage] = useState('');
  // Typing state specific to this component's input
  const [isTypingLocal, setIsTypingLocal] = useState(false);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Fetch threadInfo (seller details, etc.) when component mounts or threadId from route changes
  useEffect(() => {
    if (routeThreadId) {
      setThreadInfoLoading(true);
      setThreadInfoError(null);
      apiService.getChatThreadDetails(routeThreadId) // Assuming this function exists or is adapted
        .then(response => {
          setThreadInfo(response.data);
        })
        .catch(error => {
          console.error('[ChatWindow] Error fetching thread details:', error);
          setThreadInfoError(error);
          showError('Не удалось загрузить информацию о чате.');
        })
        .finally(() => {
          setThreadInfoLoading(false);
        });
    }
  }, [routeThreadId, showError]);

  // Initialize useChat hook
  // It's called conditionally based on threadInfo being available.
  // SellerId from threadInfo is passed to useChat. initialThreadId is routeThreadId.
  const {
    messages,
    isConnected: isChatConnected,
    loading: chatHookLoading,
    error: chatHookError,
    sendMessage,
    sendTypingIndicator,
    // otherUserTyping from useChat (if/when implemented)
    // hasMoreMessages from useChat (if/when implemented)
    // loadMoreMessages from useChat (if/when implemented)
  } = useChat(threadInfo?.seller_id, null, routeThreadId, {
    // Options object for useChat, e.g., to enable/disable features
    // autoConnect: !!(isAuthenticated && buyerId && routeThreadId && threadInfo?.seller_id && !profileLoading),
  });


  const handleSendMessage = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !isChatConnected) return; // Check isChatConnected from useChat

    // Optimistic UI update for local input clearing can remain,
    // but actual message state management is handled by useChat.
    const messageText = newMessage.trim();
    setNewMessage(''); // Clear input
    setIsTypingLocal(false); // Reset local typing state
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);


    try {
      await sendMessage(messageText); // Call sendMessage from useChat
      // No direct setMessages or messagesRef manipulation here.
    } catch (error) {
      // Error already handled by useChat and its error state (chatHookError)
      // and potentially a notification via showError from useChat's context if it uses one.
      // If specific error display for sending is needed here, it could be added.
      // For now, relying on useChat's error state.
      // Re-populate newMessage for user to retry, if desired:
      // setNewMessage(messageText);
      console.error('[ChatWindow] Error sending message (reported by useChat or promise rejection):', error);
       showError('Не удалось отправить сообщение. Попробуйте еще раз.'); // More direct feedback
    }
  }, [newMessage, sendMessage, isChatConnected, showError]);


  const handleTypingLocal = useCallback(() => {
    if (!isChatConnected || !sendTypingIndicator) return;

    if (!isTypingLocal) {
      setIsTypingLocal(true);
      sendTypingIndicator(); // Call sendTypingIndicator from useChat
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTypingLocal(false);
      // sendStopTypingIndicator if useChat supports it
    }, 2000);
  }, [isChatConnected, sendTypingIndicator, isTypingLocal]);

  // Scroll to bottom when new messages arrive from useChat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Global loading state
  const isLoading = profileLoading || threadInfoLoading || chatHookLoading;
  const displayError = profileError || threadInfoError || chatHookError;

  // ---- UI Rendering based on Auth State & Loading ----
  if (profileLoading) { // Highest priority loading/error state
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', fontSize: '18px', color: '#6b7280' }}>Загрузка профиля пользователя...</div>;
  }
  if (profileError) {
    return <div style={{ textAlign: 'center', padding: '40px' }}><h3 style={{color: '#dc2626'}}>Ошибка загрузки профиля</h3><p>{profileError.message || "Не удалось загрузить ваш профиль."}</p><button onClick={login} className="btn btn-primary">Попробовать войти снова</button></div>;
  }
  if (!isAuthenticated || !buyerId) {
    return <div style={{ textAlign: 'center', padding: '40px' }}><h3>Доступ запрещен</h3><p>Пожалуйста, войдите в систему и убедитесь, что ваш профиль загружен, чтобы просмотреть этот чат.</p><button onClick={login} className="btn btn-primary">Войти</button></div>;
  }

  // Next, loading for thread info or chat hook initialization
  if (isLoading) {
     return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', fontSize: '18px', color: '#6b7280' }}>Загрузка данных чата...</div>;
  }

  // Displaying specific errors from threadInfo fetching or chat hook
  if (threadInfoError) {
    return <div style={{ textAlign: 'center', padding: '40px' }}><h3 style={{color: '#ef4444'}}>Ошибка загрузки информации о чате</h3><p>{threadInfoError.message || "Не удалось получить данные этого чата."}</p><button onClick={() => window.location.reload()} className="btn btn-primary">Попробовать снова</button></div>;
  }
   if (chatHookError) {
    return <div style={{ textAlign: 'center', padding: '40px' }}><h3 style={{color: '#ef4444'}}>Ошибка инициализации чата</h3><p>{typeof chatHookError === 'string' ? chatHookError : chatHookError.message || "Не удалось подключиться к чату."}</p><button onClick={() => window.location.reload()} className="btn btn-primary">Попробовать снова</button></div>;
  }

  if (!threadInfo) { // Should be caught by threadInfoLoading or threadInfoError, but as a safeguard
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', fontSize: '18px', color: '#ef4444' }}>Чат не найден или информация о нем недоступна.</div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '20px 0', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={() => navigate('/chats')} style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease', fontSize: '16px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}> ← </button>
            <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)' }}>🏪</div>
            <div>
              <h2 style={{ margin: 0, color: '#111827', fontSize: '24px', fontWeight: '800', letterSpacing: '-0.025em' }}>{threadInfo.product_title || 'Продавец'}</h2>
              <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>ID Продавца: {threadInfo.seller_id?.substring(0, 8)}...</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '20px', backgroundColor: isChatConnected ? '#dcfce7' : '#fef3c7', border: `1px solid ${isChatConnected ? '#bbf7d0' : '#fcd34d'}` }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isChatConnected ? '#10b981' : '#f59e0b', animation: isChatConnected ? 'pulse 2s infinite' : 'none' }} />
              <span style={{ fontSize: '14px', fontWeight: '600', color: isChatConnected ? '#065f46' : '#92400e' }}>{isChatConnected ? 'Подключен' : 'Подключение...'}</span>
            </div>
            {/* Placeholder for otherUserTyping from useChat if it gets implemented */}
            {/* {otherUserTypingFromHook && (...) } */}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', overflow: 'hidden', marginBottom: '24px' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: 'linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%)', position: 'relative' }}>
            {/* Load more messages button - functionality removed, placeholder for future from useChat */}
            {/* {hasMoreMessagesFromHook && messages.length > 0 && (...) } */}

            {messages.length === 0 && !chatHookLoading && (<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}><div style={{ fontSize: '64px', marginBottom: '24px', opacity: 0.6, animation: 'float 3s ease-in-out infinite' }}>💬</div><h3 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>Начните разговор</h3><p style={{ margin: 0, fontSize: '16px', color: '#6b7280', maxWidth: '400px', lineHeight: '1.6' }}>Отправьте первое сообщение продавцу.</p></div>)}

            {messages.map((message, index) => {
              const isOwnMessage = message.buyer_id === buyerId; // or message.sender_type === 'buyer' depending on useChat's message structure
              // Avatar logic might need adjustment based on useChat's message structure (sender_id vs sender_type)
              const prevMessage = messages[index - 1];
              const showAvatar = !isOwnMessage && (!prevMessage || message.sender_id !== prevMessage.sender_id);


              return (
                <div key={message.id} style={{ display: 'flex', justifyContent: isOwnMessage ? 'flex-end' : 'flex-start', marginBottom: '4px', alignItems: 'flex-end', gap: '12px' }}>
                  {!isOwnMessage && (<div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0, visibility: showAvatar ? 'visible' : 'hidden' }}>🏪</div>)}
                  <div style={{ maxWidth: '70%', display: 'flex', flexDirection: 'column', alignItems: isOwnMessage ? 'flex-end' : 'flex-start' }}>
                    <div style={{ padding: '16px 20px', borderRadius: isOwnMessage ? '20px 20px 4px 20px' : '20px 20px 20px 4px', backgroundColor: isOwnMessage ? '#2563eb' : 'white', color: isOwnMessage ? 'white' : '#374151', fontSize: '16px', lineHeight: '1.5', boxShadow: isOwnMessage ? '0 4px 16px rgba(37, 99, 235, 0.3)' : '0 4px 16px rgba(0, 0, 0, 0.1)', border: isOwnMessage ? 'none' : '1px solid #e5e7eb', position: 'relative', wordBreak: 'break-word' }}>
                      <div style={{ marginBottom: '8px' }}>{message.message}</div>
                      <div style={{ fontSize: '12px', opacity: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <span>{formatTime(message.created_at)}</span>
                        {isOwnMessage && (<div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>{message.sending ? (<div style={{width: '12px', height: '12px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite'}} />) : message.failed ? (<span style={{fontSize: '10px', opacity:0.8, color: '#ef4444'}}>❌</span>) : (<span style={{fontSize: '10px', opacity:0.8, color: message.is_read_by_seller ? '#10b981' : '#6b7280'}}>{message.is_read_by_seller ? '✓✓' : '✓'}</span>)}<span style={{fontSize: '8px', opacity: 0.6, color: message.failed ? '#ef4444' : 'inherit'}}>{message.sending ? 'отправка...' : message.failed ? 'ошибка' : message.is_read_by_seller ? 'прочитано' : 'доставлено'}</span></div>)}
                      </div>
                    </div>
                  </div>
                  {isOwnMessage && (<div style={{ width: '32px', flexShrink: 0 }} />)}
                </div>);
            })}
            {/* Placeholder for otherUserTyping display from useChat */}
            <div ref={messagesEndRef} />
          </div>
          <div style={{ padding: '24px', borderTop: '1px solid #e5e7eb', backgroundColor: 'white' }}>
            <form onSubmit={handleSendMessage}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <textarea value={newMessage} onChange={(e) => { setNewMessage(e.target.value); handleTypingLocal(); }} placeholder={isChatConnected ? "Напишите сообщение..." : "Подключение к чату..."} rows={1} style={{ width: '100%', padding: '16px 20px', border: '2px solid #e5e7eb', borderRadius: '20px', fontSize: '16px', outline: 'none', transition: 'all 0.3s ease', resize: 'none', fontFamily: 'inherit', backgroundColor: isChatConnected ? 'white' : '#f9fafb', minHeight: '56px', maxHeight: '120px', lineHeight: '1.5' }}
                    onFocus={(e) => { if (isChatConnected) { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)'; }}}
                    onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); }}}
                    disabled={!isAuthenticated || profileLoading || !isChatConnected /* isSending from useChat could be added here if available */} />
                  <div style={{ position: 'absolute', bottom: '-20px', right: '8px', fontSize: '12px', color: newMessage.length > 1000 ? '#ef4444' : '#9ca3af' }}>{newMessage.length}/1000</div>
                </div>
                <button type="submit" disabled={!newMessage.trim() || !isChatConnected /* || isSending from useChat */} style={{ width: '56px', height: '56px', backgroundColor: (!newMessage.trim() || !isChatConnected /* || isSending from useChat */) ? '#9ca3af' : '#2563eb', color: 'white', border: 'none', borderRadius: '50%', fontSize: '20px', cursor: (!newMessage.trim() || !isChatConnected /* || isSending from useChat */) ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: (!newMessage.trim() || !isChatConnected /* || isSending from useChat */) ? 'none' : '0 4px 16px rgba(37, 99, 235, 0.3)', transform: 'scale(1)', flexShrink: 0 }}
                  onMouseEnter={(e) => { if (newMessage.trim() && isChatConnected /* && !isSending from useChat */) { e.currentTarget.style.backgroundColor = '#1d4ed8'; e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(37, 99, 235, 0.4)'; }}}
                  onMouseLeave={(e) => { if (newMessage.trim() && isChatConnected /* && !isSending from useChat */) { e.currentTarget.style.backgroundColor = '#2563eb'; e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(37, 99, 235, 0.3)'; }}} >
                  {/* {isSendingFromHook ? (<div style={{width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTop: '3px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite'}}/>) : '🚀'} */}
                  🚀
                </button>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                {['Здравствуйте!', 'Какая цена?', 'Есть ли доставка?', 'Можно посмотреть?'].map((quickText) => (
                  <button key={quickText} type="button" onClick={() => setNewMessage(quickText)} style={{ padding: '8px 16px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '20px', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s ease', fontWeight: '500' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e5e7eb'; e.currentTarget.style.borderColor = '#d1d5db'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f3f4f6'; e.currentTarget.style.borderColor = '#e5e7eb'; }} >
                    {quickText}
                  </button>))}
              </div>
            </form>
          </div>
        </div>
      </div>
      <style jsx>{`@keyframes pulse {0%,100%{opacity:1}50%{opacity:.5}}@keyframes typing {0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-10px)}}@keyframes float {0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}@keyframes fadeInUp {from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin {0%{transform:rotate(0)}100%{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default ChatWindow;
