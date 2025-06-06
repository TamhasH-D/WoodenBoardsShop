import { useState, useCallback, useMemo } from 'react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { apiService } from '../services/api';

// Mock buyer ID - in real app this would come from authentication
const MOCK_BUYER_ID = '81f81c96-c56e-4b36-aec3-656f3576d09f';

function Chats() {
  const [page, setPage] = useState(0);
  const [selectedThread, setSelectedThread] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  // Memoize the selected thread ID to prevent unnecessary re-renders
  const selectedThreadId = useMemo(() => selectedThread?.id || null, [selectedThread?.id]);

  // Create stable API functions to prevent infinite loops
  const chatsApiFunction = useMemo(() => () => apiService.getBuyerChats(MOCK_BUYER_ID, page, 10), [page]);
  const { data, loading, error, refetch } = useApi(chatsApiFunction, [page]);

  // Create stable messages API function
  const messagesApiFunction = useMemo(() => {
    return () => {
      if (selectedThreadId) {
        return apiService.getChatMessages(selectedThreadId);
      }
      return Promise.resolve(null);
    };
  }, [selectedThreadId]);

  const { data: messages, loading: messagesLoading, refetch: refetchMessages } = useApi(
    messagesApiFunction,
    [selectedThreadId]
  );

  const { mutate, loading: sending } = useApiMutation();

  const handleSendMessage = useCallback(async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedThreadId) return;

    const messageText = newMessage.trim();
    setNewMessage(''); // Clear immediately for better UX

    try {
      const messageId = crypto.randomUUID();
      await mutate(apiService.sendMessage, {
        id: messageId,
        message: messageText,
        is_read_by_buyer: true,
        is_read_by_seller: false,
        thread_id: selectedThreadId,
        buyer_id: MOCK_BUYER_ID,
        seller_id: selectedThread?.seller_id
      });
      refetchMessages();
    } catch (err) {
      console.error('Failed to send message:', err);
      // Restore message on error
      setNewMessage(messageText);
    }
  }, [newMessage, selectedThreadId, selectedThread?.seller_id, mutate, refetchMessages]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Conversations</h1>
        <p className="page-description">Chat with sellers about their products</p>
      </div>

      <div className="card">
        <div className="card-header flex justify-between items-center">
          <h2 className="card-title">Conversations</h2>
          <button
            onClick={refetch}
            className="btn btn-secondary"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="error mb-4">
            <strong>Failed to load conversations</strong>
            <p>{error}</p>
          </div>
        )}

        {loading && (
          <div className="card animate-fade-in-scale">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-md)',
              marginBottom: 'var(--space-lg)'
            }}>
              <span className="animate-pulse" style={{ fontSize: '1.5rem' }}>💬</span>
              <h3>Loading conversations...</h3>
            </div>
            <div className="grid grid-2">
              <div>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{
                    padding: 'var(--space-lg)',
                    background: 'rgba(255, 255, 255, 0.5)',
                    borderRadius: 'var(--radius-xl)',
                    marginBottom: 'var(--space-md)'
                  }}>
                    <div className="skeleton skeleton-title"></div>
                    <div className="skeleton skeleton-text"></div>
                    <div className="skeleton skeleton-text" style={{ width: '60%' }}></div>
                  </div>
                ))}
              </div>
              <div style={{
                padding: 'var(--space-lg)',
                background: 'rgba(255, 255, 255, 0.5)',
                borderRadius: 'var(--radius-xl)'
              }}>
                <div className="skeleton skeleton-title"></div>
                <div className="skeleton" style={{ height: '200px', marginBottom: 'var(--space-md)' }}></div>
                <div className="skeleton" style={{ height: '40px' }}></div>
              </div>
            </div>
          </div>
        )}

        {data && (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <p>Total conversations: {data.total || data.data?.length || 0}</p>
            </div>

            {data.data && data.data.length > 0 ? (
              <div className="grid grid-2" style={{ gap: 'var(--space-xl)' }}>
                <div className="animate-fade-in-left">
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-md)',
                    marginBottom: 'var(--space-lg)',
                    padding: 'var(--space-md)',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid rgba(16, 185, 129, 0.2)'
                  }}>
                    <span style={{ fontSize: '1.5rem' }}>📋</span>
                    <h3 style={{ margin: 0 }}>Conversations</h3>
                  </div>
                  <div style={{
                    maxHeight: '500px',
                    overflowY: 'auto',
                    padding: 'var(--space-sm)',
                    background: 'rgba(255, 255, 255, 0.3)',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}>
                    {data.data.map((thread, index) => (
                      <div
                        key={thread.id}
                        onClick={() => setSelectedThread(thread)}
                        className="animate-fade-in-up"
                        style={{
                          animationDelay: `${index * 0.1}s`,
                          padding: 'var(--space-lg)',
                          background: selectedThread?.id === thread.id
                            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)'
                            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
                          border: selectedThread?.id === thread.id
                            ? '2px solid rgba(16, 185, 129, 0.3)'
                            : '1px solid rgba(255, 255, 255, 0.3)',
                          borderRadius: 'var(--radius-xl)',
                          marginBottom: 'var(--space-md)',
                          cursor: 'pointer',
                          transition: 'all var(--timing-normal) var(--easing-smooth)',
                          backdropFilter: 'blur(10px)'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedThread?.id !== thread.id) {
                            e.target.style.transform = 'translateY(-2px) scale(1.02)';
                            e.target.style.boxShadow = 'var(--shadow-elevation-3)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedThread?.id !== thread.id) {
                            e.target.style.transform = 'translateY(0) scale(1)';
                            e.target.style.boxShadow = 'none';
                          }
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-sm)',
                          marginBottom: 'var(--space-sm)'
                        }}>
                          <span style={{ fontSize: '1.2rem' }}>💬</span>
                          <div style={{ fontWeight: '700', color: '#374151' }}>
                            Chat #{thread.id.substring(0, 8)}...
                          </div>
                        </div>
                        <div style={{
                          fontSize: 'var(--font-size-sm)',
                          color: '#6b7280',
                          marginBottom: 'var(--space-xs)'
                        }}>
                          👤 Seller: {thread.seller_id?.substring(0, 8)}...
                        </div>
                        <div style={{
                          fontSize: 'var(--font-size-xs)',
                          color: '#9ca3af',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-xs)'
                        }}>
                          📅 {new Date(thread.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="animate-fade-in-right">
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-md)',
                    marginBottom: 'var(--space-lg)',
                    padding: 'var(--space-md)',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid rgba(16, 185, 129, 0.2)'
                  }}>
                    <span style={{ fontSize: '1.5rem' }}>💬</span>
                    <h3 style={{ margin: 0 }}>Messages</h3>
                  </div>
                  {selectedThread ? (
                    <div>
                      <div style={{
                        padding: 'var(--space-lg)',
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                        borderRadius: 'var(--radius-xl)',
                        marginBottom: 'var(--space-lg)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-md)'
                      }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'var(--gradient-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: '700'
                        }}>
                          👤
                        </div>
                        <div>
                          <strong style={{ color: '#374151' }}>
                            Chat with Seller {selectedThread.seller_id?.substring(0, 8)}...
                          </strong>
                          <p style={{ margin: 0, marginTop: 'var(--space-xs)', color: '#6b7280', fontSize: 'var(--font-size-sm)' }}>
                            🟢 Online
                          </p>
                        </div>
                      </div>
                      
                      {messagesLoading && <div className="loading">Loading messages...</div>}
                      
                      {messages?.data && messages.data.length > 0 ? (
                        <div style={{
                          maxHeight: '350px',
                          overflowY: 'auto',
                          marginBottom: 'var(--space-lg)',
                          padding: 'var(--space-sm)',
                          background: 'rgba(255, 255, 255, 0.3)',
                          borderRadius: 'var(--radius-xl)',
                          border: '1px solid rgba(255, 255, 255, 0.3)'
                        }}>
                          {messages.data.reverse().map((message, index) => {
                            const isOwnMessage = message.buyer_id === MOCK_BUYER_ID;
                            return (
                              <div
                                key={message.id}
                                className="animate-fade-in-up"
                                style={{
                                  animationDelay: `${index * 0.1}s`,
                                  display: 'flex',
                                  justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                                  marginBottom: 'var(--space-md)'
                                }}
                              >
                                <div style={{
                                  maxWidth: '70%',
                                  padding: 'var(--space-md)',
                                  borderRadius: isOwnMessage
                                    ? 'var(--radius-xl) var(--radius-xl) var(--radius-sm) var(--radius-xl)'
                                    : 'var(--radius-xl) var(--radius-xl) var(--radius-xl) var(--radius-sm)',
                                  background: isOwnMessage
                                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
                                  color: isOwnMessage ? 'white' : '#374151',
                                  boxShadow: 'var(--shadow-elevation-2)',
                                  border: isOwnMessage ? 'none' : '1px solid rgba(255, 255, 255, 0.3)',
                                  backdropFilter: 'blur(10px)'
                                }}>
                                  <div style={{
                                    fontSize: 'var(--font-size-xs)',
                                    fontWeight: '600',
                                    marginBottom: 'var(--space-xs)',
                                    opacity: 0.8
                                  }}>
                                    {isOwnMessage ? '👤 You' : '🏪 Seller'}
                                  </div>
                                  <div style={{
                                    fontSize: 'var(--font-size-sm)',
                                    lineHeight: '1.5',
                                    marginBottom: 'var(--space-xs)'
                                  }}>
                                    {message.message}
                                  </div>
                                  <div style={{
                                    fontSize: 'var(--font-size-xs)',
                                    opacity: 0.7,
                                    textAlign: 'right'
                                  }}>
                                    📅 {new Date(message.created_at).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{ marginBottom: '1rem' }}>
                          <p>No messages yet. Start the conversation!</p>
                        </div>
                      )}

                      {/* Premium Message Input */}
                      <form onSubmit={handleSendMessage}>
                        <div style={{
                          display: 'flex',
                          gap: 'var(--space-md)',
                          padding: 'var(--space-lg)',
                          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
                          borderRadius: 'var(--radius-2xl)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          backdropFilter: 'blur(20px)',
                          boxShadow: 'var(--shadow-elevation-2)'
                        }}>
                          <div style={{ position: 'relative', flex: 1 }}>
                            <input
                              type="text"
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              placeholder="💬 Type your message..."
                              className="form-input"
                              style={{
                                paddingLeft: '3rem',
                                border: '2px solid rgba(16, 185, 129, 0.2)',
                                background: 'rgba(255, 255, 255, 0.8)'
                              }}
                              disabled={sending}
                            />
                            <div style={{
                              position: 'absolute',
                              left: '1rem',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              fontSize: '1.25rem',
                              color: '#10b981'
                            }}>
                              ✍️
                            </div>
                          </div>
                          <button
                            type="submit"
                            className="btn btn-primary animate-glow"
                            disabled={sending || !newMessage.trim()}
                            style={{
                              minWidth: '120px',
                              background: newMessage.trim()
                                ? 'var(--gradient-primary)'
                                : 'rgba(156, 163, 175, 0.5)'
                            }}
                          >
                            {sending ? '⏳ Sending...' : '🚀 Send'}
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      padding: 'var(--space-3xl)',
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
                      border: '2px dashed rgba(16, 185, 129, 0.3)',
                      borderRadius: 'var(--radius-2xl)'
                    }}>
                      <div className="animate-float" style={{ marginBottom: 'var(--space-xl)' }}>
                        <span style={{ fontSize: '4rem', display: 'block', marginBottom: 'var(--space-lg)' }}>💬</span>
                        <h3 style={{ margin: 0, marginBottom: 'var(--space-md)', color: '#374151' }}>
                          Select a conversation
                        </h3>
                        <p style={{
                          margin: 0,
                          color: '#6b7280',
                          fontSize: 'var(--font-size-lg)',
                          maxWidth: '300px',
                          marginLeft: 'auto',
                          marginRight: 'auto',
                          lineHeight: '1.6'
                        }}>
                          Choose a conversation from the list to start chatting with sellers.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="card animate-fade-in-scale" style={{
                textAlign: 'center',
                padding: 'var(--space-3xl)',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
                border: '2px dashed rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--radius-2xl)'
              }}>
                <div className="animate-float" style={{ marginBottom: 'var(--space-xl)' }}>
                  <span style={{ fontSize: '4rem', display: 'block', marginBottom: 'var(--space-lg)' }}>💬</span>
                  <h3 style={{ margin: 0, marginBottom: 'var(--space-md)', color: '#374151' }}>
                    No conversations yet
                  </h3>
                  <p style={{
                    margin: 0,
                    color: '#6b7280',
                    fontSize: 'var(--font-size-lg)',
                    maxWidth: '400px',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    lineHeight: '1.6'
                  }}>
                    Start chatting with sellers by contacting them from product pages.
                  </p>
                </div>

                <a
                  href="/products"
                  className="btn btn-primary animate-glow"
                  style={{ fontSize: 'var(--font-size-lg)', padding: 'var(--space-lg) var(--space-2xl)' }}
                >
                  🛍️ Browse Products
                </a>
              </div>
            )}

            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0 || loading}
                className="btn btn-secondary"
              >
                Previous
              </button>
              <span>Page {page + 1}</span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={!data?.data || data.data.length < 10 || loading}
                className="btn btn-secondary"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Chats;
