import { create } from 'zustand';
import { notificationService } from '../services/notificationService';
import { Notification } from '../types';
import { useAuthStore } from './authStore';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  addNotification: (notification: Notification) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  fetchNotifications: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const notifications = await notificationService.getNotifications(user.id);
    set({ notifications, unreadCount: notifications.filter(n => !n.isRead).length });
  },

  markAsRead: async (notificationId: string | number) => {
    await notificationService.markAsRead(Number(notificationId));
    set(state => {
      const isAlreadyRead = state.notifications.find(
        n => n.id.toString() === notificationId.toString()
      )?.isRead;

      return {
        notifications: state.notifications.map(n =>
          n.id.toString() === notificationId.toString() ? { ...n, isRead: true } : n
        ),
        // Only decrement if it wasn't already marked as read
        unreadCount: !isAlreadyRead ? Math.max(0, state.unreadCount - 1) : state.unreadCount
      };
    });
  },

  addNotification: (notification) => {
    set(state => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  clearAllNotifications: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    // Delete all notifications visible to the user (personal + system)
    // This will respect the RLS policy that allows deletion of:
    // 1. Notifications where user_id = auth.uid() (personal notifications)
    // 2. Notifications where user_id IS NULL (system notifications)
    // We use a WHERE clause that includes both cases
    const { error } = await supabase
      .from('notifications')
      .delete()
      .or(`user_id.eq.${user.id},user_id.is.null`);

    if (error) {
      console.error("Error clearing notifications:", error);
      toast.error("Could not clear notifications. Please check your connection or permissions.");
    } else {
      set({ notifications: [], unreadCount: 0 });
    }
  },
}));

// Real-time listener for new notifications
const user = useAuthStore.getState().user;
if (user) {
  supabase
    .channel(`notifications:${user.id}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, (payload) => {
      useNotificationStore.getState().addNotification(payload.new as Notification);
    })
    .subscribe();
}
