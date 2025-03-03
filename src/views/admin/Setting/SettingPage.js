import React from 'react';
import { Row, Col, Card } from 'antd';
import { Link } from 'react-router-dom';
import AdminLayout from '../../../components/layout/AdminLayout';
import '../../../styles/components/admin/SettingPage.scss';

const SettingPage = () => {
  return (
    <AdminLayout>
      <div className="settings-page">
        <h1>Cài đặt</h1>

        {/* Nhóm chức năng: Tài khoản */}
        <div className="settings-group" data-group="account">
          <h2>Tài khoản</h2>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Link to="/admin/roles">
                <Card hoverable title="Quản lý nhóm quyền" bordered={false}>
                  <p>Quản lý các nhóm quyền và phân quyền cho người dùng.</p>
                </Card>
              </Link>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Link to="/admin/permissions">
                <Card hoverable title="Quản lý phân quyền" bordered={false}>
                  <p>Thiết lập quyền truy cập cho từng nhóm.</p>
                </Card>
              </Link>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Link to="/admin/accounts">
                <Card hoverable title="Quản lý tài khoản" bordered={false}>
                  <p>Danh sách tài khoản</p>
                </Card>
              </Link>
            </Col>
          </Row>
        </div>

        {/* Nhóm chức năng: Hệ thống */}
        <div className="settings-group">
          <h2>Hệ thống</h2>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Link to="/admin/payment">
                <Card hoverable title="Thanh toán" bordered={false}>
                  <p>Cấu hình các cài đặt thanh toán của ứng dụng.</p>
                </Card>
              </Link>
            </Col>
            {/* Ô mới cho Lịch sử hoạt động */}
            <Col xs={24} sm={12} md={8}>
              <Link to="/admin/logs">
                <Card hoverable title="Lịch sử hoạt động" bordered={false}>
                  <p>Xem lịch sử hoạt động của hệ thống.</p>
                </Card>
              </Link>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Link to="/admin/banners">
                <Card hoverable title="Banner" bordered={false}>
                  <p>Banner</p>
                </Card>
              </Link>
            </Col>
            {/* Bạn có thể bổ sung thêm các card khác cho hệ thống */}
          </Row>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SettingPage;
