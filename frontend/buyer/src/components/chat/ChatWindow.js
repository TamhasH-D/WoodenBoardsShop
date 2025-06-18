import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext'; // Corrected path
import { apiService } from '../../services/api';
import websocketManager from '../../utils/websocketManager';
// Removed: import { getCurrentBuyerId } from '../../utils/auth';


const ChatWindow = () => {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const { showError, showInfo } = useNotifications();
  const {
    buyerProfile,
    isAuthenticated, // Comprehensive flag
    profileLoading,
    profileError,
    login, // For login prompt
    keycloakAuthenticated // For more granular checks if needed
  } = useAuth();

  const buyerId = buyerProfile?.id; // Derived buyerId

  const [threadInfo, setThreadInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [componentIsLoading, setComponentIsLoading] = useState(true); // Renamed from isLoading
  const [isSending, setIsSending] = useState(false); // Renamed from sending

  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messagesRef = useRef(new Map()); // For deduplication

  // Removed useEffect for local buyerId initialization

  const handleWebSocketMessage = useCallback((data) => {
    console.log('[ChatWindow] WebSocket message received:', data);
    if (!buyerId) return; // Don't process if buyerId isn't set

    if (data.type === 'message') {
      if (data.sender_id === buyerId) {
        console.log('[ChatWindow] Ignoring own message from WebSocket');
        return;
      }
      const messageId = data.message_id || `ws-${Date.now()}`;
      if (messagesRef.current.has(messageId)) return;

      const newMsg = {
        id: messageId, message: data.message, sender_id: data.sender_id,
        sender_type: data.sender_type, created_at: data.timestamp || new Date().toISOString(),
        thread_id: data.thread_id, buyer_id: data.sender_type === 'buyer' ? data.sender_id : null,
        seller_id: data.sender_type === 'seller' ? data.sender_id : null,
        is_read_by_buyer: data.sender_type === 'buyer', is_read_by_seller: data.sender_type === 'seller'
      };
      messagesRef.current.set(messageId, newMsg);
      setMessages(prev => {
        if (prev.some(m => m.id === messageId)) return prev;
        return [...prev, newMsg];
      });
    } else if (data.type === 'typing' && data.sender_id !== buyerId) {
      setOtherUserTyping(true); setTimeout(() => setOtherUserTyping(false), 3000);
    } else if (data.type === 'stop_typing' && data.sender_id !== buyerId) {
      setOtherUserTyping(false);
    } else if (data.type === 'user_joined' && data.sender_id !== buyerId) {
      showInfo('Продавец подключился к чату');
    } else if (data.type === 'user_left' && data.sender_id !== buyerId) {
      showInfo('Продавец покинул чат');
    }
  }, [buyerId, showInfo]);

  const loadChatData = useCallback(async (isInitialLoad = true) => {
    if (!threadId || !buyerId || !isAuthenticated) {
      if (isInitialLoad) setComponentIsLoading(false);
      return;
    }

    if (isInitialLoad) setComponentIsLoading(true);
    try {
      // TODO: Fetch thread info using an endpoint that doesn't require buyerId in path if possible,
      // or ensure backend verifies thread ownership against authenticated user.
      const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const threadResponse = await fetch(`${apiBaseUrl}/api/v1/chat-threads/${threadId}`); // Consider using apiService if token needed
      if (threadResponse.ok) {
        const threadData = await threadResponse.json();
        setThreadInfo(threadData.data); // Assuming threadData.data is the thread object
      } else {
        throw new Error(`Failed to fetch thread info: ${threadResponse.status}`);
      }

      const messagesResult = await apiService.getChatMessages(threadId, 0, 20);
      const loadedMessages = messagesResult.data || [];
      messagesRef.current.clear();
      loadedMessages.forEach(msg => messagesRef.current.set(msg.id, msg));
      setMessages(loadedMessages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))); // Ensure sorted
      setHasMoreMessages(loadedMessages.length === 20);
      setCurrentPage(0);

      websocketManager.addMessageHandler(threadId, handleWebSocketMessage);
      websocketManager.connect(threadId, buyerId, 'buyer', setIsConnected);
    } catch (error) {
      console.error('[ChatWindow] Error loading chat data:', error);
      showError('Не удалось загрузить данные чата.');
    } finally {
      if (isInitialLoad) setComponentIsLoading(false);
    }
  }, [threadId, buyerId, showError, handleWebSocketMessage, isAuthenticated]);

  const loadMoreMessages = useCallback(async () => {
    if (!threadId || loadingMore || !hasMoreMessages || !isAuthenticated) return;
    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const messagesResult = await apiService.getChatMessages(threadId, nextPage, 20); // Assuming page is 0-indexed
      const newMessages = (messagesResult.data || []).sort((a,b) => new Date(a.created_at) - new Date(b.created_at));

      if (newMessages.length > 0) {
        const uniqueNewMessages = newMessages.filter(msg => !messagesRef.current.has(msg.id));
        uniqueNewMessages.forEach(msg => messagesRef.current.set(msg.id, msg));
        setMessages(prev => [...uniqueNewMessages, ...prev]); // Prepend older messages
        setCurrentPage(nextPage);
        setHasMoreMessages(newMessages.length === 20);
      } else {
        setHasMoreMessages(false);
      }
    } catch (error) {
      console.error('[ChatWindow] Error loading more messages:', error);
      showError('Не удалось загрузить больше сообщений.');
    } finally {
      setLoadingMore(false);
    }
  }, [threadId, loadingMore, hasMoreMessages, currentPage, showError, isAuthenticated]);

  const handleSendMessage = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || isSending || !buyerId || !threadId || !isAuthenticated) return;

    const messageText = newMessage.trim();
    setIsSending(true);
    setNewMessage('');
    const messageId = crypto.randomUUID ? crypto.randomUUID() : `msg-${Date.now()}`;
    const tempMessage = {
      id: messageId, message: messageText, buyer_id: buyerId, seller_id: null,
      thread_id: threadId, created_at: new Date().toISOString(), is_read_by_buyer: true,
      is_read_by_seller: false, sending: true
    };
    messagesRef.current.set(messageId, tempMessage);
    setMessages(prev => [...prev, tempMessage]);

    try {
      const messageData = {
        id: messageId, message: messageText, is_read_by_buyer: true, is_read_by_seller: false,
        thread_id: threadId, buyer_id: buyerId, // TODO: Backend should infer buyer_id from token
      };
      const result = await apiService.sendMessage(messageData);
      if (result && result.data) { // Check result.data for actual message from backend
        setMessages(prev => prev.map(msg =>
          msg.id === messageId ? { ...result.data, sending: false } : msg // Replace temp msg with server one
        ));
        if (result.data.id !== messageId) { // If server ID is different
            messagesRef.current.delete(messageId);
            messagesRef.current.set(result.data.id, result.data);
        } else {
            messagesRef.current.set(messageId, {...result.data, sending: false});
        }
      } else { throw new Error('API call did not return expected data.'); }
    } catch (error) {
      console.error('[ChatWindow] Error sending message:', error);
      showError('Не удалось отправить сообщение.');
      setMessages(prev => prev.filter(msg => msg.id !== messageId)); // Remove temp message on error
      messagesRef.current.delete(messageId);
      setNewMessage(messageText);
    } finally {
      setIsSending(false);
    }
  }, [newMessage, isSending, buyerId, threadId, showError, isAuthenticated]);

  const handleTyping = useCallback(() => {
    if (!threadId || !buyerId || !isConnected || !isAuthenticated) return;
    if (!isTyping) {
      setIsTyping(true);
      websocketManager.sendMessage(threadId, { type: 'typing', sender_id: buyerId, thread_id: threadId });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) { // Check isTyping again in case it was reset by fast typing
        setIsTyping(false);
        websocketManager.sendMessage(threadId, { type: 'stop_typing', sender_id: buyerId, thread_id: threadId });
      }
    }, 2000);
  }, [threadId, buyerId, isConnected, isTyping, isAuthenticated]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Load chat data only if user is fully authenticated, buyerId is available, and threadId is present.
    if (isAuthenticated && buyerId && threadId && !profileLoading) {
      loadChatData();
    } else if (!profileLoading && (!isAuthenticated || !buyerId)) {
      // If profile isn't loading, but user is not authenticated or no buyerId, stop loading.
      setComponentIsLoading(false);
    }
    // If profileLoading is true, we wait. componentIsLoading remains true.
  }, [isAuthenticated, buyerId, threadId, loadChatData, profileLoading]);

  useEffect(() => {
    return () => { // Cleanup on unmount
      if (threadId) {
        console.log('[ChatWindow] Cleaning up WebSocket for thread:', threadId);
        websocketManager.removeMessageHandler(threadId, handleWebSocketMessage);
        websocketManager.disconnect(threadId);
      }
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [threadId, handleWebSocketMessage]); // Re-added handleWebSocketMessage for safety, though it's memoized

  // ---- UI Rendering based on Auth State ----
  if (profileLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', fontSize: '18px', color: '#6b7280' }}>Загрузка профиля пользователя...</div>;
  }
  if (profileError) {
    return <div style={{ textAlign: 'center', padding: '40px' }}><h3 style={{color: '#dc2626'}}>Ошибка загрузки профиля</h3><p>{profileError.message || "Не удалось загрузить ваш профиль."}</p><button onClick={login} className="btn btn-primary">Попробовать войти снова</button></div>;
  }
  if (!isAuthenticated || !buyerId) { // Not fully authenticated or buyerId missing
    return <div style={{ textAlign: 'center', padding: '40px' }}><h3>Доступ запрещен</h3><p>Пожалуйста, войдите в систему и убедитесь, что ваш профиль загружен, чтобы просмотреть этот чат.</p><button onClick={login} className="btn btn-primary">Войти</button></div>;
  }
  if (componentIsLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', fontSize: '18px', color: '#6b7280' }}>Загрузка чата...</div>;
  }
  if (!threadInfo) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', fontSize: '18px', color: '#ef4444' }}>Чат не найден или доступ запрещен.</div>;
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
              <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>ID: {threadInfo.seller_id?.substring(0, 8)}...</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '20px', backgroundColor: isConnected ? '#dcfce7' : '#fef3c7', border: `1px solid ${isConnected ? '#bbf7d0' : '#fcd34d'}` }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isConnected ? '#10b981' : '#f59e0b', animation: isConnected ? 'pulse 2s infinite' : 'none' }} />
              <span style={{ fontSize: '14px', fontWeight: '600', color: isConnected ? '#065f46' : '#92400e' }}>{isConnected ? 'Подключен' : 'Подключение...'}</span>
            </div>
            {otherUserTyping && (
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
            {hasMoreMessages && messages.length > 0 && (
              <div style={{ textAlign: 'center', marginBottom: '24px', position: 'sticky', top: '0', zIndex: 5, paddingTop: '16px' }}>
                <button onClick={loadMoreMessages} disabled={loadingMore} style={{ padding: '12px 24px', backgroundColor: loadingMore ? '#f3f4f6' : 'white', color: loadingMore ? '#9ca3af' : '#2563eb', border: '2px solid #e5e7eb', borderRadius: '24px', fontSize: '14px', fontWeight: '600', cursor: loadingMore ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}
                  onMouseEnter={(e) => { if (!loadingMore) { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)'; }}}
                  onMouseLeave={(e) => { if (!loadingMore) { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}} >
                  {loadingMore ? (<><div style={{ width: '16px', height: '16px', border: '2px solid #e5e7eb', borderTop: '2px solid #9ca3af', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />Загрузка...</>) : (<>⬆️ Загрузить еще</>)}
                </button>
              </div>
            )}
            {messages.length === 0 && !componentIsLoading && (<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}><div style={{ fontSize: '64px', marginBottom: '24px', opacity: 0.6, animation: 'float 3s ease-in-out infinite' }}>💬</div><h3 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>Начните разговор</h3><p style={{ margin: 0, fontSize: '16px', color: '#6b7280', maxWidth: '400px', lineHeight: '1.6' }}>Отправьте первое сообщение продавцу.</p></div>)}
            {messages.map((message, index) => {
              const isOwnMessage = message.buyer_id === buyerId;
              const prevMessage = messages[index - 1];
              const showAvatar = !isOwnMessage && (!prevMessage || prevMessage.sender_id !== message.sender_id || prevMessage.sender_type !== message.sender_type);
              const isLastInGroup = !messages[index+1] || messages[index+1].sender_id !== message.sender_id || messages[index+1].sender_type !== message.sender_type;
              return (
                <div key={message.id} style={{ display: 'flex', justifyContent: isOwnMessage ? 'flex-end' : 'flex-start', marginBottom: isLastInGroup ? '24px' : '4px', alignItems: 'flex-end', gap: '12px' }}>
                  {!isOwnMessage && (<div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0, visibility: showAvatar ? 'visible' : 'hidden' }}>🏪</div>)}
                  <div style={{ maxWidth: '70%', display: 'flex', flexDirection: 'column', alignItems: isOwnMessage ? 'flex-end' : 'flex-start' }}>
                    <div style={{ padding: '16px 20px', borderRadius: isOwnMessage ? '20px 20px 4px 20px' : '20px 20px 20px 4px', backgroundColor: isOwnMessage ? '#2563eb' : 'white', color: isOwnMessage ? 'white' : '#374151', fontSize: '16px', lineHeight: '1.5', boxShadow: isOwnMessage ? '0 4px 16px rgba(37, 99, 235, 0.3)' : '0 4px 16px rgba(0, 0, 0, 0.1)', border: isOwnMessage ? 'none' : '1px solid #e5e7eb', position: 'relative', wordBreak: 'break-word' }}>
                      <div style={{ marginBottom: '8px' }}>{message.message}</div>
                      <div style={{ fontSize: '12px', opacity: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <span>{new Date(message.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
                        {isOwnMessage && (<div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>{message.sending ? (<div style={{width: '12px', height: '12px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite'}} />) : message.failed ? (<span style={{fontSize: '10px', opacity:0.8, color: '#ef4444'}}>❌</span>) : (<span style={{fontSize: '10px', opacity:0.8, color: message.is_read_by_seller ? '#10b981' : '#6b7280'}}>{message.is_read_by_seller ? '✓✓' : '✓'}</span>)}<span style={{fontSize: '8px', opacity: 0.6, color: message.failed ? '#ef4444' : 'inherit'}}>{message.sending ? 'отправка...' : message.failed ? 'ошибка' : message.is_read_by_seller ? 'прочитано' : 'доставлено'}</span></div>)}
                      </div>
                    </div>
                  </div>
                  {isOwnMessage && (<div style={{ width: '32px', flexShrink: 0 }} />)}
                </div>);
            })}
            {otherUserTyping && (<div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px' }}><div style={{ padding: '12px 16px', borderRadius: '18px', backgroundColor: '#f3f4f6', color: '#6b7280', fontSize: '14px', fontStyle: 'italic' }}>Продавец печатает...</div></div>)}
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
