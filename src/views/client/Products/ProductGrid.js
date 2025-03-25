import React from 'react';
import { Row, Col, Pagination, Empty, Alert, message } from 'antd';
import ProductCard from '../../../components/ProductCard/ProductCard';
import ProductCardSkeleton from '../../../components/Skeleton/ProductCardSkeleton';
import '../../../styles/client/products/ProductGrid.scss';
import cartService from '../../../services/client/cartService';
import { useAuth } from '../../../context/AuthContext';

const ProductGrid = ({
  loading,
  error,
  products,
  totalProducts,
  currentPage,
  setCurrentPage,
  pageSize,
  setPageSize,
}) => {
  const { user } = useAuth();

  if (loading) {
    return (
      <div className="product-grid-container">
        <Row gutter={[16, 24]}>
          {Array.from({ length: 8 }).map((_, index) => (
            <Col key={index} xs={24} sm={12} md={8} lg={8}>
              <ProductCardSkeleton />
            </Col>
          ))}
        </Row>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Lỗi"
        description="Không thể tải danh sách sản phẩm. Vui lòng thử lại sau."
        type="error"
        showIcon
      />
    );
  }

  if (!products || products.length === 0) {
    return <Empty description="Không tìm thấy sản phẩm nào" />;
  }

  const handleAddToCart = async (prod) => {
    if (!user || !user._id) {
      message.warning('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      return;
    }

    try {
      await cartService.addToCart({
        userId: user._id,
        productId: prod._id,
        quantity: 1,
      });
      message.success(`Đã thêm ${prod.name} vào giỏ hàng`);
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm vào giỏ hàng:", error);
      message.error("Lỗi khi thêm sản phẩm vào giỏ hàng");
    }
  };

  return (
    <div className="product-grid-container">
      <Row gutter={[16, 24]}>
        {products.map((product) => (
          <Col key={product._id} xs={24} sm={12} md={8} lg={8}>
            <ProductCard
              product={product}
              onAddToCart={() => handleAddToCart(product)}
              onQuickView={() => { }} // Implement if needed
              onAddToWishlist={() => { }} // Implement if needed
            />
          </Col>
        ))}
      </Row>

      <div className="product-grid-pagination">
        <Pagination
          current={currentPage}
          total={totalProducts}
          pageSize={pageSize}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger
          pageSizeOptions={['12', '24', '36', '48']}
          onShowSizeChange={(current, size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} sản phẩm`}
        />
      </div>
    </div>
  );
};

export default ProductGrid;
