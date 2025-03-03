// src/services/admin/bannerService.js
import axios from '../axiosInstance';

const bannerService = {
  getBanners: async () => {
    const response = await axios.get('/admin/banners');
    return response;
  },
  createBanner: async (formData) => {
    const response = await axios.post('/admin/banners', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response;
  },
  updateBanner: async (bannerId, formData) => {
    const response = await axios.put(`/admin/banners/${bannerId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response;
  },
  updateBannerPosition: async (bannerId, position) => {
    const response = await axios.put(`/admin/banners/${bannerId}/position`, { position });
    return response;
  },
  deleteBanner: async (bannerId) => {
    const response = await axios.delete(`/admin/banners/${bannerId}`);
    return response;
  },
};

export default bannerService;
