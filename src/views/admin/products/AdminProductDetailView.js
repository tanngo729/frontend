import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Image, Spin, message, Button, Tag, Typography, Row, Col, Descriptions, Divider, Space } from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import AdminLayout from '../../../components/layout/admin/AdminLayout';
import adminProductService from '../../../services/admin/adminProductService';
import { useAuthorization } from '../../../hooks/useAuthorization';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import '../../../styles/admin/AdminProductDetailView.scss';

const { Text, Title } = Typography;

const ProductInfo = ({ label, children }) => (
  <Row className="product-info-row" gutter={[8, 8]}>
    <Col xs={24} sm={6}>
      <Text strong>{label}:</Text>
    </Col>
    <Col xs={24} sm={18}>
      {children}
    </Col>
  </Row>
);

const AdminProductDetailView = ({ isEditing = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { can } = useAuthorization();
  const canViewProduct = can('product.detail');
  const canEditProduct = can('product.edit');

  // Ref để ngăn chặn fetch nhiều lần
  const fetchedRef = useRef(false);
  // Ref để theo dõi component đã unmount hay chưa
  const isMountedRef = useRef(true);

  const [state, setState] = useState({
    product: null,
    loading: true,
    error: null
  });

  const { product, loading, error } = state;

  // Định dạng tiền tệ
  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }, []);

  // Định dạng ngày giờ
  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }, []);

  // Fetch thông tin sản phẩm
  const fetchProductDetail = useCallback(async () => {
    // Kiểm tra nếu đã fetch hoặc ID không hợp lệ
    if (fetchedRef.current || !id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return;
    }

    // Đánh dấu đã fetch để ngăn fetch lại
    fetchedRef.current = true;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      console.log("Đang tải thông tin sản phẩm:", id);

      const data = await adminProductService.getProductDetail(id);

      // Kiểm tra component còn mounted không trước khi update state
      if (isMountedRef.current) {
        console.log("Đã nhận dữ liệu sản phẩm");
        setState(prev => ({ ...prev, product: data, loading: false }));
      }
    } catch (error) {
      // Chỉ update state nếu component vẫn mounted
      if (isMountedRef.current) {
        console.error("Lỗi khi lấy thông tin sản phẩm:", error);

        const errorMessage = error.response?.data?.message ||
          error.message ||
          "Không thể tải thông tin sản phẩm";

        setState(prev => ({
          ...prev,
          error: errorMessage,
          loading: false
        }));

        message.error("Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.");
      }
    }
  }, [id]); // chỉ phụ thuộc vào id

  // Kiểm tra quyền và tải dữ liệu
  useEffect(() => {
    isMountedRef.current = true;

    if (isEditing && !canEditProduct) {
      message.error("Bạn không có quyền chỉnh sửa sản phẩm");
      navigate('/admin/products');
      return;
    } else if (!isEditing && !canViewProduct) {
      message.error("Bạn không có quyền xem thông tin sản phẩm");
      navigate('/admin/products');
      return;
    }

    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      setState(prev => ({
        ...prev,
        error: "ID sản phẩm không hợp lệ",
        loading: false
      }));
      return;
    }

    fetchProductDetail();

    return () => {
      isMountedRef.current = false;
      fetchedRef.current = false;
    };
  }, [id, isEditing, canViewProduct, canEditProduct, navigate, fetchProductDetail]);

  // Hàm xử lý nút chỉnh sửa
  const handleEditClick = () => {
    if (!canEditProduct) {
      message.error("Bạn không có quyền chỉnh sửa sản phẩm");
      return;
    }
    navigate(`/admin/products/edit/${id}`);
  };

  // Hiển thị trạng thái đang tải
  if (loading) return (
    <AdminLayout>
      <div className="admin-product-detail loading">
        <Spin size="large" tip="Đang tải thông tin sản phẩm..." />
      </div>
    </AdminLayout>
  );

  // Hiển thị thông báo lỗi
  if (error) return (
    <AdminLayout>
      <div className="admin-product-detail error">
        <Title level={4} type="danger">{error}</Title>
        <Button type="primary" onClick={() => navigate('/admin/products')}>
          Quay lại danh sách sản phẩm
        </Button>
      </div>
    </AdminLayout>
  );

  // Hiển thị khi không tìm thấy sản phẩm
  if (!product) return (
    <AdminLayout>
      <div className="admin-product-detail not-found">
        <Title level={4}>Không tìm thấy sản phẩm</Title>
        <Button type="primary" onClick={() => navigate('/admin/products')}>
          Quay lại danh sách sản phẩm
        </Button>
      </div>
    </AdminLayout>
  );

  // Tính giá sau khi giảm giá
  const discountedPrice = product.discountPercentage && product.discountPercentage > 0
    ? product.price * (1 - product.discountPercentage / 100)
    : null;

  return (
    <AdminLayout>
      <div className="admin-product-detail">
        <Card
          title={
            <div className="card-title">
              <Title level={4}>
                {isEditing ? "Chỉnh sửa sản phẩm: " : "Chi tiết sản phẩm: "}{product.name}
              </Title>
            </div>
          }
          extra={
            <Space>
              {!isEditing && canEditProduct && (
                <Button
                  onClick={handleEditClick}
                  icon={<EditOutlined />}
                  type="primary"
                  ghost
                >
                  Chỉnh sửa
                </Button>
              )}
              <Button
                onClick={() => navigate('/admin/products')}
                icon={<ArrowLeftOutlined />}
                type="primary"
              >
                Quay lại
              </Button>
            </Space>
          }
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <Image
                src={product.image || 'https://via.placeholder.com/400'}
                alt={product.name}
                className="product-image"
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAMAAABlApw1AAAAQlBMVEX..."
              />
              <Divider orientation="left">Thông tin trạng thái</Divider>
              <Descriptions bordered size="small" column={1}>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={product.status === 'active' ? 'success' : 'error'}>
                    {product.status === 'active' ? 'HOẠT ĐỘNG' : 'NGỪNG HOẠT ĐỘNG'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Nổi bật">
                  <Tag color={product.featured ? 'blue' : 'default'}>
                    {product.featured ? 'NỔI BẬT' : 'KHÔNG NỔI BẬT'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Vị trí">
                  <Tag className="position-badge">#{product.position || 'N/A'}</Tag>
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col xs={24} md={16}>
              <Descriptions title="Thông tin sản phẩm" bordered column={1}>
                <Descriptions.Item label="Tên sản phẩm">
                  {product.name}
                </Descriptions.Item>

                <Descriptions.Item label="Danh mục">
                  {product.category ? (
                    typeof product.category === 'object' ? product.category.name : 'Không rõ'
                  ) : 'Không có danh mục'}
                </Descriptions.Item>

                <Descriptions.Item label="Mô tả">
                  <Text className="description-text">{product.description}</Text>
                </Descriptions.Item>

                <Descriptions.Item label="Giá gốc">
                  <Text className="price-highlight">
                    {formatCurrency(product.price)}
                  </Text>
                </Descriptions.Item>

                <Descriptions.Item label="Giảm giá">
                  <Text>{product.discountPercentage || 0}%</Text>
                </Descriptions.Item>

                {discountedPrice && (
                  <Descriptions.Item label="Giá sau giảm">
                    <Text className="price-discount" type="success">
                      {formatCurrency(discountedPrice)}
                    </Text>
                  </Descriptions.Item>
                )}

                <Descriptions.Item label="Tồn kho">
                  <Text>{product.stock || 0} sản phẩm</Text>
                </Descriptions.Item>

                <Descriptions.Item label="Slug">
                  <Text code>{product.slug || 'Chưa có slug'}</Text>
                </Descriptions.Item>

                <Descriptions.Item label="Ngày tạo">
                  {product.createdAt ? formatDate(product.createdAt) : 'N/A'}
                </Descriptions.Item>

                <Descriptions.Item label="Cập nhật lần cuối">
                  {product.updatedAt ? formatDate(product.updatedAt) : 'N/A'}
                </Descriptions.Item>
              </Descriptions>

              {!isEditing && canEditProduct && (
                <div className="action-buttons" style={{ marginTop: '20px', textAlign: 'right' }}>
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={handleEditClick}
                  >
                    Chỉnh sửa sản phẩm
                  </Button>
                </div>
              )}
            </Col>
          </Row>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminProductDetailView;