// src/components/admin/orders/OrderHistory.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Card, Timeline } from 'antd';
import { formatDate } from '../../../../utils/formatters';

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
 * OrderHistory - Component for showing order status timeline
 */
const OrderHistory = ({ history }) => {
  return (
    <Card title="Lịch sử đơn hàng" className="history-card">
      <Timeline>
        {history.map((event, index) => (
          <Timeline.Item
            key={index}
            color={event.type === 'status' && event.newValue
              ? STATUS_CONFIG[event.newValue]?.color : 'blue'}
          >
            <p>
              <strong>{event.type === 'status' ? 'Trạng thái' : 'Thanh toán'}:</strong>{' '}
              {event.type === 'status'
                ? (STATUS_CONFIG[event.newValue]?.label || event.newValue || 'N/A')
                : (PAYMENT_STATUS_CONFIG[event.newValue]?.label || event.newValue || 'N/A')
              }
            </p>
            <p style={{ color: 'rgba(0, 0, 0, 0.45)' }}>{formatDate(event.timestamp)}</p>
          </Timeline.Item>
        ))}
      </Timeline>
    </Card>
  );
};

OrderHistory.propTypes = {
  history: PropTypes.array.isRequired
};

export default OrderHistory;