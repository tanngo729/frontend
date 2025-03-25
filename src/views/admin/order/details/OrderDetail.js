// src/views/admin/orders/OrderDetail.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Button, Space, Spin, message, Result
} from 'antd';
import {
  ArrowLeftOutlined, ReloadOutlined, PrinterOutlined, MailOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography } from 'antd';

import AdminLayout from '../../../../components/layout/admin/AdminLayout';
import OrderProgress from './OrderProgress';
import OrderInformation from './OrderInformation';
import OrderItems from './OrderItems';
import CustomerInfo from './CustomerInfo';
import ShippingInfo from './ShippingInfo';
import OrderHistory from './OrderHistory';
import orderService from '../../../../services/admin/orderService';
import { formatCurrency, formatDate } from '../../../../utils/formatters';
import { generatePrintContent } from '../../../../utils/orderPrintUtils';
import './OrderDetail.scss';

const { Title } = Typography;

/**
 * Order Detail component for viewing and managing a specific order
 */
const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State for order data
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [idValid, setIdValid] = useState(true);

  // State for form controls
  const [newStatus, setNewStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Validate order ID format
  useEffect(() => {
    // Check if ID is a valid MongoDB ObjectID (24 hex characters)
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      setIdValid(false);
      setError('ID đơn hàng không hợp lệ. Vui lòng kiểm tra lại.');
      setLoading(false);
    } else {
      setIdValid(true);
    }
  }, [id]);

  // Fetch order details
  const fetchOrderDetails = useCallback(async () => {
    if (!idValid) return;

    setLoading(true);
    setError(null);

    try {
      const data = await orderService.getOrderById(id);

      if (!data) {
        setError('Không tìm thấy thông tin đơn hàng');
        return;
      }

      setOrder(data);

      // Only set status values if they exist in the data
      if (data.status) setNewStatus(data.status);
      if (data.paymentStatus) setNewPaymentStatus(data.paymentStatus);
    } catch (error) {
      console.error('Error fetching order details:', error);

      // Handle specific error types
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || 'Unknown error';

        if (status === 404) {
          setError('Không tìm thấy đơn hàng với ID này');
        } else if (status === 403) {
          setError('Bạn không có quyền xem đơn hàng này');
        } else if (status === 400) {
          setError(`Yêu cầu không hợp lệ: ${message}`);
        } else {
          setError(`Lỗi (${status}): ${message}`);
        }
      } else if (error.request) {
        setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn');
      } else {
        setError(`Lỗi: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [id, idValid]);

  // Refresh data
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrderDetails()
      .finally(() => {
        setRefreshing(false);
      });
  }, [fetchOrderDetails]);

  // Initialize data and setup socket listeners
  useEffect(() => {
    if (idValid) {
      fetchOrderDetails();

      // Socket updates
      const socket = window?.socket;
      if (socket) {
        const handleStatusUpdate = (data) => {
          if (data.orderId === id) {
            setOrder(prev => {
              if (!prev) return prev;
              return {
                ...prev,
                status: data.status,
                paymentStatus: data.paymentStatus,
                updatedAt: new Date().toISOString()
              };
            });
            if (data.status) setNewStatus(data.status);
            if (data.paymentStatus) setNewPaymentStatus(data.paymentStatus);
            message.info('Đơn hàng đã được cập nhật');
          }
        };

        socket.on('orderStatusUpdate', handleStatusUpdate);

        // Join room for this specific order to receive updates
        socket.emit('joinOrderRoom', id);

        return () => {
          socket.off('orderStatusUpdate', handleStatusUpdate);
          socket.emit('leaveOrderRoom', id);
        };
      }
    }
  }, [id, idValid, fetchOrderDetails]);

  // Update order status
  const handleUpdateStatus = useCallback(async () => {
    if (!order || newStatus === order.status) {
      message.info('Trạng thái không thay đổi');
      return;
    }

    setUpdateLoading(true);
    try {
      // Send only the status field to avoid conflicts
      const data = { status: newStatus };

      console.log('Updating status with data:', data);

      // First attempt
      try {
        await orderService.updateOrderStatus(id, data);
      } catch (error) {
        console.error('First attempt failed:', error);
        // No need for second attempt, the service handles that now
      }

      // Update local state
      setOrder(prev => {
        if (!prev) return null;
        return {
          ...prev,
          status: newStatus,
          updatedAt: new Date().toISOString()
        };
      });
      message.success('Cập nhật trạng thái đơn hàng thành công');
    } catch (error) {
      console.error('Error updating order status:', error);
      message.error(error.response?.data?.message || 'Không thể cập nhật trạng thái đơn hàng');
    } finally {
      setUpdateLoading(false);
    }
  }, [id, newStatus, order]);

  // Update payment status
  const handleUpdatePaymentStatus = useCallback(async () => {
    if (!order || newPaymentStatus === order.paymentStatus) {
      message.info('Trạng thái thanh toán không thay đổi');
      return;
    }

    setUpdateLoading(true);
    try {
      // Send only the paymentStatus field to avoid conflicts
      const data = { paymentStatus: newPaymentStatus };

      console.log('Updating payment status with data:', data);

      await orderService.updateOrderStatus(id, data);

      // Update local state
      setOrder(prev => {
        if (!prev) return null;
        return {
          ...prev,
          paymentStatus: newPaymentStatus,
          updatedAt: new Date().toISOString()
        };
      });
      message.success('Cập nhật trạng thái thanh toán thành công');
    } catch (error) {
      console.error('Error updating payment status:', error);
      message.error(error.response?.data?.message || 'Không thể cập nhật trạng thái thanh toán');
    } finally {
      setUpdateLoading(false);
    }
  }, [id, newPaymentStatus, order]);

  // Delete order
  const handleDeleteOrder = useCallback(() => {
    orderService.confirmDeleteOrder(id, () => {
      navigate('/admin/orders');
    });
  }, [id, navigate]);

  // Print order
  const handlePrintOrder = useCallback(() => {
    if (!order) return;
    const printContent = generatePrintContent(order, formatDate, formatCurrency);

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      message.error('Không thể mở cửa sổ in. Vui lòng kiểm tra cài đặt trình duyệt của bạn.');
      return;
    }

    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();

    // Automatically print after content is loaded
    printWindow.onload = function () {
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
  }, [order]);

  // Send email confirmation
  const handleSendEmail = useCallback(() => {
    message.info('Tính năng gửi email đang được phát triển');
  }, []);

  // Conditional rendering for loading state
  if (loading) {
    return (
      <AdminLayout>
        <div className="order-detail loading">
          <Spin size="large" tip="Đang tải thông tin đơn hàng..." />
        </div>
      </AdminLayout>
    );
  }

  // Conditional rendering for error state
  if (error) {
    return (
      <AdminLayout>
        <Result
          status="warning"
          title="Không thể hiển thị thông tin đơn hàng"
          subTitle={error}
          extra={
            <Space>
              <Button type="primary" onClick={() => navigate('/admin/orders')}>
                Quay lại danh sách
              </Button>
              {idValid && (
                <Button onClick={handleRefresh} icon={<ReloadOutlined />}>
                  Thử lại
                </Button>
              )}
            </Space>
          }
        />
      </AdminLayout>
    );
  }

  // Conditional rendering when order is not found
  if (!order) {
    return (
      <AdminLayout>
        <Result
          status="404"
          title="Không tìm thấy đơn hàng"
          subTitle="Đơn hàng không tồn tại hoặc đã bị xóa"
          extra={
            <Button type="primary" onClick={() => navigate('/admin/orders')}>
              Quay lại danh sách
            </Button>
          }
        />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="order-detail">
        {/* Loading overlay during updates */}
        {updateLoading && (
          <div className="update-loading">
            <Spin tip="Đang cập nhật..." size="large" />
          </div>
        )}

        {/* Header section */}
        <div className="page-header">
          <div>
            <Button
              type="default"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/admin/orders')}
              style={{ marginRight: '16px' }}
            >
              Quay lại danh sách
            </Button>
            <Title level={2} style={{ margin: 0, display: 'inline-block' }}>
              Chi tiết đơn hàng {order._id ? `#${order._id.slice(-6)}` : ''}
            </Title>
          </div>
          <Space>
            <Button
              icon={<PrinterOutlined />}
              onClick={handlePrintOrder}
            >
              In đơn hàng
            </Button>
            <Button
              icon={<MailOutlined />}
              onClick={handleSendEmail}
            >
              Gửi email
            </Button>
            <Button
              icon={<ReloadOutlined spin={refreshing} />}
              onClick={handleRefresh}
              loading={refreshing}
            >
              Làm mới
            </Button>
          </Space>
        </div>

        {/* Order status progress */}
        <Card className="status-card">
          <OrderProgress order={order} />
        </Card>

        <div className="order-content">
          <div className="order-main">
            {/* Order information and actions */}
            <OrderInformation
              order={order}
              newStatus={newStatus}
              setNewStatus={setNewStatus}
              newPaymentStatus={newPaymentStatus}
              setNewPaymentStatus={setNewPaymentStatus}
              onUpdateStatus={handleUpdateStatus}
              onUpdatePaymentStatus={handleUpdatePaymentStatus}
              onDeleteOrder={handleDeleteOrder}
              updateLoading={updateLoading}
            />

            {/* Order items list */}
            <OrderItems order={order} />
          </div>

          <div className="order-sidebar">
            {/* Customer information */}
            <CustomerInfo order={order} />

            {/* Shipping information */}
            <ShippingInfo order={order} />

            {/* Order timeline/history */}
            {order.history && order.history.length > 0 && (
              <OrderHistory history={order.history} />
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default OrderDetail;