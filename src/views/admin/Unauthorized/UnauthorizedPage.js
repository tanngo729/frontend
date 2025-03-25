// src/views/admin/UnauthorizedPage.jsx
import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <Result
      status="403"
      title="Truy cập bị từ chối"
      subTitle="Bạn không có quyền truy cập trang này"
      extra={
        <Button
          type="primary"
          onClick={() => navigate('/admin')}
        >
          Quay lại trang chủ
        </Button>
      }
    />
  );
};

export default UnauthorizedPage;