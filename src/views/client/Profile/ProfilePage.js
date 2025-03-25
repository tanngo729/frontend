// src/views/client/Profile/ProfilePage.js
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Tabs, message } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../../../context/AuthContext';
import ClientLayout from '../../../components/layout/Client/ClientLayout';
import userService from '../../../services/client/userService';

const { Title } = Typography;
const { TabPane } = Tabs;

const ProfilePage = () => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    if (isAuthenticated && user) {
      profileForm.setFieldsValue({
        username: user.username,
        email: user.email,
        fullName: user.fullName
      });
    }
  }, [isAuthenticated, user, profileForm]);

  const handleUpdateProfile = async (values) => {
    setLoading(true);
    try {
      await userService.updateProfile(values);
      message.success('Cập nhật thông tin thành công!');
    } catch (error) {
      console.error('Update profile error:', error);
      message.error('Không thể cập nhật thông tin. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values) => {
    setLoading(true);
    try {
      await userService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      });

      passwordForm.resetFields();
      message.success('Đổi mật khẩu thành công!');
    } catch (error) {
      console.error('Change password error:', error);
      message.error('Không thể đổi mật khẩu. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClientLayout>
      <div className="profile-container" style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '20px' }}>Thông tin tài khoản</Title>

        <Card>
          <Tabs defaultActiveKey="profile">
            <TabPane tab="Thông tin cá nhân" key="profile">
              <Form
                form={profileForm}
                layout="vertical"
                onFinish={handleUpdateProfile}
              >
                <Form.Item
                  name="username"
                  label="Tên đăng nhập"
                >
                  <Input
                    prefix={<UserOutlined />}
                    disabled
                  />
                </Form.Item>

                <Form.Item
                  name="email"
                  label="Email"
                >
                  <Input
                    prefix={<MailOutlined />}
                    disabled
                  />
                </Form.Item>

                <Form.Item
                  name="fullName"
                  label="Họ và tên"
                  rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                >
                  <Input
                    prefix={<UserOutlined />}
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                  >
                    Cập nhật thông tin
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>

            <TabPane tab="Đổi mật khẩu" key="password">
              <Form
                form={passwordForm}
                layout="vertical"
                onFinish={handleChangePassword}
              >
                <Form.Item
                  name="currentPassword"
                  label="Mật khẩu hiện tại"
                  rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                  />
                </Form.Item>

                <Form.Item
                  name="newPassword"
                  label="Mật khẩu mới"
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
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  label="Xác nhận mật khẩu mới"
                  dependencies={['newPassword']}
                  rules={[
                    { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                  >
                    Đổi mật khẩu
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
          </Tabs>
        </Card>
      </div>
    </ClientLayout>
  );
};

export default ProfilePage;