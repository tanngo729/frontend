// src/components/admin/orders/OrderProgress.jsx
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Steps, Typography } from 'antd';
import {
  ClockCircleOutlined,
  SyncOutlined,
  CarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';

// Status configuration objects
const STATUS_CONFIG = {
  pending: {
    color: 'orange',
    label: 'Chờ xác nhận',
    icon: <ClockCircleOutlined />,
    description: 'Đang chờ xác nhận'
  },
  processing: {
    color: 'blue',
    label: 'Đang xử lý',
    icon: <SyncOutlined spin />,
    description: 'Đơn hàng đang được chuẩn bị'
  },
  shipped: {
    color: 'cyan',
    label: 'Đang giao hàng',
    icon: <CarOutlined />,
    description: 'Đơn hàng đang được vận chuyển'
  },
  delivered: {
    color: 'green',
    label: 'Đã giao hàng',
    icon: <CheckCircleOutlined />,
    description: (date) => `Đã giao thành công ${moment(date).format('DD/MM/YYYY')}`
  },
  cancelled: {
    color: 'red',
    label: 'Đã hủy',
    icon: <ExclamationCircleOutlined />,
    description: 'Đơn hàng đã bị hủy'
  }
};

/**
 * OrderProgress - Component for showing order process steps
 */
const OrderProgress = ({ order }) => {
  // Helper function to determine step index in progress bar
  const getStepIndex = useCallback((status) => {
    if (!status) return 0;
    const statusMap = {
      pending: 0,
      processing: 1,
      shipped: 2,
      delivered: 3,
      cancelled: -1,
    };
    return statusMap[status] ?? 0;
  }, []);

  if (order.status === 'cancelled') {
    return (
      <div className="cancelled-order" style={{ textAlign: 'center', padding: '24px' }}>
        <ExclamationCircleOutlined className="cancelled-icon" style={{ fontSize: '48px', color: '#ff4d4f', marginBottom: '16px' }} />
        <Typography.Title level={4}>Đơn hàng đã bị hủy</Typography.Title>
        <Typography.Text type="secondary">
          Đơn hàng đã bị hủy vào {moment(order.updatedAt).format('DD/MM/YYYY HH:mm')}
        </Typography.Text>
      </div>
    );
  }

  return (
    <Steps
      current={getStepIndex(order.status)}
      status={order.status === 'cancelled' ? 'error' : 'process'}
    >
      <Steps.Step
        title="Chờ xác nhận"
        icon={STATUS_CONFIG.pending.icon}
        description={order.status === 'pending' ? STATUS_CONFIG.pending.description : ''}
      />
      <Steps.Step
        title="Đang xử lý"
        icon={order.status === 'processing' ? STATUS_CONFIG.processing.icon : <SyncOutlined />}
        description={order.status === 'processing' ? STATUS_CONFIG.processing.description : ''}
      />
      <Steps.Step
        title="Đang giao hàng"
        icon={STATUS_CONFIG.shipped.icon}
        description={order.status === 'shipped' ? STATUS_CONFIG.shipped.description : ''}
      />
      <Steps.Step
        title="Đã giao hàng"
        icon={STATUS_CONFIG.delivered.icon}
        description={order.status === 'delivered' && order.updatedAt
          ? STATUS_CONFIG.delivered.description(order.updatedAt)
          : ''}
      />
    </Steps>
  );
};

OrderProgress.propTypes = {
  order: PropTypes.object.isRequired
};

export default OrderProgress;