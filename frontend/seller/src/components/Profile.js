import React, { useState, useMemo, useCallback } from 'react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { apiService } from '../services/api';
import { SELLER_TEXTS } from '../utils/localization';
import { MOCK_IDS } from '../../shared/constants';

// Use shared mock seller ID
const MOCK_SELLER_ID = MOCK_IDS.SELLER_ID;

function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    keycloak_uuid: '',
    is_online: true
  });

  // Create stable API function to prevent infinite loops
  const profileApiFunction = useMemo(() => () => apiService.getSellerProfile(MOCK_SELLER_ID), []);
  const { data, loading, error, refetch } = useApi(profileApiFunction, []);
  const { mutate, loading: mutating, error: mutationError, success } = useApiMutation();

  const handleSaveProfile = useCallback(async (e) => {
    e.preventDefault();
    try {
      await mutate(apiService.updateSellerProfile, MOCK_SELLER_ID, profileData);
      setIsEditing(false);
      refetch();
    } catch (err) {
      // Remove console.error in production
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to update profile:', err);
      }
    }
  }, [profileData, mutate, refetch]);

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
        <h1 className="page-title">{SELLER_TEXTS.SELLER_PROFILE}</h1>
        <p className="page-description">{SELLER_TEXTS.MANAGE_BUSINESS_INFO}</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <p>{SELLER_TEXTS.SELLER_ID}: {MOCK_SELLER_ID.substring(0, 8)}...</p>
        </div>
        <div className="flex gap-4">
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="btn btn-primary">
              {SELLER_TEXTS.EDIT_PROFILE}
            </button>
          )}
          <button onClick={refetch} className="btn btn-secondary" disabled={loading}>
            {loading ? SELLER_TEXTS.LOADING : SELLER_TEXTS.REFRESH}
          </button>
        </div>
      </div>

      {error && (
        <div className="error mb-4">
          <strong>{SELLER_TEXTS.PROFILE_ERROR}:</strong> {error}
          <br />
          <small>Режим разработки с тестовыми данными. В продакшне потребуется настоящая аутентификация.</small>
          <div style={{ marginTop: '1rem' }}>
            <button onClick={refetch} className="btn btn-secondary">
              Повторить загрузку профиля
            </button>
          </div>
        </div>
      )}

      {mutationError && (
        <div className="error mb-4">
          <strong>{SELLER_TEXTS.PROFILE_UPDATE_ERROR}:</strong> {mutationError}
        </div>
      )}

      {success && (
        <div className="success mb-4">
          <strong>Успешно:</strong> {SELLER_TEXTS.PROFILE_UPDATED}
        </div>
      )}

      {loading && <div className="loading">{SELLER_TEXTS.LOADING_PROFILE}</div>}

      {data && (
        <div className="card">
          {isEditing ? (
            <div>
              <div className="card-header">
                <h2 className="card-title">{SELLER_TEXTS.EDIT_PROFILE}</h2>
              </div>
              <form onSubmit={handleSaveProfile}>
              <div className="form-group">
                <label className="form-label">{SELLER_TEXTS.SELLER_ID}</label>
                <input
                  type="text"
                  className="form-input"
                  value={MOCK_SELLER_ID}
                  disabled
                  style={{ backgroundColor: '#f7fafc' }}
                />
                <small style={{ color: '#718096' }}>{SELLER_TEXTS.SELLER_ID_CANNOT_CHANGE}</small>
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
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={profileData.is_online}
                    onChange={(e) => setProfileData({...profileData, is_online: e.target.checked})}
                  />
                  <span>{SELLER_TEXTS.SHOW_ONLINE}</span>
                </label>
              </div>

                <div className="flex gap-4">
                  <button type="submit" className="btn btn-primary" disabled={mutating}>
                    {mutating ? SELLER_TEXTS.SAVING : SELLER_TEXTS.SAVE_CHANGES}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn btn-secondary"
                    disabled={mutating}
                  >
                    {SELLER_TEXTS.CANCEL}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div>
              <div className="card-header">
                <h2 className="card-title">{SELLER_TEXTS.BUSINESS_INFORMATION}</h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
                <div>
                  <h3>Основная информация</h3>
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>{SELLER_TEXTS.SELLER_ID}:</strong>
                    <br />
                    <code style={{ backgroundColor: '#f7fafc', padding: '0.25rem', borderRadius: '0.25rem' }}>
                      {MOCK_SELLER_ID}
                    </code>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <strong>{SELLER_TEXTS.KEYCLOAK_UUID}:</strong>
                    <br />
                    {data.data?.keycloak_uuid ? (
                      <code style={{ backgroundColor: '#f7fafc', padding: '0.25rem', borderRadius: '0.25rem' }}>
                        {data.data.keycloak_uuid}
                      </code>
                    ) : (
                      <span style={{ color: '#718096' }}>Не установлен</span>
                    )}
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <strong>{SELLER_TEXTS.ONLINE_STATUS}:</strong>
                    <br />
                    <span className={`status ${data.data?.is_online ? 'status-success' : 'status-error'}`}>
                      {data.data?.is_online ? SELLER_TEXTS.ONLINE : SELLER_TEXTS.OFFLINE}
                    </span>
                  </div>
                </div>

                <div>
                  <h3>Детали аккаунта</h3>
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>{SELLER_TEXTS.ACCOUNT_CREATED}:</strong>
                    <br />
                    {data.data?.created_at ? new Date(data.data.created_at).toLocaleDateString('ru-RU') : 'Неизвестно'}
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <strong>{SELLER_TEXTS.LAST_UPDATED}:</strong>
                    <br />
                    {data.data?.updated_at ? new Date(data.data.updated_at).toLocaleDateString('ru-RU') : 'Неизвестно'}
                  </div>
                </div>
              </div>

              <div className="card mt-6" style={{ backgroundColor: '#dcfce7' }}>
                <h4>{SELLER_TEXTS.BUSINESS_TIPS}</h4>
                <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                  <li>{SELLER_TEXTS.STAY_ONLINE_TIP}</li>
                  <li>Убедитесь, что ваш Keycloak UUID настроен правильно</li>
                  <li>Регулярно обновляйте информацию профиля</li>
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
