import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Dropdown, Avatar, Tooltip } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  FolderOutlined,
  SettingOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';
import '../../styles/components/admin/AdminLayout.scss';

const { Header, Sider, Content } = Layout;

function AdminLayout({ children }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.startsWith('/admin/products')) return '2';
    if (path.startsWith('/admin/categories')) return '3';
    if (path.startsWith('/admin/settings')) return '4';
    return '1';
  };

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      if (!mobile) {
        setMenuVisible(false);
        setCollapsed(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Định nghĩa các mục menu với text và label.
  const menuItems = [
    {
      key: '1',
      icon: <DashboardOutlined />,
      text: 'Tổng quan',
      label: <Link to="/admin">Tổng quan</Link>,
    },
    {
      key: '2',
      icon: <ShoppingOutlined />,
      text: 'Quản lý sản phẩm',
      label: <Link to="/admin/products">Quản lý sản phẩm</Link>,
    },
    {
      key: '3',
      icon: <FolderOutlined />,
      text: 'Quản lý danh mục',
      label: <Link to="/admin/categories">Quản lý danh mục</Link>,
    },
    {
      key: '4',
      icon: <SettingOutlined />,
      text: 'Cài đặt hệ thống',
      label: <Link to="/admin/settings">Cài đặt hệ thống</Link>,
    },
  ];

  // Khi collapsed, hiển thị Tooltip cho mỗi mục menu dựa trên thuộc tính text
  const items = menuItems.map((item) => ({
    key: item.key,
    icon: item.icon,
    label: collapsed ? (
      <Tooltip title={item.text} placement="right">
        {item.label}
      </Tooltip>
    ) : (
      item.label
    ),
  }));

  // Menu dropdown hiển thị ở header (Thông tin cá nhân và Đăng xuất)
  const profileMenu = (
    <Menu
      items={[
        {
          key: 'profile',
          label: <Link to="/admin/profile">Thông tin cá nhân</Link>,
        },
        {
          key: 'logout',
          label: <span onClick={logout} style={{ cursor: 'pointer' }}>Đăng xuất</span>,
        },
      ]}
    />
  );

  return (
    <Layout className="admin-layout">
      {isMobile && (
        <Button
          className="mobile-menu-toggle"
          type="primary"
          icon={menuVisible ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setMenuVisible(!menuVisible)}
        />
      )}
      {isMobile && menuVisible && (
        <div className="mobile-menu-overlay" onClick={() => setMenuVisible(false)} />
      )}
      <Sider
        className={`admin-sider ${menuVisible ? 'visible' : ''}`}
        collapsible
        collapsed={collapsed}
        collapsedWidth={isMobile ? 0 : 80}
        breakpoint="lg"
        trigger={null}
        width={240}
        theme="dark"
      >
        <div className="sider-header">
          <Link to="/admin" className="logo-container">
            <img src={logo} alt="Logo" className="logo" />
            {!collapsed && <span className="logo-text">ADMIN PANEL</span>}
          </Link>
          <Button
            className="sider-toggle"
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
        </div>
        <Menu
          theme="dark"
          selectedKeys={[getSelectedKey()]}
          mode="inline"
          inlineCollapsed={collapsed}
          items={items}
          onClick={() => isMobile && setMenuVisible(false)}
        />
      </Sider>
      <Layout
        className="content-layout"
        style={{
          marginLeft: isMobile ? 0 : (collapsed ? 80 : 240),
          transition: 'margin 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Header className="admin-header">
          <div className="header-content">
            <div className="header-left">
              {/* Bạn có thể hiển thị tiêu đề trang ở đây nếu cần */}
            </div>
            <div className="header-right" style={{ display: 'flex', alignItems: 'center' }}>
              <Dropdown overlay={profileMenu} trigger={['click']}>
                <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  {user?.avatarUrl ? (
                    <Avatar src={user.avatarUrl} icon={<UserOutlined />} />
                  ) : (
                    <Avatar icon={<UserOutlined />} />
                  )}
                  <span style={{ marginLeft: 8, color: '#fff' }}>{user?.fullName || 'User'}</span>
                </span>
              </Dropdown>
            </div>
          </div>
        </Header>
        <Content className="admin-content">{children}</Content>
      </Layout>
    </Layout>
  );
}

export default AdminLayout;
