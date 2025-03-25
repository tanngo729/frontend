import React, { useState, useEffect, useMemo } from 'react';
import { Table, Checkbox, Button, Space, message } from 'antd';
import AdminLayout from '../../../components/layout/admin/AdminLayout';
import roleService from '../../../services/admin/roleService';
import permissionService from '../../../services/admin/permissionService';
import '../../../styles/admin/PermissionAssignment.scss';

const PermissionAssignment = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  // matrixData: { permissionId: { roleId: boolean } }
  const [matrixData, setMatrixData] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch roles từ backend
  const fetchRoles = async () => {
    try {
      const res = await roleService.getRoles();
      setRoles(res.data);
    } catch (error) {
      message.error("Lỗi khi tải danh sách nhóm quyền");
    }
  };

  // Fetch permissions từ backend
  const fetchPermissions = async () => {
    try {
      const res = await permissionService.getPermissions();
      setPermissions(res.data);
    } catch (error) {
      message.error("Lỗi khi tải danh sách quyền");
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  // Khi roles và permissions được load, xây dựng matrixData ban đầu
  useEffect(() => {
    if (roles.length && permissions.length) {
      const initialMatrix = {};
      permissions.forEach(perm => {
        initialMatrix[perm._id] = {};
        roles.forEach(role => {
          // Nếu role.permissions là mảng đối tượng quyền, kiểm tra xem role có chứa quyền đó hay không.
          const hasPerm = role.permissions && role.permissions.some(p => p._id === perm._id);
          initialMatrix[perm._id][role._id] = hasPerm;
        });
      });
      setMatrixData(initialMatrix);
    }
  }, [roles, permissions]);

  // Handler khi checkbox thay đổi
  const handleCheckboxChange = (permId, roleId, checked) => {
    setMatrixData(prev => ({
      ...prev,
      [permId]: {
        ...prev[permId],
        [roleId]: checked,
      },
    }));
  };

  // Khi nhấn "Lưu phân quyền", tổng hợp dữ liệu và cập nhật từng role
  const handleSave = async () => {
    try {
      await Promise.all(
        roles.map((role) => {
          const assignedPermissions = permissions
            .filter(perm => matrixData[perm._id] && matrixData[perm._id][role._id])
            .map(perm => perm._id);
          return roleService.updateRole(role._id, { permissions: assignedPermissions });
        })
      );
      message.success("Phân quyền đã được cập nhật");
      fetchRoles();
    } catch (error) {
      message.error("Lỗi khi cập nhật phân quyền");
    }
  };


  // Nhóm các quyền theo module (ví dụ: product, category, order,...)
  const groupedPermissions = useMemo(() => {
    return permissions.reduce((acc, perm) => {
      if (!acc[perm.module]) {
        acc[perm.module] = [];
      }
      acc[perm.module].push(perm);
      return acc;
    }, {});
  }, [permissions]);

  // Hàm render bảng cho mỗi module
  const renderTableForModule = (moduleName, perms) => {
    const columns = [
      {
        title: 'Quyền',
        dataIndex: 'name',
        key: 'name',
        fixed: 'left',
        width: 220,
      },
      ...roles.map(role => ({
        title: role.name,
        dataIndex: role._id,
        key: role._id,
        align: 'center',
        render: (text, record) => (
          <Checkbox
            checked={matrixData[record._id] ? matrixData[record._id][role._id] : false}
            onChange={e => handleCheckboxChange(record._id, role._id, e.target.checked)}
          />
        ),
      })),
    ];

    return (
      <div key={moduleName} className="module-group">
        <h2>{moduleName.toUpperCase()}</h2>
        <Table
          columns={columns}
          dataSource={perms}
          rowKey="_id"
          pagination={false}
          bordered
          scroll={{ x: 'max-content' }}
        />
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="permission-assignment">
        <h1>Phân quyền</h1>
        {Object.keys(groupedPermissions).map(moduleName =>
          renderTableForModule(moduleName, groupedPermissions[moduleName])
        )}
        <div className="save-btn">
          <Space>
            <Button type="primary" onClick={handleSave}>
              Lưu phân quyền
            </Button>
          </Space>
        </div>
      </div>
    </AdminLayout>
  );
};

export default PermissionAssignment;
