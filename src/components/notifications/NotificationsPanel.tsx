import React, { useEffect } from 'react';
import { useNotificationStore } from '../../stores/notificationStore';
import NotificationItem from './NotificationItem';

interface NotificationsPanelProps {
  onClose: () => void;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ onClose }) => {
  const { notifications, fetchNotifications, unreadCount } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="absolute top-16 right-4 w-80 bg-white rounded-lg shadow-lg z-50">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold">Notifications</h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">No new notifications</p>
        ) : (
          notifications.map(notification => (
            <NotificationItem key={notification.id} notification={notification} />
          ))
        )}
      </div>
    </div>
  );
};
