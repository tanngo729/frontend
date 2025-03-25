// src/views/client/ForgotPassword/ForgotPasswordPage.js
import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Result, Divider, message } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import ClientLayout from '../../../components/layout/Client/ClientLayout';
import authService from '../../../services/client/authService';
import '../../../styles/client/ForgotPassword/ForgotPasswordPage.scss';

const { Title, Text, Paragraph } = Typography;

const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await authService.forgotPassword(values.email);
      setEmail(values.email);
      setSubmitted(true);
      message.success('Đã gửi email khôi phục mật khẩu. Vui lòng kiểm tra hộp thư của bạn.');
    } catch (error) {
      message.error(error?.message || 'Không thể gửi email khôi phục mật khẩu. Vui lòng thử lại sau.');
      console.error('Forgot password error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Hiển thị form nhập email
  const renderForm = () => (
    <Card className="forgot-password-card" bordered={false}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: '10px' }}>Quên mật khẩu</Title>
      <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: '30px' }}>
        Vui lòng nhập email đã đăng ký của bạn
      </Text>

      <Form
        name="forgot_password_form"
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Vui lòng nhập email!' },
            { type: 'email', message: 'Email không hợp lệ!' }
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="Email"
            size="large"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={loading}
            className="submit-button"
          >
            Gửi yêu cầu
          </Button>
        </Form.Item>
      </Form>

      <Divider />

      <div className="back-to-login">
        <Link to="/auth/login">
          <ArrowLeftOutlined /> Quay lại đăng nhập
        </Link>
      </div>
    </Card>
  );

  // Hiển thị thông báo đã gửi email
  const renderSuccess = () => (
    <Card className="forgot-password-card" bordered={false}>
      <Result
        status="success"
        title="Đã gửi email khôi phục mật khẩu!"
        subTitle={
          <div className="result-message">
            <Paragraph>
              Chúng tôi đã gửi hướng dẫn khôi phục mật khẩu đến địa chỉ email:
            </Paragraph>
            <Paragraph className="email-highlight">{email}</Paragraph>
            <Paragraph>
              Vui lòng kiểm tra hộp thư của bạn và làm theo hướng dẫn để đặt lại mật khẩu.
              Email có thể mất vài phút để đến hộp thư của bạn.
            </Paragraph>
          </div>
        }
        extra={[
          <Button
            type="primary"
            key="login"
            onClick={() => window.location.href = '/auth/login'}
          >
            Quay lại đăng nhập
          </Button>,
          <Button
            key="again"
            onClick={() => setSubmitted(false)}
            style={{ marginTop: '10px' }}
          >
            Gửi lại yêu cầu
          </Button>,
        ]}
      />
    </Card>
  );

  return (
    <ClientLayout>
      <div className="forgot-password-container">
        {submitted ? renderSuccess() : renderForm()}
      </div>
    </ClientLayout>
  );
};

export default ForgotPasswordPage;