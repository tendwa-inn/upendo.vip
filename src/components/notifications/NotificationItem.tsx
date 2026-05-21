import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Notification, NotificationType } from '../../types';
import { useNotificationStore } from '../../stores/notificationStore';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import UpgradeModal from '../modals/UpgradeModal';

import { supabase } from '../../lib/supabaseClient';
import { useModalStore } from '../../stores/modalStore';
import StrikeInfoModal from '../modals/StrikeInfoModal';

const FALLBACK_ICON_URL = '/icons/pink_ghost_icon.png';

const formatTimestamp = (timestamp: string | Date, t: (key: string) => string): string => {
  if (!timestamp || isNaN(new Date(timestamp).getTime())) return '';

  const date = new Date(timestamp);
  if (isToday(date)) {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (isYesterday(date)) {
    return t('notifications.yesterday');
  }
  return formatDistanceToNow(date, { addSuffix: true });
};

interface NotificationItemProps {
  notification: Notification;
  onClick?: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClick }) => {
  if (!notification || !notification.message) {
    return null;
  }
  const { t } = useTranslation();
  const { user: currentUser, profile } = useAuthStore();

  const { markAsRead } = useNotificationStore();
  const navigate = useNavigate();
  const { isStrikeInfoModalOpen, closeStrikeInfoModal, openStrikeInfoModal, isPromoDetailsModalOpen, closePromoDetailsModal, openPromoDetailsModal } = useModalStore();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);


  const handleNotificationClick = () => {
    if (!notification.isRead) {
      markAsRead(notification.id as any);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'profile-view':
      case 'new-like':
        if (notification.relatedUser?.id) {
          // Check if user is premium
          const isPremium = profile?.account_type === 'pro' || profile?.account_type === 'vip';
          if (isPremium) {
            navigate(`/user/${notification.relatedUser.id}`);
          } else {
            // Show upgrade modal for free users
            setShowUpgradeModal(true);
          }
        }
        break;
      case 'new-message':
        if (notification.relatedUser?.id) {
          navigate(`/chat/${notification.relatedUser.id}`);
        }
        break;
      case 'message-request':
        // Navigate to chat page where message requests are shown
        navigate('/chat');
        break;
      // For system messages or promos, you might want to navigate to a specific screen
      // or do nothing. For now, we do nothing.
      case 'system-message':
      case 'promo-redemption':
      default:
        break;
    }

    onClick?.();
  };

  // Correctly check for premium status using account_type
  const isPremium = profile?.account_type === 'pro' || profile?.account_type === 'vip';



  // Extract sender name from notification message (first word before known patterns)
  const extractName = (msg: string): string => {
    if (!msg) return '';
    // Match "Name viewed/liked/..." patterns
    const match = msg.match(/^([A-Za-zÀ-ÿ\u0600-\u06FF\u4e00-\u9fff]+)\s+(viewed|liked|sent|wants|has)/i);
    return match?.[1] || '';
  };

  const renderContent = () => {
    switch (notification.type) {
      case 'profile-view': {
        const senderName = extractName(notification.message);
        if (isPremium) {
          return <p><span className="font-bold">{senderName}</span> {t('notifications.viewedProfile', { name: '' }).replace(/^\.?\s*/, '')}</p>;
        } else {
          return <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowUpgradeModal(true); }} className="text-pink-400 hover:underline">{t('notifications.someoneViewed')}</button>;
        }
      }
      case 'new-like': {
        const senderName = extractName(notification.message);
        if (isPremium) {
          return <p><span className="font-bold">{senderName}</span> {t('notifications.likedProfile', { name: '' }).replace(/^\.?\s*/, '')}</p>;
        } else {
          return <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowUpgradeModal(true); }} className="text-pink-400 hover:underline">{t('notifications.someoneLiked')}</button>;
        }
      }
      case 'message-request':
        return (
          <div>
            <p>{t('notifications.connectionRequest')}</p>
            <span className="text-sm text-pink-400 hover:underline">{t('notifications.clickToView')}</span>
          </div>
        );
      case 'system-message':
        if (notification.message?.includes('strike') || notification.message?.includes('inappropriate language')) {
          return (
            <div>
              <p>{t('notifications.strikeWarning')}</p>
              <button onClick={(e) => { e.stopPropagation(); openStrikeInfoModal(); }} className="text-sm text-yellow-400 hover:underline mt-2">{t('notifications.clickToViewDetails')}</button>
            </div>
          );
        }
        return (
          <div>
            <p className="font-semibold">{t('notifications.systemMessage')}</p>
            <p className="text-white/60 text-xs">{notification.message?.replace(/<[^>]*>/g, '').substring(0, 75)}{notification.message && notification.message.length > 75 ? '...' : ''}</p>
          </div>
        );
      case 'promo-redemption':
        return (
          <div>
            <p>{t('notifications.promoRedeemed')}</p>
          </div>
        );
      case 'account-issue':
        return (
          <div>
            <p>{t('notifications.accountNotification')}</p>
            <button onClick={(e) => { e.stopPropagation(); openStrikeInfoModal(); }} className="text-sm text-yellow-400 hover:underline mt-2">{t('notifications.clickToViewDetails')}</button>
          </div>
        );
      case 'new-message':
        return <p>{t('notifications.newMessage')}</p>;
      default:
        return notification.message || t('notifications.newNotification');
    }
  };

  const link = notification.type === 'profile-view' || notification.type === 'new-like' ? `/user/${notification.relatedUser?.id || ''}` : '#';

  const isUserEvent = notification.type === 'profile-view' || notification.type === 'new-like' || notification.type === 'new-message';
  const userPhoto = notification.relatedUser?.photos?.[0];
  const systemPhotoUrl = notification.photo_url;

  let imageSrc = FALLBACK_ICON_URL;
  if (isUserEvent && userPhoto) {
    if (userPhoto.startsWith('http')) {
      imageSrc = userPhoto;
    } else {
      const { data } = supabase.storage.from('avatars').getPublicUrl(userPhoto);
      imageSrc = data.publicUrl;
    }
  } else if (notification.type === 'system-message' && systemPhotoUrl) {
    if (systemPhotoUrl.startsWith('http')) {
      imageSrc = systemPhotoUrl;
    } else {
      const { data } = supabase.storage.from('avatars').getPublicUrl(systemPhotoUrl);
      imageSrc = data.publicUrl;
    }
  }

  const imageAlt = isUserEvent && notification.relatedUser?.name ? notification.relatedUser.name : "Upendo";

  return (
    <>
      <div onClick={handleNotificationClick} className={`block p-4 border-b border-white/10 ${!notification.isRead ? 'bg-white/10' : 'bg-transparent'} hover:bg-white/20 transition-colors duration-200 cursor-pointer`}>
        <div className="flex items-center">
          <div className="flex-shrink-0 mr-4">
            <img
              className={`w-10 h-10 rounded-full object-cover ${(!isPremium && (notification.type === 'profile-view' || notification.type === 'new-like')) ? 'filter blur-sm' : ''}`}
              src={imageSrc}
              alt={imageAlt}
              onError={(e) => {
                if (e.currentTarget.dataset.fallbackUsed !== 'true') {
                  e.currentTarget.dataset.fallbackUsed = 'true';
                  e.currentTarget.src = FALLBACK_ICON_URL;
                }
              }}
            />
          </div>
          <div className="flex-1 text-white">
            <div className="text-sm">{renderContent()}</div>
            {notification.type !== 'system-message' && (
              <span className="text-xs text-white/50 mt-1">
                {formatTimestamp(notification.timestamp, t)}
              </span>
            )}
          </div>
        </div>
      </div>
      {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}
      <StrikeInfoModal isOpen={isStrikeInfoModalOpen} onClose={closeStrikeInfoModal} />

    </>
  );
};

export default NotificationItem;
