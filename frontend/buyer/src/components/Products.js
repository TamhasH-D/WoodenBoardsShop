import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { apiService } from '../services/api';

function Products() {
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const { data, loading, error, refetch } = useApi(
    () => isSearching && searchQuery 
      ? apiService.searchProducts(searchQuery, page, 12)
      : apiService.getProducts(page, 12),
    [page, isSearching, searchQuery]
  );

  const { data: woodTypes } = useApi(() => apiService.getWoodTypes());

  const handleSearch = (e) => {
    e.preventDefault();
    setIsSearching(true);
    setPage(0);
    refetch();
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setPage(0);
    refetch();
  };

  return (
    <div>
      <div className="card">
        <h2>Browse Wood Products</h2>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="search-bar">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input search-input"
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
          {isSearching && (
            <button type="button" onClick={clearSearch} className="btn btn-secondary">
              Clear
            </button>
          )}
          <button type="button" onClick={refetch} className="btn btn-secondary" disabled={loading}>
            Refresh
          </button>
        </form>

        {isSearching && (
          <div style={{ marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#e6fffa', borderRadius: '0.375rem' }}>
            Searching for: <strong>"{searchQuery}"</strong>
          </div>
        )}
      </div>

      {error && (
        <div className="error">
          Failed to load products: {error}
        </div>
      )}

      {loading && <div className="loading">Loading products...</div>}

      {data && (
        <>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>Available Products</h3>
              <span>Total: {data.total || data.data?.length || 0}</span>
            </div>

            {data.data && data.data.length > 0 ? (
              <div className="grid grid-3">
                {data.data.map((product) => (
                  <div key={product.id} className="product-card">
                    <div style={{ marginBottom: '1rem' }}>
                      <div className="product-price">${product.price}</div>
                      <div className="product-volume">{product.volume} m³</div>
                      <div style={{ fontSize: '0.875rem', color: '#718096', marginTop: '0.25rem' }}>
                        Price per m³: ${(product.price / product.volume).toFixed(2)}
                      </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.875rem', color: '#4a5568', marginBottom: '0.25rem' }}>
                        <strong>Wood Type:</strong> {product.wood_type_id?.substring(0, 8)}...
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#4a5568', marginBottom: '0.25rem' }}>
                        <strong>Seller:</strong> {product.seller_id?.substring(0, 8)}...
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#4a5568' }}>
                        <strong>Listed:</strong> {new Date(product.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-primary" style={{ flex: 1 }}>
                        Contact Seller
                      </button>
                      <button className="btn btn-secondary">
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <h3>No products found</h3>
                {isSearching ? (
                  <p>Try adjusting your search terms or <button onClick={clearSearch} className="btn btn-primary">browse all products</button></p>
                ) : (
                  <p>No products are currently available. Check back later!</p>
                )}
              </div>
            )}

            {/* Pagination */}
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
                disabled={!data?.data || data.data.length < 12 || loading}
                className="btn btn-secondary"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Wood Types Info */}
      {woodTypes?.data && (
        <div className="card">
          <h3>Available Wood Types</h3>
          <div className="grid grid-3">
            {woodTypes.data.slice(0, 6).map((type) => (
              <div key={type.id} style={{ 
                padding: '1rem', 
                border: '1px solid #e2e8f0', 
                borderRadius: '0.375rem',
                textAlign: 'center'
              }}>
                <div style={{ fontWeight: 'bold' }}>
                  {type.name || `Type ${type.id.substring(0, 8)}`}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#718096' }}>
                  ID: {type.id.substring(0, 8)}...
                </div>
              </div>
            ))}
          </div>
          {woodTypes.data.length > 6 && (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <span style={{ color: '#718096' }}>
                And {woodTypes.data.length - 6} more wood types available
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Products;
