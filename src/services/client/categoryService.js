// src/services/categoryService.js
import axios from './clientAxiosInstance';
import API_URL from '../../config/api';

const categoryService = {
  getCategories: async () => {
    try {
      const response = await axios.get(`${API_URL.base}/categories`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách danh mục từ API:', error);
      throw error;
    }
  },

  getCategoryById: async (id) => {
    try {
      const response = await axios.get(`${API_URL.base}/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết danh mục theo ID:', error);
      throw error;
    }
  }
};

export default categoryService;
