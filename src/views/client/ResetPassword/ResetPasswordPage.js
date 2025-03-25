// src/views/client/ResetPassword/ResetPasswordPage.js
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Result, Spin, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import ClientLayout from '../../../components/layout/Client/ClientLayout';
import authService from '../../../services/client/authService';
import '../../../styles/client/ResetPassword/ResetPasswordPage.scss';

const { Title, Text, Paragraph } = Typography;

const ResetPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [validToken, setValidToken] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  // Xác thực token
  useEffect(() => {
    const validateToken = async () => {
      try {
        setValidating(true);
        await authService.validateResetToken(token);
        setValidToken(true);
      } catch (error) {
        console.error('Token validation error:', error);
        message.error('Token không hợp lệ hoặc đã hết hạn.');
        setValidToken(false);
      } finally {
        setValidating(false);
      }
    };

    if (token) {
      validateToken();
    } else {
      setValidating(false);
      setValidToken(false);
    }
  }, [token]);

  // Xử lý đặt lại mật khẩu
  const onFinish = async (values) => {
    setLoading(true);
    try {
      await authService.resetPassword(token, values.password);
      setSubmitted(true);
      message.success('Đặt lại mật khẩu thành công!');
    } catch (error) {
      console.error('Reset password error:', error);
      message.error(error?.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Hiển thị trạng thái đang kiểm tra token
  if (validating) {
    return (
      <ClientLayout>
        <div className="reset-password-container">
          <Card className="reset-password-card" bordered={false}>
            <div className="loading-state">
              <Spin size="large" />
              <Paragraph style={{ marginTop: '20px' }}>Đang xác thực token...</Paragraph>
            </div>
          </Card>
        </div>
      </ClientLayout>
    );
  }

  // Hiển thị lỗi token không hợp lệ
  if (!validToken && !validating) {
    return (
      <ClientLayout>
        <div className="reset-password-container">
          <Card className="reset-password-card" bordered={false}>
            <Result
              status="error"
              title="Token không hợp lệ hoặc đã hết hạn"
              subTitle="Link đặt lại mật khẩu đã hết hạn hoặc không hợp lệ. Vui lòng yêu cầu đặt lại mật khẩu mới."
              extra={[
                <Button
                  type="primary"
                  key="forgotPassword"
                  onClick={() => navigate('/auth/forgot-password')}
                >
                  Yêu cầu đặt lại mật khẩu mới
                </Button>,
                <Button
                  key="login"
                  onClick={() => navigate('/auth/login')}
                  style={{ marginTop: '10px' }}
                >
                  Quay lại đăng nhập
                </Button>,
              ]}
            />
          </Card>
        </div>
      </ClientLayout>
    );
  }

  // Hiển thị form đặt lại mật khẩu
  const renderForm = () => (
    <Card className="reset-password-card" bordered={false}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: '10px' }}>Đặt lại mật khẩu</Title>
      <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: '30px' }}>
        Nhập mật khẩu mới của bạn
      </Text>

      <Form
        name="reset_password_form"
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          name="password"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/,
              message: 'Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số!'
            }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Mật khẩu mới"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Xác nhận mật khẩu"
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
            Đặt lại mật khẩu
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );

  // Hiển thị kết quả thành công
  const renderSuccess = () => (
    <Card className="reset-password-card" bordered={false}>
      <Result
        status="success"
        title="Đặt lại mật khẩu thành công!"
        subTitle="Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập bằng mật khẩu mới."
        extra={[
          <Button
            type="primary"
            key="login"
            onClick={() => navigate('/auth/login')}
          >
            Đăng nhập ngay
          </Button>
        ]}
      />
    </Card>
  );

  return (
    <ClientLayout>
      <div className="reset-password-container">
        {submitted ? renderSuccess() : renderForm()}
      </div>
    </ClientLayout>
  );
};

export default ResetPasswordPage;