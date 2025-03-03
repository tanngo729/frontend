import React from 'react';
import { Table, Image, InputNumber, Space, Button, Tag, Switch } from 'antd';
import { useNavigate } from 'react-router-dom';
import CommonButton from '../../../components/common/buttonActions/CommonButton';

const ProductTable = ({
  products,
  loading,
  rowSelection,
  onStatusChange,
  onFeaturedToggle, // Thêm hàm xử lý toggle nổi bật
  onDelete,
  onPositionChange,
  onEdit,
}) => {
  const navigate = useNavigate();

  const columns = [
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortDirections: ['ascend', 'descend'],
      width: 200,
    },
    {
      title: 'Ảnh',
      dataIndex: 'image',
      key: 'image',
      render: (text, record) => (
        <Image
          src={text || 'https://via.placeholder.com/50x50'}
          alt={record.name}
          width={60}
          height={60}
          fallback="https://via.placeholder.com/50x50"
          className="product-image-cell"
        />
      ),
      width: 80,
      align: 'center',
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (text) => `${text} VNĐ`,
      sorter: (a, b) => a.price - b.price,
      sortDirections: ['ascend', 'descend'],
      width: 100,
      align: 'right',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (text, record) => {
        const isActive = text === 'active';
        return (
          <Tag
            color={isActive ? 'green' : 'red'}
            onClick={() => onStatusChange(isActive ? 'inactive' : 'active', record._id)}
            style={{ cursor: 'pointer' }}
          >
            {isActive ? 'Đang hoạt động' : 'Không hoạt động'}
          </Tag>
        );
      },
      width: 150,
      align: 'center',
    },
    {
      title: 'Nổi bật',
      dataIndex: 'featured',
      key: 'featured',
      render: (featured, record) => (
        <Switch
          checked={featured}
          onChange={(checked) => onFeaturedToggle(record._id, checked)}
        />
      ),
      width: 100,
      align: 'center',
    },
    {
      title: 'Vị trí',
      dataIndex: 'position',
      key: 'position',
      sorter: (a, b) => a.position - b.position,
      sortDirections: ['ascend', 'descend'],
      width: 80,
      align: 'center',
      render: (text, record) => (
        <InputNumber
          defaultValue={record.position}
          onBlur={(e) => {
            const newPosition = Number(e.target.value);
            if (newPosition !== record.position) {
              onPositionChange(record._id, newPosition);
            }
          }}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      fixed: 'right',
      width: 150,
      render: (text, record) => (
        <Space size="middle">
          <CommonButton onClick={() => navigate(`/admin/products/${record._id}`)} className="common-button-primary">
            Chi tiết
          </CommonButton>
          <CommonButton onClick={() => onEdit(record)} className="common-button-edit">
            Sửa
          </CommonButton>
          <CommonButton onClick={() => onDelete(record._id)} className="common-button-danger">
            Xóa
          </CommonButton>
        </Space>
      ),
      align: 'center',
    },
  ];

  return (
    <Table
      rowSelection={rowSelection}
      columns={columns}
      dataSource={products}
      loading={loading}
      rowKey={(record) => record._id}
      size="middle"
      pagination={{ pageSize: 10 }}
    />
  );
};

export default ProductTable;
