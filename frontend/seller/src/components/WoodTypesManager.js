import React, { useState } from 'react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { apiService } from '../services/api';

function WoodTypesManager() {
  const [activeTab, setActiveTab] = useState('types');
  const [typePage, setTypePage] = useState(0);
  const [pricePage, setPricePage] = useState(0);
  const [showAddTypeForm, setShowAddTypeForm] = useState(false);
  const [showAddPriceForm, setShowAddPriceForm] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [editingPrice, setEditingPrice] = useState(null);

  // New wood type form state
  const [newType, setNewType] = useState({
    neme: '',
    description: ''
  });

  // New price form state
  const [newPrice, setNewPrice] = useState({
    price_per_m3: '',
    wood_type_id: ''
  });

  // API hooks
  const { data: woodTypes, loading: typesLoading, error: typesError, refetch: refetchTypes } = 
    useApi(() => apiService.getWoodTypes(typePage, 10), [typePage]);
  
  const { data: woodTypePrices, loading: pricesLoading, error: pricesError, refetch: refetchPrices } = 
    useApi(() => apiService.getWoodTypePrices(pricePage, 10), [pricePage]);

  const { mutate, loading: mutating, error: mutationError, success } = useApiMutation();

  // Generate UUID for new entries
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : ((r & 0x3) | 0x8);
      return v.toString(16);
    });
  };

  // Wood type handlers
  const handleAddType = async (e) => {
    e.preventDefault();
    try {
      await mutate(apiService.createWoodType, {
        id: generateUUID(),
        ...newType
      });
      setNewType({ neme: '', description: '' });
      setShowAddTypeForm(false);
      refetchTypes();
    } catch (err) {
      console.error('Failed to add wood type:', err);
    }
  };

  const handleUpdateType = async (e) => {
    e.preventDefault();
    try {
      await mutate(apiService.updateWoodType, editingType.id, {
        neme: editingType.neme,
        description: editingType.description
      });
      setEditingType(null);
      refetchTypes();
    } catch (err) {
      console.error('Failed to update wood type:', err);
    }
  };

  const handleDeleteType = async (typeId) => {
    if (window.confirm('Are you sure you want to delete this wood type? This will also delete all associated prices.')) {
      try {
        await mutate(apiService.deleteWoodType, typeId);
        refetchTypes();
        refetchPrices(); // Refresh prices as they might be affected
      } catch (err) {
        console.error('Failed to delete wood type:', err);
      }
    }
  };

  // Price handlers
  const handleAddPrice = async (e) => {
    e.preventDefault();
    try {
      await mutate(apiService.createWoodTypePrice, {
        id: generateUUID(),
        ...newPrice,
        price_per_m3: parseFloat(newPrice.price_per_m3)
      });
      setNewPrice({ price_per_m3: '', wood_type_id: '' });
      setShowAddPriceForm(false);
      refetchPrices();
    } catch (err) {
      console.error('Failed to add price:', err);
    }
  };

  const handleUpdatePrice = async (e) => {
    e.preventDefault();
    try {
      await mutate(apiService.updateWoodTypePrice, editingPrice.id, {
        price_per_m3: parseFloat(editingPrice.price_per_m3)
      });
      setEditingPrice(null);
      refetchPrices();
    } catch (err) {
      console.error('Failed to update price:', err);
    }
  };

  const handleDeletePrice = async (priceId) => {
    if (window.confirm('Are you sure you want to delete this price?')) {
      try {
        await mutate(apiService.deleteWoodTypePrice, priceId);
        refetchPrices();
      } catch (err) {
        console.error('Failed to delete price:', err);
      }
    }
  };

  // Helper function to get wood type name by ID
  const getWoodTypeName = (woodTypeId) => {
    const woodType = woodTypes?.data?.find(type => type.id === woodTypeId);
    return woodType ? woodType.neme : `Wood Type ${woodTypeId?.substring(0, 8)}...`;
  };

  return (
    <div className="card">
      <div style={{ marginBottom: '1rem' }}>
        <h2>Wood Types & Prices Management</h2>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          Manage wood types and their prices. All changes will be visible to buyers immediately.
        </p>
        
        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
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
      </div>

      {/* Error and Success Messages */}
      {mutationError && (
        <div className="error" style={{ marginBottom: '1rem' }}>
          Operation failed: {mutationError}
        </div>
      )}

      {success && (
        <div className="success" style={{ marginBottom: '1rem' }}>
          Operation completed successfully!
        </div>
      )}

      {/* Wood Types Tab */}
      {activeTab === 'types' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Wood Types</h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => setShowAddTypeForm(!showAddTypeForm)} 
                className="btn btn-success"
              >
                {showAddTypeForm ? 'Cancel' : 'Add Wood Type'}
              </button>
              <button onClick={refetchTypes} className="btn btn-secondary" disabled={typesLoading}>
                {typesLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>

          {typesError && (
            <div className="error">
              Failed to load wood types: {typesError}
            </div>
          )}

          {/* Add Type Form */}
          {showAddTypeForm && (
            <div className="card" style={{ backgroundColor: '#f7fafc', marginBottom: '1rem' }}>
              <h4>Add New Wood Type</h4>
              <form onSubmit={handleAddType}>
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newType.neme}
                    onChange={(e) => setNewType({...newType, neme: e.target.value})}
                    placeholder="e.g., Oak, Pine, Birch"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input"
                    value={newType.description}
                    onChange={(e) => setNewType({...newType, description: e.target.value})}
                    placeholder="Optional description of the wood type"
                    rows="3"
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={mutating}>
                  {mutating ? 'Adding...' : 'Add Wood Type'}
                </button>
              </form>
            </div>
          )}

          {/* Types List */}
          {typesLoading && <div className="loading">Loading wood types...</div>}

          {woodTypes && (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <p>Total wood types: {woodTypes.pagination?.total || woodTypes.data?.length || 0}</p>
              </div>

              {woodTypes.data && woodTypes.data.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Description</th>
                      <th>ID</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {woodTypes.data.map((type) => (
                      <tr key={type.id}>
                        <td>
                          {editingType?.id === type.id ? (
                            <input
                              type="text"
                              value={editingType.neme}
                              onChange={(e) => setEditingType({...editingType, neme: e.target.value})}
                              className="form-input"
                              style={{ margin: 0 }}
                            />
                          ) : (
                            <strong>{type.neme}</strong>
                          )}
                        </td>
                        <td>
                          {editingType?.id === type.id ? (
                            <textarea
                              value={editingType.description || ''}
                              onChange={(e) => setEditingType({...editingType, description: e.target.value})}
                              className="form-input"
                              style={{ margin: 0 }}
                              rows="2"
                            />
                          ) : (
                            type.description || <em style={{ color: '#999' }}>No description</em>
                          )}
                        </td>
                        <td style={{ fontSize: '0.8em', color: '#666' }}>
                          {type.id.substring(0, 8)}...
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {editingType?.id === type.id ? (
                              <>
                                <button
                                  onClick={handleUpdateType}
                                  className="btn btn-success"
                                  disabled={mutating}
                                  style={{ fontSize: '0.8em', padding: '0.25rem 0.5rem' }}
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingType(null)}
                                  className="btn btn-secondary"
                                  style={{ fontSize: '0.8em', padding: '0.25rem 0.5rem' }}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => setEditingType(type)}
                                  className="btn btn-secondary"
                                  style={{ fontSize: '0.8em', padding: '0.25rem 0.5rem' }}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteType(type.id)}
                                  className="btn btn-secondary"
                                  disabled={mutating}
                                  style={{ 
                                    fontSize: '0.8em', 
                                    padding: '0.25rem 0.5rem',
                                    backgroundColor: '#fed7d7', 
                                    color: '#c53030' 
                                  }}
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <p>No wood types found.</p>
                  <p>Add your first wood type to get started!</p>
                </div>
              )}

              {/* Pagination for Types */}
              <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button
                  onClick={() => setTypePage(Math.max(0, typePage - 1))}
                  disabled={typePage === 0 || typesLoading}
                  className="btn btn-secondary"
                >
                  Previous
                </button>
                <span>Page {typePage + 1}</span>
                <button
                  onClick={() => setTypePage(typePage + 1)}
                  disabled={!woodTypes?.data || woodTypes.data.length < 10 || typesLoading}
                  className="btn btn-secondary"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Prices Tab */}
      {activeTab === 'prices' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Wood Type Prices</h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setShowAddPriceForm(!showAddPriceForm)}
                className="btn btn-success"
              >
                {showAddPriceForm ? 'Cancel' : 'Add Price'}
              </button>
              <button onClick={refetchPrices} className="btn btn-secondary" disabled={pricesLoading}>
                {pricesLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>

          {pricesError && (
            <div className="error">
              Failed to load prices: {pricesError}
            </div>
          )}

          {/* Add Price Form */}
          {showAddPriceForm && (
            <div className="card" style={{ backgroundColor: '#f7fafc', marginBottom: '1rem' }}>
              <h4>Add New Price</h4>
              <form onSubmit={handleAddPrice}>
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Wood Type *</label>
                    <select
                      className="form-input"
                      value={newPrice.wood_type_id}
                      onChange={(e) => setNewPrice({...newPrice, wood_type_id: e.target.value})}
                      required
                    >
                      <option value="">Select wood type...</option>
                      {woodTypes?.data?.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.neme}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price per m³ ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-input"
                      value={newPrice.price_per_m3}
                      onChange={(e) => setNewPrice({...newPrice, price_per_m3: e.target.value})}
                      placeholder="e.g., 150.00"
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={mutating}>
                  {mutating ? 'Adding...' : 'Add Price'}
                </button>
              </form>
            </div>
          )}

          {/* Prices List */}
          {pricesLoading && <div className="loading">Loading prices...</div>}

          {woodTypePrices && (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <p>Total prices: {woodTypePrices.pagination?.total || woodTypePrices.data?.length || 0}</p>
              </div>

              {woodTypePrices.data && woodTypePrices.data.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Wood Type</th>
                      <th>Price per m³ ($)</th>
                      <th>Created</th>
                      <th>ID</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {woodTypePrices.data.map((price) => (
                      <tr key={price.id}>
                        <td>
                          <strong>{getWoodTypeName(price.wood_type_id)}</strong>
                        </td>
                        <td>
                          {editingPrice?.id === price.id ? (
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={editingPrice.price_per_m3}
                              onChange={(e) => setEditingPrice({...editingPrice, price_per_m3: e.target.value})}
                              className="form-input"
                              style={{ margin: 0, width: '120px' }}
                            />
                          ) : (
                            `$${price.price_per_m3.toFixed(2)}`
                          )}
                        </td>
                        <td style={{ fontSize: '0.9em', color: '#666' }}>
                          {new Date(price.created_at).toLocaleDateString()}
                        </td>
                        <td style={{ fontSize: '0.8em', color: '#666' }}>
                          {price.id.substring(0, 8)}...
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {editingPrice?.id === price.id ? (
                              <>
                                <button
                                  onClick={handleUpdatePrice}
                                  className="btn btn-success"
                                  disabled={mutating}
                                  style={{ fontSize: '0.8em', padding: '0.25rem 0.5rem' }}
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingPrice(null)}
                                  className="btn btn-secondary"
                                  style={{ fontSize: '0.8em', padding: '0.25rem 0.5rem' }}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => setEditingPrice(price)}
                                  className="btn btn-secondary"
                                  style={{ fontSize: '0.8em', padding: '0.25rem 0.5rem' }}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeletePrice(price.id)}
                                  className="btn btn-secondary"
                                  disabled={mutating}
                                  style={{
                                    fontSize: '0.8em',
                                    padding: '0.25rem 0.5rem',
                                    backgroundColor: '#fed7d7',
                                    color: '#c53030'
                                  }}
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <p>No prices found.</p>
                  <p>Add your first price to get started!</p>
                </div>
              )}

              {/* Pagination for Prices */}
              <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button
                  onClick={() => setPricePage(Math.max(0, pricePage - 1))}
                  disabled={pricePage === 0 || pricesLoading}
                  className="btn btn-secondary"
                >
                  Previous
                </button>
                <span>Page {pricePage + 1}</span>
                <button
                  onClick={() => setPricePage(pricePage + 1)}
                  disabled={!woodTypePrices?.data || woodTypePrices.data.length < 10 || pricesLoading}
                  className="btn btn-secondary"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default WoodTypesManager;
