// frontend/src/services/productService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000'; // Thay đổi nếu backend chạy ở cổng khác

const productService = {
  getProductsClient: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products`);
      return response.data; // Trả về dữ liệu sản phẩm từ response
    } catch (error) {
      console.error('Lỗi khi lấy danh sách sản phẩm từ API:', error);
      throw error; // Re-throw error để component xử lý nếu cần
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