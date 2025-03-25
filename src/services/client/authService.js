// src/services/client/authService.js
import clientInstance from './clientAxiosInstance';

const authService = {
  // Các phương thức hiện có
  login: async (data) => {
    try {
      const response = await clientInstance.post('/auth/login', data);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error.response?.data || error;
    }
  },

  register: async (data) => {
    try {
      const response = await clientInstance.post('/auth/register', data);
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error.response?.data || error;
    }
  },

  logout: async () => {
    try {
      const response = await clientInstance.post('/auth/logout');
      return response.data;
    } catch (error) {
      console.error('Logout error:', error);
      throw error.response?.data || error;
    }
  },

  refreshToken: async (refreshToken) => {
    try {
      const response = await clientInstance.post('/auth/refresh-tokens', { refreshToken });
      return response.data;
    } catch (error) {
      console.error('Refresh token error:', error);
      throw error.response?.data || error;
    }
  },

  // Thêm các phương thức mới
  forgotPassword: async (email) => {
    try {
      const response = await clientInstance.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error.response?.data || error;
    }
  },

  validateResetToken: async (token) => {
    try {
      const response = await clientInstance.get(`/auth/reset-password/${token}`);
      return response.data;
    } catch (error) {
      console.error('Validate reset token error:', error);
      throw error.response?.data || error;
    }
  },

  resetPassword: async (token, password) => {
    try {
      const response = await clientInstance.post(`/auth/reset-password/${token}`, { password });
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error.response?.data || error;
    }
  }
};

export default authService;