// src/views/client/Order/UserOrdersPage.js
import React, { useState, useEffect } from 'react';
import { Table, Spin, Typography, message, Tag, Space, Button, Modal, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ExclamationCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import ClientLayout from '../../../components/layout/Client/ClientLayout';
import orderService from '../../../services/client/orderService';
import { useAuth } from '../../../context/AuthContext';

const { Title } = Typography;
const { TextArea } = Input;
const { confirm } = Modal;

const UserOrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('Khách hàng hủy đơn');
  const navigate = useNavigate();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await orderService.getUserOrders();
      console.log('Full response:', response);

      // Kiểm tra và xử lý các cấu trúc response khác nhau
      const ordersData = response.orders ||
        response.data?.orders ||
        response.data ||
        [];

      console.log('Parsed orders:', ordersData);
      setOrders(ordersData);
    } catch (error) {
      message.error(`Lỗi khi tải đơn hàng: ${error.message}`);
      console.error('Detailed error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      navigate('/auth/login');
    }
  }, [user, navigate]);

  // Render trạng thái đơn hàng với màu sắc
  const renderOrderStatus = (status) => {
    let color;
    let text;

    switch (status) {
      case 'pending':
        color = 'gold';
        text = 'Chờ xác nhận';
        break;
      case 'processing':
        color = 'blue';
        text = 'Đang xử lý';
        break;
      case 'shipped':
        color = 'cyan';
        text = 'Đang giao hàng';
        break;
      case 'delivered':
        color = 'green';
        text = 'Đã giao hàng';
        break;
      case 'cancelled':
        color = 'red';
        text = 'Đã hủy';
        break;
      default:
        color = 'default';
        text = status;
    }

    return <Tag color={color}>{text}</Tag>;
  };

  // Mở modal xác nhận hủy
  const showCancelModal = (orderId) => {
    setCancellingOrderId(orderId);
    setCancelModalVisible(true);
  };

  // Xử lý hủy đơn hàng
  const handleCancelOrder = async () => {
    if (!cancellingOrderId) return;

    setCancelling(true);
    try {
      await orderService.cancelOrder(cancellingOrderId, cancelReason);
      message.success('Đã hủy đơn hàng thành công');
      fetchOrders(); // Tải lại danh sách đơn hàng
      setCancelModalVisible(false);
      setCancellingOrderId(null);
      setCancelReason('Khách hàng hủy đơn');
    } catch (error) {
      message.error('Không thể hủy đơn hàng');
      console.error('Error cancelling order:', error);
    } finally {
      setCancelling(false);
    }
  };

  // Render nút hành động
  const renderActions = (record) => {
    return (
      <Space>
        <Button
          type="primary"
          size="small"
          className="view-detail-btn"
          onClick={() => navigate(`/orders/${record._id}`)}
        >
          Xem chi tiết
        </Button>

        {/* Chỉ hiển thị nút Hủy đơn hàng nếu đơn hàng đang ở trạng thái chờ xử lý */}
        {(record.status === 'pending' || record.status === 'processing') && (
          <Button
            danger
            size="small"
            className="cancel-order-btn"
            onClick={() => showCancelModal(record._id)}
          >
            Hủy đơn
          </Button>
        )}
      </Space>
    );
  };

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: '_id',
      key: 'orderId',
      render: (text) => <a onClick={() => navigate(`/orders/${text}`)}>{text.slice(-8).toUpperCase()}</a>,
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price) => `${price.toLocaleString()} VNĐ`,
      align: 'right',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: renderOrderStatus,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: renderActions,
    },
  ];

  return (
    <ClientLayout>
      <div className="user-orders-page">
        <div className="page-header">
          <Title level={2}>Đơn hàng của tôi</Title>
          <Button type="primary" className="shop-more-btn" onClick={() => navigate('/products')}>
            Tiếp tục mua sắm
          </Button>
        </div>

        {loading ? (
          <div className="loading-container">
            <Spin size="large" tip="Đang tải đơn hàng..." />
          </div>
        ) : orders && orders.length > 0 ? (
          <Table
            dataSource={orders}
            columns={columns}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
            className="orders-table"
          />
        ) : (
          <div className="empty-orders">
            <p>Bạn chưa có đơn hàng nào.</p>
            <Button type="primary" className="shop-now-btn" onClick={() => navigate('/products')}>
              Mua sắm ngay
            </Button>
          </div>
        )}

        {/* Modal xác nhận hủy đơn hàng */}
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
          <div>
            <p>Bạn có chắc chắn muốn hủy đơn hàng này không?</p>
            <p>Lưu ý: Hành động này không thể hoàn tác.</p>
            <div style={{ marginTop: 16 }}>
              <TextArea
                placeholder="Lý do hủy đơn (không bắt buộc)"
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                disabled={cancelling}
              />
            </div>
            {cancelling && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
                <p style={{ marginTop: 8 }}>Đang xử lý yêu cầu hủy đơn hàng...</p>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </ClientLayout>
  );
};

export default UserOrdersPage;