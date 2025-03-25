// src/views/admin/Login/AdminLoginPage.jsx
import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import adminAuthService from '../../../services/admin/authService';
import { useAdminAuth } from '../../../context/AdminAuthContext';

const AdminLoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login: adminLogin } = useAdminAuth();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await adminAuthService.login(values);
      const { user, tokens } = response.data;
      // Call the login function from context with both access and refresh tokens
      adminLogin(user, tokens.accessToken, tokens.refreshToken);
      message.success('Đăng nhập Admin thành công');
      navigate('/admin'); // Redirect to admin dashboard
    } catch (error) {
      console.error('Admin login error:', error);
      message.error(error.response?.data?.message || 'Lỗi khi đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <h2>Đăng nhập Admin</h2>
      <Form
        name="adminLogin"
        onFinish={onFinish}
        layout="vertical"
        style={{ maxWidth: 400, margin: '0 auto' }}
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Vui lòng nhập email' },
            { type: 'email', message: 'Email không hợp lệ' },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Đăng nhập Admin
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AdminLoginPage;
