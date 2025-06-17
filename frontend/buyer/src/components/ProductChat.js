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
      borderRadius: '20px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      background: 'white'
    }}>
      {/* Заголовок чата */}
      <div style={{
        padding: window.innerWidth >= 768 ? '24px 32px' : '20px 24px',
        borderBottom: '1px solid #f1f5f9',
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        color: 'white',
        position: 'relative'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <div style={{ flex: 1 }}>
            <h2 style={{
              margin: '0 0 6px 0',
              fontSize: window.innerWidth >= 768 ? '22px' : '20px',
              fontWeight: '600',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              letterSpacing: '-0.025em'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px'
              }}>
                💬
              </div>
              Связь с продавцом
            </h2>
            <p style={{
              margin: 0,
              color: 'rgba(255,255,255,0.8)',
              fontSize: '14px',
              fontWeight: '400'
            }}>
              {hasExistingChat ? 'Продолжите переписку' : 'Задайте вопрос о товаре'}
            </p>
          </div>

          {/* Статус чата - только при ошибках */}
          {(!loading && !buyerId) && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              padding: '8px 16px',
              borderRadius: '20px',
              fontWeight: '600',
              color: '#ef4444',
              backgroundColor: 'rgba(255,255,255,0.2)'
            }}>
              ⚠️ Ошибка аутентификации
            </div>
          )}

        </div>
      </div>

      {/* Область сообщений */}
      <div style={{
        height: hasExistingChat ? (window.innerWidth >= 768 ? '400px' : '320px') : (window.innerWidth >= 768 ? '280px' : '240px'),
        overflowY: 'auto',
        padding: window.innerWidth >= 768 ? '24px' : '16px',
        backgroundColor: '#fafafa',
        backgroundImage: 'linear-gradient(135deg, #fafafa 0%, #f8fafc 100%)'
      }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#64748b' }}>
            <div style={{
              width: '24px',
              height: '24px',
              border: '2px solid #e2e8f0',
              borderTop: '2px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '12px'
            }} />
            <span style={{ fontSize: '14px', fontWeight: '500' }}>Загрузка...</span>
          </div>
        ) : messages.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', color: '#64748b' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #e2e8f0, #cbd5e1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              marginBottom: '16px'
            }}>
              💬
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#374151' }}>
              {hasExistingChat ? 'Сообщений пока нет' : 'Свяжитесь с продавцом'}
            </h3>
            <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.4', maxWidth: '240px', color: '#64748b' }}>
              Обсудите детали товара, условия доставки или договоритесь о цене
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              // Правильная логика: сравниваем с текущим buyerId
              const isOwnMessage = message.buyer_id === buyerId;
              return (
                <div key={message.id} style={{ display: 'flex', justifyContent: isOwnMessage ? 'flex-end' : 'flex-start', marginBottom: '12px' }}>
                  <div style={{
                    maxWidth: window.innerWidth >= 768 ? '75%' : '85%',
                    padding: '12px 16px',
                    borderRadius: isOwnMessage ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    backgroundColor: isOwnMessage ? '#3b82f6' : 'white',
                    color: isOwnMessage ? 'white' : '#1f2937',
                    fontSize: '15px',
                    lineHeight: '1.4',
                    boxShadow: isOwnMessage ? '0 4px 12px rgba(59, 130, 246, 0.25)' : '0 2px 8px rgba(0, 0, 0, 0.08)',
                    border: isOwnMessage ? 'none' : '1px solid #e5e7eb',
                    position: 'relative',
                    animation: 'messageSlideIn 0.2s ease-out'
                  }}>
                    <div style={{ marginBottom: '6px', wordBreak: 'break-word' }}>{message.message}</div>
                    <div style={{
                      fontSize: '11px',
                      opacity: isOwnMessage ? 0.8 : 0.6,
                      textAlign: 'right',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '4px'
                    }}>
                      <span>{new Date(message.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
                      {isOwnMessage && <span style={{ fontSize: '10px' }}>✓</span>}
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
        padding: window.innerWidth >= 768 ? '20px 24px' : '16px 20px',
        borderTop: '1px solid #f1f5f9',
        background: 'white'
      }}>
        <form onSubmit={handleSendMessage}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <textarea
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                placeholder={
                  loading ? "Загрузка..." :
                  !buyerId ? "Ошибка аутентификации..." :
                  hasExistingChat ? "Введите сообщение..." :
                  defaultMessage || "Напишите сообщение..."
                }
                rows={2}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  resize: 'none',
                  fontFamily: 'inherit',
                  backgroundColor: '#fafafa',
                  opacity: (sending || chatDisabled) ? 0.7 : 1
                }}
                onFocus={(e) => {
                  if (!chatDisabled && !sending) {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.backgroundColor = 'white';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }
                }}
                onBlur={(e) => {
                  if (!chatDisabled && !sending) {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.backgroundColor = '#fafafa';
                    e.target.style.boxShadow = 'none';
                  }
                }}
                disabled={sending || chatDisabled}
              />
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim() || sending || chatDisabled}
              style={{
                padding: '12px 20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: (!newMessage.trim() || sending || chatDisabled) ? 'not-allowed' : 'pointer',
                opacity: (!newMessage.trim() || sending || chatDisabled) ? 0.5 : 1,
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                minWidth: '100px'
              }}
              onMouseEnter={(e) => {
                if (newMessage.trim() && !sending && !chatDisabled) {
                  e.target.style.backgroundColor = '#2563eb';
                  e.target.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (newMessage.trim() && !sending && !chatDisabled) {
                  e.target.style.backgroundColor = '#3b82f6';
                  e.target.style.transform = 'translateY(0)';
                }
              }}
            >
              {sending ? (
                <>
                  <div style={{
                    width: '14px',
                    height: '14px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <span>Отправка</span>
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22,2 15,22 11,13 2,9"></polygon>
                  </svg>
                  <span>Отправить</span>
                </>
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
