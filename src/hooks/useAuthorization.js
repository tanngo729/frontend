import { useAdminAuth } from '../context/AdminAuthContext';

export const useAuthorization = () => {
  const { adminUser } = useAdminAuth();

  const can = (requiredPermission) => {
    if (!requiredPermission) return true;

    if (!adminUser || !adminUser.roles || adminUser.roles.length === 0) {
      return false;
    }

    // Kiểm tra admin role 
    if (adminUser.roles.some(role =>
      role.name.toLowerCase() === 'admin' ||
      role.name.toLowerCase() === 'superadmin'
    )) {
      return true;
    }

    // Kiểm tra từng role
    return adminUser.roles.some(role => {
      // Kiểm tra quyền wildcard
      const hasWildcard = role.permissions && role.permissions.some(
        perm => {
          const permName = typeof perm === 'object' ? perm.name : perm;
          return permName === '*';
        }
      );

      if (hasWildcard) return true;

      // Kiểm tra quyền cụ thể
      return role.permissions && role.permissions.some(
        perm => {
          const permName = typeof perm === 'object' ? perm.name : perm;
          return permName === requiredPermission;
        }
      );
    });
  };

  return { can };
};

export default useAuthorization;