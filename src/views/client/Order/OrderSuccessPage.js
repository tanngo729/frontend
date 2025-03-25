// src/views/client/Order/OrderSuccessPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Result,
  Button,
  Typography,
  Card,
  Descriptions,
  Spin,
  message,
  Steps,
  Divider,
  Alert,
  Modal,
  Form,
  Input,
  Upload,
  Space,
  Tag
} from 'antd';
import {
  CheckCircleOutlined,
  HomeOutlined,
  UploadOutlined,
  CopyOutlined,
  ShoppingOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  CarOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import ClientLayout from '../../../components/layout/Client/ClientLayout';
import orderService from '../../../services/client/orderService';
import checkoutServices from '../../../services/client/checkout';
import vnPayService from '../../../services/client/vnPayService';
import '../../../styles/client/order/OrderSuccessPage.scss';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { TextArea } = Input;

// Các trạng thái đơn hàng
const ORDER_STATUS = {
  'pending': {
    title: 'Chờ xác nhận',
    icon: <ClockCircleOutlined />,
    color: 'blue',
    description: 'Đơn hàng đang chờ xác nhận'
  },
  'processing': {
    title: 'Đang xử lý',
    icon: <SyncOutlined spin />,
    color: 'orange',
    description: 'Đơn hàng đang được chuẩn bị'
  },
  'shipped': {
    title: 'Đang giao hàng',
    icon: <CarOutlined />,
    color: 'cyan',
    description: 'Đơn hàng đang được vận chuyển'
  },
  'delivered': {
    title: 'Đã giao hàng',
    icon: <CheckCircleOutlined />,
    color: 'green',
    description: 'Đơn hàng đã được giao thành công'
  },
  'cancelled': {
    title: 'Đã hủy',
    icon: <ExclamationCircleOutlined />,
    color: 'red',
    description: 'Đơn hàng đã bị hủy'
  },
  'completed': {
    title: 'Hoàn thành',
    icon: <CheckCircleOutlined />,
    color: 'green',
    description: 'Đơn hàng đã hoàn thành'
  }
};

// Các trạng thái thanh toán
const PAYMENT_STATUS = {
  'pending': { title: 'Chờ thanh toán', color: 'orange' },
  'awaiting_payment': { title: 'Đang chờ thanh toán', color: 'orange' },
  'awaiting_verification': { title: 'Đang xác minh thanh toán', color: 'blue' },
  'paid': { title: 'Đã thanh toán', color: 'green' },
  'refunded': { title: 'Đã hoàn tiền', color: 'green' },
  'failed': { title: 'Thanh toán thất bại', color: 'red' },
  'cancelled': { title: 'Đã hủy thanh toán', color: 'red' }
};

// Hàm chuyển đổi trạng thái đơn hàng sang step index
const getStepIndex = (status) => {
  const statusMap = {
    'pending': 0,
    'processing': 1,
    'shipped': 2,
    'delivered': 3,
    'completed': 4,
    'cancelled': -1,
  };
  return status ? statusMap[status] || 0 : 0;
};

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // Thêm useLocation để đọc query params từ URL callback VNPay

  const [order, setOrder] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmReceiptFile, setConfirmReceiptFile] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [paymentConfirmForm] = Form.useForm();

  // Thêm state để theo dõi trạng thái thanh toán VNPay
  const [vnpayResult, setVnpayResult] = useState({
    success: false,
    processed: false,
    message: ''
  });

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);

        // Kiểm tra xem đây có phải là callback từ VNPay không
        const searchParams = new URLSearchParams(location.search);
        const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
        const vnp_TransactionStatus = searchParams.get('vnp_TransactionStatus');
        const source = searchParams.get('source'); // Kiểm tra source=vnpay
        const payment_failed = searchParams.get('payment_failed');

        // Xử lý kết quả thanh toán VNPay
        if ((vnp_ResponseCode || payment_failed) && (source === 'vnpay' || payment_failed)) {
          const isPaymentSuccess = vnp_ResponseCode === '00' && vnp_TransactionStatus === '00' && !payment_failed;

          // Cập nhật UI
          setVnpayResult({
            success: isPaymentSuccess,
            processed: true,
            message: payment_failed ? 'Không thể kết nối đến cổng thanh toán VNPay' :
              isPaymentSuccess ?
                'Thanh toán thành công qua VNPay' :
                'Thanh toán thất bại: ' + (vnp_ResponseCode === '24' ? 'Hết thời gian thanh toán' : 'Lỗi giao dịch')
          });

          // Hiển thị thông báo
          if (isPaymentSuccess) {
            message.success('Thanh toán thành công!');

            // Xóa dữ liệu pending
            localStorage.removeItem('pendingVnPayOrder');
            localStorage.removeItem('pendingCheckout');
            localStorage.removeItem('paymentFailed');
          } else {
            if (payment_failed) {
              message.error('Không thể kết nối đến cổng thanh toán VNPay');
            } else {
              message.error('Thanh toán không thành công: ' +
                (vnp_ResponseCode === '24' ? 'Hết thời gian thanh toán' : 'Giao dịch bị từ chối'));
            }
          }
        }

        // Tiếp tục tải thông tin đơn hàng
        const orderData = await orderService.getOrderById(orderId);
        setOrder(orderData);

        // Lấy thông tin chi tiết về trạng thái đơn hàng và timeline
        try {
          const statusData = await orderService.getOrderStatus(orderId);
          setOrderStatus(statusData);
        } catch (err) {
          console.error('Error fetching order status:', err);
        }

        // Lấy thông tin thanh toán nếu cần
        if (
          orderData &&
          (orderData.paymentMethod === 'bank_transfer') &&
          (orderData.paymentStatus === 'awaiting_payment' || orderData.paymentStatus === 'pending')
        ) {
          try {
            const paymentStatus = await checkoutServices.checkPaymentStatus(orderId);
            if (paymentStatus && paymentStatus.paymentReference) {
              setPaymentInfo({
                bankAccount: {
                  bankName: paymentStatus.bankInfo?.bankName || 'Vui lòng liên hệ hỗ trợ',
                  accountNumber: paymentStatus.bankInfo?.accountNumber || 'Vui lòng liên hệ hỗ trợ',
                  accountName: paymentStatus.bankInfo?.accountName || 'Vui lòng liên hệ hỗ trợ',
                  branch: paymentStatus.bankInfo?.branch || ''
                },
                transferCode: paymentStatus.paymentReference,
                amount: orderData.totalPrice
              });
            }
          } catch (error) {
            console.error('Error fetching payment status:', error);
          }
        }
      } catch (error) {
        message.error('Không thể tải thông tin đơn hàng');
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId, location.search]);

  // Định dạng thời gian từ timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Chuyển đổi trạng thái đơn hàng
  const getStatusText = (status) => {
    return ORDER_STATUS[status]?.title || status || 'Không xác định';
  };

  // Chuyển đổi phương thức thanh toán
  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'cod':
        return 'Thanh toán khi nhận hàng (COD)';
      case 'bank_transfer':
        return 'Chuyển khoản ngân hàng';
      case 'momo':
        return 'Ví điện tử MoMo';
      case 'vnpay':
        return 'VNPay';
      case 'zalopay':
        return 'ZaloPay';
      default:
        return method;
    }
  };

  // Copy text to clipboard helper
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        message.success('Đã sao chép');
      },
      () => {
        message.error('Không thể sao chép');
      }
    );
  };

  // Upload file handler
  const handleFileChange = (info) => {
    if (info.file.status === 'done') {
      setConfirmReceiptFile(info.file.originFileObj);
      message.success(`${info.file.name} tải lên thành công`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} tải lên thất bại.`);
    }
  };

  // Xử lý xác nhận thanh toán
  const handlePaymentConfirmation = async () => {
    try {
      const values = await paymentConfirmForm.validateFields();
      setConfirmLoading(true);

      const formData = new FormData();
      if (confirmReceiptFile) {
        formData.append('receiptImage', confirmReceiptFile);
      }
      formData.append('confirmationNote', values.confirmationNote || '');

      await checkoutServices.confirmPayment(orderId, formData);

      message.success('Xác nhận thanh toán thành công');
      setConfirmModalVisible(false);

      // Tải lại thông tin đơn hàng để cập nhật UI
      const updatedOrder = await orderService.getOrderById(orderId);
      setOrder(updatedOrder);

    } catch (error) {
      console.error('Payment confirmation error:', error);
      message.error('Không thể xác nhận thanh toán. Vui lòng thử lại sau.');
    } finally {
      setConfirmLoading(false);
    }
  };

  // Xử lý hủy đơn hàng
  const handleCancelOrder = async () => {
    Modal.confirm({
      title: 'Bạn có chắc chắn muốn hủy đơn hàng này?',
      content: 'Hành động này không thể khôi phục.',
      okText: 'Đồng ý',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await orderService.cancelOrder(orderId, 'Khách hàng hủy đơn');
          message.success('Đơn hàng đã được hủy thành công');
          // Tải lại thông tin đơn hàng
          const updatedOrder = await orderService.getOrderById(orderId);
          setOrder(updatedOrder);
        } catch (error) {
          console.error('Error cancelling order:', error);
          message.error('Không thể hủy đơn hàng. Vui lòng thử lại sau.');
        }
      },
    });
  };

  // Render tiến trình đơn hàng
  const renderOrderProgress = () => {
    if (!order) return null;

    // Nếu đơn hàng đã hủy, hiển thị thông báo
    if (order.status === 'cancelled') {
      return (
        <Card className="order-progress-card">
          <Result
            status="error"
            title="Đơn hàng đã bị hủy"
            subTitle={`Đơn hàng của bạn đã bị hủy vào ${formatDate(order.updatedAt)}`}
          />
        </Card>
      );
    }

    // Xác định trạng thái hiện tại
    const currentStep = getStepIndex(order.status);

    return (
      <Card className="order-progress-card">
        <Steps current={currentStep} status={order.status === 'cancelled' ? 'error' : 'process'}>
          <Step
            title="Chờ xác nhận"
            icon={ORDER_STATUS.pending.icon}
            description="Đơn hàng đã được tạo"
          />
          <Step
            title="Đang xử lý"
            icon={order.status === 'processing' ? ORDER_STATUS.processing.icon : <SyncOutlined />}
            description="Đơn hàng đang được chuẩn bị"
          />
          <Step
            title="Đang giao hàng"
            icon={ORDER_STATUS.shipped.icon}
            description="Đơn hàng đang được vận chuyển"
          />
          <Step
            title="Đã giao hàng"
            icon={ORDER_STATUS.delivered.icon}
            description="Đơn hàng đã được giao thành công"
          />
        </Steps>
      </Card>
    );
  };

  // Render thông tin thanh toán
  const renderPaymentInfo = () => {
    if (!order) return null;

    // Hiển thị thông báo kết quả thanh toán VNPay nếu có
    if (order.paymentMethod === 'vnpay' && vnpayResult.processed) {
      return (
        <Card title="Thông tin thanh toán" className="payment-info-card">
          <div className="payment-status">
            <Text strong>Trạng thái thanh toán: </Text>
            <Tag color={vnpayResult.success ? 'green' : 'red'}>
              {vnpayResult.success ? 'Đã thanh toán' : 'Thanh toán thất bại'}
            </Tag>
          </div>

          <Alert
            message={vnpayResult.success ? "Thanh toán thành công" : "Thanh toán thất bại"}
            description={vnpayResult.message}
            type={vnpayResult.success ? "success" : "error"}
            showIcon
            style={{ marginTop: '16px' }}
          />
        </Card>
      );
    }

    // Hiển thị thông tin chuyển khoản ngân hàng
    if (order.paymentMethod === 'bank_transfer' && paymentInfo) {
      const needsConfirmation =
        order.paymentMethod === 'bank_transfer' &&
        (order.paymentStatus === 'awaiting_payment' || order.paymentStatus === 'pending');

      return (
        <Card title="Thông tin thanh toán" className="payment-info-card">
          <div className="payment-status">
            <Text strong>Trạng thái thanh toán: </Text>
            <Tag color={PAYMENT_STATUS[order.paymentStatus]?.color || 'default'}>
              {PAYMENT_STATUS[order.paymentStatus]?.title || order.paymentStatus}
            </Tag>
          </div>

          <div className="bank-info">
            <Divider />
            <Title level={5}>Thông tin chuyển khoản</Title>

            <Paragraph>
              <Text strong>Ngân hàng:</Text> {paymentInfo.bankAccount.bankName}
            </Paragraph>

            <Paragraph>
              <Text strong>Số tài khoản:</Text>{' '}
              <Text copyable>{paymentInfo.bankAccount.accountNumber}</Text>
            </Paragraph>

            <Paragraph>
              <Text strong>Chủ tài khoản:</Text> {paymentInfo.bankAccount.accountName}
            </Paragraph>

            {paymentInfo.bankAccount.branch && (
              <Paragraph>
                <Text strong>Chi nhánh:</Text> {paymentInfo.bankAccount.branch}
              </Paragraph>
            )}

            <Paragraph>
              <Text strong>Số tiền:</Text> {paymentInfo.amount.toLocaleString()} VNĐ
            </Paragraph>

            <Paragraph>
              <Text strong>Mã thanh toán:</Text>{' '}
              <Text copyable>{paymentInfo.transferCode}</Text>
            </Paragraph>

            <Paragraph>
              <Text strong>Nội dung chuyển khoản:</Text>{' '}
              <Text copyable>{`Thanh toan ${paymentInfo.transferCode}`}</Text>
              <Button
                size="small"
                type="text"
                icon={<CopyOutlined />}
                onClick={() => copyToClipboard(`Thanh toan ${paymentInfo.transferCode}`)}
              />
            </Paragraph>

            <Alert
              message="Quan trọng"
              description="Vui lòng ghi đúng nội dung chuyển khoản để đơn hàng được xử lý nhanh chóng."
              type="warning"
              showIcon
              style={{ marginBottom: '16px' }}
            />

            {needsConfirmation && (
              <Button
                type="primary"
                onClick={() => setConfirmModalVisible(true)}
              >
                Xác nhận đã thanh toán
              </Button>
            )}
          </div>
        </Card>
      );
    }

    // Hiển thị thông tin thanh toán thông thường
    return (
      <Card title="Thông tin thanh toán" className="payment-info-card">
        <div className="payment-status">
          <Text strong>Phương thức thanh toán: </Text>
          <Text>{getPaymentMethodText(order.paymentMethod)}</Text>
        </div>
        <div className="payment-status" style={{ marginTop: '8px' }}>
          <Text strong>Trạng thái thanh toán: </Text>
          <Tag color={PAYMENT_STATUS[order.paymentStatus]?.color || 'default'}>
            {PAYMENT_STATUS[order.paymentStatus]?.title || order.paymentStatus}
          </Tag>
        </div>
      </Card>
    );
  };

  // Render modal xác nhận thanh toán
  const renderConfirmPaymentModal = () => {
    // Custom upload button
    const uploadButton = (
      <div>
        <UploadOutlined />
        <div style={{ marginTop: 8 }}>Tải biên lai</div>
      </div>
    );

    return (
      <Modal
        title="Xác nhận đã thanh toán"
        open={confirmModalVisible}
        onCancel={() => setConfirmModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setConfirmModalVisible(false)}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={confirmLoading}
            onClick={handlePaymentConfirmation}
          >
            Xác nhận
          </Button>,
        ]}
      >
        <Form
          form={paymentConfirmForm}
          layout="vertical"
        >
          <Form.Item
            name="receiptImage"
            label="Biên lai chuyển khoản"
            valuePropName="fileList"
          >
            <Upload
              name="receiptImage"
              listType="picture-card"
              className="receipt-uploader"
              showUploadList={true}
              beforeUpload={(file) => {
                const isImage = file.type.startsWith('image/');
                if (!isImage) {
                  message.error('Bạn chỉ có thể tải lên file hình ảnh!');
                }
                const isLt2M = file.size / 1024 / 1024 < 2;
                if (!isLt2M) {
                  message.error('Kích thước file không được vượt quá 2MB!');
                }
                return false;
              }}
              onChange={handleFileChange}
              maxCount={1}
            >
              {uploadButton}
            </Upload>
          </Form.Item>
          <Form.Item
            name="confirmationNote"
            label="Ghi chú"
          >
            <TextArea
              rows={4}
              placeholder="Thông tin bổ sung về thanh toán của bạn (nếu có)"
            />
          </Form.Item>
        </Form>
      </Modal>
    );
  };

  // Render danh sách sản phẩm mua
  const renderOrderItems = () => {
    if (!order || !order.items || order.items.length === 0) {
      return <p>Không có sản phẩm</p>;
    }

    return (
      <table className="order-items-table">
        <thead>
          <tr>
            <th>Sản phẩm</th>
            <th>Số lượng</th>
            <th>Đơn giá</th>
            <th>Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, index) => (
            <tr key={index}>
              <td>{item.productName || `Sản phẩm #${item.productId}`}</td>
              <td>{item.quantity}</td>
              <td>{item.price.toLocaleString()} VNĐ</td>
              <td>{(item.price * item.quantity).toLocaleString()} VNĐ</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="3" className="total-label">Tổng cộng</td>
            <td className="total-value">{order.totalPrice.toLocaleString()} VNĐ</td>
          </tr>
        </tfoot>
      </table>
    );
  };

  // Render action buttons
  const renderActionButtons = () => {
    const canBeCancelled =
      order &&
      (order.status === 'pending' || order.status === 'processing') &&
      order.status !== 'cancelled';

    return (
      <div className="order-actions">
        <Space>
          <Button
            type="primary"
            onClick={() => navigate('/orders')}
          >
            Xem tất cả đơn hàng
          </Button>

          <Button
            onClick={() => navigate('/products')}
          >
            Tiếp tục mua sắm
          </Button>

          {canBeCancelled && (
            <Button
              danger
              onClick={handleCancelOrder}
            >
              Hủy đơn hàng
            </Button>
          )}
        </Space>
      </div>
    );
  };

  // Render timeline lịch sử đơn hàng
  const renderOrderTimeline = () => {
    if (!orderStatus || !orderStatus.timeline || orderStatus.timeline.length === 0) {
      return null;
    }

    return (
      <Card title="Lịch sử đơn hàng" className="order-timeline-card">
        <Steps direction="vertical" size="small" current={orderStatus.timeline.length - 1}>
          {orderStatus.timeline.map((event, index) => (
            <Step
              key={index}
              title={event.title}
              description={
                <div>
                  <p>{event.description}</p>
                  <p className="event-time">{formatDate(event.time)}</p>
                </div>
              }
              status={event.status}
              icon={<span className={`status-icon ${event.status}`}>{index + 1}</span>}
            />
          ))}
        </Steps>
      </Card>
    );
  };

  // Thêm component để hiển thị thông báo kết quả thanh toán VNPay
  const renderVnPayAlert = () => {
    if (!vnpayResult.processed) return null;

    return (
      <Alert
        message={vnpayResult.success ? "Thanh toán thành công qua VNPay" : "Thanh toán VNPay thất bại"}
        description={vnpayResult.message}
        type={vnpayResult.success ? "success" : "error"}
        showIcon
        style={{ marginBottom: 16 }}
        banner
      />
    );
  };

  return (
    <ClientLayout>
      <div className="order-success-page">
        {/* Hiển thị thông báo VNPay nếu có */}
        {vnpayResult.processed && renderVnPayAlert()}

        {loading ? (
          <div className="order-success-page__loading">
            <Spin size="large" tip="Đang tải thông tin đơn hàng..." />
          </div>
        ) : !order ? (
          <Result
            status="error"
            title="Không tìm thấy đơn hàng"
            subTitle="Đơn hàng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."
            extra={[
              <Button
                type="primary"
                key="home"
                icon={<HomeOutlined />}
                onClick={() => navigate('/')}
              >
                Về trang chủ
              </Button>,
            ]}
          />
        ) : (
          <>
            <div className="order-header">
              <Title level={2}>Chi tiết đơn hàng #{order._id.slice(-6).toUpperCase()}</Title>
              {renderActionButtons()}
            </div>

            {/* Hiển thị tiến trình đơn hàng */}
            {renderOrderProgress()}

            <div className="order-content">
              <div className="order-main">
                <Card title="Thông tin đơn hàng" className="order-info-card">
                  <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
                    <Descriptions.Item label="Mã đơn hàng">#{order._id.slice(-6).toUpperCase()}</Descriptions.Item>
                    <Descriptions.Item label="Ngày đặt">{formatDate(order.createdAt)}</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                      <Tag color={ORDER_STATUS[order.status]?.color || 'blue'}>
                        {ORDER_STATUS[order.status]?.title || order.status}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Phương thức thanh toán">
                      {getPaymentMethodText(order.paymentMethod)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái thanh toán">
                      <Tag color={PAYMENT_STATUS[order.paymentStatus]?.color || 'default'}>
                        {PAYMENT_STATUS[order.paymentStatus]?.title || order.paymentStatus}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Tổng tiền">
                      <Text strong>{order.totalPrice.toLocaleString()} VNĐ</Text>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>

                {/* Hiển thị thông tin thanh toán */}
                {renderPaymentInfo()}

                <Card title="Sản phẩm đã đặt" className="order-items-card">
                  {renderOrderItems()}
                </Card>
              </div>

              <div className="order-sidebar">
                <Card title="Địa chỉ giao hàng" className="shipping-info-card">
                  <Text strong>{order.shippingInfo.name}</Text>
                  <br />
                  <Text>{order.shippingInfo.address}</Text>
                  <br />
                  <Text>Điện thoại: {order.shippingInfo.phone}</Text>
                  <br />
                  <Text>Email: {order.shippingInfo.email}</Text>

                  {order.shippingInfo.note && (
                    <>
                      <Divider style={{ margin: '12px 0' }} />
                      <Text strong>Ghi chú: </Text>
                      <Text>{order.shippingInfo.note}</Text>
                    </>
                  )}
                </Card>

                {/* Hiển thị lịch sử đơn hàng nếu có */}
                {renderOrderTimeline()}

                {orderStatus && orderStatus.nextAction && (
                  <Alert
                    message="Bước tiếp theo"
                    description={orderStatus.nextAction.message}
                    type="info"
                    showIcon
                    style={{ marginTop: '16px' }}
                    action={
                      orderStatus.nextAction.action === 'confirm_payment' &&
                      <Button size="small" type="primary" onClick={() => setConfirmModalVisible(true)}>
                        Xác nhận thanh toán
                      </Button>
                    }
                  />
                )}
              </div>
            </div>

            {/* Modal xác nhận thanh toán */}
            {renderConfirmPaymentModal()}
          </>
        )}
      </div>
    </ClientLayout>
  );
};

export default OrderSuccessPage;