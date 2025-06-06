import React, { useState, useCallback } from 'react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { apiService } from '../services/api';

const UserManagement = React.memo(() => {
  const [activeTab, setActiveTab] = useState('buyers');
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    keycloak_uuid: '',
    is_online: true,
    // Seller-specific fields
    company_name: '',
    contact_email: '',
    contact_phone: '',
    business_address: '',
    business_description: ''
  });

  // API hooks for buyers
  const { data: buyers, loading: buyersLoading, error: buyersError, refetch: refetchBuyers } = useApi(
    () => apiService.getBuyers(page, 10),
    [page]
  );

  // API hooks for sellers
  const { data: sellers, loading: sellersLoading, error: sellersError, refetch: refetchSellers } = useApi(
    () => apiService.getSellers(page, 10),
    [page]
  );

  const { mutate, loading: mutating, error: mutationError, success } = useApiMutation();

  // Form handling functions
  const resetForm = useCallback(() => {
    setFormData({
      keycloak_uuid: '',
      is_online: true,
      company_name: '',
      contact_email: '',
      contact_phone: '',
      business_address: '',
      business_description: ''
    });
    setEditingUser(null);
    setShowAddForm(false);
  }, []);

  const handleAddUser = useCallback(() => {
    resetForm();
    setShowAddForm(true);
  }, [resetForm]);

  const handleEditUser = useCallback((user) => {
    setFormData({
      keycloak_uuid: user.keycloak_uuid || '',
      is_online: user.is_online || false,
      company_name: user.company_name || '',
      contact_email: user.contact_email || '',
      contact_phone: user.contact_phone || '',
      business_address: user.business_address || '',
      business_description: user.business_description || ''
    });
    setEditingUser(user);
    setShowAddForm(true);
  }, []);

  const handleFormSubmit = useCallback(async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.keycloak_uuid.trim()) {
      alert('Keycloak UUID is required');
      return;
    }

    // Email validation for sellers
    if (activeTab === 'sellers' && formData.contact_email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      alert('Please enter a valid email address');
      return;
    }

    try {
      const userData = {
        keycloak_uuid: formData.keycloak_uuid.trim(),
        is_online: formData.is_online
      };

      // Add seller-specific fields
      if (activeTab === 'sellers') {
        if (formData.company_name.trim()) userData.company_name = formData.company_name.trim();
        if (formData.contact_email.trim()) userData.contact_email = formData.contact_email.trim();
        if (formData.contact_phone.trim()) userData.contact_phone = formData.contact_phone.trim();
        if (formData.business_address.trim()) userData.business_address = formData.business_address.trim();
        if (formData.business_description.trim()) userData.business_description = formData.business_description.trim();
      }

      if (editingUser) {
        // Update existing user
        if (activeTab === 'buyers') {
          await mutate(() => apiService.updateBuyer(editingUser.id, userData));
          refetchBuyers();
        } else {
          await mutate(() => apiService.updateSeller(editingUser.id, userData));
          refetchSellers();
        }
      } else {
        // Create new user
        if (activeTab === 'buyers') {
          await mutate(() => apiService.createBuyer(userData));
          refetchBuyers();
        } else {
          await mutate(() => apiService.createSeller(userData));
          refetchSellers();
        }
      }

      resetForm();
    } catch (error) {
      console.error('Form submission failed:', error);
    }
  }, [formData, activeTab, editingUser, mutate, refetchBuyers, refetchSellers, resetForm]);

  const handleDeleteUser = async (id, type) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        if (type === 'buyer') {
          await mutate(() => apiService.deleteBuyer(id));
          refetchBuyers();
        } else {
          await mutate(() => apiService.deleteSeller(id));
          refetchSellers();
        }
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;

    if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
      try {
        if (activeTab === 'buyers') {
          await mutate(() => apiService.bulkDeleteBuyers(selectedUsers));
          refetchBuyers();
        } else {
          await mutate(() => apiService.bulkDeleteSellers(selectedUsers));
          refetchSellers();
        }
        setSelectedUsers([]);
      } catch (error) {
        console.error('Bulk delete failed:', error);
      }
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = (users) => {
    const userIds = users.map(user => user.id);
    setSelectedUsers(prev =>
      prev.length === userIds.length ? [] : userIds
    );
  };

  const currentData = activeTab === 'buyers' ? buyers : sellers;
  const currentLoading = activeTab === 'buyers' ? buyersLoading : sellersLoading;
  const currentError = activeTab === 'buyers' ? buyersError : sellersError;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <p className="page-description">Manage buyers and sellers on the platform</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('buyers')}
          className={`btn ${activeTab === 'buyers' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Buyers
        </button>
        <button
          onClick={() => setActiveTab('sellers')}
          className={`btn ${activeTab === 'sellers' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Sellers
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

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            {activeTab === 'buyers' ? 'Buyers' : 'Sellers'}
          </h2>
        </div>

        {/* Search and Actions */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-4 items-center">
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ width: '300px' }}
            />
            <p>Total {activeTab}: {currentData?.total || 0}</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleAddUser}
              className="btn btn-primary"
              disabled={mutating}
            >
              Add {activeTab === 'buyers' ? 'Buyer' : 'Seller'}
            </button>
            {selectedUsers.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="btn btn-secondary"
                disabled={mutating}
              >
                Delete Selected ({selectedUsers.length})
              </button>
            )}
            <button
              onClick={() => activeTab === 'buyers' ? refetchBuyers() : refetchSellers()}
              className="btn btn-secondary"
              disabled={currentLoading}
            >
              {currentLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="card mb-6">
            <div className="card-header">
              <h2 className="card-title">
                {editingUser ? `Edit ${activeTab === 'buyers' ? 'Buyer' : 'Seller'}` : `Add New ${activeTab === 'buyers' ? 'Buyer' : 'Seller'}`}
              </h2>
              <p style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-2)' }}>
                {editingUser ? 'Update the information below' : `Fill in the details to create a new ${activeTab === 'buyers' ? 'buyer' : 'seller'} account`}
              </p>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label">Keycloak UUID *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.keycloak_uuid}
                  onChange={(e) => setFormData({...formData, keycloak_uuid: e.target.value})}
                  placeholder="e.g., 3ab0f210-ca78-4312-841b-8b1ae774adac"
                  required
                  maxLength={100}
                />
                <small style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-xs)' }}>
                  Unique identifier from Keycloak authentication system
                </small>
              </div>

              <div className="form-group">
                <label className="form-label" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    className="form-checkbox"
                    checked={formData.is_online}
                    onChange={(e) => setFormData({...formData, is_online: e.target.checked})}
                  />
                  <span>User is Online</span>
                </label>
                <small style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-xs)', marginLeft: '1.5rem' }}>
                  Set the initial online status for this user
                </small>
              </div>

              {/* Seller-specific fields */}
              {activeTab === 'sellers' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Company Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.company_name}
                      onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                      placeholder="e.g., ABC Wood Products Inc."
                      maxLength={200}
                    />
                  </div>

                  <div className="form-grid form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Contact Email</label>
                      <input
                        type="email"
                        className="form-input"
                        value={formData.contact_email}
                        onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                        placeholder="contact@company.com"
                        maxLength={100}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Contact Phone</label>
                      <input
                        type="tel"
                        className="form-input"
                        value={formData.contact_phone}
                        onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                        placeholder="+1 (555) 123-4567"
                        maxLength={20}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Business Address</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.business_address}
                      onChange={(e) => setFormData({...formData, business_address: e.target.value})}
                      placeholder="123 Business St, City, State, ZIP"
                      maxLength={300}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Business Description</label>
                    <textarea
                      className="form-input"
                      value={formData.business_description}
                      onChange={(e) => setFormData({...formData, business_description: e.target.value})}
                      placeholder="Describe the business, specialties, and services offered..."
                      rows="3"
                      maxLength={500}
                    />
                    <small style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-xs)' }}>
                      {formData.business_description.length}/500 characters
                    </small>
                  </div>
                </>
              )}

              <div className="flex gap-4" style={{ marginTop: 'var(--space-6)' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={mutating}
                >
                  {mutating ? (editingUser ? 'Updating...' : 'Creating...') : (editingUser ? 'Update' : 'Create')} {activeTab === 'buyers' ? 'Buyer' : 'Seller'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                  disabled={mutating}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {currentLoading && <div className="loading">Loading {activeTab}...</div>}

        {currentError && (
          <div className="error">
            <strong>Failed to load {activeTab}:</strong> {currentError}
          </div>
        )}

        {currentData && currentData.data && currentData.data.length > 0 ? (
          <div>
            <table className="table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === currentData.data.length}
                      onChange={() => handleSelectAll(currentData.data)}
                    />
                  </th>
                  <th>ID</th>
                  <th>Keycloak UUID</th>
                  <th>Status</th>
                  {activeTab === 'sellers' && (
                    <>
                      <th>Company</th>
                      <th>Contact</th>
                    </>
                  )}
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentData.data
                  .filter(user =>
                    searchTerm === '' ||
                    user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.keycloak_uuid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (activeTab === 'sellers' && (
                      user.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      user.contact_email?.toLowerCase().includes(searchTerm.toLowerCase())
                    ))
                  )
                  .map((user) => (
                  <tr key={user.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                      />
                    </td>
                    <td>
                      <strong>{user.id.substring(0, 8)}...</strong>
                    </td>
                    <td>
                      <div style={{ fontSize: 'var(--font-size-xs)', fontFamily: 'monospace' }}>
                        {user.keycloak_uuid ? user.keycloak_uuid.substring(0, 12) + '...' : 'Not set'}
                      </div>
                    </td>
                    <td>
                      <span className={`status ${user.is_online ? 'status-success' : 'status-error'}`}>
                        {user.is_online ? 'Online' : 'Offline'}
                      </span>
                    </td>
                    {activeTab === 'sellers' && (
                      <>
                        <td>
                          <div>
                            <strong>{user.company_name || 'Not specified'}</strong>
                            {user.business_description && (
                              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-light)', marginTop: '0.25rem' }}>
                                {user.business_description.length > 50
                                  ? `${user.business_description.substring(0, 50)}...`
                                  : user.business_description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: 'var(--font-size-xs)' }}>
                            {user.contact_email && (
                              <div style={{ marginBottom: '0.25rem' }}>
                                📧 {user.contact_email}
                              </div>
                            )}
                            {user.contact_phone && (
                              <div style={{ marginBottom: '0.25rem' }}>
                                📞 {user.contact_phone}
                              </div>
                            )}
                            {user.business_address && (
                              <div style={{ color: 'var(--color-text-light)' }}>
                                📍 {user.business_address.length > 30
                                  ? `${user.business_address.substring(0, 30)}...`
                                  : user.business_address}
                              </div>
                            )}
                            {!user.contact_email && !user.contact_phone && !user.business_address && (
                              <span style={{ color: 'var(--color-text-light)' }}>No contact info</span>
                            )}
                          </div>
                        </td>
                      </>
                    )}
                    <td>
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="btn btn-secondary"
                          disabled={mutating}
                          style={{ fontSize: '0.8em', padding: '0.25rem 0.5rem' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, activeTab.slice(0, -1))}
                          className="btn btn-secondary"
                          disabled={mutating}
                          style={{ fontSize: '0.8em', padding: '0.25rem 0.5rem' }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0 || currentLoading}
                className="btn btn-secondary"
              >
                Previous
              </button>
              <span>Page {page + 1}</span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={!currentData?.data || currentData.data.length < 10 || currentLoading}
                className="btn btn-secondary"
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p>No {activeTab} found.</p>
          </div>
        )}
      </div>
    </div>
  );
});

export default UserManagement;
