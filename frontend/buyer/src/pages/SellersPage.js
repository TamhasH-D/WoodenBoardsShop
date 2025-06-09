import React, { useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { BUYER_TEXTS } from '../utils/localization';

const SellersPage = () => {
  const { setPageTitle } = useApp();

  useEffect(() => {
    setPageTitle(BUYER_TEXTS.SELLERS);
  }, [setPageTitle]);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">{BUYER_TEXTS.SELLERS}</h1>
        <p className="page-description">
          Проверенные поставщики древесины
        </p>
      </div>
      
      <div className="card">
        <p>Страница продавцов в разработке...</p>
      </div>
    </div>
  );
};

export default SellersPage;
