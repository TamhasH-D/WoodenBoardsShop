import React, { useState } from 'react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { apiService } from '../services/api';

// Mock buyer ID - in real app this would come from authentication
const MOCK_BUYER_ID = '123e4567-e89b-12d3-a456-426614174001';

function Sellers() {
  const [page, setPage] = useState(0);
  const { data, loading, error, refetch } = useApi(() => apiService.getSellers(page, 10), [page]);
  const { mutate, loading: contacting } = useApiMutation();

  const handleContactSeller = async (sellerId) => {
    try {
      // Create a new chat thread
      const threadId = crypto.randomUUID();
      await mutate(apiService.createChatThread, {
        id: threadId,
        buyer_id: MOCK_BUYER_ID,
        seller_id: sellerId
      });

      // Redirect to chats page
      window.location.href = '/chats';
    } catch (err) {
      console.error('Failed to contact seller:', err);
      alert('Failed to contact seller. Please try again.');
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Find Sellers</h2>
        <button onClick={refetch} className="btn btn-secondary" disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="error">
          Failed to load sellers: {error}
        </div>
      )}

      {loading && <div className="loading">Loading sellers...</div>}

      {data && (
        <>
          <div style={{ marginBottom: '1rem' }}>
            <p>Total sellers: {data.total || data.data?.length || 0}</p>
          </div>

          {data.data && data.data.length > 0 ? (
            <div className="grid grid-2">
              {data.data.map((seller) => (
                <div key={seller.id} className="card" style={{ margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                    <div>
                      <h3>Seller {seller.id.substring(0, 8)}...</h3>
                      <div style={{ 
                        color: seller.is_online ? '#38a169' : '#e53e3e',
                        fontWeight: 'bold',
                        fontSize: '0.875rem'
                      }}>
                        {seller.is_online ? '🟢 Online' : '🔴 Offline'}
                      </div>
                    </div>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleContactSeller(seller.id)}
                      disabled={contacting}
                    >
                      {contacting ? 'Contacting...' : 'Contact'}
                    </button>
                  </div>

                  <div style={{ fontSize: '0.875rem', color: '#718096' }}>
                    <div>Member since: {new Date(seller.created_at).toLocaleDateString()}</div>
                    <div>Last active: {new Date(seller.updated_at).toLocaleDateString()}</div>
                  </div>

                  <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#f7fafc', borderRadius: '0.375rem' }}>
                    <div style={{ fontSize: '0.875rem' }}>
                      <strong>Seller ID:</strong> {seller.id}
                    </div>
                    {seller.keycloak_uuid && (
                      <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        <strong>UUID:</strong> {seller.keycloak_uuid.substring(0, 8)}...
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <h3>No sellers found</h3>
              <p>No sellers are currently available.</p>
            </div>
          )}

          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center' }}>
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

export default Sellers;
