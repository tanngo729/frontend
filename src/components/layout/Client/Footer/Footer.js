import React from 'react';
import { Layout } from 'antd';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhoneAlt, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faFacebookF, faInstagram, faTiktok, faYoutube } from '@fortawesome/free-brands-svg-icons';

const { Footer: AntFooter } = Layout;

function Footer() {
  return (
    <AntFooter className="client-layout-footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Liên hệ</h4>
            <p>
              <FontAwesomeIcon icon={faPhoneAlt} /> 0388179012
            </p>
            <p>
              <FontAwesomeIcon icon={faEnvelope} /> tanngo729@gmail.com
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
              <a
                href="https://www.facebook.com/tan.ngotruong.752/?locale=vi_VN"
                aria-label="Facebook"
                className="social-icon"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon icon={faFacebookF} />
              </a>
              <a
                href="https://www.instagram.com/tan.ngotruong.752/"
                aria-label="Instagram"
                className="social-icon"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon icon={faInstagram} />
              </a>
              <a
                href="https://www.tiktok.com/vi-VN/"
                aria-label="TikTok"
                className="social-icon"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon icon={faTiktok} />
              </a>
              <a
                href="https://www.youtube.com/@Neo-chan.2"
                aria-label="YouTube"
                className="social-icon"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon icon={faYoutube} />
              </a>
            </div>
          </div>
        </div>
        <div className="copyright">
          © {new Date().getFullYear()} Neo's Corner - Bếp của Bắp. Đã đăng ký Bản Quyền.
        </div>
      </div>
    </AntFooter>
  );
}

export default Footer;