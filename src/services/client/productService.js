// src/services/client/productService.js
import clientInstance from './clientAxiosInstance';

const productService = {
  getProductsClient: async (filters = {}) => {
    try {
      const response = await clientInstance.get('/products', {
        params: filters,
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách sản phẩm:', error);
      return {
        products: [],
        pagination: {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 0
        }
      };
    }
  },

  getProductDetailBySlug: async (slug) => {
    try {
      const response = await clientInstance.get(`/products/${slug}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết sản phẩm:', error);
      throw error;
    }
  },

  getSearchSuggestions: async (q) => {
    try {
      const response = await clientInstance.get('/products/search-suggestions', {
        params: { q },
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy gợi ý:', error);
      return [];
    }
  },
};

export default productService;