import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../hooks/useChat'; // Import useChat hook
// Removed apiService and websocketManager as they will be used via the hook


const ChatWindow = () => {
  const { threadId: threadIdFromUrl } = useParams();
  const navigate = useNavigate();
  const { showError } = useNotifications(); // showInfo might be used if hook exposes more WS event types

  const {
    buyerProfile,
    isAuthenticated,
    profileLoading,
    profileError,
    login,
  } = useAuth();

  const {
    messages,
    selectedThread,
    loadingMessages,
    error: chatError,
    isConnected,
    sendMessage,
    sendTypingIndicator,
    selectThread,
    buyerId: chatHookBuyerId, // Buyer's DB ID from the hook
    typingUsers,
  } = useChat();

  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [isSending, setIsSending] = useState(false); // Local state for send button UI

  // Initialize chat context with the hook when threadIdFromUrl is available
  useEffect(() => {
    if (threadIdFromUrl && chatHookBuyerId && isAuthenticated) {
      console.log(`[ChatWindow] Selecting thread ${threadIdFromUrl} via useChat hook.`);
      selectThread(threadIdFromUrl);
    } else if (!isAuthenticated && !profileLoading) {
      showError("Пожалуйста, войдите в систему для просмотра чата.");
    }
  }, [threadIdFromUrl, selectThread, chatHookBuyerId, isAuthenticated, profileLoading, showError]);

  const handleSendMessage = useCallback(async (e) => {
    if (e) e.preventDefault();
    const messageText = newMessage.trim();
    if (!messageText || !chatHookBuyerId || !selectedThread?.id || !isAuthenticated) return;

    setIsSending(true); // For UI feedback on the button
    setNewMessage('');
    try {
      await sendMessage(messageText); // Hook handles optimistic updates and errors
      // Optionally send a 'stop_typing' indicator if implementing detailed typing logic
      sendTypingIndicator(false);
    } catch (error) {
      // Error is already handled by the hook and set in `chatError`
      // Re-set new message if send failed, hook should revert optimistic update.
      setNewMessage(messageText);
    } finally {
      setIsSending(false);
    }
  }, [newMessage, sendMessage, chatHookBuyerId, selectedThread, isAuthenticated, sendTypingIndicator]);

  const handleTyping = useCallback(() => {
    if (!selectedThread?.id || !chatHookBuyerId || !isConnected || !isAuthenticated) return;
    // Simple: just send true. Hook or server might handle timeout to set to false.
    sendTypingIndicator(true);
    // For more granular control (sending false after a pause):
    // clearTimeout(typingTimeoutRef.current);
    // typingTimeoutRef.current = setTimeout(() => {
    //   sendTypingIndicator(false);
    // }, 2000);
  }, [selectedThread, chatHookBuyerId, isConnected, sendTypingIndicator, isAuthenticated]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Determine if the other user is typing
  const otherUserIsTypingDerived = typingUsers.some(userId => userId !== chatHookBuyerId);

  // ---- UI Rendering based on Auth State & Hook State ----
  if (profileLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', fontSize: '18px', color: '#6b7280' }}>Загрузка профиля пользователя...</div>;
  }
  if (profileError) {
    return <div style={{ textAlign: 'center', padding: '40px' }}><h3 style={{color: '#dc2626'}}>Ошибка загрузки профиля</h3><p>{profileError.message || "Не удалось загрузить ваш профиль."}</p><button onClick={login} className="btn btn-primary">Попробовать войти снова</button></div>;
  }
  if (!isAuthenticated || !chatHookBuyerId) {
    return <div style={{ textAlign: 'center', padding: '40px' }}><h3>Доступ запрещен</h3><p>Пожалуйста, войдите в систему и убедитесь, что ваш профиль загружен, чтобы просмотреть этот чат.</p><button onClick={login} className="btn btn-primary">Войти</button></div>;
  }
  // Use loadingMessages from useChat hook
  if (loadingMessages && messages.length === 0) { // Show main loading only if messages are empty
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', fontSize: '18px', color: '#6b7280' }}>Загрузка сообщений...</div>;
  }
  // Display error from useChat hook if it occurs
  if (chatError && !loadingMessages) { // Added !loadingMessages to prevent showing error during initial load
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', fontSize: '18px', color: '#ef4444' }}>Ошибка: {chatError}. Попробуйте обновить страницу.</div>;
  }
  if (!selectedThread && !loadingMessages && !chatError) { // If no thread is selected (e.g. invalid threadIdFromUrl)
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', fontSize: '18px', color: '#ef4444' }}>Чат не найден или доступ запрещен. Убедитесь, что ID чата корректен.</div>;
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
              <h2 style={{ margin: 0, color: '#111827', fontSize: '24px', fontWeight: '800', letterSpacing: '-0.025em' }}>Продавец</h2>
              {/* Use selectedThread from useChat hook */}
              <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>ID: {selectedThread?.seller_id?.substring(0, 8)}...</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Use isConnected from useChat hook */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '20px', backgroundColor: isConnected ? '#dcfce7' : '#fef3c7', border: `1px solid ${isConnected ? '#bbf7d0' : '#fcd34d'}` }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isConnected ? '#10b981' : '#f59e0b', animation: isConnected ? 'pulse 2s infinite' : 'none' }} />
              <span style={{ fontSize: '14px', fontWeight: '600', color: isConnected ? '#065f46' : '#92400e' }}>{isConnected ? 'Подключен' : 'Подключение...'}</span>
            </div>
            {/* Use otherUserIsTypingDerived derived from useChat hook's typingUsers state */}
            {otherUserIsTypingDerived && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '20px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd' }}>
                <div style={{ display: 'flex', gap: '2px' }}><div style={{width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#0ea5e9', animation: 'typing 1.4s infinite ease-in-out'}} /><div style={{width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#0ea5e9', animation: 'typing 1.4s infinite ease-in-out 0.2s'}} /><div style={{width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#0ea5e9', animation: 'typing 1.4s infinite ease-in-out 0.4s'}} /></div>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#0369a1' }}>печатает...</span>
              </div>)}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', overflow: 'hidden', marginBottom: '24px' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: 'linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%)', position: 'relative' }}>
            {/* Load More Messages button removed as pagination is not in the current useChat hook */}
            {/* Display messages from useChat hook */}
            {messages.length === 0 && !loadingMessages && (<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}><div style={{ fontSize: '64px', marginBottom: '24px', opacity: 0.6, animation: 'float 3s ease-in-out infinite' }}>💬</div><h3 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>Начните разговор</h3><p style={{ margin: 0, fontSize: '16px', color: '#6b7280', maxWidth: '400px', lineHeight: '1.6' }}>Отправьте первое сообщение продавцу.</p></div>)}
            {messages.map((message, index) => {
              // Use chatHookBuyerId from useChat hook to determine if message is own
              const isOwnMessage = message.sender_id === chatHookBuyerId && message.sender_type === 'buyer';
              const prevMessage = messages[index - 1];
              const showAvatar = !isOwnMessage && (!prevMessage || prevMessage.sender_id !== message.sender_id || prevMessage.sender_type !== message.sender_type);
              const isLastInGroup = !messages[index+1] || messages[index+1].sender_id !== message.sender_id || messages[index+1].sender_type !== message.sender_type;
              // Message structure from useChat might differ slightly (e.g. no 'message.message', but 'message.content')
              // Assuming message object has: id, content, sender_id, sender_type, created_at, _optimistic (optional)
              return (
                <div key={message.id} style={{ display: 'flex', justifyContent: isOwnMessage ? 'flex-end' : 'flex-start', marginBottom: isLastInGroup ? '24px' : '4px', alignItems: 'flex-end', gap: '12px' }}>
                  {!isOwnMessage && (<div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0, visibility: showAvatar ? 'visible' : 'hidden' }}>🏪</div>)}
                  <div style={{ maxWidth: '70%', display: 'flex', flexDirection: 'column', alignItems: isOwnMessage ? 'flex-end' : 'flex-start' }}>
                    <div style={{ padding: '16px 20px', borderRadius: isOwnMessage ? '20px 20px 4px 20px' : '20px 20px 20px 4px', backgroundColor: isOwnMessage ? '#2563eb' : 'white', color: isOwnMessage ? 'white' : '#374151', fontSize: '16px', lineHeight: '1.5', boxShadow: isOwnMessage ? '0 4px 16px rgba(37, 99, 235, 0.3)' : '0 4px 16px rgba(0, 0, 0, 0.1)', border: isOwnMessage ? 'none' : '1px solid #e5e7eb', position: 'relative', wordBreak: 'break-word', opacity: message._optimistic ? 0.7 : 1 }}>
                      <div style={{ marginBottom: '8px' }}>{message.content || message.message}</div>
                      <div style={{ fontSize: '12px', opacity: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <span>{new Date(message.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
                        {isOwnMessage && (<div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>{message._optimistic ? (<div style={{width: '12px', height: '12px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite'}} />) : message.failed ? (<span style={{fontSize: '10px', opacity:0.8, color: '#ef4444'}}>❌</span>) : (<span style={{fontSize: '10px', opacity:0.8, color: message.is_read_by_seller ? '#10b981' : '#6b7280'}}>{message.is_read_by_seller ? '✓✓' : '✓'}</span>)}<span style={{fontSize: '8px', opacity: 0.6, color: message.failed ? '#ef4444' : 'inherit'}}>{message._optimistic ? 'отправка...' : message.failed ? 'ошибка' : message.is_read_by_seller ? 'прочитано' : 'доставлено'}</span></div>)}
                      </div>
                    </div>
                  </div>
                  {isOwnMessage && (<div style={{ width: '32px', flexShrink: 0 }} />)}
                </div>);
            })}
            {otherUserIsTypingDerived && (<div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px' }}><div style={{ padding: '12px 16px', borderRadius: '18px', backgroundColor: '#f3f4f6', color: '#6b7280', fontSize: '14px', fontStyle: 'italic' }}>Продавец печатает...</div></div>)}
            <div ref={messagesEndRef} />
          </div>
          <div style={{ padding: '24px', borderTop: '1px solid #e5e7eb', backgroundColor: 'white' }}>
            <form onSubmit={handleSendMessage}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <textarea value={newMessage} onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }} placeholder={isConnected ? "Напишите сообщение..." : "Подключение к чату..."} rows={1} style={{ width: '100%', padding: '16px 20px', border: '2px solid #e5e7eb', borderRadius: '20px', fontSize: '16px', outline: 'none', transition: 'all 0.3s ease', resize: 'none', fontFamily: 'inherit', backgroundColor: isConnected ? 'white' : '#f9fafb', minHeight: '56px', maxHeight: '120px', lineHeight: '1.5' }}
                    onFocus={(e) => { if (isConnected) { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)'; }}}
                    onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); }}}
                    disabled={!isAuthenticated || profileLoading || !isConnected || isSending} />
                  <div style={{ position: 'absolute', bottom: '-20px', right: '8px', fontSize: '12px', color: newMessage.length > 1000 ? '#ef4444' : '#9ca3af' }}>{newMessage.length}/1000</div>
                </div>
                <button type="submit" disabled={!newMessage.trim() || !isConnected || isSending || newMessage.length > 1000} style={{ width: '56px', height: '56px', backgroundColor: (!newMessage.trim() || !isConnected || isSending) ? '#9ca3af' : '#2563eb', color: 'white', border: 'none', borderRadius: '50%', fontSize: '20px', cursor: (!newMessage.trim() || !isConnected || isSending) ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: (!newMessage.trim() || !isConnected || isSending) ? 'none' : '0 4px 16px rgba(37, 99, 235, 0.3)', transform: 'scale(1)', flexShrink: 0 }}
                  onMouseEnter={(e) => { if (newMessage.trim() && isConnected && !isSending) { e.currentTarget.style.backgroundColor = '#1d4ed8'; e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(37, 99, 235, 0.4)'; }}}
                  onMouseLeave={(e) => { if (newMessage.trim() && isConnected && !isSending) { e.currentTarget.style.backgroundColor = '#2563eb'; e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(37, 99, 235, 0.3)'; }}} >
                  {isSending ? (<div style={{width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTop: '3px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite'}}/>) : '🚀'}
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
