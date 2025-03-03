// frontend/src/services/productService.js
import axios from 'axios';

import API_BASE_URL from '../../config/api';

const productService = {
  getProductsClient: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách sản phẩm từ API:', error);
      throw error;
    }
  },
  getProductDetail: async (productId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết sản phẩm:', error);
      throw error;
    }
  },
};

export default productService;