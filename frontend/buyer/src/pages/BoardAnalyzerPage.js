import React, { useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { BUYER_TEXTS } from '../utils/localization';

const BoardAnalyzerPage = () => {
  const { setPageTitle } = useApp();

  useEffect(() => {
    setPageTitle(BUYER_TEXTS.BOARD_ANALYZER);
  }, [setPageTitle]);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">{BUYER_TEXTS.BOARD_ANALYZER}</h1>
        <p className="page-description">
          Анализ и расчет параметров досок
        </p>
      </div>
      
      <div className="card">
        <p>Анализатор досок в разработке...</p>
      </div>
    </div>
  );
};

export default BoardAnalyzerPage;
