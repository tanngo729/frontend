import React, { useState, useEffect } from 'react';
import { Select, Button, Slider, Typography, Radio } from 'antd';
import CategoryFilter from '../../../components/CategoryFilter/CategoryFilter';
import '../../../styles/client/products/FilterSidebar.scss';

const { Text } = Typography;
const { Option } = Select;

const FilterSidebar = ({
  selectedCategory,
  setSelectedCategory,
  tempSortOption,
  setTempSortOption,
  priceRange,
  selectedPriceRange,
  handlePriceChange, // Parent’s function để cập nhật selectedPriceRange
  isOnSale,
  setIsOnSale,
  inStock,
  setInStock,
  resetFilters,
  applyFilters,
  isMobile = false
}) => {
  // Local state lưu trữ các thay đổi của người dùng
  const [localCategory, setLocalCategory] = useState(selectedCategory);
  const [localTempSortOption, setLocalTempSortOption] = useState(tempSortOption);
  const [localPriceRange, setLocalPriceRange] = useState(selectedPriceRange);
  const [localIsOnSale, setLocalIsOnSale] = useState(isOnSale);
  const [localInStock, setLocalInStock] = useState(inStock);

  // Đồng bộ giá trị khi parent cập nhật
  useEffect(() => {
    setLocalCategory(selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    setLocalTempSortOption(tempSortOption);
  }, [tempSortOption]);

  useEffect(() => {
    setLocalPriceRange(selectedPriceRange);
  }, [selectedPriceRange]);

  useEffect(() => {
    setLocalIsOnSale(isOnSale);
  }, [isOnSale]);

  useEffect(() => {
    setLocalInStock(inStock);
  }, [inStock]);

  // Handler cho Slider sử dụng local state
  const handleLocalPriceChange = (value) => {
    setLocalPriceRange(value);
  };

  // Khi người dùng nhấn nút "Áp dụng bộ lọc",
  // chúng ta cập nhật các giá trị của parent bằng giá trị local
  const handleApply = () => {
    setSelectedCategory(localCategory);
    setTempSortOption(localTempSortOption);
    // Giả sử handlePriceChange là setter của parent's selectedPriceRange
    handlePriceChange(localPriceRange);
    setIsOnSale(localIsOnSale);
    setInStock(localInStock);
    // Sau đó gọi hàm applyFilters của parent để cập nhật giao diện, fetch dữ liệu,...
    applyFilters();
  };

  return (
    <div className={`filter-sidebar ${isMobile ? 'mobile-view' : ''}`}>
      <div className="filter-section">
        <h3>Danh mục sản phẩm</h3>
        <CategoryFilter
          selectedCategory={localCategory}
          onSelectCategory={(catId) => {
            setLocalCategory(catId);
          }}
          vertical={true}
        />
      </div>

      <div className="filter-section">
        <h3>Sắp xếp theo</h3>
        <Select
          value={localTempSortOption}
          onChange={(value) => setLocalTempSortOption(value)}
          style={{ width: '100%' }}
        >
          <Option value="newest">Mới nhất</Option>
          <Option value="popularity">Phổ biến nhất</Option>
          <Option value="priceAsc">Giá tăng dần</Option>
          <Option value="priceDesc">Giá giảm dần</Option>
          <Option value="discount">Giảm giá nhiều</Option>
        </Select>
      </div>

      <div className="filter-section">
        <h3>Khoảng giá</h3>
        <Slider
          range
          min={priceRange[0]}
          max={priceRange[1]}
          value={localPriceRange}
          onChange={handleLocalPriceChange}
          tooltip={{
            formatter: (value) => `${value.toLocaleString()} VNĐ`,
          }}
        />
        <div className="price-range-display">
          <Text>{localPriceRange[0].toLocaleString()} VNĐ</Text>
          <Text>{localPriceRange[1].toLocaleString()} VNĐ</Text>
        </div>
      </div>

      <div className="filter-section">
        <h3>Trạng thái</h3>
        <Radio.Group
          value={localIsOnSale ? 'sale' : localInStock ? 'stock' : 'all'}
          onChange={(e) => {
            const val = e.target.value;
            if (val === 'sale') {
              setLocalIsOnSale(true);
              setLocalInStock(false);
            } else if (val === 'stock') {
              setLocalInStock(true);
              setLocalIsOnSale(false);
            } else {
              setLocalIsOnSale(false);
              setLocalInStock(false);
            }
          }}
        >
          <Radio.Button value="all">Tất cả</Radio.Button>
          <Radio.Button value="sale">Đang giảm giá</Radio.Button>
          <Radio.Button value="stock">Còn hàng</Radio.Button>
        </Radio.Group>
      </div>

      <div className="filter-actions">
        <Button
          type="primary"
          block
          size={isMobile ? "large" : "middle"}
          onClick={handleApply}
          style={{ marginBottom: isMobile ? 12 : 8 }}
        >
          Áp dụng bộ lọc
        </Button>
        <Button block size={isMobile ? "large" : "middle"} onClick={resetFilters}>
          Đặt lại
        </Button>
      </div>
    </div>
  );
};

export default FilterSidebar;
