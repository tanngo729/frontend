// src/views/client/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Spin, message, Carousel } from 'antd';
import ClientLayout from '../../../components/layout/ClientLayout';
import productService from '../../../services/client/productService';
import bannerService from '../../../services/client/bannerService';

const { Title } = Typography;

const HomePage = () => {
  const [banners, setBanners] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [loadingBanners, setLoadingBanners] = useState(false);
  const [loadingFeatured, setLoadingFeatured] = useState(false);
  const [loadingLatest, setLoadingLatest] = useState(false);

  // Lấy danh sách banner ưu đãi
  const fetchBanners = async () => {
    setLoadingBanners(true);
    try {
      const res = await bannerService.getBanners();
      setBanners(res.data);
    } catch (error) {
      console.error('Error fetching banners:', error);
      message.error('Lỗi khi tải banner ưu đãi');
    } finally {
      setLoadingBanners(false);
    }
  };

  // Lấy danh sách sản phẩm nổi bật
  const fetchFeaturedProducts = async () => {
    setLoadingFeatured(true);
    try {
      const products = await productService.getProductsClient();
      const featured = products.filter(product => product.featured);
      setFeaturedProducts(featured);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      message.error('Lỗi khi tải sản phẩm nổi bật');
    } finally {
      setLoadingFeatured(false);
    }
  };

  // Lấy danh sách sản phẩm mới nhất
  const fetchLatestProducts = async () => {
    setLoadingLatest(true);
    try {
      const products = await productService.getProductsClient();
      // Sắp xếp sản phẩm theo createdAt giảm dần
      const sorted = products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setLatestProducts(sorted);
    } catch (error) {
      console.error('Error fetching latest products:', error);
      message.error('Lỗi khi tải sản phẩm mới nhất');
    } finally {
      setLoadingLatest(false);
    }
  };

  useEffect(() => {
    fetchBanners();
    fetchFeaturedProducts();
    fetchLatestProducts();
  }, []);

  return (
    <ClientLayout>
      <div style={{ padding: '24px' }}>
        {/* Banner ưu đãi */}
        {loadingBanners ? (
          <Spin tip="Đang tải banner ưu đãi..." style={{ marginBottom: '24px' }} />
        ) : (
          banners.length > 0 && (
            <Carousel autoplay style={{ marginBottom: '24px' }}>
              {banners.map(banner => (
                <div key={banner._id}>
                  <a href={banner.link || '#'} target="_blank" rel="noopener noreferrer">
                    <img
                      src={banner.image}
                      alt={banner.title || 'Banner ưu đãi'}
                      style={{ width: '100%', height: '400px', objectFit: 'cover' }}
                    />
                  </a>
                </div>
              ))}
            </Carousel>
          )
        )}

        {/* Sản phẩm nổi bật */}
        <div style={{ marginBottom: '24px' }}>
          <Title level={2}>Sản phẩm nổi bật</Title>
          {loadingFeatured ? (
            <Spin />
          ) : featuredProducts.length > 0 ? (
            <Row gutter={[16, 16]}>
              {featuredProducts.map(product => (
                <Col key={product._id} xs={24} sm={12} md={8} lg={6}>
                  <Card
                    hoverable
                    cover={
                      <img
                        alt={product.name}
                        src={product.image || 'https://via.placeholder.com/300x200'}
                        style={{ height: 200, objectFit: 'cover' }}
                      />
                    }
                  >
                    <Card.Meta title={product.name} description={`${product.price} VNĐ`} />
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <p>Không có sản phẩm nổi bật nào.</p>
          )}
        </div>

        {/* Sản phẩm mới nhất */}
        <div>
          <Title level={2}>Sản phẩm mới nhất</Title>
          {loadingLatest ? (
            <Spin />
          ) : latestProducts.length > 0 ? (
            <Row gutter={[16, 16]}>
              {latestProducts.slice(0, 8).map(product => (
                <Col key={product._id} xs={24} sm={12} md={8} lg={6}>
                  <Card
                    hoverable
                    cover={
                      <img
                        alt={product.name}
                        src={product.image || 'https://via.placeholder.com/300x200'}
                        style={{ height: 200, objectFit: 'cover' }}
                      />
                    }
                  >
                    <Card.Meta title={product.name} description={`${product.price} VNĐ`} />
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <p>Không có sản phẩm mới.</p>
          )}
        </div>
      </div>
    </ClientLayout>
  );
};

export default HomePage;
