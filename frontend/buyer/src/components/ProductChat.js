import React, { useState, useEffect, useRef } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { useChat } from '../hooks/useChat';

const ProductChat = ({ productId, product, sellerId }) => {
  console.log('[ProductChat] Props:', { productId, productTitle: product?.title || product?.neme, sellerId });

  const { showError, showSuccess } = useNotifications();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [defaultMessageSet, setDefaultMessageSet] = useState(false);
  const messagesEndRef = useRef(null);

  const {
    thread,
    messages,
    isConnected,
    loading,
    error,
    buyerId,
    sendMessage,
    sendTypingIndicator,
    hasExistingChat,
    defaultMessage
  } = useChat(sellerId, product?.title || product?.neme);

  // Показываем ошибку если есть
  useEffect(() => {
    if (error) {
      showError(error);
    }
  }, [error, showError]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setSending(true);

    try {
      await sendMessage(messageText);
      setNewMessage('');

      if (!hasExistingChat) {
        showSuccess('Сообщение отправлено продавцу');
      }
    } catch (error) {
      console.error('[ProductChat] Error sending message:', error);
      showError('Не удалось отправить сообщение');
      setNewMessage(messageText); // Восстанавливаем текст при ошибке
    } finally {
      setSending(false);
    }
  };

  // Обработка набора текста
  const handleTyping = () => {
    if (thread && isConnected) {
      sendTypingIndicator();
    }
  };

  // Автопрокрутка к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Устанавливаем defaultMessage только один раз
  useEffect(() => {
    if (!defaultMessageSet && !newMessage && defaultMessage && !hasExistingChat && !loading) {
      setNewMessage(defaultMessage);
      setDefaultMessageSet(true);
    }
  }, [defaultMessage, hasExistingChat, newMessage, loading, defaultMessageSet]);

  // Чат доступен если есть buyerId и sellerId (WebSocket и thread не обязательны)
  const chatDisabled = !buyerId || !sellerId || loading;

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '24px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)'
    }}>
      {/* Заголовок чата */}
      <div style={{
        padding: window.innerWidth >= 768 ? '32px' : '24px',
        borderBottom: '1px solid #e2e8f0',
        background: 'linear-gradient(135deg, #8B4513 0%, #D2691E 100%)',
        color: 'white'
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
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              💬 Чат с продавцом
            </h2>
            <p style={{
              margin: 0,
              color: 'rgba(255,255,255,0.9)',
              fontSize: '16px',
              fontWeight: '500'
            }}>
              {hasExistingChat ? 'История переписки' : 'Начните общение с продавцом'}
            </p>
          </div>

          {/* Connection Status Display */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            padding: '8px 16px',
            borderRadius: '20px',
            fontWeight: '600'
          }}>
            {loading && (
              <div style={{ color: '#64748b', backgroundColor: '#f3f4f6' }}>Загрузка чата...</div>
            )}
            {!loading && !buyerId && (
              <div style={{ color: '#ef4444', backgroundColor: '#fee2e2' }}>Ошибка аутентификации</div>
            )}
            {!loading && buyerId && !thread && (
              <div style={{ color: '#2563eb', backgroundColor: '#dbeafe' }}>Готов к общению</div>
            )}
            {!loading && buyerId && thread && !isConnected && (
              <div style={{ color: '#f97316', backgroundColor: '#ffedd5' }}>Подключение...</div>
            )}
            {!loading && buyerId && thread && isConnected && (
              <div style={{ color: '#059669', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', gap: '10px' }}>
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
      </div>

      {/* Область сообщений */}
      <div style={{
        height: hasExistingChat ? (window.innerWidth >= 768 ? '450px' : '350px') : (window.innerWidth >= 768 ? '250px' : '200px'),
        overflowY: 'auto',
        padding: window.innerWidth >= 768 ? '24px' : '16px',
        backgroundColor: '#f8fafc',
        backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(139, 69, 19, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(210, 105, 30, 0.03) 0%, transparent 50%)'
      }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#64748b' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTop: '3px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
            <span style={{ fontSize: '16px', fontWeight: '500' }}>Загрузка чата...</span>
          </div>
        ) : messages.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', color: '#64748b' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px', opacity: 0.7 }}>💬</div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '600', color: '#374151' }}>
              {hasExistingChat ? 'Сообщений пока нет' : 'Начните разговор с продавцом'}
            </h3>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5', maxWidth: '280px' }}>
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
                    padding: '16px 20px',
                    borderRadius: isOwnMessage ? '24px 24px 8px 24px' : '24px 24px 24px 8px',
                    backgroundColor: isOwnMessage ? '#8B4513' : 'white',
                    color: isOwnMessage ? 'white' : '#374151',
                    fontSize: '16px',
                    lineHeight: '1.5',
                    boxShadow: isOwnMessage ? '0 8px 24px rgba(139, 69, 19, 0.3)' : '0 4px 16px rgba(0, 0, 0, 0.1)',
                    border: isOwnMessage ? 'none' : '1px solid #e2e8f0',
                    position: 'relative',
                    animation: 'messageSlideIn 0.3s ease-out'
                  }}>
                    <div style={{ marginBottom: '8px', wordBreak: 'break-word' }}>{message.message}</div>
                    <div style={{
                      fontSize: '12px',
                      opacity: 0.8,
                      textAlign: 'right',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '4px'
                    }}>
                      <span>{new Date(message.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
                      {isOwnMessage && <span>✓</span>}
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
        background: 'white'
      }}>
        <form onSubmit={handleSendMessage}>
          <div style={{ display: 'flex', gap: window.innerWidth >= 768 ? '16px' : '12px', alignItems: 'flex-end', flexDirection: window.innerWidth >= 640 ? 'row' : 'column' }}>
            <div style={{ flex: 1, width: window.innerWidth >= 640 ? 'auto' : '100%' }}>
              <textarea
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                placeholder={
                  loading ? "Загрузка чата..." :
                  !buyerId ? "Ошибка аутентификации..." :
                  hasExistingChat ? "Введите сообщение..." :
                  defaultMessage || "Напишите сообщение..."
                }
                rows={window.innerWidth >= 768 ? 3 : 2}
                style={{
                  width: '100%', padding: '16px 20px', border: '2px solid #e2e8f0', borderRadius: '16px', fontSize: '16px', outline: 'none', transition: 'all 0.3s ease', resize: 'none', fontFamily: 'inherit', backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  opacity: (sending || chatDisabled) ? 0.7 : 1 // Visual cue for disabled
                }}
                onFocus={(e) => { if (!chatDisabled && !sending) { e.target.style.borderColor = '#8B4513'; e.target.style.boxShadow = '0 4px 16px rgba(139, 69, 19, 0.2)'; } }}
                onBlur={(e) => { if (!chatDisabled && !sending) { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; } }}
                disabled={sending || chatDisabled}
              />
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim() || sending || chatDisabled}
              style={{
                padding: window.innerWidth >= 768 ? '16px 24px' : '14px 20px',
                backgroundColor: '#8B4513',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: (!newMessage.trim() || sending || chatDisabled) ? 'not-allowed' : 'pointer',
                opacity: (!newMessage.trim() || sending || chatDisabled) ? 0.5 : 1,
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 16px rgba(139, 69, 19, 0.3)',
                transform: 'translateY(0)',
                width: window.innerWidth >= 640 ? 'auto' : '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => { if (newMessage.trim() && !sending && !chatDisabled) { e.target.style.backgroundColor = '#A0522D'; e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 24px rgba(139, 69, 19, 0.4)'; } }}
              onMouseLeave={(e) => { if (newMessage.trim() && !sending && !chatDisabled) { e.target.style.backgroundColor = '#8B4513'; e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 16px rgba(139, 69, 19, 0.3)'; } }}
            >
              {sending ? (
                <> <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> <span>Отправка...</span> </>
              ) : (
                <> <span>📤</span> <span>Отправить</span> </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes messageSlideIn {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default ProductChat;
