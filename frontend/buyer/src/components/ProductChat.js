import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

const ProductChat = ({ productId, product, sellerId, buyerId }) => {
  const { showError, showSuccess } = useNotifications();
  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [hasExistingChat, setHasExistingChat] = useState(false);
  
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Предзаполненное сообщение
  const defaultMessage = `Заинтересовался вашим товаром "${product?.title || product?.neme || 'товар'}"`;

  useEffect(() => {
    if (!sellerId || !buyerId) return;
    
    // Устанавливаем предзаполненное сообщение только если нет существующего чата
    if (!hasExistingChat && !newMessage) {
      setNewMessage(defaultMessage);
    }
    
    loadChatData();
  }, [sellerId, buyerId, productId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatData = async () => {
    try {
      setLoading(true);
      
      // Ищем существующий чат между покупателем и продавцом
      const response = await fetch(`/api/v1/chat-threads/by-buyer/${buyerId}`);
      if (response.ok) {
        const result = await response.json();
        const existingThread = result.data?.find(t => t.seller_id === sellerId);
        
        if (existingThread) {
          setThread(existingThread);
          setHasExistingChat(true);
          setNewMessage(''); // Очищаем предзаполненное сообщение
          
          // Загружаем сообщения
          await loadMessages(existingThread.id);
          
          // Подключаемся к WebSocket
          connectWebSocket(existingThread.id);
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки чата:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (threadId) => {
    try {
      const response = await fetch(`/api/v1/chat-messages/by-thread/${threadId}?limit=50`);
      if (response.ok) {
        const result = await response.json();
        setMessages(result.data.reverse());
      }
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error);
    }
  };

  const connectWebSocket = useCallback((threadId) => {
    if (!threadId || !buyerId) return;

    const wsUrl = `ws://localhost:8000/ws/chat/${threadId}?user_id=${buyerId}&user_type=buyer`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      setIsConnected(true);
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'message') {
          setMessages(prev => [...prev, {
            id: data.message_id || Date.now(),
            message: data.message,
            sender_id: data.sender_id,
            sender_type: data.sender_type,
            created_at: data.timestamp,
            thread_id: data.thread_id,
            buyer_id: data.sender_type === 'buyer' ? data.sender_id : buyerId,
            seller_id: data.sender_type === 'seller' ? data.sender_id : sellerId,
            is_read_by_buyer: data.sender_type === 'buyer',
            is_read_by_seller: data.sender_type === 'seller'
          }]);
        }
      } catch (error) {
        console.error('Ошибка обработки WebSocket сообщения:', error);
      }
    };

    wsRef.current.onclose = () => {
      setIsConnected(false);
      // Переподключение через 3 секунды
      setTimeout(() => connectWebSocket(threadId), 3000);
    };

    wsRef.current.onerror = (error) => {
      console.error('Ошибка WebSocket:', error);
      setIsConnected(false);
    };
  }, [buyerId, sellerId]);

  const createChatThread = async () => {
    try {
      const response = await fetch('/api/v1/chat-threads/start-with-seller', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buyer_id: buyerId,
          seller_id: sellerId
        })
      });

      if (!response.ok) {
        throw new Error('Не удалось создать чат');
      }

      const result = await response.json();
      const newThread = result.data;
      
      setThread(newThread);
      setHasExistingChat(true);
      connectWebSocket(newThread.id);
      
      return newThread;
    } catch (error) {
      console.error('Ошибка создания чата:', error);
      showError('Не удалось создать чат');
      throw error;
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageText = newMessage.trim();
    setSending(true);

    try {
      let currentThread = thread;
      
      // Создаем тред, если его нет
      if (!currentThread) {
        currentThread = await createChatThread();
      }

      // Отправляем сообщение
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
          thread_id: currentThread.id,
          buyer_id: buyerId,
          seller_id: sellerId
        })
      });

      if (response.ok) {
        setNewMessage('');
        
        // Отправляем через WebSocket для real-time обновления
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'message',
            message: messageText,
            message_id: messageId
          }));
        }
        
        if (!hasExistingChat) {
          showSuccess('Сообщение отправлено продавцу');
        }
      } else {
        throw new Error('Не удалось отправить сообщение');
      }
      
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      showError('Не удалось отправить сообщение');
      setNewMessage(messageText); // Восстанавливаем текст при ошибке
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    }}>
      {/* Заголовок чата */}
      <div style={{
        padding: '24px',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h2 style={{
              margin: '0 0 4px 0',
              fontSize: '24px',
              fontWeight: '700',
              color: '#374151'
            }}>
              💬 Чат с продавцом
            </h2>
            <p style={{
              margin: 0,
              color: '#6b7280',
              fontSize: '14px'
            }}>
              {hasExistingChat ? 'История переписки' : 'Начните общение с продавцом'}
            </p>
          </div>
          {isConnected && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              color: '#10b981'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10b981'
              }} />
              Онлайн
            </div>
          )}
        </div>
      </div>

      {/* Область сообщений */}
      <div style={{
        height: hasExistingChat ? '400px' : '200px',
        overflowY: 'auto',
        padding: '20px'
      }}>
        {loading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            color: '#6b7280'
          }}>
            Загрузка чата...
          </div>
        ) : messages.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
            <p style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
              {hasExistingChat ? 'Сообщений пока нет' : 'Начните разговор с продавцом'}
            </p>
            <p style={{ margin: 0, fontSize: '14px' }}>
              Задайте вопрос о товаре или условиях покупки
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => {
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
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Форма отправки сообщения */}
      <div style={{
        padding: '20px',
        borderTop: '1px solid #e5e7eb',
        backgroundColor: '#f8fafc'
      }}>
        <form onSubmit={handleSendMessage}>
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-end'
          }}>
            <div style={{ flex: 1 }}>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Введите сообщение..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  resize: 'none',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                disabled={sending}
              />
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              style={{
                padding: '12px 20px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: (!newMessage.trim() || sending) ? 'not-allowed' : 'pointer',
                opacity: (!newMessage.trim() || sending) ? 0.5 : 1,
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
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
    </div>
  );
};

export default ProductChat;
