import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Switch, Select, Space, Upload, Image, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import categoryService from '../../../services/admin/categoryService';

const { Option } = Select;

const EditProductModal = ({
  visible,
  onCancel,
  onSubmit,
  form,
  initialValues,
  isSubmitting,
  fileList,
  handleFileChange,
  previewImage,
}) => {
  const [categories, setCategories] = useState([]);

  // Load danh mục từ API
  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories({ page: 1, limit: 1000 });
      setCategories(response.data.data);
    } catch (error) {
      message.error("Lỗi khi tải danh mục");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <Modal
      title="Chỉnh sửa sản phẩm"
      open={visible}
      footer={null}
      onCancel={onCancel}
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={onSubmit}
        initialValues={initialValues}
      >
        <Form.Item
          name="name"
          label="Tên sản phẩm"
          rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="description"
          label="Mô tả"
          rules={[{ required: true, message: 'Vui lòng nhập mô tả sản phẩm' }]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item
          name="price"
          label="Giá"
          rules={[{ required: true, message: 'Vui lòng nhập giá sản phẩm' }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          name="status"
          label="Trạng thái"
          rules={[{ required: true, message: 'Vui lòng chọn trạng thái sản phẩm' }]}
        >
          <Select>
            <Select.Option value="active">Đang hoạt động</Select.Option>
            <Select.Option value="inactive">Không hoạt động</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="position"
          label="Vị trí"
          rules={[{ required: true, message: 'Vui lòng nhập vị trí sản phẩm' }]}
        >
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>
        {/* Thêm trường "Sản phẩm nổi bật" */}
        <Form.Item
          name="featured"
          label="Sản phẩm nổi bật"
          valuePropName="checked"
          tooltip="Bật nếu sản phẩm này muốn hiển thị ở phần nổi bật trên trang chủ"
        >
          <Switch />
        </Form.Item>
        <Form.Item label="Ảnh sản phẩm">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Upload
              name="imageFile"
              fileList={fileList}
              beforeUpload={() => false}
              onChange={handleFileChange}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Chọn file để upload</Button>
            </Upload>
            {previewImage && (
              <Image
                src={previewImage}
                alt="Preview"
                width={100}
                style={{ marginTop: 8 }}
              />
            )}
            {fileList.length === 0 && (
              <Form.Item
                name="imageUrl"
                noStyle
                rules={[
                  { required: true, message: 'Vui lòng nhập URL ảnh nếu không chọn file' },
                  { type: 'url', message: 'Vui lòng nhập URL hợp lệ' }
                ]}
              >
                <Input placeholder="Hoặc nhập URL ảnh" />
              </Form.Item>
            )}
          </Space>
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              Lưu thay đổi
            </Button>
            <Button onClick={onCancel}>Hủy</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditProductModal;
