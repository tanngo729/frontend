// src/components/users/UserForm.js
import React from 'react';
import { Form, Input, Select, Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { Option } = Select;

const UserForm = ({ initialValues = {}, onFinish, roleOptions = [] }) => {
  const [form] = Form.useForm();

  // Chuyển avatarUrl thành mảng nếu có (nếu là chuỗi, chuyển thành mảng đối tượng file)
  const modifiedInitialValues = {
    ...initialValues,
    // Nếu có avatarUrl (URL string), chuyển thành mảng đối tượng file; nếu không, là mảng rỗng.
    avatarUrl: Array.isArray(initialValues.avatarUrl)
      ? initialValues.avatarUrl
      : initialValues.avatarUrl
        ? [{
          uid: '-1',
          name: 'avatar.png',
          status: 'done',
          url: initialValues.avatarUrl,
        }]
        : [],
    // Đảm bảo roles là mảng các role ID
    roles: initialValues.roles ? initialValues.roles.map(role => role._id || role) : [],
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={modifiedInitialValues}
      onFinish={onFinish}
    >
      <Form.Item
        label="Avatar"
        name="avatar"
        valuePropName="fileList"
        getValueFromEvent={(e) => {
          if (Array.isArray(e)) {
            return e;
          }
          return e && e.fileList ? e.fileList : [];
        }}
      >
        <Upload listType="picture">
          <Button icon={<UploadOutlined />}>Tải lên Avatar</Button>
        </Upload>
      </Form.Item>

      <Form.Item
        label="Username"
        name="username"
        rules={[{ required: true, message: 'Vui lòng nhập username' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Email"
        name="email"
        rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}
      >
        <Input />
      </Form.Item>

      {/* Trường mật khẩu được để trống khi chỉnh sửa, vì mật khẩu gốc không thể hiển thị */}
      <Form.Item
        label="Mật khẩu"
        name="password"
        rules={[{ required: !initialValues._id, message: 'Vui lòng nhập mật khẩu', min: 6 }]}
      >
        <Input.Password placeholder={initialValues._id ? 'Để trống nếu không đổi mật khẩu' : ''} />
      </Form.Item>

      <Form.Item
        label="Họ và tên"
        name="fullName"
        rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item label="Số điện thoại" name="phone">
        <Input />
      </Form.Item>

      <Form.Item label="Địa chỉ" name="address">
        <Input />
      </Form.Item>

      <Form.Item
        label="Vai trò"
        name="roles"
        rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
      >
        <Select mode="multiple" placeholder="Chọn vai trò">
          {roleOptions.map(role => (
            <Option key={role._id} value={role._id}>{role.name}</Option>
          ))}
        </Select>
      </Form.Item>

      <Button type="primary" htmlType="submit">
        Lưu thay đổi
      </Button>
    </Form>
  );
};

export default UserForm;
