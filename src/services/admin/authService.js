import adminAxios from './adminAxiosInstance';
import axios from 'axios';
import API_URL from '../../config/api';

const authService = {
  login: async (data) => adminAxios.post('/admin/auth/login', data),
  logout: async () => adminAxios.post('/admin/auth/logout'),
  refreshToken: async (data) =>
    axios.post(`${API_URL.base}/admin/auth/refresh-tokens`, data, {
      headers: { 'Content-Type': 'application/json' },
    }),
};

export default authService;