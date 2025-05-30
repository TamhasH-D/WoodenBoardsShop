import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { apiService } from '../services/api';

// Mock seller ID - in real app this would come from authentication
const MOCK_SELLER_ID = '123e4567-e89b-12d3-a456-426614174000';

function Chats() {
  const [page, setPage] = useState(0);
  const [selectedThread, setSelectedThread] = useState(null);

  const { data, loading, error, refetch } = useApi(() => apiService.getSellerChats(MOCK_SELLER_ID, page, 10), [page]);
  const { data: messages, loading: messagesLoading } = useApi(
    () => selectedThread ? apiService.getChatMessages(selectedThread.id) : Promise.resolve(null),
    [selectedThread]
  );

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Customer Chats</h2>
          <button onClick={refetch} className="btn btn-secondary" disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="error">
            Failed to load chats: {error}
          </div>
        )}

        {loading && <div className="loading">Loading chats...</div>}

        {data && (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <p>Total chat threads: {data.total || data.data?.length || 0}</p>
            </div>

            {data.data && data.data.length > 0 ? (
              <div className="grid grid-2">
                <div>
                  <h3>Chat Threads</h3>
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {data.data.map((thread) => (
                      <div
                        key={thread.id}
                        onClick={() => setSelectedThread(thread)}
                        style={{
                          padding: '1rem',
                          border: '1px solid #e2e8f0',
                          borderRadius: '0.375rem',
                          marginBottom: '0.5rem',
                          cursor: 'pointer',
                          backgroundColor: selectedThread?.id === thread.id ? '#e6fffa' : 'white'
                        }}
                      >
                        <div style={{ fontWeight: 'bold' }}>
                          Thread {thread.id.substring(0, 8)}...
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#718096' }}>
                          Buyer: {thread.buyer_id?.substring(0, 8)}...
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#718096' }}>
                          Updated: {new Date(thread.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3>Messages</h3>
                  {selectedThread ? (
                    <div>
                      <div style={{ 
                        padding: '1rem', 
                        backgroundColor: '#f7fafc', 
                        borderRadius: '0.375rem',
                        marginBottom: '1rem'
                      }}>
                        <strong>Chat with Buyer {selectedThread.buyer_id?.substring(0, 8)}...</strong>
                      </div>
                      
                      {messagesLoading && <div className="loading">Loading messages...</div>}
                      
                      {messages?.data && messages.data.length > 0 ? (
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                          {messages.data.map((message) => (
                            <div
                              key={message.id}
                              style={{
                                padding: '0.75rem',
                                marginBottom: '0.5rem',
                                borderRadius: '0.375rem',
                                backgroundColor: message.buyer_id ? '#e6fffa' : '#f0f4ff'
                              }}
                            >
                              <div style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
                                {message.buyer_id ? 'Buyer' : 'You'}
                              </div>
                              <div>{message.message}</div>
                              <div style={{ fontSize: '0.75rem', color: '#718096', marginTop: '0.25rem' }}>
                                {new Date(message.created_at).toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>No messages in this thread yet.</p>
                      )}
                    </div>
                  ) : (
                    <p>Select a chat thread to view messages</p>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p>No chat threads found.</p>
                <p>Customers will be able to contact you about your products.</p>
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
