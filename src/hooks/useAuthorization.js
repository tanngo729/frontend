// src/hooks/useAuthorization.js
import { useAuth } from '../context/AuthContext';

const useAuthorization = (requiredPermission) => {
  const { user } = useAuth();
  if (!user || !user.effectivePermissions) return false;
  // Nếu có quyền full access hoặc chứa quyền cần thiết
  return user.effectivePermissions.includes('*') || user.effectivePermissions.includes(requiredPermission);
};

export default useAuthorization;
