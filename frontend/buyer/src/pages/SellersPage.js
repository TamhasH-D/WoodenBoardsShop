import React, { useEffect, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useNotifications } from '../contexts/NotificationContext';
import { BUYER_TEXTS } from '../utils/localization';
import { apiService } from '../services/api';
import StartChatButton from '../components/chat/StartChatButton';

const SellersPage = () => {
  const { setPageTitle } = useApp();
  const { showError } = useNotifications();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setPageTitle(BUYER_TEXTS.SELLERS);
    loadSellers();
  }, [setPageTitle]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadSellers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getSellers(0, 20);
      setSellers(response.data || []);

    } catch (err) {
      console.error('Ошибка загрузки продавцов:', err);
      setError(err.message);
      showError('Не удалось загрузить продавцов');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#FAF7F0',
      minHeight: '100vh'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        marginBottom: '30px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <div>
            <h1 style={{ margin: 0, color: '#374151', fontSize: '32px' }}>
              🏪 {BUYER_TEXTS.SELLERS || 'Продавцы'}
            </h1>
            <p style={{ margin: '8px 0 0 0', color: '#6b7280', fontSize: '16px' }}>
              Проверенные поставщики древесины
            </p>
          </div>
          <button
            onClick={loadSellers}
            disabled={loading}
            style={{
              padding: '12px 20px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#1d4ed8';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#2563eb';
              }
            }}
          >
            {loading ? '🔄 Обновление...' : '🔄 Обновить'}
          </button>
        </div>

        {error && (
          <div style={{
            padding: '16px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <strong style={{ color: '#dc2626' }}>Ошибка загрузки продавцов</strong>
            <p style={{ margin: '4px 0 0 0', color: '#7f1d1d' }}>{error}</p>
          </div>
        )}

        {loading && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
            fontSize: '18px',
            color: '#6b7280'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                border: '3px solid #e5e7eb',
                borderTop: '3px solid #2563eb',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              Загрузка продавцов...
            </div>
          </div>
        )}

        {!loading && (
          <>
            <div style={{ marginBottom: '20px' }}>
              <p style={{ color: '#6b7280', fontSize: '16px' }}>
                Всего продавцов: {sellers.length}
              </p>
            </div>

            {sellers.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '20px'
              }}>
                {sellers.map((seller) => (
                  <div
                    key={seller.id}
                    style={{
                      backgroundColor: 'white',
                      padding: '24px',
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      border: '1px solid #e5e7eb',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '16px'
                    }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px'
                      }}>
                        🏪
                      </div>
                      <div>
                        <h3 style={{
                          margin: 0,
                          fontSize: '18px',
                          fontWeight: '600',
                          color: '#374151'
                        }}>
                          {seller.neme || seller.name || 'Продавец'}
                        </h3>
                        <p style={{
                          margin: '4px 0 0 0',
                          fontSize: '14px',
                          color: '#6b7280'
                        }}>
                          ID: {seller.id?.substring(0, 8)}...
                        </p>
                      </div>
                    </div>

                    <div style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      marginBottom: '16px'
                    }}>
                      <p style={{ margin: '0 0 8px 0' }}>
                        <strong>Keycloak ID:</strong> {seller.keycloak_id?.substring(0, 8)}...
                      </p>
                      <p style={{ margin: '0 0 8px 0' }}>
                        <strong>Статус:</strong> {seller.is_online ? '🟢 Онлайн' : '🔴 Офлайн'}
                      </p>
                      <p style={{ margin: 0 }}>
                        <strong>Создан:</strong> {new Date(seller.created_at).toLocaleDateString('ru-RU')}
                      </p>
                    </div>

                    <StartChatButton
                      sellerId={seller.id}
                      sellerName={seller.neme || seller.name || 'Продавец'}
                      size="medium"
                      style={{ width: '100%' }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '2px dashed #d1d5db'
              }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>🏪</div>
                <h3 style={{
                  margin: 0,
                  marginBottom: '12px',
                  color: '#374151',
                  fontSize: '24px'
                }}>
                  Продавцов пока нет
                </h3>
                <p style={{
                  margin: 0,
                  color: '#6b7280',
                  fontSize: '16px',
                  maxWidth: '400px',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  lineHeight: '1.6'
                }}>
                  В настоящее время продавцы недоступны. Зайдите позже!
                </p>
              </div>
            )}
          </>
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
};

export default SellersPage;
