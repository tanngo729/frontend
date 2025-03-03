import axios from '../axiosInstance';

const userService = {
  getProfile: async () => axios.get('/admin/profile'),
  updateProfile: async (data) => axios.put('/admin/profile', data),
};

export default userService;
