import React, { useState, useEffect } from 'react';
import { Table, Modal, Form, Input, Select, message, Space, Button, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import categoryService from '../../../services/admin/categoryService';
import AdminLayout from '../../../components/layout/admin/AdminLayout';
import AddNewButton from '../../../components/common/AddNewButton/AddNewButton';
import '../../../styles/admin/CategoryAdminView.scss';

const { Option } = Select;

const CategoryAdminView = () => {
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [form] = Form.useForm();

  // Tải tất cả danh mục
  const fetchAllCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryService.getCategories({ page: 1, limit: 1000 });
      if (response?.data?.data) {
        setAllCategories(response.data.data);
      } else {
        setAllCategories([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      message.error("Lỗi khi tải danh mục");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCategories();
  }, []);

  // Hàm xây dựng cây dữ liệu cho Table theo mối quan hệ cha – con
  const buildTreeData = (data) => {
    const map = {};
    data?.forEach(cat => {
      const id = cat._id;
      map[id] = { ...cat, key: id, children: [] };
    });
    const tree = [];
    data?.forEach(cat => {
      const parentId = cat.parent;
      if (parentId && map[parentId]) {
        map[parentId].children.push(map[cat._id]);
      } else {
        tree.push(map[cat._id]);
      }
    });
    return tree;
  };

  const treeData = buildTreeData(allCategories);

  // Hàm tính cấp bậc (level) của danh mục để định dạng option trong Select
  const getCategoryLevel = (record) => {
    let level = 0;
    let current = record;
    while (current.parent) {
      const parent = allCategories.find(cat => cat._id === current.parent);
      if (!parent) break;
      level++;
      current = parent;
    }
    return level;
  };

  // Xây dựng danh sách option cho Select với indent theo cấp
  const buildParentOptions = (data) => {
    return data.map(cat => {
      const level = getCategoryLevel(cat);
      return {
        value: cat._id,
        label: `${'--'.repeat(level)} ${cat.name}`
      };
    });
  };

  const parentOptions = buildParentOptions(allCategories);

  // Mở modal để thêm mới hoặc chỉnh sửa
  const openModal = (record = null) => {
    setEditingCategory(record);
    if (record) {
      form.setFieldsValue(record);
    } else {
      form.resetFields();
    }
    setModalOpen(true);
  };

  // Xóa danh mục
  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa danh mục này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { className: 'modal-ok-btn-danger' },
      onOk: async () => {
        try {
          setActionLoading(prev => ({ ...prev, [id]: true }));
          await categoryService.deleteCategory(id);
          message.success("Xóa danh mục thành công");
          fetchAllCategories();
        } catch (error) {
          message.error("Lỗi khi xóa danh mục");
        } finally {
          setActionLoading(prev => ({ ...prev, [id]: false }));
        }
      },
    });
  };

  // Xử lý submit form (Tạo mới hoặc Cập nhật)
  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      setModalLoading(true);

      // Xử lý trường hợp parent null
      if (values.parent === undefined || values.parent === '') {
        values.parent = null;
      }

      console.log('Giá trị form gửi đi:', values);

      if (editingCategory) {
        // Thêm thông tin log để debug
        console.log(`Đang cập nhật danh mục ID: ${editingCategory._id}`);

        const response = await categoryService.updateCategory(editingCategory._id, values);
        console.log('Kết quả cập nhật:', response);
        message.success("Cập nhật danh mục thành công");
      } else {
        await categoryService.createCategory(values);
        message.success("Thêm danh mục thành công");
      }

      setModalOpen(false);
      fetchAllCategories();
      form.resetFields();
    } catch (error) {
      console.error("Lỗi chi tiết:", error);
      if (error.response) {
        message.error(error.response.data?.message || "Lỗi khi lưu danh mục");
      } else {
        message.error(error.message || "Lỗi khi lưu danh mục");
      }
    } finally {
      setModalLoading(false);
    }
  };

  // Định nghĩa các cột cho Table
  const columns = [
    {
      title: "Tên danh mục",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (record.parent ? text : <strong>{text}</strong>),
    },
    {
      title: "Danh mục cha",
      key: "parentName",
      render: (text, record) => {
        if (record.parent) {
          const parentCat = allCategories.find(cat => cat._id === record.parent);
          return parentCat ? parentCat.name : '-';
        }
        return '-';
      },
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (text) => text || '--',
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => new Date(text).toLocaleDateString('vi-VN'),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (text) => (
        <span className={`status-tag status-tag-${text}`}>
          {text === 'active' ? 'KÍCH HOẠT' : 'VÔ HIỆU'}
        </span>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 120,
      render: (text, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              onClick={() => openModal(record)}
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
  ];

  return (
    <AdminLayout>
      <div className="category-admin-view">
        <div className="page-header">
          <h1>Quản lý Danh mục</h1>
          <AddNewButton onClick={() => openModal()}>
            Thêm danh mục
          </AddNewButton>
        </div>
        <Table
          columns={columns}
          dataSource={allCategories}
          rowKey="_id"
          loading={loading}
          expandable={{ defaultExpandAllRows: true }}
          scroll={{ x: true }}
          className="admin-table"
        />
        <Modal
          title={editingCategory ? "Cập nhật danh mục" : "Thêm danh mục mới"}
          open={modalOpen}
          onOk={handleFormSubmit}
          onCancel={() => setModalOpen(false)}
          okText="Lưu"
          cancelText="Hủy"
          okButtonProps={{ className: 'modal-ok-btn', loading: modalLoading }}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="name"
              label="Tên danh mục"
              rules={[{ required: true, message: "Tên danh mục không được để trống" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="description" label="Mô tả">
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item name="image" label="Hình ảnh / Icon">
              <Input />
            </Form.Item>
            <Form.Item name="status" label="Trạng thái" initialValue="active">
              <Select>
                <Option value="active">Kích hoạt</Option>
                <Option value="inactive">Vô hiệu hóa</Option>
              </Select>
            </Form.Item>
            <Form.Item name="parent" label="Danh mục cha">
              <Select
                placeholder="Chọn danh mục cha (nếu có)"
                allowClear
              >
                {allCategories.map(cat => (
                  <Option key={cat._id} value={cat._id}>{cat.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default CategoryAdminView;