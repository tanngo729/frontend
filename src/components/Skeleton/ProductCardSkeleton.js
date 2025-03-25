import React from 'react';
import { Skeleton } from 'antd';
import styles from '../ProductCard/ProductCard.module.scss';

const ProductCardSkeleton = () => {
  return (
    <div className={styles.productCard}>
      <div
        className={styles.productImage}
        style={{ position: 'relative', paddingTop: '65%' }}
      >
        <Skeleton.Image
          active
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '80%',
          }}
        />
      </div>

      <div className={styles.productContent} style={{ padding: '10px' }}>
        <Skeleton active paragraph={{ rows: 1, width: '40%' }} title={false} />
        <Skeleton active paragraph={{ rows: 1, width: '40%' }} title={false} />
        <Skeleton.Button
          active
          style={{ width: '100%', height: 38, marginTop: 8 }}
        />
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
