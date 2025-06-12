import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import EntityManager from '../components/EntityManager';
import { ADMIN_TEXTS } from '../utils/localization';

/**
 * Страница управления медиа с подмаршрутами
 */
const MediaPage = () => {
  const { setPageTitle } = useApp();

  useEffect(() => {
    setPageTitle(ADMIN_TEXTS.IMAGE_MANAGEMENT);
  }, [setPageTitle]);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/media/images" replace />} />
      <Route path="/images" element={<EntityManager entityType="images" />} />
    </Routes>
  );
};

export default MediaPage;
