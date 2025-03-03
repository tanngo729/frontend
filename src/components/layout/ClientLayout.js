import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faShoppingCart, faPhoneAlt, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faFacebookF, faInstagram, faTiktok, faYoutube } from '@fortawesome/free-brands-svg-icons';
import logo from '../../assets/logo.png';
import '../../styles/components/client/ClientLayout.scss';

const { Header, Content, Footer } = Layout;

const NAV_ITEMS = [
  { path: '/', name: 'Trang chủ' },
  { path: '/products', name: 'Sản phẩm' },
  { path: '/recipes', name: 'Công thức' },
  { path: '/about', name: 'Về chúng tôi' },
];

function ClientLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState(''); // State for search input

  // Hàm đóng mobile menu
  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  // Hàm toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  // Effect: Đóng mobile menu khi chuyển route
  useEffect(() => {
    closeMobileMenu();
  }, [location, closeMobileMenu]);

  // Effect: Theo dõi scroll của window để thay đổi header
  useEffect(() => {
    const handleScroll = () => {
      setIsHeaderScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Implement search logic here or redirect to search page
    console.log('Search Query:', searchQuery);
    // For now, let's redirect to the existing /search route
    window.location.href = `/search?q=${searchQuery}`; // Redirect with query parameter
  };


  return (
    <Layout className="client-layout dribbble-style"> {/* Add 'dribbble-style' class */}
      {/* Header */}
      <Header
        className={`client-layout-header ${isHeaderScrolled ? 'scrolled' : ''} ${isMobileMenuOpen ? 'menu-open' : ''
          }`}
      >
        <div className="container">
          <div className="header-content">
            {/* Logo (Left) */}
            <Link to="/" className="logo">
              <img src={logo} alt="Neo's Corner Logo" className="logo-image" />
              <div className="logo-text">
                <span className="brand-name">Neo's Corner</span>
                <span className="brand-slogan">Bếp của Bắp</span>
              </div>
            </Link>

            {/* Search Bar (Center) */}
            <form className="search-bar" onSubmit={handleSearchSubmit}>
              <input
                type="text"
                className="search-input"
                placeholder="Bạn đang tìm gì?" // Vietnamese placeholder
                value={searchQuery}
                onChange={handleSearchInputChange}
              />
              <button type="submit" className="search-button" aria-label="Tìm kiếm">
                <FontAwesomeIcon icon={faSearch} />
              </button>
            </form>


            {/* Navigation (Right, before user actions) */}
            <nav className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
              <div className="nav-container">
                <ul className="nav-list">
                  {NAV_ITEMS.map(item => (
                    <li
                      key={item.path}
                      className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                    >
                      <Link to={item.path} onClick={closeMobileMenu} className="nav-link">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>

            {/* User Actions (Far Right) */}
            <div className="user-actions">
              <div className="action-group">
                <Link to="/cart" className="icon-link cart-link" aria-label="Giỏ hàng">
                  <FontAwesomeIcon icon={faShoppingCart} />
                  <span className="cart-badge">2</span>
                </Link>
                <Link to="/login" className="login-btn" aria-label="Đăng nhập">
                  Đăng nhập
                </Link>
              </div>
              <button
                className={`hamburger-btn ${isMobileMenuOpen ? 'active' : ''}`}
                onClick={toggleMobileMenu}
                aria-label="Menu điều hướng"
              >
                <span className="hamburger-box">
                  <span className="hamburger-inner" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </Header>

      {/* Content */}
      <Content className="client-layout-content">{children}</Content>

      {/* Footer */}
      <Footer className="client-layout-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Liên hệ</h4>
              <p>
                <FontAwesomeIcon icon={faPhoneAlt} /> 0123 456 789
              </p>
              <p>
                <FontAwesomeIcon icon={faEnvelope} /> info@neoscorner.com
              </p>
            </div>
            <div className="footer-section">
              <h4>Hỗ trợ</h4>
              <Link to="/faq">Câu hỏi thường gặp</Link>
              <Link to="/shipping">Chính sách vận chuyển</Link>
              <Link to="/returns">Đổi trả hàng</Link>
            </div>
            <div className="footer-section social-links">
              <h4>Kết nối với chúng tôi</h4>
              <div className="social-icons">
                <a href="#" aria-label="Facebook">
                  <FontAwesomeIcon icon={faFacebookF} />
                </a>
                <a href="#" aria-label="Instagram">
                  <FontAwesomeIcon icon={faInstagram} />
                </a>
                <a href="#" aria-label="TikTok">
                  <FontAwesomeIcon icon={faTiktok} />
                </a>
                <a href="#" aria-label="YouTube">
                  <FontAwesomeIcon icon={faYoutube} />
                </a>
              </div>
            </div>
          </div>
          <div className="copyright">
            © {new Date().getFullYear()} Neo's Corner - Bếp của Bắp. Đã đăng ký Bản quyền.
          </div>
        </div>
      </Footer>
    </Layout>
  );
}

export default ClientLayout;