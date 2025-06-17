import React, { useEffect, useState, useCallback } from 'react';
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
  const [currentPage, setCurrentPage] = useState(0);
  const [totalSellers, setTotalSellers] = useState(0);
  const [pageSize] = useState(12); // Professional grid layout works well with 12 items
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'online', 'offline'

  useEffect(() => {
    setPageTitle(BUYER_TEXTS.SELLERS);
    loadSellers();
  }, [setPageTitle, currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadSellers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getSellers(currentPage, pageSize);
      setSellers(response.data || []);
      setTotalSellers(response.total || 0);

    } catch (err) {
      console.error('Ошибка загрузки продавцов:', err);
      setError(err.message);
      showError('Не удалось загрузить продавцов');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, showError]);

  // Filter sellers based on search and status
  const filteredSellers = sellers.filter(seller => {
    const matchesSearch = !searchTerm ||
      (seller.name && seller.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (seller.neme && seller.neme.toLowerCase().includes(searchTerm.toLowerCase())) ||
      seller.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'online' && seller.is_online) ||
      (statusFilter === 'offline' && !seller.is_online);

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(totalSellers / pageSize);
  const hasNextPage = currentPage < totalPages - 1;
  const hasPrevPage = currentPage > 0;

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderPaginationButton = (page, label = null, disabled = false) => (
    <button
      key={page}
      onClick={() => handlePageChange(page)}
      disabled={disabled || loading}
      style={{
        padding: '8px 12px',
        margin: '0 2px',
        backgroundColor: page === currentPage ? '#2563eb' : 'white',
        color: page === currentPage ? 'white' : '#374151',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s ease',
        minWidth: '40px'
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading && page !== currentPage) {
          e.target.style.backgroundColor = '#f3f4f6';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading && page !== currentPage) {
          e.target.style.backgroundColor = 'white';
        }
      }}
    >
      {label || page + 1}
    </button>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;

    // Always show first page
    if (currentPage > 2) {
      pages.push(renderPaginationButton(0));
      if (currentPage > 3) {
        pages.push(<span key="ellipsis1" style={{ padding: '8px 4px', color: '#6b7280' }}>...</span>);
      }
    }

    // Show pages around current page
    const start = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    const end = Math.min(totalPages, start + maxVisiblePages);

    for (let i = start; i < end; i++) {
      pages.push(renderPaginationButton(i));
    }

    // Always show last page
    if (currentPage < totalPages - 3) {
      if (currentPage < totalPages - 4) {
        pages.push(<span key="ellipsis2" style={{ padding: '8px 4px', color: '#6b7280' }}>...</span>);
      }
      pages.push(renderPaginationButton(totalPages - 1));
    }

    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
        marginTop: '40px',
        padding: '20px 0'
      }}>
        {renderPaginationButton(currentPage - 1, '← Назад', !hasPrevPage)}
        {pages}
        {renderPaginationButton(currentPage + 1, 'Вперед →', !hasNextPage)}
      </div>
    );
  };

  return (
    <div style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#f8fafc',
      minHeight: '100vh'
    }}>
      {/* Header Section */}
      <div style={{
        backgroundColor: 'white',
        padding: '32px',
        borderRadius: '16px',
        marginBottom: '24px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px'
        }}>
          <div>
            <h1 style={{
              margin: 0,
              color: '#1f2937',
              fontSize: '36px',
              fontWeight: '700',
              letterSpacing: '-0.025em'
            }}>
              🏪 Каталог продавцов
            </h1>
            <p style={{
              margin: '8px 0 0 0',
              color: '#6b7280',
              fontSize: '18px',
              fontWeight: '400'
            }}>
              Проверенные поставщики древесины и пиломатериалов
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginTop: '12px',
              fontSize: '14px',
              color: '#6b7280'
            }}>
              <span>📊 Всего продавцов: <strong style={{ color: '#374151' }}>{totalSellers}</strong></span>
              <span>📄 Страница {currentPage + 1} из {totalPages}</span>
            </div>
          </div>
          <button
            onClick={loadSellers}
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#1d4ed8';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 8px rgba(37, 99, 235, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#2563eb';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 4px rgba(37, 99, 235, 0.2)';
              }
            }}
          >
            {loading ? '🔄 Обновление...' : '🔄 Обновить'}
          </button>
        </div>

        {/* Search and Filter Section */}
        <div style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: '1', minWidth: '300px' }}>
            <input
              type="text"
              placeholder="🔍 Поиск по имени или ID продавца..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '16px',
                backgroundColor: '#f9fafb',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#2563eb';
                e.target.style.backgroundColor = 'white';
                e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.backgroundColor = '#f9fafb';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '12px 16px',
              border: '2px solid #e5e7eb',
              borderRadius: '10px',
              fontSize: '16px',
              backgroundColor: '#f9fafb',
              cursor: 'pointer',
              minWidth: '150px'
            }}
          >
            <option value="all">Все статусы</option>
            <option value="online">🟢 Онлайн</option>
            <option value="offline">🔴 Офлайн</option>
          </select>
        </div>
      </div>

      {/* Content Section */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        {error && (
          <div style={{
            padding: '20px 32px',
            backgroundColor: '#fef2f2',
            borderBottom: '1px solid #fecaca',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ fontSize: '20px' }}>⚠️</div>
            <div>
              <strong style={{ color: '#dc2626', fontSize: '16px' }}>Ошибка загрузки продавцов</strong>
              <p style={{ margin: '4px 0 0 0', color: '#7f1d1d', fontSize: '14px' }}>{error}</p>
            </div>
          </div>
        )}

        {loading && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '300px',
            fontSize: '18px',
            color: '#6b7280'
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
                border: '4px solid #e5e7eb',
                borderTop: '4px solid #2563eb',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <span style={{ fontWeight: '500' }}>Загрузка продавцов...</span>
            </div>
          </div>
        )}

        {!loading && (
          <>
            {filteredSellers.length > 0 ? (
              <div style={{ padding: '32px' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
                  gap: '24px'
                }}>
                  {filteredSellers.map((seller) => (
                    <div
                      key={seller.id}
                      style={{
                        backgroundColor: '#f8fafc',
                        padding: '28px',
                        borderRadius: '16px',
                        border: '2px solid #e5e7eb',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)';
                        e.currentTarget.style.borderColor = '#2563eb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                      }}
                    >
                      {/* Status indicator */}
                      <div style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: seller.is_online ? '#dcfce7' : '#fee2e2',
                        color: seller.is_online ? '#166534' : '#991b1b',
                        border: `1px solid ${seller.is_online ? '#bbf7d0' : '#fecaca'}`
                      }}>
                        {seller.is_online ? '🟢 Онлайн' : '🔴 Офлайн'}
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        marginBottom: '20px'
                      }}>
                        <div style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '16px',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '24px',
                          boxShadow: '0 4px 8px rgba(102, 126, 234, 0.3)'
                        }}>
                          🏪
                        </div>
                        <div style={{ flex: 1 }}>
                          <h3 style={{
                            margin: 0,
                            fontSize: '20px',
                            fontWeight: '700',
                            color: '#1f2937',
                            lineHeight: '1.2'
                          }}>
                            {seller.neme || seller.name || 'Продавец'}
                          </h3>
                          <p style={{
                            margin: '4px 0 0 0',
                            fontSize: '14px',
                            color: '#6b7280',
                            fontFamily: 'monospace'
                          }}>
                            ID: {seller.id?.substring(0, 12)}...
                          </p>
                        </div>
                      </div>

                      <div style={{
                        backgroundColor: 'white',
                        padding: '16px',
                        borderRadius: '12px',
                        marginBottom: '20px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '12px',
                          fontSize: '14px'
                        }}>
                          <div>
                            <span style={{ color: '#6b7280', fontWeight: '500' }}>Keycloak ID:</span>
                            <div style={{
                              color: '#374151',
                              fontFamily: 'monospace',
                              fontSize: '13px',
                              marginTop: '2px'
                            }}>
                              {seller.keycloak_id?.substring(0, 12)}...
                            </div>
                          </div>
                          <div>
                            <span style={{ color: '#6b7280', fontWeight: '500' }}>Регистрация:</span>
                            <div style={{
                              color: '#374151',
                              marginTop: '2px'
                            }}>
                              {new Date(seller.created_at).toLocaleDateString('ru-RU')}
                            </div>
                          </div>
                        </div>
                      </div>

                      <StartChatButton
                        sellerId={seller.id}
                        sellerName={seller.neme || seller.name || 'Продавец'}
                        size="large"
                        style={{
                          width: '100%',
                          padding: '14px 20px',
                          fontSize: '16px',
                          fontWeight: '600',
                          borderRadius: '12px'
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {renderPagination()}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '80px 32px',
                color: '#6b7280'
              }}>
                <div style={{ fontSize: '80px', marginBottom: '24px', opacity: 0.5 }}>
                  {searchTerm || statusFilter !== 'all' ? '🔍' : '🏪'}
                </div>
                <h3 style={{
                  margin: 0,
                  marginBottom: '12px',
                  color: '#374151',
                  fontSize: '28px',
                  fontWeight: '600'
                }}>
                  {searchTerm || statusFilter !== 'all' ? 'Продавцы не найдены' : 'Продавцов пока нет'}
                </h3>
                <p style={{
                  margin: 0,
                  color: '#6b7280',
                  fontSize: '18px',
                  maxWidth: '500px',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  lineHeight: '1.6'
                }}>
                  {searchTerm || statusFilter !== 'all'
                    ? 'Попробуйте изменить параметры поиска или фильтры'
                    : 'В настоящее время продавцы недоступны. Зайдите позже!'
                  }
                </p>
                {(searchTerm || statusFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                    }}
                    style={{
                      marginTop: '20px',
                      padding: '12px 24px',
                      backgroundColor: '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Сбросить фильтры
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Global Styles */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        input:focus {
          outline: none;
        }

        select:focus {
          outline: none;
        }

        button:focus {
          outline: 2px solid #2563eb;
          outline-offset: 2px;
        }

        @media (max-width: 768px) {
          .sellers-grid {
            grid-template-columns: 1fr !important;
          }

          .header-content {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px !important;
          }

          .search-filters {
            flex-direction: column !important;
            align-items: stretch !important;
          }

          .pagination {
            flex-wrap: wrap !important;
            gap: 4px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SellersPage;
