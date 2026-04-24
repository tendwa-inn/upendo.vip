import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import { Notification } from '../types';
import { useAuthStore } from './authStore';

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: number) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  reset: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  fetchNotifications: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      return;
    }

    set({ 
      notifications: data || [], 
      unreadCount: (data || []).filter(n => !n.isRead).length 
    });
  },

  addNotification: (notification) => {
    set(state => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAsRead: async (notificationId) => {
    set(state => ({
      notifications: state.notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
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

  reset: () => {
    set({ notifications: [], unreadCount: 0 });
  },
}));
