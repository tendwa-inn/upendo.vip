import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotificationStore } from '../stores/notificationStore';
import NotificationItem from '../components/notifications/NotificationItem';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import PullToRefreshIndicator from '../components/PullToRefreshIndicator';
import { useCurrentTheme } from '../stores/colorThemeStore';

const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, fetchNotifications, clearAllNotifications, subscribeToNotifications, unsubscribeFromNotifications } = useNotificationStore();
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const acct = (profile as any)?.account_type || (profile as any)?.subscription;
  const theme = useCurrentTheme(acct || 'free');

  // Pull-to-refresh functionality
  const handleRefresh = async () => {
    try {
      await fetchNotifications();
    } catch (error) {
      console.error('Refresh failed:', error);
    }
  };

  const { pullState, getPullStyles, containerRef } = usePullToRefresh({
    onRefresh: handleRefresh,
  });

  useEffect(() => {
    // Fetch notifications on mount (subscription is managed by authStore)
    fetchNotifications();
    // Ensure subscription is active
    subscribeToNotifications();
  }, []);

  return (
    <div className={`text-white min-h-screen flex flex-col ${theme.background}`}>
      {/* Pull to Refresh Indicator */}
      <PullToRefreshIndicator 
        pullDistance={pullState.pullDistance}
        isRefreshing={pullState.isRefreshing}
        threshold={80}
      />
      
      {/* Header */}
      <div className={`p-4 pt-safe-top border-b border-white/10 flex items-center justify-between flex-shrink-0 ${theme.stickyHeader}`}>
        <button onClick={() => navigate(-1)} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold">{t('notifications')}</h1>
        <button
          onClick={clearAllNotifications}
          className={`text-sm hover:underline ${theme.primary}`}
        >{t('clearAll')}</button>
      </div>

      {/* Content */}
      <div ref={containerRef} className="flex-1 overflow-y-auto pb-24 pull-refresh-container" style={getPullStyles()}>
        {notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map(notification => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-center text-gray-400">{t('notifications.noNotifications')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
