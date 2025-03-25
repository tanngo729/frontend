// src/services/client/paymentService.js
import clientInstance from './clientAxiosInstance';

const paymentService = {
  /**
   * Lấy danh sách phương thức thanh toán
   * @returns {Promise<Array>} Danh sách phương thức thanh toán
   */
  getAvailablePaymentMethods: async () => {
    try {
      const response = await clientInstance.get('/payment/methods');
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Error fetching available payment methods:', error);
      throw error;
    }
  },

  /**
   * Tính phí thanh toán dựa trên phương thức và số tiền
   * @param {string} paymentMethodCode - Mã phương thức thanh toán
   * @param {number} amount - Số tiền cần thanh toán
   * @returns {Promise<Object>} Kết quả tính phí
   */
  calculatePaymentFee: async (paymentMethodCode, amount) => {
    try {
      const response = await clientInstance.post('/payment/calculate-fee', {
        paymentMethodCode,
        amount
      });
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error calculating payment fee:', error);
      // Trả về giá trị mặc định nếu có lỗi
      return {
        paymentMethodCode,
        originalAmount: parseFloat(amount),
        fee: 0,
        totalAmount: parseFloat(amount)
      };
    }
  },

  /**
   * Lấy thông tin thanh toán cho đơn hàng
   * @param {string} orderId - ID đơn hàng
   * @returns {Promise<Object>} Thông tin thanh toán
   */
  getOrderPaymentInfo: async (orderId) => {
    try {
      const response = await clientInstance.get(`/payment/order/${orderId}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error fetching order payment info:', error);
      throw error;
    }
  },

  /**
   * Xử lý thanh toán cho đơn hàng
   * @param {string} orderId - ID đơn hàng
   * @param {string} paymentMethodCode - Mã phương thức thanh toán
   * @returns {Promise<Object>} Kết quả xử lý thanh toán
   */
  processPayment: async (orderId, paymentMethodCode) => {
    try {
      const response = await clientInstance.post(`/orders/${orderId}/process-payment`, {
        paymentMethodCode
      });
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  },

  /**
   * Xác nhận thanh toán đơn hàng (dùng cho chuyển khoản)
   * @param {string} orderId - ID đơn hàng
   * @param {Object|FormData} paymentData - Dữ liệu xác nhận thanh toán
   * @returns {Promise<Object>} Kết quả xác nhận thanh toán
   */
  confirmPayment: async (orderId, paymentData) => {
    let config = {};

    // Kiểm tra nếu paymentData là FormData thì thêm header Content-Type
    if (paymentData instanceof FormData) {
      config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };
    }

    try {
      const response = await clientInstance.put(
        `/orders/${orderId}/confirm-payment`,
        paymentData,
        config
      );
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }
};

export default paymentService;