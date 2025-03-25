import React, { useState, useCallback } from 'react';
import { Image, Button, Rate, message } from 'antd';
import { ShoppingCartOutlined, HeartOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './ProductCard.module.scss';
import cartService from '../../services/client/cartService';
import { useAuth } from '../../context/AuthContext';

const ProductCard = ({ product, viewMode = 'grid', onQuickView, onAddToWishlist }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = useCallback(async (e) => {
    e.stopPropagation();

    // Kiểm tra nếu sản phẩm hết hàng
    if (product.stock <= 0) {
      message.error('Sản phẩm đã hết hàng');
      return;
    }

    // Kiểm tra nếu chưa đăng nhập
    if (!user) {
      message.warning('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      navigate('/auth/login');
      return;
    }

    setIsAdding(true);
    try {
      // Cách gọi mới - truyền trực tiếp productId và quantity
      await cartService.addToCart(product._id, 1);

      message.success(`Đã thêm ${product.name} vào giỏ hàng`);

      // Sự kiện này không cần thiết nữa vì cartService đã kích hoạt sự kiện
      // Nhưng giữ lại để tương thích với code khác nếu cần
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Lỗi khi thêm sản phẩm vào giỏ hàng:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Lỗi khi thêm sản phẩm vào giỏ hàng');
      }
    } finally {
      setIsAdding(false);
    }
  }, [user, product, navigate]);

  const handleAddToWishlist = (e) => {
    e.stopPropagation();
    onAddToWishlist && onAddToWishlist(product);
  };

  const handleQuickView = (e) => {
    e.stopPropagation();
    onQuickView && onQuickView(product);
  };

  const handleCardClick = () => {
    navigate(`/products/${product.slug || product._id}`);
  };

  // Tính giá sau khi giảm nếu có
  const discountedPrice = product.discountPercentage > 0
    ? Math.round(product.price * (1 - product.discountPercentage / 100))
    : product.price;

  // Hàm format số thành chuỗi có phân cách hàng nghìn
  const formatPrice = (price) => {
    if (price === null || price === undefined) return '0';
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  return (
    <div
      className={`${styles.productCard} ${viewMode === 'list' ? styles.listMode : ''}`}
      onClick={handleCardClick}
      data-testid="product-card"
    >
      <div className={styles.productImage}>
        {product.discountPercentage > 0 && (
          <div className={styles.discountBadge}>
            -{product.discountPercentage}%
          </div>
        )}
        {product.stock <= 0 && (
          <div className={styles.stockBadge}>
            Hết hàng
          </div>
        )}
        <img
          src={product.image || '/placeholder-product.jpg'}
          alt={product.name}
          onError={(e) => {
            e.target.src = '/placeholder-product.jpg';
          }}
        />
        {onQuickView && (
          <Button
            className={styles.quickViewButton}
            onClick={handleQuickView}
            icon={<EyeOutlined />}
          >
            Xem nhanh
          </Button>
        )}
      </div>

      <div className={styles.productContent}>
        {product.category && (
          <div className={styles.productCategory}>
            {product.category.name}
          </div>
        )}

        <h3 className={styles.productTitle}>{product.name}</h3>

        <div className={styles.productPricing}>
          {product.discountPercentage > 0 ? (
            <>
              <span className={styles.currentPrice}>
                {formatPrice(discountedPrice)} VNĐ
              </span>
              <span className={styles.originalPrice}>
                {formatPrice(product.price)} VNĐ
              </span>
            </>
          ) : (
            <span className={styles.currentPrice}>
              {formatPrice(product.price)} VNĐ
            </span>
          )}
        </div>

        {product.rating !== undefined && (
          <div className={styles.productRating}>
            <Rate
              allowHalf
              disabled
              defaultValue={product.rating || 0}
              className={styles.ratingStars}
            />
            <span className={styles.ratingCount}>({product.rating.toFixed(1)})</span>
          </div>
        )}

        {viewMode === 'list' && product.description && (
          <p className={styles.description}>
            {product.description.length > 150
              ? `${product.description.substring(0, 150)}...`
              : product.description}
          </p>
        )}

        <div className={styles.productActions}>
          <Button
            type="primary"
            className={styles.addToCartButton}
            onClick={handleAddToCart}
            icon={<ShoppingCartOutlined />}
            disabled={product.stock <= 0 || isAdding}
            loading={isAdding}
          >
            {product.stock <= 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
          </Button>
        </div>

        {product.stock > 0 && product.stock <= 5 && (
          <div className={styles.stockBadge} style={{ bottom: '10px', top: 'auto' }}>
            Chỉ còn {product.stock} sản phẩm
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;