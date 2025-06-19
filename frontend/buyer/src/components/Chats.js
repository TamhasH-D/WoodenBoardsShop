import React, { useState, useEffect, useCallback } from 'react'; // Removed useRef
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
import { apiService } from '../services/api'; // Will be mostly unused directly
import { BUYER_TEXTS } from '../utils/localization';
// Removed: import { getCurrentBuyerId } from '../utils/auth';
// Removed: import { getChatWebSocketUrl } from '../utils/websocket';
import { useChat } from '../hooks/useChat'; // Import the new hook

function Chats() {
  const navigate = useNavigate();
  const { showError } = useNotifications();
  const {
    buyerProfile,
    isAuthenticated,
    profileLoading,
    profileError,
    login,
  } = useAuth();

  const {
    threads,
    loadingThreads,
    error: chatError, // Renamed to avoid conflict with profileError
    selectThread,
    loadThreads, // Use this to refresh
    buyerId: chatHookBuyerId // Exposed by useChat, can be used for confirmation or debugging
  } = useChat();

  // Buyer ID from auth context, primarily used by useChat hook internally
  const authBuyerId = buyerProfile?.id;

  // Effect to explicitly load threads if authBuyerId changes and is available,
  // though useChat hook already does this internally.
  // This can be a safety net or for explicit refresh triggers.
  useEffect(() => {
    if (isAuthenticated && authBuyerId && !profileLoading) {
      // loadThreads(); // useChat already loads when its internal buyerId is set.
                      // Call this if an explicit refresh button is desired.
    }
  }, [isAuthenticated, authBuyerId, profileLoading, loadThreads]);


  const handleRefreshThreads = useCallback(() => {
    if (isAuthenticated && authBuyerId) {
      loadThreads();
    } else {
      showError("Необходимо войти в систему для обновления чатов.");
    }
  }, [isAuthenticated, authBuyerId, loadThreads, showError]);

  const handleThreadSelect = async (thread) => {
    if (!authBuyerId || !isAuthenticated) {
      showError("Пожалуйста, войдите в систему для просмотра чатов.");
      return;
    }
    // The useChat hook's selectThread now handles:
    // - Setting selectedThreadId
    // - Loading messages for the thread
    // - Marking messages as read
    // - Managing WebSocket connection for the selected thread
    await selectThread(thread.id);
    // The hook also updates the 'threads' list (e.g., unread count) internally after marking as read.

    navigate(`/chats/${thread.id}`);
  };

  // Note: The old useEffect for WebSocket cleanup is removed as useChat handles its own WebSocket lifecycle.

  // ---- UI Rendering based on Auth State ----
  // Profile loading and error states take precedence
  if (profileLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 200px)' }}>
        <div style={{ width: '48px', height: '48px', border: '4px solid #e5e7eb', borderTop: '4px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '24px' }} />
        <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#374151' }}>Загрузка профиля пользователя...</h3>
      </div>
    );
  }

  if (profileError) { // Display profile error
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h3 style={{color: '#dc2626'}}>Ошибка загрузки профиля</h3>
        <p>{profileError.message || "Не удалось загрузить ваш профиль. Список чатов недоступен."}</p>
        <button onClick={login} className="btn btn-primary">Попробовать войти снова</button>
      </div>
    );
  }

  if (!isAuthenticated) { // If not authenticated (after profile checks)
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h3>Доступ запрещен</h3>
        <p>Пожалуйста, войдите в систему, чтобы просмотреть свои чаты.</p>
        <button onClick={login} className="btn btn-primary">Войти</button>
      </div>
    );
  }

  // Main component render after all auth and profile checks pass
  // Now use loadingThreads and chatError from useChat hook
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
            {/* Removed old WebSocket connection status indicator */}
            <button onClick={handleRefreshThreads} disabled={loadingThreads || profileLoading} style={{ padding: '12px 20px', backgroundColor: (loadingThreads || profileLoading) ? '#9ca3af' : '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: (loadingThreads || profileLoading) ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}
              onMouseEnter={(e) => { if (!(loadingThreads || profileLoading)) { e.target.style.backgroundColor = '#1d4ed8'; e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 20px rgba(37, 99, 235, 0.4)'; }}}
              onMouseLeave={(e) => { if (!(loadingThreads || profileLoading)) { e.target.style.backgroundColor = '#2563eb'; e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)'; }}}
            >
              {loadingThreads ? (<><div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />Обновление...</>) : (<>🔄 Обновить</>)}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {chatError && ( // Display error from useChat hook
          <div style={{ padding: '20px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>⚠️</div>
            <div><h3 style={{ margin: 0, color: '#dc2626', fontSize: '18px', fontWeight: '700' }}>Ошибка загрузки списка чатов</h3><p style={{ margin: '4px 0 0 0', color: '#7f1d1d', fontSize: '14px' }}>{chatError}</p></div>
          </div>
        )}

        {loadingThreads && !chatError && ( // Show loading only if no error, using loadingThreads from useChat
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '400px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
            <div style={{ width: '48px', height: '48px', border: '4px solid #e5e7eb', borderTop: '4px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '24px' }} />
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Загрузка чатов...</h3>
            <p style={{ margin: 0, fontSize: '16px', color: '#6b7280' }}>Получаем актуальную информацию</p>
          </div>
        )}

        {!loadingThreads && !chatError && ( // Use loadingThreads and chatError from useChat
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', padding: '20px 24px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>📊</div>
                <div><h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827' }}>Статистика чатов</h3><p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>Всего активных диалогов: <strong>{threads.length}</strong></p></div>
              </div>
              {/* Assuming unread_count is part of the thread object from useChat's threads */}
              <div style={{ padding: '8px 16px', backgroundColor: '#f3f4f6', borderRadius: '20px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>{threads.filter(t => t.unread_messages_count > 0).length} непрочитанных</div>
            </div>

            {threads.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {threads.map((thread) => (
                  <div key={thread.id} onClick={() => handleThreadSelect(thread)} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', cursor: 'pointer', transition: 'all 0.3s ease', border: thread.unread_messages_count > 0 ? '2px solid #2563eb' : '1px solid #e5e7eb', position: 'relative', overflow: 'hidden' }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.15)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; }}
                  >
                    {thread.unread_messages_count > 0 && (<div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: '#2563eb', borderRadius: '0 4px 4px 0' }} />)}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)', flexShrink: 0 }}>🏪</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}><h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#111827', letterSpacing: '-0.025em' }}>Продавец</h3><div style={{ padding: '4px 8px', backgroundColor: '#f3f4f6', borderRadius: '6px', fontSize: '12px', fontWeight: '600', color: '#6b7280', fontFamily: 'monospace' }}>ID: {thread.seller_id?.substring(0, 8)}</div></div>
                        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Диалог создан {new Date(thread.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>
                      {thread.unread_messages_count > 0 && (<div style={{ backgroundColor: '#ef4444', color: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', minWidth: '24px', textAlign: 'center', boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)' }}>{thread.unread_messages_count}</div>)}
                    </div>
                    <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
                      {thread.last_message ? (<div><div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Последнее сообщение</div><p style={{ margin: 0, fontSize: '14px', color: '#374151', lineHeight: '1.5', fontWeight: '500' }}>"{typeof thread.last_message === 'string' && thread.last_message.length > 80 ? thread.last_message.substring(0, 80) + '...' : thread.last_message}"</p></div>) : (<div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '14px', fontStyle: 'italic' }}>Сообщений пока нет</div>)}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#9ca3af', fontWeight: '500' }}><span>🕒</span><span>{new Date(thread.last_message_at || thread.updated_at || thread.created_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span></div>
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
