// src/components/admin/orders/OrderItems.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Card, List, Space, Typography } from 'antd';
import { formatCurrency } from '../../../../utils/formatters';

const { Text } = Typography;

/**
 * OrderItems - Component for displaying order products
 */
const OrderItems = ({ order }) => {
  // Fallback placeholder image if product image is missing
  const placeholderImage = 'https://placehold.co/80x80?text=No+Image';

  return (
    <Card title="Sản phẩm đã đặt" className="order-items-card">
      <List
        itemLayout="horizontal"
        dataSource={order.items || []}
        locale={{ emptyText: 'Không có sản phẩm nào trong đơn hàng' }}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <img
                  src={(item.productId && item.productId.image) || placeholderImage}
                  alt={(item.productId && item.productId.name) || 'Sản phẩm'}
                  width={80}
                  height={80}
                  style={{ objectFit: 'cover', borderRadius: '4px' }}
                />
              }
              title={
                <Typography.Text strong>
                  {(item.productId && item.productId.name) || 'Sản phẩm không còn tồn tại'}
                </Typography.Text>
              }
              description={
                <Space direction="vertical" size={0}>
                  <Typography.Text>{`Số lượng: ${item.quantity || 0}`}</Typography.Text>
                  <Typography.Text>{`Đơn giá: ${formatCurrency(item.price)}`}</Typography.Text>
                </Space>
              }
            />
            <div className="item-total">
              <Typography.Text strong>
                {formatCurrency((item.price || 0) * (item.quantity || 0))}
              </Typography.Text>
            </div>
          </List.Item>
        )}
        footer={
          <div className="order-total">
            <Space>
              <Text strong>Tổng cộng:</Text>
              <Text strong style={{ fontSize: '16px', color: '#f5222d' }}>
                {formatCurrency(order.totalPrice)}
              </Text>
            </Space>
          </div>
        }
      />
    </Card>
  );
};

OrderItems.propTypes = {
  order: PropTypes.object.isRequired
};

export default OrderItems;