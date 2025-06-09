import React, { useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { BUYER_TEXTS } from '../utils/localization';

const OrdersPage = () => {
  const { setPageTitle } = useApp();

  useEffect(() => {
    setPageTitle(BUYER_TEXTS.ORDERS);
  }, [setPageTitle]);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">{BUYER_TEXTS.ORDERS}</h1>
        <p className="page-description">
          История ваших заказов
        </p>
      </div>
      
      <div className="card">
        <p>Страница заказов в разработке...</p>
      </div>
    </div>
  );
};

export default OrdersPage;
