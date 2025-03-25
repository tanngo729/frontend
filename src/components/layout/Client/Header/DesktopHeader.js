import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShoppingCart,
  faUser,
  faReceipt
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

function DesktopHeader() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);

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

  // Đóng menu khi click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-dropdown-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  // Đóng menu khi chuyển trang
  useEffect(() => {
    setShowUserMenu(false);
  }, [location]);

  return (
    <div className="desktop-header">
      {/* Logo */}
      <Link to="/" className="logo">
        <img src={logo} alt="Neo's Corner Logo" className="logo-image" />
        <div className="logo-text">
          <div className="brand-name">Neo's Corner</div>
          <div className="brand-slogan">Bếp của Bắp</div>
        </div>
      </Link>

      {/* Search bar */}
      <SearchBar className="desktop-search-bar" />

      {/* Nav menu */}
      <nav className="desktop-nav-menu">
        <ul className="nav-list">
          {NAV_ITEMS.map((item) => (
            <li
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <Link to={item.path} className="nav-link">
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User actions */}
      <div className="user-actions">
        {user ? (
          <>
            {/* Giỏ hàng */}
            <Link to="/cart" className="icon-link cart-link" aria-label="Giỏ hàng">
              <FontAwesomeIcon icon={faShoppingCart} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>

            {/* Đơn hàng */}
            <Link to="/orders" className="icon-link orders-link" aria-label="Đơn hàng của tôi">
              <FontAwesomeIcon icon={faReceipt} />
            </Link>

            {/* User profile - with dropdown */}
            <div className="user-dropdown-container">
              <button
                className="icon-link user-icon"
                onClick={() => setShowUserMenu(!showUserMenu)}
                aria-label="Tài khoản"
              >
                <FontAwesomeIcon icon={faUser} />
              </button>

              {showUserMenu && (
                <div className="user-dropdown-menu">
                  <div className="user-info">
                    <span className="user-name">{user.fullName || user.username}</span>
                    <Link to="/profile" className="dropdown-item">Tài khoản của tôi</Link>
                    <Link to="/orders" className="dropdown-item">Đơn hàng của tôi</Link>
                  </div>
                  <button onClick={logout} className="logout-btn">
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link to="/auth/login" className="login-btn" aria-label="Đăng nhập">
            Đăng nhập
          </Link>
        )}
      </div>
    </div>
  );
}

export default DesktopHeader;