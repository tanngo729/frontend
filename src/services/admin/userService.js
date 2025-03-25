import axios from './adminAxiosInstance';

const userService = {
  getProfile: async () => axios.get('/admin/profile'),
  updateProfile: async (data) => axios.put('/admin/profile', data),
};

export default userService;