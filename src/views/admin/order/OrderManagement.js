// src/views/admin/orders/OrderManagement.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Button, Table, Tag, Space, Modal, message, Badge, Typography, Select, Row, Col
} from 'antd';
import {
  EyeOutlined, DeleteOutlined, ExclamationCircleOutlined,
  ReloadOutlined, FilterOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import 'moment/locale/vi';

import AdminLayout from '../../../components/layout/admin/AdminLayout';
import OrderStats from './OrderStats';
import OrderFilters from './OrderFilters';
import OrderTable from './OrderTable';
import orderService from '../../../services/admin/orderService';
import './OrderManagement.scss';

const { confirm } = Modal;
const { Title } = Typography;

// Status configuration for display
const STATUS_CONFIG = {
  pending: { color: 'orange', label: 'Chờ xác nhận' },
  processing: { color: 'blue', label: 'Đang xử lý' },
  shipped: { color: 'cyan', label: 'Đang giao hàng' },
  delivered: { color: 'green', label: 'Đã giao hàng' },
  cancelled: { color: 'red', label: 'Đã hủy' }
};

// Payment status configuration for display
const PAYMENT_STATUS_CONFIG = {
  pending: { color: 'warning', label: 'Chờ thanh toán' },
  paid: { color: 'success', label: 'Đã thanh toán' },
  failed: { color: 'error', label: 'Thanh toán thất bại' }
};

/**
 * Order Management component for admin dashboard
 */
const OrderManagement = () => {
  const navigate = useNavigate();

  // State for orders data
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // State for pagination
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // State for filters
  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: '',
    search: '',
    dateRange: null,
  });

  // State for order statistics
  const [orderStats, setOrderStats] = useState({
    pending: 0,
    delivered: 0,
    totalRevenue: 0,
  });

  // State for tracking updating operations
  const [updatingIds, setUpdatingIds] = useState({
    status: new Set(),
    payment: new Set(),
    delete: new Set(),
  });

  // Format currency helper
  const formatCurrency = (amount) => {
    return amount?.toLocaleString('vi-VN') + 'đ';
  };

  /**
   * Fetch orders with filters and pagination
   */
  const fetchOrders = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        status: filters.status,
        paymentStatus: filters.paymentStatus,
        search: filters.search
      };

      // Thêm lọc theo ngày nếu có
      if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
        params.startDate = filters.dateRange[0].format('YYYY-MM-DD');
        params.endDate = filters.dateRange[1].format('YYYY-MM-DD');
      }

      // Gọi API và xử lý kết quả
      const result = await orderService.getAllOrders(params);

      console.log('API response for orders:', result);

      if (result && result.orders && Array.isArray(result.orders)) {
        setOrders(result.orders);

        // Cập nhật phân trang
        setPagination({
          current: result.pagination?.current || page,
          pageSize: result.pagination?.pageSize || limit,
          total: result.pagination?.total || 0
        });
      } else if (result && Array.isArray(result)) {
        // Handle case where API directly returns array
        setOrders(result);

        // Keep current pagination, just update the page/limit
        setPagination(prev => ({
          ...prev,
          current: page,
          pageSize: limit
        }));
      } else {
        console.error('Unexpected data structure:', result);
        setOrders([]);
        setPagination({
          current: page,
          pageSize: limit,
          total: 0
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      message.error('Không thể tải danh sách đơn hàng');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Fetch order statistics for dashboard
   */
  const fetchOrderStats = useCallback(async () => {
    try {
      const stats = await orderService.getOrderStats();
      console.log('Received processed stats from service:', stats);

      // The service now returns a consistent format with all required fields
      setOrderStats(stats);
    } catch (error) {
      console.error('Error fetching order stats:', error);
      message.error('Không thể tải thống kê đơn hàng');
      setOrderStats({
        total: 0,
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        completed: 0,
        totalRevenue: 0
      });
    }
  }, []);

  /**
   * Refresh data with loading indicator
   */
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([
      fetchOrders(pagination.current, pagination.pageSize),
      fetchOrderStats()
    ]).finally(() => {
      setRefreshing(false);
      message.success('Dữ liệu đã được cập nhật');
    });
  }, [fetchOrders, fetchOrderStats, pagination.current, pagination.pageSize]);

  // Initialize data on component mount
  useEffect(() => {
    Promise.all([fetchOrders(), fetchOrderStats()]);

    // Socket connection for real-time updates
    const socket = window.socket;
    if (socket) {
      const handleOrderUpdate = (data) => {
        // Update order in list if it exists
        setOrders(prev =>
          prev.map(order =>
            order._id === data.orderId
              ? { ...order, status: data.status, paymentStatus: data.paymentStatus }
              : order
          )
        );

        // Refresh stats if an order was updated
        fetchOrderStats();

        message.info(`Đơn hàng #${data.orderId.slice(-6)} đã được cập nhật`);
      };

      socket.on('orderStatusUpdate', handleOrderUpdate);
      return () => socket.off('orderStatusUpdate', handleOrderUpdate);
    }
  }, [fetchOrders, fetchOrderStats]);

  /**
   * Handle pagination change
   */
  const handleTableChange = (newPagination, filters, sorter) => {
    setPagination(prev => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize
    }));

    fetchOrders(newPagination.current, newPagination.pageSize);
  };

  /**
   * Handle filter changes
   */
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  /**
   * Apply current filters
   */
  const applyFilters = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchOrders(1, pagination.pageSize);
  };

  /**
   * Reset all filters to default
   */
  const resetFilters = () => {
    setFilters({
      status: '',
      paymentStatus: '',
      search: '',
      dateRange: null,
    });
    // Reset to first page and apply empty filters
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchOrders(1, pagination.pageSize);
  };

  /**
   * Navigate to order detail page
   */
  const handleViewOrder = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  /**
   * Update order status
   */
  const handleUpdateStatus = async (orderId, newStatus) => {
    // Kiểm tra ID hợp lệ
    if (!orderId || !orderId.match(/^[0-9a-fA-F]{24}$/)) {
      message.error('ID đơn hàng không hợp lệ');
      return;
    }

    // Kiểm tra trạng thái mới có hợp lệ không
    if (!newStatus) {
      message.error('Vui lòng chọn trạng thái');
      return;
    }

    // Tìm đơn hàng hiện tại từ danh sách để kiểm tra trạng thái cũ
    const currentOrder = orders.find(order => order._id === orderId);
    if (currentOrder && currentOrder.status === newStatus) {
      message.info('Trạng thái không thay đổi');
      return;
    }

    // Đánh dấu đơn hàng đang cập nhật
    setUpdatingIds(prev => ({
      ...prev,
      status: new Set([...prev.status, orderId]),
    }));

    try {
      // Gọi API cập nhật trạng thái
      await orderService.updateOrderStatus(orderId, newStatus);

      // Cập nhật danh sách đơn hàng sau khi API thành công
      setOrders(prev =>
        prev.map(order =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );

      // Cập nhật thống kê
      fetchOrderStats();

      message.success('Cập nhật trạng thái đơn hàng thành công');
    } catch (error) {
      console.error('Error updating order status:', error);
      message.error('Không thể cập nhật trạng thái đơn hàng');
    } finally {
      // Xóa đơn hàng khỏi danh sách đang cập nhật
      setUpdatingIds(prev => {
        const newSet = new Set([...prev.status]);
        newSet.delete(orderId);
        return { ...prev, status: newSet };
      });
    }
  };

  /**
   * Update payment status
   */
  const handleUpdatePaymentStatus = async (orderId, newPaymentStatus) => {
    setUpdatingIds(prev => ({
      ...prev,
      payment: new Set([...prev.payment, orderId]),
    }));

    try {
      await orderService.updateOrderStatus(orderId, { paymentStatus: newPaymentStatus });

      // Update order in list
      setOrders(prev =>
        prev.map(order =>
          order._id === orderId ? { ...order, paymentStatus: newPaymentStatus } : order
        )
      );

      message.success('Cập nhật trạng thái thanh toán thành công');
      fetchOrderStats();
    } catch (error) {
      console.error('Error updating payment status:', error);
      message.error('Không thể cập nhật trạng thái thanh toán');
    } finally {
      setUpdatingIds(prev => {
        const newSet = new Set([...prev.payment]);
        newSet.delete(orderId);
        return { ...prev, payment: newSet };
      });
    }
  };

  /**
   * Delete an order with confirmation
   */
  const handleDeleteOrder = (orderId) => {
    // Kiểm tra ID hợp lệ trước khi hiện hộp thoại xác nhận
    if (!orderId || !orderId.match(/^[0-9a-fA-F]{24}$/)) {
      message.error('ID đơn hàng không hợp lệ');
      return;
    }

    // Hiện hộp thoại xác nhận xóa
    confirm({
      title: 'Xác nhận xóa đơn hàng',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc chắn muốn xóa đơn hàng này không? Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        // Đánh dấu đơn hàng đang được xóa
        setUpdatingIds(prev => ({
          ...prev,
          delete: new Set([...prev.delete, orderId]),
        }));

        try {
          // Hiển thị thông báo đang xử lý
          message.loading({ content: 'Đang xóa đơn hàng...', key: 'deleteOrder', duration: 0 });

          // Gọi API xóa đơn hàng
          await orderService.deleteOrder(orderId);

          // Thông báo thành công
          message.success({ content: 'Xóa đơn hàng thành công', key: 'deleteOrder' });

          // Kiểm tra nếu cần chuyển trang
          const isLastItemOnPage = orders.length === 1 && pagination.current > 1;
          if (isLastItemOnPage) {
            fetchOrders(pagination.current - 1, pagination.pageSize);
          } else {
            // Xóa đơn hàng khỏi danh sách hiện tại
            setOrders(prev => prev.filter(order => order._id !== orderId));
            // Tải lại danh sách để đảm bảo dữ liệu đồng bộ
            fetchOrders(pagination.current, pagination.pageSize);
          }

          // Cập nhật thống kê
          fetchOrderStats();
        } catch (error) {
          console.error('Error deleting order:', error);
          // Thông báo lỗi đã được xử lý trong orderService
        } finally {
          // Xóa đơn hàng khỏi danh sách đang xóa
          setUpdatingIds(prev => {
            const newSet = new Set([...prev.delete]);
            newSet.delete(orderId);
            return { ...prev, delete: newSet };
          });
        }
      }
    });
  };

  // Table columns configuration
  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: '_id',
      key: '_id',
      render: id => <span>#{id.slice(-6)}</span>,
      width: 120
    },
    {
      title: 'Khách hàng',
      dataIndex: 'userDetails',
      key: 'customer',
      render: user => (
        <div>
          <div>{user?.fullName || 'N/A'}</div>
          <div style={{ color: 'gray', fontSize: '12px' }}>{user?.email || 'N/A'}</div>
        </div>
      ),
      width: 200
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: price => <span>{formatCurrency(price)}</span>,
      sorter: (a, b) => a.totalPrice - b.totalPrice,
      width: 150
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: date => moment(date).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => moment(a.createdAt).unix() - moment(b.createdAt).unix(),
      width: 150
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Tag color={STATUS_CONFIG[status]?.color || 'default'}>
          {STATUS_CONFIG[status]?.label || status || 'N/A'}
        </Tag>
      ),
      width: 130,
      filters: Object.entries(STATUS_CONFIG).map(([key, { label }]) => ({
        text: label,
        value: key
      })),
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Thanh toán',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: status => (
        <Badge
          status={PAYMENT_STATUS_CONFIG[status]?.color || 'default'}
          text={PAYMENT_STATUS_CONFIG[status]?.label || status || 'N/A'}
        />
      ),
      width: 130,
      filters: Object.entries(PAYMENT_STATUS_CONFIG).map(([key, { label }]) => ({
        text: label,
        value: key
      })),
      onFilter: (value, record) => record.paymentStatus === value
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewOrder(record._id)}
            title="Xem chi tiết"
          />

          {/* Status update dropdown */}
          <Select
            value={record.status || 'pending'}
            style={{ width: 140 }}
            size="small"
            loading={updatingIds.status.has(record._id)}
            onChange={value => handleUpdateStatus(record._id, value)}
          >
            {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
              <Select.Option key={key} value={key}>{label}</Select.Option>
            ))}
          </Select>

          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            loading={updatingIds.delete.has(record._id)}
            onClick={() => handleDeleteOrder(record._id)}
            title="Xóa đơn hàng"
          />
        </Space>
      ),
      width: 280,
      fixed: 'right'
    }
  ];

  return (
    <AdminLayout>
      <div className="order-management">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Title level={2}>Quản lý đơn hàng</Title>
          <Button
            icon={<ReloadOutlined spin={refreshing} />}
            onClick={handleRefresh}
            loading={refreshing}
          >
            Làm mới
          </Button>
        </div>

        {/* Order Statistics */}
        <OrderStats
          orderStats={orderStats}
          loading={loading || refreshing}
        />

        {/* Filters */}
        <OrderFilters
          filters={filters}
          handleFilterChange={handleFilterChange}
          applyFilters={applyFilters}
          resetFilters={resetFilters}
          loading={loading || refreshing}
        />

        {/* Orders Table */}
        <Card>
          <OrderTable
            orders={orders}
            loading={loading || refreshing}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `Tổng cộng ${total} đơn hàng`
            }}
            updatingIds={updatingIds}
            onTableChange={handleTableChange}
            onViewOrder={handleViewOrder}
            onUpdateStatus={handleUpdateStatus}
            onDeleteOrder={handleDeleteOrder}
            scroll={{ x: 1200 }}
          />
        </Card>
      </div>
    </AdminLayout>
  );
};

export default OrderManagement;