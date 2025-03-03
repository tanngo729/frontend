// src/views/client/ProductDetailView.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Image, Spin, message, Rate, Button } from 'antd';
import ClientLayout from '../../../components/layout/ClientLayout';
import productService from '../../../services/client/productService';


const ProductDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProductDetail = async () => {
      setLoading(true);
      try {
        const data = await productService.getProductDetail(id);
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

  if (loading) return <Spin style={{ display: 'block', textAlign: 'center', marginTop: 50 }} />;
  if (!product) return <p style={{ textAlign: 'center', marginTop: 50 }}>Không tìm thấy sản phẩm</p>;

  return (
    <ClientLayout>
      <div className="product-detail-view">
        <Card
          title={product.name}
          extra={<Button onClick={() => navigate(-1)}>Back</Button>}
          style={{ maxWidth: 800, margin: '20px auto' }}
        >
          <Image
            src={product.image || "https://via.placeholder.com/600x400"}
            alt={product.name}
            width={600}
            style={{ marginBottom: 20 }}
          />
          <p><strong>Mô tả:</strong> {product.description}</p>
          <p><strong>Giá:</strong> {product.price} VNĐ</p>
          <div>
            <strong>Đánh giá:</strong>
            <Rate disabled allowHalf defaultValue={product.rating || 4} />
            <div style={{ marginLeft: 8 }}>({product.ratingCount || 0} lượt đánh giá)</div>
          </div>
        </Card>
      </div>
    </ClientLayout>
  );
};

export default ProductDetailView;
