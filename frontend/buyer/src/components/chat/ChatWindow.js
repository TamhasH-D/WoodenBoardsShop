import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import { BUYER_TEXTS } from '../../utils/localization';

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

  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const isConnectingRef = useRef(false);

  const buyerId = localStorage.getItem('buyer_id') || 'b8c8e1e0-1234-5678-9abc-def012345678';

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
      
      // Загружаем информацию о треде
      const threadResponse = await fetch(`/api/v1/chat-threads/${threadId}`);
      if (threadResponse.ok) {
        const threadData = await threadResponse.json();
        setThreadInfo(threadData.data);
      }
      
      // Загружаем сообщения
      const messagesResponse = await fetch(`/api/v1/chat-messages/by-thread/${threadId}?limit=50`);
      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json();
        setMessages(messagesData.data.reverse()); // Реверсируем для правильного порядка
      }
      
    } catch (error) {
      console.error('Ошибка загрузки данных чата:', error);
      showError('Не удалось загрузить чат');
    } finally {
      setIsLoading(false);
    }
  }, [threadId, showError]);

  // WebSocket подключение
  const connectWebSocket = useCallback(() => {
    if (!threadId || !buyerId || isConnectingRef.current) return;

    // Закрываем существующее соединение если есть
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    isConnectingRef.current = true;
    const wsUrl = `ws://localhost:8000/ws/chat/${threadId}?user_id=${buyerId}&user_type=buyer`;
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
            // Добавляем новое сообщение
            setMessages(prev => [...prev, {
              id: data.message_id || Date.now(),
              message: data.message,
              sender_id: data.sender_id,
              sender_type: data.sender_type,
              created_at: data.timestamp,
              thread_id: data.thread_id,
              buyer_id: data.sender_type === 'buyer' ? data.sender_id : buyerId,
              seller_id: data.sender_type === 'seller' ? data.sender_id : threadInfo?.seller_id,
              is_read_by_buyer: data.sender_type === 'buyer',
              is_read_by_seller: data.sender_type === 'seller'
            }]);
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
        }
      } catch (error) {
        console.error('Ошибка обработки WebSocket сообщения:', error);
      }
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket отключен');
      isConnectingRef.current = false;
      setIsConnected(false);

      // Переподключение через 3 секунды только если компонент еще смонтирован
      if (threadId && buyerId) {
        reconnectTimeoutRef.current = setTimeout(() => {
          if (threadId && buyerId) { // Двойная проверка
            connectWebSocket();
          }
        }, 3000);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('Ошибка WebSocket:', error);
      isConnectingRef.current = false;
      setIsConnected(false);
    };
  }, [threadId, buyerId, threadInfo?.seller_id, showInfo]);

  // Отправка сообщения
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !isConnected) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      // Отправляем через REST API
      const messageId = crypto.randomUUID();
      const response = await fetch('/api/v1/chat-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: messageId,
          message: messageText,
          is_read_by_buyer: true,
          is_read_by_seller: false,
          thread_id: threadId,
          buyer_id: buyerId,
          seller_id: threadInfo?.seller_id
        })
      });

      if (response.ok) {
        // Отправляем через WebSocket для real-time обновления
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'message',
            message: messageText,
            message_id: messageId
          }));
        }
      } else {
        throw new Error('Не удалось отправить сообщение');
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
    loadChatData();
  }, [loadChatData]);

  useEffect(() => {
    if (threadInfo) {
      connectWebSocket();
    }
  }, [threadInfo, connectWebSocket]);

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
