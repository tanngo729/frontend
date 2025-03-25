import axios from './adminAxiosInstance';

const categoryService = {
  getCategories: async (params) => {
    try {
      // Sử dụng endpoint đúng
      const response = await axios.get('/categories', { params });
      return response;
    } catch (error) {
      console.error("Lỗi khi lấy danh mục:", error);
      throw error;
    }
  },

  createCategory: async (data) => {
    try {
      const response = await axios.post('/categories', data);
      return response;
    } catch (error) {
      console.error("Lỗi khi tạo danh mục:", error);
      throw error;
    }
  },

  updateCategory: async (id, data) => {
    try {
      // In thông tin để debug
      console.log(`Cập nhật danh mục - ID: ${id}`, data);

      // Kiểm tra ID hợp lệ
      if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
        throw new Error('ID danh mục không hợp lệ');
      }

      const response = await axios.put(`/categories/${id}`, data);
      return response;
    } catch (error) {
      console.error("Lỗi khi cập nhật danh mục:", error);
      if (error.response) {
        console.error("Chi tiết lỗi:", error.response.data);
      }
      throw error;
    }
  },

  deleteCategory: async (id) => {
    try {
      const response = await axios.delete(`/categories/${id}`);
      return response;
    } catch (error) {
      console.error("Lỗi khi xóa danh mục:", error);
      throw error;
    }
  },
};

export default categoryService;