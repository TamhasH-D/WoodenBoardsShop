import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiService } from '../../services/api';
import websocketManager from '../../utils/websocketManager';
import { getCurrentBuyerId } from '../../utils/auth';


const ChatWindow = () => {
  const { threadId } = useParams();
  const { showError, showInfo } = useNotifications();

  // Состояние
  const [threadInfo, setThreadInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [buyerId, setBuyerId] = useState(null);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  // Refs
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messagesRef = useRef(new Map());

  // Инициализация buyerId
  useEffect(() => {
    const initializeBuyer = async () => {
      try {
        const realBuyerId = await getCurrentBuyerId();
        setBuyerId(realBuyerId);
        console.log('[ChatWindow] Buyer ID initialized:', realBuyerId);
      } catch (error) {
        console.error('[ChatWindow] Failed to get buyer ID:', error);
        showError('Ошибка аутентификации');
      }
    };

    initializeBuyer();
  }, [showError]);

  // Обработчик WebSocket сообщений
  const handleWebSocketMessage = (data) => {
    console.log('[ChatWindow] WebSocket message received:', data);

    if (data.type === 'message') {
      const messageId = data.message_id || `ws-${Date.now()}`;

      // Проверяем дублирование
      if (messagesRef.current.has(messageId)) {
        console.log('[ChatWindow] Duplicate message ignored:', messageId);
        return;
      }

      const newMessage = {
        id: messageId,
        message: data.message,
        sender_id: data.sender_id,
        sender_type: data.sender_type,
        created_at: data.timestamp || new Date().toISOString(),
        thread_id: data.thread_id,
        buyer_id: data.sender_type === 'buyer' ? data.sender_id : null,
        seller_id: data.sender_type === 'seller' ? data.sender_id : null,
        is_read_by_buyer: data.sender_type === 'buyer',
        is_read_by_seller: data.sender_type === 'seller'
      };

      messagesRef.current.set(messageId, newMessage);

      setMessages(prev => {
        const exists = prev.some(msg => msg.id === messageId);
        if (exists) return prev;
        return [...prev, newMessage];
      });
    } else if (data.type === 'typing' && data.sender_id !== buyerId) {
      setOtherUserTyping(true);
      setTimeout(() => setOtherUserTyping(false), 3000);
    } else if (data.type === 'stop_typing' && data.sender_id !== buyerId) {
      setOtherUserTyping(false);
    } else if (data.type === 'user_joined' && data.sender_id !== buyerId) {
      showInfo('Продавец подключился к чату');
    } else if (data.type === 'user_left' && data.sender_id !== buyerId) {
      showInfo('Продавец покинул чат');
    }
  };

  // Загрузка данных чата
  const loadChatData = async () => {
    if (!threadId || !buyerId) return;

    try {
      setIsLoading(true);

      // Загружаем информацию о треде
      const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const threadResponse = await fetch(`${apiBaseUrl}/api/v1/chat-threads/${threadId}`);
      if (threadResponse.ok) {
        const threadData = await threadResponse.json();
        setThreadInfo(threadData.data);
      }

      // Загружаем сообщения
      const messagesResult = await apiService.getChatMessages(threadId, 0, 20);
      const loadedMessages = messagesResult.data || [];

      // Обновляем ref для предотвращения дублирования
      messagesRef.current.clear();
      loadedMessages.forEach(msg => {
        messagesRef.current.set(msg.id, msg);
      });

      setMessages(loadedMessages);
      setHasMoreMessages(loadedMessages.length === 20);
      setCurrentPage(0);

      // Подключаемся к WebSocket
      websocketManager.addMessageHandler(threadId, handleWebSocketMessage);
      websocketManager.connect(threadId, buyerId, 'buyer', setIsConnected);

    } catch (error) {
      console.error('[ChatWindow] Error loading chat data:', error);
      showError('Не удалось загрузить чат');
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузка дополнительных сообщений
  const loadMoreMessages = async () => {
    if (!threadId || loadingMore || !hasMoreMessages) return;

    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      const messagesResult = await apiService.getChatMessages(threadId, nextPage * 20, 20);
      const newMessages = messagesResult.data || [];

      if (newMessages.length > 0) {
        // Добавляем новые сообщения в начало списка
        setMessages(prev => [...newMessages, ...prev]);
        setCurrentPage(nextPage);
        setHasMoreMessages(newMessages.length === 20);

        // Обновляем ref
        newMessages.forEach(msg => {
          messagesRef.current.set(msg.id, msg);
        });
      } else {
        setHasMoreMessages(false);
      }
    } catch (error) {
      console.error('[ChatWindow] Error loading more messages:', error);
      showError('Не удалось загрузить сообщения');
    } finally {
      setLoadingMore(false);
    }
  };

  // Отправка сообщения
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !buyerId || !threadId) return;

    const messageText = newMessage.trim();
    setSending(true);
    setNewMessage('');

    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Отправляем через API
      const messageData = {
        id: messageId,
        message: messageText,
        is_read_by_buyer: true,
        is_read_by_seller: false,
        thread_id: threadId,
        buyer_id: buyerId,
        seller_id: null
      };

      console.log('[ChatWindow] Sending message via API:', messageData);
      const result = await apiService.sendMessage(messageData);

      if (result) {
        // Отправляем через WebSocket
        const wsMessage = {
          type: 'message',
          message: messageText,
          message_id: messageId,
          sender_id: buyerId,
          sender_type: 'buyer',
          thread_id: threadId,
          timestamp: new Date().toISOString()
        };

        const sent = websocketManager.sendMessage(threadId, wsMessage);
        if (!sent) {
          console.warn('[ChatWindow] Failed to send via WebSocket');
        }
      } else {
        throw new Error('API call failed');
      }
    } catch (error) {
      console.error('[ChatWindow] Error sending message:', error);
      showError('Не удалось отправить сообщение');
      setNewMessage(messageText); // Восстанавливаем текст
    } finally {
      setSending(false);
    }
  };

  // Обработка набора текста
  const handleTyping = () => {
    if (!threadId || !buyerId || !isConnected) return;

    if (!isTyping) {
      setIsTyping(true);
      const typingMessage = {
        type: 'typing',
        sender_id: buyerId,
        thread_id: threadId
      };
      websocketManager.sendMessage(threadId, typingMessage);
    }

    // Сбрасываем таймер
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Останавливаем индикатор через 2 секунды
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        const stopTypingMessage = {
          type: 'stop_typing',
          sender_id: buyerId,
          thread_id: threadId
        };
        websocketManager.sendMessage(threadId, stopTypingMessage);
      }
    }, 2000);
  };

  // Автопрокрутка к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Загружаем данные чата при изменении buyerId или threadId
  useEffect(() => {
    if (buyerId && threadId) {
      loadChatData();
    }
  }, [buyerId, threadId]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (threadId) {
        websocketManager.removeMessageHandler(threadId, handleWebSocketMessage);
        websocketManager.disconnect(threadId);
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [threadId]);



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
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '20px 0',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => window.history.back()}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: '#f3f4f6',
                border: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '16px'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#f3f4f6';
              }}
            >
              ←
            </button>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}>
              🏪
            </div>
            <div>
              <h2 style={{
                margin: 0,
                color: '#111827',
                fontSize: '24px',
                fontWeight: '800',
                letterSpacing: '-0.025em'
              }}>
                Продавец
              </h2>
              <p style={{
                margin: '4px 0 0 0',
                color: '#6b7280',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                ID: {threadInfo.seller_id.substring(0, 8)}...
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
                {isConnected ? 'Подключен' : 'Подключение...'}
              </span>
            </div>

            {/* Typing indicator */}
            {otherUserTyping && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '20px',
                backgroundColor: '#f0f9ff',
                border: '1px solid #bae6fd'
              }}>
                <div style={{
                  display: 'flex',
                  gap: '2px'
                }}>
                  <div style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    backgroundColor: '#0ea5e9',
                    animation: 'typing 1.4s infinite ease-in-out'
                  }} />
                  <div style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    backgroundColor: '#0ea5e9',
                    animation: 'typing 1.4s infinite ease-in-out 0.2s'
                  }} />
                  <div style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    backgroundColor: '#0ea5e9',
                    animation: 'typing 1.4s infinite ease-in-out 0.4s'
                  }} />
                </div>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#0369a1'
                }}>
                  печатает...
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{
        flex: 1,
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Messages Container */}
        <div style={{
          flex: 1,
          backgroundColor: 'white',
          borderRadius: '24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          marginBottom: '24px'
        }}>
          {/* Messages Area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            background: 'linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%)',
            position: 'relative'
          }}>
          {/* Load More Messages Button */}
          {hasMoreMessages && messages.length > 0 && (
            <div style={{
              textAlign: 'center',
              marginBottom: '24px',
              position: 'sticky',
              top: '0',
              zIndex: 5,
              paddingTop: '16px'
            }}>
              <button
                onClick={loadMoreMessages}
                disabled={loadingMore}
                style={{
                  padding: '12px 24px',
                  backgroundColor: loadingMore ? '#f3f4f6' : 'white',
                  color: loadingMore ? '#9ca3af' : '#2563eb',
                  border: '2px solid #e5e7eb',
                  borderRadius: '24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: loadingMore ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  margin: '0 auto'
                }}
                onMouseEnter={(e) => {
                  if (!loadingMore) {
                    e.target.style.backgroundColor = '#f8fafc';
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loadingMore) {
                    e.target.style.backgroundColor = 'white';
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  }
                }}
              >
                {loadingMore ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #e5e7eb',
                      borderTop: '2px solid #9ca3af',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Загрузка истории...
                  </>
                ) : (
                  <>
                    ⬆️ Загрузить предыдущие сообщения
                  </>
                )}
              </button>
            </div>
          )}

          {messages.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '400px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '64px',
                marginBottom: '24px',
                opacity: 0.6,
                animation: 'float 3s ease-in-out infinite'
              }}>
                💬
              </div>
              <h3 style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '12px'
              }}>
                Начните разговор
              </h3>
              <p style={{
                margin: 0,
                fontSize: '16px',
                color: '#6b7280',
                maxWidth: '400px',
                lineHeight: '1.6'
              }}>
                Отправьте первое сообщение продавцу, чтобы начать обсуждение товара
              </p>
            </div>
          ) : (
            messages.map((message, index) => {
              // Правильная логика: сравниваем с текущим buyerId
              const isOwnMessage = message.buyer_id === buyerId;
              const prevMessage = messages[index - 1];
              const showAvatar = !prevMessage || prevMessage.buyer_id !== message.buyer_id;
              const isLastInGroup = !messages[index + 1] || messages[index + 1].buyer_id !== message.buyer_id;

              return (
                <div
                  key={message.id}
                  style={{
                    display: 'flex',
                    justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                    marginBottom: isLastInGroup ? '24px' : '4px',
                    alignItems: 'flex-end',
                    gap: '12px'
                  }}
                >
                  {/* Avatar for other user */}
                  {!isOwnMessage && (
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      flexShrink: 0,
                      visibility: showAvatar ? 'visible' : 'hidden'
                    }}>
                      🏪
                    </div>
                  )}

                  <div style={{
                    maxWidth: '70%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isOwnMessage ? 'flex-end' : 'flex-start'
                  }}>
                    <div style={{
                      padding: '16px 20px',
                      borderRadius: isOwnMessage
                        ? '20px 20px 4px 20px'
                        : '20px 20px 20px 4px',
                      backgroundColor: isOwnMessage ? '#2563eb' : 'white',
                      color: isOwnMessage ? 'white' : '#374151',
                      fontSize: '16px',
                      lineHeight: '1.5',
                      boxShadow: isOwnMessage
                        ? '0 4px 16px rgba(37, 99, 235, 0.3)'
                        : '0 4px 16px rgba(0, 0, 0, 0.1)',
                      border: isOwnMessage ? 'none' : '1px solid #e5e7eb',
                      position: 'relative',
                      wordBreak: 'break-word'
                    }}>
                      <div style={{ marginBottom: '8px' }}>{message.message}</div>
                      <div style={{
                        fontSize: '12px',
                        opacity: 0.8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px'
                      }}>
                        <span>
                          {new Date(message.created_at).toLocaleTimeString('ru-RU', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {isOwnMessage && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            {message.sending ? (
                              <div style={{
                                width: '12px',
                                height: '12px',
                                border: '2px solid rgba(255,255,255,0.3)',
                                borderTop: '2px solid white',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                              }} />
                            ) : message.failed ? (
                              <span style={{
                                fontSize: '10px',
                                opacity: 0.8,
                                color: '#ef4444'
                              }}>
                                ❌
                              </span>
                            ) : (
                              <span style={{
                                fontSize: '10px',
                                opacity: 0.8,
                                color: message.is_read_by_seller ? '#10b981' : '#6b7280'
                              }}>
                                {message.is_read_by_seller ? '✓✓' : '✓'}
                              </span>
                            )}
                            <span style={{
                              fontSize: '8px',
                              opacity: 0.6,
                              color: message.failed ? '#ef4444' : 'inherit'
                            }}>
                              {message.sending ? 'отправка...' :
                               message.failed ? 'ошибка' :
                               message.is_read_by_seller ? 'прочитано' : 'доставлено'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Spacer for own messages to maintain alignment */}
                  {isOwnMessage && (
                    <div style={{ width: '32px', flexShrink: 0 }} />
                  )}
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

          {/* Message Input Area */}
          <div style={{
            padding: '24px',
            borderTop: '1px solid #e5e7eb',
            backgroundColor: 'white'
          }}>
            <form onSubmit={handleSendMessage}>
              <div style={{
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-end'
              }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <textarea
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    placeholder={isConnected ? "Напишите сообщение..." : "Подключение к чату..."}
                    rows={1}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '20px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      resize: 'none',
                      fontFamily: 'inherit',
                      backgroundColor: isConnected ? 'white' : '#f9fafb',
                      minHeight: '56px',
                      maxHeight: '120px',
                      lineHeight: '1.5'
                    }}
                    onFocus={(e) => {
                      if (isConnected) {
                        e.target.style.borderColor = '#2563eb';
                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                      }
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    disabled={false}
                  />

                  {/* Character counter */}
                  <div style={{
                    position: 'absolute',
                    bottom: '-20px',
                    right: '8px',
                    fontSize: '12px',
                    color: newMessage.length > 500 ? '#ef4444' : '#9ca3af'
                  }}>
                    {newMessage.length}/1000
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!newMessage.trim() || !isConnected || newMessage.length > 1000}
                  style={{
                    width: '56px',
                    height: '56px',
                    backgroundColor: (!newMessage.trim() || !isConnected) ? '#9ca3af' : '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    fontSize: '20px',
                    cursor: (!newMessage.trim() || !isConnected) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: (!newMessage.trim() || !isConnected) ? 'none' : '0 4px 16px rgba(37, 99, 235, 0.3)',
                    transform: 'scale(1)',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    if (newMessage.trim() && isConnected) {
                      e.target.style.backgroundColor = '#1d4ed8';
                      e.target.style.transform = 'scale(1.05)';
                      e.target.style.boxShadow = '0 8px 24px rgba(37, 99, 235, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (newMessage.trim() && isConnected) {
                      e.target.style.backgroundColor = '#2563eb';
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = '0 4px 16px rgba(37, 99, 235, 0.3)';
                    }
                  }}
                >
                  {(!newMessage.trim() || !isConnected) ? '✉️' : '🚀'}
                </button>
              </div>

              {/* Quick actions */}
              <div style={{
                display: 'flex',
                gap: '8px',
                marginTop: '16px',
                flexWrap: 'wrap'
              }}>
                {['Здравствуйте!', 'Какая цена?', 'Есть ли доставка?', 'Можно посмотреть?'].map((quickText) => (
                  <button
                    key={quickText}
                    type="button"
                    onClick={() => setNewMessage(quickText)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      border: '1px solid #e5e7eb',
                      borderRadius: '20px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontWeight: '500'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#e5e7eb';
                      e.target.style.borderColor = '#d1d5db';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#f3f4f6';
                      e.target.style.borderColor = '#e5e7eb';
                    }}
                  >
                    {quickText}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-10px); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ChatWindow;
