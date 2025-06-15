import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { apiService } from '../services/api';
import { SELLER_TEXTS } from '../utils/localization';
import { getCurrentSellerKeycloakId } from '../utils/auth';
import { getChatWebSocketUrl } from '../utils/websocket';

function Chats() {
  const [selectedThread, setSelectedThread] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // WebSocket refs
  const wsRef = useRef(null);
  const isConnectingRef = useRef(false);
  const reconnectTimeoutRef = useRef(null);

  // Get seller profile to get seller_id
  const keycloakId = getCurrentSellerKeycloakId();
  const { data: sellerProfile } = useApi(
    keycloakId ? () => apiService.getSellerProfileByKeycloakId(keycloakId) : null,
    [keycloakId]
  );
  const sellerId = sellerProfile?.data?.id;

  // Локальное управление сообщениями (как у покупателя)
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Функция загрузки сообщений (как у покупателя)
  const loadMessages = useCallback(async (threadId) => {
    if (!threadId) return;
    try {
      setMessagesLoading(true);
      const result = await apiService.getChatMessages(threadId, 0, 50);
      setMessages(result.data || []);
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  // WebSocket connection
  const connectWebSocket = useCallback((threadId) => {
    if (!threadId || !sellerId || isConnectingRef.current) return;

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    isConnectingRef.current = true;
    const wsUrl = getChatWebSocketUrl(threadId, sellerId, 'seller');
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
          console.log('[Chats] WebSocket message received:', data);
          console.log('[Chats] Current sellerId:', sellerId);

          const newMessage = {
            id: data.message_id || Date.now(),
            message: data.message,
            sender_id: data.sender_id,
            sender_type: data.sender_type,
            created_at: data.timestamp,
            thread_id: data.thread_id,
            buyer_id: data.sender_type === 'buyer' ? data.sender_id : null,
            seller_id: data.sender_type === 'seller' ? data.sender_id : null,
            is_read_by_buyer: data.sender_type === 'buyer',
            is_read_by_seller: data.sender_type === 'seller'
          };

          console.log('[Chats] Processed message:', newMessage);

          // Проверяем, нет ли уже такого сообщения
          setMessages(prev => {
            const exists = prev.some(msg => msg.id === newMessage.id);
            if (exists) {
              console.log('[Chats] WebSocket: Message already exists, skipping:', newMessage.id);
              return prev;
            }
            console.log('[Chats] WebSocket: Adding new message:', newMessage.id);
            return [...prev, newMessage];
          });
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
      if (threadId && sellerId) {
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
  }, [sellerId]);

  // Мемоизируем функцию загрузки чатов продавца
  const loadChats = useCallback(async () => {
    if (!sellerId) return;

    try {
      setLoading(true);
      setError(null);

      const result = await apiService.getSellerChats(sellerId);
      setThreads(result.data || []);

    } catch (err) {
      console.error('Ошибка загрузки чатов:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [sellerId]);

  // Используем useEffect только для первоначальной загрузки
  useEffect(() => {
    if (sellerId) {
      loadChats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellerId]); // Убираем loadChats из зависимостей чтобы избежать циклов

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

  const handleThreadSelect = async (thread) => {
    setSelectedThread(thread);

    // Загружаем сообщения локально
    await loadMessages(thread.id);

    // Подключаем WebSocket для выбранного треда
    connectWebSocket(thread.id);

    // Отмечаем сообщения как прочитанные продавцом
    try {
      await apiService.markMessagesAsRead(thread.id, sellerId, 'seller');
      console.log('Messages marked as read for seller');
      // Обновляем список чатов, чтобы убрать счетчик непрочитанных
      loadChats();
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedThread) return;

    const messageText = newMessage.trim();
    setSending(true);

    try {
      // Генерируем UUID совместимым способом
      const messageId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : ((r & 0x3) | 0x8);
        return v.toString(16);
      });
      const messageData = {
        id: messageId,
        message: messageText,
        is_read_by_buyer: false,
        is_read_by_seller: true,
        thread_id: selectedThread.id,
        buyer_id: null,  // Продавец отправляет - buyer_id = null
        seller_id: sellerId  // seller_id заполнен = отправитель
      };

      const result = await apiService.sendMessage(messageData);

      if (result) {
        // Не добавляем сообщение локально - ждем эхо от WebSocket
        setNewMessage('');

        // Отправляем через WebSocket если подключен
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          const wsMessage = {
            type: 'message',
            message: messageText,
            message_id: messageId,
            sender_id: sellerId,
            sender_type: 'seller',
            thread_id: selectedThread.id,
            timestamp: new Date().toISOString()
          };
          console.log('[Chats] Sending message via WebSocket:', wsMessage);
          wsRef.current.send(JSON.stringify(wsMessage));
        }
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setNewMessage(messageText); // Восстанавливаем сообщение при ошибке
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#f8fafc',
      minHeight: '100vh'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        marginBottom: '30px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <div>
            <h1 style={{ margin: 0, color: '#374151', fontSize: '32px' }}>
              💬 {SELLER_TEXTS.CHATS || 'Чаты с покупателями'}
            </h1>
            <p style={{ margin: '8px 0 0 0', color: '#6b7280', fontSize: '16px' }}>
              Общение с покупателями о ваших товарах
            </p>
          </div>
          <button
            onClick={loadChats}
            disabled={loading}
            style={{
              padding: '12px 20px',
              backgroundColor: '#2563eb',
              color: 'white',
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

        <div style={{ marginBottom: '20px' }}>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            Всего чатов: {threads.length}
          </p>
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
            <button
              onClick={loadChats}
              style={{
                marginTop: '12px',
                padding: '8px 16px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Повторить попытку
            </button>
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
            {threads.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '30px',
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <div>
                  <h3 style={{
                    margin: '0 0 20px 0',
                    color: '#374151',
                    fontSize: '20px',
                    fontWeight: '600'
                  }}>
                    📋 Список чатов
                  </h3>
                  <div style={{
                    maxHeight: '500px',
                    overflowY: 'auto',
                    padding: '10px'
                  }}>
                    {threads.map((thread) => (
                      <div
                        key={thread.id}
                        onClick={() => handleThreadSelect(thread)}
                        style={{
                          padding: '20px',
                          backgroundColor: selectedThread?.id === thread.id ? '#dbeafe' : '#f9fafb',
                          border: selectedThread?.id === thread.id ? '2px solid #2563eb' : '1px solid #e5e7eb',
                          borderRadius: '12px',
                          marginBottom: '16px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedThread?.id !== thread.id) {
                            e.target.style.backgroundColor = '#f3f4f6';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedThread?.id !== thread.id) {
                            e.target.style.backgroundColor = '#f9fafb';
                          }
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginBottom: '12px'
                        }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: '#10b981',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px'
                          }}>
                            👤
                          </div>
                          <div>
                            <div style={{
                              fontWeight: '600',
                              color: '#374151',
                              fontSize: '16px'
                            }}>
                              Чат #{thread.id.substring(0, 8)}...
                            </div>
                            <div style={{
                              fontSize: '14px',
                              color: '#6b7280'
                            }}>
                              Покупатель: {thread.buyer_id?.substring(0, 8)}...
                            </div>
                          </div>
                        </div>

                        <div style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          marginBottom: '8px'
                        }}>
                          {thread.last_message ? (
                            <p style={{ margin: 0 }}>
                              <strong>Последнее сообщение:</strong> {thread.last_message.substring(0, 40)}...
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
                </div>

                <div>
                  <h3 style={{
                    margin: '0 0 20px 0',
                    color: '#374151',
                    fontSize: '20px',
                    fontWeight: '600'
                  }}>
                    💬 Сообщения
                  </h3>
                  {selectedThread ? (
                    <div>
                      <div style={{
                        padding: '16px',
                        backgroundColor: '#f0f9ff',
                        border: '1px solid #0ea5e9',
                        borderRadius: '8px',
                        marginBottom: '20px'
                      }}>
                        <strong style={{ color: '#0c4a6e' }}>
                          Чат с покупателем {selectedThread.buyer_id?.substring(0, 8)}...
                        </strong>
                      </div>

                      {messagesLoading && (
                        <div style={{
                          textAlign: 'center',
                          padding: '20px',
                          color: '#6b7280'
                        }}>
                          Загрузка сообщений...
                        </div>
                      )}

                      {messages && messages.length > 0 ? (
                        <div style={{
                          maxHeight: '350px',
                          overflowY: 'auto',
                          marginBottom: '20px',
                          padding: '10px',
                          backgroundColor: '#f9fafb',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb'
                        }}>
                          {[...messages].reverse().map((message) => {
                            // Правильная логика: сравниваем с текущим sellerId
                            const isOwnMessage = message.seller_id === sellerId;
                            return (
                              <div
                                key={message.id}
                                style={{
                                  display: 'flex',
                                  justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                                  marginBottom: '16px'
                                }}
                              >
                                <div style={{
                                  maxWidth: '70%',
                                  padding: '12px 16px',
                                  borderRadius: '18px',
                                  backgroundColor: isOwnMessage ? '#2563eb' : '#f3f4f6',
                                  color: isOwnMessage ? 'white' : '#374151',
                                  fontSize: '14px',
                                  lineHeight: '1.4'
                                }}>
                                  <div style={{
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    marginBottom: '4px',
                                    opacity: 0.8
                                  }}>
                                    {isOwnMessage ? '🏪 Вы' : '👤 Покупатель'}
                                  </div>
                                  <div style={{ marginBottom: '4px' }}>
                                    {message.message}
                                  </div>
                                  <div style={{
                                    fontSize: '11px',
                                    opacity: 0.7,
                                    textAlign: 'right'
                                  }}>
                                    {new Date(message.created_at).toLocaleTimeString('ru-RU', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{
                          textAlign: 'center',
                          padding: '40px 20px',
                          backgroundColor: '#f9fafb',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          marginBottom: '20px'
                        }}>
                          <div style={{ fontSize: '32px', marginBottom: '12px' }}>💬</div>
                          <p style={{ margin: 0, color: '#6b7280' }}>
                            Сообщений пока нет. Начните разговор!
                          </p>
                        </div>
                      )}

                      {/* Message Input */}
                      <form onSubmit={handleSendMessage}>
                        <div style={{
                          display: 'flex',
                          gap: '12px',
                          padding: '16px',
                          backgroundColor: '#f9fafb',
                          borderRadius: '12px',
                          border: '1px solid #e5e7eb'
                        }}>
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Введите ваш ответ..."
                            style={{
                              flex: 1,
                              padding: '12px 16px',
                              border: '1px solid #d1d5db',
                              borderRadius: '8px',
                              fontSize: '14px',
                              outline: 'none'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            disabled={sending}
                          />
                          <button
                            type="submit"
                            disabled={sending || !newMessage.trim()}
                            style={{
                              padding: '12px 20px',
                              backgroundColor: '#2563eb',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '14px',
                              fontWeight: '600',
                              cursor: (!newMessage.trim() || sending) ? 'not-allowed' : 'pointer',
                              opacity: (!newMessage.trim() || sending) ? 0.5 : 1,
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              if (newMessage.trim() && !sending) {
                                e.target.style.backgroundColor = '#1d4ed8';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (newMessage.trim() && !sending) {
                                e.target.style.backgroundColor = '#2563eb';
                              }
                            }}
                          >
                            {sending ? 'Отправка...' : 'Отправить'}
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      padding: '60px 20px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '12px',
                      border: '2px dashed #d1d5db'
                    }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
                      <h4 style={{
                        margin: '0 0 8px 0',
                        color: '#374151',
                        fontSize: '18px'
                      }}>
                        Выберите чат
                      </h4>
                      <p style={{
                        margin: 0,
                        color: '#6b7280',
                        fontSize: '14px'
                      }}>
                        Выберите чат из списка для просмотра сообщений
                      </p>
                    </div>
                  )}
                </div>
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
                  lineHeight: '1.6'
                }}>
                  Покупатели смогут связаться с вами через ваши товары.
                </p>
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
