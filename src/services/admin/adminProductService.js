// src/services/admin/adminProductService.js
import axios from '../axiosInstance';

const adminProductService = {
  getAdminProducts: async (status, searchTerm) => {
    try {
      const response = await axios.get('/admin/products', {
        params: { status, search: searchTerm },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching admin products:", error);
      throw error;
    }
  },

  updateProductStatus: async (productId, newStatus) => {
    try {
      const response = await axios.put(`/admin/products/${productId}/status`, { status: newStatus });
      return response.data;
    } catch (error) {
      console.error("Error updating product status:", error);
      throw error;
    }
  },

  updateProductPosition: async (productId, newPosition) => {
    try {
      const response = await axios.put(`/admin/products/${productId}/position`, { position: newPosition });
      return response.data;
    } catch (error) {
      console.error("Error updating product position:", error);
      throw error;
    }
  },

  deleteProduct: async (productId) => {
    try {
      const response = await axios.delete(`/admin/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  },

  batchDeleteProducts: async (productIds) => {
    try {
      const response = await axios.delete('/admin/products/batch', { data: { productIds } });
      return response.data;
    } catch (error) {
      console.error("Error batch deleting products:", error);
      throw error;
    }
  },

  createProduct: async (formData) => {
    try {
      const response = await axios.post('/admin/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  },

  updateProduct: async (productId, formData) => {
    try {
      const response = await axios.put(`/admin/products/${productId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  },

  getProductDetail: async (productId) => {
    try {
      const response = await axios.get(`/admin/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching product detail:", error);
      throw error;
    }
  },
};

export default adminProductService;
