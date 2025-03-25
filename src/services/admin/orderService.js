// src/services/admin/orderService.js
import adminInstance from './adminAxiosInstance';

const orderService = {
  /**
   * Lấy danh sách đơn hàng với các tùy chọn lọc
   * @param {Object} params - Tham số tìm kiếm và phân trang
   * @returns {Promise<Object>} Kết quả phân trang
   */
  getAllOrders: async (params = {}) => {
    try {
      const response = await adminInstance.get('/orders', { params });
      console.log('Dữ liệu gốc từ API:', response.data);

      // Dữ liệu từ API
      const data = response.data;
      let orders = [];

      // Thử tất cả các định dạng có thể
      if (data && data.data && Array.isArray(data.data)) {
        console.log('Tìm thấy đơn hàng trong data.data');
        orders = data.data;
      } else if (data && Array.isArray(data.orders)) {
        console.log('Tìm thấy đơn hàng trong data.orders');
        orders = data.orders;
      } else if (Array.isArray(data)) {
        console.log('Dữ liệu trả về trực tiếp là mảng');
        orders = data;
      } else if (typeof data === 'object') {
        // Thử tìm bất kỳ mảng nào trong object
        for (const key in data) {
          if (Array.isArray(data[key]) && data[key].length > 0 && data[key][0]._id) {
            console.log(`Tìm thấy mảng đơn hàng trong ${key}`);
            orders = data[key];
            break;
          }
        }
      }

      // Đảm bảo orders là mảng hợp lệ
      if (!Array.isArray(orders)) {
        console.warn('Không thể tìm thấy dữ liệu đơn hàng trong response, trả về mảng rỗng');
        orders = [];
      }

      // Thông tin phân trang
      const pagination = data.pagination || data.meta || {};

      // Log chi tiết để kiểm tra
      console.log('Số lượng đơn hàng sau khi xử lý:', orders.length);

      return {
        orders,
        pagination: {
          current: pagination.page || pagination.current || 1,
          pageSize: pagination.limit || pagination.pageSize || 10,
          total: pagination.total || pagination.totalItems || 0
        }
      };
    } catch (error) {
      console.error('Lỗi khi lấy đơn hàng:', error);
      // Trả về dữ liệu mặc định để tránh lỗi
      return {
        orders: [],
        pagination: {
          current: 1,
          pageSize: 10,
          total: 0
        }
      };
    }
  },

  /**
   * Lấy chi tiết đơn hàng
   * @param {string} id - ID đơn hàng
   * @returns {Promise<Object>} Chi tiết đơn hàng
   */
  getOrderById: async (id) => {
    try {
      if (!id) {
        throw new Error('ID đơn hàng không hợp lệ');
      }

      const response = await adminInstance.get(`/orders/${id}`);

      // Kiểm tra cấu trúc response
      if (response.data) {
        // Một số API có thể trả về dữ liệu trong trường 'data'
        const orderData = response.data.data || response.data;

        // Đảm bảo có _id
        if (!orderData._id) {
          console.warn('Response không chứa _id đơn hàng:', orderData);
          return null;
        }

        // Đảm bảo order.items là một mảng
        if (!Array.isArray(orderData.items)) {
          console.warn('order.items không phải là mảng, đặt làm mảng rỗng');
          orderData.items = [];
        }

        return orderData;
      }
      return null;
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  },

  /**
   * Cập nhật trạng thái đơn hàng
   * @param {string} id - ID đơn hàng
   * @param {string|object} status - Trạng thái mới hoặc đối tượng chứa thông tin cập nhật
   * @param {string} note - Ghi chú cho việc cập nhật
   * @returns {Promise<Object>} Kết quả cập nhật
   */
  updateOrderStatus: async (id, status, note = '') => {
    try {
      if (!id) {
        throw new Error('ID đơn hàng không hợp lệ');
      }

      // Đảm bảo định dạng payload đúng
      let payload;

      if (typeof status === 'string') {
        payload = { status, note: note || 'Cập nhật bởi quản trị viên' };
      } else if (typeof status === 'object') {
        payload = {
          ...status,
          note: status.note || note || 'Cập nhật bởi quản trị viên'
        };
      } else {
        throw new Error('Định dạng trạng thái không hợp lệ');
      }

      console.log('Payload gửi đi:', payload);

      // Gửi request có timeout dài hơn
      const response = await adminInstance.put(`/orders/${id}/status`, payload, {
        timeout: 30000 // Tăng timeout lên 30 giây
      });

      return response.data;
    } catch (error) {
      console.error('Lỗi chi tiết khi cập nhật trạng thái:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin vận chuyển
   * @param {string} id - ID đơn hàng
   * @param {Object} shippingInfo - Thông tin vận chuyển mới
   * @returns {Promise<Object>} Kết quả cập nhật
   */
  updateShippingInfo: async (id, shippingInfo) => {
    try {
      if (!id || !shippingInfo) {
        throw new Error('Dữ liệu cập nhật không hợp lệ');
      }

      const response = await adminInstance.put(`/orders/${id}/shipping`, shippingInfo);
      return response.data;
    } catch (error) {
      console.error('Error updating shipping info:', error);
      throw error;
    }
  },

  /**
   * Cập nhật trạng thái thanh toán
   * @param {string} id - ID đơn hàng
   * @param {Object} paymentData - Dữ liệu cập nhật thanh toán
   * @returns {Promise<Object>} Kết quả cập nhật
   */
  updatePaymentStatus: async (id, paymentData) => {
    try {
      if (!id || !paymentData) {
        throw new Error('Dữ liệu cập nhật thanh toán không hợp lệ');
      }

      const response = await adminInstance.put(`/orders/${id}/payment-status`, paymentData);
      return response.data;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  },

  /**
   * Xác thực thanh toán đơn hàng
   * @param {string} id - ID đơn hàng
   * @param {Object} verificationData - Dữ liệu xác thực
   * @returns {Promise<Object>} Kết quả xác thực
   */
  verifyPayment: async (id, verificationData) => {
    try {
      if (!id || !verificationData) {
        throw new Error('Dữ liệu xác thực thanh toán không hợp lệ');
      }

      const response = await adminInstance.post(`/orders/${id}/verify-payment`, verificationData);
      return response.data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  },

  /**
 * Lấy thống kê đơn hàng
 * @param {Object} params - Tham số lọc (theo thời gian, trạng thái…)
 * @returns {Promise<Object>} Dữ liệu thống kê
 */
  getOrderStats: async (params = {}) => {
    try {
      const response = await adminInstance.get('/orders/stats', { params });
      console.log('Raw API response:', response);

      // Get the actual data from the nested response structure
      // The backend returns { success, message, data: { orderCounts, paymentCounts, revenue, ... } }
      const responseData = response.data.data || response.data;
      console.log('Extracted response data:', responseData);

      // Create a standardized result object with defaults
      const result = {
        total: 0,
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        completed: 0,
        totalRevenue: 0
      };

      // Check if we have the expected orderCounts structure
      if (responseData.orderCounts) {
        console.log('Found orderCounts structure:', responseData.orderCounts);
        Object.assign(result, responseData.orderCounts);

        // Get revenue from the revenue object
        if (responseData.revenue && typeof responseData.revenue.total === 'number') {
          result.totalRevenue = responseData.revenue.total;
        }
      }
      // Fallback to direct property access if orderCounts isn't available
      else {
        console.log('No orderCounts structure found, trying direct property access');
        if (typeof responseData.total === 'number') result.total = responseData.total;
        if (typeof responseData.pending === 'number') result.pending = responseData.pending;
        if (typeof responseData.processing === 'number') result.processing = responseData.processing;
        if (typeof responseData.shipped === 'number') result.shipped = responseData.shipped;
        if (typeof responseData.delivered === 'number') result.delivered = responseData.delivered;
        if (typeof responseData.cancelled === 'number') result.cancelled = responseData.cancelled;
        if (typeof responseData.completed === 'number') result.completed = responseData.completed;

        // Try to find revenue in various possible locations
        if (typeof responseData.totalRevenue === 'number') {
          result.totalRevenue = responseData.totalRevenue;
        } else if (responseData.revenue && typeof responseData.revenue.total === 'number') {
          result.totalRevenue = responseData.revenue.total;
        }
      }

      console.log('Final processed stats:', result);
      return result;
    } catch (error) {
      console.error('Error fetching order stats:', error);
      return {
        total: 0,
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        completed: 0,
        totalRevenue: 0
      };
    }
  },

  /**
   * Hủy đơn hàng (Admin)
   * @param {string} id - ID đơn hàng
   * @param {string} reason - Lý do hủy
   * @returns {Promise<Object>} Kết quả hủy đơn
   */
  cancelOrder: async (id, reason) => {
    try {
      if (!id) {
        throw new Error('ID đơn hàng không hợp lệ');
      }

      if (!reason) {
        throw new Error('Vui lòng cung cấp lý do hủy đơn hàng');
      }

      const response = await adminInstance.put(`/orders/${id}/cancel`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  },

  /**
   * Xuất báo cáo đơn hàng
   * @param {Object} params - Tham số lọc cho báo cáo
   * @param {string} format - Định dạng xuất (csv, excel, pdf)
   * @returns {Promise<Blob>} Dữ liệu báo cáo
   */
  exportOrders: async (params = {}, format = 'excel') => {
    try {
      const queryParams = new URLSearchParams();

      for (const key in params) {
        if (params[key] !== undefined && params[key] !== null) {
          queryParams.append(key, params[key]);
        }
      }

      queryParams.append('format', format);

      const queryString = queryParams.toString();
      const url = `/orders/export?${queryString}`;

      const response = await adminInstance.get(url, {
        responseType: 'blob'
      });

      return response.data;
    } catch (error) {
      console.error('Error exporting orders:', error);
      throw error;
    }
  },

  /**
   * Xóa đơn hàng
   * @param {string} id - ID đơn hàng
   * @returns {Promise<Object>} Kết quả xóa
   */
  deleteOrder: async (id) => {
    try {
      if (!id) {
        throw new Error('ID đơn hàng không hợp lệ');
      }

      const response = await adminInstance.delete(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  }
};

export default orderService;