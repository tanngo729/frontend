// src/components/admin/orders/ShippingInfo.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Card } from 'antd';
import { PhoneOutlined, HomeOutlined } from '@ant-design/icons';

/**
 * ShippingInfo - Component for showing shipping details
 */
const ShippingInfo = ({ order }) => {
  // Get shipping info or provide empty object if missing
  const shippingInfo = order.shippingInfo || {};

  return (
    <Card title="Thông tin giao hàng" className="shipping-info-card">
      <div className="shipping-info">
        <p>
          <PhoneOutlined className="info-icon" />
          <strong>Người nhận:</strong> {shippingInfo.name || 'N/A'}
        </p>
        <p>
          <PhoneOutlined className="info-icon" />
          <strong>Điện thoại:</strong> {shippingInfo.phone || 'N/A'}
        </p>
        <p>
          <HomeOutlined className="info-icon" />
          <strong>Địa chỉ:</strong> {shippingInfo.address || 'N/A'}
        </p>
        {shippingInfo.note && (
          <p>
            <strong>Ghi chú:</strong> {shippingInfo.note}
          </p>
        )}
      </div>
    </Card>
  );
};

ShippingInfo.propTypes = {
  order: PropTypes.object.isRequired
};

export default ShippingInfo;