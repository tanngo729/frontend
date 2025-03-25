// src/services/admin/adminPaymentService.js
import adminInstance from './adminAxiosInstance';

const adminPaymentService = {
  /**
   * Lấy danh sách phương thức thanh toán
   * @returns {Promise<Array>} Danh sách phương thức thanh toán
   */
  getPaymentMethods: async () => {
    try {
      const response = await adminInstance.get('/payment-methods');
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết phương thức thanh toán
   * @param {string} id - ID phương thức thanh toán
   * @returns {Promise<Object>} Chi tiết phương thức thanh toán
   */
  getPaymentMethodById: async (id) => {
    try {
      const response = await adminInstance.get(`/payment-methods/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error fetching payment method details:', error);
      throw error;
    }
  },

  /**
   * Tạo phương thức thanh toán mới
   * @param {Object} data - Dữ liệu phương thức thanh toán
   * @returns {Promise<Object>} Phương thức thanh toán đã tạo
   */
  createPaymentMethod: async (data) => {
    try {
      const response = await adminInstance.post('/payment-methods', data);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error creating payment method:', error);
      throw error;
    }
  },

  /**
   * Cập nhật phương thức thanh toán
   * @param {string} id - ID phương thức thanh toán
   * @param {Object} data - Dữ liệu cập nhật
   * @returns {Promise<Object>} Phương thức thanh toán đã cập nhật
   */
  updatePaymentMethod: async (id, data) => {
    try {
      console.log('Updating payment method:', id, data); // Debug log
      const response = await adminInstance.put(`/payment-methods/${id}`, data);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error response data:', error.response?.data);
      console.error('Error updating payment method:', error);
      throw error;
    }
  },

  /**
   * Xóa phương thức thanh toán
   * @param {string} id - ID phương thức thanh toán
   * @returns {Promise<Object>} Kết quả xóa
   */
  deletePaymentMethod: async (id) => {
    try {
      const response = await adminInstance.delete(`/payment-methods/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw error;
    }
  },

  /**
   * Cập nhật trạng thái phương thức thanh toán
   * @param {string} id - ID phương thức thanh toán
   * @param {boolean} isActive - Trạng thái kích hoạt
   * @returns {Promise<Object>} Kết quả cập nhật
   */
  updatePaymentMethodStatus: async (id, isActive) => {
    try {
      // Đảm bảo isActive là boolean
      const boolValue = Boolean(isActive);

      console.log('Updating status with boolean value:', boolValue);

      const response = await adminInstance.patch(`/payment-methods/${id}/status`, {
        isActive: boolValue
      });

      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error response data:', error.response?.data);
      console.error('Error updating payment method status:', error);
      throw error;
    }
  },

  /**
   * Lấy tổng quan thanh toán
   * @param {string} period - Khoảng thời gian (today, week, month, year, all)
   * @returns {Promise<Object>} Dữ liệu tổng quan
   */
  getPaymentOverview: async (period = 'month') => {
    try {
      const response = await adminInstance.get(`/payment-dashboard/overview`, {
        params: { period }
      });
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error fetching payment overview:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách đơn hàng đang chờ xác minh thanh toán
   * @param {number} page - Trang
   * @param {number} limit - Số lượng mỗi trang
   * @returns {Promise<Object>} Danh sách đơn hàng và thông tin phân trang
   */
  getPendingVerifications: async (page = 1, limit = 10) => {
    try {
      const response = await adminInstance.get(`/payment-dashboard/pending-verifications`, {
        params: { page, limit }
      });
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error fetching pending verifications:', error);
      throw error;
    }
  },

  /**
   * Xác minh thanh toán cho đơn hàng
   * @param {string} orderId - ID đơn hàng
   * @param {boolean} verified - Kết quả xác minh (true/false)
   * @param {string} reason - Lý do xác minh/từ chối
   * @returns {Promise<Object>} Kết quả xác minh
   */
  verifyPayment: async (orderId, verified, reason = '') => {
    try {
      const response = await adminInstance.put(`/orders/${orderId}/verify-payment`, {
        verified,
        reason
      });
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }
};

export default adminPaymentService;