import React, { useState, useEffect } from 'react';
import { Table, message } from 'antd';
import AdminLayout from '../../../components/layout/AdminLayout';
import logService from '../../../services/admin/logService';

const LogHistoryPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await logService.getLogs();
      setLogs(res.data);
    } catch (error) {
      message.error("Lỗi khi tải lịch sử hoạt động");
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const columns = [
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => new Date(text).toLocaleString("vi-VN")
    },
    {
      title: "Hành động",
      dataIndex: "action",
      key: "action"
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description"
    },
    {
      title: "Người dùng",
      dataIndex: "user",
      key: "user",
      render: (user) => user ? user.username : '-'
    }
  ];

  return (
    <AdminLayout>
      <div style={{ padding: "24px" }}>
        <h1>Lịch sử hoạt động</h1>
        <Table
          columns={columns}
          dataSource={logs}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </div>
    </AdminLayout>
  );
};

export default LogHistoryPage;
