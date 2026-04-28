import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotificationStore } from '../stores/notificationStore';
import NotificationItem from '../components/notifications/NotificationItem';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, fetchNotifications, clearAllNotifications } = useNotificationStore();
  const { t } = useTranslation();
  const acct = (useAuthStore.getState().profile as any)?.account_type || (useAuthStore.getState().profile as any)?.subscription;
  const isVip = acct === 'vip';
  const isPro = acct === 'pro';

  useEffect(() => {
    // The fetchNotifications is now called from the authStore
  }, []);

  return (
    <div className={`text-white min-h-screen flex flex-col ${isVip ? 'bg-gradient-to-b from-black to-[#0b0b0b]' : isPro ? 'bg-gradient-to-b from-[#071521] to-[#0b2237]' : 'bg-stone-900'}`}>
      {/* Header */}
      <div className={`p-4 pt-safe-top border-b border-white/10 flex items-center justify-between flex-shrink-0 ${isVip ? 'bg-black' : isPro ? 'bg-[#071521]' : ''}`}>
        <Link to="/discover" className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl font-bold">{t('notifications')}</h1>
        <button
          onClick={clearAllNotifications}
          className={`text-sm hover:underline ${isVip ? 'text-amber-400' : isPro ? 'text-[#ff7f50]' : 'text-pink-500'}`}
        >{t('clearAll')}</button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        {notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map(notification => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-center text-gray-400">{t('noNotificationsYet', 'No Notifications Yet')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
