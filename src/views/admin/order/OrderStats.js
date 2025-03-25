import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Card, Statistic, Tooltip } from 'antd';
import {
  ShoppingOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CarOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';

const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '0đ';
  return amount.toLocaleString('vi-VN') + 'đ';
};

const OrderStats = ({ orderStats, loading }) => {
  // Ensure defaults for all possible missing values
  const total = orderStats?.total || 0;
  const pending = orderStats?.pending || 0;
  const processing = orderStats?.processing || 0;
  const shipped = orderStats?.shipped || 0;
  const delivered = orderStats?.delivered || 0;
  const cancelled = orderStats?.cancelled || 0;
  const totalRevenue = orderStats?.totalRevenue || 0;

  return (
    <Row gutter={[16, 16]} className="order-stats">
      <Col xs={24} sm={12} md={4}>
        <Card hoverable>
          <Statistic
            title="Tổng đơn hàng"
            value={total}
            prefix={<ShoppingOutlined />}
            loading={loading}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={4}>
        <Card hoverable>
          <Statistic
            title="Chờ xác nhận"
            value={pending}
            prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
            loading={loading}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={4}>
        <Card hoverable>
          <Statistic
            title="Đang xử lý"
            value={processing}
            prefix={<ClockCircleOutlined style={{ color: '#1890ff' }} />}
            loading={loading}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={4}>
        <Card hoverable>
          <Statistic
            title="Đang giao hàng"
            value={shipped}
            prefix={<CarOutlined style={{ color: '#13c2c2' }} />}
            loading={loading}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={4}>
        <Card hoverable>
          <Statistic
            title="Đã giao"
            value={delivered}
            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            loading={loading}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={4}>
        <Tooltip title="Tổng doanh thu từ các đơn đã giao">
          <Card hoverable>
            <Statistic
              title="Doanh thu"
              value={totalRevenue}
              prefix={<DollarOutlined style={{ color: '#1890ff' }} />}
              formatter={(value) => formatCurrency(value)}
              loading={loading}
            />
          </Card>
        </Tooltip>
      </Col>
    </Row>
  );
};

OrderStats.propTypes = {
  orderStats: PropTypes.shape({
    total: PropTypes.number,
    pending: PropTypes.number,
    processing: PropTypes.number,
    shipped: PropTypes.number,
    delivered: PropTypes.number,
    cancelled: PropTypes.number,
    totalRevenue: PropTypes.number
  }),
  loading: PropTypes.bool
};

OrderStats.defaultProps = {
  orderStats: {
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    totalRevenue: 0
  },
  loading: false
};

export default OrderStats;