import React, { useState, useEffect, useCallback } from 'react';
import { Input, Select, Button, Space, message, Modal, Form } from 'antd';
import AdminLayout from '../../../components/layout/admin/AdminLayout';
import adminProductService from '../../../services/admin/adminProductService';
import useProductAdminData from '../../../hooks/useProductAdminData';
import ProductTable from './ProductTable';
import CreateProductModal from './CreateProductModal';
import EditProductModal from './EditProductModal';
import AddNewButton from '../../../components/common/AddNewButton/AddNewButton';
import '../../../styles/admin/ProductAdminView.scss';

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

  // Sử dụng custom hook để lấy dữ liệu sản phẩm
  const { products, loading, error, refetch } = useProductAdminData(statusFilter, searchTerm);

  // Tìm vị trí tiếp theo cho sản phẩm mới
  const getNextPosition = () => {
    if (products && products.length > 0) {
      const positions = products.map((p) => p.position || 0);
      return Math.max(...positions) + 1;
    }
    return 1;
  };

  // Xử lý khi chọn file ảnh
  const handleFileChange = (info) => {
    const newFileList = info.fileList.slice(-1);
    setFileList(newFileList);

    if (newFileList.length > 0) {
      const file = newFileList[0].originFileObj;
      if (file) {
        // Kiểm tra kích thước file
        if (file.size > 2 * 1024 * 1024) {
          message.error('Kích thước ảnh không được vượt quá 2MB!');
          setFileList([]);
          return;
        }

        // Kiểm tra loại file
        if (!file.type.startsWith('image/')) {
          message.error('Vui lòng chỉ chọn file hình ảnh!');
          setFileList([]);
          return;
        }

        setSelectedImageFile(file);

        try {
          const preview = URL.createObjectURL(file);
          setPreviewImage(preview);
          createForm.setFieldsValue({ imageUrl: '' });
          editForm.setFieldsValue({ imageUrl: '' });
        } catch (error) {
          console.error("Error creating object URL:", error);
          message.error('Lỗi khi tạo xem trước hình ảnh');
        }
      }
    } else {
      setSelectedImageFile(null);
      setPreviewImage(null);
    }
  };

  // Cập nhật trạng thái nổi bật - trả về Promise để xử lý loading
  const handleFeaturedToggle = useCallback(async (productId, newFeatured) => {
    try {
      console.log(`Toggle featured status for product ${productId} to ${newFeatured}`);

      // Sử dụng API riêng để cập nhật trạng thái nổi bật
      const updatedProduct = await adminProductService.updateProductFeatured(productId, newFeatured);

      message.success(
        `Sản phẩm ${updatedProduct.name} ${newFeatured ? 'được đánh dấu nổi bật' : 'không còn nổi bật'}`
      );

      // Cập nhật danh sách sản phẩm sau khi thay đổi
      refetch();
      return updatedProduct;
    } catch (error) {
      console.error("Error toggling featured:", error);

      // Hiển thị thông báo lỗi cụ thể nếu có
      if (error.response && error.response.data && error.response.data.message) {
        message.error(`Lỗi: ${error.response.data.message}`);
      } else {
        message.error("Lỗi khi cập nhật trạng thái nổi bật của sản phẩm");
      }
      throw error;
    }
  }, [refetch]);

  // Cập nhật trạng thái hoạt động
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

  // Xóa một sản phẩm
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

  // Xóa nhiều sản phẩm
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

  // Cập nhật vị trí sản phẩm - trả về Promise để xử lý loading
  const handlePositionChange = useCallback(async (productId, newPosition) => {
    try {
      const result = await adminProductService.updateProductPosition(productId, newPosition);
      message.success('Cập nhật vị trí thành công');
      refetch();
      return result;
    } catch (error) {
      console.error('Lỗi khi cập nhật vị trí sản phẩm:', error);
      message.error('Lỗi khi cập nhật vị trí sản phẩm. Vui lòng thử lại.');
      throw error;
    }
  }, [refetch]);

  // Cập nhật tồn kho
  const handleStockChange = async (productId, newStock) => {
    try {
      const updatedProduct = await adminProductService.updateProductStock(productId, { stock: newStock });
      message.success(`Cập nhật tồn kho của sản phẩm ${updatedProduct.name} thành công`);
      refetch();
    } catch (error) {
      console.error('Lỗi cập nhật tồn kho:', error);
      message.error('Lỗi khi cập nhật tồn kho. Vui lòng thử lại.');
    }
  };

  // Cập nhật giảm giá
  const handleDiscountChange = async (productId, newDiscount) => {
    try {
      const updatedProduct = await adminProductService.updateProductDiscount(productId, {
        discountPercentage: newDiscount
      });
      message.success(`Cập nhật giảm giá của sản phẩm ${updatedProduct.name} thành công (${newDiscount}%)`);
      refetch();
    } catch (error) {
      console.error('Lỗi cập nhật giảm giá:', error);
      message.error('Lỗi khi cập nhật giảm giá. Vui lòng thử lại.');
    }
  };

  // Xử lý chọn hàng trong bảng
  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const hasSelected = selectedRowKeys.length > 0;

  // Hiển thị modal tạo sản phẩm mới
  const showCreateModal = () => {
    createForm.setFieldsValue({
      position: getNextPosition(),
      imageUrl: '',
      status: 'active',
      featured: false,
      discountPercentage: 0,
      stock: 0
    });
    setFileList([]);
    setPreviewImage(null);
    setSelectedImageFile(null);
    setIsCreateModalVisible(true);
  };

  // Đóng modal tạo sản phẩm
  const handleCreateModalCancel = () => {
    setIsCreateModalVisible(false);
    createForm.resetFields();
    setFileList([]);
    setSelectedImageFile(null);
    setPreviewImage(null);
  };

  // Tạo sản phẩm mới
  const handleCreateProduct = async (values) => {
    // Kiểm tra xem có ảnh hoặc URL ảnh không
    if (!selectedImageFile && (!values.imageUrl || values.imageUrl.trim() === '')) {
      message.error('Vui lòng chọn file ảnh hoặc nhập URL ảnh');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();

      // Thêm các trường vào formData
      Object.keys(values).forEach((key) => {
        if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key]);
        }
      });

      // Thêm file ảnh nếu có
      if (selectedImageFile) {
        formData.append('imageFile', selectedImageFile);
      }

      // Gọi API tạo sản phẩm
      const newProduct = await adminProductService.createProduct(formData);
      message.success(`Tạo sản phẩm ${newProduct.name} thành công`);
      handleCreateModalCancel();
      refetch();
    } catch (error) {
      console.error('Lỗi khi tạo sản phẩm:', error);
      message.error(error.message || 'Lỗi khi tạo sản phẩm. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hiển thị modal chỉnh sửa sản phẩm
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
      category: product.category,
      stock: product.stock || 0,
      discountPercentage: product.discountPercentage || 0,
    });
    setFileList([]);
    setPreviewImage(product.image);
    setSelectedImageFile(null);
    setIsEditModalVisible(true);
  }, [editForm]);

  // Đóng modal chỉnh sửa
  const handleEditModalCancel = () => {
    setIsEditModalVisible(false);
    editForm.resetFields();
    setFileList([]);
    setSelectedImageFile(null);
    setPreviewImage(null);
    setEditProduct(null);
  };

  // Cập nhật sản phẩm
  const handleEditProduct = async () => {
    try {
      const values = await editForm.validateFields();

      // Kiểm tra nếu không có file ảnh mới và không có URL ảnh
      if (!selectedImageFile && (!values.imageUrl || values.imageUrl.trim() === '') && !editProduct.image) {
        message.error('Vui lòng chọn file ảnh hoặc nhập URL ảnh');
        return;
      }

      setIsSubmitting(true);
      const formData = new FormData();

      // Thêm các trường vào formData
      Object.keys(values).forEach((key) => {
        if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key]);
        }
      });

      // Thêm file ảnh nếu có
      if (selectedImageFile) {
        formData.append('imageFile', selectedImageFile);
      }

      // Gọi API cập nhật sản phẩm
      const updatedProduct = await adminProductService.updateProduct(editProduct._id, formData);
      message.success(`Cập nhật sản phẩm ${updatedProduct.name} thành công`);
      handleEditModalCancel();
      refetch();
    } catch (error) {
      console.error('Lỗi khi cập nhật sản phẩm:', error);
      message.error(error.message || 'Lỗi khi cập nhật sản phẩm. Vui lòng thử lại.');
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
          <span className="selected-count">
            {hasSelected ? `Đã chọn ${selectedRowKeys.length} sản phẩm` : ''}
          </span>
        </div>

        <ProductTable
          products={products}
          loading={loading}
          rowSelection={rowSelection}
          onStatusChange={handleStatusChange}
          onFeaturedToggle={handleFeaturedToggle}
          onStockChange={handleStockChange}
          onDiscountChange={handleDiscountChange}
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