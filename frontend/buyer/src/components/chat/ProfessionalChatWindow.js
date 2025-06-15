import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiService } from '../../services/api';
import { getCurrentBuyerId } from '../../utils/auth';
import { getChatWebSocketUrl } from '../../utils/websocket';

// Профессиональные иконки
const Icons = {
  ArrowLeft: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5"/>
      <path d="M12 19l-7-7 7-7"/>
    </svg>
  ),
  Send: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22,2 15,22 11,13 2,9 22,2"/>
    </svg>
  ),
  User: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Online: () => (
    <div style={{
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: '#10b981'
    }} />
  ),
  Offline: () => (
    <div style={{
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: '#6b7280'
    }} />
  ),
  MoreVertical: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="1"/>
      <circle cx="12" cy="5" r="1"/>
      <circle cx="12" cy="19" r="1"/>
    </svg>
  )
};

function ProfessionalChatWindow() {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const { showError } = useNotifications();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [threadInfo, setThreadInfo] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [buyerId, setBuyerId] = useState(null);
  const [sending, setSending] = useState(false);

  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isConnectingRef = useRef(false);

  // Получение ID покупателя
  useEffect(() => {
    const fetchBuyerId = async () => {
      try {
        const id = await getCurrentBuyerId();
        setBuyerId(id);
      } catch (error) {
        console.error('Failed to get buyer ID:', error);
        showError('Не удалось получить ID покупателя');
      }
    };

    fetchBuyerId();
  }, [showError]);

  // Загрузка данных чата
  const loadChatData = useCallback(async () => {
    if (!threadId || !buyerId) return;

    try {
      setIsLoading(true);
      
      // Загружаем информацию о треде
      const threadsResult = await apiService.getBuyerChats(buyerId);
      const thread = threadsResult.data?.find(t => t.id === threadId);
      
      if (!thread) {
        showError('Чат не найден');
        navigate('/chats');
        return;
      }
      
      setThreadInfo(thread);

      // Загружаем сообщения
      const messagesResult = await apiService.getChatMessages(threadId);
      setMessages(messagesResult.data || []);

      // Отмечаем сообщения как прочитанные
      await apiService.markMessagesAsRead(threadId, buyerId, 'buyer');
      
    } catch (error) {
      console.error('Failed to load chat data:', error);
      showError('Не удалось загрузить данные чата');
    } finally {
      setIsLoading(false);
    }
  }, [threadId, buyerId, showError, navigate]);

  // WebSocket подключение
  const connectWebSocket = useCallback(() => {
    if (!threadId || !buyerId || isConnectingRef.current) return;

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
        
        if (data.type === 'message') {
          setMessages(prev => {
            const exists = prev.some(msg => msg.id === data.message_id);
            if (exists) return prev;
            
            const newMsg = {
              id: data.message_id,
              message: data.message,
              buyer_id: data.sender_type === 'buyer' ? data.sender_id : null,
              seller_id: data.sender_type === 'seller' ? data.sender_id : null,
              created_at: data.timestamp,
              thread_id: threadId
            };
            
            return [...prev, newMsg].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
          });
        } else if (data.type === 'typing') {
          setOtherUserTyping(true);
          setTimeout(() => setOtherUserTyping(false), 3000);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket отключен');
      setIsConnected(false);
      isConnectingRef.current = false;
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
      isConnectingRef.current = false;
    };
  }, [threadId, buyerId]);

  // Отправка сообщения
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !threadInfo || sending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const messageData = {
        id: messageId,
        thread_id: threadId,
        message: messageText,
        buyer_id: buyerId,
        seller_id: null
      };

      await apiService.sendMessage(messageData);

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
        wsRef.current.send(JSON.stringify(wsMessage));
      }
      
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      showError('Не удалось отправить сообщение');
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  // Обработка набора текста
  const handleTyping = () => {
    if (!isTyping && isConnected && wsRef.current) {
      setIsTyping(true);
      wsRef.current.send(JSON.stringify({ type: 'typing' }));
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  // Прокрутка к последнему сообщению
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (buyerId) {
      loadChatData();
    }
  }, [buyerId, loadChatData]);

  useEffect(() => {
    if (threadInfo && buyerId && !wsRef.current) {
      connectWebSocket();
    }
  }, [threadInfo, buyerId, connectWebSocket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid #e2e8f0',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ color: '#64748b', fontSize: '16px', margin: 0 }}>
            Загрузка чата...
          </p>
        </div>
      </div>
    );
  }

  if (!threadInfo) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px'
        }}>
          <h2 style={{ color: '#374151', marginBottom: '16px' }}>Чат не найден</h2>
          <button
            onClick={() => navigate('/chats')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Вернуться к чатам
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      height: '100vh',
      backgroundColor: '#f8fafc',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Заголовок чата */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <button
            onClick={() => navigate('/chats')}
            style={{
              padding: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#64748b',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f1f5f9';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            <Icons.ArrowLeft />
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              position: 'relative'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b'
              }}>
                <Icons.User />
              </div>
              <div style={{
                position: 'absolute',
                bottom: '2px',
                right: '2px'
              }}>
                <Icons.Offline />
              </div>
            </div>

            <div>
              <h2 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: '600',
                color: '#0f172a'
              }}>
                Продавец
              </h2>
              <p style={{
                margin: '2px 0 0 0',
                fontSize: '12px',
                color: '#64748b'
              }}>
                ID: {threadInfo.seller_id?.substring(0, 8)}...
              </p>
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: isConnected ? '#10b981' : '#ef4444',
            fontWeight: '500'
          }}>
            {isConnected ? <Icons.Online /> : <Icons.Offline />}
            {isConnected ? 'Подключен' : 'Отключен'}
          </div>

          <button
            style={{
              padding: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#64748b',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f1f5f9';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            <Icons.MoreVertical />
          </button>
        </div>
      </div>

      {/* Область сообщений */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          backgroundColor: '#ffffff'
        }}>
          {messages.length === 0 ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b'
              }}>
                <Icons.User />
              </div>
              <p style={{
                color: '#64748b',
                fontSize: '16px',
                margin: 0,
                textAlign: 'center'
              }}>
                Начните разговор с продавцом
              </p>
            </div>
          ) : (
            <>
              {messages.map((message, index) => {
                const isOwnMessage = message.buyer_id === buyerId;
                const showAvatar = index === 0 ||
                  messages[index - 1].buyer_id !== message.buyer_id ||
                  messages[index - 1].seller_id !== message.seller_id;

                return (
                  <div
                    key={message.id}
                    style={{
                      display: 'flex',
                      justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                      marginBottom: '16px',
                      alignItems: 'flex-end',
                      gap: '8px'
                    }}
                  >
                    {!isOwnMessage && (
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: showAvatar ? '#e2e8f0' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64748b',
                        fontSize: '14px',
                        flexShrink: 0
                      }}>
                        {showAvatar && <Icons.User />}
                      </div>
                    )}

                    <div style={{
                      maxWidth: '70%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isOwnMessage ? 'flex-end' : 'flex-start'
                    }}>
                      <div style={{
                        padding: '12px 16px',
                        borderRadius: '18px',
                        backgroundColor: isOwnMessage ? '#3b82f6' : '#f1f5f9',
                        color: isOwnMessage ? 'white' : '#0f172a',
                        fontSize: '15px',
                        lineHeight: '1.4',
                        wordBreak: 'break-word'
                      }}>
                        {message.message}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: '#64748b',
                        marginTop: '4px',
                        paddingLeft: isOwnMessage ? '0' : '4px',
                        paddingRight: isOwnMessage ? '4px' : '0'
                      }}>
                        {new Date(message.created_at).toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>

                    {isOwnMessage && (
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: showAvatar ? '#3b82f6' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '14px',
                        flexShrink: 0
                      }}>
                        {showAvatar && <Icons.User />}
                      </div>
                    )}
                  </div>
                );
              })}

              {otherUserTyping && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  marginBottom: '16px',
                  alignItems: 'flex-end',
                  gap: '8px'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748b',
                    fontSize: '14px'
                  }}>
                    <Icons.User />
                  </div>
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '18px',
                    backgroundColor: '#f1f5f9',
                    color: '#64748b',
                    fontSize: '14px',
                    fontStyle: 'italic'
                  }}>
                    Продавец печатает...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Форма отправки сообщения */}
        <div style={{
          backgroundColor: 'white',
          borderTop: '1px solid #e2e8f0',
          padding: '16px 24px'
        }}>
          <form onSubmit={handleSendMessage} style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-end'
          }}>
            <div style={{
              flex: 1,
              position: 'relative'
            }}>
              <textarea
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                placeholder="Введите сообщение..."
                disabled={!isConnected}
                style={{
                  width: '100%',
                  minHeight: '44px',
                  maxHeight: '120px',
                  padding: '12px 16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '22px',
                  fontSize: '15px',
                  outline: 'none',
                  resize: 'none',
                  fontFamily: 'inherit',
                  lineHeight: '1.4',
                  transition: 'all 0.2s ease',
                  backgroundColor: !isConnected ? '#f8fafc' : 'white'
                }}
                onFocus={(e) => {
                  if (isConnected) {
                    e.target.style.borderColor = '#3b82f6';
                  }
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim() || !isConnected || sending}
              style={{
                padding: '12px',
                backgroundColor: (!newMessage.trim() || !isConnected || sending) ? '#e2e8f0' : '#3b82f6',
                color: (!newMessage.trim() || !isConnected || sending) ? '#64748b' : 'white',
                border: 'none',
                borderRadius: '50%',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: (!newMessage.trim() || !isConnected || sending) ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                if (newMessage.trim() && isConnected && !sending) {
                  e.target.style.backgroundColor = '#2563eb';
                }
              }}
              onMouseLeave={(e) => {
                if (newMessage.trim() && isConnected && !sending) {
                  e.target.style.backgroundColor = '#3b82f6';
                }
              }}
            >
              {sending ? (
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #64748b',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              ) : (
                <Icons.Send />
              )}
            </button>
          </form>
        </div>
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

export default ProfessionalChatWindow;
