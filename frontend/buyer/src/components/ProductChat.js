import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { apiService } from '../services/api';
import { getChatWebSocketUrl } from '../utils/websocket';
import { getCurrentBuyerId } from '../utils/auth';

const ProductChat = ({ productId, product, sellerId, buyerId: propBuyerId }) => {
  console.log('[ProductChat] Props:', { productId, productTitle: product?.title || product?.neme, sellerId, buyerId: propBuyerId });

  const { showError, showSuccess } = useNotifications();
  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [hasExistingChat, setHasExistingChat] = useState(false);
  const [buyerId, setBuyerId] = useState(null);

  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const isConnectingRef = useRef(false);
  const dataLoadedRef = useRef(false); // Отслеживаем, загружены ли данные

  const defaultMessage = useMemo(() =>
    `Заинтересовался вашим товаром "${product?.title || product?.neme || 'товар'}"`,
    [product?.title, product?.neme]
  );

  const loadMessages = useCallback(async (threadId) => {
    if (!threadId) return;
    try {
      const result = await apiService.getChatMessages(threadId, 0, 50);
      setMessages(result.data || []);
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error);
    }
  }, []); // Нет зависимостей - функция стабильна

  const connectWebSocket = useCallback((threadId) => {
    console.log('[ProductChat] connectWebSocket: Called for threadId:', threadId, 'buyerId:', buyerId);
    if (!threadId || !buyerId || isConnectingRef.current) return;

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    isConnectingRef.current = true;
    const wsUrl = getChatWebSocketUrl(threadId, buyerId, 'buyer');
    console.log('[ProductChat] connectWebSocket: URL:', wsUrl);
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('[ProductChat] connectWebSocket: WebSocket opened for threadId:', threadId);
      setIsConnected(true);
    };

    wsRef.current.onmessage = (event) => {
      console.log('[ProductChat] connectWebSocket: Message received:', event.data);
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'message') {
          console.log('[ProductChat] WebSocket message received:', data);
          console.log('[ProductChat] Current buyerId:', buyerId);

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

          console.log('[ProductChat] Processed message:', newMessage);

          // Проверяем, нет ли уже такого сообщения
          setMessages(prev => {
            const exists = prev.some(msg => msg.id === newMessage.id);
            if (exists) {
              console.log('[ProductChat] WebSocket: Message already exists, skipping:', newMessage.id);
              return prev;
            }
            console.log('[ProductChat] WebSocket: Adding new message:', newMessage.id);
            return [...prev, newMessage];
          });
        }
      } catch (error) {
        console.error('Ошибка обработки WebSocket сообщения:', error);
      }
    };

    wsRef.current.onclose = () => {
      console.log('[ProductChat] connectWebSocket: WebSocket closed for threadId:', threadId);
      isConnectingRef.current = false;
      setIsConnected(false);
      if (threadId && buyerId) {
        reconnectTimeoutRef.current = setTimeout(() => {
          if (threadId && buyerId) {
            console.log('[ProductChat] connectWebSocket: Attempting reconnect for threadId:', threadId);
            connectWebSocket(threadId);
          }
        }, 3000);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('[ProductChat] connectWebSocket: WebSocket error for threadId:', threadId, 'Error:', error);
      isConnectingRef.current = false;
      setIsConnected(false);
    };
  }, [buyerId, sellerId]); // Добавляем buyerId и sellerId как зависимости

  const loadChatData = useCallback(async () => {
    console.log('[ProductChat] loadChatData: Called');
    if (!sellerId || !buyerId || dataLoadedRef.current) return;

    try {
      setLoading(true);
      dataLoadedRef.current = true; // Помечаем, что данные загружаются
      console.log('[ProductChat] loadChatData: Calling getBuyerChats for buyerId:', buyerId);
      const result = await apiService.getBuyerChats(buyerId);
      console.log('[ProductChat] loadChatData: getBuyerChats result:', result);

      const existingThread = result.data?.find(t => t.seller_id === sellerId);

      if (existingThread) {
        console.log('[ProductChat] loadChatData: Existing thread found:', existingThread);
        setThread(existingThread);
        setHasExistingChat(true);
        setNewMessage('');
        await loadMessages(existingThread.id);
        console.log('[ProductChat] loadChatData: Connecting WebSocket for thread:', existingThread.id);
        connectWebSocket(existingThread.id);
      } else {
        // No existing thread, still need to set thread to null explicitly if it wasn't found
        // This helps the UI reflect that no thread is active yet.
        setThread(null);
        setHasExistingChat(false); // Ensure this is false
        // Не устанавливаем defaultMessage здесь, чтобы избежать циклов
        console.log('[ProductChat] loadChatData: No existing thread found.');
      }
    } catch (error) {
      console.error('[ProductChat] loadChatData: Error:', error);
      setThread(null); // Ensure thread is null on error
    } finally {
      setLoading(false);
      console.log('[ProductChat] loadChatData: Finished, setLoading to false.');
    }
  }, [sellerId, buyerId, loadMessages, connectWebSocket]); // Убираем newMessage и defaultMessage из зависимостей


  const createChatThread = async () => {
    console.log('[ProductChat] createChatThread: Called for buyerId:', buyerId, 'sellerId:', sellerId);
    try {
      console.log('[ProductChat] createChatThread: Calling startChatWithSeller for buyerId:', buyerId, 'sellerId:', sellerId);
      const result = await apiService.startChatWithSeller(buyerId, sellerId);
      console.log('[ProductChat] createChatThread: startChatWithSeller result:', result);
      const newThread = result.data;
      console.log('[ProductChat] createChatThread: New thread created:', newThread);
      setThread(newThread);
      setHasExistingChat(true);
      connectWebSocket(newThread.id);
      return newThread;
    } catch (error) {
      console.error('[ProductChat] createChatThread: Error creating chat:', error);
      showError('Не удалось создать чат');
      setThread(null); // Ensure thread is null on error
      throw error;
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    console.log('[ProductChat] handleSendMessage: Called with message:', newMessage);
    console.log('[ProductChat] handleSendMessage: buyerId:', buyerId, 'sellerId:', sellerId);

    if (!buyerId) {
      console.error('[ProductChat] handleSendMessage: buyerId is not available');
      showError('Ошибка аутентификации. Попробуйте обновить страницу.');
      return;
    }

    if (!newMessage.trim()) return;

    const messageText = newMessage.trim();
    setSending(true);

    try {
      let currentThread = thread;
      console.log('[ProductChat] handleSendMessage: Current thread:', currentThread);
      
      if (!currentThread) {
        console.log('[ProductChat] handleSendMessage: Attempting to create new thread.');
        currentThread = await createChatThread();
        if (!currentThread) { // If thread creation failed
            showError('Не удалось отправить сообщение: чат не найден.');
            setSending(false);
            return;
        }
      }

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
        thread_id: currentThread.id,
        buyer_id: buyerId,  // Покупатель отправляет - buyer_id заполнен
        seller_id: null     // seller_id = null
      };

      console.log('[ProductChat] handleSendMessage: Calling sendMessage API with data:', messageData);
      const result = await apiService.sendMessage(messageData);
      console.log('[ProductChat] handleSendMessage: sendMessage API result:', result);

      if (result) {
        // Не добавляем сообщение локально - ждем эхо от WebSocket
        setNewMessage('');

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
           const wsMessage = { type: 'message', message: messageText, message_id: messageId, sender_id: buyerId, sender_type: 'buyer', thread_id: currentThread.id, timestamp: new Date().toISOString() };
           console.log('[ProductChat] handleSendMessage: Sending message via WebSocket:', wsMessage);
          wsRef.current.send(JSON.stringify(wsMessage));
        }
        if (!hasExistingChat) {
          showSuccess('Сообщение отправлено продавцу');
          setHasExistingChat(true); // Теперь у нас есть чат
        }
      }
    } catch (error) {
      console.error('[ProductChat] handleSendMessage: Error sending message:', error);
      showError('Не удалось отправить сообщение');
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Получаем настоящий buyer_id при загрузке компонента
  useEffect(() => {
    if (buyerId) return; // Если уже есть buyerId, не загружаем повторно

    const initializeBuyer = async () => {
      try {
        console.log('[ProductChat] initializeBuyer: Starting...');
        const realBuyerId = await getCurrentBuyerId();
        console.log('[ProductChat] initializeBuyer: Real buyer_id obtained:', realBuyerId);
        setBuyerId(realBuyerId);
      } catch (error) {
        console.error('[ProductChat] initializeBuyer: Failed to get buyer_id:', error);
        showError('Не удалось получить данные пользователя');
      }
    };

    initializeBuyer();
  }, [showError]); // Добавляем showError как зависимость

  // Устанавливаем defaultMessage только один раз
  useEffect(() => {
    if (!newMessage && product?.title) {
      setNewMessage(defaultMessage);
    }
  }, [product?.title, defaultMessage, newMessage]); // Добавляем зависимости

  // Создаем ref для loadChatData, чтобы избежать циклов
  const loadChatDataRef = useRef(loadChatData);
  loadChatDataRef.current = loadChatData;

  useEffect(() => {
    if (buyerId && sellerId) {
      loadChatDataRef.current();
    }
  }, [buyerId, sellerId]); // Теперь можем безопасно использовать зависимости

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

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

  // Чат доступен если есть buyerId и sellerId (WebSocket и thread не обязательны)
  const chatDisabled = !buyerId || !sellerId || loading;

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      border: '1px solid #e5e7eb',
      overflow: 'hidden'
    }}>
      {/* Заголовок чата */}
      <div style={{
        padding: window.innerWidth >= 768 ? '24px' : '20px',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb'
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
              fontSize: window.innerWidth >= 768 ? '20px' : '18px',
              fontWeight: '600',
              color: '#111827',
              letterSpacing: '-0.025em'
            }}>
              Связь с продавцом
            </h2>
            <p style={{
              margin: 0,
              color: '#6b7280',
              fontSize: '14px',
              fontWeight: '400'
            }}>
              {hasExistingChat ? 'История переписки' : 'Начните общение с продавцом'}
            </p>
          </div>

          {/* Connection Status Display */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {loading && (
              <div style={{
                color: '#6b7280',
                backgroundColor: '#f9fafb',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Загрузка...</div>
            )}
            {!loading && !buyerId && (
              <div style={{
                color: '#dc2626',
                backgroundColor: '#fef2f2',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Ошибка</div>
            )}
            {!loading && buyerId && !thread && (
              <div style={{
                color: '#2563eb',
                backgroundColor: '#eff6ff',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Готов</div>
            )}
            {!loading && buyerId && thread && !isConnected && (
              <div style={{
                color: '#ea580c',
                backgroundColor: '#fff7ed',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Подключение...</div>
            )}
            {!loading && buyerId && thread && isConnected && (
              <div style={{
                color: '#059669',
                backgroundColor: '#f0fdf4',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#059669'
                }} />
                Подключен
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Область сообщений */}
      <div style={{
        height: hasExistingChat ? (window.innerWidth >= 768 ? '400px' : '300px') : (window.innerWidth >= 768 ? '200px' : '160px'),
        overflowY: 'auto',
        padding: window.innerWidth >= 768 ? '20px' : '16px',
        backgroundColor: '#ffffff'
      }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#6b7280' }}>
            <div style={{ width: '24px', height: '24px', border: '2px solid #e5e7eb', borderTop: '2px solid #374151', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
            <span style={{ fontSize: '14px', fontWeight: '500' }}>Загрузка чата...</span>
          </div>
        ) : messages.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', color: '#6b7280' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              backgroundColor: '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              border: '1px solid #e5e7eb'
            }}>
              <span style={{ fontSize: '20px', color: '#9ca3af' }}>💬</span>
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#374151' }}>
              {hasExistingChat ? 'Сообщений пока нет' : 'Начните разговор с продавцом'}
            </h3>
            <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.4', maxWidth: '240px', color: '#6b7280' }}>
              Задайте вопрос о товаре, условиях доставки или договоритесь о цене
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              // Правильная логика: сравниваем с текущим buyerId
              const isOwnMessage = message.buyer_id === buyerId;
              return (
                <div key={message.id} style={{ display: 'flex', justifyContent: isOwnMessage ? 'flex-end' : 'flex-start', marginBottom: '16px' }}>
                  <div style={{
                    maxWidth: window.innerWidth >= 768 ? '70%' : '80%',
                    padding: '12px 16px',
                    borderRadius: isOwnMessage ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                    backgroundColor: isOwnMessage ? '#374151' : '#f9fafb',
                    color: isOwnMessage ? 'white' : '#111827',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    border: isOwnMessage ? 'none' : '1px solid #e5e7eb'
                  }}>
                    <div style={{ marginBottom: '6px' }}>{message.message}</div>
                    <div style={{
                      fontSize: '11px',
                      opacity: isOwnMessage ? 0.8 : 0.6,
                      textAlign: 'right',
                      color: isOwnMessage ? '#d1d5db' : '#6b7280'
                    }}>
                      {new Date(message.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
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
        padding: window.innerWidth >= 768 ? '20px' : '16px',
        borderTop: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb'
      }}>
        <form onSubmit={handleSendMessage}>
          <div style={{ display: 'flex', gap: window.innerWidth >= 768 ? '12px' : '8px', alignItems: 'flex-end', flexDirection: window.innerWidth >= 640 ? 'row' : 'column' }}>
            <div style={{ flex: 1, width: window.innerWidth >= 640 ? 'auto' : '100%' }}>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={
                  loading ? "Загрузка чата..." :
                  !buyerId ? "Ошибка аутентификации..." :
                  hasExistingChat ? "Введите сообщение..." :
                  `Заинтересовался вашим товаром "${product?.title || product?.neme || 'товар'}"`
                }
                rows={window.innerWidth >= 768 ? 2 : 2}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  resize: 'none',
                  fontFamily: 'inherit',
                  backgroundColor: 'white',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  opacity: (sending || chatDisabled) ? 0.7 : 1
                }}
                onFocus={(e) => { if (!chatDisabled && !sending) { e.target.style.borderColor = '#374151'; e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'; } }}
                onBlur={(e) => { if (!chatDisabled && !sending) { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'; } }}
                disabled={sending || chatDisabled}
              />
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim() || sending || chatDisabled}
              style={{
                padding: window.innerWidth >= 768 ? '12px 20px' : '10px 16px',
                backgroundColor: '#374151',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: (!newMessage.trim() || sending || chatDisabled) ? 'not-allowed' : 'pointer',
                opacity: (!newMessage.trim() || sending || chatDisabled) ? 0.5 : 1,
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                transform: 'translateY(0)',
                width: window.innerWidth >= 640 ? 'auto' : '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                letterSpacing: '0.025em'
              }}
              onMouseEnter={(e) => { if (newMessage.trim() && !sending && !chatDisabled) { e.target.style.backgroundColor = '#1f2937'; e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.15)'; } }}
              onMouseLeave={(e) => { if (newMessage.trim() && !sending && !chatDisabled) { e.target.style.backgroundColor = '#374151'; e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'; } }}
            >
              {sending ? (
                <> <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> <span>Отправка...</span> </>
              ) : (
                <span>Отправить</span>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
};

export default ProductChat;
