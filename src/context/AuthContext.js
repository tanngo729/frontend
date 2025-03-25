// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { message } from 'antd';
import authService from '../services/client/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = sessionStorage.getItem('token');
    const savedRefreshToken = sessionStorage.getItem('refreshToken');
    const savedUser = sessionStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setRefreshToken(savedRefreshToken);
      setUser(JSON.parse(savedUser));
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authService.login({ email, password });

      // Lưu thông tin từ response
      const { tokens, user } = response;

      setUser(user);
      setToken(tokens.accessToken);
      setRefreshToken(tokens.refreshToken);

      sessionStorage.setItem('token', tokens.accessToken);
      sessionStorage.setItem('refreshToken', tokens.refreshToken);
      sessionStorage.setItem('user', JSON.stringify(user));

      message.success('Đăng nhập thành công!');
      return true;
    } catch (error) {
      const errorMsg = error?.message || 'Đăng nhập thất bại. Vui lòng thử lại!';
      message.error(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      await authService.register(userData);
      message.success('Đăng ký thành công! Vui lòng đăng nhập');
      return true;
    } catch (error) {
      const errorMsg = error?.message || 'Đăng ký thất bại. Vui lòng thử lại!';
      message.error(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      clearUserData();
      message.success('Đăng xuất thành công');
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      // Vẫn thực hiện xóa thông tin người dùng ngay cả khi API gặp lỗi
      clearUserData();
      message.info('Đã đăng xuất');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearUserData = () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
  };

  // Thêm hàm refresh token
  const refresh = async () => {
    if (!refreshToken) return false;

    try {
      setLoading(true);
      const response = await authService.refreshToken(refreshToken);
      const { accessToken, refreshToken: newRefreshToken } = response.tokens;

      setToken(accessToken);
      setRefreshToken(newRefreshToken);

      sessionStorage.setItem('token', accessToken);
      sessionStorage.setItem('refreshToken', newRefreshToken);

      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      clearUserData();
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        refresh,
        isAuthenticated: !!token
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);