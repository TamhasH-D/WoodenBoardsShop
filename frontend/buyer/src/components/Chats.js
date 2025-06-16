import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import { apiService } from '../services/api';
import { BUYER_TEXTS } from '../utils/localization';
import { getCurrentBuyerId } from '../utils/auth';
import { getChatWebSocketUrl } from '../utils/websocket';

function Chats() {
  const navigate = useNavigate();
  const { showError } = useNotifications();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buyerId, setBuyerId] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [selectedThread, setSelectedThread] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [isConnected, setIsConnected] = useState(false);

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

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '24px 0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{
              margin: 0,
              color: '#111827',
              fontSize: '32px',
              fontWeight: '800',
              letterSpacing: '-0.025em'
            }}>
              💬 {BUYER_TEXTS.CHATS || 'Сообщения'}
            </h1>
            <p style={{
              margin: '8px 0 0 0',
              color: '#6b7280',
              fontSize: '16px',
              fontWeight: '500'
            }}>
              Общение с продавцами о товарах
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Connection Status */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '20px',
              backgroundColor: isConnected ? '#dcfce7' : '#fef3c7',
              border: `1px solid ${isConnected ? '#bbf7d0' : '#fcd34d'}`
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isConnected ? '#10b981' : '#f59e0b',
                animation: isConnected ? 'pulse 2s infinite' : 'none'
              }} />
              <span style={{
                fontSize: '14px',
                fontWeight: '600',
                color: isConnected ? '#065f46' : '#92400e'
              }}>
                {isConnected ? 'Онлайн' : 'Подключение...'}
              </span>
            </div>
            <button
              onClick={loadChats}
              disabled={loading}
              style={{
                padding: '12px 20px',
                backgroundColor: loading ? '#9ca3af' : '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#1d4ed8';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 20px rgba(37, 99, 235, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#2563eb';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)';
                }
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Обновление...
                </>
              ) : (
                <>
                  🔄 Обновить
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 24px'
      }}>

        {/* Error State */}
        {error && (
          <div style={{
            padding: '20px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              ⚠️
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#dc2626', fontSize: '18px', fontWeight: '700' }}>
                Ошибка загрузки чатов
              </h3>
              <p style={{ margin: '4px 0 0 0', color: '#7f1d1d', fontSize: '14px' }}>{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '400px',
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #2563eb',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '24px'
            }} />
            <h3 style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Загрузка чатов...
            </h3>
            <p style={{
              margin: 0,
              fontSize: '16px',
              color: '#6b7280'
            }}>
              Получаем актуальную информацию
            </p>
          </div>
        )}

        {!loading && (
          <>
            {/* Stats Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '32px',
              padding: '20px 24px',
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  📊
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827' }}>
                    Статистика чатов
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
                    Всего активных диалогов: <strong>{threads.length}</strong>
                  </p>
                </div>
              </div>
              <div style={{
                display: 'flex',
                gap: '16px',
                alignItems: 'center'
              }}>
                <div style={{
                  padding: '8px 16px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  {threads.filter(t => t.unread_count > 0).length} непрочитанных
                </div>
              </div>
            </div>

            {threads.length > 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                {threads.map((thread) => (
                  <div
                    key={thread.id}
                    onClick={() => handleThreadSelect(thread)}
                    style={{
                      backgroundColor: 'white',
                      padding: '24px',
                      borderRadius: '16px',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      border: thread.unread_count > 0 ? '2px solid #2563eb' : '1px solid #e5e7eb',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-4px)';
                      e.target.style.boxShadow = '0 12px 32px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
                    }}
                  >
                    {/* Unread indicator */}
                    {thread.unread_count > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '4px',
                        height: '100%',
                        backgroundColor: '#2563eb',
                        borderRadius: '0 4px 4px 0'
                      }} />
                    )}

                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '16px',
                      marginBottom: '20px'
                    }}>
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                        flexShrink: 0
                      }}>
                        🏪
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginBottom: '8px'
                        }}>
                          <h3 style={{
                            margin: 0,
                            fontSize: '20px',
                            fontWeight: '700',
                            color: '#111827',
                            letterSpacing: '-0.025em'
                          }}>
                            Продавец
                          </h3>
                          <div style={{
                            padding: '4px 8px',
                            backgroundColor: '#f3f4f6',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#6b7280',
                            fontFamily: 'monospace'
                          }}>
                            ID: {thread.seller_id?.substring(0, 8)}
                          </div>
                        </div>
                        <p style={{
                          margin: 0,
                          fontSize: '14px',
                          color: '#6b7280',
                          fontWeight: '500'
                        }}>
                          Диалог создан {new Date(thread.created_at).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      {thread.unread_count > 0 && (
                        <div style={{
                          backgroundColor: '#ef4444',
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '700',
                          minWidth: '24px',
                          textAlign: 'center',
                          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
                        }}>
                          {thread.unread_count}
                        </div>
                      )}
                    </div>

                    {/* Last message preview */}
                    <div style={{
                      padding: '16px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '12px',
                      marginBottom: '16px',
                      border: '1px solid #e2e8f0'
                    }}>
                      {thread.last_message ? (
                        <div>
                          <div style={{
                            fontSize: '12px',
                            color: '#6b7280',
                            fontWeight: '600',
                            marginBottom: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Последнее сообщение
                          </div>
                          <p style={{
                            margin: 0,
                            fontSize: '14px',
                            color: '#374151',
                            lineHeight: '1.5',
                            fontWeight: '500'
                          }}>
                            "{thread.last_message.length > 80 ?
                              thread.last_message.substring(0, 80) + '...' :
                              thread.last_message}"
                          </p>
                        </div>
                      ) : (
                        <div style={{
                          textAlign: 'center',
                          color: '#9ca3af',
                          fontSize: '14px',
                          fontStyle: 'italic'
                        }}>
                          Сообщений пока нет
                        </div>
                      )}
                    </div>

                    {/* Action area */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '12px',
                        color: '#9ca3af',
                        fontWeight: '500'
                      }}>
                        <span>🕒</span>
                        <span>
                          {new Date(thread.updated_at || thread.created_at).toLocaleString('ru-RU', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div style={{
                        padding: '8px 16px',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Открыть чат
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '80px 40px',
                backgroundColor: 'white',
                borderRadius: '24px',
                border: '2px dashed #d1d5db',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Background decoration */}
                <div style={{
                  position: 'absolute',
                  top: '-50%',
                  left: '-50%',
                  width: '200%',
                  height: '200%',
                  background: 'radial-gradient(circle, rgba(37, 99, 235, 0.05) 0%, transparent 70%)',
                  pointerEvents: 'none'
                }} />

                <div style={{
                  position: 'relative',
                  zIndex: 1
                }}>
                  <div style={{
                    fontSize: '80px',
                    marginBottom: '32px',
                    opacity: 0.8,
                    animation: 'float 3s ease-in-out infinite'
                  }}>
                    💬
                  </div>
                  <h3 style={{
                    margin: 0,
                    marginBottom: '16px',
                    color: '#111827',
                    fontSize: '28px',
                    fontWeight: '800',
                    letterSpacing: '-0.025em'
                  }}>
                    Начните общение
                  </h3>
                  <p style={{
                    margin: 0,
                    color: '#6b7280',
                    fontSize: '18px',
                    maxWidth: '500px',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    lineHeight: '1.7',
                    marginBottom: '40px',
                    fontWeight: '500'
                  }}>
                    У вас пока нет активных диалогов с продавцами. Найдите интересующий товар и свяжитесь с продавцом для обсуждения деталей.
                  </p>
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                  }}>
                    <button
                      onClick={() => navigate('/products')}
                      style={{
                        padding: '16px 32px',
                        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '16px',
                        fontSize: '16px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 8px 24px rgba(37, 99, 235, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-4px)';
                        e.target.style.boxShadow = '0 16px 32px rgba(37, 99, 235, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 8px 24px rgba(37, 99, 235, 0.3)';
                      }}
                    >
                      🛍️ Посмотреть товары
                    </button>
                    <button
                      onClick={() => navigate('/sellers')}
                      style={{
                        padding: '16px 32px',
                        backgroundColor: 'transparent',
                        color: '#2563eb',
                        border: '2px solid #2563eb',
                        borderRadius: '16px',
                        fontSize: '16px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#2563eb';
                        e.target.style.color = 'white';
                        e.target.style.transform = 'translateY(-4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = '#2563eb';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      🏪 Найти продавцов
                    </button>
                  </div>
                </div>
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

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default Chats;
