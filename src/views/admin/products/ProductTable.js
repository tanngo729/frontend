import React, { useState } from 'react';
import { Table, Image, InputNumber, Space, Button, Tag, Switch, Tooltip, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { EditOutlined, DeleteOutlined, EyeOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';

const ProductTable = ({
  products,
  loading,
  rowSelection,
  onStatusChange,
  onFeaturedToggle,
  onStockChange,
  onDiscountChange,
  onDelete,
  onPositionChange,
  onEdit,
}) => {
  const navigate = useNavigate();

  // Các state lưu trạng thái đang chỉnh sửa
  const [editingStock, setEditingStock] = useState({});
  const [editingDiscount, setEditingDiscount] = useState({});
  const [editingPosition, setEditingPosition] = useState({});

  // Thêm state quản lý trạng thái loading cho từng thao tác
  const [loadingFeatured, setLoadingFeatured] = useState({});
  const [loadingPosition, setLoadingPosition] = useState({});

  // Hàm định dạng tiền tệ
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  // Xử lý thay đổi số lượng tồn kho
  const handleStockChange = (productId, value) => {
    setEditingStock({
      ...editingStock,
      [productId]: value
    });
  };

  const handleStockBlur = (productId) => {
    const newStock = editingStock[productId];
    if (newStock !== undefined) {
      onStockChange(productId, newStock);
      setEditingStock({
        ...editingStock,
        [productId]: undefined
      });
    }
  };

  // Xử lý thay đổi phần trăm giảm giá
  const handleDiscountChange = (productId, value) => {
    setEditingDiscount({
      ...editingDiscount,
      [productId]: value
    });
  };

  const handleDiscountBlur = (productId) => {
    const newDiscount = editingDiscount[productId];
    if (newDiscount !== undefined) {
      onDiscountChange(productId, newDiscount);
      setEditingDiscount({
        ...editingDiscount,
        [productId]: undefined
      });
    }
  };

  // Xử lý thay đổi vị trí (đã cải thiện UX)
  const handlePositionChange = (productId, value) => {
    setEditingPosition({
      ...editingPosition,
      [productId]: value
    });
  };

  const handlePositionBlur = (productId) => {
    const newPosition = editingPosition[productId];
    if (newPosition !== undefined) {
      // Đánh dấu đang loading cho vị trí này
      setLoadingPosition({ ...loadingPosition, [productId]: true });

      // Gọi API cập nhật vị trí
      onPositionChange(productId, newPosition)
        .finally(() => {
          // Kết thúc loading sau khi API hoàn thành
          setLoadingPosition({ ...loadingPosition, [productId]: false });

          // Xóa trạng thái đang chỉnh sửa
          setEditingPosition({
            ...editingPosition,
            [productId]: undefined
          });
        });
    }
  };

  // Xử lý toggle nổi bật với chỉ thị loading
  const handleFeaturedToggle = (productId, checked) => {
    // Đánh dấu đang loading cho sản phẩm này
    setLoadingFeatured({ ...loadingFeatured, [productId]: true });

    // Gọi API toggle nổi bật
    onFeaturedToggle(productId, checked)
      .finally(() => {
        // Kết thúc loading sau khi API hoàn thành
        setLoadingFeatured({ ...loadingFeatured, [productId]: false });
      });
  };

  const columns = [
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      width: 200,
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <span>{text}</span>
        </Tooltip>
      ),
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
          preview={{
            mask: <EyeOutlined style={{ fontSize: '16px' }} />,
          }}
        />
      ),
      width: 80,
      align: 'center',
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (text) => formatCurrency(text),
      sorter: (a, b) => a.price - b.price,
      width: 120,
      align: 'right',
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
      key: 'stock',
      sorter: (a, b) => (a.stock || 0) - (b.stock || 0),
      width: 100,
      align: 'center',
      render: (stock, record) => (
        <InputNumber
          defaultValue={stock || 0}
          value={editingStock[record._id] !== undefined ? editingStock[record._id] : stock}
          onChange={(value) => handleStockChange(record._id, value)}
          onBlur={() => handleStockBlur(record._id)}
          onPressEnter={() => handleStockBlur(record._id)}
          min={0}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Giảm giá',
      dataIndex: 'discountPercentage',
      key: 'discountPercentage',
      sorter: (a, b) => (a.discountPercentage || 0) - (b.discountPercentage || 0),
      width: 100,
      align: 'center',
      render: (discount, record) => (
        <InputNumber
          defaultValue={discount || 0}
          value={editingDiscount[record._id] !== undefined ? editingDiscount[record._id] : (discount || 0)}
          min={0}
          max={100}
          formatter={value => `${value}%`}
          parser={value => value.replace('%', '')}
          onChange={(value) => handleDiscountChange(record._id, value)}
          onBlur={() => handleDiscountBlur(record._id)}
          onPressEnter={() => handleDiscountBlur(record._id)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Đang hoạt động', value: 'active' },
        { text: 'Không hoạt động', value: 'inactive' },
      ],
      onFilter: (value, record) => record.status === value,
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
      filters: [
        { text: 'Nổi bật', value: true },
        { text: 'Không nổi bật', value: false },
      ],
      onFilter: (value, record) => record.featured === value,
      render: (featured, record) => (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          {loadingFeatured[record._id] ? (
            <div style={{ position: 'absolute', top: '0', left: '0', right: '0', bottom: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Spin size="small" />
            </div>
          ) : null}
          <Switch
            checked={featured}
            onChange={(checked) => handleFeaturedToggle(record._id, checked)}
            loading={loadingFeatured[record._id]}
            disabled={loadingFeatured[record._id]}
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
          />
        </div>
      ),
      width: 100,
      align: 'center',
    },
    {
      title: 'Vị trí',
      dataIndex: 'position',
      key: 'position',
      sorter: (a, b) => (a.position || 0) - (b.position || 0),
      width: 100,
      align: 'center',
      render: (position, record) => (
        <div style={{ position: 'relative' }}>
          {loadingPosition[record._id] ? (
            <div style={{ position: 'absolute', top: '0', left: '0', right: '0', bottom: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 255, 255, 0.7)', zIndex: 1 }}>
              <Spin size="small" />
            </div>
          ) : null}
          <InputNumber
            defaultValue={position || 0}
            value={editingPosition[record._id] !== undefined ? editingPosition[record._id] : position}
            onChange={(value) => handlePositionChange(record._id, value)}
            onBlur={() => handlePositionBlur(record._id)}
            onPressEnter={() => handlePositionBlur(record._id)}
            min={1}
            style={{ width: '100%' }}
            disabled={loadingPosition[record._id]}
          />
        </div>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      fixed: 'right',
      width: 120,
      render: (text, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              onClick={() => navigate(`/admin/products/${record._id}`)}
              type="primary"
              size="small"
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
              type="primary"
              ghost
              size="small"
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              icon={<DeleteOutlined />}
              onClick={() => onDelete(record._id)}
              danger
              size="small"
            />
          </Tooltip>
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
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `Tổng cộng ${total} sản phẩm`,
        pageSizeOptions: ['10', '20', '50', '100']
      }}
      scroll={{ x: 'max-content' }}
      className="product-admin-table"
    />
  );
};

export default ProductTable;