// src/services/client/cartService.js
import clientInstance from './clientAxiosInstance';

// Cache cho giỏ hàng để tránh gọi API nhiều lần
let cartCache = null;
let lastFetchTime = 0;
const CACHE_EXPIRY = 30000; // 30 giây

const cartService = {
  // Thêm sản phẩm vào giỏ hàng
  addToCart: async (productId, quantity) => {
    try {
      const response = await clientInstance.post('/cart/add', {
        productId,
        quantity
      });

      // Cập nhật cache
      cartCache = response.data;
      lastFetchTime = Date.now();

      // Kích hoạt event để thông báo rằng giỏ hàng đã thay đổi
      window.dispatchEvent(new Event('cartUpdated'));

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy giỏ hàng theo token với cache
  getCart: async (forceRefresh = false) => {
    try {
      // Nếu có cache và chưa hết hạn và không yêu cầu refresh
      if (cartCache && !forceRefresh && Date.now() - lastFetchTime < CACHE_EXPIRY) {
        return cartCache;
      }

      const response = await clientInstance.get('/cart');

      // Cập nhật cache
      cartCache = response.data;
      lastFetchTime = Date.now();

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật số lượng sản phẩm trong giỏ
  updateCartItem: async (productId, quantity) => {
    try {
      const response = await clientInstance.put('/cart/update-item', {
        productId,
        quantity
      });

      // Cập nhật cache
      cartCache = response.data;
      lastFetchTime = Date.now();

      // Kích hoạt event để thông báo rằng giỏ hàng đã thay đổi
      window.dispatchEvent(new Event('cartUpdated'));

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Xóa sản phẩm khỏi giỏ hàng
  removeFromCart: async (productId) => {
    try {
      const response = await clientInstance.delete('/cart/remove-item', {
        data: { productId }
      });

      // Cập nhật cache
      cartCache = response.data;
      lastFetchTime = Date.now();

      // Kích hoạt event để thông báo rằng giỏ hàng đã thay đổi
      window.dispatchEvent(new Event('cartUpdated'));

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Xóa toàn bộ giỏ hàng
  clearCart: async () => {
    try {
      const response = await clientInstance.delete('/cart/clear');

      // Cập nhật cache
      cartCache = response.data;
      lastFetchTime = Date.now();

      // Kích hoạt event để thông báo rằng giỏ hàng đã thay đổi
      window.dispatchEvent(new Event('cartUpdated'));

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Tính toán tổng tiền giỏ hàng (có thể chạy ở client)
  calculateTotal: (cartItems) => {
    if (!cartItems || !Array.isArray(cartItems)) return 0;

    return cartItems.reduce((total, item) => {
      const price = item.product?.price || 0;
      const quantity = item.quantity || 0;
      return total + (price * quantity);
    }, 0);
  },

  // Làm mới cache (gọi khi cần làm mới dữ liệu)
  invalidateCache: () => {
    cartCache = null;
    lastFetchTime = 0;
  }
};

export default cartService;