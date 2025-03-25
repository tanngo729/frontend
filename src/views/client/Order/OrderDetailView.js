// src/views/client/Order/OrderDetailView.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Typography,
  Divider,
  Button,
  Tag,
  Steps,
  Modal,
  Input,
  Descriptions,
  Image,
  Spin,
  Alert,
  Timeline,
  Space,
  Form,
  DatePicker,
  message
} from 'antd';
import {
  ShoppingOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import ClientLayout from '../../../components/layout/Client/ClientLayout';
import orderService from '../../../services/client/orderService';
import '../../../styles/client/order/OrderDetailView.scss';

const { Title, Text } = Typography;
const { Step } = Steps;
const { TextArea } = Input;
const { confirm } = Modal;

const formatPrice = (price) => {
  return price?.toLocaleString('vi-VN') || '0';
};

const OrderDetailView = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [timelineData, setTimelineData] = useState([]);
  const [cancelling, setCancelling] = useState(false);
  const [paymentConfirmModalVisible, setPaymentConfirmModalVisible] = useState(false);
  const [paymentConfirmation, setPaymentConfirmation] = useState({
    transactionDate: '',
    transactionRef: '',
    bankName: '',
    note: ''
  });
  const [form] = Form.useForm();

  // Hàm map icon theo loại trạng thái
  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'processing':
        return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
      case 'error':
        return <CloseCircleOutlined style={{ color: '#f5222d' }} />;
      case 'warning':
        return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
      default:
        return <ShoppingOutlined />;
    }
  };

  // Fetch order data
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const orderData = await orderService.getOrderById(orderId);
        setOrder(orderData);
        setTimelineData(orderData.timeline || []);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải thông tin đơn hàng');
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  // Handle order cancellation
  const handleCancelOrder = async () => {
    try {
      setCancelling(true); // Bắt đầu loading

      console.log('Huỷ đơn hàng:', orderId, 'với lý do:', cancellationReason);

      // Gọi API hủy đơn hàng
      await orderService.cancelOrder(orderId, cancellationReason);

      // Refresh order data after cancellation
      const updatedOrder = await orderService.getOrderById(orderId);
      setOrder(updatedOrder);
      setTimelineData(updatedOrder.timeline || []);
      setCancelModalVisible(false);

      message.success('Đơn hàng của bạn đã được hủy thành công');
    } catch (err) {
      console.error('Error cancelling order:', err);
      message.error(err.response?.data?.message || 'Đã xảy ra lỗi khi hủy đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setCancelling(false);
    }
  };

  // Show cancel confirmation modal
  const showCancelConfirm = () => {
    setCancelModalVisible(true);
  };

  const renderCancelOrderModal = () => (
    <Modal
      title="Xác nhận hủy đơn hàng"
      open={cancelModalVisible}
      onOk={handleCancelOrder}
      onCancel={() => setCancelModalVisible(false)}
      okText="Xác nhận hủy"
      cancelText="Đóng"
      okButtonProps={{
        danger: true,
        loading: cancelling,
        disabled: cancelling
      }}
      cancelButtonProps={{
        disabled: cancelling
      }}
    >
      <p>Bạn có chắc chắn muốn hủy đơn hàng này không?</p>
      <p>Vui lòng cho biết lý do hủy đơn:</p>
      <TextArea
        rows={4}
        value={cancellationReason}
        onChange={(e) => setCancellationReason(e.target.value)}
        placeholder="Nhập lý do hủy đơn hàng (không bắt buộc)"
        disabled={cancelling}
      />
      {cancelling && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
          <p style={{ marginTop: 8 }}>Đang xử lý yêu cầu hủy đơn hàng...</p>
        </div>
      )}
    </Modal>
  );

  // Handle payment confirmation
  const handlePaymentConfirmation = async () => {
    try {
      const values = await form.validateFields();
      setPaymentConfirmModalVisible(false);
      Modal.success({
        title: 'Xác nhận thanh toán thành công',
        content: 'Thông tin thanh toán của bạn đã được gửi và đang chờ xác minh. Chúng tôi sẽ cập nhật trạng thái đơn hàng sớm nhất có thể.',
      });

      const updatedOrder = await orderService.getOrderById(orderId);
      setOrder(updatedOrder);
      setTimelineData(updatedOrder.timeline || []);
    } catch (err) {
      Modal.error({
        title: 'Không thể xác nhận thanh toán',
        content: err.response?.data?.message || 'Đã xảy ra lỗi khi xác nhận thanh toán. Vui lòng thử lại sau.',
      });
    }
  };

  // Determine current step in order process
  const getCurrentStep = () => {
    if (!order) return 0;

    switch (order.status) {
      case 'cancelled':
        return -1; // Special case for cancelled orders
      case 'pending':
        return 0;
      case 'processing':
        return 1;
      case 'shipped':
        return 2;
      case 'delivered':
        return 3;
      case 'completed':
        return 4;
      default:
        return 0;
    }
  };

  // Render next action button based on order state
  const renderNextActionButton = () => {
    if (!order || !order.nextAction) return null;

    switch (order.nextAction.action) {
      case 'confirm_payment':
        return (
          <Button
            type="primary"
            onClick={() => setPaymentConfirmModalVisible(true)}
          >
            {order.nextAction.actionText}
          </Button>
        );
      case 'track_order':
        return (
          <Button type="primary">
            {order.nextAction.actionText}
          </Button>
        );
      case 'contact_support':
        return (
          <Button type="primary" onClick={() => window.location.href = '/contact'}>
            {order.nextAction.actionText}
          </Button>
        );
      case 'review':
        return (
          <Button type="primary">
            {order.nextAction.actionText}
          </Button>
        );
      default:
        return null;
    }
  };

  // Get tag color based on order status
  const getStatusTagColor = (status) => {
    switch (status) {
      case 'pending':
        return 'gold';
      case 'processing':
        return 'blue';
      case 'shipped':
        return 'cyan';
      case 'delivered':
        return 'green';
      case 'completed':
        return 'green';
      case 'cancelled':
        return 'red';
      default:
        return 'default';
    }
  };

  // Get tag color based on payment status
  const getPaymentStatusTagColor = (status) => {
    switch (status) {
      case 'paid':
        return 'green';
      case 'awaiting_payment':
        return 'gold';
      case 'awaiting_verification':
        return 'processing';
      case 'failed':
        return 'red';
      case 'cancelled':
        return 'red';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="loading-container">
          <Spin size="large" />
          <Text>Đang tải thông tin đơn hàng...</Text>
        </div>
      </ClientLayout>
    );
  }

  if (error) {
    return (
      <ClientLayout>
        <div className="error-container">
          <Alert
            message="Không thể tải thông tin đơn hàng"
            description={error}
            type="error"
            showIcon
          />
          <Button
            type="primary"
            onClick={() => navigate('/orders')}
            style={{ marginTop: 16 }}
          >
            Quay lại danh sách đơn hàng
          </Button>
        </div>
      </ClientLayout>
    );
  }

  if (!order) {
    return (
      <ClientLayout>
        <div className="error-container">
          <Alert
            message="Không tìm thấy đơn hàng"
            description="Không thể tìm thấy thông tin đơn hàng yêu cầu."
            type="warning"
            showIcon
          />
          <Button
            type="primary"
            onClick={() => navigate('/orders')}
            style={{ marginTop: 16 }}
          >
            Quay lại danh sách đơn hàng
          </Button>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="order-detail-container">
        <Row justify="space-between" align="middle" className="order-header">
          <Col>
            <Title level={2}>Chi tiết đơn hàng #{order.orderNumber}</Title>
          </Col>
          <Col>
            <Space direction="horizontal">
              <Tag color={getStatusTagColor(order.status)} className="status-tag">
                {order.statusText}
              </Tag>
              <Tag color={getPaymentStatusTagColor(order.paymentStatus)} className="status-tag">
                {order.paymentStatusText}
              </Tag>
            </Space>
          </Col>
        </Row>

        {order.status !== 'cancelled' && getCurrentStep() >= 0 && (
          <Card className="order-progress-card">
            <Steps current={getCurrentStep()} className="order-steps">
              <Step title="Đặt hàng" description="Chờ xác nhận" />
              <Step title="Xử lý" description="Đang chuẩn bị" />
              <Step title="Vận chuyển" description="Đang giao hàng" />
              <Step title="Giao hàng" description="Đã giao hàng" />
              <Step title="Hoàn thành" description="Đơn hàng hoàn tất" />
            </Steps>
          </Card>
        )}

        {order.status === 'cancelled' && (
          <Alert
            message="Đơn hàng đã bị hủy"
            description={order.cancelReason ? `Lý do: ${order.cancelReason}` : "Đơn hàng này đã bị hủy."}
            type="error"
            showIcon
            className="cancelled-alert"
          />
        )}

        <Row gutter={[24, 24]} className="order-content">
          <Col xs={24} lg={16}>
            <Card title="Thông tin sản phẩm" className="product-card">
              {order.items.map((item, index) => (
                <div key={index} className="product-item">
                  <Row gutter={16} align="middle">
                    <Col xs={24} sm={6} md={4}>
                      <Image
                        src={item.productImage || 'https://via.placeholder.com/80'}
                        alt={item.productName}
                        width={80}
                        height={80}
                        preview={false}
                        fallback="https://via.placeholder.com/80?text=No+Image"
                      />
                    </Col>
                    <Col xs={24} sm={10} md={12}>
                      <Text strong>{item.productName}</Text>
                    </Col>
                    <Col xs={12} sm={4}>
                      <Text type="secondary">SL: {item.quantity}</Text>
                    </Col>
                    <Col xs={12} sm={4} className="text-right">
                      <Text strong>{formatPrice(item.price * item.quantity)} đ</Text>
                    </Col>
                  </Row>
                  {index < order.items.length - 1 && <Divider />}
                </div>
              ))}

              <Divider />

              <Row justify="end">
                <Col span={16}>
                  <Row justify="space-between">
                    <Col span={12}><Text>Tổng tiền sản phẩm:</Text></Col>
                    <Col span={12} className="text-right">
                      <Text>{formatPrice(order.totalPrice)} đ</Text>
                    </Col>
                  </Row>
                  {/* Optional shipping fee, payment fee display here */}
                  <Row justify="space-between">
                    <Col span={12}><Text strong>Tổng thanh toán:</Text></Col>
                    <Col span={12} className="text-right">
                      <Text strong style={{ fontSize: '18px', color: '#f5222d' }}>
                        {formatPrice(order.totalPrice)} đ
                      </Text>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card>

            <Card title="Lịch sử đơn hàng" className="timeline-card">
              <Timeline mode="left">
                {timelineData.map((event, index) => (
                  <Timeline.Item
                    key={index}
                    dot={getStatusIcon(event.status)}
                    label={new Date(event.time).toLocaleString('vi-VN')}
                  >
                    <Text strong>{event.title}</Text>
                    {event.description && <div><Text type="secondary">{event.description}</Text></div>}
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="Thông tin đơn hàng" className="order-info-card">
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Mã đơn hàng">{order.orderNumber}</Descriptions.Item>
                <Descriptions.Item label="Ngày đặt">
                  {new Date(order.createdAt).toLocaleString('vi-VN')}
                </Descriptions.Item>
                <Descriptions.Item label="Phương thức thanh toán">
                  {order.paymentMethodName || "Thanh toán khi nhận hàng (COD)"}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái thanh toán">
                  <Tag color={getPaymentStatusTagColor(order.paymentStatus)}>
                    {order.paymentStatusText}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>

              {/* Payment instructions if applicable */}
              {order.paymentMethod === 'bank_transfer' && order.paymentStatus === 'awaiting_payment' && (
                <div className="payment-instructions">
                  <Divider>Thông tin thanh toán</Divider>
                  <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="Ngân hàng">BIDV</Descriptions.Item>
                    <Descriptions.Item label="Số tài khoản">123456789</Descriptions.Item>
                    <Descriptions.Item label="Tên tài khoản">CÔNG TY ABC</Descriptions.Item>
                    <Descriptions.Item label="Số tiền">{formatPrice(order.totalPrice)} đ</Descriptions.Item>
                    <Descriptions.Item label="Nội dung chuyển khoản">
                      Thanh toan {order.paymentReference || order.orderNumber}
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              )}
            </Card>

            <Card title="Thông tin giao hàng" className="shipping-info-card">
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Người nhận">{order.shippingInfo.name}</Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">{order.shippingInfo.phone}</Descriptions.Item>
                <Descriptions.Item label="Email">{order.shippingInfo.email}</Descriptions.Item>
                <Descriptions.Item label="Địa chỉ">{order.shippingInfo.address}</Descriptions.Item>
                {order.shippingInfo.note && (
                  <Descriptions.Item label="Ghi chú">{order.shippingInfo.note}</Descriptions.Item>
                )}
              </Descriptions>

              {/* Shipping tracking info if available */}
              {order.trackingNumber && (
                <div className="tracking-info">
                  <Divider>Thông tin vận chuyển</Divider>
                  <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="Đơn vị vận chuyển">
                      {order.deliveryCompany || "Đơn vị vận chuyển"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Mã vận đơn">
                      {order.trackingNumber}
                    </Descriptions.Item>
                    {order.estimatedDelivery && (
                      <Descriptions.Item label="Dự kiến giao hàng">
                        {new Date(order.estimatedDelivery).toLocaleDateString('vi-VN')}
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </div>
              )}
            </Card>

            {/* Action buttons */}
            <div className="order-actions">
              {order.canBeCancelled && (
                <Button
                  danger
                  type="primary"
                  block
                  onClick={showCancelConfirm}
                  className="cancel-button"
                >
                  Hủy đơn hàng
                </Button>
              )}

              {renderNextActionButton()}

              <Button
                type="default"
                block
                onClick={() => navigate('/orders')}
                className="back-button"
              >
                Quay lại danh sách đơn hàng
              </Button>
            </div>
          </Col>
        </Row>

        {/* Cancel Order Modal */}
        {renderCancelOrderModal()}

        {/* Payment Confirmation Modal */}
        <Modal
          title="Xác nhận thanh toán đơn hàng"
          open={paymentConfirmModalVisible}
          onOk={handlePaymentConfirmation}
          onCancel={() => setPaymentConfirmModalVisible(false)}
          okText="Xác nhận"
          cancelText="Đóng"
        >
          <p>Vui lòng nhập thông tin thanh toán:</p>
          <Form form={form} layout="vertical">
            <Form.Item
              name="transactionDate"
              label="Ngày thanh toán"
              rules={[{ required: true, message: 'Vui lòng chọn ngày thanh toán' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
              />
            </Form.Item>
            <Form.Item
              name="transactionRef"
              label="Mã giao dịch"
              rules={[{ required: true, message: 'Vui lòng nhập mã giao dịch' }]}
            >
              <Input
                placeholder="Nhập mã giao dịch/số tham chiếu"
              />
            </Form.Item>
            <Form.Item
              name="bankName"
              label="Ngân hàng"
            >
              <Input
                placeholder="Nhập tên ngân hàng chuyển tiền"
              />
            </Form.Item>
            <Form.Item
              name="note"
              label="Ghi chú"
            >
              <TextArea
                rows={3}
                placeholder="Nhập ghi chú thanh toán (nếu có)"
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </ClientLayout>
  );
};

export default OrderDetailView;