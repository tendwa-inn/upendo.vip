import { supabase } from '../lib/supabaseClient';

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
    const { data, error } = await supabase
      .from('system_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching system messages:', error);
      throw error;
    }

    return data;
  },
};
