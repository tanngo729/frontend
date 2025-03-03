// frontend/src/views/admin/AdminDashboard.js
import React from 'react';
import AdminLayout from '../../../components/layout/AdminLayout'; // Import AdminLayout

function AdminDashboard() {
  return (
    <AdminLayout> {/* Bọc nội dung Dashboard trong AdminLayout */}
      <div>
        <h1>Admin Dashboard</h1>
        <p>Chào mừng đến trang quản trị!</p>
        {/* Nội dung trang dashboard sẽ được thêm vào đây */}
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;