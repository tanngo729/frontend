// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAdminAuth } from '../context/AdminAuthContext';

export const ProtectedClientRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <div>Đang tải...</div>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export const ProtectedAdminRoute = () => {
  const { adminUser, loading } = useAdminAuth();

  if (loading) return <div>Đang tải...</div>;
  return adminUser ? <Outlet /> : <Navigate to="/admin/login" replace />;
};