// src/views/client/Cart/CartPage.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Table, Button, message, Spin, Empty, Space, Typography, Tooltip } from 'antd';
import {
  DeleteOutlined,
  ShoppingOutlined,
  MinusOutlined,
  PlusOutlined,
  LoadingOutlined,
  ShoppingCartOutlined,
  LoginOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import cartService from '../../../services/client/cartService';
import ClientLayout from '../../../components/layout/Client/ClientLayout';
import { useAuth } from '../../../context/AuthContext';
import '../../../styles/client/cart/CartPage.scss';

const { Title, Text } = Typography;

// Format tiền tệ - tối ưu bằng cách tạo utility function
const formatCurrency = (amount) => {
  return amount?.toLocaleString('vi-VN') || '0';
};

// Component tùy chỉnh để điều khiển số lượng
const QuantityControl = ({ value, onChange, min = 1, max = 99, loading, productId }) => {
  const [inputValue, setInputValue] = useState(value);

  // Cập nhật inputValue khi value props thay đổi
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Ngăn chặn việc giảm xuống dưới giá trị min
  const handleDecrease = () => {
    if (!loading && value > min) {
      onChange(value - 1);
    }
  };

  // Ngăn chặn việc tăng lên trên giá trị max
  const handleIncrease = () => {
    if (!loading && value < max) {
      onChange(value + 1);
    }
  };

  // Xử lý khi người dùng nhập trực tiếp
  const handleInputChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      setInputValue('');
    } else {
      const numVal = parseInt(val, 10);
      if (!isNaN(numVal)) {
        setInputValue(numVal);
      }
    }
  };

  // Xử lý khi người dùng hoàn thành nhập
  const handleInputBlur = () => {
    let finalValue = inputValue;

    // Nếu input trống, đặt về giá trị min
    if (finalValue === '' || isNaN(finalValue)) {
      finalValue = min;
    } else {
      // Đảm bảo giá trị nằm trong khoảng min-max
      finalValue = Math.max(min, Math.min(max, parseInt(finalValue, 10)));
    }

    // Cập nhật lại input và gọi onChange nếu giá trị thay đổi
    setInputValue(finalValue);
    if (finalValue !== value) {
      onChange(finalValue);
    }
  };

  // Xử lý khi người dùng nhấn Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleInputBlur();
    }
  };

  return (
    <div className="quantity-control">
      <Tooltip title="Giảm số lượng">
        <Button
          className="quantity-btn quantity-decrease"
          icon={<MinusOutlined />}
          onClick={handleDecrease}
          disabled={loading || value <= min}
        />
      </Tooltip>

      <div className="quantity-display">
        {loading ? (
          <Spin indicator={<LoadingOutlined spin />} />
        ) : (
          <input
            type="text"
            className="quantity-input"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            disabled={loading}
            aria-label="Số lượng"
            min={min}
            max={max}
          />
        )}
      </div>

      <Tooltip title="Tăng số lượng">
        <Button
          className="quantity-btn quantity-increase"
          icon={<PlusOutlined />}
          onClick={handleIncrease}
          disabled={loading || value >= max}
        />
      </Tooltip>
    </div>
  );
};

const CartTable = ({ cart, onQuantityChange, onRemoveItem, updatingItems }) => {
  // Sử dụng useMemo để tránh tính toán lại columns mỗi khi component re-render
  const columns = useMemo(() => [
    {
      title: 'Ảnh',
      dataIndex: 'product',
      key: 'image',
      render: (product) => (
        <div className="product-image-container">
          <img
            src={product.image || 'https://via.placeholder.com/80'}
            alt={product.name}
            loading="lazy" // Lazy load ảnh
            className="product-image"
          />
        </div>
      ),
      width: 100,
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'product',
      key: 'name',
      render: (product) => (
        <div className="product-info">
          <h4 className="product-name">{product.name}</h4>
          {product.sku && <p className="product-sku">Mã SP: {product.sku}</p>}
        </div>
      ),
    },
    {
      title: 'Giá',
      dataIndex: 'product',
      key: 'price',
      render: (product) => (
        <div className="product-price">
          {formatCurrency(product.price)} VNĐ
        </div>
      ),
      align: 'right',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
      render: (quantity, record) => (
        <QuantityControl
          value={quantity}
          onChange={(value) => onQuantityChange(record.product._id, value, quantity)}
          loading={updatingItems.includes(record.product._id)}
          productId={record.product._id}
          min={1}
          max={record.product.stock || 99}
        />
      ),
    },
    {
      title: 'Thành tiền',
      key: 'total',
      align: 'right',
      render: (_, record) => {
        const total = record.product.price * record.quantity;
        return (
          <div className="product-total">
            <span>{formatCurrency(total)} VNĐ</span>
          </div>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => onRemoveItem(record.product._id, record.product.name)}
          aria-label={`Xóa ${record.product.name} khỏi giỏ hàng`}
          loading={updatingItems.includes(`remove_${record.product._id}`)}
          className="delete-item-btn"
        >
          Xóa
        </Button>
      ),
    },
  ], [onQuantityChange, onRemoveItem, updatingItems]);

  return (
    <Table
      dataSource={cart.items}
      columns={columns}
      rowKey={(record) => record.product._id}
      pagination={false}
      className="cart-table"
      // Tối ưu hiệu suất Table
      rowClassName={(record, index) => `cart-item ${index % 2 === 0 ? 'table-row-light' : 'table-row-dark'}`}
      size="middle"
      locale={{
        emptyText: <Empty description="Giỏ hàng trống" />
      }}
    />
  );
};

