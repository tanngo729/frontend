// src/services/client/clientAxiosInstance.js
import axios from 'axios';
import API_URL from '../../config/api';

const clientInstance = axios.create({
  baseURL: API_URL.base, // Sử dụng URL gốc không thêm prefix
  timeout: 15000, // Tăng thời gian timeout
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

clientInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

clientInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timed out');
    } else if (!error.response) {
      // Không thể kết nối tới server
      console.error('Network Error: Cannot connect to the server');
    } else if (error.response.status === 429) {
      // Xử lý lỗi 429 - Too Many Requests
      console.error('Rate limit exceeded');
    } else if (error.response.status === 401) {
      // Xử lý lỗi 401 - Unauthorized
      console.error('Unauthorized access');
      // Có thể redirect đến trang đăng nhập nếu cần
      // window.location.href = '/auth/login';
    }

    return Promise.reject(error);
  }
);

export default clientInstance;