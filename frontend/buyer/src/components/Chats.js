import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
import { apiService } from '../services/api';
import { BUYER_TEXTS } from '../utils/localization';
// Removed: import { getCurrentBuyerId } from '../utils/auth';
import { getChatWebSocketUrl } from '../utils/websocket';

const API_CALL_TIMEOUT = 15000; // 15 seconds

function Chats() {
  const navigate = useNavigate();
  const { showError } = useNotifications();
  const {
    buyerProfile,
    isAuthenticated, // This is the comprehensive flag: Keycloak auth + profile loaded
    profileLoading,
    profileError,
    login, // For login prompt
    keycloakAuthenticated // To distinguish Keycloak's own auth state if needed
  } = useAuth();

  const [threads, setThreads] = useState([]);
  const [componentLoading, setComponentLoading] = useState(true); // Renamed from 'loading'
  const [componentError, setComponentError] = useState(null); // Renamed from 'error'

  // Derive buyerId from context
  const buyerId = buyerProfile?.id;

  // eslint-disable-next-line no-unused-vars
  const [selectedThread, setSelectedThread] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const wsRef = useRef(null);
  const isConnectingRef = useRef(false);
  const reconnectTimeoutRef = useRef(null);

  // Removed useEffect for initializing buyerId locally

  const loadChats = useCallback(async () => {
    if (!buyerId || !isAuthenticated) { // Ensure user is fully authenticated and buyerId is available
      setComponentLoading(false); // Not loading chats if user isn't ready
      setThreads([]); // Clear threads if no buyerId
      return;
    }

    console.log('[Chats] Loading chats for buyer ID:', buyerId);
    setComponentLoading(true);
    setComponentError(null);
    let loadedThreads = []; // Initialize loadedThreads
    try {
      // TODO: Ideally, apiService.getBuyerChats would not require buyerId if it can be inferred from token.
      let getChatsPromise = apiService.getBuyerChats(buyerId, 0, 100);
      let timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('API call timed out')), API_CALL_TIMEOUT)
      );

      const result = await Promise.race([getChatsPromise, timeoutPromise]);
      loadedThreads = result.data || []; // Store result in loadedThreads
      setThreads(loadedThreads);
      setComponentError(null); // Clear error on success
    } catch (err) {
      if (err.message === 'API call timed out') {
        console.error('[Chats] getBuyerChats timed out:', err);
        setComponentError('Не удалось загрузить список чатов: превышено время ожидания.');
        showError('Не удалось загрузить список чатов: превышено время ожидания.');
      } else {
        console.error('[Chats] Error loading chats:', err);
        setComponentError(err.message || 'Не удалось загрузить список чатов.');
        showError(err.message || 'Не удалось загрузить список чатов.');
      }
      loadedThreads = []; // Ensure loadedThreads is empty for the finally block logic
      setThreads([]); // Also set threads to empty directly
    } finally {
      setComponentLoading(false);
      if (loadedThreads.length === 0) {
        if (wsRef.current) {
          console.log("[Chats] No threads, ensuring WebSocket is closed.");
          wsRef.current.onclose = null;
          wsRef.current.close();
          wsRef.current = null;
        }
        setIsConnected(false);
      }
    }
  }, [buyerId, showError, isAuthenticated]);

  const connectWebSocket = useCallback((threadId) => {
    if (!threadId || !buyerId || isConnectingRef.current || !isAuthenticated) {
      console.log('[Chats] WebSocket connection prerequisites not met or already connecting.');
      return;
    }

    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
      console.log('[Chats] Closing existing WebSocket connection before opening new one.');
      wsRef.current.close();
    }
    wsRef.current = null; // Ensure old instance is cleared

    isConnectingRef.current = true;
    const wsUrl = getChatWebSocketUrl(threadId, buyerId, 'buyer');
    console.log('[Chats] Connecting to WebSocket:', wsUrl);
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('[Chats] WebSocket connected for thread:', threadId);
      setIsConnected(true);
      isConnectingRef.current = false;
    };

    wsRef.current.onmessage = (event) => {
      console.log('[Chats] WebSocket message received:', event.data);
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'message') {
          // Check sender_id against the current buyerId from context
          if (data.sender_id !== buyerId) {
            console.log('[Chats] Incoming message from another user, reloading chat list for updates.');
            loadChats(); // Reload to update unread counts or last message
          }
        }
      } catch (error) {
        console.error('[Chats] Error parsing WebSocket message:', error);
      }
    };

    wsRef.current.onclose = (event) => {
      console.log('[Chats] WebSocket closed for thread:', threadId, 'Event:', event);
      isConnectingRef.current = false;
      setIsConnected(false);
      if (event.wasClean === false && buyerId && threadId && isAuthenticated) { // Only attempt reconnect if not a clean close and user still valid
        console.log('[Chats] WebSocket closed unexpectedly. Attempting to reconnect in 3s...');
        clearTimeout(reconnectTimeoutRef.current); // Clear any existing timeout
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket(threadId);
        }, 3000);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('[Chats] WebSocket error for thread:', threadId, error);
      isConnectingRef.current = false;
      setIsConnected(false);
      // Don't auto-reconnect on error immediately, onclose will handle retries if appropriate
    };
  }, [buyerId, loadChats, isAuthenticated]);

  const handleThreadSelect = async (thread) => {
    if (!buyerId || !isAuthenticated) {
      showError("Пожалуйста, войдите в систему для просмотра чатов.");
      return;
    }
    setSelectedThread(thread);
    // connectWebSocket(thread.id); // WebSocket connection might be better handled by ChatWindow itself

    try {
      // TODO: Ideally, apiService.markMessagesAsRead would not require buyerId if inferred from token.
      await apiService.markMessagesAsRead(thread.id, buyerId, 'buyer');
      console.log('[Chats] Messages marked as read for buyer in thread:', thread.id);
      loadChats(); // Refresh chat list to update unread counts
    } catch (error) {
      console.error('[Chats] Failed to mark messages as read:', error);
      showError('Не удалось обновить статус сообщений.');
    }
    navigate(`/chats/${thread.id}`);
  };

  useEffect(() => {
    // Load chats only if user is fully authenticated and buyerId is available
    if (isAuthenticated && buyerId && !profileLoading) {
      loadChats();
    } else if (!isAuthenticated && !profileLoading) {
      // If not authenticated and not loading profile, clear chats and stop component loading
      setThreads([]);
      setComponentLoading(false);
    }
    // If profile is loading, componentLoading will be true via initial state or other checks
  }, [isAuthenticated, buyerId, loadChats, profileLoading]);

  useEffect(() => {
    return () => { // Cleanup on unmount
      if (wsRef.current) {
        console.log('[Chats] Closing WebSocket connection on component unmount.');
        wsRef.current.onclose = null; // Prevent reconnect attempts
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      isConnectingRef.current = false;
    };
  }, []);

  // ---- UI Rendering based on Auth State ----
  if (profileLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 200px)' }}>
        <div style={{ width: '48px', height: '48px', border: '4px solid #e5e7eb', borderTop: '4px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '24px' }} />
        <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#374151' }}>Загрузка профиля пользователя...</h3>
      </div>
    );
  }

  if (profileError) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h3 style={{color: '#dc2626'}}>Ошибка загрузки профиля</h3>
        <p>{profileError.message || "Не удалось загрузить ваш профиль. Список чатов недоступен."}</p>
        <button onClick={login} className="btn btn-primary">Попробовать войти снова</button>
      </div>
    );
  }

  if (!isAuthenticated) { // This implies Keycloak not authed OR profile not loaded (but not in error/loading state)
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h3>Доступ запрещен</h3>
        <p>Пожалуйста, войдите в систему, чтобы просмотреть свои чаты.</p>
        <button onClick={login} className="btn btn-primary">Войти</button>
      </div>
    );
  }

  // Main component render after all checks pass
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '24px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, color: '#111827', fontSize: '32px', fontWeight: '800', letterSpacing: '-0.025em' }}>
              💬 {BUYER_TEXTS.CHATS || 'Сообщения'}
            </h1>
            <p style={{ margin: '8px 0 0 0', color: '#6b7280', fontSize: '16px', fontWeight: '500' }}>
              Общение с продавцами о товарах ({buyerProfile?.name || buyerProfile?.username || 'Покупатель'})
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Connection Status - Note: This is a local WebSocket status, not global connection */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '20px', backgroundColor: isConnected ? '#dcfce7' : '#fef3c7', border: `1px solid ${isConnected ? '#bbf7d0' : '#fcd34d'}` }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isConnected ? '#10b981' : '#f59e0b', animation: isConnected ? 'pulse 2s infinite' : 'none' }} />
              <span style={{ fontSize: '14px', fontWeight: '600', color: isConnected ? '#065f46' : '#92400e' }}>
                {isConnected ? 'Онлайн (Чат)' : 'Подключение...'}
              </span>
            </div>
            <button onClick={loadChats} disabled={componentLoading || profileLoading} style={{ padding: '12px 20px', backgroundColor: (componentLoading || profileLoading) ? '#9ca3af' : '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: (componentLoading || profileLoading) ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}
              onMouseEnter={(e) => { if (!(componentLoading || profileLoading)) { e.target.style.backgroundColor = '#1d4ed8'; e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 20px rgba(37, 99, 235, 0.4)'; }}}
              onMouseLeave={(e) => { if (!(componentLoading || profileLoading)) { e.target.style.backgroundColor = '#2563eb'; e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)'; }}}
            >
              {componentLoading ? (<><div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />Обновление...</>) : (<>🔄 Обновить</>)}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {componentError && (
          <div style={{ padding: '20px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>⚠️</div>
            <div><h3 style={{ margin: 0, color: '#dc2626', fontSize: '18px', fontWeight: '700' }}>Ошибка загрузки списка чатов</h3><p style={{ margin: '4px 0 0 0', color: '#7f1d1d', fontSize: '14px' }}>{componentError}</p></div>
          </div>
        )}

        {componentLoading && !componentError && ( // Show loading only if no error
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '400px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
            <div style={{ width: '48px', height: '48px', border: '4px solid #e5e7eb', borderTop: '4px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '24px' }} />
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Загрузка чатов...</h3>
            <p style={{ margin: 0, fontSize: '16px', color: '#6b7280' }}>Получаем актуальную информацию</p>
          </div>
        )}

        {!componentLoading && !componentError && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', padding: '20px 24px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>📊</div>
                <div><h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827' }}>Статистика чатов</h3><p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>Всего активных диалогов: <strong>{threads.length}</strong></p></div>
              </div>
              <div style={{ padding: '8px 16px', backgroundColor: '#f3f4f6', borderRadius: '20px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>{threads.filter(t => t.unread_count > 0).length} непрочитанных</div>
            </div>

            {threads.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {threads.map((thread) => (
                  <div key={thread.id} onClick={() => handleThreadSelect(thread)} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', cursor: 'pointer', transition: 'all 0.3s ease', border: thread.unread_count > 0 ? '2px solid #2563eb' : '1px solid #e5e7eb', position: 'relative', overflow: 'hidden' }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.15)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; }}
                  >
                    {thread.unread_count > 0 && (<div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: '#2563eb', borderRadius: '0 4px 4px 0' }} />)}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)', flexShrink: 0 }}>🏪</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}><h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#111827', letterSpacing: '-0.025em' }}>Продавец</h3><div style={{ padding: '4px 8px', backgroundColor: '#f3f4f6', borderRadius: '6px', fontSize: '12px', fontWeight: '600', color: '#6b7280', fontFamily: 'monospace' }}>ID: {thread.seller_id?.substring(0, 8)}</div></div>
                        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Диалог создан {new Date(thread.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>
                      {thread.unread_count > 0 && (<div style={{ backgroundColor: '#ef4444', color: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', minWidth: '24px', textAlign: 'center', boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)' }}>{thread.unread_count}</div>)}
                    </div>
                    <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
                      {thread.last_message ? (<div><div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Последнее сообщение</div><p style={{ margin: 0, fontSize: '14px', color: '#374151', lineHeight: '1.5', fontWeight: '500' }}>"{thread.last_message.length > 80 ? thread.last_message.substring(0, 80) + '...' : thread.last_message}"</p></div>) : (<div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '14px', fontStyle: 'italic' }}>Сообщений пока нет</div>)}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#9ca3af', fontWeight: '500' }}><span>🕒</span><span>{new Date(thread.updated_at || thread.created_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span></div>
                      <div style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: 'white', borderRadius: '8px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Открыть чат</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '80px 40px', backgroundColor: 'white', borderRadius: '24px', border: '2px dashed #d1d5db', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle, rgba(37, 99, 235, 0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: '80px', marginBottom: '32px', opacity: 0.8, animation: 'float 3s ease-in-out infinite' }}>💬</div>
                  <h3 style={{ margin: 0, marginBottom: '16px', color: '#111827', fontSize: '28px', fontWeight: '800', letterSpacing: '-0.025em' }}>Начните общение</h3>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '18px', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto', lineHeight: '1.7', marginBottom: '40px', fontWeight: '500' }}>У вас пока нет активных диалогов с продавцами. Найдите интересующий товар и свяжитесь с продавцом для обсуждения деталей.</p>
                  <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button onClick={() => navigate('/products')} style={{ padding: '16px 32px', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: 'white', border: 'none', borderRadius: '16px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 8px 24px rgba(37, 99, 235, 0.3)', display: 'flex', alignItems: 'center', gap: '12px' }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 32px rgba(37, 99, 235, 0.4)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(37, 99, 235, 0.3)'; }}
                    >🛍️ Посмотреть товары</button>
                    <button onClick={() => navigate('/sellers')} style={{ padding: '16px 32px', backgroundColor: 'transparent', color: '#2563eb', border: '2px solid #2563eb', borderRadius: '16px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', gap: '12px' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2563eb'; e.currentTarget.style.color = 'white'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#2563eb'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >🏪 Найти продавцов</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <style jsx>{` @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } } @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } } @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } } `}</style>
    </div>
  );
}

export default Chats;
