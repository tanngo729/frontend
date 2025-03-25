import React, { useState, useEffect, useCallback } from 'react';
import {
  Form,
  Input,
  Button,
  Radio,
  Steps,
  Spin,
  Card,
  Typography,
  message
} from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { HomeOutlined, CreditCardOutlined } from '@ant-design/icons';
import ClientLayout from '../../../components/layout/Client/ClientLayout';
import { useAuth } from '../../../context/AuthContext';
import cartService from '../../../services/client/cartService';
import checkoutServices from '../../../services/client/checkout';
import paymentService from '../../../services/client/paymentService';
import vnPayService from '../../../services/client/vnPayService';
import '../../../styles/client/checkout/CheckoutPage.scss';

const { Step } = Steps;
const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

const CheckoutPage = () => {
  const [form] = Form.useForm();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Data states
  const [cart, setCart] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);
  const [shippingInfo, setShippingInfo] = useState(null);

  // Kiểm tra callback từ VNPay
  useEffect(() => {
    // Lấy thông tin từ query params (khi chuyển hướng từ VNPay)
    const searchParams = new URLSearchParams(location.search);
    const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
    const vnp_OrderInfo = searchParams.get('vnp_OrderInfo');
    const vnp_TransactionStatus = searchParams.get('vnp_TransactionStatus');

    // Nếu có thông tin callback từ VNPay
    if (vnp_ResponseCode) {
      if (vnp_ResponseCode === '00' && vnp_TransactionStatus === '00') {
        // Lấy orderId từ thông tin vnp_OrderInfo
        const orderIdMatch = vnp_OrderInfo?.match(/Thanh toan don hang (\w+)/);
        const orderId = orderIdMatch?.[1];

        if (orderId) {
          message.success('Thanh toán thành công!');
          navigate(`/order/success/${orderId}`);
        } else {
          message.warning('Thanh toán thành công nhưng không xác định được đơn hàng');
          navigate('/orders');
        }
      } else {
        message.error('Thanh toán thất bại: ' + (vnp_ResponseCode === '24' ? 'Hết thời gian thanh toán' : 'Lỗi giao dịch'));
      }
    }
  }, [location, navigate]);


  // Khởi tạo dữ liệu
  const initializeCheckout = useCallback(async () => {
    try {
      // Kiểm tra user
      if (!user) {
        navigate('/auth/login', { state: { from: '/checkout' } });
        return;
      }

      // Validate giỏ hàng
      const cartValidation = await checkoutServices.validateCart();
      if (!cartValidation.isValid) {
        message.error('Giỏ hàng không hợp lệ');
        navigate('/cart');
        return;
      }

      // Lấy dữ liệu
      const [cartData, paymentMethods] = await Promise.all([
        cartService.getCart(),
        paymentService.getAvailablePaymentMethods()
      ]);

      // Kiểm tra dữ liệu
      if (!cartData?.items?.length) {
        message.error('Giỏ hàng trống');
        navigate('/cart');
        return;
      }

      if (!paymentMethods?.length) {
        message.error('Không có phương thức thanh toán');
        return;
      }

      // Set initial values
      form.setFieldsValue({
        name: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });

      setCart(cartData);
      setPaymentMethods(paymentMethods);
      setSelectedPayment(paymentMethods[0]?.code || '');
    } catch (error) {
      console.error('Checkout error:', error);
      message.error('Khởi tạo checkout thất bại');
      navigate('/cart');
    } finally {
      setLoading(false);
    }
  }, [user, navigate, form]);

  useEffect(() => {
    initializeCheckout();
  }, [initializeCheckout]);

  // Xử lý chuyển bước
  const handleStepChange = async (step) => {
    try {
      if (step === 1) {
        const values = await form.validateFields([
          'name',
          'phone',
          'email',
          'address'
        ]);
        setShippingInfo(values);
      }
      setCurrentStep(step);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  // Xử lý đặt hàng thông thường (COD)
  const handleSubmitOrder = async () => {
    try {
      setSubmitting(true);

      const orderData = {
        items: cart.items.map(item => ({
          productId: item.product._id,
          quantity: item.quantity,
          price: item.product.price
        })),
        totalPrice: cart.totalPrice,
        shippingInfo: {
          ...shippingInfo,
          note: form.getFieldValue('note') || ''
        },
        paymentMethod: selectedPayment
      };

      console.log("Dữ liệu đơn hàng gửi đi:", JSON.stringify(orderData, null, 2));

      const result = await checkoutServices.createOrderFromCart(orderData);

      // Kiểm tra và log cấu trúc dữ liệu trả về
      console.log("Kết quả từ API:", result);

      // Xác định orderId dựa trên cấu trúc dữ liệu trả về
      let orderId;

      if (result.order && result.order._id) {
        // Cấu trúc: { order: { _id: '...' } }
        orderId = result.order._id;
      } else if (result._id) {
        // Cấu trúc: { _id: '...' }
        orderId = result._id;
      } else if (result.data && result.data.order && result.data.order._id) {
        // Cấu trúc: { data: { order: { _id: '...' } } }
        orderId = result.data.order._id;
      } else if (result.data && result.data._id) {
        // Cấu trúc: { data: { _id: '...' } }
        orderId = result.data._id;
      } else {
        throw new Error('Không thể xác định ID đơn hàng từ kết quả trả về');
      }

      // Thông báo thành công và chuyển hướng
      message.success('Đặt hàng thành công!');
      navigate(`/order/success/${orderId}`);
    } catch (error) {
      console.error('Order error:', error);
      message.error(error.response?.data?.message || 'Đặt hàng thất bại: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Xử lý thanh toán qua VNPay
  const handleVNPayPayment = async () => {
    try {
      setSubmitting(true);

      // Lưu thông tin giỏ hàng hiện tại để khôi phục nếu cần
      localStorage.setItem('pendingCheckout', JSON.stringify({
        items: cart.items,
        totalPrice: cart.totalPrice,
        shippingInfo: {
          ...shippingInfo,
          note: form.getFieldValue('note') || ''
        },
        timestamp: new Date().getTime(),
        paymentMethod: 'vnpay'
      }));

      // 1. Tạo đơn hàng tạm thời cho VNPay thay vì dùng isVnPayProcessing flag
      const orderData = {
        items: cart.items.map(item => ({
          productId: item.product._id,
          quantity: item.quantity,
          price: item.product.price
        })),
        totalPrice: cart.totalPrice,
        shippingInfo: {
          ...shippingInfo,
          note: form.getFieldValue('note') || ''
        }
      };

      console.log("Dữ liệu đơn hàng VNPay:", JSON.stringify(orderData, null, 2));

      // Tạo đơn hàng tạm thời sử dụng service mới
      const result = await vnPayService.createTemporaryOrder(orderData);
      console.log("Kết quả từ API (đơn hàng tạm thời VNPay):", result);

      // Xác định orderId
      let orderId;
      if (result.order && result.order._id) {
        orderId = result.order._id;
      } else if (result._id) {
        orderId = result._id;
      } else if (result.data && result.data.order && result.data.order._id) {
        orderId = result.data.order._id;
      } else if (result.data && result.data._id) {
        orderId = result.data._id;
      } else {
        throw new Error('Không thể xác định ID đơn hàng từ kết quả trả về');
      }

      // Lưu orderId vào localStorage với timestamp để kiểm tra timeout
      localStorage.setItem('pendingVnPayOrder', JSON.stringify({
        orderId,
        timestamp: new Date().getTime()
      }));

      message.loading({ content: 'Đang chuyển đến cổng thanh toán...', key: 'vnpayLoading' });

      // 2. Gọi API tạo URL thanh toán VNPay
      const paymentResponse = await vnPayService.createPaymentUrl(orderId, {
        returnUrl: `${window.location.origin}/order/success/${orderId}?source=vnpay`,
        cancelUrl: `${window.location.origin}/checkout?canceled=true&orderId=${orderId}`
      });

      if (paymentResponse && paymentResponse.redirectUrl) {
        // Chuyển hướng đến trang thanh toán VNPay
        window.location.href = paymentResponse.redirectUrl;
      } else {
        message.error('Không thể kết nối đến cổng thanh toán VNPay!');

        // Xử lý khi không thể tạo URL thanh toán
        await vnPayService.cancelTemporaryOrder(orderId);
        message.error('Đã hủy đơn hàng tạm thời do không thể kết nối VNPay');
        setSubmitting(false);
      }
    } catch (error) {
      console.error('Lỗi thanh toán VNPay:', error);
      message.error(error.response?.data?.message || 'Khởi tạo thanh toán VNPay thất bại');
      setSubmitting(false);
    }
  };

  useEffect(() => {
    // Kiểm tra nếu người dùng quay lại từ việc hủy thanh toán VNPay
    const searchParams = new URLSearchParams(location.search);
    const canceled = searchParams.get('canceled') === 'true';
    const orderId = searchParams.get('orderId');

    if (canceled && orderId) {
      // Đã hủy thanh toán, thông báo cho backend
      const handleCanceledPayment = async () => {
        try {
          // Gọi API hủy đơn hàng tạm thời
          await vnPayService.cancelTemporaryOrder(orderId);
          message.info('Đã hủy thanh toán VNPay, quay trở lại trang thanh toán');
        } catch (error) {
          console.error('Error canceling temporary order:', error);
        }
      };

      handleCanceledPayment();

      // Khôi phục thông tin giỏ hàng nếu có
      const pendingCheckout = localStorage.getItem('pendingCheckout');
      if (pendingCheckout) {
        try {
          const checkoutData = JSON.parse(pendingCheckout);

          // Thông báo cho người dùng
          message.info('Thông tin đơn hàng được giữ nguyên, bạn có thể tiếp tục thanh toán');

          // Điền lại thông tin form nếu cần
          if (checkoutData.shippingInfo) {
            form.setFieldsValue(checkoutData.shippingInfo);
            setShippingInfo(checkoutData.shippingInfo);
          }
        } catch (error) {
          console.error('Error parsing pending checkout:', error);
        }
      }

      // Xóa thông tin đơn hàng đang xử lý
      localStorage.removeItem('pendingVnPayOrder');
    }
  }, [location.search, form]);

  // Render form thông tin giao hàng
  const renderShippingForm = () => (
    <Form form={form} layout="vertical" className="checkout-form">
      <Form.Item
        name="name"
        label="Họ và tên"
        rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
      >
        <Input placeholder="Nguyễn Văn A" />
      </Form.Item>

      <Form.Item
        name="phone"
        label="Số điện thoại"
        rules={[
          { required: true, message: 'Vui lòng nhập số điện thoại' },
          { pattern: /^0\d{9}$/, message: 'Số điện thoại không hợp lệ' }
        ]}
      >
        <Input placeholder="0912345678" />
      </Form.Item>

      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: 'Vui lòng nhập email' },
          { type: 'email', message: 'Email không hợp lệ' }
        ]}
      >
        <Input placeholder="example@email.com" />
      </Form.Item>

      <Form.Item
        name="address"
        label="Địa chỉ"
        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
      >
        <Input.TextArea placeholder="Số nhà, đường, phường/xã, tỉnh/thành phố" />
      </Form.Item>

      <Form.Item name="note" label="Ghi chú">
        <TextArea placeholder="Ghi chú về đơn hàng..." rows={3} />
      </Form.Item>
    </Form>
  );

  // Render phương thức thanh toán
  const renderPaymentMethods = () => (
    <div className="payment-methods">
      <Radio.Group
        value={selectedPayment}
        onChange={(e) => setSelectedPayment(e.target.value)}
      >
        {paymentMethods.map(method => (
          <Radio.Button
            key={method.code}
            value={method.code}
            className="payment-method"
          >
            <div className="method-content">
              <img src={method.icon} alt={method.name} />
              <div className="method-info">
                <h4>{method.name}</h4>
                <p>{method.description}</p>
              </div>
            </div>
          </Radio.Button>
        ))}
      </Radio.Group>
    </div>
  );

  if (loading) {
    return (
      <ClientLayout>
        <div className="loading-container">
          <Spin size="large" />
          <p>Đang tải thông tin thanh toán...</p>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="checkout-container">
        <Steps current={currentStep} className="checkout-steps">
          <Step title="Thông tin giao hàng" />
          <Step title="Thanh toán" />
        </Steps>

        <div className="checkout-content">
          {currentStep === 0 && (
            <>
              {renderShippingForm()}
              <div className="form-actions">
                <Button onClick={() => navigate('/cart')}>Quay lại giỏ hàng</Button>
                <Button
                  type="primary"
                  onClick={() => handleStepChange(1)}
                >
                  Tiếp tục
                </Button>
              </div>
            </>
          )}

          {currentStep === 1 && (
            <>
              <div className="payment-section">
                <Title level={4}>Chọn phương thức thanh toán</Title>
                {renderPaymentMethods()}
              </div>

              <div className="form-actions">
                <Button onClick={() => handleStepChange(0)}>Quay lại</Button>
                {selectedPayment === 'vnpay' ? (
                  <Button
                    type="primary"
                    icon={<CreditCardOutlined />}
                    loading={submitting}
                    onClick={handleVNPayPayment}
                  >
                    Thanh toán qua VNPay
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    loading={submitting}
                    onClick={handleSubmitOrder}
                  >
                    Xác nhận đặt hàng
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </ClientLayout>
  );
};

export default CheckoutPage;