import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import EntityManager from '../components/EntityManager';

/**
 * Communication management page with sub-routes
 */
const CommunicationPage = () => {
  const { setPageTitle } = useApp();

  useEffect(() => {
    setPageTitle('Communication Management');
  }, [setPageTitle]);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/communication/threads" replace />} />
      <Route path="/threads" element={<EntityManager entityType="threads" />} />
      <Route path="/messages" element={<EntityManager entityType="messages" />} />
    </Routes>
  );
};

export default CommunicationPage;
