import React, { useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { BUYER_TEXTS } from '../utils/localization';

const ChatsPage = () => {
  const { setPageTitle } = useApp();

  useEffect(() => {
    setPageTitle(BUYER_TEXTS.CHATS);
  }, [setPageTitle]);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">{BUYER_TEXTS.CHATS}</h1>
        <p className="page-description">
          Общение с продавцами
        </p>
      </div>
      
      <div className="card">
        <p>Система чатов в разработке...</p>
      </div>
    </div>
  );
};

export default ChatsPage;
