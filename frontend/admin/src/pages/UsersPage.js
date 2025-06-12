import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import EntityManager from '../components/EntityManager';

/**
 * Страница управления пользователями с подмаршрутами
 */
const UsersPage = () => {

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/users/buyers" replace />} />
      <Route path="/buyers" element={<EntityManager entityType="buyers" />} />
      <Route path="/sellers" element={<EntityManager entityType="sellers" />} />
    </Routes>
  );
};

export default UsersPage;
