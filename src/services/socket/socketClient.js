// src/services/socket/socketClient.js
import { io } from 'socket.io-client';
import API_URL from '../../config/api';

let socket = null;

export const initializeSocket = (token, isAdmin = false) => {
  if (socket) {
    socket.disconnect();
  }

  socket = io(API_URL.base, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 3000
  });

  socket.on('connect', () => {
    console.log('Socket đã kết nối với ID:', socket.id);
    window.socket = socket;

    // Chỉ tham gia phòng admin nếu isAdmin=true
    if (isAdmin) {
      socket.emit('joinAdminRoom');
    }
  });

  socket.on('connect_error', (error) => {
    console.error('Lỗi kết nối socket:', error);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket ngắt kết nối. Lý do:', reason);
  });

  socket.on('reconnect', (attempt) => {
    console.log('Socket kết nối lại sau', attempt, 'lần thử');
  });

  window.socket = socket;
  return socket;
};

export const getSocket = () => {
  if (!socket || !socket.connected) {
    // Kiểm tra token admin trước, rồi mới đến token người dùng thông thường
    const adminToken = sessionStorage.getItem('adminToken');
    const userToken = sessionStorage.getItem('token');

    if (adminToken) {
      return initializeSocket(adminToken, true); // Gửi isAdmin=true
    } else if (userToken) {
      return initializeSocket(userToken, false); // Gửi isAdmin=false
    }
  }
  return socket;
};

export const closeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    window.socket = null;
  }
};

export default {
  initializeSocket,
  getSocket,
  closeSocket
};