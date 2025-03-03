import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Image, Spin, message, Button, Tag } from 'antd';
import AdminLayout from '../../../components/layout/AdminLayout';
import adminProductService from '../../../services/admin/adminProductService';
import { ArrowLeftOutlined } from '@ant-design/icons';
import '../../../styles/components/admin/AdminProductDetailView.scss'

const AdminProductDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProductDetail = async () => {
      setLoading(true);
      try {
        const data = await adminProductService.getProductDetail(id);
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product detail:", error);
        message.error("Lỗi khi lấy thông tin sản phẩm");
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetail();
  }, [id]);

  if (loading) return <Spin />;
  if (!product) return <p>Không tìm thấy sản phẩm</p>;

  // Sử dụng màu sắc sáng cho trạng thái
  const statusColor = product.status === 'active' ? '#52c41a' : '#f5222d';

  return (
    <AdminLayout>
      <div className="admin-product-detail">
        <Card
          title={`Chi tiết sản phẩm: ${product.name}`}
          extra={
            <Button
              type="primary"
              onClick={() => navigate(-1)}
              icon={<ArrowLeftOutlined />}
            >
              Quay lại
            </Button>
          }
        >
          <Image
            src={product.image || 'https://via.placeholder.com/400'}
            alt={product.name}
            preview={false}
          />
          <p>
            <strong>Mô tả:</strong>
            <span className="description-text">{product.description}</span>
          </p>
          <p>
            <strong>Giá:</strong>
            <span className="price-highlight">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(product.price)}
            </span>
          </p>
          <p>
            <strong>Trạng thái:</strong>
            <Tag color={product.status === 'active' ? 'success' : 'error'}>
              {product.status === 'active' ? 'HOẠT ĐỘNG' : 'NGỪNG HOẠT ĐỘNG'}
            </Tag>
          </p>
          <p>
            <strong>Vị trí:</strong>
            <span className="position-badge">
              #{product.position}
            </span>
          </p>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminProductDetailView;
