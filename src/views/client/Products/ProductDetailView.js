import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Image, Spin, message, Rate, Button, Typography, Space } from 'antd';
import ClientLayout from '../../../components/layout/Client/ClientLayout';
import productService from '../../../services/client/productService';
import styles from '../../../styles/client/products/ProductDetailView.module.scss';

const { Title, Text } = Typography;

const ProductDetailView = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userRating, setUserRating] = useState(0); // State để lưu đánh giá của người dùng

  // Fetch product details by slug
  useEffect(() => {
    const fetchProductDetail = async () => {
      setLoading(true);
      try {
        const data = await productService.getProductDetailBySlug(slug);
        setProduct(data);
        // Nếu sản phẩm có rating từ backend, bạn có thể set giá trị mặc định ở đây
        setUserRating(data.rating || 0);
      } catch (error) {
        console.error("Error fetching product detail:", error);
        message.error("Lỗi khi lấy thông tin sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [slug]);

  // Giả lập chức năng thêm sản phẩm vào giỏ hàng
  const handleAddToCart = () => {
    message.success("Sản phẩm đã được thêm vào giỏ hàng");
  };

  // Xử lý khi người dùng thay đổi đánh giá
  const handleRatingChange = (value) => {
    setUserRating(value);
  };

  // Giả lập gửi đánh giá
  const submitRating = () => {
    // Ở đây bạn có thể gọi API cập nhật đánh giá của người dùng cho sản phẩm
    message.success(`Cảm ơn bạn đã đánh giá sản phẩm với ${userRating} sao`);
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className={styles.loadingState}>
          <Spin size="large" tip="Đang tải sản phẩm..." />
        </div>
      </ClientLayout>
    );
  }

  if (!product) {
    return (
      <ClientLayout>
        <div className={styles.errorState}>
          <Title level={4}>Không tìm thấy sản phẩm</Title>
          <Button type="primary" className={styles.backButton} onClick={() => navigate(-1)}>
            Quay lại
          </Button>
        </div>
      </ClientLayout>
    );
  }

  // Tính giá đã giảm nếu có giảm giá
  const discountedPrice =
    product.discountPercentage > 0
      ? Math.round(product.price * (1 - product.discountPercentage / 100))
      : null;

  return (
    <ClientLayout>
      <div className={styles.productDetailContainer}>
        <Card
          className={styles.productCard}
          title={<Title level={4}>{product.name}</Title>}
          extra={
            <Button type="primary" className={styles.backButton} onClick={() => navigate(-1)}>
              Quay lại
            </Button>
          }
        >
          <Image
            className={styles.productImage}
            src={product.image || "https://via.placeholder.com/600x400"}
            alt={product.name}
            preview={false}
          />

          <div className={styles.infoSection}>
            <div className={styles.productDescription}>
              <Text strong>Mô tả: </Text>
              <Text>{product.description || "Chưa có mô tả cho sản phẩm này."}</Text>
            </div>

            <div className={styles.priceSection}>
              <Text strong>Giá: </Text>
              {discountedPrice ? (
                <>
                  <Text className={styles.originalPrice}>
                    {product.price.toLocaleString()} VNĐ
                  </Text>
                  <Text className={styles.discountedPrice}>
                    {discountedPrice.toLocaleString()} VNĐ
                  </Text>
                </>
              ) : (
                <Text className={styles.priceValue}>
                  {product.price.toLocaleString()} VNĐ
                </Text>
              )}
            </div>

            <div className={styles.ratingSection}>
              <Text strong>Đánh giá: </Text>
              <Rate disabled allowHalf defaultValue={product.rating || 0} />
              <Text>({product.ratingCount || 0} lượt đánh giá)</Text>
            </div>

            <div className={styles.actionSection}>
              <Space direction="vertical" size="middle">
                <Button type="primary" onClick={handleAddToCart}>
                  Thêm vào giỏ hàng
                </Button>
                <div className={styles.submitRating}>
                  <Text strong>Đánh giá sản phẩm: </Text>
                  <Rate allowHalf value={userRating} onChange={handleRatingChange} />
                  <Button type="primary" onClick={submitRating}>
                    Gửi đánh giá
                  </Button>
                </div>
              </Space>
            </div>
          </div>
        </Card>
      </div>
    </ClientLayout>
  );
};

export default ProductDetailView;
