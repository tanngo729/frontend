// src/services/admin/authService.js
import axios from './axiosInstance';

const authService = {
  login: async (data) => axios.post('/auth/login', data),
  logout: async () => axios.post('/auth/logout'),
  refreshToken: async (data) => axios.post('/auth/refresh-tokens', data),
};

export default authService;
