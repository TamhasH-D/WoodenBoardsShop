import { useState, useCallback, useMemo } from 'react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { apiService } from '../services/api';
import { BUYER_TEXTS } from '../utils/localization';

// Mock buyer ID - in real app this would come from authentication
const MOCK_BUYER_ID = '81f81c96-c56e-4b36-aec3-656f3576d09f';

function Sellers() {
  const [page, setPage] = useState(0);

  // Create stable API function to prevent infinite loops
  const sellersApiFunction = useMemo(() => () => apiService.getSellers(page, 10), [page]);
  const { data, loading, error, refetch } = useApi(sellersApiFunction, [page]);
  const { mutate, loading: contacting } = useApiMutation();

  const handleContactSeller = useCallback(async (sellerId) => {
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
  }, [mutate]);

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>{BUYER_TEXTS.FIND_SELLERS}</h2>
        <button onClick={refetch} className="btn btn-secondary" disabled={loading}>
          {loading ? BUYER_TEXTS.LOADING : BUYER_TEXTS.REFRESH}
        </button>
      </div>

      {error && (
        <div className="error">
          {BUYER_TEXTS.FAILED_TO_LOAD_SELLERS}: {error}
        </div>
      )}

      {loading && <div className="loading">{BUYER_TEXTS.LOADING_SELLERS}...</div>}

      {data && (
        <>
          <div style={{ marginBottom: '1rem' }}>
            <p>{BUYER_TEXTS.TOTAL_SELLERS}: {data.total || data.data?.length || 0}</p>
          </div>

          {data.data && data.data.length > 0 ? (
            <div className="grid grid-2">
              {data.data.map((seller) => (
                <div key={seller.id} className="card" style={{ margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                    <div>
                      <h3>{BUYER_TEXTS.SELLER} {seller.id.substring(0, 8)}...</h3>
                      <div style={{
                        color: seller.is_online ? '#38a169' : '#e53e3e',
                        fontWeight: 'bold',
                        fontSize: '0.875rem'
                      }}>
                        {seller.is_online ? `🟢 ${BUYER_TEXTS.ONLINE}` : `🔴 ${BUYER_TEXTS.OFFLINE}`}
                      </div>
                    </div>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleContactSeller(seller.id)}
                      disabled={contacting}
                    >
                      {contacting ? BUYER_TEXTS.CONTACTING : BUYER_TEXTS.CONTACT}
                    </button>
                  </div>

                  <div style={{ fontSize: '0.875rem', color: '#718096' }}>
                    <div>{BUYER_TEXTS.MEMBER_SINCE}: {new Date(seller.created_at).toLocaleDateString('ru-RU')}</div>
                    <div>{BUYER_TEXTS.LAST_ACTIVE}: {new Date(seller.updated_at).toLocaleDateString('ru-RU')}</div>
                  </div>

                  <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#f7fafc', borderRadius: '0.375rem' }}>
                    <div style={{ fontSize: '0.875rem' }}>
                      <strong>{BUYER_TEXTS.SELLER_ID}:</strong> {seller.id}
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
              <h3>{BUYER_TEXTS.NO_SELLERS_FOUND}</h3>
              <p>{BUYER_TEXTS.NO_SELLERS_AVAILABLE}</p>
            </div>
          )}

          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center' }}>
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0 || loading}
              className="btn btn-secondary"
            >
              {BUYER_TEXTS.PREVIOUS}
            </button>
            <span>{BUYER_TEXTS.PAGE} {page + 1}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!data?.data || data.data.length < 10 || loading}
              className="btn btn-secondary"
            >
              {BUYER_TEXTS.NEXT}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Sellers;
