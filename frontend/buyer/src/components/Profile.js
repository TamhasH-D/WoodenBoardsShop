import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
// Removed: import { useApi, useApiMutation } from '../hooks/useApi';
// Removed: import { apiService } from '../services/api';
// Removed: import { MOCK_IDS } from '../utils/constants';

// Removed: const getCurrentBuyerKeycloakId = () => { ... };

function Profile() {
  const {
    buyerProfile,
    isAuthenticated,
    profileLoading,
    profileError,
    syncBuyerProfile, // For refreshing profile data
    keycloak // To get Keycloak instance for user info if needed, though buyerProfile is primary
  } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    // Initialize with fields that might be editable.
    // For now, only 'is_online'. Other fields from buyerProfile will be displayed as read-only.
    is_online: false,
    // 'name' and 'email' could be editable in a more complete form.
    // name: '',
    // email: '',
  });
  const [mutationLoading, setMutationLoading] = useState(false);
  const [mutationError, setMutationError] = useState(null);
  const [mutationSuccess, setMutationSuccess] = useState(false);

  // Initialize editData when editing starts or buyerProfile changes
  useEffect(() => {
    if (buyerProfile) {
      setEditData({
        is_online: buyerProfile.is_online || false,
        // name: buyerProfile.name || '',
        // email: buyerProfile.email || '',
        // Other fields from buyerProfile if they become editable
      });
    }
  }, [buyerProfile, isEditing]); // Re-initialize if buyerProfile changes while editing (e.g. after a refresh)

  const handleEdit = () => {
    if (buyerProfile) {
      // Pre-fill editData from the current buyerProfile
      setEditData({
        is_online: buyerProfile.is_online || false,
        // name: buyerProfile.name || '',
        // email: buyerProfile.email || '',
      });
    }
    setIsEditing(true);
    setMutationSuccess(false); // Reset success message
    setMutationError(null); // Reset error message
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Optionally reset editData to current profile state if changes were made
    if (buyerProfile) {
      setEditData({ is_online: buyerProfile.is_online || false });
    }
  };

  // Mocked API call for profile update
  const mockUpdateMyBuyerProfile = async (dataToUpdate) => {
    console.log('[Profile] Mocking updateMyBuyerProfile with:', dataToUpdate);
    // TODO: Replace with actual API call: await apiService.updateMyBuyerProfile(dataToUpdate);
    return new Promise(resolve => setTimeout(() => {
      // Simulate merging updated data with existing buyerProfile structure
      // In a real scenario, the backend would return the updated profile.
      const updatedProfileData = {
        ...(buyerProfile || {}), // Spread existing profile to keep non-updated fields
        ...dataToUpdate
      };
      console.log('[Profile] Mock API success, returning:', updatedProfileData);
      resolve({ data: updatedProfileData });
    }, 500));
  };

  const handleSaveProfile = useCallback(async (e) => {
    e.preventDefault();
    setMutationLoading(true);
    setMutationError(null);
    setMutationSuccess(false);

    try {
      // const updatedProfile = await apiService.updateMyBuyerProfile(editData); // Future real call
      await mockUpdateMyBuyerProfile(editData); // Using mocked call

      // After mock update, call syncBuyerProfile to simulate refreshing context state.
      // In a real scenario, syncBuyerProfile would re-fetch from backend,
      // or AuthContext might have a more direct way to update its buyerProfile state.
      if (syncBuyerProfile) {
        await syncBuyerProfile(keycloak); // Pass keycloak if syncBuyerProfile expects it
      }

      setMutationSuccess(true);
      setIsEditing(false);
    } catch (err) {
      console.error('[Profile] Failed to update profile:', err);
      setMutationError(err.message || 'Failed to save changes.');
    } finally {
      setMutationLoading(false);
    }
  }, [editData, syncBuyerProfile, buyerProfile, keycloak]);


  if (profileLoading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (profileError) {
    return (
      <div className="error card">
        <h2>My Profile</h2>
        <p>Failed to load profile: {profileError.message}</p>
        <button onClick={() => syncBuyerProfile(keycloak)} className="btn btn-primary">Try Refresh</button>
      </div>
    );
  }

  if (!isAuthenticated || !buyerProfile) {
    return (
      <div className="error card">
        <h2>My Profile</h2>
        <p>Profile data is not available. Please ensure you are logged in.</p>
        {/* Optionally, add a login button if Keycloak is not authenticated */}
      </div>
    );
  }

  // Display data from buyerProfile
  const { id, keycloak_id, name, email, is_online, created_at, updated_at } = buyerProfile;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>My Profile</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {!isEditing && (
            <button onClick={handleEdit} className="btn btn-primary">
              Edit Profile
            </button>
          )}
          <button onClick={() => syncBuyerProfile(keycloak)} className="btn btn-secondary" disabled={profileLoading || mutationLoading}>
            {profileLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {mutationError && (
        <div className="alert alert-danger" role="alert">
          Failed to update profile: {mutationError}
        </div>
      )}

      {mutationSuccess && (
        <div className="alert alert-success" role="alert">
          Profile updated successfully! (Mocked)
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSaveProfile}>
          <div className="form-group">
            <label className="form-label">Buyer ID (Read-only)</label>
            <input type="text" className="form-input" value={id || ''} disabled style={{ backgroundColor: '#f7fafc' }} />
          </div>

          <div className="form-group">
            <label className="form-label">Keycloak ID (Read-only)</label>
            <input type="text" className="form-input" value={keycloak_id || ''} disabled style={{ backgroundColor: '#f7fafc' }} />
          </div>

          <div className="form-group">
            <label className="form-label">Name (Read-only for this form)</label>
            <input type="text" className="form-input" value={name || ''} disabled style={{ backgroundColor: '#f7fafc' }} />
          </div>

          <div className="form-group">
            <label className="form-label">Email (Read-only for this form)</label>
            <input type="text" className="form-input" value={email || ''} disabled style={{ backgroundColor: '#f7fafc' }} />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={editData.is_online}
                onChange={(e) => setEditData({...editData, is_online: e.target.checked})}
              />
              <span>Show as online to sellers</span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-success" disabled={mutationLoading}>
              {mutationLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={handleCancelEdit} className="btn btn-secondary" disabled={mutationLoading}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div>
          <div className="grid grid-2">
            <div>
              <h3>Profile Information</h3>
              <p><strong>Buyer ID:</strong> <code>{id}</code></p>
              <p><strong>Keycloak ID:</strong> <code>{keycloak_id}</code></p>
              <p><strong>Name:</strong> {name || 'N/A'}</p>
              <p><strong>Email:</strong> {email || 'N/A'}</p>
              <p><strong>Status:</strong>
                <span style={{ color: is_online ? '#38a169' : '#e53e3e', fontWeight: 'bold' }}>
                  {is_online ? '🟢 Online' : '🔴 Offline'}
                </span>
              </p>
            </div>
            <div>
              <h3>Account Details</h3>
              <p><strong>Member Since:</strong> {created_at ? new Date(created_at).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Last Updated:</strong> {updated_at ? new Date(updated_at).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
          {/* ... (Profile Tips can remain) ... */}
        </div>
      )}
    </div>
  );
}

export default Profile;
