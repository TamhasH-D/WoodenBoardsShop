import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import { apiService } from '../services/api';
import { BUYER_TEXTS } from '../utils/localization';
import { getCurrentBuyerId } from '../utils/auth';
import { getChatWebSocketUrl } from '../utils/websocket';

// Профессиональные иконки
const Icons = {
  Search: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/>
      <path d="21 21l-4.35-4.35"/>
    </svg>
  ),
  Message: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  Send: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22,2 15,22 11,13 2,9 22,2"/>
    </svg>
  ),
  Online: () => (
    <div style={{
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: '#10b981',
      border: '2px solid white'
    }} />
  ),
  Offline: () => (
    <div style={{
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: '#6b7280',
      border: '2px solid white'
    }} />
  )
};

function Chats() {
  const navigate = useNavigate();
  const { showError } = useNotifications();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buyerId, setBuyerId] = useState(null);
  const [selectedThread, setSelectedThread] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'unread'

  // WebSocket refs
  const wsRef = useRef(null);
  const isConnectingRef = useRef(false);
  const reconnectTimeoutRef = useRef(null);

  // Получаем buyer_id при загрузке компонента
  useEffect(() => {
    const initializeBuyer = async () => {
      try {
        const realBuyerId = await getCurrentBuyerId();
        setBuyerId(realBuyerId);
        console.log('[Chats] Real buyer_id obtained:', realBuyerId);
      } catch (error) {
        console.error('[Chats] Failed to get buyer_id:', error);
        showError('Не удалось получить данные пользователя');
      }
    };

    initializeBuyer();
  }, [showError]);

  // Мемоизируем функцию загрузки чатов
  const loadChats = useCallback(async () => {
    if (!buyerId) return;

    try {
      setLoading(true);
      setError(null);

      const result = await apiService.getBuyerChats(buyerId);
      setThreads(result.data || []);

    } catch (err) {
      console.error('Ошибка загрузки чатов:', err);
      setError(err.message);
      showError('Не удалось загрузить чаты');
    } finally {
      setLoading(false);
    }
  }, [buyerId, showError]);

  // WebSocket connection
  const connectWebSocket = useCallback((threadId) => {
    if (!threadId || !buyerId || isConnectingRef.current) return;

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    isConnectingRef.current = true;
    const wsUrl = getChatWebSocketUrl(threadId, buyerId, 'buyer');
    console.log('[Chats] Connecting to WebSocket:', wsUrl);
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('[Chats] WebSocket connected');
      setIsConnected(true);
      isConnectingRef.current = false;
    };

    wsRef.current.onmessage = (event) => {
      console.log('[Chats] WebSocket message received:', event.data);
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'message') {
          // Обновляем список чатов только если это сообщение от другого пользователя
          if (data.sender_id !== buyerId) {
            console.log('[Chats] Updating chat list for incoming message');
            loadChats();
          }
        }
      } catch (error) {
        console.error('[Chats] Error parsing WebSocket message:', error);
      }
    };

    wsRef.current.onclose = () => {
      console.log('[Chats] WebSocket closed');
      isConnectingRef.current = false;
      setIsConnected(false);

      // Переподключение через 3 секунды
      if (threadId && buyerId) {
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('[Chats] Attempting to reconnect WebSocket');
          connectWebSocket(threadId);
        }, 3000);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('[Chats] WebSocket error:', error);
      isConnectingRef.current = false;
      setIsConnected(false);
    };
  }, [buyerId, loadChats]);

  const handleThreadSelect = async (thread) => {
    setSelectedThread(thread);

    // Подключаем WebSocket для выбранного треда
    connectWebSocket(thread.id);

    // Отмечаем сообщения как прочитанные покупателем
    try {
      await apiService.markMessagesAsRead(thread.id, buyerId, 'buyer');
      console.log('Messages marked as read for buyer');
      // Обновляем список чатов, чтобы убрать счетчик непрочитанных
      loadChats();
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }

    // Переходим к чату
    navigate(`/chats/${thread.id}`);
  };

  useEffect(() => {
    if (buyerId) {
      loadChats();
    }
  }, [buyerId, loadChats]);

  // Cleanup WebSocket при размонтировании компонента
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      isConnectingRef.current = false;
    };
  }, []);

  // handleChatClick заменен на handleThreadSelect выше

  // Фильтрация чатов
  const filteredThreads = threads.filter(thread => {
    const matchesSearch = !searchQuery ||
      (thread.last_message && thread.last_message.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (thread.seller_id && thread.seller_id.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter = filterType === 'all' ||
      (filterType === 'unread' && thread.unread_count > 0);

    return matchesSearch && matchesFilter;
  });

  return (
    <div style={{
      height: '100vh',
      backgroundColor: '#f8fafc',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Заголовок */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h1 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: '600',
            color: '#1e293b'
          }}>
            Сообщения
          </h1>
          <p style={{
            margin: '4px 0 0 0',
            fontSize: '14px',
            color: '#64748b'
          }}>
            {threads.length} {threads.length === 1 ? 'чат' : 'чатов'}
          </p>
        </div>
        <button
          onClick={loadChats}
          disabled={loading}
          style={{
            padding: '8px 16px',
            backgroundColor: loading ? '#f1f5f9' : '#3b82f6',
            color: loading ? '#64748b' : 'white',
            border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#1d4ed8';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#2563eb';
              }
            }}
          >
            {loading ? '🔄 Обновление...' : '🔄 Обновить'}
          </button>
        </div>

        {error && (
          <div style={{
            padding: '16px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <strong style={{ color: '#dc2626' }}>Ошибка загрузки чатов</strong>
            <p style={{ margin: '4px 0 0 0', color: '#7f1d1d' }}>{error}</p>
          </div>
        )}

        {loading && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
            fontSize: '18px',
            color: '#6b7280'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                border: '3px solid #e5e7eb',
                borderTop: '3px solid #2563eb',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              Загрузка чатов...
            </div>
          </div>
        )}

        {!loading && (
          <>
            <div style={{ marginBottom: '20px' }}>
              <p style={{ color: '#6b7280', fontSize: '16px' }}>
                Всего чатов: {threads.length}
              </p>
            </div>

            {threads.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '20px'
              }}>
                {threads.map((thread) => (
                  <div
                    key={thread.id}
                    onClick={() => handleThreadSelect(thread)}
                    style={{
                      backgroundColor: 'white',
                      padding: '24px',
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      border: '1px solid #e5e7eb'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '16px'
                    }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: '#2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px'
                      }}>
                        💬
                      </div>
                      <div>
                        <h3 style={{
                          margin: 0,
                          fontSize: '18px',
                          fontWeight: '600',
                          color: '#374151'
                        }}>
                          Чат с продавцом
                        </h3>
                        <p style={{
                          margin: '4px 0 0 0',
                          fontSize: '14px',
                          color: '#6b7280'
                        }}>
                          ID: {thread.seller_id?.substring(0, 8)}...
                        </p>
                      </div>
                    </div>

                    <div style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      marginBottom: '12px'
                    }}>
                      {thread.last_message ? (
                        <p style={{ margin: 0 }}>
                          <strong>Последнее сообщение:</strong> {thread.last_message.substring(0, 50)}...
                        </p>
                      ) : (
                        <p style={{ margin: 0 }}>Сообщений пока нет</p>
                      )}
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '12px',
                      color: '#9ca3af'
                    }}>
                      <span>
                        📅 {new Date(thread.created_at).toLocaleDateString('ru-RU')}
                      </span>
                      {thread.unread_count > 0 && (
                        <span style={{
                          backgroundColor: '#ef4444',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>
                          {thread.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '2px dashed #d1d5db'
              }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>💬</div>
                <h3 style={{
                  margin: 0,
                  marginBottom: '12px',
                  color: '#374151',
                  fontSize: '24px'
                }}>
                  Чатов пока нет
                </h3>
                <p style={{
                  margin: 0,
                  color: '#6b7280',
                  fontSize: '16px',
                  maxWidth: '400px',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  lineHeight: '1.6',
                  marginBottom: '30px'
                }}>
                  Начните общение с продавцами, связавшись с ними через страницы товаров.
                </p>
                <button
                  onClick={() => navigate('/products')}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#1d4ed8';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#2563eb';
                  }}
                >
                  🛍️ Посмотреть товары
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Chats;
