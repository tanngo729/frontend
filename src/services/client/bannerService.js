// src/services/bannerService.js
import axios from './clientAxiosInstance';
import API_URL from '../../config/api';

const bannerService = {
  getBanners: async () => {
    const response = await axios.get(`${API_URL.base}/banners`);
    return response;
  },
};

export default bannerService;
