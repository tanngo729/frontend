// src/views/admin/Payment/PaymentMethodManagement.js
import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Tag,
  message,
  Switch,
  Modal,
  Tooltip,
  Typography,
  Spin
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import AdminLayout from '../../../components/layout/admin/AdminLayout';
import PaymentMethodForm from './PaymentMethodForm';
import adminPaymentService from '../../../services/admin/adminPaymentService';
// import './PaymentMethodManagement.scss';

const { Title } = Typography;
const { confirm } = Modal;

const PaymentMethodManagement = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  // Fetch payment methods from API
  const fetchPaymentMethods = async () => {
    setLoading(true);
    try {
      const data = await adminPaymentService.getPaymentMethods();
      setPaymentMethods(data);
    } catch (error) {
      message.error('Không thể tải phương thức thanh toán');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  // Handle form submission
  const handleFormSubmit = async (values) => {
    try {
      if (editingMethod) {
        // Đảm bảo không gửi _id trong payload khi cập nhật
        const { _id, ...updateData } = values;
        await adminPaymentService.updatePaymentMethod(editingMethod._id, updateData);
        message.success('Cập nhật phương thức thanh toán thành công');
      } else {
        await adminPaymentService.createPaymentMethod(values);
        message.success('Thêm phương thức thanh toán thành công');
      }
      setModalVisible(false);
      fetchPaymentMethods();
    } catch (error) {
      console.error('Form submit error:', error);
      const errorMsg = error.response?.data?.message || 'Không thể lưu phương thức thanh toán';
      message.error(errorMsg);
    }
  };
  // Handle status toggle
  const handleStatusToggle = async (id, checked) => {
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      // Convert to boolean nếu đang là string hoặc giá trị khác
      const isActive = !!checked;
      console.log('Toggling status:', id, isActive, typeof isActive);

      await adminPaymentService.updatePaymentMethodStatus(id, isActive);
      setPaymentMethods(prevMethods =>
        prevMethods.map(method =>
          method._id === id ? { ...method, isActive: isActive } : method
        )
      );
      message.success(`Phương thức thanh toán ${isActive ? 'đã được kích hoạt' : 'đã bị vô hiệu hóa'}`);
    } catch (error) {
      console.error('Toggle status error details:', error);
      message.error('Không thể cập nhật trạng thái');
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  // Handle edit button click
  const handleEdit = (record) => {
    // Clone đối tượng để tránh tham chiếu trực tiếp
    setEditingMethod({ ...record });
    setModalVisible(true);
  };
  // Handle delete confirmation
  const showDeleteConfirm = (id, name) => {
    confirm({
      title: 'Bạn có chắc chắn muốn xóa phương thức thanh toán này?',
      icon: <ExclamationCircleOutlined />,
      content: `Phương thức: ${name}`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        setActionLoading(prev => ({ ...prev, [id]: true }));
        try {
          await adminPaymentService.deletePaymentMethod(id);
          message.success('Xóa phương thức thanh toán thành công');
          fetchPaymentMethods();
        } catch (error) {
          message.error('Không thể xóa phương thức thanh toán');
        } finally {
          setActionLoading(prev => ({ ...prev, [id]: false }));
        }
      }
    });
  };

  // Column definitions
  const columns = [
    {
      title: 'Tên phương thức',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="payment-method-name">
          <span className="icon">{record.icon}</span>
          <span>{text}</span>
        </div>
      )
    },
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code'
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: type => {
        let color;
        switch (type) {
          case 'cod':
            color = 'green';
            break;
          case 'bank_transfer':
            color = 'blue';
            break;
          case 'e_wallet':
            color = 'purple';
            break;
          case 'online_payment':
            color = 'orange';
            break;
          default:
            color = 'default';
        }
        return <Tag color={color}>{type}</Tag>;
      }
    },
    {
      title: 'Phí',
      key: 'fee',
      render: (_, record) => {
        if (!record.fee || record.fee === 0) return 'Miễn phí';
        return record.feeType === 'percentage'
          ? `${record.fee}%`
          : `${record.fee.toLocaleString()} VND`;
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active, record) => (
        <Switch
          checked={active}
          onChange={(checked) => handleStatusToggle(record._id, checked)}
          loading={actionLoading[record._id]}
        />
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              type="primary"
              size="small"
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              icon={<DeleteOutlined />}
              onClick={() => showDeleteConfirm(record._id, record.name)}
              type="danger"
              size="small"
              loading={actionLoading[record._id]}
              danger
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <AdminLayout>
      <div className="payment-method-management">
        <div className="page-header">
          <Title level={2}>Quản lý phương thức thanh toán</Title>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingMethod(null);
                setModalVisible(true);
              }}
            >
              Thêm phương thức
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchPaymentMethods}
              loading={loading}
            >
              Làm mới
            </Button>
          </Space>
        </div>

        <Card className="payment-methods-table-card">
          {loading ? (
            <div className="loading-container">
              <Spin size="large" tip="Đang tải phương thức thanh toán..." />
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={paymentMethods}
              rowKey="_id"
              pagination={false}
            />
          )}
        </Card>

        <PaymentMethodForm
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          onSubmit={handleFormSubmit}
          initialValues={editingMethod}
          isEditing={!!editingMethod}
        />
      </div>
    </AdminLayout>
  );
};

export default PaymentMethodManagement;