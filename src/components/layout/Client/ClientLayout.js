import React from 'react';
import { Layout } from 'antd';
import DesktopHeader from './Header/DesktopHeader';
import MobileHeader from './Header/MobileHeader';
import Footer from './Footer/Footer';
import '../../../styles/client/clientStyles.scss';

const { Content } = Layout;

function ClientLayout({ children }) {
  return (
    <Layout className="client-layout">
      <header className="client-layout-header">
        <div className="container">
          <DesktopHeader />
          <MobileHeader />
        </div>
      </header>
      <Content className="client-layout-content">{children}</Content>
      <Footer />
    </Layout>
  );
}

export default ClientLayout;