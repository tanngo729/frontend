// src/services/client/orderService.js
import clientInstance from './clientAxiosInstance';

const orderService = {
  /**
   * Tạo đơn hàng mới
   * @param {Object} orderData - Dữ liệu đơn hàng
   * @returns {Promise} - Promise với kết quả đơn hàng
   */
  createOrder: async (orderData) => {
    try {
      // API này là từ orderController sẽ thay bằng checkout/create-order
      // nhưng chúng ta giữ lại để tương thích ngược với code hiện tại
      const response = await clientInstance.post('/orders', orderData);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  /**
   * Lấy thông tin đơn hàng theo ID
   * @param {string} orderId - ID đơn hàng
   * @returns {Promise} - Promise với kết quả đơn hàng
   */
  getOrderById: async (orderId) => {
    try {
      const response = await clientInstance.get(`/orders/${orderId}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  /**
   * Lấy trạng thái đơn hàng chi tiết với timeline
   * @param {string} orderId - ID đơn hàng
   * @returns {Promise} - Promise với thông tin trạng thái đơn hàng
   */
  getOrderStatus: async (orderId) => {
    try {
      const response = await clientInstance.get(`/orders/${orderId}/status`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error fetching order status:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách đơn hàng của người dùng
   * @param {Object} filters - Các tham số lọc
   * @returns {Promise} - Promise với danh sách đơn hàng
   */
  getUserOrders: async (filters = {}) => {
    try {
      // Tạo query params từ filters
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });

      const queryString = queryParams.toString();
      const url = queryString ? `/orders?${queryString}` : '/orders';

      const response = await clientInstance.get(url);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  },

  /**
   * Hủy đơn hàng
   * @param {string} orderId - ID đơn hàng
   * @param {string} reason - Lý do hủy đơn
   * @returns {Promise} - Promise với kết quả hủy đơn hàng
   */
  cancelOrder: async (orderId, reason = '') => {
    try {
      console.log('Cancel order API call:', orderId, reason);

      // Đảm bảo lý do không phải undefined/null
      const safeReason = reason || 'Khách hàng hủy đơn';

      const requestData = {
        cancelReason: safeReason
      };

      // Log toàn bộ request để debug
      console.log('Cancel order request data:', requestData);

      const response = await clientInstance.put(`/orders/${orderId}/cancel`, requestData);

      // Log response để debug
      console.log('Cancel order response:', response.data);

      return response.data?.data || response.data;
    } catch (error) {
      // Log chi tiết lỗi để debug
      console.error('Error canceling order:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  /**
   * Xác nhận đã thanh toán đơn hàng (cho chuyển khoản ngân hàng)
   * @param {string} orderId - ID đơn hàng
   * @param {Object} paymentData - Dữ liệu xác nhận thanh toán
   * @returns {Promise} - Promise với kết quả xác nhận thanh toán
   */
  confirmPayment: async (orderId, paymentData) => {
    try {
      const response = await clientInstance.put(`/orders/${orderId}/confirm-payment`, paymentData);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }
};

export default orderService;