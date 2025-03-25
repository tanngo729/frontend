// src/views/admin/orders/OrderTable.js
import React from 'react';
import PropTypes from 'prop-types';
import { Table, Tag, Badge, Space, Button, Select, Tooltip } from 'antd';
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import moment from 'moment';
import 'moment/locale/vi';

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
 * Format currency in VND
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted amount
 */
const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return 'N/A';
  return amount.toLocaleString('vi-VN') + 'đ';
};

/**
 * Reusable order table component
 */
const OrderTable = ({
  orders,
  loading,
  pagination,
  updatingIds,
  onTableChange,
  onViewOrder,
  onUpdateStatus,
  onDeleteOrder,
  scroll
}) => {
  // Table columns configuration
  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: '_id',
      key: '_id',
      render: id => <span>#{id?.slice(-6) || 'N/A'}</span>,
      width: 120
    },
    {
      title: 'Khách hàng',
      dataIndex: 'userDetails',
      key: 'customer',
      render: (userDetails, record) => {
        // Try different possible data structures
        const user = userDetails || record.userId || {};
        const fullName = user?.fullName ||
          (typeof user === 'object' && user.name) ||
          (typeof user === 'string' ? user : 'N/A');

        const email = user?.email ||
          (record.shippingInfo && record.shippingInfo.email) ||
          'N/A';

        return (
          <div>
            <div>{fullName}</div>
            <div style={{ color: 'gray', fontSize: '12px' }}>{email}</div>
          </div>
        );
      },
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
      render: date => date ? moment(date).format('DD/MM/YYYY HH:mm') : 'N/A',
      sorter: (a, b) => moment(a.createdAt || 0).unix() - moment(b.createdAt || 0).unix(),
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
          <Tooltip title="Xem chi tiết">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => onViewOrder(record._id)}
            />
          </Tooltip>

          {/* Status update dropdown */}
          <Select
            value={record.status || 'pending'}
            style={{ width: 140 }}
            size="small"
            loading={updatingIds?.status?.has?.(record._id)}
            onChange={value => onUpdateStatus(record._id, value)}
          >
            {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
              <Select.Option key={key} value={key}>{label}</Select.Option>
            ))}
          </Select>

          <Tooltip title="Xóa đơn hàng">
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
              loading={updatingIds?.delete?.has?.(record._id)}
              onClick={() => onDeleteOrder(record._id)}
            />
          </Tooltip>
        </Space>
      ),
      width: 280,
      fixed: 'right'
    }
  ];

  return (
    <Table
      rowKey="_id"
      columns={columns}
      dataSource={orders}
      loading={loading}
      pagination={pagination}
      onChange={onTableChange}
      scroll={scroll || { x: 1200 }}
    />
  );
};

OrderTable.propTypes = {
  orders: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  pagination: PropTypes.object,
  updatingIds: PropTypes.object,
  onTableChange: PropTypes.func,
  onViewOrder: PropTypes.func.isRequired,
  onUpdateStatus: PropTypes.func.isRequired,
  onDeleteOrder: PropTypes.func.isRequired,
  scroll: PropTypes.object
};

OrderTable.defaultProps = {
  orders: [],
  loading: false,
  pagination: {
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `Tổng cộng ${total} đơn hàng`
  },
  updatingIds: {
    status: new Set(),
    delete: new Set()
  },
  onTableChange: () => { }
};

export default OrderTable;