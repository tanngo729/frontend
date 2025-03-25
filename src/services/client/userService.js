// src/services/client/userService.js
import clientInstance from './clientAxiosInstance';

const userService = {
  getProfile: async () => {
    try {
      const response = await clientInstance.get('/user/profile');
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error.response?.data || error;
    }
  },

  updateProfile: async (userData) => {
    try {
      const response = await clientInstance.put('/user/profile', userData);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error.response?.data || error;
    }
  },

  changePassword: async (passwordData) => {
    try {
      const response = await clientInstance.post('/user/change-password', passwordData);
      return response.data;
    } catch (error) {
      console.error('Change password error:', error);
      throw error.response?.data || error;
    }
  }
};

export default userService;