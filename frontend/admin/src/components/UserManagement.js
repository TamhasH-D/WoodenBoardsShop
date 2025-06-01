import React, { useState } from 'react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { apiService } from '../services/api';

const UserManagement = React.memo(() => {
  const [activeTab, setActiveTab] = useState('buyers');
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  // const [showAddForm, setShowAddForm] = useState(false); // Future feature

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
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentData.data
                  .filter(user =>
                    searchTerm === '' ||
                    user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.keycloak_uuid?.toLowerCase().includes(searchTerm.toLowerCase())
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
                      <span className={`status ${user.is_online ? 'status-success' : 'status-error'}`}>
                        {user.is_online ? 'Online' : 'Offline'}
                      </span>
                    </td>
                    <td>
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        onClick={() => handleDeleteUser(user.id, activeTab.slice(0, -1))}
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
