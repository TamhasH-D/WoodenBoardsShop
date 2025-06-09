import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import EntityManager from '../components/EntityManager';
import { ADMIN_TEXTS } from '../utils/localization';

/**
 * Страница управления товарами с подмаршрутами
 */
const ProductsPage = () => {
  const { setPageTitle } = useApp();

  useEffect(() => {
    setPageTitle(ADMIN_TEXTS.PRODUCT_MANAGEMENT);
  }, [setPageTitle]);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/products/list" replace />} />
      <Route path="/list" element={<EntityManager entityType="products" />} />
      <Route path="/wood-types" element={<EntityManager entityType="woodTypes" />} />
      <Route path="/prices" element={<EntityManager entityType="prices" />} />
      <Route path="/boards" element={<EntityManager entityType="boards" />} />
    </Routes>
  );
};

export default ProductsPage;
