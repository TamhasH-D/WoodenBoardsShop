import React, { useState } from 'react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { apiService } from '../services/api';

const ProductManagement = React.memo(() => {
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [filterBy, setFilterBy] = useState('all'); // all, with_delivery, pickup_only

  const { data: products, loading, error, refetch } = useApi(
    () => apiService.getProducts(page, 10),
    [page]
  );

  const { mutate, loading: mutating, error: mutationError, success } = useApiMutation();

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await mutate(() => apiService.deleteProduct(id));
        refetch();
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;

    if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
      try {
        await mutate(() => apiService.bulkDeleteProducts(selectedProducts));
        setSelectedProducts([]);
        refetch();
      } catch (error) {
        console.error('Bulk delete failed:', error);
      }
    }
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = (products) => {
    const productIds = products.map(product => product.id);
    setSelectedProducts(prev =>
      prev.length === productIds.length ? [] : productIds
    );
  };

  // Filter products based on search and filter criteria
  const filteredProducts = products?.data?.filter(product => {
    const matchesSearch = searchTerm === '' ||
      product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.seller_id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterBy === 'all' ||
      (filterBy === 'with_delivery' && product.delivery_possible) ||
      (filterBy === 'pickup_only' && !product.delivery_possible);

    return matchesSearch && matchesFilter;
  }) || [];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Product Management</h1>
        <p className="page-description">View and manage all products across sellers</p>
      </div>

      {/* Error and Success Messages */}
      {mutationError && (
        <div className="error mb-4">
          <strong>Operation failed:</strong> {mutationError}
        </div>
      )}

      {success && (
        <div className="success mb-4">
          <strong>Success:</strong> Product deleted successfully!
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">All Products</h2>
        </div>

        {/* Search and Filters */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-4 items-center">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ width: '300px' }}
            />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="form-input"
              style={{ width: '150px' }}
            >
              <option value="all">All Products</option>
              <option value="with_delivery">With Delivery</option>
              <option value="pickup_only">Pickup Only</option>
            </select>
            <p>Total: {products?.total || 0} | Filtered: {filteredProducts.length}</p>
          </div>
          <div className="flex gap-4">
            {selectedProducts.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="btn btn-secondary"
                disabled={mutating}
              >
                Delete Selected ({selectedProducts.length})
              </button>
            )}
            <button
              onClick={refetch}
              className="btn btn-secondary"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {loading && <div className="loading">Loading products...</div>}
        
        {error && (
          <div className="error">
            <strong>Failed to load products:</strong> {error}
          </div>
        )}

        {filteredProducts.length > 0 ? (
          <div>
            <table className="table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === filteredProducts.length}
                      onChange={() => handleSelectAll(filteredProducts)}
                    />
                  </th>
                  <th>Title</th>
                  <th>Seller</th>
                  <th>Volume</th>
                  <th>Price</th>
                  <th>Delivery</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                      />
                    </td>
                    <td>
                      <div>
                        <strong>{product.title || 'Untitled'}</strong>
                        {product.description && (
                          <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                            {product.description.length > 50
                              ? `${product.description.substring(0, 50)}...`
                              : product.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      {product.seller_id ? product.seller_id.substring(0, 8) + '...' : 'N/A'}
                    </td>
                    <td>
                      {product.volume} m³
                    </td>
                    <td>
                      €{product.price?.toFixed(2) || 0}
                    </td>
                    <td>
                      <span className={`status ${product.delivery_possible ? 'status-success' : 'status-warning'}`}>
                        {product.delivery_possible ? 'Available' : 'Pickup Only'}
                      </span>
                    </td>
                    <td>
                      {new Date(product.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="btn btn-secondary"
                        disabled={mutating}
                        style={{ fontSize: '0.8em', padding: '0.25rem 0.5rem' }}
                      >
                        Delete
                      </button>
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
                disabled={!products?.data || products.data.length < 10 || loading}
                className="btn btn-secondary"
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p>No products found.</p>
          </div>
        )}
      </div>
    </div>
  );
});

export default ProductManagement;
