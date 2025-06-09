import React, { useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { BUYER_TEXTS } from '../utils/localization';

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
      
      <div className="card">
        <p>Страница профиля в разработке...</p>
      </div>
    </div>
  );
};

export default ProfilePage;
