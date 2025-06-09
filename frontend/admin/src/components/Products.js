import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { apiService } from '../services/api';
import ErrorToast, { useErrorHandler } from './ui/ErrorToast';

function Products() {
  const [page, setPage] = useState(0);

  // Error handling
  const { error: toastError, showError, clearError } = useErrorHandler();

  // Create stable API function to prevent infinite loops
  const productsApiFunction = useMemo(() => () => apiService.getProducts(page, 10), [page]);
  const { data, loading, error, refetch } = useApi(productsApiFunction, [page]);
  const { mutate, loading: mutating, error: mutationError, success } = useApiMutation();

  // Handle errors with toast notifications
  useEffect(() => {
    if (error || mutationError) {
      const errorMessage = error || mutationError;
      showError(errorMessage);
    }
  }, [error, mutationError, showError]);

  const handleDelete = useCallback(async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await mutate(apiService.deleteProduct, id);
        refetch(); // Refresh the list
      } catch (err) {
        // Remove console.error in production
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to delete product:', err);
        }
      }
    }
  }, [mutate, refetch]);

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Products Management</h2>
        <button onClick={refetch} className="btn btn-secondary" disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="error">
          Failed to load products: {error}
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

      {loading && <div className="loading">Loading products...</div>}

      {data && (
        <>
          <div style={{ marginBottom: '1rem' }}>
            <p>Total products: {data.total || 'Unknown'}</p>
          </div>

          {data.data && data.data.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Volume</th>
                  <th>Price</th>
                  <th>Seller ID</th>
                  <th>Wood Type ID</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id.substring(0, 8)}...</td>
                    <td>{product.volume}</td>
                    <td>{product.price}</td>
                    <td>{product.seller_id?.substring(0, 8)}...</td>
                    <td>{product.wood_type_id?.substring(0, 8)}...</td>
                    <td>{new Date(product.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => handleDelete(product.id)}
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
            <p>No products found.</p>
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

      {/* Compact error notifications */}
      <ErrorToast error={toastError} onDismiss={clearError} />
    </div>
  );
}

export default Products;
