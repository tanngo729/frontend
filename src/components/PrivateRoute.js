// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useAuthorization from '../hooks/useAuthorization';

const PrivateRoute = ({ children, requiredPermission }) => {
  const { token, loading } = useAuth();
  const isAuthorized = useAuthorization(requiredPermission);

  if (loading) return <div>Loading...</div>;
  if (!token) return <Navigate to="/login" replace />;
  // Nếu cần kiểm tra quyền và người dùng không đủ quyền, hiển thị thông báo hoặc chuyển hướng
  if (requiredPermission && !isAuthorized) return <div>Không có quyền truy cập</div>;
  return children;
};

export default PrivateRoute;
