import clientInstance from './clientAxiosInstance';

const checkoutService = {
  /**
   * Validate cart before checkout
   * @returns {Promise<Object>} Validation result
   */
  async validateCart() {
    try {
      const response = await clientInstance.get('/cart/validate');
      return response.data;
    } catch (error) {
      console.error('Cart validation error:', error);

      // Fallback client-side validation
      const cart = await this.getCart();

      const issues = {
        outOfStockItems: [],
        unavailableItems: [],
        emptyCart: false
      };

      if (!cart || !cart.items || cart.items.length === 0) {
        issues.emptyCart = true;
        return {
          isValid: false,
          issues
        };
      }

      for (const item of cart.items) {
        // Check stock
        if (item.quantity > item.product.stock) {
          issues.outOfStockItems.push({
            productId: item.product._id,
            productName: item.product.name,
            requestedQuantity: item.quantity,
            availableStock: item.product.stock
          });
        }

        // Check product availability
        if (!item.product.status || item.product.status !== 'active') {
          issues.unavailableItems.push({
            productId: item.product._id,
            productName: item.product.name
          });
        }
      }

      return {
        isValid: issues.outOfStockItems.length === 0 && issues.unavailableItems.length === 0,
        issues
      };
    }
  },

  /**
   * Get current cart
   * @returns {Promise<Object>} Cart data
   */
  async getCart() {
    try {
      const response = await clientInstance.get('/cart');
      return response.data;
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  },

  /**
   * Create order from cart
   * @param {Object} shippingInfo Shipping details
   * @param {string} paymentMethod Payment method code
   * @returns {Promise<Object>} Order creation result
   */
  async createOrderFromCart(orderData) {
    try {
      // Log chi tiết dữ liệu đầy đủ
      console.log('Chi tiết dữ liệu đơn hàng:', JSON.stringify(orderData, null, 2));

      // Kiểm tra và điền đầy đủ thông tin
      const completeOrderData = {
        ...orderData,
        shippingInfo: {
          name: orderData.shippingInfo.name,
          phone: orderData.shippingInfo.phone || '',
          email: orderData.shippingInfo.email,
          address: orderData.shippingInfo.address || '',
          note: orderData.shippingInfo.note || ''
        },
        // Đảm bảo truyền flag isVnPayProcessing nếu là thanh toán VNPay
        isVnPayProcessing: orderData.paymentMethod === 'vnpay' ?
          (orderData.isVnPayProcessing !== undefined ? orderData.isVnPayProcessing : true) :
          undefined
      };

      // Validate dữ liệu trước khi gửi
      const requiredFields = ['name', 'phone', 'email', 'address'];
      const missingFields = requiredFields.filter(field => !completeOrderData.shippingInfo[field]);

      if (missingFields.length > 0) {
        throw new Error(`Thiếu thông tin: ${missingFields.join(', ')}`);
      }

      const response = await clientInstance.post('/orders', completeOrderData);

      console.log('Phản hồi từ server:', response.data);

      return response.data;
    } catch (error) {
      // Hiển thị thông tin lỗi chi tiết hơn
      console.error('Chi tiết lỗi server:', error);
      if (error.response) {
        console.error('Nội dung lỗi từ server:', error.response.data);
      }
      throw error;
    }
  },

  /**
   * Get available payment methods
   * @returns {Promise<Array>} Payment methods
   */
  async getAvailablePaymentMethods() {
    try {
      const response = await clientInstance.get('/payment/methods');
      return response.data;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  },

  /**
   * Confirm payment for an order
   * @param {string} orderId Order ID
   * @param {FormData} paymentConfirmation Payment confirmation details
   * @returns {Promise<Object>} Payment confirmation result
   */
  async confirmPayment(orderId, paymentConfirmation) {
    try {
      const response = await clientInstance.put(
        `/orders/${orderId}/confirm-payment`,
        paymentConfirmation,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  },

  /**
   * Check payment status for an order
   * @param {string} orderId Order ID
   * @returns {Promise<Object>} Payment status details
   */
  async checkPaymentStatus(orderId) {
    try {
      const response = await clientInstance.get(`/payment/order/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw error;
    }
  }
};

export default checkoutService;