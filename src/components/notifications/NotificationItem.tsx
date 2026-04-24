import React, { useState } from 'react';
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

const formatTimestamp = (timestamp: string | Date): string => {
  if (!timestamp || isNaN(new Date(timestamp).getTime())) return '';

  const date = new Date(timestamp);
  if (isToday(date)) {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (isYesterday(date)) {
    return 'Yesterday';
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
  const { user: currentUser, profile } = useAuthStore();

  const { markAsRead } = useNotificationStore();
  const navigate = useNavigate();
  const { isStrikeInfoModalOpen, closeStrikeInfoModal, openStrikeInfoModal } = useModalStore();
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
          const isPremium = profile?.account_type === 'pro' || profile?.accountType === 'vip';
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
      // For system messages or promos, you might want to navigate to a specific screen
      // or do nothing. For now, we do nothing.
      case 'system-message':
      case 'system':
      case 'promo-redemption':
      default:
        break;
    }

    onClick?.();
  };

  // Correctly check for premium status using account_type
  const isPremium = profile?.accountType === 'pro' || profile?.accountType === 'vip';

  const renderContent = () => {
    // Use the new isPremium flag
    switch (notification.type) {
      case 'profile-view':
        if (isPremium) {
          return <p><span className="font-bold">{notification.message.split(' ')[0]}</span> viewed your profile.</p>;
        } else {
          return <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowUpgradeModal(true); }} className="text-pink-400 hover:underline">Someone viewed your profile. Upgrade to see who!</button>;
        }
      case 'new-like':
        if (isPremium) {
          return <p><span className="font-bold">{notification.message.split(' ')[0]}</span> liked your profile!</p>;
        } else {
          return <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowUpgradeModal(true); }} className="text-pink-400 hover:underline">Someone liked you! Upgrade to see who!</button>;
        }
      case 'message-request':
        return (
          <div className="flex items-center justify-between gap-2">
            <span>{notification.message || 'Someone wants to chat with you'}</span>
            <div className="flex gap-2">
              <button
                onClick={async (e) => {
                  e.preventDefault(); e.stopPropagation();
                  try {
                    const senderId = (notification as any).actor?.id;
                    const currentUser = useAuthStore.getState().user;
                    if (senderId && currentUser) {
                      await supabase.from('message_requests').update({ status: 'accepted' }).match({ sender_id: senderId, receiver_id: currentUser.id });
                      useMatchStore.getState().createMatch(senderId);
                      // Mark notification as read/handled
                      await supabase.from('notifications').delete().eq('id', notification.id);
                    }
                  } catch (_) {}
                }}
                className="px-2 py-1 rounded bg-green-600 text-white text-xs"
                title="Accept and start chat"
              >
                Accept
              </button>
              <button
                onClick={async (e) => {
                  e.preventDefault(); e.stopPropagation();
                  try {
                    const senderId = (notification as any).actor?.id;
                    const currentUser = useAuthStore.getState().user;
                    if (senderId && currentUser) {
                      await supabase.from('message_requests').update({ status: 'declined' }).match({ sender_id: senderId, receiver_id: currentUser.id });
                      await supabase.from('notifications').delete().eq('id', notification.id);
                    }
                  } catch (_) {}
                }}
                className="px-2 py-1 rounded bg-red-600 text-white text-xs"
                title="Decline request"
              >
                Decline
              </button>
            </div>
          </div>
        );
      case 'system-message':
      case 'system':
        return notification.message;
      case 'promo-redemption':
        case 'account-issue':
        return (
          <div>
            <p>{notification.message}</p>
            <button onClick={(e) => { e.stopPropagation(); openStrikeInfoModal(); }} className="text-sm text-yellow-400 hover:underline mt-2">
              Click to view details
            </button>
          </div>
        );
      default:
        return notification.message || 'New notification';
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
  } else if ((notification.type === 'system-message' || notification.type === 'system') && systemPhotoUrl) {
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
            <span className="text-xs text-white/50 mt-1">
              {formatTimestamp(notification.timestamp)}
            </span>
          </div>
        </div>
      </div>
      {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}
      <StrikeInfoModal isOpen={isStrikeInfoModalOpen} onClose={closeStrikeInfoModal} />
    </>
  );
};

export default NotificationItem;
