import React, { useState } from 'react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { apiService } from '../services/api';

// Mock seller ID - in real app this would come from authentication
const MOCK_SELLER_ID = '123e4567-e89b-12d3-a456-426614174000';

function Products() {
  const [page, setPage] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    volume: '',
    price: '',
    wood_type_id: '',
    seller_id: MOCK_SELLER_ID
  });

  const { data, loading, error, refetch } = useApi(() => apiService.getSellerProducts(MOCK_SELLER_ID, page, 10), [page]);
  const { data: woodTypes } = useApi(() => apiService.getWoodTypes());
  const { mutate, loading: mutating, error: mutationError, success } = useApiMutation();

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await mutate(apiService.createProduct, {
        ...newProduct,
        volume: parseFloat(newProduct.volume),
        price: parseFloat(newProduct.price)
      });
      setNewProduct({ volume: '', price: '', wood_type_id: '', seller_id: MOCK_SELLER_ID });
      setShowAddForm(false);
      refetch();
    } catch (err) {
      console.error('Failed to add product:', err);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await mutate(apiService.deleteProduct, productId);
        refetch();
      } catch (err) {
        console.error('Failed to delete product:', err);
      }
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>My Products</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-success">
            {showAddForm ? 'Cancel' : 'Add Product'}
          </button>
          <button onClick={refetch} className="btn btn-secondary" disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
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

      {showAddForm && (
        <div className="card" style={{ backgroundColor: '#f7fafc', marginBottom: '1rem' }}>
          <h3>Add New Product</h3>
          <form onSubmit={handleAddProduct}>
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Volume (m³)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={newProduct.volume}
                  onChange={(e) => setNewProduct({...newProduct, volume: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Wood Type</label>
              <select
                className="form-input"
                value={newProduct.wood_type_id}
                onChange={(e) => setNewProduct({...newProduct, wood_type_id: e.target.value})}
                required
              >
                <option value="">Select wood type...</option>
                {woodTypes?.data?.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name || `Wood Type ${type.id.substring(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={mutating}>
              {mutating ? 'Adding...' : 'Add Product'}
            </button>
          </form>
        </div>
      )}

      {loading && <div className="loading">Loading products...</div>}

      {data && (
        <>
          <div style={{ marginBottom: '1rem' }}>
            <p>Total products: {data.total || data.data?.length || 0}</p>
          </div>

          {data.data && data.data.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Volume (m³)</th>
                  <th>Price ($)</th>
                  <th>Wood Type</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id.substring(0, 8)}...</td>
                    <td>{product.volume}</td>
                    <td>${product.price}</td>
                    <td>{product.wood_type_id?.substring(0, 8)}...</td>
                    <td>{new Date(product.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
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
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>No products found.</p>
              <p>Add your first product to get started!</p>
            </div>
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

export default Products;
