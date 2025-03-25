// src/components/admin/orders/OrderInformation.js
import React from 'react';
import PropTypes from 'prop-types';
import { Card, Descriptions, Button, Tag, Space, Select, Divider, Typography } from 'antd';
import { formatCurrency, formatDate } from '../../../../utils/formatters';

const { Text } = Typography;

// Status configuration
const STATUS_CONFIG = {
  pending: { color: 'orange', label: 'Chờ xác nhận' },
  processing: { color: 'blue', label: 'Đang xử lý' },
  shipped: { color: 'cyan', label: 'Đang giao hàng' },
  delivered: { color: 'green', label: 'Đã giao hàng' },
  cancelled: { color: 'red', label: 'Đã hủy' }
};

// Payment status configuration
const PAYMENT_STATUS_CONFIG = {
  pending: { color: 'orange', label: 'Chờ thanh toán' },
  paid: { color: 'green', label: 'Đã thanh toán' },
  failed: { color: 'red', label: 'Thanh toán thất bại' }
};

/**
 * OrderInformation - Component showing order details and action buttons
 */
const OrderInformation = ({
  order,
  newStatus,
  setNewStatus,
  newPaymentStatus,
  setNewPaymentStatus,
  onUpdateStatus,
  onUpdatePaymentStatus,
  onDeleteOrder,
  updateLoading
}) => {
  return (
    <Card title="Thông tin đơn hàng" className="order-info-card">
      <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
        <Descriptions.Item label="Mã đơn hàng">
          {order._id ? `#${order._id.slice(-6)}` : 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày đặt">
          {formatDate(order.createdAt)}
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Tag color={order.status && STATUS_CONFIG[order.status]?.color || 'default'}>
            {order.status && STATUS_CONFIG[order.status]?.label || order.status || 'N/A'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Thanh toán">
          <Tag color={order.paymentStatus && PAYMENT_STATUS_CONFIG[order.paymentStatus]?.color || 'default'}>
            {order.paymentStatus && PAYMENT_STATUS_CONFIG[order.paymentStatus]?.label || order.paymentStatus || 'N/A'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Tổng tiền" span={2}>
          <Text strong style={{ fontSize: '16px', color: '#f5222d' }}>
            {formatCurrency(order.totalPrice)}
          </Text>
        </Descriptions.Item>
      </Descriptions>

      <Divider />

      <div className="order-actions">
        <Space wrap>
          {/* Status update controls */}
          <Select
            value={newStatus}
            onChange={setNewStatus}
            style={{ width: 180 }}
            disabled={updateLoading}
          >
            {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
              <Select.Option key={key} value={key}>{label}</Select.Option>
            ))}
          </Select>
          <Button
            type="primary"
            onClick={onUpdateStatus}
            disabled={newStatus === order.status || updateLoading}
            loading={updateLoading}
          >
            Cập nhật trạng thái
          </Button>

          {/* Payment status update controls */}
          <Select
            value={newPaymentStatus}
            onChange={setNewPaymentStatus}
            style={{ width: 180 }}
            disabled={updateLoading}
          >
            {Object.entries(PAYMENT_STATUS_CONFIG).map(([key, { label }]) => (
              <Select.Option key={key} value={key}>{label}</Select.Option>
            ))}
          </Select>
          <Button
            type="primary"
            onClick={onUpdatePaymentStatus}
            disabled={newPaymentStatus === order.paymentStatus || updateLoading}
            loading={updateLoading}
          >
            Cập nhật thanh toán
          </Button>

          <Button
            danger
            onClick={onDeleteOrder}
            disabled={updateLoading}
          >
            Xóa đơn hàng
          </Button>
        </Space>
      </div>
    </Card>
  );
};

OrderInformation.propTypes = {
  order: PropTypes.object.isRequired,
  newStatus: PropTypes.string.isRequired,
  setNewStatus: PropTypes.func.isRequired,
  newPaymentStatus: PropTypes.string.isRequired,
  setNewPaymentStatus: PropTypes.func.isRequired,
  onUpdateStatus: PropTypes.func.isRequired,
  onUpdatePaymentStatus: PropTypes.func.isRequired,
  onDeleteOrder: PropTypes.func.isRequired,
  updateLoading: PropTypes.bool
};

OrderInformation.defaultProps = {
  updateLoading: false
};

export default OrderInformation;