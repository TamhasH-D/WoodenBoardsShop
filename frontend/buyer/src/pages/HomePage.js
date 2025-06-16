import React, { useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import Home from '../components/Home';

/**
 * Главная страница buyer frontend
 * Использует реальные данные из API
 */
const HomePage = () => {
  const { setPageTitle } = useApp();

  useEffect(() => {
    setPageTitle('Главная');
  }, [setPageTitle]);

  return <Home />;
};

export default HomePage;
