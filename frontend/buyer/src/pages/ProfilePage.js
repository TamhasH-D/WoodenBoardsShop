import React, { useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { BUYER_TEXTS } from '../utils/localization';
import Profile from '../components/Profile';

const ProfilePage = () => {
  const { setPageTitle } = useApp();

  useEffect(() => {
    setPageTitle(BUYER_TEXTS.PROFILE);
  }, [setPageTitle]);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">{BUYER_TEXTS.PROFILE}</h1>
        <p className="page-description">
          Управление профилем и настройками
        </p>
      </div>

      <div className="space-y-6">
        {/* Компонент профиля */}
        <Profile />
      </div>
    </div>
  );
};

export default ProfilePage;
