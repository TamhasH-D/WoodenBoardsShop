import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { apiService } from '../services/api';

function ChatThreads() {
  const [page, setPage] = useState(0);
  const { data, loading, error, refetch } = useApi(() => apiService.getChatThreads(page, 10), [page]);

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Chat Threads</h2>
        <button onClick={refetch} className="btn btn-secondary" disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="error">
          Failed to load chat threads: {error}
        </div>
      )}

      {loading && <div className="loading">Loading chat threads...</div>}

      {data && (
        <>
          <div style={{ marginBottom: '1rem' }}>
            <p>Total chat threads: {data.total || 'Unknown'}</p>
          </div>

          {data.data && data.data.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Buyer ID</th>
                  <th>Seller ID</th>
                  <th>Created At</th>
                  <th>Updated At</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((thread) => (
                  <tr key={thread.id}>
                    <td>{thread.id.substring(0, 8)}...</td>
                    <td>{thread.buyer_id?.substring(0, 8)}...</td>
                    <td>{thread.seller_id?.substring(0, 8)}...</td>
                    <td>{new Date(thread.created_at).toLocaleDateString()}</td>
                    <td>{new Date(thread.updated_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No chat threads found.</p>
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
  );
}

export default ChatThreads;
