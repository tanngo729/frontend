import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Typography, Skeleton, Carousel, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import ClientLayout from '../../../components/layout/Client/ClientLayout';
import productService from '../../../services/client/productService';
import bannerService from '../../../services/client/bannerService';
import ProductCard from '../../../components/ProductCard/ProductCard';
import ProductCardSkeleton from '../../../components/Skeleton/ProductCardSkeleton';
import '../../../styles/client/home/HomePage.scss';
import { useAuth } from '../../../context/AuthContext';

const { Title } = Typography;

const HomePage = () => {
  const [banners, setBanners] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bannersRes, productsRes] = await Promise.all([
        bannerService.getBanners(),
        productService.getProductsClient()
      ]);

      setBanners(bannersRes.data);
      const products = productsRes.products || [];

      const featured = products.filter(product => product.featured);
      const latest = [...products]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 8);

      setFeaturedProducts(featured);
      setLatestProducts(latest);
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  const renderBannerSkeleton = () => (
    <div className="home-banner-carousel skeleton-carousel" style={{ marginBottom: 24, width: '100%' }}>
      <div className="banner-item">
        <Skeleton.Image
          active
          style={{ width: '100%', height: 200 }}
        />
      </div>
    </div>
  );

  const renderCarousel = useMemo(() => {
    if (loading) return renderBannerSkeleton();
    if (!banners.length) return null;
    return (
      <Carousel autoplay className="home-banner-carousel">
        {banners.map(banner => (
          <div key={banner._id} className="banner-item">
            <a target="_blank" rel="noopener noreferrer">
              <img
                src={banner.image}
                alt={banner.title || 'Banner ưu đãi'}
                className="banner-image"
              />
            </a>
          </div>
        ))}
      </Carousel>
    );
  }, [banners, loading]);

  const renderProductSection = (title, products) => (
    <div className="product-section" style={{ marginBottom: 40 }}>
      <Title level={2}>{title}</Title>
      {loading ? (
        <Row gutter={[16, 24]}>
          {Array.from({ length: 8 }).map((_, index) => (
            <Col key={index} xs={24} sm={12} md={8} lg={6}>
              <ProductCardSkeleton />
            </Col>
          ))}
        </Row>
      ) : (
        products.length > 0 ? (
          <Row gutter={[16, 16]}>
            {products.map(product => (
              <Col key={product._id} xs={24} sm={12} md={8} lg={6}>
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>
        ) : (
          <p>Không có sản phẩm.</p>
        )
      )}
    </div>
  );

  return (
    <ClientLayout>
      <div className="home-page-container">
        {loading ? (
          <>
            {renderBannerSkeleton()}
            {renderProductSection('Sản phẩm nổi bật', [])}
            {renderProductSection('Sản phẩm mới nhất', [])}
          </>
        ) : (
          <>
            {renderCarousel}
            {renderProductSection('Sản phẩm nổi bật', featuredProducts)}
            {renderProductSection('Sản phẩm mới nhất', latestProducts)}
          </>
        )}
      </div>
    </ClientLayout>
  );
};

export default HomePage;
