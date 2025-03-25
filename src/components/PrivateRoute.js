// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useAuthorization from '../hooks/useAuthorization';

const PrivateRoute = ({ children, requiredPermission }) => {
  const { token, loading } = useAuth();
  const location = useLocation();

  // Luôn luôn gọi useAuthorization, không đặt trong điều kiện
  const isAuthorized = useAuthorization(requiredPermission);

  if (loading) return <div>Loading...</div>;

  if (!token) {
    // Nếu chưa đăng nhập, chuyển hướng dựa vào URL hiện tại
    const isAdminRoute = location.pathname.startsWith('/admin');
    return <Navigate to={isAdminRoute ? '/admin/auth/login' : '/auth/login'} replace />;
  }

  if (requiredPermission && !isAuthorized) {
    return <div>Không có quyền truy cập</div>;
  }

  return children;
};

export default PrivateRoute;
