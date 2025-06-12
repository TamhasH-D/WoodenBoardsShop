import React, { useState, useCallback, useEffect } from 'react';
import { apiService } from '../services/api';
import { BUYER_TEXTS } from '../utils/localization';


function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);

  const pageSize = 12;

  // Загружаем товары только один раз при монтировании и при смене страницы
  const loadProducts = useCallback(async (page = 0) => {
    try {
      setLoading(true);
      console.log(`Loading products for page ${page}`);

      const result = await apiService.getProducts(page, pageSize);
      setProducts(result.data || []);
      setTotalProducts(result.total || 0);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  // Загружаем товары только при монтировании компонента
  useEffect(() => {
    loadProducts(currentPage);
  }, [currentPage, loadProducts]);



  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const totalPages = Math.ceil(totalProducts / pageSize);

  return (
    <div>
      {/* Hero Section */}
      <div className="header">
        <div className="container">
          <h1>{BUYER_TEXTS.WELCOME_TITLE}</h1>
          <p>{BUYER_TEXTS.WELCOME_SUBTITLE}</p>
          <div className="flex gap-4 mt-6">
            <a href="/products" className="btn btn-primary">
              {BUYER_TEXTS.BROWSE_PRODUCTS}
            </a>
            <a href="/analyzer" className="btn btn-secondary">
              {BUYER_TEXTS.ANALYZE_WOOD_BOARD}
            </a>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Products Catalog with Pagination */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Каталог товаров</h2>
            <p style={{ color: 'var(--color-text-light)', margin: '0.5rem 0 0 0' }}>
              Найдено товаров: {totalProducts}
            </p>
          </div>

          {loading && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '200px',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #e2e8f0',
                borderTopColor: '#2563eb',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ color: 'var(--color-text-light)' }}>Загрузка товаров...</p>
            </div>
          )}

          {!loading && products.length > 0 ? (
            <>
              <div className="grid grid-auto" style={{ marginBottom: '2rem' }}>
                {products.map((product) => (
                  <div key={product.id} className="product-card" style={{
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s ease'
                  }}>
                    {/* Product Image */}
                    <div style={{
                      width: '100%',
                      height: '200px',
                      backgroundColor: '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderBottom: '1px solid #e2e8f0'
                    }}>
                      <div style={{
                        fontSize: '3rem',
                        color: '#94a3b8'
                      }}>
                        🌲
                      </div>
                    </div>

                    <div style={{ padding: '1.5rem' }}>
                      <h4 style={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: '0.75rem',
                        lineHeight: '1.4'
                      }}>
                        {product.title || BUYER_TEXTS.UNTITLED_PRODUCT}
                      </h4>

                      {product.descrioption && (
                        <p style={{
                          color: '#6b7280',
                          fontSize: '0.875rem',
                          lineHeight: '1.5',
                          marginBottom: '1rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {product.descrioption}
                        </p>
                      )}

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.75rem'
                      }}>
                        <div style={{
                          fontSize: '1.25rem',
                          fontWeight: '700',
                          color: '#059669'
                        }}>
                          {product.price} ₽
                        </div>
                        <div style={{
                          fontSize: '0.875rem',
                          color: '#6b7280'
                        }}>
                          {product.volume} м³
                        </div>
                      </div>

                      <div style={{
                        textAlign: 'center',
                        marginBottom: '1rem',
                        color: '#6b7280',
                        fontSize: '0.875rem'
                      }}>
                        {(product.price / product.volume).toFixed(2)} ₽ за м³
                      </div>

                      <div style={{
                        marginBottom: '1rem'
                      }}>
                        <div style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          backgroundColor: product.delivery_possible ? '#dcfce7' : '#fee2e2',
                          color: product.delivery_possible ? '#166534' : '#dc2626'
                        }}>
                          {product.delivery_possible ? 'Доставка возможна' : 'Только самовывоз'}
                        </div>
                        {product.pickup_location && (
                          <div style={{
                            fontSize: '0.75rem',
                            color: '#6b7280',
                            marginTop: '0.5rem'
                          }}>
                            Адрес: {product.pickup_location}
                          </div>
                        )}
                      </div>

                      <div style={{
                        marginBottom: '1rem',
                        fontSize: '0.875rem',
                        color: '#6b7280'
                      }}>
                        <div>Тип древесины: {product.wood_type_id?.substring(0, 8)}...</div>
                        <div>Размещено: {new Date(product.created_at).toLocaleDateString('ru-RU')}</div>
                      </div>

                      <button
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          background: '#2563eb',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s ease'
                        }}
                        onClick={() => window.location.href = '/products'}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
                      >
                        Подробнее
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginTop: '2rem',
                  paddingTop: '2rem',
                  borderTop: '1px solid #e2e8f0'
                }}>
                  <button
                    style={{
                      padding: '0.5rem 1rem',
                      background: currentPage === 0 ? '#f3f4f6' : '#2563eb',
                      color: currentPage === 0 ? '#9ca3af' : 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem'
                    }}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                  >
                    ← Предыдущая
                  </button>

                  <div style={{
                    display: 'flex',
                    gap: '0.25rem'
                  }}>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const pageNum = currentPage < 3 ? i : currentPage - 2 + i;
                      if (pageNum >= totalPages) return null;

                      return (
                        <button
                          key={pageNum}
                          style={{
                            width: '40px',
                            height: '40px',
                            background: pageNum === currentPage ? '#2563eb' : 'white',
                            color: pageNum === currentPage ? 'white' : '#374151',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: pageNum === currentPage ? '600' : '400'
                          }}
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum + 1}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    style={{
                      padding: '0.5rem 1rem',
                      background: currentPage >= totalPages - 1 ? '#f3f4f6' : '#2563eb',
                      color: currentPage >= totalPages - 1 ? '#9ca3af' : 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem'
                    }}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                  >
                    Следующая →
                  </button>
                </div>
              )}

              {/* Button to go to full catalog */}
              <div style={{
                textAlign: 'center',
                marginTop: '2rem',
                paddingTop: '2rem',
                borderTop: '1px solid #e2e8f0'
              }}>
                <a
                  href="/products"
                  style={{
                    display: 'inline-block',
                    padding: '1rem 2rem',
                    background: '#2563eb',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
                >
                  Перейти к каталогу товаров →
                </a>
              </div>
            </>
          ) : !loading && (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
              <h3 style={{ marginBottom: '0.5rem', color: '#374151' }}>Товары не найдены</h3>
              <p>В данный момент товары отсутствуют</p>
            </div>
          )}
        </div>



        {/* Getting Started */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">{BUYER_TEXTS.GETTING_STARTED}</h2>
          </div>
          <div className="grid grid-auto">
            <div>
              <h3 style={{ marginBottom: '1rem' }}>{BUYER_TEXTS.FOR_BUYERS}</h3>
              <ol style={{ marginLeft: '1.5rem' }}>
                <li>{BUYER_TEXTS.BROWSE_AVAILABLE_PRODUCTS}</li>
                <li>{BUYER_TEXTS.USE_BOARD_ANALYZER}</li>
                <li>{BUYER_TEXTS.CONTACT_SELLERS_CHAT}</li>
                <li>{BUYER_TEXTS.NEGOTIATE_PRICES_DELIVERY}</li>
              </ol>
            </div>

            <div>
              <h3 style={{ marginBottom: '1rem' }}>{BUYER_TEXTS.FEATURES_AVAILABLE}</h3>
              <ul style={{ marginLeft: '1.5rem' }}>
                <li>{BUYER_TEXTS.PRODUCT_SEARCH_FILTERING}</li>
                <li>{BUYER_TEXTS.SELLER_PROFILES_RATINGS}</li>
                <li>{BUYER_TEXTS.AI_POWERED_BOARD_ANALYSIS}</li>
                <li>{BUYER_TEXTS.REAL_TIME_CHAT_SYSTEM}</li>
                <li>{BUYER_TEXTS.PRICE_COMPARISON_TOOLS}</li>
              </ul>
            </div>
          </div>
        </div>


      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .product-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1) !important;
        }

        .grid {
          display: grid;
          gap: 1.5rem;
        }

        .grid-auto {
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        }

        .grid-auto-sm {
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        }

        @media (max-width: 768px) {
          .grid-auto {
            grid-template-columns: 1fr;
          }
          .grid-auto-sm {
            grid-template-columns: 1fr;
          }
          .product-card {
            margin: 0 0.5rem;
          }
        }

        @media (max-width: 480px) {
          .container {
            padding: 0 0.75rem;
          }
          .product-card {
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default Home;
