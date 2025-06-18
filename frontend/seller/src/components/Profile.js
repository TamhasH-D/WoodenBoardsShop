import { useState, useCallback, useEffect, useMemo } from 'react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { apiService } from '../services/api';
import { getCurrentSellerKeycloakId } from '../utils/auth';
import { SELLER_TEXTS } from '../utils/localization';

function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    keycloak_uuid: '',
    is_online: true
  });

  // Create stable API function to prevent infinite loops
  const profileApiFunction = useMemo(() => () => {
    const keycloakId = getCurrentSellerKeycloakId();
    return apiService.getSellerProfileByKeycloakId(keycloakId);
  }, []);
  const { data, loading, error, refetch } = useApi(profileApiFunction, []);
  const { mutate, loading: mutating, error: mutationError, success } = useApiMutation();

  const handleSaveProfile = useCallback(async (e) => {
    e.preventDefault();
    try {
      // Get seller_id from current profile data
      const sellerId = data?.data?.id;
      if (!sellerId) {
        throw new Error('Seller ID not found');
      }
      await mutate(apiService.updateSellerProfile, sellerId, profileData);
      setIsEditing(false);
      refetch();
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  }, [profileData, mutate, refetch, data?.data?.id]);

  // Update local state when data changes
  useEffect(() => {
    if (data?.data) {
      setProfileData({
        keycloak_uuid: data.data.keycloak_uuid || '',
        is_online: data.data.is_online ?? true
      });
    }
  }, [data]);

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2 sm:gap-0">
        <h2>{SELLER_TEXTS.SELLER_PROFILE}</h2>
        <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-4">
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="btn btn-primary">
              {SELLER_TEXTS.EDIT_PROFILE}
            </button>
          )}
          <button onClick={refetch} className="btn btn-secondary" disabled={loading}>
            {loading ? SELLER_TEXTS.LOADING_PROFILE : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error">
          {SELLER_TEXTS.PROFILE_ERROR}: {error}
        </div>
      )}

      {mutationError && (
        <div className="error">
          Failed to update profile: {mutationError}
        </div>
      )}

      {success && (
        <div className="success">
          {SELLER_TEXTS.PROFILE_UPDATED}
        </div>
      )}

      {loading && <div className="loading">{SELLER_TEXTS.LOADING_PROFILE}</div>}

      {data && (
        <div>
          {isEditing ? (
            <form onSubmit={handleSaveProfile}>
              <div className="form-group">
                <label className="form-label">{SELLER_TEXTS.SELLER_ID}</label>
                <input
                  type="text"
                  className="form-input bg-slate-100 cursor-not-allowed"
                  value={data?.data?.id || 'Loading...'}
                  disabled
                  // style prop removed
                />
                <small className="text-slate-500">{SELLER_TEXTS.SELLER_ID_CANNOT_CHANGE}</small>
              </div>

              <div className="form-group">
                <label className="form-label">{SELLER_TEXTS.KEYCLOAK_UUID}</label>
                <input
                  type="text"
                  className="form-input"
                  value={profileData.keycloak_uuid}
                  onChange={(e) => setProfileData({...profileData, keycloak_uuid: e.target.value})}
                  placeholder={SELLER_TEXTS.KEYCLOAK_UUID_PLACEHOLDER}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <input
                    type="checkbox"
                    checked={profileData.is_online}
                    onChange={(e) => setProfileData({...profileData, is_online: e.target.checked})}
                    className="mr-2"
                  />
                  {SELLER_TEXTS.SHOW_ONLINE}
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4">
                <button type="submit" className="btn btn-success" disabled={mutating}>
                  {mutating ? SELLER_TEXTS.SAVING : SELLER_TEXTS.SAVE_CHANGES}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3>{SELLER_TEXTS.BUSINESS_INFORMATION}</h3>
                  <div className="mb-4">
                    <strong>{SELLER_TEXTS.SELLER_ID}:</strong>
                    <br />
                    <code className="bg-slate-100 px-1 py-0.5 rounded">
                      {data?.data?.id || 'Loading...'}
                    </code>
                  </div>
                  <div className="mb-4">
                    <strong>{SELLER_TEXTS.KEYCLOAK_UUID}:</strong>
                    <br />
                    <span>{data?.data?.keycloak_uuid || 'Not set'}</span>
                  </div>
                  <div className="mb-4">
                    <strong>{SELLER_TEXTS.ONLINE_STATUS}:</strong>
                    <br />
                    <span className={`font-bold ${data?.data?.is_online ? 'text-emerald-500' : 'text-red-500'}`}>
                      {data?.data?.is_online ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
                <div>
                  <h3>Account Information</h3>
                  <div className="mb-4">
                    <strong>{SELLER_TEXTS.ACCOUNT_CREATED}:</strong>
                    <br />
                    <span>{data?.data?.created_at ? new Date(data.data.created_at).toLocaleDateString('ru-RU') : 'Unknown'}</span>
                  </div>
                  <div className="mb-4">
                    <strong>{SELLER_TEXTS.LAST_UPDATED}:</strong>
                    <br />
                    <span>{data?.data?.updated_at ? new Date(data.data.updated_at).toLocaleDateString('ru-RU') : 'Unknown'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-emerald-50 rounded-md">
                <h4>Seller Tips</h4>
                <ul className="list-disc list-inside ml-6 mt-2 text-sm text-slate-700">
                  <li>Keep your status online to receive buyer inquiries faster</li>
                  <li>Make sure your Keycloak UUID is correctly configured</li>
                  <li>Update your profile information to build trust with buyers</li>
                  <li>Use high-quality images for your wood products</li>
                  <li>Provide accurate measurements and descriptions</li>
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
