import React, { useState, useEffect, useCallback } from 'react';
import { Input, Select, Button, Space, message, Modal, Form } from 'antd';
import AdminLayout from '../../../components/layout/AdminLayout';
import adminProductService from '../../../services/admin/adminProductService';
import useProductAdminData from '../../../hooks/useProductAdminData';
import ProductTable from './ProductTable';
import CreateProductModal from './CreateProductModal';
import EditProductModal from './EditProductModal';
import AddNewButton from '../../../components/common/AddNewButton/AddNewButton';
import '../../../styles/components/admin/ProductAdminView.scss';

const { Search } = Input;

function ProductAdminView() {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const { products, loading, error, refetch } = useProductAdminData(statusFilter, searchTerm);

  const getNextPosition = () => {
    if (products && products.length > 0) {
      const positions = products.map((p) => p.position);
      return Math.max(...positions) + 1;
    }
    return 1;
  };

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
          createForm.setFieldsValue({ imageUrl: '' });
          editForm.setFieldsValue({ imageUrl: '' });
        } catch (error) {
          console.error("Error creating object URL:", error);
        }
      }
    } else {
      setSelectedImageFile(null);
      setPreviewImage(null);
    }
  };

  const handleFeaturedToggle = useCallback(async (productId, newFeatured) => {
    try {
      // Gọi endpoint updateProduct với trường featured
      const updatedProduct = await adminProductService.updateProduct(productId, { featured: newFeatured });
      message.success(`Sản phẩm ${updatedProduct.name} ${newFeatured ? 'được đánh dấu nổi bật' : 'không nổi bật nữa'}`);
      refetch();
    } catch (error) {
      console.error("Error toggling featured:", error);
      message.error("Lỗi khi cập nhật trạng thái nổi bật của sản phẩm");
    }
  }, [refetch]);

  const handleStatusChange = useCallback(async (newStatus, productId) => {
    try {
      const updatedProduct = await adminProductService.updateProductStatus(productId, newStatus);
      message.success(`Trạng thái sản phẩm ${updatedProduct.name} đã được chuyển sang "${newStatus}"`);
      refetch();
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái sản phẩm:', err);
      message.error('Lỗi khi cập nhật trạng thái sản phẩm. Vui lòng thử lại.');
    }
  }, [refetch]);

  const handleDeleteProduct = useCallback((productId) => {
    Modal.confirm({
      title: 'Bạn có chắc chắn muốn xóa sản phẩm này?',
      content: 'Hành động này sẽ xóa sản phẩm vĩnh viễn khỏi hệ thống.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await adminProductService.deleteProduct(productId);
          message.success('Xóa sản phẩm thành công');
          refetch();
        } catch (error) {
          console.error('Lỗi khi xóa sản phẩm:', error);
          message.error('Lỗi khi xóa sản phẩm. Vui lòng thử lại.');
        }
      },
    });
  }, [refetch]);

  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.info('Chưa có sản phẩm nào được chọn.');
      return;
    }
    Modal.confirm({
      title: 'Bạn có chắc chắn muốn xóa các sản phẩm đã chọn?',
      content: 'Hành động này sẽ xóa vĩnh viễn các sản phẩm được chọn khỏi hệ thống.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await adminProductService.batchDeleteProducts(selectedRowKeys);
          message.success('Xóa sản phẩm thành công');
          setSelectedRowKeys([]);
          refetch();
        } catch (error) {
          console.error('Lỗi khi xóa hàng loạt sản phẩm:', error);
          message.error('Lỗi khi xóa sản phẩm. Vui lòng thử lại.');
        }
      },
    });
  };

  const handlePositionChange = useCallback(async (productId, newPosition) => {
    try {
      await adminProductService.updateProductPosition(productId, newPosition);
      message.success('Cập nhật vị trí thành công');
      refetch();
    } catch (error) {
      console.error('Lỗi khi cập nhật vị trí sản phẩm:', error);
      message.error('Lỗi khi cập nhật vị trí sản phẩm. Vui lòng thử lại.');
    }
  }, [refetch]);

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const hasSelected = selectedRowKeys.length > 0;

  const showCreateModal = () => {
    createForm.setFieldsValue({
      position: getNextPosition(),
      imageUrl: '',
      status: 'active',
      featured: false,
    });
    setFileList([]);
    setPreviewImage(null);
    setSelectedImageFile(null);
    setIsCreateModalVisible(true);
  };

  const handleCreateModalCancel = () => {
    setIsCreateModalVisible(false);
    createForm.resetFields();
    setFileList([]);
    setSelectedImageFile(null);
    setPreviewImage(null);
  };

  const handleCreateProduct = async (values) => {
    if (!selectedImageFile && (!values.imageUrl || values.imageUrl.trim() === '')) {
      message.error('Vui lòng chọn file ảnh hoặc nhập URL ảnh');
      return;
    }
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      Object.keys(values).forEach((key) => {
        formData.append(key, values[key]);
      });
      if (selectedImageFile) {
        formData.append('imageFile', selectedImageFile);
      } else if (values.imageUrl) {
        formData.append('imageUrl', values.imageUrl);
      }
      const newProduct = await adminProductService.createProduct(formData);
      message.success(`Tạo sản phẩm ${newProduct.name} thành công`);
      handleCreateModalCancel();
      refetch();
    } catch (error) {
      console.error('Lỗi khi tạo sản phẩm:', error);
      message.error('Lỗi khi tạo sản phẩm. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showEditModal = useCallback((product) => {
    setEditProduct(product);
    editForm.setFieldsValue({
      name: product.name,
      description: product.description,
      price: product.price,
      status: product.status,
      position: product.position,
      featured: product.featured,
      imageUrl: product.image,
    });
    setFileList([]);
    setPreviewImage(null);
    setSelectedImageFile(null);
    setIsEditModalVisible(true);
  }, [editForm]);

  const handleEditModalCancel = () => {
    setIsEditModalVisible(false);
    editForm.resetFields();
    setFileList([]);
    setSelectedImageFile(null);
    setPreviewImage(null);
  };

  const handleEditProduct = async () => {
    try {
      const values = await editForm.validateFields();
      if (!selectedImageFile && (!values.imageUrl || values.imageUrl.trim() === '')) {
        message.error('Vui lòng chọn file ảnh hoặc nhập URL ảnh');
        return;
      }
      setIsSubmitting(true);
      const formData = new FormData();
      Object.keys(values).forEach((key) => {
        formData.append(key, values[key]);
      });
      if (selectedImageFile) {
        formData.append('imageFile', selectedImageFile);
      } else if (values.imageUrl) {
        formData.append('imageUrl', values.imageUrl);
      }
      const updatedProduct = await adminProductService.updateProduct(editProduct._id, formData);
      message.success(`Cập nhật sản phẩm ${updatedProduct.name} thành công`);
      handleEditModalCancel();
      refetch();
    } catch (error) {
      console.error('Lỗi khi cập nhật sản phẩm:', error);
      message.error('Lỗi khi cập nhật sản phẩm. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="product-admin-view">
        <div className="product-admin-header">
          <h1>Quản lý Sản phẩm</h1>
          <Search
            placeholder="Nhập tên sản phẩm..."
            enterButton="Tìm kiếm"
            onSearch={(value) => setSearchTerm(value)}
            style={{ width: 300 }}
          />
        </div>
        <div className="table-filters">
          <Select
            defaultValue="all"
            style={{ width: 150, marginRight: 10 }}
            onChange={(value) => setStatusFilter(value)}
            value={statusFilter}
            options={[
              { value: 'all', label: 'Tất cả trạng thái' },
              { value: 'active', label: 'Đang hoạt động' },
              { value: 'inactive', label: 'Không hoạt động' },
            ]}
          />
        </div>
        <div className="table-actions">
          <Space>
            <AddNewButton onClick={showCreateModal}>
              Thêm sản phẩm
            </AddNewButton>
            <Button type="danger" disabled={!hasSelected} onClick={handleBatchDelete}>
              Xóa hàng loạt
            </Button>
          </Space>
          <span style={{ marginLeft: 8 }}>
            {hasSelected ? `Đã chọn ${selectedRowKeys.length} sản phẩm` : ''}
          </span>
        </div>
        <ProductTable
          products={products}
          loading={loading}
          rowSelection={{ selectedRowKeys, onChange: onSelectChange }}
          onStatusChange={handleStatusChange}
          onFeaturedToggle={handleFeaturedToggle}
          onDelete={handleDeleteProduct}
          onPositionChange={handlePositionChange}
          onEdit={showEditModal}
        />
        {error && <p className="error-message">Lỗi khi tải sản phẩm: {error.message}</p>}
        <CreateProductModal
          visible={isCreateModalVisible}
          onCancel={handleCreateModalCancel}
          onSubmit={handleCreateProduct}
          form={createForm}
          initialValues={{ position: getNextPosition(), imageUrl: '', status: 'active', featured: false }}
          isSubmitting={isSubmitting}
          fileList={fileList}
          handleFileChange={handleFileChange}
          previewImage={previewImage}
        />
        {isEditModalVisible && (
          <EditProductModal
            visible={isEditModalVisible}
            onCancel={handleEditModalCancel}
            onSubmit={handleEditProduct}
            form={editForm}
            initialValues={editProduct}
            isSubmitting={isSubmitting}
            fileList={fileList}
            handleFileChange={handleFileChange}
            previewImage={previewImage}
          />
        )}
      </div>
    </AdminLayout>
  );
}

export default ProductAdminView;
