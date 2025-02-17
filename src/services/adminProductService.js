import axios from 'axios';

const API_BASE_URL = 'https://backend-production-d68fa.up.railway.app'; // Đảm bảo backend đang chạy ở cổng này

const adminProductService = {
  // Lấy danh sách sản phẩm admin theo status và searchTerm
  getAdminProducts: async (status, searchTerm) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/products`, {
        params: { status, search: searchTerm },
      });
      return response.data;
    } catch (error) {
      console.error("adminProductService: Error fetching admin products:", error);
      throw error;
    }
  },

  // Cập nhật trạng thái sản phẩm (active/inactive)
  updateProductStatus: async (productId, newStatus) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/admin/products/${productId}/status`,
        { status: newStatus }
      );
      return response.data;
    } catch (error) {
      console.error("adminProductService: Error updating product status:", error);
      throw error;
    }
  },

  // Cập nhật vị trí sản phẩm (thứ tự)
  updateProductPosition: async (productId, newPosition) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/admin/products/${productId}/position`,
        { position: newPosition }
      );
      return response.data;
    } catch (error) {
      console.error("adminProductService: Error updating product position:", error);
      throw error;
    }
  },

  // Xóa sản phẩm đơn lẻ theo ID
  deleteProduct: async (productId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error("adminProductService: Error deleting product:", error);
      throw error;
    }
  },

  // Xóa, thay đổi trạng thái, vị trí nhiều sản phẩm (batch)
  batchDeleteProducts: async (productIds) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/products/batch`, {
        data: { productIds },
      });
      return response.data;
    } catch (error) {
      console.error("adminProductService: Error batch deleting products:", error);
      throw error;
    }
  },

  // Tạo mới sản phẩm
  createProduct: async (formData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/products`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error("adminProductService: Error creating product:", error);
      throw error;
    }
  },
  updateProduct: async (productId, formData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/products/${productId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error("adminProductService: Error updating product:", error);
      throw error;
    }
  },
  getProductDetail: async (productId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error("adminProductService: Error fetching product detail:", error);
      throw error;
    }
  },
};

export default adminProductService;
