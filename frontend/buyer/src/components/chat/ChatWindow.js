import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiService } from '../../services/api';
import { getChatWebSocketUrl } from '../../utils/websocket';
import { getCurrentBuyerId } from '../../utils/auth';


const ChatWindow = () => {
  const { threadId } = useParams();
  const { showError, showInfo } = useNotifications();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [threadInfo, setThreadInfo] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const isConnectingRef = useRef(false);

  const [buyerId, setBuyerId] = useState(null);

  // Получаем buyer_id при загрузке компонента
  useEffect(() => {
    const initializeBuyer = async () => {
      try {
        const realBuyerId = await getCurrentBuyerId();
        setBuyerId(realBuyerId);
        console.log('[ChatWindow] Real buyer_id obtained:', realBuyerId);
      } catch (error) {
        console.error('[ChatWindow] Failed to get buyer_id:', error);
        showError('Не удалось получить данные пользователя');
      }
    };

    initializeBuyer();
  }, [showError]);

  // Прокрутка к последнему сообщению
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Загрузка информации о треде и сообщений
  const loadChatData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Загружаем информацию о треде (пока оставим fetch, так как нет метода в apiService)
      const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const threadResponse = await fetch(`${apiBaseUrl}/api/v1/chat-threads/${threadId}`);
      if (threadResponse.ok) {
        const threadData = await threadResponse.json();
        setThreadInfo(threadData.data);
      }

      // Загружаем сообщения через apiService (первая страница)
      const messagesResult = await apiService.getChatMessages(threadId, 0, 20);
      setMessages(messagesResult.data || []);
      setHasMoreMessages((messagesResult.data || []).length === 20);
      setCurrentPage(0);

    } catch (error) {
      console.error('Ошибка загрузки данных чата:', error);
      showError('Не удалось загрузить чат');
    } finally {
      setIsLoading(false);
    }
  }, [threadId, showError]);

  // Загрузка дополнительных сообщений (пагинация)
  const loadMoreMessages = useCallback(async () => {
    if (loadingMore || !hasMoreMessages) return;

    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      const messagesResult = await apiService.getChatMessages(threadId, nextPage, 20);
      const newMessages = messagesResult.data || [];

      if (newMessages.length > 0) {
        // Добавляем новые сообщения в начало списка (старые сообщения)
        setMessages(prev => [...newMessages, ...prev]);
        setCurrentPage(nextPage);
        setHasMoreMessages(newMessages.length === 20);
      } else {
        setHasMoreMessages(false);
      }
    } catch (error) {
      console.error('Ошибка загрузки дополнительных сообщений:', error);
      showError('Не удалось загрузить дополнительные сообщения');
    } finally {
      setLoadingMore(false);
    }
  }, [threadId, currentPage, loadingMore, hasMoreMessages, showError]);

  // WebSocket подключение
  const connectWebSocket = useCallback(() => {
    if (!threadId || !buyerId || isConnectingRef.current) return;

    // Закрываем существующее соединение если есть
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    isConnectingRef.current = true;
    const wsUrl = getChatWebSocketUrl(threadId, buyerId, 'buyer');
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('WebSocket подключен');
      isConnectingRef.current = false;
      setIsConnected(true);
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'message':
            console.log('[ChatWindow] WebSocket message received:', data);
            console.log('[ChatWindow] Current buyerId:', buyerId);

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

            console.log('[ChatWindow] Processed message:', newMessage);

            // Проверяем, нет ли уже такого сообщения
            setMessages(prev => {
              const exists = prev.some(msg => msg.id === newMessage.id);
              if (exists) {
                console.log('[ChatWindow] WebSocket: Message already exists, skipping:', newMessage.id);
                return prev;
              }
              console.log('[ChatWindow] WebSocket: Adding new message:', newMessage.id);
              return [...prev, newMessage];
            });
            break;

          case 'typing':
            if (data.sender_id !== buyerId) {
              setOtherUserTyping(true);
              setTimeout(() => setOtherUserTyping(false), 3000);
            }
            break;

          case 'user_joined':
            if (data.sender_id !== buyerId) {
              showInfo('Продавец подключился к чату');
            }
            break;

          case 'user_left':
            if (data.sender_id !== buyerId) {
              showInfo('Продавец покинул чат');
            }
            break;

          default:
            console.log('Неизвестный тип сообщения:', data.type);
            break;
        }
      } catch (error) {
        console.error('Ошибка обработки WebSocket сообщения:', error);
      }
    };

    wsRef.current.onclose = () => {
      console.log('[ChatWindow] WebSocket отключен');
      isConnectingRef.current = false;
      setIsConnected(false);

      // Временно отключаем автоматическое переподключение
      // чтобы избежать множественных соединений
      console.log('[ChatWindow] WebSocket closed, not reconnecting automatically');
    };

    wsRef.current.onerror = (error) => {
      console.error('Ошибка WebSocket:', error);
      isConnectingRef.current = false;
      setIsConnected(false);
    };
  }, [threadId, buyerId, showInfo]);

  // Отправка сообщения
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !isConnected) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      // Отправляем через REST API
      // Генерируем UUID совместимым способом
      const messageId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : ((r & 0x3) | 0x8);
        return v.toString(16);
      });
      const messageData = {
        id: messageId,
        message: messageText,
        is_read_by_buyer: true,
        is_read_by_seller: false,
        thread_id: threadId,
        buyer_id: buyerId,  // Покупатель отправляет - buyer_id заполнен
        seller_id: null     // seller_id = null
      };

      const result = await apiService.sendMessage(messageData);
      if (result) {
        // Не добавляем сообщение локально - ждем эхо от WebSocket

        // Отправляем через WebSocket для real-time обновления
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          const wsMessage = {
            type: 'message',
            message: messageText,
            message_id: messageId,
            sender_id: buyerId,
            sender_type: 'buyer',
            thread_id: threadId,
            timestamp: new Date().toISOString()
          };
          console.log('[ChatWindow] Sending message via WebSocket:', wsMessage);
          wsRef.current.send(JSON.stringify(wsMessage));
        }
      }
      
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      showError('Не удалось отправить сообщение');
      setNewMessage(messageText); // Восстанавливаем текст при ошибке
    }
  };

  // Обработка набора текста
  const handleTyping = () => {
    if (!isTyping && isConnected && wsRef.current) {
      setIsTyping(true);
      wsRef.current.send(JSON.stringify({ type: 'typing' }));
    }
    
    // Сбрасываем таймер
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  useEffect(() => {
    if (buyerId) {
      loadChatData();
    }
  }, [buyerId, loadChatData]);

  useEffect(() => {
    if (threadInfo && buyerId && !wsRef.current) {
      console.log('[ChatWindow] Connecting WebSocket for the first time');
      connectWebSocket();
    }
  }, [threadInfo, buyerId, connectWebSocket]);

  // Cleanup useEffect
  useEffect(() => {
    return () => {
      // Очищаем WebSocket соединение
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      // Очищаем таймеры
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      // Сбрасываем флаг подключения
      isConnectingRef.current = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        fontSize: '18px',
        color: '#6b7280'
      }}>
        Загрузка чата...
      </div>
    );
  }

  if (!threadInfo) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        fontSize: '18px',
        color: '#ef4444'
      }}>
        Чат не найден
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#FAF7F0',
      minHeight: '100vh'
    }}>
      {/* Заголовок чата */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h2 style={{ margin: 0, color: '#374151', fontSize: '24px' }}>
            💬 Чат с продавцом
          </h2>
          <p style={{ margin: '8px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
            ID: {threadInfo.seller_id.substring(0, 8)}...
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          color: isConnected ? '#10b981' : '#ef4444'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isConnected ? '#10b981' : '#ef4444'
          }} />
          {isConnected ? 'Подключен' : 'Отключен'}
        </div>
      </div>

      {/* Область сообщений */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        height: '500px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          flex: 1,
          overflowY: 'auto',
          marginBottom: '20px',
          padding: '10px'
        }}>
          {/* Кнопка загрузки дополнительных сообщений */}
          {hasMoreMessages && messages.length > 0 && (
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <button
                onClick={loadMoreMessages}
                disabled={loadingMore}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '20px',
                  fontSize: '14px',
                  cursor: loadingMore ? 'not-allowed' : 'pointer',
                  opacity: loadingMore ? 0.7 : 1,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!loadingMore) {
                    e.target.style.backgroundColor = '#e5e7eb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loadingMore) {
                    e.target.style.backgroundColor = '#f3f4f6';
                  }
                }}
              >
                {loadingMore ? '⏳ Загрузка...' : '⬆️ Загрузить больше'}
              </button>
            </div>
          )}

          {messages.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: '#6b7280',
              fontSize: '16px',
              marginTop: '50px'
            }}>
              Начните разговор с продавцом
            </div>
          ) : (
            messages.map((message) => {
              // Правильная логика: сравниваем с текущим buyerId
              const isOwnMessage = message.buyer_id === buyerId;
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
                    fontSize: '16px',
                    lineHeight: '1.4'
                  }}>
                    <div>{message.message}</div>
                    <div style={{
                      fontSize: '12px',
                      opacity: 0.7,
                      marginTop: '4px'
                    }}>
                      {new Date(message.created_at).toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          
          {otherUserTyping && (
            <div style={{
              display: 'flex',
              justifyContent: 'flex-start',
              marginBottom: '16px'
            }}>
              <div style={{
                padding: '12px 16px',
                borderRadius: '18px',
                backgroundColor: '#f3f4f6',
                color: '#6b7280',
                fontSize: '14px',
                fontStyle: 'italic'
              }}>
                Продавец печатает...
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Форма отправки сообщения */}
        <form onSubmit={handleSendMessage} style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-end'
        }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Введите сообщение..."
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '2px solid #e5e7eb',
              borderRadius: '24px',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#2563eb'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            disabled={!isConnected}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !isConnected}
            style={{
              padding: '12px 20px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: (!newMessage.trim() || !isConnected) ? 'not-allowed' : 'pointer',
              opacity: (!newMessage.trim() || !isConnected) ? 0.5 : 1,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (newMessage.trim() && isConnected) {
                e.target.style.backgroundColor = '#1d4ed8';
              }
            }}
            onMouseLeave={(e) => {
              if (newMessage.trim() && isConnected) {
                e.target.style.backgroundColor = '#2563eb';
              }
            }}
          >
            Отправить
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
