import React, { useState, useEffect } from 'react';
import { Spin, Empty, message, Select } from 'antd';
import categoryService from "../../services/client/categoryService";
import styles from './CategoryFilter.module.scss';

const { Option } = Select;

const CategoryFilter = ({ selectedCategory, onSelectCategory, vertical = false }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const res = await categoryService.getCategories();
        setCategories([
          { _id: 'all', name: 'Tất cả sản phẩm', image: '' },
          ...(res.data || [])
        ]);
      } catch (error) {
        console.error('Error fetching categories:', error);
        message.error('Lỗi khi tải danh mục');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="small" />
      </div>
    );
  }

  if (categories.length === 0) {
    return <Empty description="Không có danh mục" />;
  }

  if (vertical) {
    return (
      <div className={styles.verticalCategoryFilter}>
        <Select
          value={selectedCategory}
          onChange={onSelectCategory}
          placeholder="Chọn danh mục"
          className={styles.categorySelect}
          optionLabelProp="label"
          style={{ width: '100%' }}
        >
          {categories.map((cat) => (
            <Option key={cat._id} value={cat._id} label={cat.name}>
              <div className={styles.selectOptionContent}>
                <span className={styles.categoryName}>{cat.name}</span>
              </div>
            </Option>
          ))}
        </Select>
      </div>
    );
  }

  return (
    <div className={styles.horizontalCategoryFilter}>
      {categories.map((cat) => (
        <div
          key={cat._id}
          className={`${styles.categoryCard} ${selectedCategory === cat._id ? styles.selected : ''}`}
          onClick={() => onSelectCategory(cat._id)}
        >
          <div className={styles.name}>{cat.name}</div>
        </div>
      ))}
    </div>
  );
};

export default CategoryFilter;