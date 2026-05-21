import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import { Notification } from '../types';
import { useAuthStore } from './authStore';
import { RealtimeChannel } from '@supabase/supabase-js';

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  channel: RealtimeChannel | null;
  pollingInterval: ReturnType<typeof setInterval> | null;
  fetchNotifications: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: number) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  subscribeToNotifications: () => void;
  unsubscribeFromNotifications: () => void;
  reset: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  channel: null,
  pollingInterval: null,

  fetchNotifications: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*, notification_read_status(user_id)')
      .eq('user_id', user.id)
      .not('type', 'in', '("new_like", "profile-view")') // Exclude likes and views
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      return;
    }

    const notificationsWithReadStatus = data?.map(n => ({ ...n, isRead: n.notification_read_status.length > 0 })) || [];

    set({ 
      notifications: notificationsWithReadStatus,
      unreadCount: notificationsWithReadStatus.filter(n => !n.isRead).length 
    });
  },

  addNotification: (notification) => {
    // Do not add likes or views to the main notification list
    if (notification.type === 'new-like' || notification.type === 'profile-view') {
      return;
    }
    set(state => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAsRead: async (notificationId) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    set(state => ({
      notifications: state.notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));

    // Insert read status, ignore if already exists (409 duplicate)
    await supabase
      .from('notification_read_status')
      .insert([{ notification_id: notificationId as any, user_id: user.id }])
      .then();
  },

  clearAllNotifications: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    // Immediately clear the state locally
    set({ notifications: [], unreadCount: 0 });

    // Then, delete the records from the database in the background
    const { error } = await supabase.rpc('delete_all_user_notifications');

    if (error) {
      console.error('Error clearing notifications from DB:', error);
      // Optional: Re-fetch to revert local state if DB deletion fails
      get().fetchNotifications();
    }
  },

  subscribeToNotifications: () => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    // If already subscribed, don't re-subscribe
    const { channel: existingChannel, pollingInterval: existingPolling } = get();
    if (existingChannel || existingPolling) return;

    // Remove any stale channels
    const channels = supabase.getChannels();
    channels.forEach(ch => {
      if (ch.topic.startsWith('notifications:')) {
        supabase.removeChannel(ch);
      }
    });

    // Start polling fallback (Supabase realtime is unreliable — known CHANNEL_ERROR)
    const pollInterval = setInterval(async () => {
      const currentUser = useAuthStore.getState().user;
      if (!currentUser) return;

      const prevIds = new Set(get().notifications.map(n => n.id));

      const { data, error } = await supabase
        .from('notifications')
        .select('*, notification_read_status(user_id)')
        .eq('user_id', currentUser.id)
        .not('type', 'in', '("new_like", "profile-view")')
        .order('created_at', { ascending: false });

      if (error || !data) return;

      const notificationsWithReadStatus = data.map(n => ({
        ...n,
        isRead: n.notification_read_status.length > 0,
      }));

      // Check for new notifications we haven't seen yet
      const newNotifications = notificationsWithReadStatus.filter(n => !prevIds.has(n.id));

      if (newNotifications.length > 0) {
        // Send OneSignal push for each new notification
        for (const n of newNotifications) {
          try {
            const { onesignalService } = await import('../services/onesignalService');
            await onesignalService.sendPushNotification({
              userId: currentUser.id,
              title: n.title || 'New Notification',
              message: n.message || 'You have a new notification',
              type: n.type || 'system',
              additionalData: {
                notificationId: n.id,
                action: 'open_notifications',
              },
            });
          } catch (e) {
            console.error('Error sending push notification from poll:', e);
          }
        }
      }

      set({
        notifications: notificationsWithReadStatus,
        unreadCount: notificationsWithReadStatus.filter(n => !n.isRead).length,
      });
    }, 5000);

    set({ pollingInterval: pollInterval });

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          if (payload.new.type === 'new_like' || payload.new.type === 'profile-view') {
            return;
          }

          const { data: completeNotification, error } = await supabase
            .from('notifications')
            .select('*, notification_read_status(user_id), related_user(*)')
            .eq('id', payload.new.id)
            .single();

          if (error) {
            console.error('Error fetching complete notification:', error);
            return;
          }

          if (completeNotification) {
            const notificationWithReadStatus = {
              ...completeNotification,
              isRead: completeNotification.notification_read_status.length > 0,
            };

            get().addNotification(notificationWithReadStatus);

            try {
              const { onesignalService } = await import('../services/onesignalService');
              await onesignalService.sendPushNotification({
                userId: user.id,
                title: completeNotification.title || 'New Notification',
                message: completeNotification.message || 'You have a new notification',
                type: completeNotification.type || 'system',
                additionalData: {
                  notificationId: completeNotification.id,
                  action: 'open_notifications',
                },
              });
            } catch (error) {
              console.error('Error sending push notification:', error);
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notification_read_status',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const notificationId = payload.new.notification_id;
          set(state => ({
            notifications: state.notifications.map(n =>
              n.id === String(notificationId) ? { ...n, isRead: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          }));
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          set({ channel });
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          set({ channel: null });
        }
      });
  },

  unsubscribeFromNotifications: () => {
    const { channel, pollingInterval } = get();
    if (channel) {
      supabase.removeChannel(channel);
    }
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    set({ channel: null, pollingInterval: null });
  },

  reset: () => {
    get().unsubscribeFromNotifications();
    set({ notifications: [], unreadCount: 0, channel: null });
  },
}));