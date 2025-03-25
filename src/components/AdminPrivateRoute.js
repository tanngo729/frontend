// src/components/AdminPrivateRoute.jsx
import React, { useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useAuthorization } from '../hooks/useAuthorization';
import UnauthorizedPage from '../views/admin/Unauthorized/UnauthorizedPage';

const AdminPrivateRoute = ({ children, requiredPermission }) => {
  // Thay đổi từ adminToken sang adminUser để kiểm tra xác thực đúng cách
  const { adminUser, loading } = useAdminAuth();
  const location = useLocation();
  const { can } = useAuthorization();

  // Memoize permission check to prevent unnecessary re-renders
  const hasPermission = useMemo(() => {
    if (!requiredPermission) return true;
    // Đảm bảo chỉ kiểm tra quyền khi có adminUser
    if (!adminUser) return false;
    return can(requiredPermission);
  }, [requiredPermission, can, adminUser]);

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loader"></div>
        <p>Đang tải...</p>
      </div>
    );
  }

  // Kiểm tra adminUser thay vì adminToken
  if (!adminUser) {
    // Redirect to login page with current location for redirect after login
    return (
      <Navigate
        to="/admin/auth/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (requiredPermission && !hasPermission) {
    return <UnauthorizedPage requiredPermission={requiredPermission} />;
  }

  // Render children only when all checks pass
  return children;
};

// Use React.memo to prevent unnecessary re-renders
export default React.memo(AdminPrivateRoute);