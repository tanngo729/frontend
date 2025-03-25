// src/components/admin/orders/CustomerInfo.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Card } from 'antd';

/**
 * CustomerInfo - Component for showing customer details
 */
const CustomerInfo = ({ order }) => {
  // Handle data access and provide fallbacks in case fields are missing
  const customerName = order.userDetails?.fullName || order.userId?.fullName || 'N/A';
  const customerEmail = order.userDetails?.email || order.userId?.email || 'N/A';
  const customerPhone = order.userDetails?.phone || order.userId?.phone || 'N/A';

  return (
    <Card title="Thông tin khách hàng" className="customer-info-card">
      <div className="customer-info">
        <p><strong>Họ tên:</strong> {customerName}</p>
        <p><strong>Email:</strong> {customerEmail}</p>
        <p><strong>Điện thoại:</strong> {customerPhone}</p>
      </div>
    </Card>
  );
};

CustomerInfo.propTypes = {
  order: PropTypes.object.isRequired
};

export default CustomerInfo;