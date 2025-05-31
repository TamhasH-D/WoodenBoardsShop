import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import EntityManager from '../components/EntityManager';

/**
 * Media management page with sub-routes
 */
const MediaPage = () => {
  const { setPageTitle } = useApp();

  useEffect(() => {
    setPageTitle('Media Management');
  }, [setPageTitle]);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/media/images" replace />} />
      <Route path="/images" element={<EntityManager entityType="images" />} />
    </Routes>
  );
};

export default MediaPage;
