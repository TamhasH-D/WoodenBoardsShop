import React, { useState } from 'react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { apiService } from '../services/api';

// Mock seller ID - in real app this would come from authentication
const MOCK_SELLER_ID = '123e4567-e89b-12d3-a456-426614174000';

function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    keycloak_uuid: '',
    is_online: true
  });

  const { data, loading, error, refetch } = useApi(() => apiService.getSellerProfile(MOCK_SELLER_ID));
  const { mutate, loading: mutating, error: mutationError, success } = useApiMutation();

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await mutate(() => apiService.updateSellerProfile(MOCK_SELLER_ID, profileData));
      setIsEditing(false);
      refetch();
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  React.useEffect(() => {
    if (data?.data) {
      setProfileData({
        keycloak_uuid: data.data.keycloak_uuid || '',
        is_online: data.data.is_online || false
      });
    }
  }, [data]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Seller Profile</h1>
        <p className="page-description">Manage your seller account information and availability status</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <p>Profile ID: {MOCK_SELLER_ID.substring(0, 8)}...</p>
        </div>
        <div className="flex gap-4">
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="btn btn-primary">
              Edit Profile
            </button>
          )}
          <button onClick={refetch} className="btn btn-secondary" disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error mb-4">
          <strong>Profile Loading Issue:</strong> {error}
          <br />
          <small>Using development mode with mock data. In production, this would require proper authentication.</small>
          <div style={{ marginTop: '1rem' }}>
            <button onClick={refetch} className="btn btn-secondary">
              Retry Loading Profile
            </button>
          </div>
        </div>
      )}

      {mutationError && (
        <div className="error mb-4">
          <strong>Failed to update profile:</strong> {mutationError}
        </div>
      )}

      {success && (
        <div className="success mb-4">
          <strong>Success:</strong> Profile updated successfully!
        </div>
      )}

      {loading && <div className="loading">Loading profile...</div>}

      {data && (
        <div className="card">
          {isEditing ? (
            <div>
              <div className="card-header">
                <h2 className="card-title">Edit Profile</h2>
              </div>
              <form onSubmit={handleSaveProfile}>
              <div className="form-group">
                <label className="form-label">Seller ID</label>
                <input
                  type="text"
                  className="form-input"
                  value={MOCK_SELLER_ID}
                  disabled
                  style={{ backgroundColor: '#f7fafc' }}
                />
                <small style={{ color: '#718096' }}>This ID cannot be changed</small>
              </div>

              <div className="form-group">
                <label className="form-label">Keycloak UUID</label>
                <input
                  type="text"
                  className="form-input"
                  value={profileData.keycloak_uuid}
                  onChange={(e) => setProfileData({...profileData, keycloak_uuid: e.target.value})}
                  placeholder="Enter your Keycloak UUID"
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={profileData.is_online}
                    onChange={(e) => setProfileData({...profileData, is_online: e.target.checked})}
                  />
                  <span>Available for customer inquiries</span>
                </label>
              </div>

                <div className="flex gap-4">
                  <button type="submit" className="btn btn-primary" disabled={mutating}>
                    {mutating ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn btn-secondary"
                    disabled={mutating}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div>
              <div className="card-header">
                <h2 className="card-title">Profile Information</h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
                <div>
                  <h3>Basic Information</h3>
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Seller ID:</strong>
                    <br />
                    <code style={{ backgroundColor: '#f7fafc', padding: '0.25rem', borderRadius: '0.25rem' }}>
                      {MOCK_SELLER_ID}
                    </code>
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Keycloak UUID:</strong>
                    <br />
                    {data.data?.keycloak_uuid ? (
                      <code style={{ backgroundColor: '#f7fafc', padding: '0.25rem', borderRadius: '0.25rem' }}>
                        {data.data.keycloak_uuid}
                      </code>
                    ) : (
                      <span style={{ color: '#718096' }}>Not set</span>
                    )}
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Status:</strong>
                    <br />
                    <span className={`status ${data.data?.is_online ? 'status-success' : 'status-error'}`}>
                      {data.data?.is_online ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>

                <div>
                  <h3>Account Details</h3>
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Created:</strong>
                    <br />
                    {data.data?.created_at ? new Date(data.data.created_at).toLocaleDateString() : 'Unknown'}
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Last Updated:</strong>
                    <br />
                    {data.data?.updated_at ? new Date(data.data.updated_at).toLocaleDateString() : 'Unknown'}
                  </div>
                </div>
              </div>

              <div className="card mt-6" style={{ backgroundColor: '#dcfce7' }}>
                <h4>Profile Tips</h4>
                <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                  <li>Keep your status online to receive customer inquiries</li>
                  <li>Make sure your Keycloak UUID is correctly configured</li>
                  <li>Update your profile information regularly</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Profile;
