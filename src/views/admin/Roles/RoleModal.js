// frontend/src/views/admin/Roles/RoleModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Space, Select, message } from 'antd';
import roleService from '../../../services/admin/roleService';
import CommonButton from '../../../components/common/buttonActions/CommonButton';


const { Option } = Select;

const RoleModal = ({ visible, onCancel, initialValues = {}, onRoleSaved }) => {
  const [form] = Form.useForm();
  const [roles, setRoles] = useState([]);

  // Lấy danh sách nhóm quyền để chọn nhóm cha (nếu cần)
  const fetchRoles = async () => {
    try {
      const response = await roleService.getRoles();
      setRoles(response.data);
    } catch (error) {
      message.error("Lỗi khi tải danh sách nhóm quyền");
    }
  };

  useEffect(() => {
    fetchRoles();
    if (initialValues && initialValues._id) {
      form.setFieldsValue({
        name: initialValues.name,
        description: initialValues.description,
        parent: initialValues.parent ? initialValues.parent._id : undefined,
      });
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);

  const handleFinish = async (values) => {
    try {
      if (initialValues && initialValues._id) {
        await roleService.updateRole(initialValues._id, values);
        message.success("Cập nhật nhóm quyền thành công");
      } else {
        await roleService.createRole(values);
        message.success("Tạo nhóm quyền thành công");
      }
      onRoleSaved();
      form.resetFields();
    } catch (error) {
      message.error("Lỗi khi lưu nhóm quyền");
    }
  };

  return (
    <Modal
      title={initialValues && initialValues._id ? "Chỉnh sửa nhóm quyền" : "Tạo nhóm quyền mới"}
      open={visible}
      onCancel={onCancel}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="name"
          label="Tên nhóm quyền"
          rules={[{ required: true, message: 'Vui lòng nhập tên nhóm quyền' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Ghi chú">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item name="parent" label="Nhóm cha (nếu có)">
          <Select placeholder="Chọn nhóm cha" allowClear>
            {roles
              .filter(role => !initialValues._id || role._id !== initialValues._id)
              .map(role => (
                <Option key={role._id} value={role._id}>
                  {role.name}
                </Option>
              ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Space>
            <CommonButton type="primary" htmlType="submit" className="common-button-primary">
              Lưu
            </CommonButton>
            <CommonButton onClick={onCancel} className="common-button-danger">
              Hủy
            </CommonButton>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RoleModal;
