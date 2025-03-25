// src/components/admin/orders/OrderFilters.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Input, Select, DatePicker, Button, Space, Card } from 'antd';
import { SearchOutlined, FilterOutlined, ClearOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

// Status configuration
const STATUS_CONFIG = {
  pending: { label: 'Chờ xác nhận' },
  processing: { label: 'Đang xử lý' },
  shipped: { label: 'Đang giao hàng' },
  delivered: { label: 'Đã giao hàng' },
  cancelled: { label: 'Đã hủy' }
};

// Payment status configuration
const PAYMENT_STATUS_CONFIG = {
  pending: { label: 'Chờ thanh toán' },
  paid: { label: 'Đã thanh toán' },
  failed: { label: 'Thanh toán thất bại' }
};

/**
 * Component for order filtering interface
 */
const OrderFilters = ({ filters, handleFilterChange, applyFilters, resetFilters, loading }) => {
  // Local state for filters that will only update parent on apply
  const [localFilters, setLocalFilters] = useState({ ...filters });

  // Keep local filters in sync with parent filters
  useEffect(() => {
    setLocalFilters({ ...filters });
  }, [filters]);

  const handleLocalChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    // Update parent filters with all local changes
    Object.keys(localFilters).forEach(key => {
      handleFilterChange(key, localFilters[key]);
    });
    applyFilters();
  };

  const handleReset = () => {
    setLocalFilters({
      status: '',
      paymentStatus: '',
      search: '',
      dateRange: null,
    });
    resetFilters();
  };

  return (
    <Card className="filter-container" style={{ marginBottom: 16 }}>
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} md={12} lg={8}>
          <Input
            placeholder="Tìm theo mã đơn hàng hoặc tên khách hàng"
            prefix={<SearchOutlined />}
            value={localFilters.search || ''}
            onChange={(e) => handleLocalChange('search', e.target.value)}
            onPressEnter={handleApply}
            allowClear
            disabled={loading}
          />
        </Col>
        <Col xs={24} md={12} lg={8}>
          <Select
            placeholder="Lọc theo trạng thái"
            style={{ width: '100%' }}
            value={localFilters.status || undefined}
            onChange={(value) => handleLocalChange('status', value)}
            allowClear
            disabled={loading}
          >
            {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
              <Select.Option key={key} value={key}>{label}</Select.Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} md={12} lg={8}>
          <Select
            placeholder="Lọc theo trạng thái thanh toán"
            style={{ width: '100%' }}
            value={localFilters.paymentStatus || undefined}
            onChange={(value) => handleLocalChange('paymentStatus', value)}
            allowClear
            disabled={loading}
          >
            {Object.entries(PAYMENT_STATUS_CONFIG).map(([key, { label }]) => (
              <Select.Option key={key} value={key}>{label}</Select.Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} lg={16}>
          <RangePicker
            style={{ width: '100%' }}
            value={localFilters.dateRange || null}
            onChange={(dates) => handleLocalChange('dateRange', dates)}
            format="DD/MM/YYYY"
            placeholder={['Từ ngày', 'Đến ngày']}
            disabled={loading}
            allowEmpty={[true, true]}
          />
        </Col>
        <Col xs={24} lg={8} style={{ textAlign: 'right' }}>
          <Space>
            <Button
              type="primary"
              icon={<FilterOutlined />}
              onClick={handleApply}
              loading={loading}
            >
              Lọc
            </Button>
            <Button
              icon={<ClearOutlined />}
              onClick={handleReset}
              disabled={loading}
            >
              Reset
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

OrderFilters.propTypes = {
  filters: PropTypes.shape({
    status: PropTypes.string,
    paymentStatus: PropTypes.string,
    search: PropTypes.string,
    dateRange: PropTypes.array
  }),
  handleFilterChange: PropTypes.func.isRequired,
  applyFilters: PropTypes.func.isRequired,
  resetFilters: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

OrderFilters.defaultProps = {
  filters: {
    status: '',
    paymentStatus: '',
    search: '',
    dateRange: null
  },
  loading: false
};

export default OrderFilters;