import React, { useState, useEffect } from 'react';
import { message, Typography, Drawer, Space, Tag, Button } from 'antd';
import { FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import ClientLayout from '../../../components/layout/Client/ClientLayout';
import productService from '../../../services/client/productService';
import FilterSidebar from './FilterSidebar';
import ProductGrid from './ProductGrid';
import '../../../styles/client/products/ProductListPage.scss';

const { Title } = Typography;

const ProductListPage = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isOnSale, setIsOnSale] = useState(false);
  const [inStock, setInStock] = useState(false);

  const [sortOption, setSortOption] = useState('newest');
  const [tempSortOption, setTempSortOption] = useState('newest');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const defaultPriceRange = [0, 500000];
  const [priceRange, setPriceRange] = useState(defaultPriceRange);
  const [selectedPriceRange, setSelectedPriceRange] = useState(defaultPriceRange);

  // State hiển thị Drawer trên mobile
  const [mobileFiltersVisible, setMobileFiltersVisible] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {
        page: currentPage,
        limit: pageSize,
      };
      if (selectedCategory !== 'all') filters.category = selectedCategory;
      if (selectedPriceRange[0] !== null) filters.minPrice = selectedPriceRange[0];
      if (selectedPriceRange[1] !== null) filters.maxPrice = selectedPriceRange[1];
      if (isOnSale) filters.onSale = true;
      if (inStock) filters.inStock = true;

      filters.sortBy = sortOption === 'newest'
        ? 'createdAt'
        : sortOption === 'popularity'
          ? 'sold'
          : 'price';

      filters.order = sortOption === 'priceAsc' ? 'asc' : 'desc';

      const response = await productService.getProductsClient(filters);
      setAllProducts(response.products);
      setTotalProducts(response.pagination.total);
    } catch (err) {
      setError(err);
      message.error('Lỗi khi tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [
    currentPage,
    pageSize,
    selectedCategory,
    selectedPriceRange,
    isOnSale,
    inStock,
    sortOption
  ]);

  const handlePriceChange = (value) => {
    setSelectedPriceRange(value);
  };

  const applyFilters = () => {
    setSortOption(tempSortOption);
    setCurrentPage(1);
    fetchProducts();
    setMobileFiltersVisible(false);
  };

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedPriceRange(defaultPriceRange);
    setTempSortOption('newest');
    setSortOption('newest');
    setCurrentPage(1);
    setIsOnSale(false);
    setInStock(false);
    fetchProducts();
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    (
      (selectedPriceRange[0] !== priceRange[0] || selectedPriceRange[1] !== priceRange[1]) &&
      selectedPriceRange[0] !== null &&
      selectedPriceRange[1] !== null
    ) ||
    isOnSale ||
    inStock ||
    sortOption !== 'newest';

  const getSortOptionLabel = (option) => {
    switch (option) {
      case 'priceAsc': return 'Giá tăng dần';
      case 'priceDesc': return 'Giá giảm dần';
      case 'popularity': return 'Phổ biến nhất';
      case 'discount': return 'Giảm giá nhiều';
      default: return 'Mới nhất';
    }
  };

  return (
    <ClientLayout>
      <div className="product-list-page">
        <div className="product-list-header">
          <Title level={1}>Danh sách sản phẩm</Title>

          <div className="product-list-actions">
            <Button
              className="filter-toggle-btn"
              icon={<FilterOutlined />}
              onClick={() => setMobileFiltersVisible(true)}
              type="primary"
            >
              Bộ lọc
            </Button>
          </div>
        </div>

        <Drawer
          open={mobileFiltersVisible}
          onClose={() => setMobileFiltersVisible(false)}
          placement="right"
          width={320}
          maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
          className="mobile-filter-drawer"
        >
          <FilterSidebar
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            tempSortOption={tempSortOption}
            setTempSortOption={setTempSortOption}
            priceRange={priceRange}
            selectedPriceRange={selectedPriceRange}
            handlePriceChange={handlePriceChange}
            isOnSale={isOnSale}
            setIsOnSale={setIsOnSale}
            inStock={inStock}
            setInStock={setInStock}
            resetFilters={resetFilters}
            applyFilters={applyFilters}
            isMobile
          />
        </Drawer>

        <div className="active-filters">
          <Space size={[0, 8]} wrap>
            {selectedCategory !== 'all' && (
              <Tag closable onClose={() => setSelectedCategory('all')} color="blue">
                Danh mục: {selectedCategory}
              </Tag>
            )}
            {(selectedPriceRange[0] !== priceRange[0] ||
              selectedPriceRange[1] !== priceRange[1]) && (
                <Tag
                  closable
                  onClose={() => setSelectedPriceRange(defaultPriceRange)}
                  color="green"
                >
                  Giá: {selectedPriceRange[0].toLocaleString()}đ - {selectedPriceRange[1].toLocaleString()}đ
                </Tag>
              )}
            {isOnSale && (
              <Tag closable onClose={() => setIsOnSale(false)} color="red">
                Đang giảm giá
              </Tag>
            )}
            {inStock && (
              <Tag closable onClose={() => setInStock(false)} color="orange">
                Còn hàng
              </Tag>
            )}
            {sortOption !== 'newest' && (
              <Tag
                closable
                onClose={() => {
                  setTempSortOption('newest');
                  setSortOption('newest');
                }}
                color="purple"
              >
                Sắp xếp: {getSortOptionLabel(sortOption)}
              </Tag>
            )}
            {hasActiveFilters && (
              <Button
                size="small"
                onClick={resetFilters}
                icon={<ReloadOutlined />}
              >
                Xóa tất cả
              </Button>
            )}
          </Space>
        </div>

        <div className="product-list-content with-sidebar">
          <div className="sidebar-container">
            <FilterSidebar
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              tempSortOption={tempSortOption}
              setTempSortOption={setTempSortOption}
              priceRange={priceRange}
              selectedPriceRange={selectedPriceRange}
              handlePriceChange={handlePriceChange}
              isOnSale={isOnSale}
              setIsOnSale={setIsOnSale}
              inStock={inStock}
              setInStock={setInStock}
              resetFilters={resetFilters}
              applyFilters={applyFilters}
              isMobile={false}
            />
          </div>

          <div className="product-grid grid-view">
            <ProductGrid
              loading={loading}
              error={error}
              products={allProducts}
              totalProducts={totalProducts}
              fetchProducts={fetchProducts}
              resetFilters={resetFilters}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              pageSize={pageSize}
              setPageSize={setPageSize}
            />
          </div>
        </div>
      </div>
    </ClientLayout>
  );
};

export default ProductListPage;
