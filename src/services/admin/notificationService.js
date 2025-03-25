// Cập nhật AdminNotifications.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  List, Badge, Button, Empty, message, Dropdown, Avatar, Divider, Typography,
  Space, Spin, Tooltip, Tag, Popconfirm
} from 'antd';
import {
  BellOutlined, CheckOutlined, ClockCircleOutlined, ReloadOutlined,
  ExclamationCircleOutlined, ShoppingCartOutlined, SettingOutlined,
  DeleteOutlined, MailOutlined, CreditCardOutlined, PushpinOutlined,
  FilterOutlined, SoundOutlined, ReadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import adminInstance from '../../services/admin/adminAxiosInstance';
import { getSocket } from '../../services/socket/socketClient';
import { debugSocket } from '../../utils/socketDebugger';
import './Notifications.scss';

const { Text, Title } = Typography;

// Configuration for notification icons remains the same...

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [pinned, setPinned] = useState([]);
  const navigate = useNavigate();

  // Fetch notifications with better error handling
  const fetchNotifications = useCallback(async () => {
    if (loading) return; // Prevent multiple concurrent requests

    setLoading(true);
    setLoadFailed(false);

    try {
      // Custom timeout of 5 seconds
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 5000));

      const response = await Promise.race([
        adminInstance.get('/notifications', {
          params: { limit: 5 } // Reduced limit for faster response
        }),
        timeoutPromise
      ]);

      console.log('Notifications loaded successfully');

      // Process notifications
      let fetchedNotifications = [];
      if (response.data && response.data.notifications) {
        fetchedNotifications = response.data.notifications;
      } else if (response.data && response.data.data && response.data.data.notifications) {
        fetchedNotifications = response.data.data.notifications;
      } else if (Array.isArray(response.data)) {
        fetchedNotifications = response.data;
      }

      // Normalize notifications
      const normalizedNotifications = fetchedNotifications.map(notification => ({
        ...notification,
        id: notification.id || notification._id,
        read: notification.read || notification.isRead || false
      }));

      // Get pinned notifications
      const pinnedNotificationIds = JSON.parse(localStorage.getItem('pinnedNotifications') || '[]');
      setPinned(pinnedNotificationIds);

      // Sort notifications
      const sortedNotifications = [...normalizedNotifications].sort((a, b) => {
        const aIsPinned = pinnedNotificationIds.includes(a.id);
        const bIsPinned = pinnedNotificationIds.includes(b.id);
        if (aIsPinned && !bIsPinned) return -1;
        if (!aIsPinned && bIsPinned) return 1;
        return new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now());
      });

      setNotifications(sortedNotifications);
      setUnreadCount(response.data.unreadCount || sortedNotifications.filter(n => !n.read).length || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setLoadFailed(true);

      // Only show message when dropdown is open (prevent disrupting the UI)
      if (dropdownVisible) {
        if (error.message === 'Timeout') {
          message.info('Tải thông báo quá lâu. Bạn có thể thử lại sau.');
        } else {
          message.error('Không thể tải thông báo.');
        }
      }
    } finally {
      setLoading(false);
    }
  }, [dropdownVisible]);

  // Mark as read, delete, toggle pin functions remain the same...

  // Only fetch notifications when dropdown opens rather than on mount
  useEffect(() => {
    if (dropdownVisible && (notifications.length === 0 || loadFailed)) {
      fetchNotifications();
    }
  }, [dropdownVisible, fetchNotifications, notifications.length, loadFailed]);

  // Socket setup - optimize to only handle new notifications
  useEffect(() => {
    const socket = getSocket();

    if (socket) {
      debugSocket(socket);
      socket.emit('joinAdminRoom');

      // Socket event handlers remain the same...
    }

    // Clean up socket listeners on unmount
  }, []);

  // The notificationList now includes retry button and better loading states
  const notificationList = (
    <div className="notification-panel">
      <div className="notification-header">
        <Title level={5} style={{ margin: 0 }}>Thông báo</Title>
        <Space>
          <Tooltip title="Làm mới">
            <Button
              type="text"
              size="small"
              icon={<ReloadOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                fetchNotifications();
              }}
              loading={loading}
            />
          </Tooltip>

          {unreadCount > 0 && (
            <Button
              type="text"
              size="small"
              onClick={markAllAsRead}
              icon={<ReadOutlined />}
            >
              Đánh dấu đã đọc
            </Button>
          )}
        </Space>
      </div>

      <Divider style={{ margin: '0 0 8px 0' }} />

      {loading ? (
        <div className="notification-loading" style={{ padding: '20px', textAlign: 'center' }}>
          <Spin size="small" />
          <p style={{ marginTop: 8 }}>Đang tải thông báo...</p>
        </div>
      ) : loadFailed ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <ExclamationCircleOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />
          <p style={{ marginTop: 8 }}>Không thể tải thông báo</p>
          <Button
            type="primary"
            size="small"
            onClick={fetchNotifications}
            style={{ marginTop: 8 }}
          >
            Thử lại
          </Button>
        </div>
      ) : !Array.isArray(notifications) || notifications.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Không có thông báo"
          style={{ padding: '20px 0' }}
        />
      ) : (
        <div className="notification-list-container">
          <List
            dataSource={notifications}
            renderItem={(item) => {
              // List item rendering remains the same...
            }}
          />
        </div>
      )}

      <Divider style={{ margin: '8px 0 0 0' }} />

      <div className="notification-footer">
        <Space>
          <Button type="link" onClick={() => {
            navigate('/admin/notifications');
            setDropdownVisible(false);
          }}>
            Xem tất cả thông báo
          </Button>

          <Button
            type="link"
            onClick={(e) => {
              e.stopPropagation();
              // Gửi test notification
              adminInstance.post('/notifications/test', {
                message: 'Đây là thông báo test',
                type: 'system',
                title: 'Thông báo test'
              }).catch(err => console.error('Failed to send test notification:', err));
            }}
          >
            Test thông báo
          </Button>
        </Space>
      </div>
    </div>
  );

  return (
    <Dropdown
      dropdownRender={() => notificationList}
      trigger={['click']}
      placement="bottomRight"
      open={dropdownVisible}
      onOpenChange={(visible) => setDropdownVisible(visible)}
    >
      <div className="notification-bell-container">
        <Badge
          count={unreadCount}
          overflowCount={99}
          offset={[-2, 2]}
        >
          <Button
            type="text"
            icon={<BellOutlined />}
            size="large"
            className={`notification-bell-button ${unreadCount > 0 ? 'has-unread' : ''}`}
          />
        </Badge>
      </div>
    </Dropdown>
  );
};

export default AdminNotifications;