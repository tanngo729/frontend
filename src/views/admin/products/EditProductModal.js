import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Switch, Select, Space, Upload, Image, Button, message, Spin } from 'antd';
import { UploadOutlined, LoadingOutlined } from '@ant-design/icons';
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
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Load danh mục từ API
  const fetchCategories = async () => {
    if (!visible) return;

    try {
      setLoadingCategories(true);
      const response = await categoryService.getCategories({ page: 1, limit: 1000 });

      // Xử lý response theo cấu trúc thực tế từ API
      if (response && response.data && Array.isArray(response.data.data)) {
        setCategories(response.data.data);
      } else {
        console.error("Unexpected category data structure:", response);
        message.error("Lỗi cấu trúc dữ liệu danh mục");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      message.error("Lỗi khi tải danh mục");
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [visible]);

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Bạn chỉ có thể tải lên file hình ảnh!');
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Hình ảnh phải nhỏ hơn 2MB!');
    }

    return false; // Return false to prevent auto upload
  };

  return (
    <Modal
      title="Chỉnh sửa sản phẩm"
      open={visible}
      footer={null}
      onCancel={onCancel}
      maskClosable={false}
      destroyOnClose={true}
      width={600}
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={onSubmit}
        initialValues={initialValues}
        encType="multipart/form-data"
      >
        <Form.Item
          name="name"
          label="Tên sản phẩm"
          rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
        >
          <Input placeholder="Nhập tên sản phẩm" maxLength={200} showCount />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả"
          rules={[{ required: true, message: 'Vui lòng nhập mô tả sản phẩm' }]}
        >
          <Input.TextArea rows={3} placeholder="Nhập mô tả sản phẩm" maxLength={1000} showCount />
        </Form.Item>

        <Form.Item
          name="category"
          label="Danh mục"
          rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
        >
          {loadingCategories ? (
            <div style={{ textAlign: 'center', padding: '10px' }}>
              <Spin size="small" /> <span style={{ marginLeft: '10px' }}>Đang tải danh mục...</span>
            </div>
          ) : (
            <Select placeholder="Chọn danh mục">
              {categories.map((cat) => (
                <Option key={cat._id} value={cat._id}>{cat.name}</Option>
              ))}
            </Select>
          )}
        </Form.Item>

        <Form.Item
          name="price"
          label="Giá"
          rules={[{ required: true, message: 'Vui lòng nhập giá sản phẩm' }]}
        >
          <InputNumber
            min={0}
            style={{ width: '100%' }}
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/\$\s?|(,*)/g, '')}
            placeholder="Nhập giá sản phẩm"
          />
        </Form.Item>

        <Form.Item
          name="stock"
          label="Số lượng tồn"
          rules={[{ required: true, message: 'Vui lòng nhập số lượng tồn' }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} placeholder="Nhập số lượng tồn" />
        </Form.Item>

        <Form.Item
          name="discountPercentage"
          label="Phần trăm giảm giá"
          rules={[{ required: true, message: 'Vui lòng nhập phần trăm giảm giá' }]}
        >
          <InputNumber
            min={0}
            max={100}
            style={{ width: '100%' }}
            formatter={value => `${value}%`}
            parser={value => value.replace('%', '')}
            placeholder="Nhập phần trăm giảm giá"
          />
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
          <InputNumber min={1} style={{ width: '100%' }} placeholder="Nhập vị trí sản phẩm" />
        </Form.Item>

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
            {previewImage && (
              <div style={{ marginBottom: '10px' }}>
                <p>Ảnh hiện tại:</p>
                <Image
                  src={previewImage}
                  alt="Current Image"
                  width={100}
                  style={{ marginTop: 8 }}
                />
              </div>
            )}

            <Upload
              name="imageFile"
              fileList={fileList}
              beforeUpload={beforeUpload}
              onChange={handleFileChange}
              maxCount={1}
              listType="picture"
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>Chọn file ảnh mới</Button>
            </Upload>

            {fileList.length === 0 && (
              <Form.Item
                name="imageUrl"
                noStyle
              >
                <Input placeholder="Hoặc nhập URL ảnh mới" />
              </Form.Item>
            )}
          </Space>
        </Form.Item>

        <Form.Item style={{ marginTop: '20px', textAlign: 'right' }}>
          <Space>
            <Button onClick={onCancel}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              Lưu thay đổi
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditProductModal;