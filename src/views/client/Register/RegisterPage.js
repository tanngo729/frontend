// src/views/client/Register/RegisterPage.js
import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Divider, Checkbox, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import ClientLayout from '../../../components/layout/Client/ClientLayout';
import "../../../styles/client/Register/RegisterPage.scss"

const { Title, Text } = Typography;

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Loại bỏ các trường không cần thiết
      const { confirmPassword, agreement, ...userData } = values;

      const success = await register(userData);
      if (success) {
        // Chuyển hướng đến trang đăng nhập sau khi đăng ký thành công
        navigate('/auth/login');
      }
    } catch (error) {
      console.error('Register error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClientLayout>
      <div className="register-container" style={{ maxWidth: '500px', margin: '40px auto', padding: '0 20px' }}>
        <Card className="register-card" bordered={false} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '20px' }}>Đăng ký tài khoản</Title>

          <Form
            form={form}
            name="register_form"
            layout="vertical"
            initialValues={{ agreement: false }}
            onFinish={onFinish}
            scrollToFirstError
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
                { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự!' },
                {
                  pattern: /^[a-z0-9_]+$/,
                  message: 'Tên đăng nhập chỉ được chứa chữ thường, số và dấu gạch dưới!'
                }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Tên đăng nhập"
                size="large"
              />
            </Form.Item>

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

            <Form.Item
              name="fullName"
              rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Họ và tên"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/,
                  message: 'Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số!'
                }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Mật khẩu"
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

            <Form.Item
              name="agreement"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value ? Promise.resolve() : Promise.reject(new Error('Vui lòng đồng ý với điều khoản dịch vụ!')),
                },
              ]}
            >
              <Checkbox>
                Tôi đã đọc và đồng ý với <a href="/terms-of-service">điều khoản dịch vụ</a>
              </Checkbox>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="register-form-button"
                block
                size="large"
                loading={loading}
              >
                Đăng ký
              </Button>
            </Form.Item>

            <Divider plain>Hoặc</Divider>

            <div style={{ textAlign: 'center' }}>
              <Text>Đã có tài khoản? </Text>
              <Link to="/auth/login">Đăng nhập</Link>
            </div>
          </Form>
        </Card>
      </div>
    </ClientLayout>
  );
};

export default RegisterPage;