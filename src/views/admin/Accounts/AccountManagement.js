// src/views/admin/Accounts/AccountManagement.jsx
import React, { useState, useEffect } from 'react';
import { Space, Input, Select, Modal, message, Spin } from 'antd';

import AdminLayout from '../../../components/layout/admin/AdminLayout';
import accountService from '../../../services/admin/accountService';
import roleService from '../../../services/admin/roleService';
import UserTable from './users/UserTable';
import UserForm from './users/UserForm';
import AddNewButton from '../../../components/common/AddNewButton/AddNewButton';
import '../../../styles/admin/AccountManagement.scss';

const { Option } = Select;
const { Search } = Input;

const AccountManagement = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [roleOptions, setRoleOptions] = useState([]);

  const fetchAccounts = async (params = {}) => {
    setLoading(true);
    try {
      const response = await accountService.getAccounts({
        search: searchKeyword,
        role: filterRole,
        status: filterStatus,
        page: pagination.current,
        limit: pagination.pageSize,
        ...params,
      });
      setAccounts(response.data.accounts);
      setPagination({
        current: response.data.currentPage,
        pageSize: response.data.pageSize,
        total: response.data.total,
      });
    } catch (error) {
      message.error("Lỗi khi tải danh sách tài khoản");
    } finally {
      setLoading(false);
    }
  };

  // Load danh sách roles để dùng trong bộ lọc và truyền xuống form
  useEffect(() => {
    roleService.getRoles()
      .then(res => {
        setRoleOptions(res.data);
      })
      .catch(err => {
        console.error("Error fetching roles for filter", err);
      });
  }, []);

  useEffect(() => {
    fetchAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchKeyword, filterRole, filterStatus, pagination.current, pagination.pageSize]);

  const handleTableChange = (pag) => {
    setPagination(pag);
    fetchAccounts();
  };

  const handleSearch = (value) => {
    setSearchKeyword(value);
  };

  const handleRoleFilterChange = (value) => {
    setFilterRole(value);
  };

  const handleStatusFilterChange = (value) => {
    setFilterStatus(value);
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setModalVisible(true);
  };

  const handleDelete = (accountId) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa tài khoản này?",
      onOk: async () => {
        try {
          await accountService.deleteAccount(accountId);
          message.success("Xóa tài khoản thành công");
          fetchAccounts();
        } catch (error) {
          message.error("Lỗi khi xóa tài khoản");
        }
      }
    });
  };

  const handleToggleStatus = async (account) => {
    try {
      const newStatus = account.status === 'active' ? 'inactive' : 'active';
      await accountService.updateAccount(account._id, { status: newStatus });
      message.success("Cập nhật trạng thái thành công");
      fetchAccounts();
    } catch (error) {
      message.error("Lỗi khi cập nhật trạng thái tài khoản");
    }
  };

  const handleModalSubmit = async (values) => {
    setModalLoading(true);
    try {
      const formData = new FormData();
      // Append các trường thông tin
      formData.append('username', values.username);
      formData.append('email', values.email);
      // Chỉ append password nếu người dùng nhập giá trị mới
      if (values.password) {
        formData.append('password', values.password);
      }
      formData.append('fullName', values.fullName);
      formData.append('phone', values.phone || '');
      formData.append('address', values.address || '');
      // Xử lý roles: đảm bảo nếu không có, sử dụng mảng rỗng
      (values.roles || []).forEach(role => {
        formData.append('roles', role);
      });
      // Xử lý avatar
      if (values.avatarUrl && values.avatarUrl.length > 0) {
        const avatarFile = values.avatarUrl[0].originFileObj;
        formData.append('avatar', avatarFile);
      }

      if (editingAccount && editingAccount._id) {
        await accountService.updateAccount(editingAccount._id, formData);
      } else {
        await accountService.createAccount(formData);
      }
      setModalVisible(false);
      fetchAccounts();
      message.success(editingAccount ? "Cập nhật thành công" : "Tạo thành công");
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi khi lưu tài khoản");
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="account-management-view">
        <div className="page-header">
          <h1>Danh Sách Tài Khoản</h1>
          <Space wrap>
            <Search
              placeholder="Tìm kiếm theo username, email, số điện thoại..."
              onSearch={handleSearch}
              enterButton
            />
            <Select placeholder="Lọc theo vai trò" style={{ width: 160 }} onChange={handleRoleFilterChange} allowClear>
              {roleOptions.map(role => (
                <Option key={role._id} value={role._id}>
                  {role.name}
                </Option>
              ))}
            </Select>
            <Select placeholder="Lọc theo trạng thái" style={{ width: 160 }} onChange={handleStatusFilterChange} allowClear>
              <Option value="active">Kích hoạt</Option>
              <Option value="inactive">Vô hiệu</Option>
              <Option value="pending">Chờ xác nhận</Option>
            </Select>
            <AddNewButton onClick={() => { setEditingAccount(null); setModalVisible(true); }}>
              Tạo tài khoản
            </AddNewButton>
          </Space>
        </div>
        <Spin spinning={loading} tip="Đang tải danh sách tài khoản...">
          <UserTable
            users={accounts}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />
        </Spin>
        <Modal
          title={editingAccount ? "Chỉnh sửa tài khoản" : "Tạo tài khoản mới"}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          destroyOnClose
        >
          <Spin spinning={modalLoading} tip="Đang xử lý...">
            <UserForm
              initialValues={editingAccount || {}}
              onFinish={handleModalSubmit}
              roleOptions={roleOptions}
            />
          </Spin>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default AccountManagement;
