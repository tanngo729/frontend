import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Image, Spin, message, Button, Tag } from 'antd';
import AdminLayout from '../../../components/layout/AdminLayout';
import adminProductService from '../../../services/adminProductService';

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
      <Card
        title={`Chi tiết sản phẩm: ${product.name}`}
        extra={
          <div>
            <Button type="primary" onClick={() => navigate(-1)} style={{ marginRight: 8 }}>
              Back
            </Button>
          </div>
        }
        style={{ maxWidth: 800, margin: '20px auto' }}
      >
        <Image
          src={product.image || 'https://via.placeholder.com/400'}
          alt={product.name}
          width={400}  // Hình ảnh lớn hơn
          style={{ marginBottom: 20 }}
        />
        <p><strong>Mô tả:</strong> {product.description}</p>
        <p><strong>Giá:</strong> {product.price} VNĐ</p>
        <p>
          <strong>Trạng thái:</strong>
          <Tag
            color={statusColor}
            style={{ fontSize: '16px', padding: '4px 8px', marginLeft: 8 }}
          >
            {product.status.toUpperCase()}
          </Tag>
        </p>
        <p><strong>Vị trí:</strong> {product.position}</p>
      </Card>
    </AdminLayout>
  );
};

export default AdminProductDetailView;
