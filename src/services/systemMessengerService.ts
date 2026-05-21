import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../stores/authStore';
import { onesignalService } from './onesignalService';

// Define the shape of a system message based on your new table
export interface SystemMessage {
  id?: string;
  title: string;
  message: string;
  type: string;
  target: string;
  photo_url?: string;
  welcome_message_mode?: boolean;
  created_at?: string;
  isRead?: boolean;
}

export const systemMessengerService = {
  /**
   * Sends a new system message.
   * This function inserts a single record into the `system_messages` table.
   * It does not interact with any other tables.
   */
  async sendSystemMessage(message: SystemMessage) {
    let insertData: any = {
      title: message.title,
      message: message.message,
      type: message.type,
      target: message.target,
      photo_url: message.photo_url,
    };

    // Only add welcome_message_mode if it exists in the database
    if (message.welcome_message_mode !== undefined) {
      insertData.welcome_message_mode = message.welcome_message_mode;
    }

    const { data, error } = await supabase
      .from('system_messages')
      .insert([insertData]);

    if (error) {
      console.error('Error sending system message:', error);
      throw error;
    }

    // Create notification rows and send push notifications
    try {
      if (message.target === 'all') {
        const { data: users } = await supabase
          .from('profiles')
          .select('id')
          .eq('is_active', true);

        if (users && users.length > 0) {
          // Create notification rows for all active users
          const notificationRows = users.map(user => ({
            user_id: user.id,
            type: 'system-message',
            title: message.title,
            message: message.message,
            photo_url: message.photo_url,
            is_read: false,
          }));

          await supabase.from('notifications').insert(notificationRows);

          // Send push notifications to all active users
          const pushPromises = users.map(user =>
            onesignalService.sendPushNotification({
              userId: user.id,
              title: message.title,
              message: message.message,
              type: 'message',
              additionalData: {
                notificationType: 'system-message',
                systemMessageType: message.type,
                photoUrl: message.photo_url,
              },
            }).catch(error => {
              console.error(`Failed to send push notification to user ${user.id}:`, error);
            })
          );

          await Promise.allSettled(pushPromises);
        }
      } else {
        // Create notification row for specific user
        await supabase.from('notifications').insert({
          user_id: message.target,
          type: 'system-message',
          title: message.title,
          message: message.message,
          photo_url: message.photo_url,
          is_read: false,
        });

        // Send push to specific user
        await onesignalService.sendPushNotification({
          userId: message.target,
          title: message.title,
          message: message.message,
          type: 'message',
          additionalData: {
            notificationType: 'system-message',
            systemMessageType: message.type,
            photoUrl: message.photo_url,
          },
        });
      }
    } catch (pushError) {
      console.error('Failed to send system message notifications:', pushError);
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
      .select('*, system_message_read_status(user_id, dismissed)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching system messages:', error);
      throw error;
    }

    return data
      ?.filter(msg => !msg.system_message_read_status.some(s => s.user_id === userId && s.dismissed))
      .map(msg => ({ ...msg, isRead: msg.system_message_read_status.some(s => s.user_id === userId) })) || [];
  },

  async markAsRead(messageId: string) {
    const userId = useAuthStore.getState().user?.id;

    if (!userId) return;

    // Use upsert with onConflict, fallback to insert if constraint doesn't exist
    const { error } = await supabase
      .from('system_message_read_status')
      .upsert([{ message_id: messageId, user_id: userId }], { onConflict: 'message_id,user_id', ignoreDuplicates: true });

    if (error) {
      // If upsert fails (constraint missing), try plain insert and ignore duplicate error
      const { error: insertError } = await supabase
        .from('system_message_read_status')
        .insert([{ message_id: messageId, user_id: userId }]);
      if (insertError && !insertError.message?.includes('duplicate')) {
        console.error('Error marking system message as read:', insertError);
      }
    }
  },

  /**
   * Retrieves all welcome messages (messages in welcome message mode)
   */
  async getWelcomeMessages() {
    try {
      const { data, error } = await supabase
        .from('system_messages')
        .select('*')
        .eq('welcome_message_mode', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching welcome messages:', error);
        // If the column doesn't exist, just return an empty array
        if (error.code === 'PGRST204') {
          return [];
        }
        throw error;
      }

      return data || [];
    } catch (err) {
      console.error('Caught error in getWelcomeMessages:', err);
      return [];
    }
  },

  /**
   * Sends welcome messages to a new user after onboarding completion
   */
  async sendWelcomeMessagesToNewUser(userId: string) {
    try {
      const welcomeMessages = await this.getWelcomeMessages();
      
      if (welcomeMessages.length === 0) {
        console.log('No welcome messages found to send to new user');
        return;
      }

      // Send each welcome message to the new user
      const sendPromises = welcomeMessages.map(async (welcomeMsg) => {
        // Create a personalized copy of the welcome message for this user
        const personalizedMessage = {
          title: welcomeMsg.title,
          message: welcomeMsg.message,
          type: welcomeMsg.type,
          target: userId,
          photo_url: welcomeMsg.photo_url,
          welcome_message_mode: false, // This is the actual delivery, not the template
        };

        return this.sendSystemMessage(personalizedMessage);
      });

      await Promise.all(sendPromises);
      console.log(`Successfully sent ${welcomeMessages.length} welcome messages to new user ${userId}`);
    } catch (error) {
      console.error('Error sending welcome messages to new user:', error);
      throw error;
    }
  },

  /**
   * Deletes all system messages (admin only)
   */
  async deleteAllSystemMessages() {
    const { error } = await supabase
      .from('system_messages')
      .delete()
      .neq('id', 0); // Delete all rows

    if (error) {
      console.error('Error deleting all system messages:', error);
      throw error;
    }
  },

  /**
   * Dismisses all system messages for the current user (non-admin clear all).
   * Uses the system_message_read_status table with dismissed=true.
   */
  async dismissAllForUser() {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    // Fetch all message IDs
    const { data: messages, error: fetchError } = await supabase
      .from('system_messages')
      .select('id');

    if (fetchError) {
      console.error('Error fetching messages for dismiss:', fetchError);
      throw fetchError;
    }

    if (!messages || messages.length === 0) return;

    // Fetch existing read_status rows for this user
    const { data: existing } = await supabase
      .from('system_message_read_status')
      .select('message_id')
      .eq('user_id', userId);

    const existingIds = new Set(existing?.map(r => r.message_id) || []);

    // Insert new rows for messages without existing status
    const newRows = messages
      .filter(m => !existingIds.has(m.id))
      .map(m => ({ message_id: m.id, user_id: userId, dismissed: true }));

    if (newRows.length > 0) {
      const { error } = await supabase
        .from('system_message_read_status')
        .insert(newRows);
      if (error) {
        console.error('Error inserting dismissed rows:', error);
        throw error;
      }
    }

    // Update existing rows to set dismissed=true
    const existingMsgIds = messages
      .filter(m => existingIds.has(m.id))
      .map(m => m.id);

    if (existingMsgIds.length > 0) {
      const { error } = await supabase
        .from('system_message_read_status')
        .update({ dismissed: true })
        .eq('user_id', userId)
        .in('message_id', existingMsgIds);
      if (error) {
        console.error('Error updating dismissed rows:', error);
        throw error;
      }
    }
  },
};
