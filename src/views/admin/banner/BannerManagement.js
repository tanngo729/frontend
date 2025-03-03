// src/views/admin/BannerManagement.jsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Upload, Image, Space, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import AdminLayout from '../../../components/layout/AdminLayout';
import bannerService from '../../../services/admin/bannerService';

const BannerManagement = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hàm load danh sách banner
  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await bannerService.getBanners();
      setBanners(res.data);
    } catch (error) {
      console.error('Error fetching banners:', error);
      message.error('Lỗi khi tải banner');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Xử lý file upload
  const handleFileChange = (info) => {
    const newFileList = info.fileList.slice(-1);
    setFileList(newFileList);
    if (newFileList.length > 0) {
      const file = newFileList[0].originFileObj;
      if (file) {
        setSelectedImageFile(file);
        try {
          const preview = URL.createObjectURL(file);
          setPreviewImage(preview);
          form.setFieldsValue({ imageUrl: '' });
        } catch (error) {
          console.error("Error creating object URL:", error);
        }
      }
    } else {
      setSelectedImageFile(null);
      setPreviewImage(null);
    }
  };

  // Mở modal tạo/chỉnh sửa banner
  const openModal = (banner = null) => {
    setEditingBanner(banner);
    if (banner) {
      form.setFieldsValue({
        title: banner.title,
        link: banner.link, // Không bắt buộc nhập link
        position: banner.position,
        imageUrl: banner.image,
      });
    } else {
      form.resetFields();
    }
    setFileList([]);
    setPreviewImage(null);
    setSelectedImageFile(null);
    setModalVisible(true);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    form.resetFields();
    setFileList([]);
    setPreviewImage(null);
    setSelectedImageFile(null);
  };

  // Xử lý submit form (tạo/chỉnh sửa banner)
  const handleFormSubmit = async (values) => {
    // Không bắt buộc phải có link, chỉ kiểm tra nếu có
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      Object.keys(values).forEach((key) => {
        formData.append(key, values[key]);
      });
      if (selectedImageFile) {
        formData.append('imageFile', selectedImageFile);
      } else {
        formData.append('imageUrl', values.imageUrl);
      }
      if (editingBanner) {
        await bannerService.updateBanner(editingBanner._id, formData);
        message.success('Cập nhật banner thành công');
      } else {
        await bannerService.createBanner(formData);
        message.success('Tạo banner thành công');
      }
      handleModalCancel();
      fetchBanners();
    } catch (error) {
      console.error('Error submitting banner:', error);
      message.error('Lỗi khi lưu banner. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xóa banner
  const handleDeleteBanner = (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa banner này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await bannerService.deleteBanner(id);
          message.success('Xóa banner thành công');
          fetchBanners();
        } catch (error) {
          console.error('Error deleting banner:', error);
          message.error('Lỗi khi xóa banner');
        }
      },
    });
  };

  // Định nghĩa các cột cho bảng hiển thị banner
  const columns = [
    {
      title: 'Ảnh Banner',
      dataIndex: 'image',
      key: 'image',
      render: (text) => (
        <img
          src={text || 'https://via.placeholder.com/300x200'}
          alt="Banner"
          style={{ width: '150px', height: '100px', objectFit: 'cover' }}
        />
      ),
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Link',
      dataIndex: 'link',
      key: 'link',
      render: (text) => text ? (
        <a href={text} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      ) : '-',
    },
    {
      title: 'Vị trí',
      dataIndex: 'position',
      key: 'position',
      render: (text, record) => (
        <InputNumber
          defaultValue={text}
          onBlur={(e) => {
            const newPosition = Number(e.target.value);
            if (newPosition !== record.position) {
              bannerService.updateBannerPosition(record._id, newPosition)
                .then(() => {
                  message.success('Cập nhật vị trí thành công');
                  fetchBanners();
                })
                .catch(err => {
                  message.error('Lỗi khi cập nhật vị trí');
                });
            }
          }}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (text, record) => (
        <Space>
          <Button onClick={() => openModal(record)}>Chỉnh sửa</Button>
          <Button danger onClick={() => handleDeleteBanner(record._id)}>Xóa</Button>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="banner-management" style={{ padding: '24px' }}>
        <h1>Quản lý Banner</h1>
        <Button type="primary" onClick={() => openModal()} style={{ marginBottom: '16px' }}>
          Thêm Banner
        </Button>
        <Table
          dataSource={banners}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />

        <Modal
          title={editingBanner ? "Chỉnh sửa Banner" : "Thêm Banner"}
          open={modalVisible}
          onCancel={handleModalCancel}
          footer={null}
        >
          <Form layout="vertical" form={form} onFinish={handleFormSubmit}>
            <Form.Item
              name="title"
              label="Tiêu đề"
              rules={[{ required: true, message: 'Vui lòng nhập tiêu đề banner' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="link"
              label="Link"
              // Không bắt buộc nhập link, chỉ kiểm tra nếu có giá trị
              rules={[
                {
                  type: 'url',
                  message: 'Link không hợp lệ',
                  transform: (value) => (value ? value.trim() : value),
                },
              ]}
            >
              <Input placeholder="Nhập link banner (không bắt buộc)" />
            </Form.Item>
            <Form.Item
              name="position"
              label="Vị trí"
              rules={[
                { required: true, message: 'Vui lòng nhập vị trí banner' },
                { type: 'number', message: 'Vui lòng nhập số' }
              ]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="Ảnh Banner">
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
                  Lưu
                </Button>
                <Button onClick={handleModalCancel}>Hủy</Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default BannerManagement;
