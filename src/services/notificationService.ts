import { supabase } from '../lib/supabaseClient';
import { Notification } from '../types';
import { onesignalService } from './onesignalService';

export const notificationService = {
  async getNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*, actor:profiles!actor_id(*)')
      .or(`user_id.eq.${userId},and(type.eq.system,target.eq.all)`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
    return data;
  },

  async createNotification(notificationData: any): Promise<any> {
    const { data, error } = await supabase
      .from('notifications')
      .insert({ ...notificationData, is_read: false })
      .select('*, actor:profiles!actor_id(*)')
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      throw error;
    }

    // Send push notification based on notification type
    if (notificationData.user_id && notificationData.type) {
      try {
        await this.sendPushNotificationForNotification(notificationData.user_id, notificationData);
      } catch (pushError) {
        console.error('Failed to send push notification:', pushError);
        // Don't throw - notification was created successfully in DB
      }
    }

    return data;
  },

  async markAsRead(notificationId: number): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  async sendSystemMessage(userId: string, title: string, body: string, photoUrl?: string): Promise<void> {
    await this.createNotification({
      user_id: userId,
      type: 'system',
      message: body,
      content: { title, body },
      photo_url: photoUrl,
    });

    // Also send push notification for system messages
    try {
      await onesignalService.sendPushNotification({
        userId,
        title,
        message: body,
        type: 'message',
        additionalData: {
          notificationType: 'system-message',
          photoUrl,
        },
      });
    } catch (pushError) {
      console.error('Failed to send system message push notification:', pushError);
    }
  },

  async sendPushNotificationForNotification(userId: string, notification: any): Promise<void> {
    if (!notification.type || !notification.message) return;

    try {
      // Get actor information if available
      let actorName = 'Someone';
      if (notification.actor_id) {
        const { data: actorProfile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', notification.actor_id)
          .single();
        
        if (actorProfile?.name) {
          actorName = actorProfile.name;
        }
      }

      // Map notification types to push notification types and customize messages
      let pushType: 'like' | 'view' | 'match' | 'message' | 'system' | 'account' | 'promo' | 'swipe' | 'report' = 'message';
      let title = notification.title || 'New Notification';
      let message = notification.message;

      switch (notification.type) {
        case 'profile-view':
          pushType = 'view';
          title = 'Someone viewed your profile 👀';
          message = `${actorName} viewed your profile.`;
          break;
        case 'new-like':
          pushType = 'like';
          title = 'Someone liked you! ❤️';
          message = `${actorName} liked your profile.`;
          break;
        case 'new-message':
          pushType = 'message';
          title = `New message from ${actorName} 💬`;
          break;
        case 'message-request':
          pushType = 'message';
          title = 'New message request 📩';
          message = `${actorName} wants to chat with you`;
          break;
        case 'system-message':
          pushType = 'system';
          title = notification.title || 'System Message';
          break;
        case 'system':
          pushType = 'system';
          title = notification.title || 'System Message';
          break;
        case 'account-issue':
          pushType = 'account';
          title = 'Account Update';
          break;
        case 'report-feedback':
          pushType = 'report';
          title = 'Report Status Update';
          break;
        case 'swipe-refresh':
          pushType = 'swipe';
          title = 'Swipes Refreshed!';
          message = 'Your swipes have been refreshed. Keep matching!';
          break;
        case 'promo-redemption':
          pushType = 'promo';
          title = 'Promo Code Redeemed!';
          break;
        default:
          pushType = 'message';
          title = notification.title || 'New Notification';
          message = notification.message;
      }

      await onesignalService.sendPushNotification({
        userId,
        title,
        message,
        type: pushType,
        additionalData: {
          notificationId: notification.id,
          notificationType: notification.type,
          actorId: notification.actor_id,
          target: notification.target,
          photoUrl: notification.photo_url,
        },
      });
    } catch (error) {
      console.error('Error sending push notification for notification:', error);
      throw error;
    }
  },
};
