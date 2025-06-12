import React, { useState } from 'react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { apiService } from '../services/api';

const ChatModeration = React.memo(() => {
  const [page, setPage] = useState(0);
  const [selectedThread, setSelectedThread] = useState(null);
  const [showMessages, setShowMessages] = useState(false);

  const { data: chatThreads, loading, error, refetch } = useApi(
    () => apiService.getChatThreads(page, 10),
    [page]
  );

  const { data: messages, loading: messagesLoading } = useApi(
    () => selectedThread ? apiService.getChatMessages(selectedThread.id) : Promise.resolve({ data: [] }),
    [selectedThread]
  );

  const { mutate, loading: mutating, error: mutationError, success } = useApiMutation();

  const handleDeleteThread = async (id) => {
    if (window.confirm('Are you sure you want to delete this chat thread?')) {
      try {
        await mutate(() => apiService.deleteChatThread(id));
        refetch();
        if (selectedThread?.id === id) {
          setSelectedThread(null);
          setShowMessages(false);
        }
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleViewMessages = (thread) => {
    setSelectedThread(thread);
    setShowMessages(true);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Chat Moderation</h1>
        <p className="page-description">Monitor and moderate conversations between sellers and buyers</p>
      </div>

      {/* Error and Success Messages */}
      {mutationError && (
        <div className="error mb-4">
          <strong>Operation failed:</strong> {mutationError}
        </div>
      )}

      {success && (
        <div className="success mb-4">
          <strong>Success:</strong> Chat thread deleted successfully!
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Chat Threads</h2>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div>
            <p>Total chat threads: {chatThreads?.total || 0}</p>
          </div>
          <button 
            onClick={refetch}
            className="btn btn-secondary" 
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {loading && <div className="loading">Loading chat threads...</div>}
        
        {error && (
          <div className="error">
            <strong>Failed to load chat threads:</strong> {error}
          </div>
        )}

        {chatThreads && chatThreads.data && chatThreads.data.length > 0 ? (
          <div>
            <table className="table">
              <thead>
                <tr>
                  <th>Thread ID</th>
                  <th>Buyer</th>
                  <th>Seller</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {chatThreads.data.map((thread) => (
                  <tr key={thread.id}>
                    <td>
                      <strong>{thread.id.substring(0, 8)}...</strong>
                    </td>
                    <td>
                      {thread.buyer_id ? thread.buyer_id.substring(0, 8) + '...' : 'N/A'}
                    </td>
                    <td>
                      {thread.seller_id ? thread.seller_id.substring(0, 8) + '...' : 'N/A'}
                    </td>
                    <td>
                      {new Date(thread.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewMessages(thread)}
                          className="btn btn-primary"
                          style={{ fontSize: '0.8em', padding: '0.25rem 0.5rem' }}
                        >
                          View Messages
                        </button>
                        <button
                          onClick={() => handleDeleteThread(thread.id)}
                          className="btn btn-secondary"
                          disabled={mutating}
                          style={{ fontSize: '0.8em', padding: '0.25rem 0.5rem' }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6">
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
                disabled={!chatThreads?.data || chatThreads.data.length < 10 || loading}
                className="btn btn-secondary"
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p>No chat threads found.</p>
          </div>
        )}
      </div>

      {/* Messages Modal */}
      {showMessages && selectedThread && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '2rem',
            maxWidth: '800px',
            maxHeight: '80vh',
            overflow: 'auto',
            width: '90%'
          }}>
            <div className="flex justify-between items-center mb-4">
              <h3>Messages for Thread {selectedThread.id.substring(0, 8)}...</h3>
              <button
                onClick={() => setShowMessages(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>

            {messagesLoading && <div className="loading">Loading messages...</div>}

            {messages && messages.data && messages.data.length > 0 ? (
              <div style={{ maxHeight: '400px', overflow: 'auto' }}>
                {messages.data.map((message) => (
                  <div key={message.id} className="card mb-2" style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <strong>Message ID: {message.id.substring(0, 8)}...</strong>
                      <small>{new Date(message.created_at).toLocaleString()}</small>
                    </div>
                    <p style={{ margin: 0 }}>{message.content || 'No content'}</p>
                    {message.sender_id && (
                      <small style={{ color: '#666', marginTop: '0.5rem', display: 'block' }}>
                        From: {message.sender_id.substring(0, 8)}...
                      </small>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>No messages found in this thread.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default ChatModeration;
