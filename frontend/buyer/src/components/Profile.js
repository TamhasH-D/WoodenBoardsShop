import React, { useState } from 'react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { apiService } from '../services/api';

// Mock buyer ID - in real app this would come from authentication
const MOCK_BUYER_ID = '123e4567-e89b-12d3-a456-426614174001';

function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    keycloak_uuid: '',
    is_online: true
  });

  const { data, loading, error, refetch } = useApi(() => apiService.getBuyerProfile(MOCK_BUYER_ID));
  const { mutate, loading: mutating, error: mutationError, success } = useApiMutation();

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await mutate(apiService.updateBuyerProfile, MOCK_BUYER_ID, profileData);
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
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>My Profile</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
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
        <div className="error">
          Failed to load profile: {error}
        </div>
      )}

      {mutationError && (
        <div className="error">
          Failed to update profile: {mutationError}
        </div>
      )}

      {success && (
        <div className="success">
          Profile updated successfully!
        </div>
      )}

      {loading && <div className="loading">Loading profile...</div>}

      {data && (
        <div>
          {isEditing ? (
            <form onSubmit={handleSaveProfile}>
              <div className="form-group">
                <label className="form-label">Buyer ID</label>
                <input
                  type="text"
                  className="form-input"
                  value={MOCK_BUYER_ID}
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
                  <span>Show as online to sellers</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-success" disabled={mutating}>
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
          ) : (
            <div>
              <div className="grid grid-2">
                <div>
                  <h3>Profile Information</h3>
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Buyer ID:</strong>
                    <br />
                    <code style={{ backgroundColor: '#f7fafc', padding: '0.25rem', borderRadius: '0.25rem' }}>
                      {MOCK_BUYER_ID}
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
                    <span style={{ 
                      color: data.data?.is_online ? '#38a169' : '#e53e3e',
                      fontWeight: 'bold'
                    }}>
                      {data.data?.is_online ? '🟢 Online' : '🔴 Offline'}
                    </span>
                  </div>
                </div>

                <div>
                  <h3>Account Details</h3>
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Member Since:</strong>
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

              <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#e6fffa', borderRadius: '0.375rem' }}>
                <h4>Profile Tips</h4>
                <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                  <li>Keep your status online to receive seller responses faster</li>
                  <li>Make sure your Keycloak UUID is correctly configured</li>
                  <li>Update your profile information to build trust with sellers</li>
                  <li>Use the board analyzer to get accurate volume estimates</li>
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
