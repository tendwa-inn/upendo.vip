import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../stores/authStore';

// Define the shape of a system message based on your new table
interface SystemMessage {
  title: string;
  message: string;
  type: string;
  target: string;
  photo_url?: string;
}

export const systemMessengerService = {
  /**
   * Sends a new system message.
   * This function inserts a single record into the `system_messages` table.
   * It does not interact with any other tables.
   */
  async sendSystemMessage(message: SystemMessage) {
    const { data, error } = await supabase
      .from('system_messages')
      .insert([{
        title: message.title,
        message: message.message,
        type: message.type,
        target: message.target,
        photo_url: message.photo_url,
      }]);

    if (error) {
      console.error('Error sending system message:', error);
      throw error;
    }

    return data;
  },

  /**
   * Retrieves all system messages, ordered by creation date.
   */
  async getSystemMessages() {
    const userId = useAuthStore.getState().user?.id;

    const { data, error } = await supabase
      .from('system_messages')
      .select('*, system_message_read_status(user_id)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching system messages:', error);
      throw error;
    }

    return data?.map(msg => ({ ...msg, isRead: msg.system_message_read_status.some(status => status.user_id === userId) })) || [];
  },

  async markAsRead(messageId: string) {
    const userId = useAuthStore.getState().user?.id;

    if (!userId) return;

    const { error } = await supabase
      .from('system_message_read_status')
      .insert([{ message_id: messageId, user_id: userId }]);

    if (error) {
      console.error('Error marking system message as read:', error);
    }
  },
};
