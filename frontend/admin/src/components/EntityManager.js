import React, { useState, useEffect } from 'react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { apiService } from '../services/api';

// Entity configurations
const ENTITY_CONFIGS = {
  buyers: {
    title: 'Buyers',
    icon: '👥',
    fields: [
      { key: 'id', label: 'ID', type: 'uuid', readonly: true },
      { key: 'keycloak_uuid', label: 'Keycloak UUID', type: 'uuid', required: true },
      { key: 'is_online', label: 'Online Status', type: 'boolean' },
      { key: 'created_at', label: 'Created', type: 'datetime', readonly: true },
      { key: 'updated_at', label: 'Updated', type: 'datetime', readonly: true }
    ],
    api: {
      getAll: (page, size) => apiService.getBuyers(page, size),
      getOne: (id) => apiService.getBuyer(id),
      create: (data) => apiService.createBuyer(data),
      update: (id, data) => apiService.updateBuyer(id, data),
      delete: (id) => apiService.deleteBuyer(id),
      bulkDelete: (ids) => apiService.bulkDeleteBuyers(ids)
    }
  },
  sellers: {
    title: 'Sellers',
    icon: '🏪',
    fields: [
      { key: 'id', label: 'ID', type: 'uuid', readonly: true },
      { key: 'keycloak_uuid', label: 'Keycloak UUID', type: 'uuid', required: true },
      { key: 'is_online', label: 'Online Status', type: 'boolean' },
      { key: 'created_at', label: 'Created', type: 'datetime', readonly: true },
      { key: 'updated_at', label: 'Updated', type: 'datetime', readonly: true }
    ],
    api: {
      getAll: (page, size) => apiService.getSellers(page, size),
      getOne: (id) => apiService.getSeller(id),
      create: (data) => apiService.createSeller(data),
      update: (id, data) => apiService.updateSeller(id, data),
      delete: (id) => apiService.deleteSeller(id),
      bulkDelete: (ids) => apiService.bulkDeleteSellers(ids)
    }
  },
  products: {
    title: 'Products',
    icon: '📦',
    fields: [
      { key: 'id', label: 'ID', type: 'uuid', readonly: true },
      { key: 'volume', label: 'Volume (m³)', type: 'number', required: true, step: 0.01 },
      { key: 'price', label: 'Price ($)', type: 'number', required: true, step: 0.01 },
      { key: 'wood_type_id', label: 'Wood Type', type: 'select', required: true, 
        options: 'woodTypes', optionValue: 'id', optionLabel: 'neme' },
      { key: 'seller_id', label: 'Seller', type: 'select', required: true,
        options: 'sellers', optionValue: 'id', optionLabel: 'id' },
      { key: 'created_at', label: 'Created', type: 'datetime', readonly: true },
      { key: 'updated_at', label: 'Updated', type: 'datetime', readonly: true }
    ],
    api: {
      getAll: (page, size) => apiService.getProducts(page, size),
      getOne: (id) => apiService.getProduct(id),
      create: (data) => apiService.createProduct(data),
      update: (id, data) => apiService.updateProduct(id, data),
      delete: (id) => apiService.deleteProduct(id),
      bulkDelete: (ids) => apiService.bulkDeleteProducts(ids)
    }
  },
  woodTypes: {
    title: 'Wood Types',
    icon: '🌳',
    fields: [
      { key: 'id', label: 'ID', type: 'uuid', readonly: true },
      { key: 'neme', label: 'Name', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' }
    ],
    api: {
      getAll: (page, size) => apiService.getWoodTypes(page, size),
      getOne: (id) => apiService.getWoodType(id),
      create: (data) => apiService.createWoodType(data),
      update: (id, data) => apiService.updateWoodType(id, data),
      delete: (id) => apiService.deleteWoodType(id),
      bulkDelete: (ids) => apiService.bulkDeleteWoodTypes(ids)
    }
  },
  prices: {
    title: 'Wood Type Prices',
    icon: '💰',
    fields: [
      { key: 'id', label: 'ID', type: 'uuid', readonly: true },
      { key: 'price_per_m3', label: 'Price per m³ ($)', type: 'number', required: true, step: 0.01 },
      { key: 'wood_type_id', label: 'Wood Type', type: 'select', required: true,
        options: 'woodTypes', optionValue: 'id', optionLabel: 'neme' },
      { key: 'created_at', label: 'Created', type: 'datetime', readonly: true }
    ],
    api: {
      getAll: (page, size) => apiService.getWoodTypePrices(page, size),
      getOne: (id) => apiService.getWoodTypePrice(id),
      create: (data) => apiService.createWoodTypePrice(data),
      update: (id, data) => apiService.updateWoodTypePrice(id, data),
      delete: (id) => apiService.deleteWoodTypePrice(id),
      bulkDelete: (ids) => apiService.bulkDeleteWoodTypePrices(ids)
    }
  },
  boards: {
    title: 'Wooden Boards',
    icon: '🪵',
    fields: [
      { key: 'id', label: 'ID', type: 'uuid', readonly: true },
      { key: 'height', label: 'Height (cm)', type: 'number', required: true, step: 0.1 },
      { key: 'width', label: 'Width (cm)', type: 'number', required: true, step: 0.1 },
      { key: 'lenght', label: 'Length (cm)', type: 'number', required: true, step: 0.1 },
      { key: 'image_id', label: 'Image', type: 'select', required: true,
        options: 'images', optionValue: 'id', optionLabel: 'id' }
    ],
    api: {
      getAll: (page, size) => apiService.getWoodenBoards(page, size),
      getOne: (id) => apiService.getWoodenBoard(id),
      create: (data) => apiService.createWoodenBoard(data),
      update: (id, data) => apiService.updateWoodenBoard(id, data),
      delete: (id) => apiService.deleteWoodenBoard(id),
      bulkDelete: (ids) => apiService.bulkDeleteWoodenBoards(ids)
    }
  },
  images: {
    title: 'Images',
    icon: '🖼️',
    fields: [
      { key: 'id', label: 'ID', type: 'uuid', readonly: true },
      { key: 'url', label: 'URL', type: 'url', required: true },
      { key: 'alt_text', label: 'Alt Text', type: 'text' },
      { key: 'created_at', label: 'Created', type: 'datetime', readonly: true }
    ],
    api: {
      getAll: (page, size) => apiService.getImages(page, size),
      getOne: (id) => apiService.getImage(id),
      create: (data) => apiService.createImage(data),
      update: (id, data) => apiService.updateImage(id, data),
      delete: (id) => apiService.deleteImage(id),
      bulkDelete: (ids) => apiService.bulkDeleteImages(ids)
    }
  },
  threads: {
    title: 'Chat Threads',
    icon: '💬',
    fields: [
      { key: 'id', label: 'ID', type: 'uuid', readonly: true },
      { key: 'buyer_id', label: 'Buyer', type: 'select', required: true,
        options: 'buyers', optionValue: 'id', optionLabel: 'id' },
      { key: 'seller_id', label: 'Seller', type: 'select', required: true,
        options: 'sellers', optionValue: 'id', optionLabel: 'id' },
      { key: 'created_at', label: 'Created', type: 'datetime', readonly: true },
      { key: 'updated_at', label: 'Updated', type: 'datetime', readonly: true }
    ],
    api: {
      getAll: (page, size) => apiService.getChatThreads(page, size),
      getOne: (id) => apiService.getChatThread(id),
      create: (data) => apiService.createChatThread(data),
      update: (id, data) => apiService.updateChatThread(id, data),
      delete: (id) => apiService.deleteChatThread(id),
      bulkDelete: (ids) => apiService.bulkDeleteChatThreads(ids)
    }
  },
  messages: {
    title: 'Chat Messages',
    icon: '💭',
    fields: [
      { key: 'id', label: 'ID', type: 'uuid', readonly: true },
      { key: 'content', label: 'Message', type: 'textarea', required: true },
      { key: 'thread_id', label: 'Thread', type: 'select', required: true,
        options: 'threads', optionValue: 'id', optionLabel: 'id' },
      { key: 'sender_id', label: 'Sender', type: 'uuid', required: true },
      { key: 'created_at', label: 'Created', type: 'datetime', readonly: true }
    ],
    api: {
      getAll: (page, size) => apiService.getChatMessages(page, size),
      getOne: (id) => apiService.getChatMessage(id),
      create: (data) => apiService.createChatMessage(data),
      update: (id, data) => apiService.updateChatMessage(id, data),
      delete: (id) => apiService.deleteChatMessage(id),
      bulkDelete: (ids) => apiService.bulkDeleteChatMessages(ids)
    }
  }
};

function EntityManager({ entityType }) {
  const [page, setPage] = useState(0);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Generate UUID for new entries
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : ((r & 0x3) | 0x8);
      return v.toString(16);
    });
  };

  // Initialize form data
  const getInitialFormData = () => {
    const config = ENTITY_CONFIGS[entityType];
    if (!config) return {};
    const formData = {};
    config.fields.forEach(field => {
      if (field.key === 'id') {
        formData[field.key] = generateUUID();
      } else if (field.type === 'boolean') {
        formData[field.key] = false;
      } else {
        formData[field.key] = '';
      }
    });
    return formData;
  };

  const [formData, setFormData] = useState(() => getInitialFormData());

  const config = ENTITY_CONFIGS[entityType];

  // API hooks - always call them
  const { data, loading, error, refetch } = useApi(
    () => config ? config.api.getAll(page, 20) : Promise.resolve(null),
    [page, entityType]
  );
  const { mutate, loading: mutating, error: mutationError, success } = useApiMutation();

  // Load reference data for select fields - always call hooks
  const { data: woodTypes } = useApi(() => apiService.getWoodTypes(0, 1000), []);
  const { data: sellers } = useApi(() => apiService.getSellers(0, 1000), []);
  const { data: buyers } = useApi(() => apiService.getBuyers(0, 1000), []);
  const { data: images } = useApi(() => apiService.getImages(0, 1000), []);
  const { data: threads } = useApi(() => apiService.getChatThreads(0, 1000), []);

  const referenceData = {
    woodTypes: woodTypes?.data || [],
    sellers: sellers?.data || [],
    buyers: buyers?.data || [],
    images: images?.data || [],
    threads: threads?.data || []
  };

  // Reset form when entity type changes
  useEffect(() => {
    setFormData(getInitialFormData());
    setEditingItem(null);
    setShowCreateForm(false);
    setSelectedItems([]);
    setPage(0);
  }, [entityType]);

  // Early return after all hooks
  if (!config) {
    return <div className="error">Unknown entity type: {entityType}</div>;
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>{config.icon} {config.title}</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder={`Search ${config.title.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ width: '200px' }}
          />
          <button 
            onClick={() => setShowCreateForm(!showCreateForm)} 
            className="btn btn-success"
          >
            {showCreateForm ? 'Cancel' : `Add ${config.title.slice(0, -1)}`}
          </button>
          <button onClick={refetch} className="btn btn-secondary" disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="error" style={{ marginBottom: '1rem' }}>
          Failed to load {config.title.toLowerCase()}: {error}
        </div>
      )}

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

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="card" style={{ backgroundColor: '#fff3cd', marginBottom: '1rem', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><strong>{selectedItems.length}</strong> items selected</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {config.api.bulkDelete && (
                <button
                  onClick={() => setShowBulkActions(true)}
                  className="btn btn-secondary"
                  style={{ backgroundColor: '#dc3545', color: 'white' }}
                >
                  Delete Selected
                </button>
              )}
              <button
                onClick={() => setSelectedItems([])}
                className="btn btn-secondary"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Form */}
      {(showCreateForm || editingItem) && (
        <div className="card" style={{ backgroundColor: '#f7fafc', marginBottom: '1rem' }}>
          <h4>{editingItem ? 'Edit' : 'Create'} {config.title.slice(0, -1)}</h4>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-2">
              {config.fields.map((field) => (
                <div key={field.key} className="form-group">
                  <label className="form-label">
                    {field.label} {field.required && '*'}
                  </label>
                  {renderFormField(field)}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary" disabled={mutating}>
                {mutating ? 'Saving...' : (editingItem ? 'Update' : 'Create')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingItem(null);
                  setFormData(getInitialFormData());
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Data Table */}
      {loading && <div className="loading">Loading {config.title.toLowerCase()}...</div>}

      {data && (
        <>
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p>Total {config.title.toLowerCase()}: {data.pagination?.total || data.data?.length || 0}</p>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <label>Sort by:</label>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                className="form-input"
                style={{ width: 'auto' }}
              >
                {config.fields.map(field => (
                  <option key={field.key} value={field.key}>{field.label}</option>
                ))}
              </select>
              <button
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                className="btn btn-secondary"
                style={{ padding: '0.25rem 0.5rem' }}
              >
                {sortDirection === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {data.data && data.data.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>
                      <input
                        type="checkbox"
                        checked={selectedItems.length === data.data.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems(data.data.map(item => item.id));
                          } else {
                            setSelectedItems([]);
                          }
                        }}
                      />
                    </th>
                    {config.fields.map((field) => (
                      <th key={field.key}>{field.label}</th>
                    ))}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getSortedAndFilteredData().map((item) => (
                    <tr key={item.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItems([...selectedItems, item.id]);
                            } else {
                              setSelectedItems(selectedItems.filter(id => id !== item.id));
                            }
                          }}
                        />
                      </td>
                      {config.fields.map((field) => (
                        <td key={field.key}>
                          {renderTableCell(item, field)}
                        </td>
                      ))}
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleEdit(item)}
                            className="btn btn-secondary"
                            style={{ fontSize: '0.8em', padding: '0.25rem 0.5rem' }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
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
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>No {config.title.toLowerCase()} found.</p>
              <p>Add your first {config.title.slice(0, -1).toLowerCase()} to get started!</p>
            </div>
          )}

          {/* Pagination */}
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center' }}>
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
              disabled={!data?.data || data.data.length < 20 || loading}
              className="btn btn-secondary"
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Bulk Delete Confirmation */}
      {showBulkActions && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: '400px', margin: '1rem' }}>
            <h4>Confirm Bulk Delete</h4>
            <p>Are you sure you want to delete {selectedItems.length} {config.title.toLowerCase()}?</p>
            <p style={{ color: '#e53e3e', fontSize: '0.9em' }}>This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button
                onClick={handleBulkDelete}
                className="btn btn-secondary"
                disabled={mutating}
                style={{ backgroundColor: '#dc3545', color: 'white' }}
              >
                {mutating ? 'Deleting...' : 'Delete All'}
              </button>
              <button
                onClick={() => setShowBulkActions(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Helper functions
  function renderFormField(field) {
    const value = formData[field.key] || '';

    if (field.readonly) {
      return (
        <input
          type="text"
          value={value}
          className="form-input"
          disabled
          style={{ backgroundColor: '#f7fafc' }}
        />
      );
    }

    switch (field.type) {
      case 'text':
      case 'uuid':
      case 'url':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
            className="form-input"
            required={field.required}
            placeholder={field.placeholder}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => setFormData({...formData, [field.key]: parseFloat(e.target.value) || ''})}
            className="form-input"
            required={field.required}
            step={field.step || 1}
            min={field.min}
            max={field.max}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
            className="form-input"
            required={field.required}
            rows={3}
          />
        );

      case 'boolean':
        return (
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => setFormData({...formData, [field.key]: e.target.checked})}
            />
            <span>{field.label}</span>
          </label>
        );

      case 'select':
        const options = referenceData[field.options] || [];
        return (
          <select
            value={value}
            onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
            className="form-input"
            required={field.required}
          >
            <option value="">Select {field.label}...</option>
            {options.map((option) => (
              <option key={option[field.optionValue]} value={option[field.optionValue]}>
                {option[field.optionLabel] || option[field.optionValue]}
              </option>
            ))}
          </select>
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
            className="form-input"
            required={field.required}
          />
        );
    }
  }



  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingItem) {
        await mutate(config.api.update, editingItem.id, formData);
        setEditingItem(null);
      } else {
        await mutate(config.api.create, formData);
        setShowCreateForm(false);
      }
      setFormData(getInitialFormData());
      refetch();
    } catch (err) {
      console.error('Failed to save:', err);
    }
  }

  function handleEdit(item) {
    setEditingItem(item);
    setFormData(item);
    setShowCreateForm(false);
  }

  async function handleDelete(id) {
    if (window.confirm(`Are you sure you want to delete this ${config.title.slice(0, -1).toLowerCase()}?`)) {
      try {
        await mutate(config.api.delete, id);
        refetch();
      } catch (err) {
        console.error('Failed to delete:', err);
      }
    }
  }

  async function handleBulkDelete() {
    try {
      await mutate(config.api.bulkDelete, selectedItems);
      setSelectedItems([]);
      setShowBulkActions(false);
      refetch();
    } catch (err) {
      console.error('Failed to bulk delete:', err);
    }
  }

  function getSortedAndFilteredData() {
    if (!data?.data) return [];

    let filteredData = data.data;

    // Apply search filter
    if (searchTerm) {
      filteredData = filteredData.filter(item => {
        return config.fields.some(field => {
          const value = item[field.key];
          if (value && typeof value === 'string') {
            return value.toLowerCase().includes(searchTerm.toLowerCase());
          }
          return false;
        });
      });
    }

    // Apply sorting
    filteredData.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue === bValue) return 0;

      let comparison = 0;
      if (aValue > bValue) {
        comparison = 1;
      } else if (aValue < bValue) {
        comparison = -1;
      }

      return sortDirection === 'desc' ? comparison * -1 : comparison;
    });

    return filteredData;
  }

  function renderTableCell(item, field) {
    const value = item[field.key];

    if (value === null || value === undefined) {
      return <span style={{ color: '#999' }}>—</span>;
    }

    switch (field.type) {
      case 'boolean':
        return value ? '✅' : '❌';
      case 'datetime':
        return new Date(value).toLocaleString();
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value;
      case 'url':
        return (
          <a href={value} target="_blank" rel="noopener noreferrer" style={{ color: '#3182ce' }}>
            {value.length > 30 ? `${value.substring(0, 30)}...` : value}
          </a>
        );
      case 'select':
        // Try to find the display value from reference data
        if (field.options && referenceData[field.options]) {
          const option = referenceData[field.options].find(opt => opt[field.optionValue] === value);
          return option ? option[field.optionLabel] : value;
        }
        return value;
      default:
        if (typeof value === 'string' && value.length > 50) {
          return `${value.substring(0, 50)}...`;
        }
        return value;
    }
  }
}

export default EntityManager;
