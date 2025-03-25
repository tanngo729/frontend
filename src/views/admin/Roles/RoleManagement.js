// frontend/src/views/admin/Roles/RoleManagement.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Table, Space, message, Modal, Button, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import AdminLayout from '../../../components/layout/admin/AdminLayout';
import roleService from '../../../services/admin/roleService';
import AddNewButton from '../../../components/common/AddNewButton/AddNewButton';
import RoleModal from './RoleModal';
import '../../../styles/admin/RoleManagement.scss';

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await roleService.getRoles();
      setRoles(response.data);
    } catch (error) {
      message.error("Lỗi khi tải danh sách nhóm quyền");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleCreate = () => {
    setEditingRole(null);
    setModalVisible(true);
  };

  const handleEdit = useCallback((role) => {
    setEditingRole(role);
    setModalVisible(true);
  }, []);

  const handleDelete = useCallback((roleId) => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa nhóm quyền này?",
      onOk: async () => {
        try {
          setActionLoading(prev => ({ ...prev, [roleId]: true }));
          await roleService.deleteRole(roleId);
          message.success("Xóa nhóm quyền thành công");
          fetchRoles();
        } catch (error) {
          message.error("Lỗi khi xóa nhóm quyền");
        } finally {
          setActionLoading(prev => ({ ...prev, [roleId]: false }));
        }
      },
    });
  }, [fetchRoles]);

  const columns = useMemo(() => [
    {
      title: 'Tên nhóm quyền',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Ghi chú',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Nhóm cha',
      dataIndex: 'parent',
      key: 'parent',
      render: (parent) => (parent ? parent.name : '-'),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 120,
      render: (text, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              type="primary"
              ghost
              size="small"
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record._id)}
              danger
              size="small"
              loading={actionLoading[record._id]}
            />
          </Tooltip>
        </Space>
      ),
    },
  ], [handleEdit, handleDelete, actionLoading]);

  return (
    <AdminLayout>
      <div className="role-management-view">
        <div className="page-header">
          <h1>Quản lý Nhóm quyền</h1>
          <AddNewButton onClick={handleCreate}>
            Tạo nhóm quyền
          </AddNewButton>
        </div>
        <Table
          columns={columns}
          dataSource={roles}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 5 }}
          className="admin-table"
        />
        <RoleModal
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          initialValues={editingRole || {}}
          onRoleSaved={() => { fetchRoles(); setModalVisible(false); }}
        />
      </div>
    </AdminLayout>
  );
};

export default RoleManagement;