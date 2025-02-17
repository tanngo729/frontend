// frontend/src/components/layout/AdminLayout.js
import React from 'react';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  FolderOutlined,
  UserOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/logo.png';
import '../../styles/components/AdminLayout.scss'; // Import SCSS file

const { Header, Sider, Content } = Layout;

function AdminLayout({ children }) {
  const location = useLocation();
  const pathname = location.pathname;

  const getSelectedKey = () => {
    if (pathname.startsWith('/admin/products')) {
      return '2';
    } else if (pathname.startsWith('/admin/categories')) {
      return '3';
    } else if (pathname.startsWith('/admin/users')) {
      return '4';
    } else if (pathname.startsWith('/admin/settings')) {
      return '5';
    } else if (pathname === '/admin') {
      return '1';
    }
    return '1'; // Default to Dashboard
  };

  const selectedKeys = [getSelectedKey()];

  return (
    <Layout className="admin-layout" style={{ minHeight: '100vh' }}>
      <Sider collapsible className="admin-layout-sider">
        <div className="logo admin-layout-logo">
          <img src={logo} alt="Logo" />
        </div>
        <Menu
          theme="dark"
          selectedKeys={selectedKeys} // **Dynamic selectedKeys based on URL**
          mode="inline"
          items={[
            {
              key: '1',
              icon: <DashboardOutlined />,
              label: <Link to="/admin">Tổng quan</Link>,
            },
            {
              key: '2',
              icon: <ShoppingOutlined />,
              label: <Link to="/admin/products">Quản lý sản phẩm</Link>,
            },
            {
              key: '3',
              icon: <FolderOutlined />,
              label: <Link to="/admin/categories">Quản lý danh mục</Link>,
            },
            {
              key: '4',
              icon: <UserOutlined />,
              label: <Link to="/admin/users">Quản lý người dùng</Link>,
            },
            {
              key: '5',
              icon: <SettingOutlined />,
              label: <Link to="/admin/settings">Cài đặt</Link>,
            },
          ]}
        />
      </Sider>
      <Layout className="site-layout admin-layout-content-wrapper">
        <Header className="site-layout-background admin-layout-header">
          <h2 className="admin-layout-header-title">Admin Panel</h2>
        </Header>
        <Content className="admin-layout-content">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

export default AdminLayout;