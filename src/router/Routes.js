// src/router/Routes.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '../views/client/HomePage';
import ProductListPage from '../views/client/ProductListPage';
import ProductDetailView from '../views/client/ProductDetailView';
import AdminDashboard from '../views/admin/dashboard/AdminDashboard';
import ProductAdminView from '../views/admin/products/ProductAdminView';
import AdminProductDetailView from '../views/admin/products/AdminProductDetailView';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/products" element={<ProductListPage />} />
      <Route path="/products/:id" element={<ProductDetailView />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/products" element={<ProductAdminView />} />
      <Route path="/admin/products/:id" element={<AdminProductDetailView />} />
    </Routes>
  );
};

export default AppRoutes;
