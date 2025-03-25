import axios from './adminAxiosInstance';

const permissionService = {
  getPermissions: async () => axios.get('/admin/permissions'),
  createPermission: async (data) => axios.post('/admin/permissions', data),
  updatePermission: async (permId, data) => axios.put(`/admin/permissions/${permId}`, data),
  deletePermission: async (permId) => axios.delete(`/admin/permissions/${permId}`),
};

export default permissionService;