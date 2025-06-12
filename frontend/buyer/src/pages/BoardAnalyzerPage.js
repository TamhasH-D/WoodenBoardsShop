import React, { useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { BUYER_TEXTS } from '../utils/localization';
import BoardAnalyzer from '../components/BoardAnalyzer';

const BoardAnalyzerPage = () => {
  const { setPageTitle } = useApp();

  useEffect(() => {
    setPageTitle(BUYER_TEXTS.BOARD_ANALYZER);
  }, [setPageTitle]);

  return (
    <div className="page">
      <BoardAnalyzer />
    </div>
  );
};

export default BoardAnalyzerPage;
