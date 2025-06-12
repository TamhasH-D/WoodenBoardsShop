import React, { useState } from 'react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { apiService } from '../services/api';

function Buyers() {
  const [page, setPage] = useState(0);
  const { data, loading, error, refetch } = useApi(() => apiService.getBuyers(page, 10), [page]);
  const { mutate, loading: mutating, error: mutationError, success } = useApiMutation();

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this buyer?')) {
      try {
        await mutate(apiService.deleteBuyer, id);
        refetch(); // Refresh the list
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to delete buyer:', err);
        }
      }
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Buyers Management</h2>
        <button onClick={refetch} className="btn btn-secondary" disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="error">
          Failed to load buyers: {error}
        </div>
      )}

      {mutationError && (
        <div className="error">
          Operation failed: {mutationError}
        </div>
      )}

      {success && (
        <div className="success">
          Operation completed successfully!
        </div>
      )}

      {loading && <div className="loading">Loading buyers...</div>}

      {data && (
        <>
          <div style={{ marginBottom: '1rem' }}>
            <p>Total buyers: {data.total || 'Unknown'}</p>
          </div>

          {data.data && data.data.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Keycloak UUID</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((buyer) => (
                  <tr key={buyer.id}>
                    <td>{buyer.id.substring(0, 8)}...</td>
                    <td>{buyer.keycloak_uuid.substring(0, 8)}...</td>
                    <td>
                      <span style={{ 
                        color: buyer.is_online ? '#38a169' : '#e53e3e',
                        fontWeight: 'bold'
                      }}>
                        {buyer.is_online ? 'Online' : 'Offline'}
                      </span>
                    </td>
                    <td>{new Date(buyer.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => handleDelete(buyer.id)}
                        className="btn btn-secondary"
                        disabled={mutating}
                        style={{ backgroundColor: '#fed7d7', color: '#c53030' }}
                      >
                        {mutating ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No buyers found. This could mean:</p>
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

export default Buyers;
