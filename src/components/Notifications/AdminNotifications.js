// src/components/Notifications/AdminNotifications.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  List, Badge, Button, Empty, message, Dropdown, Avatar, Divider, Typography,
  Space, Spin, Tooltip, Tag, Popconfirm
} from 'antd';
import {
  BellOutlined, CheckOutlined, ClockCircleOutlined,
  ExclamationCircleOutlined, ShoppingCartOutlined, SettingOutlined,
  DeleteOutlined, MailOutlined, CreditCardOutlined, PushpinOutlined,
  FilterOutlined, SoundOutlined, ReadOutlined, ReloadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import adminInstance from '../../services/admin/adminAxiosInstance';
import { getSocket, initializeSocket } from '../../services/socket/socketClient';
import './Notifications.scss';

const { Text, Title } = Typography;

// Notification icon configuration
// Update the NOTIFICATION_ICON_CONFIG to include all possible types and a default
const NOTIFICATION_ICON_CONFIG = {
  new_order: {
    icon: <ShoppingCartOutlined />,
    color: '#52c41a',
    tagColor: 'success',
    tagText: 'Đơn hàng mới'
  },
  order_update: {
    icon: <SoundOutlined />,
    color: '#1890ff',
    tagColor: 'processing',
    tagText: 'Cập nhật đơn'
  },
  order_cancelled: {
    icon: <ExclamationCircleOutlined />,
    color: '#ff4d4f',
    tagColor: 'error',
    tagText: 'Đơn hủy'
  },
  order_deleted: {
    icon: <DeleteOutlined />,
    color: '#ff7a45',
    tagColor: 'error',
    tagText: 'Đơn xóa'
  },
  payment_confirmation: {
    icon: <CreditCardOutlined />,
    color: '#722ed1',
    tagColor: 'purple',
    tagText: 'Thanh toán'
  },
  payment_verification: {
    icon: <CheckOutlined />,
    color: '#13c2c2',
    tagColor: 'cyan',
    tagText: 'Xác minh'
  },
  system: {
    icon: <SettingOutlined />,
    color: '#faad14',
    tagColor: 'warning',
    tagText: 'Hệ thống'
  },
  promo: {
    icon: <MailOutlined />,
    color: '#13c2c2',
    tagColor: 'cyan',
    tagText: 'Khuyến mãi'
  },
  // Default case
  default: {
    icon: <BellOutlined />,
    color: '#1890ff',
    tagColor: 'default',
    tagText: 'Thông báo'
  }
};

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [pinned, setPinned] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [roomJoined, setRoomJoined] = useState(false);
  const navigate = useNavigate();

  // Fetch notifications function
  const fetchNotifications = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    setLoadFailed(false);

    try {
      const response = await adminInstance.get('/notifications');
      console.log('Notifications response:', response.data);

      const fetchedNotifications = response.data?.notifications ||
        response.data?.data?.notifications ||
        [];

      // Normalize notifications
      const normalizedNotifications = fetchedNotifications.map(notification => ({
        ...notification,
        id: notification.id || notification._id,
        read: notification.read || notification.isRead || false
      }));

      // Get pinned notifications
      const pinnedIds = JSON.parse(localStorage.getItem('pinnedNotifications') || '[]');
      setPinned(pinnedIds);

      // Sort notifications (pinned first, then by date)
      const sortedNotifications = [...normalizedNotifications].sort((a, b) => {
        const aIsPinned = pinnedIds.includes(a.id);
        const bIsPinned = pinnedIds.includes(b.id);
        if (aIsPinned && !bIsPinned) return -1;
        if (!aIsPinned && bIsPinned) return 1;
        return new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now());
      });

      setNotifications(sortedNotifications);
      setUnreadCount(response.data?.unreadCount ||
        sortedNotifications.filter(n => !n.read).length || 0);

    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setLoadFailed(true);

      if (dropdownVisible) {
        message.error('Không thể tải thông báo');
      }
    } finally {
      setLoading(false);
    }
  }, [dropdownVisible]);

  // Mark notification as read
  const markNotificationAsRead = useCallback(async (notificationId) => {
    if (!notificationId) return;

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
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
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
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    if (!notificationId) return;

    try {
      await adminInstance.delete(`/notifications/${notificationId}`);

      // Update state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));

      // Update unread count if needed
      const deletedNotification = notifications.find(n => n.id === notificationId);
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(prev - 1, 0));
      }

      // Remove from pinned if needed
      if (pinned.includes(notificationId)) {
        const newPinned = pinned.filter(id => id !== notificationId);
        setPinned(newPinned);
        localStorage.setItem('pinnedNotifications', JSON.stringify(newPinned));
      }

      message.success('Đã xóa thông báo');
    } catch (error) {
      console.error('Failed to delete notification:', error);
      message.error('Không thể xóa thông báo');
    }
  }, [notifications, pinned]);

  // Toggle pin notification
  const togglePinNotification = useCallback((notificationId) => {
    if (!notificationId) return;

    const currentPinned = [...pinned];
    const isPinned = currentPinned.includes(notificationId);

    let newPinned;
    if (isPinned) {
      newPinned = currentPinned.filter(id => id !== notificationId);
      message.info('Đã bỏ ghim thông báo');
    } else {
      if (currentPinned.length >= 5) {
        message.warning('Chỉ có thể ghim tối đa 5 thông báo');
        return;
      }
      newPinned = [...currentPinned, notificationId];
      message.success('Đã ghim thông báo');
    }

    setPinned(newPinned);
    localStorage.setItem('pinnedNotifications', JSON.stringify(newPinned));

    // Resort notifications
    setNotifications(prev => {
      return [...prev].sort((a, b) => {
        const aIsPinned = newPinned.includes(a.id);
        const bIsPinned = newPinned.includes(b.id);
        if (aIsPinned && !bIsPinned) return -1;
        if (!aIsPinned && bIsPinned) return 1;
        return new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now());
      });
    });
  }, [pinned]);

  // Handle notification click
  const handleNotificationClick = (notif) => {
    if (!notif) return;

    if (!notif.read && !notif.isRead) {
      markNotificationAsRead(notif.id);
    }

    setDropdownVisible(false);

    if (notif.link) {
      navigate(notif.link);
    }
  };

  // Setup socket and event listeners
  useEffect(() => {
    // Fetch initial notifications
    fetchNotifications();

    // Get socket instance
    const adminToken = sessionStorage.getItem('adminToken');
    let socket = getSocket();

    if (!socket && adminToken) {
      console.log('Initializing socket with admin token');
      socket = initializeSocket(adminToken);
    }

    if (!socket) {
      console.warn('Socket not available');
      setLoadFailed(true);
      return;
    }

    // Handle connection status
    const handleConnect = () => {
      console.log('Socket connected:', socket.id);
      setSocketConnected(true);
      socket.emit('joinAdminRoom');
    };

    const handleDisconnect = (reason) => {
      console.log('Socket disconnected:', reason);
      setSocketConnected(false);
      setRoomJoined(false);
    };

    // Handle room joining confirmation
    const handleRoomJoined = (data) => {
      console.log('Joined room:', data.room);
      if (data.room === 'adminRoom') {
        setRoomJoined(true);
      }
    };

    // Handle new notification
    const handleNewNotification = (notification) => {
      console.log('New notification received:', notification);

      if (!notification) return;

      // Get notification ID
      const notificationId = notification.id || notification._id;

      if (!notificationId) {
        console.warn('Invalid notification without ID');
        return;
      }

      // Check if notification already exists
      setNotifications(prev => {
        const exists = prev.some(n => n.id === notificationId);

        if (exists) {
          console.log('Notification already exists, skipping');
          return prev;
        }

        // Normalize notification
        const normalizedNotification = {
          ...notification,
          id: notificationId,
          read: notification.isRead || false,
          createdAt: notification.createdAt || new Date().toISOString()
        };

        // Get pinned notifications
        const pinnedIds = JSON.parse(localStorage.getItem('pinnedNotifications') || '[]');

        // Add new notification and sort
        const updatedNotifications = [normalizedNotification, ...prev];
        return updatedNotifications.sort((a, b) => {
          const aIsPinned = pinnedIds.includes(a.id);
          const bIsPinned = pinnedIds.includes(b.id);
          if (aIsPinned && !bIsPinned) return -1;
          if (!aIsPinned && bIsPinned) return 1;
          return new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now());
        });
      });

      // Update unread count
      setUnreadCount(prev => prev + 1);

      // Show message notification
      message.success({
        content: `Thông báo mới: ${notification.title || 'Thông báo mới'}`,
        icon: <BellOutlined style={{ color: '#1890ff' }} />
      });

      // Play notification sound
      try {
        const audio = new Audio('/notification-sound.mp3');
        audio.play().catch(error => {
          console.warn('Could not play notification sound:', error);
        });
      } catch (error) {
        console.error('Error playing notification sound:', error);
      }
    };

    // Handle new order event
    const handleNewOrder = (data) => {
      console.log('New order received:', data);

      if (!data) return;

      // Create notification from order data
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
    };

    // Setup event listeners
    if (socket.connected) {
      handleConnect();
    }

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('roomJoined', handleRoomJoined);
    socket.on('adminNotification', handleNewNotification);
    socket.on('adminNotificationBroadcast', handleNewNotification);
    socket.on('newOrder', handleNewOrder);
    socket.on('orderStatusUpdate', () => fetchNotifications());

    // Clean up on unmount
    return () => {
      if (socket) {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
        socket.off('roomJoined', handleRoomJoined);
        socket.off('adminNotification', handleNewNotification);
        socket.off('adminNotificationBroadcast', handleNewNotification);
        socket.off('newOrder', handleNewOrder);
        socket.off('orderStatusUpdate');
      }
    };
  }, [fetchNotifications]);

  // Format notification time
  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';

    try {
      const now = new Date();
      const notifTime = new Date(timestamp);
      const diffMs = now - notifTime;
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) return 'Vừa xong';
      if (diffMins < 60) return `${diffMins} phút trước`;

      const diffHrs = Math.floor(diffMins / 60);
      if (diffHrs < 24) return `${diffHrs} giờ trước`;

      const diffDays = Math.floor(diffHrs / 24);
      if (diffDays < 7) return `${diffDays} ngày trước`;

      return notifTime.toLocaleDateString('vi-VN');
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'N/A';
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    // First check if type exists and is in the config
    if (type && NOTIFICATION_ICON_CONFIG[type]) {
      return <Avatar icon={NOTIFICATION_ICON_CONFIG[type].icon}
        style={{ backgroundColor: NOTIFICATION_ICON_CONFIG[type].color }} />;
    }
    // Fallback to default
    return <Avatar icon={NOTIFICATION_ICON_CONFIG.default.icon}
      style={{ backgroundColor: NOTIFICATION_ICON_CONFIG.default.color }} />;
  };


  // Get notification tag based on type and importance
  const getNotificationTag = (type, importance) => {
    // Use default if type doesn't exist in config
    const config = (type && NOTIFICATION_ICON_CONFIG[type])
      ? NOTIFICATION_ICON_CONFIG[type]
      : NOTIFICATION_ICON_CONFIG.default;

    if (importance === 'high' || importance === 'urgent') {
      return (
        <Space>
          <Tag color={config.tagColor}>{config.tagText}</Tag>
          <Tag color="red">{importance === 'urgent' ? 'Khẩn cấp' : 'Quan trọng'}</Tag>
        </Space>
      );
    }

    return <Tag color={config.tagColor}>{config.tagText}</Tag>;
  };

  // Send test notification
  const sendTestNotification = () => {
    adminInstance.post('/notifications/test', {
      title: 'Thông báo test',
      message: 'Đây là thông báo test từ frontend',
      type: 'system'
    })
      .then(response => {
        console.log('Test notification sent:', response.data);
        message.success('Đã gửi thông báo test');
      })
      .catch(error => {
        console.error('Error sending test notification:', error);
        message.error('Không thể gửi thông báo test');
      });
  };

  // Notification list dropdown content
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
            <Tooltip title="Đánh dấu tất cả đã đọc">
              <Button
                type="text"
                size="small"
                onClick={markAllAsRead}
                icon={<ReadOutlined />}
              >
                Đánh dấu đã đọc
              </Button>
            </Tooltip>
          )}

          <Tooltip title="Lọc thông báo">
            <Button
              type="text"
              size="small"
              icon={<FilterOutlined />}
              onClick={() => navigate('/admin/notifications')}
            />
          </Tooltip>
        </Space>
      </div>

      <Divider style={{ margin: '0 0 8px 0' }} />

      {/* Connection status indicator */}
      {!socketConnected && (
        <div style={{ padding: '4px 16px', backgroundColor: '#fffbe6', fontSize: '12px' }}>
          <ExclamationCircleOutlined style={{ marginRight: 4, color: '#faad14' }} />
          Kết nối thông báo đang bị ngắt
        </div>
      )}

      {loading ? (
        <div className="notification-loading">
          <Spin size="small" />
          <p>Đang tải thông báo...</p>
        </div>
      ) : loadFailed ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <ExclamationCircleOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />
          <p style={{ marginTop: 8 }}>Không thể tải thông báo</p>
          <Button type="primary" size="small" onClick={fetchNotifications}>
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
              if (!item) return null;

              const notificationId = item.id;

              if (!notificationId) return null;

              return (
                <List.Item
                  className={`notification-item ${!item.read ? 'unread' : ''} ${pinned.includes(notificationId) ? 'pinned' : ''}`}
                  actions={[
                    <Tooltip title={pinned.includes(notificationId) ? "Bỏ ghim" : "Ghim thông báo"}>
                      <Button
                        type="text"
                        size="small"
                        icon={<PushpinOutlined className={pinned.includes(notificationId) ? 'pinned-icon' : ''} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePinNotification(notificationId);
                        }}
                      />
                    </Tooltip>,
                    <Popconfirm
                      title="Bạn có chắc chắn muốn xóa thông báo này?"
                      onConfirm={(e) => {
                        e.stopPropagation();
                        deleteNotification(notificationId);
                      }}
                      okText="Xóa"
                      cancelText="Hủy"
                      placement="left"
                    >
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Popconfirm>
                  ]}
                  onClick={() => handleNotificationClick(item)}
                >
                  <List.Item.Meta
                    avatar={getNotificationIcon(item.type)}
                    title={
                      <div className="notification-title">
                        <Space>
                          <Text strong className="ellipsis-text">{item.title || 'Không có tiêu đề'}</Text>
                          {!item.read && <Badge status="processing" />}
                        </Space>
                        <div className="notification-tag">
                          {getNotificationTag(item.type, item.importance)}
                        </div>
                      </div>
                    }
                    description={
                      <div>
                        <Text className="notification-message">{item.message || 'Không có nội dung'}</Text>
                        <div className="notification-time">
                          <ClockCircleOutlined style={{ marginRight: 4, fontSize: 12 }} />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {formatTime(item.createdAt)}
                          </Text>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              );
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

          <Button type="link" onClick={sendTestNotification}>
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
      arrow={{ pointAtCenter: true }}
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