import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { apiService } from '../services/api';
import { getChatWebSocketUrl } from '../utils/websocket';

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
  const reconnectTimeoutRef = useRef(null);
  const isConnectingRef = useRef(false);

  // Предзаполненное сообщение - мемоизируем чтобы избежать пересоздания
  const defaultMessage = useMemo(() =>
    `Заинтересовался вашим товаром "${product?.title || product?.neme || 'товар'}"`,
    [product?.title, product?.neme]
  );

  // Мемоизируем функцию загрузки сообщений
  const loadMessages = useCallback(async (threadId) => {
    if (!threadId) return;

    try {
      const result = await apiService.getChatMessages(threadId, 0, 50);
      setMessages(result.data || []);
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error);
    }
  }, []);

  // Мемоизируем функцию подключения WebSocket
  const connectWebSocket = useCallback((threadId) => {
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
      isConnectingRef.current = false;
      setIsConnected(false);

      // Переподключение через 3 секунды только если компонент еще смонтирован
      if (threadId && buyerId) {
        reconnectTimeoutRef.current = setTimeout(() => {
          if (threadId && buyerId) { // Двойная проверка
            connectWebSocket(threadId);
          }
        }, 3000);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('Ошибка WebSocket:', error);
      isConnectingRef.current = false;
      setIsConnected(false);
    };
  }, [buyerId, sellerId]);

  // Мемоизируем функцию загрузки данных чата
  const loadChatData = useCallback(async () => {
    if (!sellerId || !buyerId) return;

    try {
      setLoading(true);

      // Ищем существующий чат между покупателем и продавцом
      const result = await apiService.getBuyerChats(buyerId);
      const existingThread = result.data?.find(t => t.seller_id === sellerId);

      if (existingThread) {
        setThread(existingThread);
        setHasExistingChat(true);
        setNewMessage(''); // Очищаем предзаполненное сообщение

        // Загружаем сообщения
        await loadMessages(existingThread.id);

        // Подключаемся к WebSocket
        connectWebSocket(existingThread.id);
      } else if (!hasExistingChat && !newMessage) {
        // Устанавливаем предзаполненное сообщение только если нет существующего чата
        setNewMessage(defaultMessage);
      }
    } catch (error) {
      console.error('Ошибка загрузки чата:', error);
    } finally {
      setLoading(false);
    }
  }, [sellerId, buyerId, loadMessages, connectWebSocket, hasExistingChat, newMessage, defaultMessage]);

  const createChatThread = async () => {
    try {
      const result = await apiService.startChatWithSeller(buyerId, sellerId);
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
      const messageData = {
        id: messageId,
        message: messageText,
        is_read_by_buyer: true,
        is_read_by_seller: false,
        thread_id: currentThread.id,
        buyer_id: buyerId,
        seller_id: sellerId
      };

      const result = await apiService.sendMessage(messageData);
      if (result) {
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
      }

    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      showError('Не удалось отправить сообщение');
      setNewMessage(messageText); // Восстанавливаем текст при ошибке
    } finally {
      setSending(false);
    }
  };

  // Функция прокрутки к последнему сообщению
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Основной useEffect для загрузки данных чата
  useEffect(() => {
    loadChatData();
  }, [loadChatData]);

  // useEffect для прокрутки при новых сообщениях
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Cleanup useEffect
  useEffect(() => {
    return () => {
      // Очищаем WebSocket соединение
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      // Очищаем таймер переподключения
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      // Сбрасываем флаг подключения
      isConnectingRef.current = false;
    };
  }, []);

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      border: '1px solid rgba(0,0,0,0.05)',
      overflow: 'hidden'
    }}>
      {/* Заголовок чата */}
      <div style={{
        padding: window.innerWidth >= 768 ? '32px' : '24px',
        borderBottom: '1px solid #e2e8f0',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h2 style={{
              margin: '0 0 8px 0',
              fontSize: window.innerWidth >= 768 ? '28px' : '24px',
              fontWeight: '700',
              color: '#1f2937',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              💬 Чат с продавцом
            </h2>
            <p style={{
              margin: 0,
              color: '#64748b',
              fontSize: '16px',
              fontWeight: '500'
            }}>
              {hasExistingChat ? 'История переписки' : 'Начните общение с продавцом'}
            </p>
          </div>
          {isConnected && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '14px',
              color: '#059669',
              backgroundColor: '#dcfce7',
              padding: '8px 16px',
              borderRadius: '20px',
              fontWeight: '600'
            }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#059669',
                animation: 'pulse 2s infinite'
              }} />
              Подключен
            </div>
          )}
        </div>
      </div>

      {/* Область сообщений */}
      <div style={{
        height: hasExistingChat ? (window.innerWidth >= 768 ? '450px' : '350px') : (window.innerWidth >= 768 ? '250px' : '200px'),
        overflowY: 'auto',
        padding: window.innerWidth >= 768 ? '24px' : '16px',
        backgroundColor: '#fafafa'
      }}>
        {loading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            color: '#64748b'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              border: '3px solid #e2e8f0',
              borderTop: '3px solid #2563eb',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '16px'
            }} />
            <span style={{ fontSize: '16px', fontWeight: '500' }}>Загрузка чата...</span>
          </div>
        ) : messages.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            textAlign: 'center',
            color: '#64748b'
          }}>
            <div style={{
              fontSize: '64px',
              marginBottom: '20px',
              opacity: 0.7
            }}>💬</div>
            <h3 style={{
              margin: '0 0 12px 0',
              fontSize: '18px',
              fontWeight: '600',
              color: '#374151'
            }}>
              {hasExistingChat ? 'Сообщений пока нет' : 'Начните разговор с продавцом'}
            </h3>
            <p style={{
              margin: 0,
              fontSize: '14px',
              lineHeight: '1.5',
              maxWidth: '280px'
            }}>
              Задайте вопрос о товаре, условиях доставки или договоритесь о цене
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
                    marginBottom: '20px'
                  }}
                >
                  <div style={{
                    maxWidth: window.innerWidth >= 768 ? '75%' : '85%',
                    padding: '14px 18px',
                    borderRadius: isOwnMessage ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                    backgroundColor: isOwnMessage ? '#2563eb' : 'white',
                    color: isOwnMessage ? 'white' : '#374151',
                    fontSize: '16px',
                    lineHeight: '1.5',
                    boxShadow: isOwnMessage ? '0 4px 12px rgba(37, 99, 235, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.1)',
                    border: isOwnMessage ? 'none' : '1px solid #e2e8f0'
                  }}>
                    <div style={{ marginBottom: '6px' }}>{message.message}</div>
                    <div style={{
                      fontSize: '12px',
                      opacity: 0.8,
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
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Форма отправки сообщения */}
      <div style={{
        padding: window.innerWidth >= 768 ? '24px' : '16px',
        borderTop: '1px solid #e2e8f0',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
      }}>
        <form onSubmit={handleSendMessage}>
          <div style={{
            display: 'flex',
            gap: window.innerWidth >= 768 ? '16px' : '12px',
            alignItems: 'flex-end',
            flexDirection: window.innerWidth >= 640 ? 'row' : 'column'
          }}>
            <div style={{
              flex: 1,
              width: window.innerWidth >= 640 ? 'auto' : '100%'
            }}>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={hasExistingChat ? "Введите сообщение..." : `Заинтересовался вашим товаром "${product?.title || product?.neme || 'товар'}"`}
                rows={window.innerWidth >= 768 ? 3 : 2}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '16px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  resize: 'none',
                  fontFamily: 'inherit',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563eb';
                  e.target.style.boxShadow = '0 4px 16px rgba(37, 99, 235, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                }}
                disabled={sending}
              />
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              style={{
                padding: window.innerWidth >= 768 ? '16px 24px' : '14px 20px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: (!newMessage.trim() || sending) ? 'not-allowed' : 'pointer',
                opacity: (!newMessage.trim() || sending) ? 0.5 : 1,
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 16px rgba(37, 99, 235, 0.3)',
                transform: 'translateY(0)',
                width: window.innerWidth >= 640 ? 'auto' : '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (newMessage.trim() && !sending) {
                  e.target.style.backgroundColor = '#1d4ed8';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 24px rgba(37, 99, 235, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (newMessage.trim() && !sending) {
                  e.target.style.backgroundColor = '#2563eb';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 16px rgba(37, 99, 235, 0.3)';
                }
              }}
            >
              {sending ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <span>Отправка...</span>
                </>
              ) : (
                <>
                  <span>📤</span>
                  <span>Отправить</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Добавляем CSS анимации */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default ProductChat;
