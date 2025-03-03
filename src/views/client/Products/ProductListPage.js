import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientLayout from '../../../components/layout/ClientLayout';
import productService from '../../../services/client/productService';
import { List, Card, Image, Button, Rate, message } from 'antd';
import './ProductListPage.scss';

const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await productService.getProductsClient();
        setProducts(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <p>Đang tải sản phẩm...</p>;
  if (error) return <p>Lỗi khi tải sản phẩm: {error.message}</p>;

  return (
    <ClientLayout>
      <div className="product-list-page">
        <h1>Danh sách sản phẩm</h1>
        <List
          grid={{ gutter: 16, column: 4 }}
          dataSource={products}
          renderItem={(product) => (
            <List.Item>
              <Card
                hoverable
                className="product-card"
                cover={
                  <div className="product-card-image">
                    <Image
                      src={product.image || 'https://via.placeholder.com/300x200'}
                      alt={product.name}
                      fallback="https://via.placeholder.com/300x200"
                      preview={false}
                    />
                  </div>
                }
                actions={[
                  <Button
                    type="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      message.success(`Đã thêm ${product.name} vào giỏ hàng`);
                      // Tích hợp logic thêm vào giỏ hàng tại đây
                    }}
                  >
                    Thêm vào giỏ
                  </Button>,
                  <Rate allowHalf disabled defaultValue={product.rating || 4} />
                ]}
                onClick={() => navigate(`/products/${product._id}`)}
              >
                <Card.Meta
                  title={
                    <div className="product-card-title" onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/products/${product._id}`);
                    }}>
                      {product.name}
                    </div>
                  }
                  description={
                    <div className="product-card-price">
                      {product.discountPercentage > 0 ? (
                        <>
                          <span className="price">{product.price} VNĐ</span>
                          <span className="discount-price">
                            {Math.round(product.price * (1 - product.discountPercentage / 100))} VNĐ
                          </span>
                          <span className="discount-badge">
                            -{product.discountPercentage}%
                          </span>
                        </>
                      ) : (
                        <span>{product.price} VNĐ</span>
                      )}
                    </div>
                  }
                />
              </Card>
            </List.Item>
          )}
        />
      </div>
    </ClientLayout>
  );
};

export default ProductListPage;
