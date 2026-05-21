import { supabase } from '../lib/supabaseClient';

interface PushNotificationData {
  userId: string;
  title: string;
  message: string;
  type: 'like' | 'view' | 'match' | 'message' | 'system' | 'account' | 'promo' | 'swipe' | 'report';
  additionalData?: Record<string, any>;
  priority?: number;
}

export const onesignalService = {
  async sendPushNotification(data: PushNotificationData): Promise<void> {
    try {
      const { userId, title, message, type, additionalData, priority } = data;

      if (!userId) {
        console.error('User ID is required for push notification');
        return;
      }

      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          userId,
          title,
          message,
          type,
          additionalData,
          priority,
        },
      });

      if (error) {
        console.error('Failed to send push notification:', error);
      }
    } catch (error) {
      console.error(`Failed to send ${data.type} push notification:`, error);
    }
  },

  async sendLikeNotification(likedUserId: string, likerName: string): Promise<void> {
    const { data: likedUserProfile } = await supabase
      .from('profiles')
      .select('account_type, can_view_profiles_expires_at')
      .eq('id', likedUserId)
      .single();

    const isLikedUserPremium = likedUserProfile?.account_type === 'pro' ||
                               likedUserProfile?.account_type === 'vip' ||
                               (likedUserProfile?.can_view_profiles_expires_at &&
                                new Date(likedUserProfile.can_view_profiles_expires_at) > new Date());

    const title = 'Someone liked you! ❤️';
    const message = isLikedUserPremium
      ? `${likerName} liked your profile.`
      : 'Someone liked your profile. Click to see who!';

    await this.sendPushNotification({
      userId: likedUserId,
      title,
      message,
      type: 'like',
      additionalData: {
        likerName: isLikedUserPremium ? likerName : 'Someone',
        isPremium: isLikedUserPremium,
      },
    });
  },

  async sendViewNotification(viewedUserId: string, viewerName: string): Promise<void> {
    const { data: viewedUserProfile } = await supabase
      .from('profiles')
      .select('account_type, can_view_profiles_expires_at')
      .eq('id', viewedUserId)
      .single();

    const isViewedUserPremium = viewedUserProfile?.account_type === 'pro' ||
                                viewedUserProfile?.account_type === 'vip' ||
                                (viewedUserProfile?.can_view_profiles_expires_at &&
                                 new Date(viewedUserProfile.can_view_profiles_expires_at) > new Date());

    const title = 'Someone viewed your profile 👀';
    const message = isViewedUserPremium
      ? `${viewerName} viewed your profile.`
      : 'Someone viewed your profile. Click to see who!';

    await this.sendPushNotification({
      userId: viewedUserId,
      title,
      message,
      type: 'view',
      additionalData: {
        viewerName: isViewedUserPremium ? viewerName : 'Someone',
        isPremium: isViewedUserPremium,
      },
    });
  },

  async sendMatchNotification(matchedUserId: string, matcherName: string): Promise<void> {
    await this.sendPushNotification({
      userId: matchedUserId,
      title: 'It\'s a match! 🎉',
      message: `You matched with ${matcherName}. Start chatting now!`,
      type: 'match',
      additionalData: {
        matcherName,
        action: 'open_chat',
      },
    });
  },

  async sendMessageNotification(receiverId: string, senderName: string, messageContent: string): Promise<void> {
    await this.sendPushNotification({
      userId: receiverId,
      title: `New message from ${senderName} 💬`,
      message: messageContent,
      type: 'message',
      additionalData: {
        senderName,
        messageContent,
        action: 'open_chat',
      },
    });
  },

  async sendSystemNotification(userId: string, title: string, message: string, systemType?: string): Promise<void> {
    await this.sendPushNotification({
      userId,
      title,
      message,
      type: 'system',
      additionalData: {
        systemMessageType: systemType,
        action: 'open_notifications',
      },
    });
  },

  async sendAccountNotification(userId: string, title: string, message: string, issueType?: string): Promise<void> {
    await this.sendPushNotification({
      userId,
      title,
      message,
      type: 'account',
      additionalData: {
        issueType,
        action: 'open_profile',
      },
    });
  },

  async sendPromoNotification(userId: string, title: string, message: string, promoCode?: string): Promise<void> {
    await this.sendPushNotification({
      userId,
      title,
      message,
      type: 'promo',
      additionalData: {
        promoCode,
        action: 'open_profile',
      },
    });
  },

  async sendSwipeRefreshNotification(userId: string): Promise<void> {
    await this.sendPushNotification({
      userId,
      title: 'Swipes Refreshed! 🔄',
      message: 'Your swipes have been refreshed. Keep matching!',
      type: 'swipe',
      additionalData: {
        action: 'open_swipe',
      },
    });
  },

  async sendReportFeedbackNotification(userId: string, status: string, reportType?: string): Promise<void> {
    await this.sendPushNotification({
      userId,
      title: 'Report Status Update 📋',
      message: `Your report has been ${status.toLowerCase()}.`,
      type: 'report',
      additionalData: {
        reportStatus: status,
        reportType,
        action: 'open_notifications',
      },
    });
  },
};
