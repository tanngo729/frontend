// src/services/bannerService.js
import axios from '../axiosInstance';

const bannerService = {
  getBanners: async () => {
    const response = await axios.get('/banners');
    return response;
  },
};

export default bannerService;
