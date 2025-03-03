// src/services/admin/categoryService.js
import axios from '../axiosInstance';

const categoryService = {
  getCategories: async (params) => axios.get('/admin/categories', { params }),
  createCategory: async (data) => axios.post('/admin/categories', data),
  updateCategory: async (id, data) => axios.put(`/admin/categories/${id}`, data),
  deleteCategory: async (id) => axios.delete(`/admin/categories/${id}`),
};

export default categoryService;
