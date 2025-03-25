// src/services/client/vnPayService.js
import clientInstance from './clientAxiosInstance';

const vnPayService = {
  /**
   * Tạo đơn hàng tạm thời trước khi thanh toán VNPay
   * @param {Object} orderData - Dữ liệu đơn hàng
   * @returns {Promise<Object>} - Kết quả từ API với thông tin đơn hàng tạm thời
   */
  createTemporaryOrder: async (orderData) => {
    try {
      console.log('Gọi API tạo đơn hàng tạm thời VNPay:', orderData);
      const response = await clientInstance.post('/orders/create-vnpay-temp', orderData);
      console.log('Kết quả tạo đơn hàng tạm thời VNPay:', response.data);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Lỗi tạo đơn hàng tạm thời VNPay:', error);
      console.error('Chi tiết lỗi:', error.response?.data);
      throw error;
    }
  },

  /**
   * Tạo URL thanh toán VNPay
   * @param {string} orderId - ID của đơn hàng cần thanh toán
   * @param {Object} options - Tùy chọn bổ sung
   * @returns {Promise<Object>} Kết quả từ API với redirectUrl
   */
  createPaymentUrl: async (orderId, options = {}) => {
    try {
      // Sử dụng đúng endpoint API như trong controller
      const response = await clientInstance.post(`/payment/vnpay/create-payment/${orderId}`, {
        returnUrl: options.returnUrl || `${window.location.origin}/order/success/${orderId}?source=vnpay`,
        cancelUrl: options.cancelUrl || `${window.location.origin}/checkout?canceled=true&orderId=${orderId}`
      });

      console.log('VNPay URL response:', response.data);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Lỗi tạo URL thanh toán VNPay:', error);
      throw error;
    }
  },

  /**
   * Kiểm tra trạng thái thanh toán
   * @param {string} orderId - ID đơn hàng
   * @returns {Promise<Object>} Kết quả trạng thái thanh toán
   */
  checkPaymentStatus: async (orderId) => {
    try {
      const response = await clientInstance.get(`/payment/order/${orderId}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Lỗi kiểm tra trạng thái thanh toán:', error);
      throw error;
    }
  },

  /**
   * Hủy đơn hàng tạm thời VNPay
   * @param {string} orderId - ID đơn hàng cần hủy
   * @returns {Promise<Object>} Kết quả hủy đơn hàng
   */
  cancelTemporaryOrder: async (orderId) => {
    try {
      const response = await clientInstance.post(`/orders/${orderId}/cancel-temporary`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Lỗi hủy đơn hàng tạm thời:', error);
      throw error;
    }
  }
};

export default vnPayService;