import React, { useState, useEffect } from 'react';
import { Bell, X, Check, AlertCircle, Info, Gift } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'order_update' | 'payment_success' | 'payment_failed' | 'promotion' | 'system' | 'custom';
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  createdAt: string;
  readAt?: string;
  data?: Record<string, any>;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'order_update':
      return <Info className="w-5 h-5 text-blue-500" />;
    case 'payment_success':
      return <Check className="w-5 h-5 text-green-500" />;
    case 'payment_failed':
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    case 'promotion':
      return <Gift className="w-5 h-5 text-purple-500" />;
    case 'system':
      return <Bell className="w-5 h-5 text-gray-500" />;
    default:
      return <Bell className="w-5 h-5 text-blue-500" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'order_update':
      return 'border-l-blue-500 bg-blue-50';
    case 'payment_success':
      return 'border-l-green-500 bg-green-50';
    case 'payment_failed':
      return 'border-l-red-500 bg-red-50';
    case 'promotion':
      return 'border-l-purple-500 bg-purple-50';
    case 'system':
      return 'border-l-gray-500 bg-gray-50';
    default:
      return 'border-l-blue-500 bg-blue-50';
  }
};

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications/user', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data.notifications);
        setUnreadCount(data.data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === notificationId
              ? { ...notification, readAt: new Date().toISOString() }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-lg flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Bell className="w-5 h-5 text-gray-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">Notifications</h2>
            {unreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-top-transparent"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <Bell className="w-12 h-12 text-gray-300 mb-2" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-l-4 ${getNotificationColor(notification.type)} ${
                    !notification.readAt ? 'border-r-4 border-r-blue-500' : ''
                  }`}
                  onClick={() => !notification.readAt && markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-medium ${
                          !notification.readAt ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>
                      <p className={`mt-1 text-sm ${
                        !notification.readAt ? 'text-gray-800' : 'text-gray-600'
                      }`}>
                        {notification.body}
                      </p>
                      {!notification.readAt && (
                        <div className="mt-2">
                          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Notification Toast Component
interface NotificationToastProps {
  notification: {
    title: string;
    body: string;
    type: string;
  };
  onClose: () => void;
  duration?: number;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose,
  duration = 5000
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className={`fixed top-4 right-4 max-w-sm w-full bg-white rounded-lg shadow-lg border-l-4 ${
      getNotificationColor(notification.type)
    } p-4 z-50 animate-slide-in`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="ml-3 flex-1">
          <h4 className="text-sm font-medium text-gray-900">
            {notification.title}
          </h4>
          <p className="mt-1 text-sm text-gray-600">
            {notification.body}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={onClose}
            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Hook for managing notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const addNotification = (notification: any) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, readAt: new Date().toISOString() }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    clearAll
  };
};