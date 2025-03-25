import axios from './adminAxiosInstance';

const roleService = {
  getRoles: async () => axios.get('/admin/roles'),
  createRole: async (data) => axios.post('/admin/roles', data),
  updateRole: async (roleId, data) => axios.put(`/admin/roles/${roleId}`, data),
  deleteRole: async (roleId) => axios.delete(`/admin/roles/${roleId}`),
};

export default roleService;