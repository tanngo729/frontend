// frontend/src/components/layout/ClientLayout.js
import React from 'react';
import { Layout } from 'antd';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';
import '../../styles/components/ClientLayout.scss';

const { Header, Content, Footer } = Layout;

function ClientLayout({ children }) {
  return (
    <Layout className="client-layout">
      <Header className="client-layout-header">
        <div className="client-layout-header-inner"> {/* Container for header content */}
          <div className="client-layout-logo">
            <Link to="/"> {/* Make logo clickable to homepage */}
              <img src={logo} alt="Logo" style={{ maxHeight: '100%' }} />
            </Link>
          </div>
          <nav className="client-layout-navigation"> {/* Navigation links container */}
            <ul className="client-layout-nav-links">
              <li className="client-layout-nav-item">
                <Link to="/">Trang chủ</Link>
              </li>
              <li className="client-layout-nav-item">
                <Link to="/products">Sản phẩm</Link>
              </li>
              {/* Add more navigation links here if needed */}
            </ul>
          </nav>
          <div className="client-layout-user-actions"> {/* User actions container */}
            <ul className="client-layout-user-links">
              <li className="client-layout-user-item">
                <Link to="/login">Đăng nhập</Link>
              </li>
              <li className="client-layout-user-item">
                <Link to="/profile">Thông tin</Link>
              </li>
              <li className="client-layout-user-item">
                <Link to="/settings">Cài đặt</Link>
              </li>
            </ul>
          </div>
        </div>
      </Header>
      <Content className="client-layout-content">
        {children}
      </Content>
      <Footer className="client-layout-footer">
        © {new Date().getFullYear()} Neo's Corner - Bếp của Bắp
      </Footer>
    </Layout>
  );
}

export default ClientLayout;