import React from 'react';
import { Table, Avatar, Tag, Button, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, StopOutlined, CheckOutlined } from '@ant-design/icons';

const UserTable = ({ users, onEdit, onDelete, onToggleStatus }) => {
  const columns = [
    {
      title: 'Avatar',
      dataIndex: 'avatarUrl',
      key: 'avatar',
      render: (src) => <Avatar src={src} />,
      width: 80,
      align: 'center',
    },
    {
      title: 'Tên',
      dataIndex: 'fullName',
      key: 'fullName',
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Vai trò',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles) =>
        roles && roles.length > 0 ? roles.map(role => <Tag key={role._id}>{role.name}</Tag>) : '-',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Đăng nhập cuối',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (date) => date ? new Date(date).toLocaleString('vi-VN') : '-',
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <>
          <Button icon={<EditOutlined />} onClick={() => onEdit(record)}>
            Sửa
          </Button>
          <Popconfirm title="Xóa tài khoản này?" onConfirm={() => onDelete(record._id)}>
            <Button icon={<DeleteOutlined />} danger>
              Xóa
            </Button>
          </Popconfirm>
          <Button
            icon={record.status === 'active' ? <StopOutlined /> : <CheckOutlined />}
            onClick={() => onToggleStatus(record)}
          >
            {record.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt'}
          </Button>
        </>
      ),
    },
  ];

  return <Table columns={columns} dataSource={users} rowKey="_id" />;
};

export default UserTable;
