import React, { useEffect, useState } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { Spin, message, Empty, Row, Col } from 'antd';
import productService from '../../../services/client/productService';
import ProductCard from '../../../components/ProductCard/ProductCard';
import ClientLayout from '../../../components/layout/Client/ClientLayout';
import './SearchResults.scss';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchResults = () => {
  const query = useQuery();
  const searchTerm = query.get('q') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await productService.getProductsClient({ q: searchTerm });
        setProducts(res.products || []);
      } catch (err) {
        setError(err);
        message.error('Lỗi khi tải kết quả tìm kiếm');
      } finally {
        setLoading(false);
      }
    };

    if (searchTerm) {
      fetchSearchResults();
    }
  }, [searchTerm]);

  if (!searchTerm) {
    return <Navigate to="/products" replace />;
  }

  let content;
  if (loading) {
    content = (
      <div className="loading-container">
        <Spin size="large" tip="">
          <div />
        </Spin>
      </div>
    );
  } else if (error) {
    content = <p>Lỗi: {error.message}</p>;
  } else if (!products || products.length === 0) {
    content = <Empty description="Không tìm thấy sản phẩm nào" />;
  } else {
    content = (
      <Row gutter={[16, 16]}>
        {products.map(product => (
          <Col key={product._id} xs={24} sm={12} md={8} lg={6}>
            <ProductCard product={product} onAddToCart={() => { }} />
          </Col>
        ))}
      </Row>
    );
  }

  return <>
    <ClientLayout>
      <div className="search-results">
        <h1>Kết quả tìm kiếm cho "{searchTerm}"</h1>
        {content}
      </div>
    </ClientLayout>;
  </>
};

export default SearchResults;
