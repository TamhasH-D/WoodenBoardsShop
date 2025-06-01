import React, { useState } from 'react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { apiService } from '../services/api';

// Mock seller ID - in real app this would come from authentication
const MOCK_SELLER_ID = '123e4567-e89b-12d3-a456-426614174000';

function Products() {
  const [page, setPage] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    volume: '',
    price: '',
    delivery_possible: false,
    pickup_location: '',
    wood_type_id: '',
    seller_id: MOCK_SELLER_ID
  });

  const { data, loading, error, refetch } = useApi(() => apiService.getSellerProducts(MOCK_SELLER_ID, page, 10), [page]);
  const { data: woodTypes } = useApi(() => apiService.getWoodTypes(0, 100)); // Get more wood types for dropdown
  const { mutate, loading: mutating, error: mutationError, success } = useApiMutation();

  // Helper function to get wood type name by ID
  const getWoodTypeName = (woodTypeId) => {
    const woodType = woodTypes?.data?.find(type => type.id === woodTypeId);
    return woodType ? woodType.neme : `Wood Type ${woodTypeId?.substring(0, 8)}...`;
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      // Generate UUID for the product
      const productId = crypto.randomUUID();

      await mutate(() => apiService.createProduct({
        id: productId,
        title: newProduct.title,
        description: newProduct.description || null,
        volume: parseFloat(newProduct.volume),
        price: parseFloat(newProduct.price),
        delivery_possible: newProduct.delivery_possible,
        pickup_location: newProduct.pickup_location || null,
        seller_id: MOCK_SELLER_ID,
        wood_type_id: newProduct.wood_type_id
      }));
      setNewProduct({
        title: '',
        description: '',
        volume: '',
        price: '',
        delivery_possible: false,
        pickup_location: '',
        wood_type_id: '',
        seller_id: MOCK_SELLER_ID
      });
      setShowAddForm(false);
      refetch();
    } catch (err) {
      console.error('Failed to add product:', err);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await mutate(() => apiService.deleteProduct(productId));
        refetch();
      } catch (err) {
        console.error('Failed to delete product:', err);
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Products</h1>
        <p className="page-description">Manage your wood product inventory</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <p>Total products: {data?.total || data?.data?.length || 0}</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`btn ${showAddForm ? 'btn-secondary' : 'btn-primary'}`}
          >
            {showAddForm ? 'Cancel' : 'Add Product'}
          </button>
          <button
            onClick={refetch}
            className="btn btn-secondary"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error mb-4">
          <strong>Products Loading Issue:</strong> {error}
          <br />
          <small>This may occur if the seller doesn't exist in the database yet. Try refreshing or creating a product to initialize your seller account.</small>
          <div style={{ marginTop: '1rem' }}>
            <button onClick={refetch} className="btn btn-secondary">
              Retry Loading Products
            </button>
          </div>
        </div>
      )}

      {mutationError && (
        <div className="error mb-4">
          <strong>Operation failed:</strong> {mutationError}
        </div>
      )}

      {success && (
        <div className="success mb-4">
          <strong>Success:</strong> Operation completed successfully!
        </div>
      )}

      {showAddForm && (
        <div className="card mb-6">
          <div className="card-header">
            <h2 className="card-title">Add New Product</h2>
          </div>
          <form onSubmit={handleAddProduct}>
            <div className="form-group">
              <label className="form-label">Product Title *</label>
              <input
                type="text"
                className="form-input"
                value={newProduct.title}
                onChange={(e) => setNewProduct({...newProduct, title: e.target.value})}
                placeholder="Enter product title"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                value={newProduct.description}
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                placeholder="Enter product description (optional)"
                rows="3"
              />
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Volume (m³) *</label>
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
                <label className="form-label">Price ($) *</label>
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
              <label className="form-label">Wood Type *</label>
              <select
                className="form-input"
                value={newProduct.wood_type_id}
                onChange={(e) => setNewProduct({...newProduct, wood_type_id: e.target.value})}
                required
              >
                <option value="">Select wood type...</option>
                {woodTypes?.data?.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Pickup Location</label>
              <input
                type="text"
                className="form-input"
                value={newProduct.pickup_location}
                onChange={(e) => setNewProduct({...newProduct, pickup_location: e.target.value})}
                placeholder="Enter pickup location (optional)"
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={newProduct.delivery_possible}
                  onChange={(e) => setNewProduct({...newProduct, delivery_possible: e.target.checked})}
                />
                Delivery Available
              </label>
            </div>

            <button type="submit" className="btn btn-primary" disabled={mutating}>
              {mutating ? 'Adding...' : 'Add Product'}
            </button>
          </form>
        </div>
      )}

      {loading && (
        <div className="loading">Loading products...</div>
      )}

      {data && (
        <>
          {data.data && data.data.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Volume (m³)</th>
                  <th>Price ($)</th>
                  <th>Wood Type</th>
                  <th>Delivery</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div>
                        <strong>{product.title}</strong>
                        {product.description && (
                          <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                            {product.description.length > 50
                              ? `${product.description.substring(0, 50)}...`
                              : product.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{product.volume}</td>
                    <td>${product.price}</td>
                    <td>{getWoodTypeName(product.wood_type_id)}</td>
                    <td>
                      <span className={`status ${product.delivery_possible ? 'status-success' : 'status-warning'}`}>
                        {product.delivery_possible ? 'Available' : 'Pickup Only'}
                      </span>
                    </td>
                    <td>{new Date(product.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="btn btn-secondary"
                        disabled={mutating}
                      >
                        {mutating ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center">
              <p>No products found.</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="btn btn-primary mt-4"
              >
                Add Your First Product
              </button>
            </div>
          )}

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
