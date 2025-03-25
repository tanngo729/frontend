import React, { createContext, useContext, useState, useEffect } from 'react';
import { message } from 'antd';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [adminToken, setAdminToken] = useState(null);
  const [adminRefreshToken, setAdminRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Read tokens and user from sessionStorage
    const savedToken = sessionStorage.getItem('adminToken');
    const savedRefreshToken = sessionStorage.getItem('adminRefreshToken');
    const savedUser = sessionStorage.getItem('adminUser');
    if (savedToken && savedUser) {
      setAdminToken(savedToken);
      setAdminRefreshToken(savedRefreshToken);
      setAdminUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (user, token, refreshToken) => {
    setAdminUser(user);
    setAdminToken(token);
    setAdminRefreshToken(refreshToken);
    sessionStorage.setItem('adminToken', token);
    sessionStorage.setItem('adminRefreshToken', refreshToken);
    sessionStorage.setItem('adminUser', JSON.stringify(user));
  };

  const logout = () => {
    setAdminUser(null);
    setAdminToken(null);
    setAdminRefreshToken(null);
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminRefreshToken');
    sessionStorage.removeItem('adminUser');
    message.info('Đã đăng xuất khỏi trang quản trị');

    // Chuyển hướng đến trang đăng nhập admin
    window.location.href = '/admin/auth/login';
  };

  const updateTokens = (token, refreshToken) => {
    setAdminToken(token);
    if (refreshToken) {
      setAdminRefreshToken(refreshToken);
      sessionStorage.setItem('adminRefreshToken', refreshToken);
    }
    sessionStorage.setItem('adminToken', token);
  };

  return (
    <AdminAuthContext.Provider
      value={{ adminUser, adminToken, adminRefreshToken, loading, login, logout, updateTokens }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);