import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Spin } from 'antd';
import AdminLayout from '../../../components/layout/AdminLayout';
import userService from '../../../services/admin/userService';
import '../../../styles/components/admin/ProfilePage.scss';

const ProfilePage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await userService.getProfile();
      form.setFieldsValue({
        fullName: res.data.fullName,
        email: res.data.email,
        phone: res.data.phone,
        address: res.data.address,
      });
    } catch (error) {
      message.error('Lỗi khi tải thông tin cá nhân');
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await userService.updateProfile(values);
      message.success('Cập nhật thông tin thành công');
    } catch (error) {
      message.error('Lỗi khi cập nhật thông tin cá nhân');
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <AdminLayout>
        <Spin tip="Đang tải..." style={{ margin: '100px auto', display: 'block' }} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="profile-page-container">
        <h1>Thông tin cá nhân</h1>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
          >
            <Input placeholder="Nhập họ và tên" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại">
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ">
            <Input placeholder="Nhập địa chỉ" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Lưu thay đổi
            </Button>
          </Form.Item>
        </Form>
      </div>
    </AdminLayout>
  );
};

export default ProfilePage;
