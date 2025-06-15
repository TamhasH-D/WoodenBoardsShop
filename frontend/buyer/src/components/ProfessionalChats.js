import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import { apiService } from '../services/api';
import { getCurrentBuyerId } from '../utils/auth';

// Профессиональные иконки
const Icons = {
  Search: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/>
      <path d="21 21l-4.35-4.35"/>
    </svg>
  ),
  Message: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
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
      backgroundColor: '#10b981',
      border: '2px solid white',
      position: 'absolute',
      bottom: '2px',
      right: '2px'
    }} />
  ),
  Offline: () => (
    <div style={{
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: '#6b7280',
      border: '2px solid white',
      position: 'absolute',
      bottom: '2px',
      right: '2px'
    }} />
  )
};

function ProfessionalChats() {
  const navigate = useNavigate();
  const { showError } = useNotifications();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buyerId, setBuyerId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'unread'

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

  // Загрузка чатов
  const loadChats = useCallback(async () => {
    if (!buyerId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await apiService.getBuyerChats(buyerId);
      setThreads(result.data || []);
    } catch (error) {
      console.error('Failed to load chats:', error);
      setError(error.message || 'Не удалось загрузить чаты');
    } finally {
      setLoading(false);
    }
  }, [buyerId]);

  // Обработка выбора чата
  const handleThreadSelect = async (thread) => {
    try {
      await apiService.markMessagesAsRead(thread.id, buyerId, 'buyer');
      loadChats(); // Обновляем список чатов
      navigate(`/chats/${thread.id}`);
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
      navigate(`/chats/${thread.id}`);
    }
  };

  useEffect(() => {
    if (buyerId) {
      loadChats();
    }
  }, [buyerId, loadChats]);

  // Фильтрация чатов
  const filteredThreads = threads.filter(thread => {
    const matchesSearch = !searchQuery || 
      (thread.last_message && thread.last_message.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (thread.seller_id && thread.seller_id.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = filterType === 'all' || 
      (filterType === 'unread' && thread.unread_count > 0);
    
    return matchesSearch && matchesFilter;
  });

  // Форматирование времени
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('ru-RU', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
    }
  };

  return (
    <div style={{
      height: '100vh',
      backgroundColor: '#f8fafc',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Заголовок */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h1 style={{ 
            margin: 0, 
            fontSize: '28px', 
            fontWeight: '700', 
            color: '#0f172a',
            letterSpacing: '-0.025em'
          }}>
            Сообщения
          </h1>
          <p style={{ 
            margin: '4px 0 0 0', 
            fontSize: '14px', 
            color: '#64748b' 
          }}>
            {filteredThreads.length} из {threads.length} чатов
          </p>
        </div>
        <button
          onClick={loadChats}
          disabled={loading}
          style={{
            padding: '10px 16px',
            backgroundColor: loading ? '#f1f5f9' : '#3b82f6',
            color: loading ? '#64748b' : 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {loading ? (
            <>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid #cbd5e1',
                borderTop: '2px solid #64748b',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              Обновление...
            </>
          ) : (
            'Обновить'
          )}
        </button>
      </div>

      {/* Поиск и фильтры */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '16px 24px'
      }}>
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <div style={{
            position: 'relative',
            flex: 1
          }}>
            <div style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#64748b'
            }}>
              <Icons.Search />
            </div>
            <input
              type="text"
              placeholder="Поиск по чатам..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 44px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.2s ease',
                backgroundColor: '#fafbfc'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.backgroundColor = 'white';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.backgroundColor = '#fafbfc';
              }}
            />
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          gap: '8px'
        }}>
          <button
            onClick={() => setFilterType('all')}
            style={{
              padding: '8px 16px',
              backgroundColor: filterType === 'all' ? '#3b82f6' : 'transparent',
              color: filterType === 'all' ? 'white' : '#64748b',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Все чаты
          </button>
          <button
            onClick={() => setFilterType('unread')}
            style={{
              padding: '8px 16px',
              backgroundColor: filterType === 'unread' ? '#3b82f6' : 'transparent',
              color: filterType === 'unread' ? 'white' : '#64748b',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
          >
            Непрочитанные
            {threads.filter(t => t.unread_count > 0).length > 0 && (
              <span style={{
                marginLeft: '6px',
                backgroundColor: filterType === 'unread' ? 'rgba(255,255,255,0.2)' : '#ef4444',
                color: filterType === 'unread' ? 'white' : 'white',
                padding: '2px 6px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: '600'
              }}>
                {threads.filter(t => t.unread_count > 0).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Основная область */}
      <div style={{
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {error && (
          <div style={{
            margin: '16px 24px',
            padding: '16px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              !
            </div>
            <div>
              <strong style={{ color: '#dc2626', fontSize: '14px' }}>Ошибка загрузки</strong>
              <p style={{ margin: '4px 0 0 0', color: '#7f1d1d', fontSize: '13px' }}>{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
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
              Загрузка чатов...
            </p>
          </div>
        ) : filteredThreads.length > 0 ? (
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0'
          }}>
            {filteredThreads.map((thread, index) => (
              <div
                key={thread.id}
                onClick={() => handleThreadSelect(thread)}
                style={{
                  padding: '16px 24px',
                  borderBottom: index < filteredThreads.length - 1 ? '1px solid #f1f5f9' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  backgroundColor: 'white',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  {/* Аватар */}
                  <div style={{
                    position: 'relative',
                    flexShrink: 0
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: '#e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#64748b',
                      fontSize: '18px'
                    }}>
                      <Icons.User />
                    </div>
                    <Icons.Offline />
                  </div>

                  {/* Информация о чате */}
                  <div style={{
                    flex: 1,
                    minWidth: 0
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '4px'
                    }}>
                      <h3 style={{
                        margin: 0,
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#0f172a',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        Продавец
                      </h3>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexShrink: 0,
                        marginLeft: '12px'
                      }}>
                        <span style={{
                          fontSize: '12px',
                          color: '#64748b'
                        }}>
                          {formatTime(thread.updated_at || thread.created_at)}
                        </span>
                        {thread.unread_count > 0 && (
                          <div style={{
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            borderRadius: '50%',
                            minWidth: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: '600'
                          }}>
                            {thread.unread_count > 99 ? '99+' : thread.unread_count}
                          </div>
                        )}
                      </div>
                    </div>

                    <p style={{
                      margin: 0,
                      fontSize: '13px',
                      color: '#64748b',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      ID: {thread.seller_id?.substring(0, 8)}...
                    </p>

                    {thread.last_message && (
                      <p style={{
                        margin: '6px 0 0 0',
                        fontSize: '14px',
                        color: thread.unread_count > 0 ? '#374151' : '#64748b',
                        fontWeight: thread.unread_count > 0 ? '500' : '400',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        lineHeight: '1.4'
                      }}>
                        {thread.last_message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            padding: '40px 24px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px'
            }}>
              <Icons.Message />
            </div>
            <h3 style={{
              margin: 0,
              marginBottom: '8px',
              fontSize: '20px',
              fontWeight: '600',
              color: '#0f172a'
            }}>
              {searchQuery || filterType === 'unread' ? 'Чаты не найдены' : 'Нет чатов'}
            </h3>
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: '#64748b',
              maxWidth: '300px',
              lineHeight: '1.5',
              marginBottom: '24px'
            }}>
              {searchQuery || filterType === 'unread'
                ? 'Попробуйте изменить критерии поиска или фильтры'
                : 'Начните общение с продавцами через страницы товаров'
              }
            </p>
            {!searchQuery && filterType === 'all' && (
              <button
                onClick={() => navigate('/products')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#2563eb';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#3b82f6';
                }}
              >
                Посмотреть товары
              </button>
            )}
          </div>
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

export default ProfessionalChats;
