import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { BUYER_TEXTS } from '../utils/localization';
import ProductCard from './ProductCard';


function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [woodTypes, setWoodTypes] = useState([]);
  const [sellers, setSellers] = useState([]);
  const navigate = useNavigate();

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

  // Загружаем дополнительные данные
  const loadWoodTypes = useCallback(async () => {
    try {
      const result = await apiService.getWoodTypes();
      setWoodTypes(result.data || []);
    } catch (error) {
      console.error('Error loading wood types:', error);
    }
  }, []);

  const loadSellers = useCallback(async () => {
    try {
      const result = await apiService.getSellers();
      setSellers(result.data || []);
    } catch (error) {
      console.error('Error loading sellers:', error);
    }
  }, []);

  // Загружаем товары только при монтировании компонента
  useEffect(() => {
    loadProducts(currentPage);
    loadWoodTypes();
    loadSellers();
  }, [currentPage, loadProducts, loadWoodTypes, loadSellers]);



  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const totalPages = Math.ceil(totalProducts / pageSize);

  // Функции для получения названий
  const getWoodTypeName = (woodTypeId) => {
    const woodType = woodTypes.find(wt => wt.id === woodTypeId);
    return woodType ? woodType.neme : 'Не указан';
  };

  const getWoodTypePrice = (woodTypeId) => {
    const woodType = woodTypes.find(wt => wt.id === woodTypeId);
    return woodType ? woodType.price_per_cubic_meter : 0;
  };

  const getSellerName = (sellerId) => {
    const seller = sellers.find(s => s.id === sellerId);
    return seller ? seller.company_name || seller.first_name || 'Неизвестный продавец' : 'Неизвестный продавец';
  };

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
                  <ProductCard
                    key={product.id}
                    product={product}
                    woodTypeName={getWoodTypeName(product.wood_type_id)}
                    woodTypePrice={getWoodTypePrice(product.wood_type_id)}
                    sellerName={getSellerName(product.seller_id)}
                    navigate={navigate}
                    variant="home"
                  />
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
