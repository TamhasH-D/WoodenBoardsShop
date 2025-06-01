import React, { useState } from 'react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { apiService } from '../services/api';

const WoodTypesManagement = React.memo(() => {
  const [activeTab, setActiveTab] = useState('types');
  const [page, setPage] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddPriceForm, setShowAddPriceForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [priceFormData, setPriceFormData] = useState({ wood_type_id: '', price_per_m3: '' });

  // API hooks for wood types
  const { data: woodTypes, loading: typesLoading, error: typesError, refetch: refetchTypes } = useApi(
    () => apiService.getWoodTypes(page, 10),
    [page]
  );

  // API hooks for prices
  const { data: prices, loading: pricesLoading, error: pricesError, refetch: refetchPrices } = useApi(
    () => apiService.getWoodTypePrices(page, 10),
    [page]
  );

  const { mutate, loading: mutating, error: mutationError, success } = useApiMutation();

  const handleAddWoodType = async (e) => {
    e.preventDefault();
    try {
      await mutate(() => apiService.createWoodType(formData));
      setFormData({ name: '', description: '' });
      setShowAddForm(false);
      refetchTypes();
    } catch (error) {
      console.error('Add failed:', error);
    }
  };

  const handleAddPrice = async (e) => {
    e.preventDefault();
    try {
      await mutate(() => apiService.createWoodTypePrice({
        wood_type_id: priceFormData.wood_type_id,
        price_per_m3: parseFloat(priceFormData.price_per_m3)
      }));
      setPriceFormData({ wood_type_id: '', price_per_m3: '' });
      setShowAddPriceForm(false);
      refetchPrices();
    } catch (error) {
      console.error('Add price failed:', error);
    }
  };

  const handleDeleteWoodType = async (id) => {
    if (window.confirm('Are you sure you want to delete this wood type?')) {
      try {
        await mutate(() => apiService.deleteWoodType(id));
        refetchTypes();
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleDeletePrice = async (id) => {
    if (window.confirm('Are you sure you want to delete this price?')) {
      try {
        await mutate(() => apiService.deleteWoodTypePrice(id));
        refetchPrices();
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  // Helper variables for current tab data
  // const currentData = activeTab === 'types' ? woodTypes : prices;
  // const currentLoading = activeTab === 'types' ? typesLoading : pricesLoading;
  // const currentError = activeTab === 'types' ? typesError : pricesError;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Wood Types & Prices</h1>
        <p className="page-description">Manage system-wide wood types and pricing</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('types')}
          className={`btn ${activeTab === 'types' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Wood Types
        </button>
        <button
          onClick={() => setActiveTab('prices')}
          className={`btn ${activeTab === 'prices' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Prices
        </button>
      </div>

      {/* Error and Success Messages */}
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

      {activeTab === 'types' && (
        <div className="card mb-6">
          <div className="card-header">
            <h2 className="card-title">Wood Types</h2>
          </div>

          <div className="flex justify-between items-center mb-4">
            <div>
              <p>Total wood types: {woodTypes?.total || 0}</p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowAddForm(!showAddForm)}
                className={`btn ${showAddForm ? 'btn-secondary' : 'btn-primary'}`}
              >
                {showAddForm ? 'Cancel' : 'Add Wood Type'}
              </button>
              <button 
                onClick={refetchTypes}
                className="btn btn-secondary" 
                disabled={typesLoading}
              >
                {typesLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <div className="card mb-4">
              <div className="card-header">
                <h3 className="card-title">Add New Wood Type</h3>
              </div>
              <form onSubmit={handleAddWoodType}>
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="btn btn-primary" disabled={mutating}>
                    {mutating ? 'Adding...' : 'Add Wood Type'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowAddForm(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {typesLoading && <div className="loading">Loading wood types...</div>}
          
          {typesError && (
            <div className="error">
              <strong>Failed to load wood types:</strong> {typesError}
            </div>
          )}

          {woodTypes && woodTypes.data && woodTypes.data.length > 0 ? (
            <div>
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {woodTypes.data.map((type) => (
                    <tr key={type.id}>
                      <td>
                        <strong>{type.id.substring(0, 8)}...</strong>
                      </td>
                      <td>{type.name}</td>
                      <td>{type.description || 'N/A'}</td>
                      <td>
                        {new Date(type.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <button
                          onClick={() => handleDeleteWoodType(type.id)}
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
                  disabled={page === 0 || typesLoading}
                  className="btn btn-secondary"
                >
                  Previous
                </button>
                <span>Page {page + 1}</span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={!woodTypes?.data || woodTypes.data.length < 10 || typesLoading}
                  className="btn btn-secondary"
                >
                  Next
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p>No wood types found.</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="btn btn-primary mt-4"
              >
                Add Your First Wood Type
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'prices' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Wood Type Prices</h2>
          </div>

          <div className="flex justify-between items-center mb-4">
            <div>
              <p>Total prices: {prices?.total || 0}</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowAddPriceForm(!showAddPriceForm)}
                className={`btn ${showAddPriceForm ? 'btn-secondary' : 'btn-primary'}`}
              >
                {showAddPriceForm ? 'Cancel' : 'Add Price'}
              </button>
              <button
                onClick={refetchPrices}
                className="btn btn-secondary"
                disabled={pricesLoading}
              >
                {pricesLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Add Price Form */}
          {showAddPriceForm && (
            <div className="card mb-4">
              <div className="card-header">
                <h3 className="card-title">Add New Price</h3>
              </div>
              <form onSubmit={handleAddPrice}>
                <div className="form-group">
                  <label className="form-label">Wood Type</label>
                  <select
                    value={priceFormData.wood_type_id}
                    onChange={(e) => setPriceFormData({ ...priceFormData, wood_type_id: e.target.value })}
                    className="form-input"
                    required
                  >
                    <option value="">Select Wood Type</option>
                    {woodTypes?.data?.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Price per m³ (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={priceFormData.price_per_m3}
                    onChange={(e) => setPriceFormData({ ...priceFormData, price_per_m3: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="btn btn-primary" disabled={mutating}>
                    {mutating ? 'Adding...' : 'Add Price'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddPriceForm(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {pricesLoading && <div className="loading">Loading prices...</div>}
          
          {pricesError && (
            <div className="error">
              <strong>Failed to load prices:</strong> {pricesError}
            </div>
          )}

          {prices && prices.data && prices.data.length > 0 ? (
            <div>
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Wood Type</th>
                    <th>Price per m³</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {prices.data.map((price) => (
                    <tr key={price.id}>
                      <td>
                        <strong>{price.id.substring(0, 8)}...</strong>
                      </td>
                      <td>{price.wood_type_id?.substring(0, 8)}...</td>
                      <td>€{price.price_per_m3?.toFixed(2) || 0}</td>
                      <td>
                        {new Date(price.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <button
                          onClick={() => handleDeletePrice(price.id)}
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
                  disabled={page === 0 || pricesLoading}
                  className="btn btn-secondary"
                >
                  Previous
                </button>
                <span>Page {page + 1}</span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={!prices?.data || prices.data.length < 10 || pricesLoading}
                  className="btn btn-secondary"
                >
                  Next
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p>No prices found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default WoodTypesManagement;
