import React from 'react';
import { Result, Button, Typography } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { HomeOutlined, ShoppingCartOutlined, FileTextOutlined } from '@ant-design/icons';
import ClientLayout from '../../../components/layout/Client/ClientLayout';

const { Paragraph, Text } = Typography;

const CheckoutFailedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const orderId = searchParams.get('orderId');
  const errorCode = searchParams.get('error');

  // Lấy thông báo lỗi dựa vào mã lỗi
  const getErrorMessage = (code) => {
    switch (code) {
      case '24':
        return 'Hết thời gian thanh toán';
      case '51':
        return 'Số dư tài khoản không đủ';
      case '07':
        return 'Giao dịch bị nghi ngờ gian lận';
      case 'invalid_signature':
        return 'Chữ ký không hợp lệ, giao dịch có thể bị giả mạo';
      case 'order_not_found':
        return 'Không tìm thấy đơn hàng';
      case 'server_error':
        return 'Lỗi hệ thống, vui lòng thử lại sau';
      default:
        return 'Giao dịch không thành công';
    }
  };

  return (
    <ClientLayout>
      <Result
        status="error"
        title="Thanh toán thất bại"
        subTitle={getErrorMessage(errorCode)}
        extra={[
          <Button
            type="primary"
            icon={<HomeOutlined />}
            onClick={() => navigate('/')}
            key="home"
          >
            Về trang chủ
          </Button>,
          <Button
            icon={<ShoppingCartOutlined />}
            onClick={() => navigate('/checkout')}
            key="checkout"
          >
            Thử lại thanh toán
          </Button>,
          orderId && (
            <Button
              icon={<FileTextOutlined />}
              onClick={() => navigate(`/order/${orderId}`)}
              key="order"
            >
              Xem chi tiết đơn hàng
            </Button>
          )
        ]}
      >
        <div className="desc">
          <Paragraph>
            <Text strong style={{ fontSize: 16 }}>
              Đơn hàng của bạn vẫn được lưu, nhưng thanh toán không thành công
            </Text>
          </Paragraph>
          <Paragraph>
            1. Bạn có thể thử lại với phương thức thanh toán khác
          </Paragraph>
          <Paragraph>
            2. Kiểm tra số dư tài khoản hoặc liên hệ ngân hàng nếu tiền đã bị trừ
          </Paragraph>
          <Paragraph>
            3. Liên hệ hỗ trợ nếu bạn cần trợ giúp
          </Paragraph>
        </div>
      </Result>
    </ClientLayout>
  );
};

export default CheckoutFailedPage;