const CartPage = () => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updatingItems, setUpdatingItems] = useState([]);
  const navigate = useNavigate();

  // Cải thiện hàm debounce bằng cách lưu tham chiếu và sử dụng useCallback
  const debounce = useCallback((func, delay = 300) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  }, []);

  // Hàm lấy dữ liệu giỏ hàng - sử dụng useCallback
  const fetchCart = useCallback(async () => {
    if (!user) return; // Tránh gọi API khi không có user

    setLoading(true);
    try {
      const data = await cartService.getCart();
      setCart(data);
    } catch (error) {
      console.error('Error fetching cart:', error);

      if (error.response) {
        if (error.response.status === 401) {
          console.log('User not logged in');
        } else if (error.response.status === 429) {
          message.error('Quá nhiều yêu cầu. Vui lòng thử lại sau.');
        } else if (error.response.status === 404) {
          console.log('Cart not found');
        } else {
          message.error(`Lỗi khi tải giỏ hàng: ${error.response.data?.message || 'Lỗi không xác định'}`);
        }
      } else {
        message.error('Lỗi kết nối đến server');
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Chỉ fetch giỏ hàng khi user đã đăng nhập
  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user, fetchCart]);

  // Tạo hàm thực hiện API call đã được debounce
  const updateCartItemDebounced = useCallback(
    debounce(async (productId, quantity) => {
      try {
        await cartService.updateCartItem(productId, quantity);
        // Thông báo nhỏ gọn và biến mất nhanh chóng
        message.success('Giỏ hàng đã cập nhật', 1);
      } catch (error) {
        message.error('Lỗi khi cập nhật số lượng');
        console.error('Error updating cart item:', error);
        fetchCart(); // Chỉ gọi fetchCart nếu có lỗi để khôi phục
      } finally {
        setUpdatingItems((prev) => prev.filter((id) => id !== productId));
      }
    }, 500), // Tăng debounce timeout lên 500ms để giảm số lượng API call
    [fetchCart]
  );

  // Cập nhật số lượng sản phẩm - CẢI THIỆN
  const handleQuantityChange = useCallback(
    (productId, newQuantity, currentQuantity) => {
      const qty = Number(newQuantity);
      if (isNaN(qty) || qty < 1) return;
      if (qty === currentQuantity) return;

      // Cập nhật UI tức thì (Optimistic Update) và thêm hiệu ứng highlight
      setUpdatingItems((prev) => [...prev, productId]);
      setCart((prevCart) => {
        if (!prevCart) return prevCart;

        const newItems = prevCart.items.map(item => {
          if (item.product._id === productId) {
            return { ...item, quantity: qty, highlight: true };
          }
          return item;
        });

        // Tính lại tổng tiền
        const newTotalPrice = newItems.reduce(
          (sum, item) => sum + (item.product.price * item.quantity), 0
        );

        return {
          ...prevCart,
          items: newItems,
          totalPrice: newTotalPrice
        };
      });

      // Gọi hàm đã được debounce
      updateCartItemDebounced(productId, qty);
    },
    [updateCartItemDebounced]
  );

  // Xóa sản phẩm khỏi giỏ hàng - CẢI THIỆN
  const handleRemoveItem = useCallback(async (productId, productName) => {
    const removeId = `remove_${productId}`;
    setUpdatingItems((prev) => [...prev, removeId]);

    // Optimistic Update - Cập nhật UI ngay với hiệu ứng fade-out
    setCart((prevCart) => {
      if (!prevCart) return prevCart;

      const newItems = prevCart.items.filter(item => item.product._id !== productId);
      const newTotalPrice = newItems.reduce(
        (sum, item) => sum + (item.product.price * item.quantity), 0
      );

      return {
        ...prevCart,
        items: newItems,
        totalPrice: newTotalPrice
      };
    });

    try {
      await cartService.removeFromCart(productId);
      message.success(`Đã xóa ${productName || 'sản phẩm'} khỏi giỏ hàng`);
    } catch (error) {
      message.error('Lỗi khi xóa sản phẩm');
      console.error('Error removing cart item:', error);
      fetchCart(); // Chỉ gọi fetchCart khi có lỗi để khôi phục
    } finally {
      setUpdatingItems((prev) => prev.filter((id) => id !== removeId));
    }
  }, [fetchCart]);

  // Xóa toàn bộ giỏ hàng - CẢI THIỆN 
  const handleClearCart = useCallback(async () => {
    // Sử dụng modal xác nhận thay vì window.confirm
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?')) {
      // Optimistic Update - Cập nhật UI ngay
      const previousCart = cart; // Lưu lại giỏ hàng trước khi xóa
      setCart((prev) => prev ? { ...prev, items: [], totalPrice: 0 } : prev);

      try {
        await cartService.clearCart();
        message.success('Giỏ hàng đã được xóa');
      } catch (error) {
        message.error('Lỗi khi xóa giỏ hàng');
        console.error('Error clearing cart:', error);
        setCart(previousCart); // Khôi phục giỏ hàng trước đó nếu gặp lỗi
      }
    }
  }, [cart]);

  // Tính toán totalPrice một lần và chỉ khi items thay đổi
  const formattedTotalPrice = useMemo(() => {
    return formatCurrency(cart?.totalPrice);
  }, [cart?.totalPrice]);

  return (
    <ClientLayout>
      <div className="cart-container">
        <div className="cart-header">
          <Title level={2}> Giỏ hàng của bạn</Title>
        </div>

        {!user ? (
          <div className="cart-page__no-user">
            <ShoppingCartOutlined className="empty-cart-icon" />
            <Title level={3}>Bạn cần đăng nhập để xem giỏ hàng</Title>
            <p>Vui lòng đăng nhập để xem giỏ hàng và tiếp tục mua sắm</p>
            <Button type="primary" size="large" icon={<LoginOutlined />} onClick={() => navigate('/auth/login')}>
              Đăng nhập
            </Button>
          </div>
        ) : (
          <div className="cart-page">
            {loading ? (
              <div className="cart-loading-container">
                <Spin size="large" indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />} />
                <p>Đang tải giỏ hàng...</p>
              </div>
            ) : cart && cart.items && cart.items.length > 0 ? (
              <>
                <CartTable
                  cart={cart}
                  onQuantityChange={handleQuantityChange}
                  onRemoveItem={handleRemoveItem}
                  updatingItems={updatingItems}
                />
                <div className="cart-page__summary">
                  <div className="cart-summary-info">
                    <Text type="secondary">Tổng sản phẩm: {cart.items.length}</Text>
                    <Title level={4}>
                      Tổng tiền: <span className="total-price">{formattedTotalPrice} VNĐ</span>
                    </Title>
                  </div>
                  <Space className="cart-actions">
                    <Button
                      type="primary"
                      size="large"
                      icon={<ShoppingOutlined />}
                      onClick={() => navigate('/checkout')}
                      className="checkout-btn"
                    >
                      Thanh toán
                    </Button>
                    <Button
                      danger
                      size="large"
                      icon={<DeleteOutlined />}
                      onClick={handleClearCart}
                      className="clear-cart-btn"
                    >
                      Xóa giỏ hàng
                    </Button>
                  </Space>
                </div>
              </>
            ) : (
              <div className="cart-empty">
                <ShoppingCartOutlined className="empty-cart-icon" />
                <Title level={3}>Giỏ hàng của bạn đang trống</Title>
                <p>Thêm sản phẩm vào giỏ hàng để tiến hành mua sắm</p>
                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingOutlined />}
                  onClick={() => navigate('/products')}
                  className="shop-now-btn"
                >
                  Xem sản phẩm
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </ClientLayout>
  );
};

export default CartPage;