import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShoppingCart,
  faUser,
  faTimes,
  faReceipt,
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import SearchBar from '../../../SearchBar/SearchBar';
import { useAuth } from '../../../../context/AuthContext';
import cartService from '../../../../services/client/cartService';
import logo from '../../../../assets/logo.png';

const NAV_ITEMS = [
  { path: '/', name: 'Trang chủ' },
  { path: '/products', name: 'Sản phẩm' },
  { path: '/recipes', name: 'Công thức' },
  { path: '/about', name: 'Về chúng tôi' },
];

function MobileHeader() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

  // Close menus when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location]);

  // Fetch cart data and update count
  useEffect(() => {
    const fetchCartData = async () => {
      if (user) {
        try {
          // Gọi getCart() không cần truyền userId vì backend sẽ lấy từ token
          const cartData = await cartService.getCart();
          const itemCount = cartData && cartData.items ? cartData.items.length : 0;
          setCartCount(itemCount);
        } catch (error) {
          console.error('Error fetching cart:', error);
          setCartCount(0);
        }
      } else {
        setCartCount(0);
      }
    };

    fetchCartData();

    // Thêm event listener để cập nhật giỏ hàng khi có thay đổi
    window.addEventListener('cartUpdated', fetchCartData);

    // Cleanup
    return () => {
      window.removeEventListener('cartUpdated', fetchCartData);
    };
  }, [user]);

  // Prevent body scrolling when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);

  return (
    <div className="mobile-header">
      {/* Top bar with logo and icons */}
      <div className="mobile-header-top">
        <Link to="/" className="logo">
          <img src={logo} alt="Neo's Corner Logo" className="logo-image" />
          <div className="logo-text">
            <div className="brand-name">Neo's Corner</div>
          </div>
        </Link>

        <div className="header-icons">
          {user ? (
            <>
              {/* Giỏ hàng - Hiển thị khi đăng nhập */}
              <Link to="/cart" className="icon-link cart-link" aria-label="Giỏ hàng">
                <FontAwesomeIcon icon={faShoppingCart} />
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>

              {/* Đơn hàng - Hiển thị khi đăng nhập */}
              <Link to="/orders" className="icon-link orders-link" aria-label="Đơn hàng của tôi">
                <FontAwesomeIcon icon={faReceipt} />
              </Link>

              {/* User icon - Hiển thị khi đăng nhập */}
              <button className="user-icon" onClick={toggleUserMenu} aria-label="Tài khoản">
                <FontAwesomeIcon icon={faUser} />
              </button>
            </>
          ) : (
            <Link to="/auth/login" className="login-btn-mobile" aria-label="Đăng nhập">
              Đăng nhập
            </Link>
          )}

          <button
            className={`hamburger-btn ${isMenuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
            aria-label="Menu điều hướng"
          >
            <span className="hamburger-box">
              <span className="hamburger-inner"></span>
            </span>
          </button>
        </div>
      </div>

      {/* User menu dropdown */}
      {isUserMenuOpen && user && (
        <div className="user-menu-dropdown">
          <div className="user-info">
            <span className="user-name">{user.fullName || user.username}</span>
            <Link to="/profile" className="profile-link">Tài khoản của tôi</Link>
            <Link to="/orders" className="orders-link">Đơn hàng của tôi</Link>
          </div>
          <button onClick={logout} className="logout-btn">
            Đăng xuất
          </button>
        </div>
      )}

      {/* Side menu */}
      <div className={`mobile-menu-container ${isMenuOpen ? 'show' : ''}`}>
        <div className="mobile-menu-inner">
          <div className="mobile-menu-header">
            <h3>Menu</h3>
            <button className="close-menu" onClick={toggleMenu}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <SearchBar className="mobile-search-bar" />

          <nav className="mobile-nav-menu">
            <ul className="nav-list">
              {NAV_ITEMS.map((item) => (
                <li
                  key={item.path}
                  className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                >
                  <Link to={item.path} onClick={toggleMenu} className="nav-link">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Overlay for side menu */}
      {isMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={toggleMenu}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export default MobileHeader;