// src/context/NotificationContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import adminInstance from '../services/admin/adminAxiosInstance';
import { getSocket, initializeSocket } from '../services/socket/socketClient';
import { BellOutlined } from '@ant-design/icons';
import { message } from 'antd';
import { useAdminAuth } from './AdminAuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  // Sử dụng context để xác định trạng thái đăng nhập
  const { adminUser, adminToken } = useAdminAuth();

  // Hàm fetch notifications (không thay đổi)
  const fetchNotifications = useCallback(async (forceRefresh = false) => {
    // Code không thay đổi
    if (initialized && !forceRefresh) return;
    if (loading) return;
    setLoading(true);

    try {
      // Chỉ gọi API khi là admin
      if (!adminToken) {
        setLoading(false);
        return;
      }

      const response = await adminInstance.get('/notifications');
      const fetchedNotifications = response.data?.notifications ||
        response.data?.data?.notifications ||
        [];

      const normalizedNotifications = fetchedNotifications.map(notification => ({
        ...notification,
        id: notification.id || notification._id,
        read: notification.read || notification.isRead || false
      }));

      const pinnedIds = JSON.parse(localStorage.getItem('pinnedNotifications') || '[]');

      const sortedNotifications = [...normalizedNotifications].sort((a, b) => {
        const aIsPinned = pinnedIds.includes(a.id);
        const bIsPinned = pinnedIds.includes(b.id);
        if (aIsPinned && !bIsPinned) return -1;
        if (!aIsPinned && bIsPinned) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      setNotifications(sortedNotifications);
      setUnreadCount(response.data?.unreadCount ||
        sortedNotifications.filter(n => !n.read).length || 0);
      setInitialized(true);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, initialized, adminToken]);

  const markNotificationAsRead = useCallback(async (notificationId) => {
    if (!notificationId || !adminToken) return;
    try {
      await adminInstance.put(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId)
          ? { ...n, read: true, isRead: true }
          : n)
      );
      setUnreadCount(prev => Math.max(prev - 1, 0));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, [adminToken]);

  const markAllAsRead = useCallback(async () => {
    if (!adminToken) return;
    try {
      await adminInstance.put('/notifications/read-all');
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true, isRead: true }))
      );
      setUnreadCount(0);
      message.success('Đã đánh dấu tất cả thông báo là đã đọc');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      message.error('Không thể đánh dấu tất cả thông báo');
    }
  }, [adminToken]);

  // Sửa đoạn khởi tạo socket: sử dụng admin context thay vì URL
  useEffect(() => {
    // Chỉ khởi tạo socket cho admin
    if (!adminToken) {
      return;
    }

    if (initialized) return;

    // Khởi tạo socket với flag isAdmin=true
    const socket = initializeSocket(adminToken, true);

    if (!socket) {
      console.warn('Socket không khả dụng');
      return;
    }

    const handleConnect = () => {
      console.log('Socket connected:', socket.id);
      setSocketConnected(true);
      socket.emit('joinAdminRoom');
    };

    const handleNewNotification = (notification) => {
      // Phần còn lại không thay đổi
      if (!notification) return;
      const notificationId = notification.id || notification._id;
      if (!notificationId) return;

      setNotifications(prev => {
        if (prev.some(n => n.id === notificationId)) return prev;
        const normalizedNotification = {
          ...notification,
          id: notificationId,
          read: notification.isRead || false,
          createdAt: notification.createdAt || new Date().toISOString()
        };
        const pinnedIds = JSON.parse(localStorage.getItem('pinnedNotifications') || '[]');
        const updatedNotifications = [normalizedNotification, ...prev];
        return updatedNotifications.sort((a, b) => {
          const aIsPinned = pinnedIds.includes(a.id);
          const bIsPinned = pinnedIds.includes(b.id);
          if (aIsPinned && !bIsPinned) return -1;
          if (!aIsPinned && bIsPinned) return 1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
      });
      setUnreadCount(prev => prev + 1);
      message.success({
        content: `Thông báo mới: ${notification.title || 'Thông báo mới'}`,
        icon: <BellOutlined style={{ color: '#1890ff' }} />
      });
    };

    socket.on('connect', handleConnect);
    socket.on('adminNotification', handleNewNotification);
    socket.on('adminNotificationBroadcast', handleNewNotification);
    socket.on('newOrder', (data) => {
      if (!data) return;
      const notification = {
        id: `order_${data.orderId || 'unknown'}_${Date.now()}`,
        title: `Đơn hàng mới #${data.orderNumber || 'New'}`,
        message: `Khách hàng ${data.customerName || 'Anonymous'} đã đặt đơn hàng mới`,
        type: 'new_order',
        link: `/admin/orders/${data.orderId}`,
        read: false,
        createdAt: new Date().toISOString()
      };
      handleNewNotification(notification);
    });

    // Chỉ fetch notifications khi đã đăng nhập admin
    if (adminToken) {
      fetchNotifications();
    }

    return () => {
      if (socket) {
        socket.off('connect', handleConnect);
        socket.off('adminNotification', handleNewNotification);
        socket.off('adminNotificationBroadcast', handleNewNotification);
        socket.off('newOrder');
      }
    };
  }, [fetchNotifications, initialized, adminToken]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      socketConnected,
      fetchNotifications,
      markNotificationAsRead,
      markAllAsRead
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
export default NotificationContext;