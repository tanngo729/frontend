// src/views/client/Login/LoginPage.js
import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Divider, Checkbox, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import ClientLayout from '../../../components/layout/Client/ClientLayout';
import "../../../styles/client/Login/LoginPage.scss"

const { Title, Text } = Typography;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Chuyển hướng về trang trước đó sau khi đăng nhập
  const from = location.state?.from?.pathname || '/';

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const success = await login(values.email, values.password);
      if (success) {
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClientLayout>
      <div className="login-container" style={{ maxWidth: '400px', margin: '40px auto', padding: '0 20px' }}>
        <Card className="login-card" bordered={false} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '20px' }}>Đăng nhập</Title>

          <Form
            name="login_form"
            layout="vertical"
            initialValues={{ remember: true }}
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
                prefix={<UserOutlined />}
                placeholder="Email"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Mật khẩu"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>Ghi nhớ đăng nhập</Checkbox>
                </Form.Item>
                <Link to="/auth/forgot-password" className="login-form-forgot">
                  Quên mật khẩu?
                </Link>
              </div>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="login-form-button"
                block
                size="large"
                loading={loading}
              >
                Đăng nhập
              </Button>
            </Form.Item>

            <Divider plain>Hoặc</Divider>

            <div style={{ textAlign: 'center' }}>
              <Text>Chưa có tài khoản? </Text>
              <Link to="/auth/register">Đăng ký ngay</Link>
            </div>
          </Form>
        </Card>
      </div>
    </ClientLayout>
  );
};

export default LoginPage;