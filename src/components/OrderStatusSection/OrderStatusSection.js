// Components/OrderStatusSection.jsx
const OrderStatusSection = ({ order, loading }) => {
  if (loading) return <Skeleton active />;

  return (
    <Card className="status-card">
      {order.status !== 'cancelled' ? (
        <Steps current={getStepIndex(order.status)} status={order.status === 'cancelled' ? 'error' : 'process'}>
          {/* ... */}
        </Steps>
      ) : (
        <div className="cancelled-order">
          {/* ... */}
        </div>
      )}
    </Card>
  );
};

// Components/OrderItems.jsx
const OrderItems = ({ items, totalPrice, loading }) => {
  if (loading) return <Skeleton active />;

  return (
    <Card title="Sản phẩm đã đặt" className="order-items-card">
      <List
        itemLayout="horizontal"
        dataSource={items}
        renderItem={(item) => (
          <List.Item>
            {/* ... */}
          </List.Item>
        )}
        footer={
          <div className="order-total">
            <Text strong>Tổng cộng:</Text>
            <Text strong style={{ fontSize: '16px', color: '#f5222d' }}>
              {totalPrice.toLocaleString('vi-VN')}đ
            </Text>
          </div>
        }
      />
    </Card>
  );
};
