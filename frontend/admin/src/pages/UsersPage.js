import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import EntityManager from '../components/EntityManager';
import { ADMIN_TEXTS } from '../utils/localization';

/**
 * Страница управления пользователями с подмаршрутами
 */
const UsersPage = () => {
  const { setPageTitle } = useApp();

  useEffect(() => {
    setPageTitle(ADMIN_TEXTS.USER_MANAGEMENT);
  }, [setPageTitle]);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/users/buyers" replace />} />
      <Route path="/buyers" element={<EntityManager entityType="buyers" />} />
      <Route path="/sellers" element={<EntityManager entityType="sellers" />} />
    </Routes>
  );
};

export default UsersPage;
