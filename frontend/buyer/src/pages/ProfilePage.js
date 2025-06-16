import React, { useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { BUYER_TEXTS } from '../utils/localization';
import { ProtectedRoute, useAuth } from '../components/auth';
import Profile from '../components/Profile';

const ProfileContent = () => {
  const { setPageTitle } = useApp();
  const { buyerProfile, isLoading } = useAuth();

  useEffect(() => {
    setPageTitle(BUYER_TEXTS.PROFILE);
  }, [setPageTitle]);

  if (isLoading) {
    return (
      <div className="page">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка профиля...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">{BUYER_TEXTS.PROFILE}</h1>
        <p className="page-description">
          Управление профилем и настройками
        </p>
      </div>

      <div className="space-y-6">
        {/* Информация о профиле */}
        {buyerProfile && (
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Информация о профиле</h2>
            <div className="space-y-2">
              <p><strong>ID:</strong> {buyerProfile.id}</p>
              <p><strong>Keycloak UUID:</strong> {buyerProfile.keycloak_uuid}</p>
              <p><strong>Статус:</strong> {buyerProfile.is_online ? 'Онлайн' : 'Оффлайн'}</p>
              <p><strong>Создан:</strong> {new Date(buyerProfile.created_at).toLocaleString()}</p>
              <p><strong>Обновлен:</strong> {new Date(buyerProfile.updated_at).toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Компонент профиля */}
        <Profile />
      </div>
    </div>
  );
};

const ProfilePage = () => {
  return (
    <ProtectedRoute requireProfile={true}>
      <ProfileContent />
    </ProtectedRoute>
  );
};

export default ProfilePage;
