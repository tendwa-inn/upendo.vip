import { supabase } from '../lib/supabaseClient';
import { Notification } from '../types';

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

  async createNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert({ ...notification, is_read: false })
      .select('*, actor:profiles!actor_id(*)')
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      throw error;
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
  },
};
